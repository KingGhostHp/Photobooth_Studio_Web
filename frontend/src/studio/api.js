export const money = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + " ₫";
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const dateLabel = (value) =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const error = new Error(
      data.message ||
        data.error ||
        "Không thể kết nối với studio. Vui lòng thử lại.",
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
export function stored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage is optional. */
  }
}
export const images = {
  heritage: "/images/costume_co_phuc_viet_1786199773916.png",
  aodai: "/images/costume_ao_dai_viet_1786199756012.png",
  suit: "/images/costume_vest_luxury_1786199794453.png",
};
export function productImages(item) {
  const list = Array.isArray(item.images) && item.images.length ? item.images : [item.image];
  const valid = [...new Set(list.filter((src) => typeof src === "string" && src.trim()))];
  return valid.length ? valid : [images.heritage];
}
export function imageFallback(event) {
  if (!event.currentTarget.dataset.fallback) {
    event.currentTarget.dataset.fallback = "true";
    event.currentTarget.src = images.heritage;
  }
}
export const statusNames = {
  PENDING: "Chờ thanh toán",
  PARTIALLY_PAID: "Đã nhận một phần",
  DEPOSITED: "Đã nhận cọc",
  FULLY_PAID: "Đã thanh toán",
  AWAITING_PAYMENT: "Đang giữ chỗ",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết thời gian giữ chỗ",
  RETURNED: "Đã trả đồ",
  COMPLETED: "Hoàn tất",
};
// Compatibility adapter for existing CMS forms: failed writes must never look saved.
export async function adminFetch(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const data = await response
      .clone()
      .json()
      .catch(() => ({}));
    throw new Error(
      data.message || data.error || "Không thể lưu thay đổi. Vui lòng thử lại.",
    );
  }
  return response;
}
