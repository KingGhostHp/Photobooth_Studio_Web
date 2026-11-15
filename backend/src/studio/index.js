const crypto = require("node:crypto");
const { registerAuth, requireAdmin } = require("./auth");
const {
  SLOTS,
  HOLD_MINUTES,
  assert,
  hash,
  vnDate,
  validDate,
  slotPassed,
  quoteCheckout,
  customerInput,
  serializeOrder,
  BOOKING_ACKNOWLEDGEMENT,
} = require("./domain");

const ACTIVE = `booking_status NOT IN ('CANCELLED','EXPIRED','RETURNED','COMPLETED') AND is_returned=FALSE AND (booking_status NOT IN ('AWAITING_PAYMENT','HOLD_15MIN') OR COALESCE(expires_at,created_at+INTERVAL '15 minutes')>NOW())`;
const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const resourceSql = `COALESCE(resource_id,CASE WHEN service_type ILIKE '%Photobooth%' THEN 'photobooth' ELSE 'studio' END)`;
const requestBuckets = new Map();
function rateLimit(req, res, next) {
  const key = `${req.socket.remoteAddress}:${req.route?.path || req.path}`;
  const now = Date.now();
  for (const [id, value] of requestBuckets)
    if (value.until < now) requestBuckets.delete(id);
  const bucket = requestBuckets.get(key) || { count: 0, until: now + 60000 };
  bucket.count++;
  requestBuckets.set(key, bucket);
  if (bucket.count > 50)
    return res
      .status(429)
      .json({
        success: false,
        message: "Bạn thao tác quá nhanh. Vui lòng thử lại sau một phút.",
      });
  next();
}
async function migrateStudio(pool) {
  await pool.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS line_items JSONB NOT NULL DEFAULT '[]';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS security_deposit INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_paid BIGINT NOT NULL DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS resource_id TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_token_hash TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_request_id TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_request_hash TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS booking_acknowledgement JSONB;
    CREATE UNIQUE INDEX IF NOT EXISTS orders_checkout_request_unique ON orders(checkout_request_id) WHERE checkout_request_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS orders_booking_resource ON orders(booking_date,resource_id,time_slot);
    CREATE TABLE IF NOT EXISTS studio_payments (
      transaction_id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
      amount BIGINT NOT NULL CHECK(amount>0), source TEXT NOT NULL,
      review_required BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
async function transaction(pool, action) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const value = await action(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
async function locks(client, keys) {
  for (const key of [...new Set(keys)].sort())
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      key,
    ]);
}
async function checkAvailability(client, quote, excludeId = "") {
  const requested = new Map();
  for (const line of quote.lines.filter((l) => l.type === "costume"))
    requested.set(line.id, (requested.get(line.id) || 0) + line.quantity);
  if (requested.size) {
    const active = await client.query(
      `SELECT id,line_items,costume_ids FROM orders WHERE ${ACTIVE} AND id<>$3 AND COALESCE(NULLIF(start_date,''),booking_date)<$2 AND COALESCE(NULLIF(end_date,''),booking_date)>$1`,
      [quote.date, quote.endDate, excludeId],
    );
    for (const [id, quantity] of requested) {
      const {
        rows: [stock],
      } = await client.query(
        "SELECT available_count,available_status FROM costumes WHERE id=$1",
        [id],
      );
      let used = 0;
      for (const order of active.rows) {
        const matching = (order.line_items || []).filter(
          (l) => l.type === "costume" && l.id === id,
        );
        used += matching.length
          ? matching.reduce((sum, l) => sum + Number(l.quantity || 1), 0)
          : (order.costume_ids || []).includes(id)
            ? 1
            : 0;
      }
      assert(
        stock &&
          stock.available_status === "AVAILABLE" &&
          quantity + used <= stock.available_count,
        "Trang phục không còn đủ số lượng trong khoảng ngày này. Hãy đổi ngày hoặc số lượng.",
        409,
      );
    }
  }
  if (quote.resource) {
    const { rows } = await client.query(
      `SELECT id FROM orders WHERE ${ACTIVE} AND id<>$4 AND booking_date=$1 AND time_slot=$2 AND ${resourceSql}=$3`,
      [quote.date, quote.slot, quote.resource, excludeId],
    );
    assert(
      !rows.length,
      "Ca chụp này vừa được đặt. Vui lòng chọn ca khác.",
      409,
    );
  }
}
function lockKeys(quote) {
  return [
    ...quote.lines
      .filter((l) => l.type === "costume")
      .map((l) => `stock:${l.id}`),
    ...(quote.resource
      ? [`slot:${quote.resource}:${quote.date}:${quote.slot}`]
      : []),
  ];
}
function effectiveOrder(row) {
  if (
    ["AWAITING_PAYMENT", "HOLD_15MIN"].includes(row.booking_status) &&
    row.expires_at &&
    Date.parse(row.expires_at) <= Date.now()
  )
    return { ...row, booking_status: "EXPIRED" };
  return row;
}
function authorizeCheckout(req, row) {
  assert(
    row &&
      req.headers["x-checkout-token"] &&
      hash(req.headers["x-checkout-token"]) === row.checkout_token_hash,
    "Không tìm thấy đơn hoặc liên kết không còn hợp lệ.",
    404,
  );
}

async function recordPayment(
  client,
  orderId,
  amount,
  transactionId,
  source,
  autoConfirm = true,
) {
  // Serialize a transaction reference even if callbacks target different orders.
  await locks(client, [`payment:${transactionId}`]);
  const {
    rows: [row],
  } = await client.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE", [
    orderId,
  ]);
  assert(row, "Không tìm thấy đơn hàng.", 404);
  const existing = await client.query(
    "SELECT * FROM studio_payments WHERE transaction_id=$1",
    [transactionId],
  );
  if (existing.rows.length) {
    assert(
      existing.rows[0].order_id === orderId &&
        Number(existing.rows[0].amount) === amount,
      "Mã giao dịch đã được sử dụng cho dữ liệu khác.",
      409,
    );
    return { order: serializeOrder(effectiveOrder(row)), duplicate: true };
  }
  const expired = effectiveOrder(row).booking_status === "EXPIRED";
  const review =
    !autoConfirm ||
    expired ||
    ["CANCELLED", "RETURNED", "COMPLETED"].includes(row.booking_status);
  await client.query(
    "INSERT INTO studio_payments(transaction_id,order_id,amount,source,review_required) VALUES($1,$2,$3,$4,$5)",
    [transactionId, orderId, amount, source, review],
  );
  const paid = Number(row.amount_paid || 0) + amount;
  const total =
    Number(row.total_amount) +
    Number(row.security_deposit || 0) +
    Number(row.penalty_fee || 0);
  const status =
    paid >= total
      ? "FULLY_PAID"
      : paid >= row.deposit_amount
        ? "DEPOSITED"
        : "PARTIALLY_PAID";
  const booking = review
    ? expired
      ? "EXPIRED"
      : row.booking_status
    : paid >= row.deposit_amount
      ? "CONFIRMED"
      : row.booking_status;
  const {
    rows: [updated],
  } = await client.query(
    "UPDATE orders SET amount_paid=$1,payment_status=$2,booking_status=$3,notes=CONCAT(COALESCE(notes,''),$4::text) WHERE id=$5 RETURNING *",
    [
      paid,
      status,
      booking,
      review ? " [Giao dịch cần studio kiểm tra]" : "",
      orderId,
    ],
  );
  return {
    order: serializeOrder(updated),
    reviewRequired: review,
    duplicate: false,
  };
}

