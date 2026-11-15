import { useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import { api } from "./api";
import { Button, Eyebrow } from "./UI";
import { OrderSummary } from "./Checkout";
export default function Lookup() {
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      const r = await api("/lookup", { method: "POST", body: { id, phone } });
      setOrder(r.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page-space lookup-layout">
      <div className="page-heading">
        <Eyebrow>YOUR NEXT MOMENT</Eyebrow>
        <h1>
          Cuộc hẹn
          <br />
          <i>của bạn.</i>
        </h1>
        <p>
          Kiểm tra lịch hẹn, thông tin dịch vụ và trạng thái thanh toán bằng mã
          đơn cùng số điện thoại đã đặt.
        </p>
        <a
          href="https://zalo.me/0975397923"
          className="text-link"
          target="_blank"
          rel="noreferrer"
        >
          Cần Aura hỗ trợ? <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="lookup-card">
        <form onSubmit={submit}>
          <h2>Tìm lại lịch hẹn</h2>
          <label className="field">
            Mã đơn hàng
            <input
              required
              placeholder="AUR-YYYYMMDD-XXXXXXXX"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoCapitalize="characters"
            />
          </label>
          <label className="field">
            Số điện thoại đã đặt
            <input
              required
              type="tel"
              placeholder="09xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <Button type="submit" busy={busy}>
            Tra cứu lịch hẹn <Search size={17} />
          </Button>
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
        </form>
        {order && (
          <div className="lookup-result">
            <OrderSummary order={order} />
            <p className="muted">
              Muốn thay đổi hoặc cần xử lý khoản đã thanh toán? Vui lòng liên hệ
              studio và cung cấp mã lịch hẹn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
