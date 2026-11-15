import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  CalendarDays,
} from "lucide-react";
import {
  api,
  money,
  today,
  dateLabel,
  stored,
  save,
  imageFallback,
  statusNames,
} from "./api";
import { Modal, Button, Empty, Eyebrow } from "./UI";
import { Dropdown } from "./Dropdown";
import { DatePicker } from "./DatePicker";
import { addDays } from "./date-utils";

export function OrderSummary({ order }) {
  const total = order.totalAmount + order.securityDeposit + order.penaltyFee;
  return (
    <>
      <div className="order-ticket">
        <div>
          <span>MÃ LỊCH HẸN</span>
          <strong>{order.id}</strong>
        </div>
        <span
          className={`studio-badge ${order.bookingStatus === "CONFIRMED" ? "success" : ""}`}
        >
          {statusNames[order.bookingStatus] || order.bookingStatus}
        </span>
      </div>
      <div className="receipt-details">
        <p>
          <CalendarDays size={16} />
          {dateLabel(order.bookingDate)}{" "}
          {order.timeSlot && `· ${order.timeSlot}`}
        </p>
        <p>
          {order.customerName} · {order.phone}
        </p>
        <p>{order.itemDetails}</p>
      </div>
      <div className="price-summary">
        <div>
          <span>Chi phí dịch vụ</span>
          <strong>{money(order.totalAmount)}</strong>
        </div>
        {order.securityDeposit > 0 && (
          <div>
            <span>Cọc bảo đảm hoàn lại</span>
            <strong>{money(order.securityDeposit)}</strong>
          </div>
        )}
        {order.penaltyFee > 0 && (
          <div>
            <span>Phụ phí</span>
            <strong>{money(order.penaltyFee)}</strong>
          </div>
        )}
        <div>
          <span>Đã ghi nhận</span>
          <strong>{money(order.amountPaid)}</strong>
        </div>
        <div className="summary-total">
          <span>Còn thanh toán</span>
          <strong>{money(Math.max(0, total - order.amountPaid))}</strong>
        </div>
      </div>
    </>
  );
}
export default function Checkout({ items, onChange, onClose, onDone }) {
  const [date, setDate] = useState(today);
  const [days, setDays] = useState(1);
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState([]);
  const [quote, setQuote] = useState(null);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [consent, setConsent] = useState(false);
  const [ticket, setTicket] = useState(() =>
    stored("aura-active-checkout", null),
  );
  const [order, setOrder] = useState(null);
  const [bank, setBank] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [statusError, setStatusError] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(false);
  const request = useRef({ id: crypto.randomUUID(), payload: "" });
  const scheduled = items.find((i) => i.type !== "costume");
  const resource = scheduled?.type === "photobooth" ? "photobooth" : "studio";
  const hasRental = items.some((i) => i.type === "costume");
  const hasScheduled = Boolean(scheduled);
  const itemCount = items.length;
  const payload = {
    date,
    days: hasRental ? Number(days) : 1,
    slot: scheduled ? slot : "",
    items: items.map((i) => ({
      type: i.type,
      id: i.id,
      size: i.size,
      quantity: i.quantity,
      people: i.people,
      addons: i.addons,
    })),
  };
  const payloadKey = JSON.stringify(payload);
  useEffect(() => {
    const ctrl = new AbortController();
    api("/payment/bank-config", { signal: ctrl.signal })
      .then((r) => setBank(r.data))
      .catch((e) => {
        if (e.name !== "AbortError") setStatusError(e.message);
      });
    return () => ctrl.abort();
  }, []);
  useEffect(() => {
    if (!hasScheduled || ticket) return;
    const ctrl = new AbortController();
    setSlots([]);
    api(`/availability?date=${date}&resource=${resource}`, {
      signal: ctrl.signal,
    })
      .then((r) => setSlots(r.data))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => ctrl.abort();
  }, [date, resource, hasScheduled, ticket]);
  useEffect(() => {
    setConsent(false);
    if (ticket || !itemCount) return;
    setQuote(null);
    setError("");
    setQuoteBusy(false);
    if (hasScheduled && !slot) return;
    const ctrl = new AbortController();
    setQuoteBusy(true);
    const timeout = setTimeout(
      () =>
        api("/checkout/quote", {
          method: "POST",
          body: JSON.parse(payloadKey),
          signal: ctrl.signal,
        })
          .then((r) => setQuote(r.data))
          .catch((e) => {
            if (e.name !== "AbortError") setError(e.message);
          })
          .finally(() => {
            if (!ctrl.signal.aborted) setQuoteBusy(false);
          }),
      350,
    );
    return () => {
      clearTimeout(timeout);
      ctrl.abort();
    };
  }, [payloadKey, ticket, hasScheduled, itemCount, slot]);
  const refresh = useCallback(async () => {
    if (!ticket) return;
    try {
      const r = await api(`/checkout/${ticket.id}`, {
        headers: { "X-Checkout-Token": ticket.token },
      });
      setOrder(r.data);
      setStatusError("");
    } catch (e) {
      setStatusError(e.message);
    }
  }, [ticket]);
  useEffect(() => {
    if (!ticket) return;
    refresh();
    const interval = setInterval(refresh, 4000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(clock);
    };
  }, [ticket, refresh]);
  const submit = async (event) => {
    event.preventDefault();
    if (!quote?.bookingAcknowledgement || busy || !consent) return;
    setBusy(true);
    setError("");
    try {
      const body = { ...payload, customer, bookingAcknowledgement: {
        accepted: true, version: quote.bookingAcknowledgement.version,
      } };
      const signature = JSON.stringify(body);
      if (request.current.payload !== signature)
        request.current = { id: crypto.randomUUID(), payload: signature };
      const r = await api("/checkout", {
        method: "POST",
        body: { ...body, requestId: request.current.id },
      });
      const next = { id: r.data.id, token: r.checkoutToken };
      save("aura-active-checkout", next);
      setTicket(next);
      setOrder(r.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => {
    setBusy(true);
    try {
      const result = await api(`/checkout/${ticket.id}/cancel`, {
        method: "POST",
        headers: { "X-Checkout-Token": ticket.token },
      });
      setOrder(result.data);
    } catch (e) {
      setStatusError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const finish = () => {
    save("aura-active-checkout", null);
    onDone();
    onClose();
  };
  const reset = () => {
    save("aura-active-checkout", null);
    setTicket(null);
    setOrder(null);
    setError("");
    setStatusError("");
  };
  const expired =
    order &&
    (["EXPIRED", "CANCELLED"].includes(order.bookingStatus) ||
      (order.bookingStatus === "AWAITING_PAYMENT" &&
        Date.parse(order.expiresAt) <= now));
  const paid =
    order &&
    ["CONFIRMED", "RETURNED", "COMPLETED"].includes(order.bookingStatus);
  const seconds = order
    ? Math.max(0, Math.floor((Date.parse(order.expiresAt) - now) / 1000))
    : 0;
  const remainingDeposit = order
    ? Math.max(0, order.depositAmount - order.amountPaid)
    : 0;
  const syntax = order ? `AURA ${order.id.replaceAll("-", "")}` : "";
  const qr =
    bank && order
      ? bank.qrType === "custom_image" && bank.customQrImage
        ? bank.customQrImage
        : `https://img.vietqr.io/image/${bank.bankBin}-${bank.accountNumber}-${bank.qrTemplate || "compact2"}.svg?accountName=${encodeURIComponent(bank.accountHolder)}&amount=${remainingDeposit}&addInfo=${encodeURIComponent(syntax)}`
      : null;
  return (
    <Modal
      title={ticket ? "Lịch hẹn của bạn" : "Giỏ dịch vụ"}
      onClose={onClose}
      drawer
    >
      {ticket ? (
        <div className="reservation-view">
          {order ? (
            <>
              <div className={`reservation-banner ${paid ? "confirmed" : ""}`}>
                <span>
                  {paid ? <CheckCircle2 size={30} /> : <Clock size={30} />}
                </span>
                <div>
                  <h3>
                    {paid
                      ? "Cuộc hẹn đã được xác nhận"
                      : expired
                        ? "Thời gian giữ chỗ đã kết thúc"
                        : "Đã giữ chỗ cho bạn"}
                  </h3>
                  <p>
                    {paid
                      ? "Hẹn gặp bạn tại Aura. Hãy lưu lại mã lịch hẹn bên dưới."
                      : expired
                        ? "Bạn có thể đặt lại theo lịch trống mới nhất."
                        : `Hoàn tất khoản giữ chỗ trong ${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}.`}
                  </p>
                </div>
              </div>
              <OrderSummary order={order} />
              {!paid && !expired && (
                <>
                  <div className="payment-box">
                    <p className="eyebrow">KHOẢN CẦN THANH TOÁN ĐỂ GIỮ CHỖ</p>
                    <strong className="payment-amount">
                      {remainingDeposit
                        ? money(remainingDeposit)
                        : "Đã nhận đủ khoản giữ chỗ"}
                    </strong>
                    {remainingDeposit > 0 &&
                      (qr && !qrError ? (
                        <img
                          className="payment-qr"
                          src={qr}
                          alt="QR chuyển khoản giữ chỗ"
                          onError={() => setQrError(true)}
                        />
                      ) : (
                        <p className="muted">
                          {qrError
                            ? "QR chưa tải được. Bạn có thể chuyển khoản theo thông tin bên dưới."
                            : "Đang tải thông tin tài khoản…"}
                        </p>
                      ))}
                    {bank && (
                      <div className="bank-details">
                        <span>{bank.bankName}</span>
                        <strong>{bank.accountNumber}</strong>
                        <span>{bank.accountHolder}</span>
                      </div>
                    )}
                    <button
                      className="copy-reference"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(syntax);
                          setCopied(true);
                        } catch {
                          setStatusError(
                            "Hãy sao chép mã đơn hiển thị bên dưới.",
                          );
                        }
                      }}
                    >
                      <span>{syntax}</span>
                      <Copy size={15} />
                      {copied && <small>Đã sao chép</small>}
                    </button>
                    <p className="muted">
                      {remainingDeposit
                        ? "Chuyển đúng số tiền và nội dung. Trạng thái chỉ đổi sau khi studio hoặc hệ thống ngân hàng xác nhận nhận tiền."
                        : "Studio đã ghi nhận khoản tiền và đang kiểm tra lịch. Bạn không cần chuyển thêm khoản giữ chỗ."}
                    </p>
                    <Button className="button-outline" onClick={refresh}>
                      <RefreshCw size={16} />
                      Kiểm tra trạng thái
                    </Button>
                  </div>
                  {!order.amountPaid && (
                    <button
                      className="quiet-button danger-text"
                      disabled={busy}
                      onClick={cancel}
                    >
                      Hủy giữ chỗ này
                    </button>
                  )}
                </>
              )}
              {statusError && (
                <p className="inline-error" role="alert">
                  {statusError}
                </p>
              )}
              {paid ? (
                <Button onClick={finish}>
                  Lưu lịch hẹn & hoàn tất <CheckCircle2 size={17} />
                </Button>
              ) : expired ? (
                <Button onClick={reset}>
                  Chọn lại lịch trống <ArrowRight size={17} />
                </Button>
              ) : (
                <p className="muted">
                  Bạn có thể đóng cửa sổ và mở lại giỏ để tiếp tục. Việc đóng
                  cửa sổ không hủy đơn.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="loading-screen">Đang tải lịch hẹn…</div>
              {statusError && (
                <>
                  <p role="alert" className="inline-error">
                    {statusError}
                  </p>
                  <Button className="button-outline" onClick={reset}>
                    Quay lại giỏ dịch vụ
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      ) : !items.length ? (
        <Empty
          title="Một câu chuyện đang chờ bắt đầu"
          action={
            <Button
              onClick={() => {
                onClose();
                window.location.hash = "/costumes";
              }}
            >
              Khám phá tủ đồ <ArrowRight size={17} />
            </Button>
          }
        >
          Thêm một thiết kế hoặc một trải nghiệm yêu thích vào đây nhé.
        </Empty>
      ) : (
        <form onSubmit={submit} className="checkout-form">
          <div className="checkout-items">
            {items.map((item) => (
              <div className="checkout-item" key={item.key}>
                <img src={item.image} alt={item.name} onError={imageFallback} />
                <div>
                  <small>
                    {item.type === "costume"
                      ? "THUÊ TRANG PHỤC"
                      : item.type === "package"
                        ? "GÓI CHỤP"
                        : "PHOTOBOOTH"}
                  </small>
                  <strong>{item.name}</strong>
                  <span>
                    {item.size
                      ? `Size ${item.size}`
                      : item.people
                        ? `${item.people} người`
                        : "Đặt ca chụp"}
                  </span>
                  {item.type === "costume" && (
                    <div className="quantity-control">
                      <button
                        type="button"
                        aria-label="Giảm số lượng"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          onChange(
                            items.map((i) =>
                              i.key === item.key
                                ? { ...i, quantity: i.quantity - 1 }
                                : i,
                            ),
                          )
                        }
                      >
                        <Minus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Tăng số lượng"
                        disabled={item.quantity >= 20}
                        onClick={() =>
                          onChange(
                            items.map((i) =>
                              i.key === item.key
                                ? { ...i, quantity: i.quantity + 1 }
                                : i,
                            ),
                          )
                        }
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Bỏ ${item.name} khỏi giỏ`}
                  onClick={() =>
                    onChange(items.filter((i) => i.key !== item.key))
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
          <div className="checkout-section">
            <Eyebrow>01 / CHỌN NGÀY CỦA BẠN</Eyebrow>
            <div className="form-grid">
              <div className="field">
                <span>{hasRental ? "Ngày nhận trang phục" : "Ngày chụp"}</span>
                <DatePicker
                  label={hasRental ? "Ngày nhận trang phục" : "Ngày chụp"}
                  min={today()}
                  max={addDays(today(), 365)}
                  value={date}
                  onChange={(value) => {
                    setDate(value);
                    setSlot("");
                  }}
                />
              </div>
              {hasRental && (
                <div className="field">
                  <span>Số ngày thuê</span>
                  <Dropdown
                    label="Số ngày thuê"
                    value={days}
                    onChange={setDays}
                    options={[1, 2, 3, 4, 5, 7, 10, 14, 30].map((d) => ({ value: d, label: `${d} ngày` }))}
                  />
                </div>
              )}
            </div>
            {scheduled && (
              <div className="checkout-slots">
                <p className="field-label">
                  Ca {resource === "photobooth" ? "Photobooth" : "chụp studio"}
                </p>
                <div>
                  {slots.map((s) => (
                    <button
                      type="button"
                      key={s.time}
                      disabled={!s.available}
                      aria-pressed={slot === s.time}
                      className={slot === s.time ? "selected" : ""}
                      onClick={() => setSlot(s.time)}
                    >
                      {s.time}
                      <small>
                        {s.available ? "Còn trống" : "Không khả dụng"}
                      </small>
                    </button>
                  ))}
                </div>
                {!slots.length && <p className="muted">Đang kiểm tra lịch…</p>}
              </div>
            )}
          </div>
          <div className="checkout-section">
            <Eyebrow>02 / THÔNG TIN LỊCH HẸN</Eyebrow>
            <label className="field">
              Họ và tên
              <input
                required
                autoComplete="name"
                minLength="2"
                maxLength="100"
                placeholder="Tên bạn là…"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />
            </label>
            <div className="form-grid">
              <label className="field">
                Số điện thoại
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  placeholder="09xx xxx xxx"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                />
              </label>
              <label className="field">
                <span className="field-label-inline">
                  Email <small>(không bắt buộc)</small>
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                />
              </label>
            </div>
            <label className="field">
              Nhắn Aura một điều gì đó
              <textarea
                rows="2"
                maxLength="1000"
                placeholder="Điều bạn muốn chuẩn bị cho buổi hẹn…"
                value={customer.notes}
                onChange={(e) =>
                  setCustomer({ ...customer, notes: e.target.value })
                }
              />
            </label>
          </div>
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          <div className="checkout-totals">
            <Eyebrow>03 / CHI PHÍ RÕ RÀNG</Eyebrow>
            {quote ? (
              <div className="price-summary">
                <div>
                  <span>
                    Chi phí dịch vụ {hasRental ? `(${days} ngày thuê)` : ""}
                  </span>
                  <strong>{money(quote.serviceTotal)}</strong>
                </div>
                {quote.securityDeposit > 0 && (
                  <div>
                    <span>Cọc bảo đảm · hoàn lại khi trả đồ</span>
                    <strong>{money(quote.securityDeposit)}</strong>
                  </div>
                )}
                {quote.advance > 0 && (
                  <div>
                    <span>Trả trước gói chụp / Photobooth</span>
                    <strong>{money(quote.advance)}</strong>
                  </div>
                )}
                <div className="summary-total">
                  <span>Thanh toán giữ chỗ</span>
                  <strong>{money(quote.dueNow)}</strong>
                </div>
                <small>
                  Còn lại khi đến studio:{" "}
                  {money(quote.totalPayable - quote.dueNow)}.{" "}
                  {hasRental &&
                    `Trả trang phục ngày ${dateLabel(quote.endDate)}.`}
                </small>
              </div>
            ) : (
              <p className="muted">
                {quoteBusy
                  ? "Đang kiểm tra giá và lịch trống…"
                  : scheduled && !slot
                    ? "Chọn ngày và ca chụp để xem chi phí."
                    : "Chi phí sẽ hiện sau khi kiểm tra giỏ dịch vụ."}
              </p>
            )}
            <label className="consent">
              <input
                type="checkbox"
                checked={consent}
                disabled={!quote?.bookingAcknowledgement || quoteBusy}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <span>
                {quote?.bookingAcknowledgement?.text || "Đang tải nội dung xác nhận chi phí…"}
              </span>
            </label>
            <Button
              busy={busy}
              disabled={!quote?.bookingAcknowledgement || quoteBusy || !consent}
              type="submit"
            >
              Giữ chỗ cho tôi <ArrowRight size={17} />
            </Button>
            <p className="checkout-assurance">
              <ShieldCheck size={14} />
              Giá được kiểm tra trực tiếp với studio.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
}
