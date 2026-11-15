const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const express = require("express");
const enabled = Boolean(process.env.TEST_DATABASE_URL);
if (!enabled) {
  test(
    "integration: set TEST_DATABASE_URL or use test:local",
    { skip: true },
    () => {},
  );
} else {
  assert.match(
    new URL(process.env.TEST_DATABASE_URL).pathname,
    /_test$/,
    "Integration tests only accept a dedicated *_test database",
  );
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  const { pool, initDb } = require("../src/db");
  const {
    registerStudio,
    migrateStudio,
    transaction,
    recordPayment,
  } = require("../src/studio");
  const { registerAnalytics, summary } = require("../src/studio/analytics");
  const { registerCostumes } = require("../src/studio/costumes");
  const { vnDate, addDays, BOOKING_ACKNOWLEDGEMENT } = require("../src/studio/domain");
  let server, base, cookie, booth, packageId, bank;
  const date = addDays(vnDate(), 10),
    customer = { name: "Integration Test", phone: "0900000000" };
  const body = (items, patch = {}) => ({
    date,
    days: 1,
    items,
    customer,
    requestId: crypto.randomUUID(),
    bookingAcknowledgement: { accepted: true, version: BOOKING_ACKNOWLEDGEMENT.version },
    ...patch,
  });
  const costume = (qty = 1, size = "M") => ({
    type: "costume",
    id: "AD-101",
    size,
    quantity: qty,
  });
  async function request(path, options = {}) {
    const response = await fetch(base + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await response.json();
    return { status: response.status, data, response };
  }
  const create = (payload) =>
    request("/api/checkout", { method: "POST", body: payload });
  const pay = (id, amount, transactionId = crypto.randomUUID(), extra = {}) =>
    request("/api/payment/webhook", {
      method: "POST",
      headers: { Authorization: "Apikey test-webhook-secret" },
      body: {
        id: transactionId,
        transferType: "in",
        transferAmount: amount,
        accountNumber: bank,
        content: `AURA ${id.replaceAll("-", "")}`,
        ...extra,
      },
    });
  before(async () => {
    await initDb();
    await migrateStudio(pool);
    await pool.query(
      "TRUNCATE studio_payments,orders,visitor_logs,analytics_monthly_summaries",
    );
    await pool.query(
      "UPDATE costumes SET available_count=4,available_status='AVAILABLE',rental_price=250000,deposit_amount=500000,sizes='[\"S\",\"M\",\"L\"]' WHERE id='AD-101'",
    );
    booth = (await pool.query("SELECT id FROM photobooth_concepts LIMIT 1"))
      .rows[0].id;
    packageId = (
      await pool.query(
        "SELECT id FROM service_packages WHERE included_people=1 LIMIT 1",
      )
    ).rows[0].id;
    bank = (
      await pool.query(
        "SELECT account_number FROM bank_configs WHERE id='primary_bank'",
      )
    ).rows[0].account_number;
    const app = express();
    app.use(express.json());
    registerStudio(app, pool);
    registerAnalytics(app, pool);
    registerCostumes(app, pool);
    app.use((err, req, res, next) =>
      res
        .status(err.status || 500)
        .json({ success: false, message: err.message }),
    );
    server = app.listen(0, "127.0.0.1");
    await new Promise((r) => server.once("listening", r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => {
    if (server) await new Promise((r) => server.close(r));
    await pool.end();
  });
  test("empty studio reports zero instead of seeded business activity", async () => {
    const data = await summary(pool);
    assert.equal(data.totalRevenue, 0);
    assert.equal(data.totalOrders, 0);
    assert.equal(data.totalVisitorsAllTime, 0);
  });
  test("administrator access, CSRF, private cookies and logout", async () => {
    assert.equal((await request("/api/admin/orders")).status, 401);
    assert.equal((await request("/api/analytics/summary")).status, 401);
    assert.equal(
      (
        await request("/api/auth/login", {
          method: "POST",
          headers: { Origin: "https://untrusted.example" },
          body: { username: "test-admin", password: "test-password-only" },
        })
      ).status,
      403,
    );
    const login = await request("/api/auth/login", {
      method: "POST",
      body: { username: "test-admin", password: "test-password-only" },
    });
    assert.equal(login.status, 200);
    const raw = login.response.headers.get("set-cookie");
    assert.match(raw, /HttpOnly/);
    assert.match(raw, /SameSite=Strict/);
    cookie = raw.split(";")[0];
    assert.equal(
      (await request("/api/admin/orders", { headers: { Cookie: cookie } }))
        .status,
      200,
    );
    await request("/api/auth/logout", {
      method: "POST",
      headers: { Cookie: cookie },
    });
    assert.equal(
      (await request("/api/admin/orders", { headers: { Cookie: cookie } }))
        .status,
      401,
    );
    const again = await request("/api/auth/login", {
      method: "POST",
      body: { username: "test-admin", password: "test-password-only" },
    });
    cookie = again.response.headers.get("set-cookie").split(";")[0];
  });
  test("catalog saves galleries, changes covers and preserves legacy images", async () => {
    const id = "GALLERY-INTEGRATION-TEST";
    const endpoint = `/api/costumes/${id}`;
    const photos = ["/images/first.png", "/images/second.png", "/images/third.png"];
    const product = { id, name: "Gallery Test", category: "test", images: photos, rentalPrice: 100000, depositAmount: 200000 };
    await pool.query("DELETE FROM costumes WHERE id=$1", [id]);
    try {
      assert.equal((await request("/api/costumes", { method: "POST", body: product })).status, 401);
      const create = await request("/api/costumes", { method: "POST", headers: { Cookie: cookie }, body: product });
      assert.equal(create.status, 201);
      assert.equal(create.data.data.image, photos[0]);
      assert.deepEqual(create.data.data.images, photos);
      const read = await request(endpoint);
      assert.equal(read.status, 200);
      assert.deepEqual(read.data.data.images, photos);
      const update = (body) => request(endpoint, { method: "PUT", headers: { Cookie: cookie }, body });
      await update({ images: [photos[2], photos[0]], image: photos[1] });
      assert.equal((await request(endpoint)).data.data.image, photos[2]);
      await update({ name: "Edited without changing pictures" });
      assert.deepEqual((await request(endpoint)).data.data.images, [photos[2], photos[0]]);
      await update({ image: photos[1] });
      assert.deepEqual((await request(endpoint)).data.data.images, [photos[1], photos[0]]);
      assert.equal((await update({ images: [] })).status, 400);
      assert.equal((await update({ images: Array(11).fill(photos[0]) })).status, 400);
      assert.deepEqual((await request(endpoint)).data.data.images, [photos[1], photos[0]]);
      await pool.query("UPDATE costumes SET images='[]',image=$2 WHERE id=$1", [id, photos[0]]);
      assert.deepEqual((await request(endpoint)).data.data.images, [photos[0]]);
    } finally { await pool.query("DELETE FROM costumes WHERE id=$1", [id]); }
  });
  test("checkout requires the current explicit acknowledgement before writing any order", async () => {
    const quote = await request("/api/checkout/quote", { method: "POST", body: body([costume()]) });
    assert.deepEqual(quote.data.data.bookingAcknowledgement, BOOKING_ACKNOWLEDGEMENT);
    const before = Number((await pool.query("SELECT COUNT(*) AS total FROM orders")).rows[0].total);
    for (const [ack, status] of [
      [undefined, 400], [{ accepted: false, version: BOOKING_ACKNOWLEDGEMENT.version }, 400],
      [{ accepted: "true", version: BOOKING_ACKNOWLEDGEMENT.version }, 400],
      [{ accepted: true, version: "outdated" }, 409],
    ]) assert.equal((await create(body([costume()], { bookingAcknowledgement: ack }))).status, status);
    assert.equal(Number((await pool.query("SELECT COUNT(*) AS total FROM orders")).rows[0].total), before);
  });
  test("authoritative pricing, idempotent creation, protected checkout and exact lookup", async () => {
    const payload = body([costume(2)], {
      days: 3,
      totalAmount: 1,
      depositAmount: 1,
      bookingStatus: "CONFIRMED",
      bookingAcknowledgement: { accepted: true, version: BOOKING_ACKNOWLEDGEMENT.version,
        text: "client cannot replace the receipt", acceptedAt: "1900-01-01" },
    });
    const [a, b] = await Promise.all([create(payload), create(payload)]);
    assert.equal(a.status, 201);
    assert.equal(b.data.data.id, a.data.data.id);
    const order = a.data.data;
    assert.equal(order.totalAmount, 1500000);
    assert.equal(order.securityDeposit, 1000000);
    assert.equal(order.depositAmount, 1000000);
    assert.equal(order.bookingStatus, "AWAITING_PAYMENT");
    assert.equal(order.bookingAcknowledgement.version, BOOKING_ACKNOWLEDGEMENT.version);
    assert.equal(order.bookingAcknowledgement.text, BOOKING_ACKNOWLEDGEMENT.text);
    assert.ok(Number.isFinite(Date.parse(order.bookingAcknowledgement.acceptedAt)));
    assert.ok(Date.parse(order.bookingAcknowledgement.acceptedAt) > Date.parse("2026-01-01"));
    assert.deepEqual(b.data.data.bookingAcknowledgement, order.bookingAcknowledgement);
    assert.equal((await create({ ...payload, days: 2 })).status, 409);
    assert.equal((await request(`/api/checkout/${order.id}`)).status, 404);
    assert.equal(
      (
        await request(`/api/checkout/${order.id}`, {
          headers: { "X-Checkout-Token": a.data.checkoutToken },
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await request("/api/lookup", {
          method: "POST",
          body: { id: order.id, phone: "0900000001" },
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await request("/api/lookup", {
          method: "POST",
          body: { id: order.id, phone: customer.phone },
        })
      ).data.data.id,
      order.id,
    );
    await request(`/api/checkout/${order.id}/cancel`, {
      method: "POST",
      headers: { "X-Checkout-Token": a.data.checkoutToken },
    });
    assert.equal(
      (
        await pool.query("SELECT booking_status FROM orders WHERE id=$1", [
          order.id,
        ])
      ).rows[0].booking_status,
      "CANCELLED",
    );
  });
  test("concurrent stock is never oversold, including size aggregation and adjacent intervals", async () => {
    const results = await Promise.all(
      Array.from({ length: 6 }, () => create(body([costume()]))),
    );
    assert.equal(results.filter((r) => r.status === 201).length, 4);
    assert.equal(results.filter((r) => r.status === 409).length, 2);
    assert.equal(
      (
        await create(
          body([costume(3, "S"), costume(2, "M")], { date: addDays(date, 1) }),
        )
      ).status,
      409,
    );
    assert.equal(
      (await create(body([costume(4)], { date: addDays(date, 1) }))).status,
      201,
    );
  });
  test("studio and photobooth share no slot lock; same resource has one winner", async () => {
    const items = [{ type: "photobooth", id: booth }];
    const payload = () => body(items, { slot: "08:30 - 10:00" });
    const results = await Promise.all([
      create(payload()),
      create(payload()),
      create(payload()),
    ]);
    assert.equal(results.filter((r) => r.status === 201).length, 1);
    const studio = await create(
      body([{ type: "package", id: packageId }], { slot: "08:30 - 10:00" }),
    );
    assert.equal(studio.status, 201);
    const availability = await request(
      `/api/availability?date=${date}&resource=photobooth`,
    );
    assert.equal(availability.data.data[0].available, false);
    assert.equal(availability.data.data[1].available, true);
  });
  test("verified callbacks accumulate once, reject bad payloads and never downgrade payment", async () => {
    const created = await create(
      body([{ type: "photobooth", id: booth }], { slot: "10:00 - 11:30" }),
    );
    const order = created.data.data;
    assert.equal(
      (await request("/api/payment/webhook", { method: "POST", body: {} }))
        .status,
      401,
    );
    for (const extra of [
      { accountNumber: "wrong" },
      { transferType: "out" },
      { transferAmount: -1 },
      { content: "AURA partial" },
    ])
      assert.equal(
        (await pay(order.id, order.depositAmount, crypto.randomUUID(), extra))
          .status,
        400,
      );
    const tx = crypto.randomUUID();
    const results = await Promise.all([
      pay(order.id, order.depositAmount, tx),
      pay(order.id, order.depositAmount, tx),
    ]);
    assert.equal(
      results.every((r) => r.status === 200),
      true,
      JSON.stringify(results.map((r) => r.data)),
    );
    assert.equal(results.filter((r) => r.data.duplicate).length, 1);
    const row = (
      await pool.query("SELECT * FROM orders WHERE id=$1", [order.id])
    ).rows[0];
    assert.equal(Number(row.amount_paid), order.depositAmount);
    assert.equal(row.booking_status, "CONFIRMED");
    const next = await pay(order.id, 1000);
    assert.equal(
      next.data.order.paymentStatus,
      order.depositAmount >= order.totalAmount ? "FULLY_PAID" : "DEPOSITED",
    );
    assert.equal(
      (
        await request(`/api/checkout/${order.id}/cancel`, {
          method: "POST",
          headers: { "X-Checkout-Token": created.data.checkoutToken },
        })
      ).status,
      409,
    );
  });
  test("late payments remain auditable and cannot revive expired inventory", async () => {
    const created = await create(
      body([{ type: "photobooth", id: booth }], { slot: "13:30 - 15:00" }),
    );
    const order = created.data.data;
    await pool.query(
      "UPDATE orders SET expires_at=NOW()-INTERVAL '1 minute' WHERE id=$1",
      [order.id],
    );
    const replacement = await create(
      body([{ type: "photobooth", id: booth }], { slot: "13:30 - 15:00" }),
    );
    assert.equal(replacement.status, 201);
    const late = await pay(order.id, order.depositAmount);
    assert.equal(late.data.reviewRequired, true, JSON.stringify(late.data));
    assert.equal(late.data.order.bookingStatus, "EXPIRED");
    assert.equal(late.data.order.amountPaid, order.depositAmount);
    const revive = await request(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { Cookie: cookie },
      body: { bookingStatus: "CONFIRMED" },
    });
    assert.equal(revive.status, 400);
    const reopen = await request(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { Cookie: cookie },
      body: { bookingStatus: "AWAITING_PAYMENT" },
    });
    assert.equal(reopen.status, 400);
  });
  test("disabled auto-confirm keeps received money pending review; staff can confirm without charging twice", async () => {
    await pool.query(
      "UPDATE bank_configs SET is_auto_confirm_enabled=FALSE WHERE id='primary_bank'",
    );
    try {
      const created = await create(
        body([{ type: "photobooth", id: booth }], { slot: "18:00 - 19:30" }),
      );
      const order = created.data.data;
      const payment = await pay(
        order.id,
        order.depositAmount,
        crypto.randomUUID(),
        { content: `THANH TOAN ${order.id}` },
      );
      assert.equal(payment.data.reviewRequired, true);
      assert.equal(payment.data.order.bookingStatus, "AWAITING_PAYMENT");
      const updated = await request(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { Cookie: cookie },
        body: { bookingStatus: "CONFIRMED" },
      });
      assert.equal(updated.data.data.bookingStatus, "CONFIRMED");
      assert.equal(updated.data.data.amountPaid, order.depositAmount);
    } finally {
      await pool.query(
        "UPDATE bank_configs SET is_auto_confirm_enabled=TRUE WHERE id='primary_bank'",
      );
    }
  });
  test("manual payments, staff persistence, disabled tracking and aggregate-only exports", async () => {
    const created = await create(
      body([{ type: "photobooth", id: booth }], { slot: "15:00 - 16:30" }),
    );
    const order = created.data.data;
    const r = await request(`/api/admin/orders/${order.id}/payment`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: { amount: order.totalAmount, transactionId: crypto.randomUUID() },
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.data.order.bookingStatus, "CONFIRMED");
    const update = await request(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { Cookie: cookie },
      body: { assignedPhotographer: "Test Photographer", penaltyFee: 50000 },
    });
    assert.equal(update.data.data.assignedPhotographer, "Test Photographer");
    assert.equal(update.data.data.paymentStatus, "DEPOSITED");
    const visits = await Promise.all(
      Array.from({ length: 3 }, () =>
        request("/api/analytics/track-visit", {
          method: "POST",
          body: { visitorId: "integration-visitor", duration: 5 },
        }),
      ),
    );
    assert.ok(visits.every((visit) => visit.status === 410));
    const data = await summary(pool);
    assert.equal(data.totalVisitorsAllTime, 0);
    assert.equal(data.monthlySeries.length, 6);
    const paid = (
      await pool.query(
        "SELECT SUM(LEAST(amount_paid,total_amount+penalty_fee))::bigint AS value FROM orders WHERE booking_status='CONFIRMED' AND security_deposit=0",
      )
    ).rows[0].value;
    assert.equal(data.totalRevenue, Number(paid));
    await pool.query(`INSERT INTO visitor_logs(visitor_id,page_url,ip_address,user_agent,visited_date,visited_month)
      VALUES ('historic-private-one','private-page','192.0.2.1','private-agent',$1,$2),
      ('historic-private-two','private-page','192.0.2.2','private-agent',$1,$2)`, [vnDate(), vnDate().slice(0, 7)]);
    const output = await fetch(base + "/api/analytics/export-excel", {
      headers: { Cookie: cookie },
    });
    assert.equal(output.status, 200);
    assert.match(output.headers.get("content-type"), /spreadsheetml/);
    const XLSX = require("xlsx");
    // Existing logs remain in DB; downloads contain monthly totals only.
    const sheet = XLSX.read(Buffer.from(await output.arrayBuffer()), { type: "buffer" });
    assert.ok(sheet.SheetNames.includes("Luot_truy_cap"));
    assert.equal(JSON.stringify(sheet).includes("visitor_id"), false);
    assert.equal(JSON.stringify(sheet).includes("page_url"), false);
    assert.equal(JSON.stringify(sheet).includes("historic-private"), false);
    assert.equal(JSON.stringify(sheet).includes("private-agent"), false);
    const rows = XLSX.utils.sheet_to_json(sheet.Sheets.Luot_truy_cap);
    assert.deepEqual(rows, [{ month: vnDate().slice(0, 7), total_visits: 2 }]);
  });
}
