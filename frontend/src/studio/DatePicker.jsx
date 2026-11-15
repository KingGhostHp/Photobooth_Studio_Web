import { useId, useLayoutEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { today, dateLabel } from "./api";
import { addDays, clampDay, monthCells, parseDay, shiftMonth } from "./date-utils";

export function DatePicker({ label, value, onChange, min, max }) {
  const id = useId();
  const trigger = useRef(null);
  const popup = useRef(null);
  const focusGrid = useRef(false);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState((value || today()).slice(0, 7));
  const [focused, setFocused] = useState(value || today());
  const dateToday = today();
  const year = Number(month.slice(0, 4));
  const firstYear = Number(min?.slice(0, 4)) || Number(dateToday.slice(0, 4)) - 100;
  const lastYear = Number(max?.slice(0, 4)) || Number(dateToday.slice(0, 4)) + 100;
  const selectable = (day) => (!min || day >= min) && (!max || day <= max);
  const canView = (candidate) => (!min || candidate >= min.slice(0, 7)) && (!max || candidate <= max.slice(0, 7));

  useLayoutEffect(() => {
    if (!open) return;
    const menu = popup.current;
    const rect = trigger.current.getBoundingClientRect();
    const width = Math.min(280, window.innerWidth - 24);
    menu.style.width = `${width}px`;
    menu.style.maxHeight = "none";
    menu.showPopover();
    const height = menu.getBoundingClientRect().height;
    const below = window.innerHeight - rect.bottom - 18;
    const above = rect.top - 18;
    const available = Math.max(48, window.innerHeight - 24);
    const top = height <= below ? rect.bottom + 6
      : height <= above ? rect.top - height - 6
      : Math.max(12, Math.min(rect.bottom + 6, window.innerHeight - Math.min(height, available) - 12));
    Object.assign(menu.style, {
      left: `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`,
      top: `${top}px`,
      bottom: "auto",
      maxHeight: `${available}px`,
    });
    const dismiss = (event) => {
      if (!menu.contains(event.target)) setOpen(false);
    };
    const resize = () => setOpen(false);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", resize);
    return () => {
      menu.hidePopover();
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", resize);
    };
  }, [open]);
  useLayoutEffect(() => {
    if (open && focusGrid.current) {
      const button = popup.current.querySelector(`[data-date="${focused}"]`);
      button?.focus({ preventScroll: true });
      if (button) {
        const rect = button.getBoundingClientRect();
        const bounds = popup.current.getBoundingClientRect();
        if (rect.bottom > bounds.bottom) popup.current.scrollTop += rect.bottom - bounds.bottom + 8;
        else if (rect.top < bounds.top) popup.current.scrollTop -= bounds.top - rect.top + 8;
      }
      focusGrid.current = false;
    }
  }, [open, focused, month]);

  const close = () => {
    setOpen(false);
    trigger.current.focus({ preventScroll: true });
  };
  const choose = (day) => {
    if (!selectable(day)) return;
    if (day !== value) onChange(day);
    close();
  };
  const view = (candidate) => {
    if (!canView(candidate)) return;
    setMonth(candidate);
    setFocused(clampDay(`${candidate}-01`, min, max));
  };
  const onDayKey = (event, day) => {
    let next;
    const offset = (parseDay(day).getUTCDay() + 6) % 7;
    switch (event.key) {
      case "ArrowLeft": next = addDays(day, -1); break;
      case "ArrowRight": next = addDays(day, 1); break;
      case "ArrowUp": next = addDays(day, -7); break;
      case "ArrowDown": next = addDays(day, 7); break;
      case "Home": next = addDays(day, -offset); break;
      case "End": next = addDays(day, 6 - offset); break;
      case "PageUp": next = shiftMonth(day, event.shiftKey ? -12 : -1); break;
      case "PageDown": next = shiftMonth(day, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    next = clampDay(next, min, max);
    if (next === focused) return;
    focusGrid.current = true;
    setMonth(next.slice(0, 7));
    setFocused(next);
  };
  const days = monthCells(`${month}-01`);
  return <div className="date-picker" onBlurCapture={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={(event) => {
    if (open && event.key === "Escape") {
      event.preventDefault(); event.stopPropagation(); close();
    }
  }}>
    <button ref={trigger} type="button" className="studio-select-trigger date-picker-trigger"
      aria-label={label} aria-haspopup="dialog" aria-expanded={open} aria-controls={id}
      onClick={() => {
        if (open) { close(); return; }
        const start = clampDay(value || dateToday, min, max);
        setFocused(start); setMonth(start.slice(0, 7));
        focusGrid.current = true; setOpen(true);
      }}>
      <span>{value ? dateLabel(value) : "Chọn ngày"}</span><CalendarDays size={16} aria-hidden="true" />
    </button>
    <div ref={popup} id={id} popover="auto" role="dialog" aria-label={`Chọn ${label.toLowerCase()}`}
      className="date-picker-popover" onToggle={(event) => {
        if (event.target === event.currentTarget && event.newState === "closed") setOpen(false);
      }}>
      <div className="date-picker-heading">
        <button type="button" className="date-month-arrow" aria-label="Tháng trước"
          disabled={!canView(shiftMonth(`${month}-01`, -1).slice(0, 7))}
          onClick={() => view(shiftMonth(`${month}-01`, -1).slice(0, 7))}><ChevronLeft size={17} /></button>
        <Dropdown label="Chọn tháng" value={Number(month.slice(5, 7))}
          options={Array.from({ length: 12 }, (_, n) => ({ value: n + 1, label: `Tháng ${n + 1}` }))
            .filter((option) => canView(`${year}-${String(option.value).padStart(2, "0")}`))}
          onChange={(m) => view(`${year}-${String(m).padStart(2, "0")}`)} />
        <Dropdown label="Chọn năm" value={year}
          options={Array.from({ length: lastYear - firstYear + 1 }, (_, n) => ({ value: firstYear + n, label: `${firstYear + n}` }))}
          onChange={(y) => {
            const candidate = `${y}-${month.slice(5, 7)}`;
            view(canView(candidate) ? candidate : y === firstYear ? min.slice(0, 7) : max.slice(0, 7));
          }} />
        <button type="button" className="date-month-arrow" aria-label="Tháng sau"
          disabled={!canView(shiftMonth(`${month}-01`, 1).slice(0, 7))}
          onClick={() => view(shiftMonth(`${month}-01`, 1).slice(0, 7))}><ChevronRight size={17} /></button>
      </div>
      <table className="date-calendar" role="grid" aria-label={`Tháng ${Number(month.slice(5, 7))}, ${year}`}>
        <thead><tr>{["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((name) => <th key={name} scope="col">{name}</th>)}</tr></thead>
        <tbody>{Array.from({ length: 6 }, (_, row) => <tr key={row}>
          {days.slice(row * 7, row * 7 + 7).map((day) => <td key={day} aria-selected={day === value}>
            <button type="button" data-date={day} data-outside={day.slice(0, 7) !== month}
              aria-label={dateLabel(day)} aria-current={day === dateToday ? "date" : undefined}
              tabIndex={day === focused ? 0 : -1} disabled={!selectable(day)}
              onFocus={() => setFocused(day)} onKeyDown={(event) => onDayKey(event, day)} onClick={() => choose(day)}>
              {Number(day.slice(8, 10))}
            </button>
          </td>)}
        </tr>)}</tbody>
      </table>
      <div className="date-picker-footer">
        <button type="button" disabled={!selectable(dateToday)} onClick={() => choose(dateToday)}>Hôm nay</button>
        <button type="button" onClick={close}>Đóng</button>
      </div>
    </div>
  </div>;
}
