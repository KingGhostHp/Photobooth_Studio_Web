const XLSX = require("xlsx");
const { vnDate, assert } = require("./domain");
const { asyncRoute } = require("./index");
const REAL_VISITS = "visitor_id NOT LIKE 'VISIT-%'";
async function summary(pool) {
  const currentMonth = vnDate().slice(0, 7);
  const { rows: orders } = await pool.query(
    `SELECT *,SUBSTRING(booking_date,1,7) AS month FROM orders`,
  );
  const { rows: visits } = await pool.query(
    `SELECT visited_month AS month,COUNT(*)::int AS count FROM visitor_logs WHERE ${REAL_VISITS} GROUP BY visited_month`,
  );
  const series = [];
  const now = new Date(`${currentMonth}-01T00:00:00Z`);
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setUTCMonth(now.getUTCMonth() - i);
    series.push({
      month: date.toISOString().slice(0, 7),
      totalRevenue: 0,
      totalDeposits: 0,
      totalVisitors: 0,
      totalOrdersCount: 0,
      rentalOrdersCount: 0,
      photoSlotsCount: 0,
    });
  }
  let totalRevenue = 0,
    totalDeposit = 0,
    cashReceived = 0,
    rentalOrdersCount = 0,
    photoSlotsCount = 0,
    activeOrdersCount = 0;
  for (const order of orders) {
    cashReceived += Number(order.amount_paid || 0);
    if (
      ["CANCELLED", "EXPIRED"].includes(order.booking_status) ||
      (["AWAITING_PAYMENT", "HOLD_15MIN"].includes(order.booking_status) &&
        Date.parse(order.expires_at || 0) <= Date.now())
    )
      continue;
    const paid = Number(order.amount_paid || 0);
    const security = Number(order.security_deposit || 0);
    const revenue = Math.max(
      0,
      Math.min(
        paid - security,
        Number(order.total_amount) + Number(order.penalty_fee || 0),
      ),
    );
    const rental =
      (order.line_items || []).some((l) => l.type === "costume") ||
      /Thuê|Trang Phục/.test(order.service_type || "");
    const photo =
      Boolean(order.time_slot) && !/^Sử dụng|^Thực hiện/.test(order.time_slot);
    totalRevenue += revenue;
    totalDeposit += Math.min(paid, security);
    rentalOrdersCount += rental ? 1 : 0;
    photoSlotsCount += photo ? 1 : 0;
    if (!["RETURNED", "COMPLETED"].includes(order.booking_status))
      activeOrdersCount++;
    const month = series.find((m) => m.month === order.month);
    if (month) {
      month.totalRevenue += revenue;
      month.totalDeposits += Math.min(paid, security);
      month.totalOrdersCount++;
      month.rentalOrdersCount += rental ? 1 : 0;
      month.photoSlotsCount += photo ? 1 : 0;
    }
  }
  for (const item of visits) {
    const month = series.find((m) => m.month === item.month);
    if (month) month.totalVisitors = item.count;
  }
  return {
    currentMonth,
    totalRevenue,
    totalDeposit,
    cashReceived,
    activeOrdersCount,
    rentalOrdersCount,
    photoSlotsCount,
    totalOrders: orders.length,
    totalVisitorsAllTime: visits.reduce((s, v) => s + v.count, 0),
    currentMonthVisitors:
      visits.find((v) => v.month === currentMonth)?.count || 0,
    monthlySeries: series,
  };
}
function registerAnalytics(app, pool) {
  app.post(
    "/api/analytics/track-visit",
    (req, res) => res.status(410).json({
      success: false,
      message: "Thống kê lượt truy cập đang tạm dừng.",
    }),
  );
  app.get(
    "/api/analytics/summary",
    asyncRoute(async (req, res) =>
      res.json({ success: true, data: await summary(pool) }),
    ),
  );
  app.post(
    "/api/analytics/save-snapshot",
    asyncRoute(async (req, res) => {
      const data = await summary(pool);
      const month = req.body.month || data.currentMonth;
      const item = data.monthlySeries.find((m) => m.month === month);
      assert(item, "Chỉ lưu snapshot trong sáu tháng đang hiển thị.");
      const {
        rows: [row],
      } = await pool.query(
        `INSERT INTO analytics_monthly_summaries(month,total_visitors,total_revenue,total_deposits,rental_orders_count,photo_slots_count,total_orders_count,ai_structured_data) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT(month) DO UPDATE SET total_visitors=$2,total_revenue=$3,total_deposits=$4,rental_orders_count=$5,photo_slots_count=$6,total_orders_count=$7,ai_structured_data=$8,updated_at=NOW() RETURNING *`,
        [
          month,
          item.totalVisitors,
          item.totalRevenue,
          item.totalDeposits,
          item.rentalOrdersCount,
          item.photoSlotsCount,
          item.totalOrdersCount,
          JSON.stringify({
            source: "verified-transactions",
            notes: String(req.body.customNotes || "").slice(0, 1000),
          }),
        ],
      );
      res.json({ success: true, data: row });
    }),
  );
  app.get(
    "/api/analytics/export-excel",
    asyncRoute(async (req, res) => {
      const data = await summary(pool);
      const { rows: orders } = await pool.query(
        "SELECT id,customer_name,phone,service_type,booking_date,time_slot,total_amount,security_deposit,amount_paid,penalty_fee,payment_status,booking_status FROM orders ORDER BY created_at DESC",
      );
      const { rows: payments } = await pool.query(
        "SELECT * FROM studio_payments ORDER BY created_at DESC",
      );
      const { rows: visits } = await pool.query(
        `SELECT visited_month AS month,COUNT(*)::int AS total_visits FROM visitor_logs WHERE ${REAL_VISITS} GROUP BY visited_month ORDER BY visited_month DESC`,
      );
      const workbook = XLSX.utils.book_new();
      for (const [name, rows] of [
        ["Tong_quan", data.monthlySeries],
        ["Don_hang", orders],
        ["Giao_dich", payments],
        ["Luot_truy_cap", visits],
      ])
        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.json_to_sheet(rows),
          name,
        );
      res.set(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.set(
        "Content-Disposition",
        'attachment; filename="Aura-Studio-Report.xlsx"',
      );
      res.send(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
    }),
  );
}
module.exports = { registerAnalytics, summary };
