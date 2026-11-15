import { useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

// A native popover keeps the menu above dialogs and scroll containers.
export function Dropdown({ label, value, options, onChange, disabled = false }) {
  const id = useId();
  const trigger = useRef(null);
  const menu = useRef(null);
  const [open, setOpen] = useState(false);
  const selected = Math.max(0, options.findIndex((option) => option.value === value));
  const [active, setActive] = useState(selected);
  const search = useRef({ text: "", time: 0 });

  useLayoutEffect(() => {
    if (!open) return;
    const popup = menu.current;
    const rect = trigger.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const upwards = below < Math.min(220, options.length * 40 + 12) && above > below;
    Object.assign(popup.style, {
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      top: upwards ? "auto" : `${rect.bottom + 6}px`,
      bottom: upwards ? `${window.innerHeight - rect.top + 6}px` : "auto",
      maxHeight: `${Math.max(40, Math.min(252, upwards ? above : below))}px`,
    });
    popup.showPopover();
    const dismiss = (event) => {
      if (!popup.contains(event.target)) setOpen(false);
    };
    const resize = () => setOpen(false);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", resize);
    return () => {
      popup.hidePopover();
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", resize);
    };
  }, [open, options.length]);

  useLayoutEffect(() => {
    if (!open) return;
    const popup = menu.current;
    const option = popup.children[active];
    if (option.offsetTop < popup.scrollTop) popup.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > popup.scrollTop + popup.clientHeight)
      popup.scrollTop = option.offsetTop + option.offsetHeight - popup.clientHeight;
  }, [active, open]);

  const choose = (index) => {
    setOpen(false);
    trigger.current.focus({ preventScroll: true });
    onChange(options[index].value);
  };

  return (
    <div className="studio-select">
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={id}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        className="studio-select-trigger"
        disabled={disabled || !options.length}
        onClick={() => {
          setActive(selected);
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            setOpen(false);
            return;
          }
          if (event.key === "Escape" && open) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
            return;
          }
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            setOpen(true);
            const index = open ? active : selected;
            setActive(event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
              : Math.max(0, Math.min(options.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))));
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (open) choose(active);
            else { setActive(selected); setOpen(true); }
          } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            const now = Date.now();
            search.current.text = (now - search.current.time < 700 ? search.current.text : "") + event.key;
            search.current.time = now;
            const index = options.findIndex((option) => option.label.toLocaleLowerCase("vi").startsWith(search.current.text.toLocaleLowerCase("vi")));
            if (index >= 0) { setActive(index); setOpen(true); }
          }
        }}
      >
        <span>{options[selected]?.label || "Chọn"}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <div
        ref={menu}
        id={id}
        popover="auto"
        role="listbox"
        aria-label={label}
        className="studio-select-menu"
        onToggle={(event) => {
          if (event.newState === "closed") setOpen(false);
        }}
        onMouseDown={(event) => event.preventDefault()}
      >
        {options.map((option, index) => (
          <div
            key={option.value}
            id={`${id}-${index}`}
            role="option"
            aria-selected={value === option.value}
            data-active={index === active}
            onPointerMove={() => setActive(index)}
            onClick={() => choose(index)}
          >
            <span>{option.label}</span>
            {value === option.value && <Check size={15} aria-hidden="true" />}
          </div>
        ))}
      </div>
    </div>
  );
}
