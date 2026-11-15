import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Shirt,
  Camera,
  CalendarDays,
  Image,
  SlidersHorizontal,
  CreditCard,
  LogOut,
  ArrowUpRight,
  ArrowLeft,
  RefreshCw,
  Download,
  Search,
  Check,
  Eye,
  EyeOff,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { api, money, today, dateLabel, statusNames, stored, save } from "./api";
import { Button, Empty, ErrorState, Eyebrow, Modal } from "./UI";
import { OrderSummary } from "./Checkout";
import "./admin.css";
const Inventory = lazy(() => import("../components/admin/AdminInventory"));
const Pricing = lazy(() => import("../components/admin/AdminPricing"));
const Concepts = lazy(() => import("../components/admin/AdminPhotobooth"));
const Banners = lazy(() => import("../components/admin/AdminBanners"));
const Calendar = lazy(() => import("./Calendar"));
const menu = [
  ["dashboard", "Tổng quan", LayoutDashboard],
  ["orders", "Lịch hẹn & đơn hàng", ShoppingBag],
  ["calendar", "Lịch studio", CalendarDays],
  ["inventory", "Tủ trang phục", Shirt],
  ["photobooth", "Concept Photobooth", Camera],
  ["pricing", "Gói chụp & giá", SlidersHorizontal],
  ["cms", "Nội dung banner", Image],
  ["payment", "Tài khoản nhận tiền", CreditCard],
];
export default function Admin() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState(() => {
    const saved = stored("aura-admin-tab", "dashboard");
    return menu.some(([id]) => id === saved) ? saved : "dashboard";
  });
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobile, setMobile] = useState(false);
  const mobileMenuButton = useRef(null);
  const closeMobile = useCallback(() => {
    setMobile(false);
    mobileMenuButton.current?.focus();
  }, []);
  const [collapsed, setCollapsed] = useState(
    () => stored("aura-admin-sidebar-collapsed", false) === true,
  );
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    save("aura-admin-sidebar-collapsed", collapsed);
  }, [collapsed]);
  useEffect(() => {
    save("aura-admin-tab", tab);
  }, [tab]);
  useEffect(() => {
    if (!mobile) return;
    const close = (event) => {
      if (event.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [mobile, closeMobile]);
  useEffect(() => {
    api("/auth/session")
      .then(setSession)
      .catch((e) => setError(e.message));
  }, []);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api("/admin/orders");
      setOrders(r.data);
      setError("");
    } catch (e) {
      if (e.status === 401)
        setSession({ authenticated: false, configured: true });
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (session?.authenticated) load();
  }, [session, load]);
  const update = async (order) => {
    const r = await api(`/admin/orders/${order.id}`, {
      method: "PATCH",
      body: order,
    });
    setOrders((all) => all.map((o) => (o.id === r.data.id ? r.data : o)));
    setNotice("Đã cập nhật lịch hẹn.");
    return r.data;
  };
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(id);
  }, [notice]);
  if (!session)
    return (
      <div className="loading-screen">
        {error ? (
          <ErrorState error={error} retry={() => window.location.reload()} />
        ) : (
          "Đang mở studio…"
        )}
      </div>
    );
  if (!session.authenticated)
    return (
      <Login
        configured={session.configured}
        onLogin={() => setSession({ authenticated: true, configured: true })}
      />
    );
  const label = menu.find((m) => m[0] === tab)?.[1];
  return (
    <div className={`admin-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${mobile ? "open" : ""}`}
      >
        <div className="admin-sidebar-heading">
          <a
            href="#/"
            className="wordmark"
            aria-label="Aura Studio, mở website"
          >
            <span className="sidebar-brand-full">
              aura<span>✳</span>
              <small>QUẢN TRỊ STUDIO</small>
            </span>
            <span className="sidebar-brand-mini" aria-hidden="true">
              a.
            </span>
          </a>
          <button
            type="button"
            className="icon-button admin-mobile-close"
            aria-label="Đóng menu quản trị"
            onClick={closeMobile}
          >
            <X size={18} />
          </button>
        </div>
        <nav aria-label="Quản trị" tabIndex="0">
          {menu.map(([id, title, Icon]) => (
            <button
              key={id}
              className={id === tab ? "active" : ""}
              aria-label={title}
              aria-current={id === tab ? "page" : undefined}
              title={title}
              onClick={() => {
                setTab(id);
                if (mobile) closeMobile();
              }}
            >
              <Icon size={17} />
              <span className="admin-nav-label">{title}</span>
              {id === "orders" &&
                orders.filter((o) => o.bookingStatus === "AWAITING_PAYMENT")
                  .length > 0 && (
                  <span className="admin-nav-count">
                    {
                      orders.filter(
                        (o) => o.bookingStatus === "AWAITING_PAYMENT",
                      ).length
                    }
                  </span>
                )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="#/" aria-label="Mở website" title="Mở website">
            <ArrowUpRight size={16} />
            <span className="admin-nav-label">Mở website</span>
          </a>
          <button
            aria-label="Đăng xuất"
            title="Đăng xuất"
            onClick={async () => {
              await api("/auth/logout", { method: "POST" });
              setSession({ authenticated: false, configured: true });
            }}
          >
            <LogOut size={16} />
            <span className="admin-nav-label">Đăng xuất</span>
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="admin-mobile-overlay"
          onClick={closeMobile}
          aria-label="Đóng menu"
        />
      )}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="icon-button admin-desktop-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={
              collapsed ? "Mở rộng menu quản trị" : "Thu gọn menu quản trị"
            }
            aria-expanded={!collapsed}
            aria-controls="admin-sidebar"
            title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}
          </button>
          <button
            className="icon-button mobile-menu"
            ref={mobileMenuButton}
            onClick={() => setMobile(!mobile)}
            aria-label={mobile ? "Đóng menu quản trị" : "Mở menu quản trị"}
            aria-expanded={mobile}
            aria-controls="admin-sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="admin-breadcrumb">
            Quản trị <span>/</span> {label}
          </div>
          <div>
            <span className="admin-today">{dateLabel(today())}</span>
            <span className="admin-avatar">AD</span>
          </div>
        </header>
        <main id="main-content" tabIndex="-1" className="admin-content">
          <div className="admin-page-heading">
            <div>
              <h1>{label}</h1>
            </div>
            <button
              className="button button-outline button-small"
              onClick={() => {
                load();
                setRefreshKey((key) => key + 1);
              }}
              disabled={loading}
            >
              <RefreshCw size={15} className={loading ? "spin" : ""} />
              Làm mới
            </button>
          </div>
          {error && <ErrorState error={error} retry={load} />}
          <Suspense
            key={tab}
            fallback={
              <div className="loading-screen">Đang chuẩn bị màn hình…</div>
            }
          >
            {tab === "dashboard" ? (
              <Dashboard orders={orders} onOrders={() => setTab("orders")} />
            ) : tab === "orders" ? (
              <Orders orders={orders} onUpdate={update} onRefresh={load} />
            ) : tab === "calendar" ? (
              <div className="legacy-admin admin-calendar-module">
                <Calendar
                  orders={orders}
                  onUpdateOrder={update}
                  onRefreshOrders={load}
                />
              </div>
            ) : tab === "inventory" ? (
              <div className="legacy-admin admin-inventory-module">
                <Inventory refreshKey={refreshKey} />
              </div>
            ) : tab === "photobooth" ? (
              <div className="legacy-admin admin-concepts-module">
                <Concepts refreshKey={refreshKey} />
              </div>
            ) : tab === "pricing" ? (
              <div className="legacy-admin admin-pricing-module">
                <Pricing refreshKey={refreshKey} />
              </div>
            ) : tab === "cms" ? (
              <div className="legacy-admin admin-banners-module">
                <Banners refreshKey={refreshKey} />
              </div>
            ) : (
              <PaymentSettings />
            )}
          </Suspense>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
        </div>
      )}
    </div>
  );
}
function Login({ configured, onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/auth/login", {
        method: "POST",
        body: { username, password },
      });
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="login-page">
      <a href="#/" className="wordmark">
        aura<span>✳</span>
        <small>STUDIO & WARDROBE</small>
      </a>
      <div className="login-card">
        <Eyebrow>THE STUDIO DESK</Eyebrow>
        <h1>
          Mọi thứ,
          <br />
          <i>trong tầm nhìn.</i>
        </h1>
        <p>
          Đăng nhập để quản lý những cuộc hẹn, bộ sưu tập và hoạt động của
          studio.
        </p>
        <form onSubmit={submit}>
          <label className="field">
            Tài khoản
            <input
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="field">
            Mật khẩu
            <div className="password-field">
              <input
                autoComplete="current-password"
                required
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {!configured && (
            <p className="inline-error">
              Chủ studio cần thiết lập tài khoản quản trị trong cấu hình máy
              chủ.
            </p>
          )}
          {error && (
            <p role="alert" className="inline-error">
              {error}
            </p>
          )}
          <Button type="submit" busy={busy} disabled={!configured}>
            Đăng nhập studio <ArrowUpRight size={17} />
          </Button>
        </form>
        <a href="#/" className="text-link">
          <ArrowLeft size={15} />
          Trở về website
        </a>
      </div>
      <span className="login-decoration">a.</span>
    </div>
  );
}
function Dashboard({ orders, onOrders }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const load = useCallback(
    () =>
      api("/analytics/summary")
        .then((r) => {
          setData(r.data);
          setError("");
        })
        .catch((e) => setError(e.message)),
    [],
  );
  useEffect(() => {
    load();
  }, [orders, load]);
  const download = async () => {
    setExporting(true);
    try {
      const r = await fetch("/api/analytics/export-excel");
      if (!r.ok) throw Error("Không thể xuất báo cáo.");
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `Aura-Studio-${today()}.xlsx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  };
  if (error) return <ErrorState error={error} retry={load} />;
  if (!data)
    return <div className="loading-screen">Đang tổng hợp dữ liệu…</div>;
  const stats = [
    [
      "Doanh thu đã nhận",
      money(data.totalRevenue),
      "Không bao gồm cọc bảo đảm",
      "↗",
    ],
    [
      "Lịch hẹn đang mở",
      data.activeOrdersCount,
      "Đang giữ chỗ hoặc đã xác nhận",
      "◷",
    ],
    [
      "Cọc bảo đảm đã nhận",
      money(data.totalDeposit),
      "Theo các đơn còn hiệu lực",
      "◇",
    ],
    [
      "Lượt ghé thăm",
      data.currentMonthVisitors,
      "Dữ liệu cũ · đang tạm dừng thống kê mới",
      "✳",
    ],
  ];
  const max = Math.max(...data.monthlySeries.map((m) => m.totalRevenue), 1);
  return (
    <>
      <div className="stat-grid">
        {stats.map(([label, value, note, icon]) => (
          <article key={label} className="stat-card">
            <div>
              <span>{label}</span>
              <span>{icon}</span>
            </div>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <h2>Nhịp hoạt động của studio</h2>
              <p>Khoản dịch vụ đã nhận · theo tháng sử dụng</p>
            </div>
            <Button
              className="button-outline button-small"
              busy={exporting}
              onClick={download}
            >
              <Download size={15} />
              Xuất báo cáo
            </Button>
          </div>
          <div className="revenue-chart">
            {data.monthlySeries.map((m) => (
              <div key={m.month}>
                <span>{money(m.totalRevenue)}</span>
                <div className="bar-track">
                  <div
                    style={{
                      height: `${Math.max((m.totalRevenue / max) * 100, m.totalRevenue ? 3 : 0)}%`,
                    }}
                  />
                </div>
                <small>T{Number(m.month.slice(5))}</small>
              </div>
            ))}
          </div>
          {!data.totalRevenue && (
            <p className="chart-note">
              Chưa có khoản dịch vụ được xác nhận. Biểu đồ sẽ cập nhật khi có
              giao dịch.
            </p>
          )}
        </section>
        <section className="admin-panel today-panel">
          <h2>Hôm nay tại Aura</h2>
          <strong className="today-count">
            {
              orders.filter(
                (o) =>
                  o.bookingDate === today() &&
                  !["CANCELLED", "EXPIRED"].includes(o.bookingStatus),
              ).length
            }
            <span>cuộc hẹn</span>
          </strong>

          <Button onClick={onOrders}>
            Xem danh sách <ArrowUpRight size={16} />
          </Button>
        </section>
      </div>
      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <h2>Những lịch hẹn mới</h2>
          </div>
          <button className="text-link" onClick={onOrders}>
            Tất cả lịch hẹn <ArrowUpRight size={15} />
          </button>
        </div>
        {orders.length ? (
          <OrderTable orders={orders.slice(0, 5)} onSelect={onOrders} />
        ) : (
          <p className="admin-empty">
            Chưa có lịch hẹn. Đơn mới từ website sẽ xuất hiện tại đây.
          </p>
        )}
      </section>
    </>
  );
}
function OrderTable({ orders, onSelect }) {
  return (
    <div className="table-scroll">
      <table className="studio-table">
        <thead>
          <tr>
            <th>Lịch hẹn / Khách hàng</th>
            <th>Ngày sử dụng</th>
            <th>Giá trị dịch vụ</th>
            <th>Đã nhận</th>
            <th>Trạng thái</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <strong>{o.customerName}</strong>
                <small>{o.id}</small>
              </td>
              <td>
                {dateLabel(o.bookingDate)}
                <small>{o.timeSlot || `${o.rentalDays} ngày thuê`}</small>
              </td>
              <td>
                {money(o.totalAmount + o.penaltyFee)}
                {o.securityDeposit > 0 && (
                  <small>+ {money(o.securityDeposit)} cọc bảo đảm</small>
                )}
              </td>
              <td>{money(o.amountPaid)}</td>
              <td>
                <span
                  className={`studio-badge ${o.bookingStatus === "CONFIRMED" ? "success" : ["EXPIRED", "CANCELLED"].includes(o.bookingStatus) ? "muted-badge" : ""}`}
                >
                  {statusNames[o.bookingStatus] || o.bookingStatus}
                </span>
              </td>
              <td>
                <button
                  onClick={() => onSelect(o)}
                  className="icon-button"
                  aria-label={`Chi tiết đơn ${o.id}`}
                >
                  <ArrowUpRight size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Orders({ orders, onUpdate, onRefresh }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const filtered = orders.filter(
    (o) =>
      (filter === "all" || o.bookingStatus === filter) &&
      `${o.id} ${o.customerName} ${o.phone}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <section className="admin-panel">
        <div className="order-toolbar">
          <label className="search-input">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm mã đơn, tên hoặc số điện thoại…"
              aria-label="Tìm đơn hàng"
            />
          </label>
          <select
            aria-label="Lọc trạng thái đơn"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Mọi trạng thái</option>
            {[
              "AWAITING_PAYMENT",
              "CONFIRMED",
              "COMPLETED",
              "RETURNED",
              "CANCELLED",
              "EXPIRED",
            ].map((s) => (
              <option value={s} key={s}>
                {statusNames[s]}
              </option>
            ))}
          </select>
          <span className="muted">{filtered.length} lịch hẹn</span>
        </div>
        {filtered.length ? (
          <OrderTable orders={filtered} onSelect={setSelected} />
        ) : (
          <Empty title="Chưa có lịch hẹn phù hợp">
            Thử một bộ lọc khác hoặc chờ đơn mới từ website.
          </Empty>
        )}
      </section>
      {selected && (
        <OrderEditor
          key={selected.id}
          order={selected}
          onClose={() => setSelected(null)}
          onUpdate={onUpdate}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}
function OrderEditor({ order: initial, onClose, onUpdate, onRefresh }) {
  const [order, setOrder] = useState(initial);
  const [notes, setNotes] = useState(initial.notes);
  const [photographer, setPhotographer] = useState(
    initial.assignedPhotographer || "",
  );
  const [makeup, setMakeup] = useState(initial.assignedMakeup || "");
  const [penalty, setPenalty] = useState(initial.penaltyFee);
  const [status, setStatus] = useState(initial.bookingStatus);
  const [amount, setAmount] = useState(
    Math.max(0, initial.depositAmount - initial.amountPaid),
  );
  const [payId, setPayId] = useState(crypto.randomUUID);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const saveOrder = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const updated = await onUpdate({
        id: order.id,
        notes,
        penaltyFee: Number(penalty),
        bookingStatus: status,
        assignedPhotographer: photographer,
        assignedMakeup: makeup,
      });
      setOrder(updated);
      setMessage("Đã lưu thông tin lịch hẹn.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const payment = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api(`/admin/orders/${order.id}/payment`, {
        method: "POST",
        body: { amount: Number(amount), transactionId: payId },
      });
      setOrder(r.order);
      setStatus(r.order.bookingStatus);
      setPayId(crypto.randomUUID());
      setAmount(0);
      await onRefresh();
      setMessage(
        r.reviewRequired
          ? "Đã ghi nhận khoản tiền. Đơn đã hết hạn/hủy cần được studio xử lý riêng."
          : "Đã ghi nhận giao dịch và cập nhật trạng thái.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Chi tiết lịch hẹn" onClose={onClose} wide>
      <div className="order-editor-grid">
        <div>
          <OrderSummary order={order} />
          <form onSubmit={payment} className="manual-payment">
            <h3>Xác nhận tiền đã nhận</h3>
            <p>
              Chỉ ghi nhận sau khi đã kiểm tra giao dịch thực tế. Mỗi lần xác
              nhận được lưu trong sổ giao dịch.
            </p>
            <label className="field">
              Số tiền nhận thêm
              <input
                required
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <Button
              type="submit"
              className="button-outline"
              busy={busy}
              disabled={Number(amount) <= 0}
            >
              <Check size={16} />
              Xác nhận giao dịch
            </Button>
          </form>
        </div>
        <form onSubmit={saveOrder}>
          <label className="field">
            Trạng thái lịch hẹn
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {[
                "AWAITING_PAYMENT",
                "CONFIRMED",
                "COMPLETED",
                "RETURNED",
                "CANCELLED",
                "EXPIRED",
              ].map((s) => (
                <option value={s} key={s}>
                  {statusNames[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Nhiếp ảnh gia
            <input
              value={photographer}
              onChange={(e) => setPhotographer(e.target.value)}
              placeholder="Tên người phụ trách"
            />
          </label>
          <label className="field">
            Makeup / stylist
            <input
              value={makeup}
              onChange={(e) => setMakeup(e.target.value)}
              placeholder="Tên người phụ trách"
            />
          </label>
          <label className="field">
            Tổng phụ phí phát sinh
            <input
              type="number"
              min="0"
              max="100000000"
              step="1"
              value={penalty}
              onChange={(e) => setPenalty(e.target.value)}
            />
          </label>
          <label className="field">
            Ghi chú
            <textarea
              rows="4"
              maxLength="2000"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <Button type="submit" busy={busy}>
            Lưu thay đổi <Check size={16} />
          </Button>
        </form>
      </div>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="inline-success" role="status">
          {message}
        </p>
      )}
    </Modal>
  );
}
function PaymentSettings() {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    api("/payment/bank-config")
      .then((r) => setConfig(r.data))
      .catch((e) => setError(e.message));
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      await api("/payment/bank-config", { method: "PUT", body: config });
      setSaved(true);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const upload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 3 * 1024 * 1024) {
      setError("Chọn ảnh QR dưới 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setConfig({
        ...config,
        customQrImage: reader.result,
        qrType: "custom_image",
      });
    reader.readAsDataURL(file);
  };
  return (
    <section className="admin-panel payment-settings">
      {config ? (
        <form onSubmit={submit}>
          <Eyebrow>PAYMENT DETAILS</Eyebrow>
          <h2>Tài khoản nhận tiền của studio</h2>
          <p className="muted">
            Thông tin này được dùng để tạo QR cho lịch hẹn. Kiểm tra kỹ trước
            khi lưu.
          </p>
          <div className="form-grid">
            {[
              ["bankName", "Tên ngân hàng"],
              ["bankCode", "Mã ngân hàng"],
              ["bankBin", "Mã BIN ngân hàng"],
              ["accountNumber", "Số tài khoản"],
              ["accountHolder", "Chủ tài khoản"],
            ].map(([key, label]) => (
              <label className="field" key={key}>
                {label}
                <input
                  required
                  maxLength="100"
                  value={config[key] || ""}
                  onChange={(e) =>
                    setConfig({ ...config, [key]: e.target.value })
                  }
                />
              </label>
            ))}
            <label className="field">
              Loại mã QR
              <select
                value={config.qrType}
                onChange={(e) =>
                  setConfig({ ...config, qrType: e.target.value })
                }
              >
                <option value="dynamic">VietQR qua SePay theo mã đơn và số tiền</option>
                <option value="custom_image">Ảnh QR của studio</option>
              </select>
            </label>
          </div>
          {config.qrType === "custom_image" && (
            <label className="field">
              Ảnh QR
              <input type="file" accept="image/*" onChange={upload} />
              {config.customQrImage && (
                <img
                  className="payment-qr"
                  src={config.customQrImage}
                  alt="QR tài khoản studio"
                />
              )}
            </label>
          )}
          <label className="consent">
            <input
              type="checkbox"
              checked={config.isAutoConfirmEnabled}
              onChange={(e) =>
                setConfig({ ...config, isAutoConfirmEnabled: e.target.checked })
              }
            />
            <span>
              Tự xác nhận lịch khi webhook đã xác thực báo nhận đủ khoản giữ
              chỗ.
            </span>
          </label>
          <p className="muted">
            Kết nối ngân hàng và khóa xác thực webhook cần được cấu hình trên
            máy chủ. Giao dịch đến sau khi lịch hết hạn sẽ được lưu để studio
            kiểm tra.
          </p>
          <Button type="submit" busy={busy}>
            Lưu tài khoản nhận tiền <Check size={16} />
          </Button>
          {saved && (
            <p className="inline-success" role="status">
              Đã lưu cấu hình.
            </p>
          )}
        </form>
      ) : (
        !error && <p>Đang tải cấu hình…</p>
      )}
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
