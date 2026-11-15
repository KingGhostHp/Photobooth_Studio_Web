const crypto = require("node:crypto");

const SLOTS = [
  "08:30 - 10:00",
  "10:00 - 11:30",
  "13:30 - 15:00",
  "15:00 - 16:30",
  "18:00 - 19:30",
  "19:30 - 21:00",
];
const HOLD_MINUTES = 15;
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const assert = (condition, message, status = 400) => {
  if (!condition) throw new HttpError(status, message);
};
const hash = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");
function vnDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
function validDate(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
function addDays(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
function slotPassed(date, slot, now = new Date()) {
  return Date.parse(`${date}T${slot.slice(0, 5)}:00+07:00`) <= now.getTime();
}
function integer(value, min, max, label) {
  const n = Number(value);
  assert(
    Number.isInteger(n) && n >= min && n <= max,
    `${label} phải từ ${min} đến ${max}.`,
  );
  return n;
}
function customerInput(input = {}) {
  const name = String(input.name || "").trim();
  const phone = String(input.phone || "").replace(/[\s().-]/g, "");
  const email = String(input.email || "").trim();
  assert(
    name.length >= 2 && name.length <= 100,
    "Vui lòng nhập họ tên từ 2 đến 100 ký tự.",
  );
  assert(/^(?:\+84|0)\d{9,10}$/.test(phone), "Số điện thoại chưa hợp lệ.");
  assert(
    !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    "Email chưa hợp lệ.",
  );
  assert(email.length <= 200, "Email quá dài.");
  return {
    name,
    phone,
    email,
    notes: String(input.notes || "").slice(0, 1000),
  };
}

// Catalog prices, not client totals, are authoritative. Every line is a snapshot.
async function quoteCheckout(client, input, now = new Date()) {
  assert(
    validDate(input.date) && input.date >= vnDate(now),
    "Vui lòng chọn ngày từ hôm nay trở đi.",
  );
  assert(
    input.date <= addDays(vnDate(now), 365),
    "Chỉ nhận lịch trong 12 tháng tới.",
  );
  const days = integer(input.days ?? 1, 1, 30, "Số ngày thuê");
  assert(
    Array.isArray(input.items) &&
      input.items.length > 0 &&
      input.items.length <= 20,
    "Giỏ dịch vụ cần từ 1 đến 20 mục.",
  );
  const lines = [];
  const ids = new Set();
  for (const item of input.items) {
    assert(
      item &&
        ["costume", "package", "photobooth"].includes(item.type) &&
        typeof item.id === "string",
      "Dịch vụ trong giỏ chưa hợp lệ.",
    );
    const key = `${item.type}:${item.id}:${item.size || ""}`;
    assert(!ids.has(key), "Vui lòng gộp số lượng của cùng một sản phẩm.");
    ids.add(key);
    const table = {
      costume: "costumes",
      package: "service_packages",
      photobooth: "photobooth_concepts",
    }[item.type];
    const {
      rows: [row],
    } = await client.query(`SELECT * FROM ${table} WHERE id=$1`, [item.id]);
    assert(row, "Một dịch vụ đã ngừng cung cấp. Vui lòng cập nhật giỏ.", 409);
    const line = {
      id: row.id,
      type: item.type,
      name: row.name,
      image: row.image,
      quantity: 1,
      subtotal: 0,
      securityDeposit: 0,
      advance: 0,
    };
    if (item.type === "costume") {
      assert(
        row.available_status === "AVAILABLE" && row.available_count > 0,
        `${row.name} đang tạm ngừng cho thuê.`,
        409,
      );
      line.quantity = integer(
        item.quantity ?? 1,
        1,
        Math.min(row.available_count, 20),
        "Số lượng",
      );
      const sizes = Array.isArray(row.sizes) ? row.sizes : [];
      assert(
        sizes.includes(item.size),
        `Vui lòng chọn kích cỡ cho ${row.name}.`,
      );
      line.size = item.size;
      line.unitPrice = row.rental_price;
      line.subtotal = row.rental_price * days * line.quantity;
      line.securityDeposit = row.deposit_amount * line.quantity;
    } else if (item.type === "package") {
      line.people = integer(
        item.people ?? row.included_people ?? 1,
        row.included_people || 1,
        100,
        "Số người",
      );
      assert(
        Array.isArray(item.addons || []) && (item.addons || []).length <= 15,
        "Danh sách dịch vụ thêm chưa hợp lệ.",
      );
      const addonIds = [...new Set(item.addons || [])];
      const extras = addonIds.length
        ? (
            await client.query(
              "SELECT id,name,price FROM service_addons WHERE id=ANY($1::text[])",
              [addonIds],
            )
          ).rows
        : [];
      assert(
        extras.length === addonIds.length,
        "Dịch vụ thêm đã thay đổi, vui lòng chọn lại.",
        409,
      );
      line.addons = extras;
      line.unitPrice = row.base_price_per_person;
      line.subtotal =
        row.base_price_per_person * line.people +
        extras.reduce((s, a) => s + a.price, 0);
      line.advance = Math.min(
        row.deposit || Math.round(line.subtotal * 0.3),
        line.subtotal,
      );
    } else {
      line.unitPrice = row.price;
      line.subtotal = row.price;
      line.advance =
        row.price <= 200000 ? row.price : Math.round(row.price * 0.5);
    }
    assert(
      line.subtotal > 0 &&
        line.securityDeposit >= 0 &&
        Number.isSafeInteger(line.subtotal),
      "Giá dịch vụ cần được studio cập nhật.",
      409,
    );
    lines.push(line);
  }
  const scheduled = lines.filter((l) => l.type !== "costume");
  assert(
    scheduled.length <= 1,
    "Mỗi đơn chỉ đặt một gói chụp hoặc concept Photobooth.",
  );
  const slot = scheduled.length ? input.slot : "";
  if (scheduled.length)
    assert(
      SLOTS.includes(slot) && !slotPassed(input.date, slot, now),
      "Vui lòng chọn một ca chụp còn hiệu lực.",
    );
  const serviceTotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const securityDeposit = lines.reduce((s, l) => s + l.securityDeposit, 0);
  const advance = lines.reduce((s, l) => s + l.advance, 0);
  assert(
    securityDeposit + advance > 0,
    "Dịch vụ chưa được cấu hình khoản giữ chỗ. Vui lòng liên hệ studio.",
    409,
  );
  assert(
    serviceTotal + securityDeposit < 2_000_000_000,
    "Đơn hàng quá lớn, vui lòng liên hệ studio.",
  );
  return {
    lines,
    date: input.date,
    endDate: addDays(input.date, days),
    days,
    slot,
    resource:
      scheduled[0]?.type === "photobooth"
        ? "photobooth"
        : scheduled.length
          ? "studio"
          : null,
    serviceTotal,
    securityDeposit,
    advance,
    dueNow: securityDeposit + advance,
    totalPayable: serviceTotal + securityDeposit,
  };
}

const BOOKING_ACKNOWLEDGEMENT = Object.freeze({
  version: "booking-costs-v1",
  text: "Tôi đã xem chi phí và hiểu lịch được giữ 15 phút để hoàn tất khoản giữ chỗ.",
});

function serializeOrder(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email || "",
    serviceType: row.service_type,
    itemDetails: row.item_details,
    items: row.line_items || [],
    costumeIds: row.costume_ids || [],
    bookingDate: row.booking_date,
    startDate: row.start_date || row.booking_date,
    endDate: row.end_date,
    returnDate: row.return_date,
    rentalDays: row.rental_days,
    timeSlot: row.time_slot,
    totalAmount: Number(row.total_amount),
    securityDeposit: Number(row.security_deposit || 0),
    depositAmount: Number(row.deposit_amount),
    amountPaid: Number(row.amount_paid || 0),
    penaltyFee: Number(row.penalty_fee || 0),
    paymentStatus: row.payment_status,
    bookingStatus: row.booking_status,
    isReturned: row.is_returned,
    assignedPhotographer: row.assigned_photographer,
    assignedMakeup: row.assigned_makeup,
    notes: row.notes || "",
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    bookingAcknowledgement: row.booking_acknowledgement || null,
  };
}
module.exports = {
  SLOTS,
  HOLD_MINUTES,
  HttpError,
  assert,
  hash,
  vnDate,
  addDays,
  validDate,
  slotPassed,
  customerInput,
  quoteCheckout,
  serializeOrder,
  BOOKING_ACKNOWLEDGEMENT,
};