function registerStudio(app, pool) {
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  registerAuth(app);
  app.get(
    "/api/availability",
    asyncRoute(async (req, res) => {
      const { date, resource = "photobooth" } = req.query;
      assert(
        validDate(date) && ["studio", "photobooth"].includes(resource),
        "Ngày hoặc loại phòng chưa hợp lệ.",
      );
      const result = await pool.query(
        `SELECT time_slot FROM orders WHERE ${ACTIVE} AND booking_date=$1 AND ${resourceSql}=$2`,
        [date, resource],
      );
      res.json({
        success: true,
        data: SLOTS.map((time) => ({
          time,
          available:
            !slotPassed(date, time) &&
            !result.rows.some((r) => r.time_slot === time),
        })),
        holdMinutes: HOLD_MINUTES,
      });
    }),
  );
  app.post(
    "/api/checkout/quote",
    rateLimit,
    asyncRoute(async (req, res) => {
      const quote = await quoteCheckout(pool, req.body);
      await checkAvailability(pool, quote);
      res.json({ success: true, data: { ...quote, bookingAcknowledgement: BOOKING_ACKNOWLEDGEMENT } });
    }),
  );
  app.post(
    "/api/checkout",
    rateLimit,
    asyncRoute(async (req, res) => {
      const customer = customerInput(req.body.customer);
      assert(req.body.bookingAcknowledgement?.accepted === true,
        "Vui lòng xác nhận chi phí và thời gian giữ chỗ.");
      assert(req.body.bookingAcknowledgement.version === BOOKING_ACKNOWLEDGEMENT.version,
        "Nội dung xác nhận đã thay đổi. Vui lòng tải lại báo giá.", 409);
      const key = req.body.requestId;
      assert(
        typeof key === "string" && /^[a-zA-Z0-9_-]{20,80}$/.test(key),
        "Mã yêu cầu không hợp lệ.",
      );
      assert(
        process.env.CHECKOUT_SECRET || process.env.ADMIN_PASSWORD,
        "Studio chưa cấu hình nhận đặt lịch.",
        503,
      );
      const token = crypto
        .createHmac(
          "sha256",
          process.env.CHECKOUT_SECRET || process.env.ADMIN_PASSWORD,
        )
        .update(key)
        .digest("hex");
      const payloadHash = hash(
        JSON.stringify({ ...req.body, requestId: undefined }),
      );
      const result = await transaction(pool, async (client) => {
        await locks(client, [`request:${key}`]);
        const old = await client.query(
          "SELECT * FROM orders WHERE checkout_request_id=$1",
          [key],
        );
        if (old.rows.length) {
          assert(
            old.rows[0].checkout_request_hash === payloadHash,
            "Yêu cầu cũ không khớp nội dung. Vui lòng thử lại.",
            409,
          );
          return effectiveOrder(old.rows[0]);
        }
        const quote = await quoteCheckout(client, req.body);
        await locks(client, lockKeys(quote));
        const costumeIds = [
          ...new Set(
            quote.lines.filter((l) => l.type === "costume").map((l) => l.id),
          ),
        ];
        if (costumeIds.length)
          await client.query(
            "SELECT id FROM costumes WHERE id=ANY($1::text[]) ORDER BY id FOR SHARE",
            [costumeIds],
          );
        const fresh = await quoteCheckout(client, req.body);
        await checkAvailability(client, fresh);
        const id = `AUR-${vnDate().replaceAll("-", "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
        const service = fresh.lines
          .map((l) =>
            l.type === "costume"
              ? "Thuê Trang Phục"
              : l.type === "package"
                ? "Gói Chụp Studio"
                : "Photobooth",
          )
          .filter((v, i, all) => all.indexOf(v) === i)
          .join(" & ");
        const details = fresh.lines
          .map(
            (l) =>
              `${l.name}${l.size ? ` · Size ${l.size} × ${l.quantity}` : ""}${l.people ? ` · ${l.people} người` : ""}`,
          )
          .join(" + ");
        const {
          rows: [row],
        } = await client.query(
          `INSERT INTO orders(id,customer_name,phone,email,service_type,item_details,costume_ids,start_date,end_date,booking_date,return_date,rental_days,time_slot,total_amount,deposit_amount,payment_status,booking_status,notes,line_items,security_deposit,resource_id,expires_at,checkout_token_hash,checkout_request_id,checkout_request_hash,booking_acknowledgement)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$8,$9,$10,$11,$12,$13,'PENDING','AWAITING_PAYMENT',$14,$15,$16,$17,NOW()+INTERVAL '15 minutes',$18,$19,$20,$21) RETURNING *`,
          [
            id,
            customer.name,
            customer.phone,
            customer.email,
            service,
            details,
            JSON.stringify(costumeIds),
            fresh.date,
            fresh.endDate,
            fresh.days,
            fresh.slot,
            fresh.serviceTotal,
            fresh.dueNow,
            customer.notes,
            JSON.stringify(fresh.lines),
            fresh.securityDeposit,
            fresh.resource,
            hash(token),
            key,
            payloadHash,
            JSON.stringify({ ...BOOKING_ACKNOWLEDGEMENT, acceptedAt: new Date().toISOString() }),
          ],
        );
        return row;
      });
      res
        .status(201)
        .json({
          success: true,
          data: serializeOrder(result),
          checkoutToken: token,
        });
    }),
  );
  app.get(
    "/api/checkout/:id",
    asyncRoute(async (req, res) => {
      const {
        rows: [row],
      } = await pool.query("SELECT * FROM orders WHERE id=$1", [req.params.id]);
      authorizeCheckout(req, row);
      res.set("Cache-Control", "no-store");
      res.json({ success: true, data: serializeOrder(effectiveOrder(row)) });
    }),
  );
  app.post(
    "/api/checkout/:id/cancel",
    asyncRoute(async (req, res) => {
      const data = await transaction(pool, async (client) => {
        const {
          rows: [row],
        } = await client.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE", [
          req.params.id,
        ]);
        authorizeCheckout(req, row);
        assert(
          !Number(row.amount_paid) &&
            ["AWAITING_PAYMENT", "HOLD_15MIN", "EXPIRED"].includes(
              effectiveOrder(row).booking_status,
            ),
          "Đơn đã nhận tiền. Vui lòng liên hệ studio để xử lý.",
          409,
        );
        const result = await client.query(
          "UPDATE orders SET booking_status='CANCELLED',payment_status='CANCELLED' WHERE id=$1 RETURNING *",
          [row.id],
        );
        return serializeOrder(result.rows[0]);
      });
      res.json({ success: true, data });
    }),
  );
  app.post(
    "/api/lookup",
    rateLimit,
    asyncRoute(async (req, res) => {
      const id = String(req.body.id || "")
        .trim()
        .toUpperCase();
      const phone = String(req.body.phone || "").replace(/[\s().-]/g, "");
      assert(
        id.length >= 10 && phone.length >= 9,
        "Vui lòng nhập mã đơn và số điện thoại đã đặt.",
      );
      const {
        rows: [row],
      } = await pool.query(
        "SELECT * FROM orders WHERE UPPER(id)=$1 AND phone=$2",
        [id, phone],
      );
      assert(
        row,
        "Không tìm thấy đơn khớp thông tin. Vui lòng kiểm tra lại.",
        404,
      );
      const order = serializeOrder(effectiveOrder(row));
      delete order.notes;
      res.json({ success: true, data: order });
    }),
  );
  app.post(
    "/api/payment/webhook",
    asyncRoute(async (req, res) => {
      const key = String(req.headers.authorization || "").replace(
        /^(Apikey|Bearer)\s+/i,
        "",
      );
      assert(
        process.env.PAYMENT_WEBHOOK_SECRET &&
          hash(key) === hash(process.env.PAYMENT_WEBHOOK_SECRET),
        "Webhook chưa được xác thực.",
        401,
      );
      const data = req.body;
      assert(data.transferType === "in", "Chỉ xử lý giao dịch nhận tiền.");
      const amount = Number(data.transferAmount);
      assert(
        Number.isSafeInteger(amount) && amount > 0 && amount < 2_000_000_000,
        "Số tiền không hợp lệ.",
      );
      assert(
        data.id !== undefined && /^[\w-]{1,120}$/.test(String(data.id)),
        "Thiếu mã giao dịch ổn định.",
      );
      const references = [
        ...String(data.content || data.description || "").matchAll(
          /\bAUR-?(\d{8})-?([A-F0-9]{8})\b/gi,
        ),
      ].map((match) => `AUR-${match[1]}-${match[2].toUpperCase()}`);
      assert(
        new Set(references).size === 1,
        "Nội dung cần có đúng một mã đơn đầy đủ.",
      );
      const reference = references[0];
      const {
        rows: [bank],
      } = await pool.query(
        "SELECT * FROM bank_configs WHERE id='primary_bank'",
      );
      assert(
        bank && String(data.accountNumber) === bank.account_number,
        "Tài khoản nhận tiền không khớp.",
      );
      const result = await transaction(pool, (client) =>
        recordPayment(
          client,
          reference,
          amount,
          String(data.id),
          "bank",
          bank.is_auto_confirm_enabled,
        ),
      );
      res.json({ success: true, ...result });
    }),
  );
  app.get(
    "/api/admin/orders",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const { rows } = await pool.query(
        "SELECT * FROM orders ORDER BY created_at DESC LIMIT 500",
      );
      res.json({
        success: true,
        data: rows.map((row) => serializeOrder(effectiveOrder(row))),
      });
    }),
  );
  app.post(
    "/api/admin/orders/:id/payment",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const amount = Number(req.body.amount);
      assert(
        Number.isSafeInteger(amount) && amount > 0 && amount < 2_000_000_000,
        "Số tiền chưa hợp lệ.",
      );
      assert(
        typeof req.body.transactionId === "string" &&
          /^[\w-]{8,100}$/.test(req.body.transactionId),
        "Cần mã xác nhận giao dịch.",
      );
      const result = await transaction(pool, (client) =>
        recordPayment(
          client,
          req.params.id,
          amount,
          `MANUAL-${req.body.transactionId}`,
          "admin",
        ),
      );
      res.json({ success: true, ...result });
    }),
  );
  app.patch(
    "/api/admin/orders/:id",
    requireAdmin,
    asyncRoute(async (req, res) => {
      const result = await transaction(pool, async (client) => {
        const {
          rows: [row],
        } = await client.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE", [
          req.params.id,
        ]);
        assert(row, "Không tìm thấy đơn.", 404);
        const body = req.body;
        const status = body.bookingStatus || row.booking_status;
        assert(
          [
            "CONFIRMED",
            "AWAITING_PAYMENT",
            "CANCELLED",
            "RETURNED",
            "COMPLETED",
            "EXPIRED",
          ].includes(status),
          "Trạng thái chưa hợp lệ.",
        );
        const current = effectiveOrder(row).booking_status;
        assert(
          status === current ||
            !["CANCELLED", "EXPIRED", "RETURNED", "COMPLETED"].includes(
              current,
            ) ||
            ["CANCELLED", "EXPIRED", "RETURNED", "COMPLETED"].includes(status),
          "Đơn đã đóng cần được tạo lại sau khi kiểm tra lịch.",
        );
        assert(
          status !== "CONFIRMED" ||
            Number(row.amount_paid) >= Number(row.deposit_amount),
          "Vui lòng xác nhận tiền đã nhận trước khi xác nhận lịch.",
        );
        const penalty =
          body.penaltyFee === undefined
            ? row.penalty_fee
            : Number(body.penaltyFee);
        assert(
          Number.isInteger(penalty) && penalty >= 0 && penalty <= 100000000,
          "Phụ phí chưa hợp lệ.",
        );
        const paid = Number(row.amount_paid || 0);
        const payment =
          paid <= 0
            ? row.payment_status
            : paid >=
                Number(row.total_amount) +
                  Number(row.security_deposit) +
                  penalty
              ? "FULLY_PAID"
              : paid >= Number(row.deposit_amount)
                ? "DEPOSITED"
                : "PARTIALLY_PAID";
        const staff = (value) =>
          value === undefined ? null : String(value).trim().slice(0, 200);
        const {
          rows: [updated],
        } = await client.query(
          "UPDATE orders SET booking_status=$1,is_returned=$2,penalty_fee=$3,notes=COALESCE($4,notes),assigned_photographer=COALESCE($5,assigned_photographer),assigned_makeup=COALESCE($6,assigned_makeup),payment_status=$8 WHERE id=$7 RETURNING *",
          [
            status,
            status === "RETURNED",
            penalty,
            body.notes === undefined ? null : String(body.notes).slice(0, 2000),
            staff(body.assignedPhotographer),
            staff(body.assignedMakeup),
            row.id,
            payment,
          ],
        );
        return serializeOrder(updated);
      });
      res.json({ success: true, data: result });
    }),
  );
  // Existing catalog/CMS endpoints remain compatible, but all administration is private.
  app.use("/api", (req, res, next) => {
    const publicGet = [
      "/health",
      "/categories",
      "/costumes",
      "/packages",
      "/addons",
      "/photobooth",
      "/banners",
      "/payment/bank-config",
    ];
    if (
      req.method === "GET" &&
      (publicGet.includes(req.path) || /^\/costumes\/[^/]+$/.test(req.path)) &&
      req.query.all !== "true"
    )
      return next();
    if (req.method === "POST" && req.path === "/analytics/track-visit")
      return rateLimit(req, res, next);
    if (req.path === "/payment/simulate-webhook")
      return res
        .status(410)
        .json({
          success: false,
          message:
            "Bộ giả lập đã được thay bằng xác nhận giao dịch trong quản trị đơn.",
        });
    if (req.method === "POST" && req.path === "/orders")
      return res
        .status(410)
        .json({
          success: false,
          message: "Vui lòng tạo đơn qua quy trình checkout mới.",
        });
    if (req.method === "PUT" && /^\/orders\/[^/]+$/.test(req.path))
      return res
        .status(410)
        .json({
          success: false,
          message: "Vui lòng cập nhật đơn qua API quản trị mới.",
        });
    return requireAdmin(req, res, next);
  });
  app.put(
    "/api/payment/bank-config",
    asyncRoute(async (req, res, next) => {
      const b = req.body;
      assert(
        typeof b.bankName === "string" &&
          b.bankName.trim().length > 1 &&
          b.bankName.length <= 100,
        "Tên ngân hàng chưa hợp lệ.",
      );
      assert(/^\d{6}$/.test(b.bankBin), "Mã BIN ngân hàng cần có 6 chữ số.");
      assert(/^\d{5,30}$/.test(b.accountNumber), "Số tài khoản chưa hợp lệ.");
      assert(
        typeof b.accountHolder === "string" &&
          b.accountHolder.trim().length > 1 &&
          b.accountHolder.length <= 100,
        "Tên chủ tài khoản chưa hợp lệ.",
      );
      assert(
        ["dynamic", "custom_image"].includes(b.qrType),
        "Loại QR chưa hợp lệ.",
      );
      assert(
        /^[a-zA-Z0-9_-]{1,100}$/.test(b.qrTemplate || "compact2"),
        "Mẫu QR chưa hợp lệ.",
      );
      assert(
        !b.customQrImage ||
          (/^data:image\/(png|jpeg|webp);base64,/.test(b.customQrImage) &&
            b.customQrImage.length <= 4300000),
        "Chọn ảnh QR PNG, JPEG hoặc WebP dưới 3 MB.",
      );
      assert(
        b.qrType !== "custom_image" || b.customQrImage,
        "Vui lòng chọn ảnh QR.",
      );
      assert(
        typeof b.isAutoConfirmEnabled === "boolean",
        "Cấu hình xác nhận chưa hợp lệ.",
      );
      next();
    }),
  );
}
module.exports = {
  registerStudio,
  migrateStudio,
  transaction,
  checkAvailability,
  recordPayment,
  ACTIVE,
  asyncRoute,
};
