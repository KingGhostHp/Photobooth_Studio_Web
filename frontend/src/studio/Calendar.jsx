import { useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { today, statusNames } from "./api";
import { Badge, Modal, Button } from "./UI";
import { DatePicker } from "./DatePicker";

const slots = [
  "08:30 - 10:00",
  "10:00 - 11:30",
  "13:30 - 15:00",
  "15:00 - 16:30",
  "18:00 - 19:30",
  "19:30 - 21:00",
];
export default function Calendar({ orders, onUpdateOrder }) {
  const [date, setDate] = useState(today);
  const [selected, setSelected] = useState(null);
  const active = orders.filter(
    (o) =>
      o.bookingDate === date &&
      !["CANCELLED", "EXPIRED", "RETURNED", "COMPLETED"].includes(
        o.bookingStatus,
      ) &&
      !(
        o.bookingStatus === "AWAITING_PAYMENT" &&
        Date.parse(o.expiresAt) <= Date.now()
      ),
  );
  return (
    <>
      <div className="calendar-toolbar">
        <div>
          <CalendarDays size={22} />
          <p>
            Hai không gian, hai lịch riêng.
            <small>Chạm vào lịch hẹn để xem và phân công ekip.</small>
          </p>
        </div>
        <div className="field">
          <span>Ngày làm việc</span>
          <DatePicker
            label="Ngày làm việc"
            value={date}
            onChange={setDate}
          />
        </div>
      </div>
      <div className="calendar-grid">
        <div className="calendar-heading">CA CHỤP</div>
        <div className="calendar-heading">STUDIO</div>
        <div className="calendar-heading">PHOTOBOOTH</div>
        {slots.map((slot) => (
          <CalendarRow
            key={slot}
            slot={slot}
            active={active}
            onSelect={setSelected}
          />
        ))}
      </div>
      {selected && (
        <Assignment
          key={selected.id}
          order={selected}
          onClose={() => setSelected(null)}
          onSave={onUpdateOrder}
        />
      )}
    </>
  );
}
function CalendarRow({ slot, active, onSelect }) {
  return (
    <>
      <div className="calendar-time">
        <Clock size={15} />
        {slot}
      </div>
      {["studio", "photobooth"].map((resource) => {
        const items = active.filter(
          (o) =>
            o.timeSlot === slot &&
            (o.serviceType.includes("Photobooth") ? "photobooth" : "studio") ===
              resource,
        );
        return (
          <div className="calendar-cell" key={resource}>
            {items.length ? (
              items.map((o) => (
                <button
                  className={`calendar-booking ${o.bookingStatus === "CONFIRMED" ? "confirmed" : ""}`}
                  key={o.id}
                  onClick={() => onSelect(o)}
                >
                  <span>{statusNames[o.bookingStatus]}</span>
                  <strong>{o.customerName}</strong>
                  <small>{o.itemDetails}</small>
                  <small>
                    {o.assignedPhotographer || "Chưa phân công photo"}
                  </small>
                </button>
              ))
            ) : (
              <span className="calendar-free">Còn trống</span>
            )}
          </div>
        );
      })}
    </>
  );
}
function Assignment({ order, onClose, onSave }) {
  const [photo, setPhoto] = useState(order.assignedPhotographer || "");
  const [makeup, setMakeup] = useState(order.assignedMakeup || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({
        id: order.id,
        assignedPhotographer: photo,
        assignedMakeup: makeup,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Điều phối lịch hẹn" onClose={onClose}>
      <form onSubmit={submit}>
        <Badge>{statusNames[order.bookingStatus]}</Badge>
        <h3>{order.customerName}</h3>
        <p>
          {order.id} · {order.phone}
        </p>
        <p>
          {order.bookingDate} · {order.timeSlot}
        </p>
        <p className="muted">{order.itemDetails}</p>
        <label className="field">
          Photographer
          <input
            maxLength="200"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="Tên người phụ trách"
          />
        </label>
        <label className="field">
          Makeup artist
          <input
            maxLength="200"
            value={makeup}
            onChange={(e) => setMakeup(e.target.value)}
            placeholder="Tên người phụ trách"
          />
        </label>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <Button disabled={busy}>{busy ? "Đang lưu…" : "Lưu phân công"}</Button>
      </form>
    </Modal>
  );
}
