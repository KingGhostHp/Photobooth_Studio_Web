import { useEffect, useRef, useId } from "react";
import { motion, useIsPresent, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  X,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
export function ArrowLink({ href, children, className = "" }) {
  return (
    <a className={`text-link ${className}`} href={href}>
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}
export function Button({ children, className = "", busy, ...props }) {
  return (
    <button
      {...props}
      className={`button ${className}`}
      disabled={busy || props.disabled}
    >
      {busy ? <LoaderCircle size={17} className="spin" /> : null}
      {children}
    </button>
  );
}
export function Eyebrow({ children }) {
  return (
    <p className="eyebrow">
      <span />
      {children}
    </p>
  );
}
export function Empty({ title, children, action }) {
  return (
    <div className="empty-state">
      <span className="empty-mark">a.</span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function ErrorState({ error, retry }) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={20} />
      <div>
        <strong>Chưa tải được dữ liệu</strong>
        <p>{error?.message || error}</p>
      </div>
      {retry && (
        <button
          onClick={retry}
          className="icon-button"
          aria-label="Thử tải lại"
        >
          <RefreshCw size={18} />
        </button>
      )}
    </div>
  );
}
export function Modal({
  children,
  title,
  onClose,
  wide = false,
  drawer = false,
  className = "",
}) {
  const ref = useRef(null);
  const id = useId();
  const isPresent = useIsPresent();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = old;
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);
  return (
    <motion.dialog
      ref={ref}
      aria-labelledby={id}
      className={`studio-dialog ${wide ? "wide" : ""} ${drawer ? "drawer" : ""} ${className}`}
      data-state={isPresent ? "open" : "closing"}
      initial={drawer ? { x: "100%" } : false}
      animate={drawer ? { x: 0 } : undefined}
      exit={drawer ? { x: "100%" } : undefined}
      transition={{
        duration: reduceMotion ? 0 : isPresent ? 0.32 : 0.22,
        ease: isPresent ? [0.22, 1, 0.36, 1] : [0.4, 0, 1, 1],
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (isPresent) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && isPresent) onClose();
      }}
    >
      <motion.div
        initial={drawer ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className="dialog-body"
      >
        <div className="dialog-heading">
          <h2 id={id}>{title}</h2>
          <button
            type="button"
            onClick={() => {
              if (isPresent) onClose();
            }}
            className="icon-button"
            aria-label="Đóng cửa sổ"
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.dialog>
  );
}
export function SectionHeading({ eyebrow, title, children, link, href }) {
  return (
    <div className="section-heading">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
        {children && <p>{children}</p>}
      </div>
      {link && <ArrowLink href={href}>{link}</ArrowLink>}
    </div>
  );
}
export function Badge({ children, tone = "" }) {
  return <span className={`studio-badge ${tone}`}>{children}</span>;
}
