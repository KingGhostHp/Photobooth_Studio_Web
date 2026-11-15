import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { imageFallback } from "../../studio/api";

const MAX_IMAGES = 10;
async function compressImage(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024)
    throw new Error("Chọn ảnh JPG, PNG hoặc WEBP, tối đa 10 MB mỗi ảnh.");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    try { await img.decode(); }
    catch { throw new Error("Không đọc được ảnh. Vui lòng chọn file JPG, PNG hoặc WEBP khác."); }
    const ratio = Math.min(1, 1200 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * ratio));
    canvas.height = Math.max(1, Math.round(img.height * ratio));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/webp", 0.85);
    if (data.length > 2000000) throw new Error("Ảnh quá lớn sau khi tối ưu. Vui lòng chọn ảnh nhỏ hơn.");
    return data;
  } finally { URL.revokeObjectURL(url); }
}
export default function ProductImageEditor({ value, onChange, onBusyChange, disabled }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const input = useRef(null);
  const task = useRef(0);
  useEffect(() => () => { task.current++; }, []);
  const append = (pictures) => onChange([...new Set([...value, ...pictures])]);
  const upload = async (event) => {
    const files = [...event.target.files];
    event.target.value = "";
    if (!files.length) return;
    setError("");
    if (files.length + value.length > MAX_IMAGES) { setError("Mỗi sản phẩm có tối đa 10 ảnh."); return; }
    const current = ++task.current;
    setBusy(true); onBusyChange(true);
    try {
      const pictures = [];
      for (const file of files) pictures.push(await compressImage(file));
      if (current === task.current) append(pictures);
    } catch (err) {
      if (current === task.current) setError(err.message || "Không đọc được ảnh. Vui lòng chọn lại.");
    } finally {
      if (current === task.current) { setBusy(false); onBusyChange(false); }
    }
  };
  const move = (index, target) => {
    const pictures = [...value];
    pictures.splice(target, 0, pictures.splice(index, 1)[0]);
    onChange(pictures);
  };
  const locked = busy || disabled;
  return <fieldset className="product-image-editor" disabled={locked}>
    <legend>Ảnh sản phẩm <span>{value.length} / {MAX_IMAGES}</span></legend>
    <p>Ảnh đầu tiên là ảnh đại diện. Popup tự chuyển ảnh mỗi 5 giây.</p>
    <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={upload} hidden aria-label="Chọn ảnh sản phẩm" />
    <button type="button" className="button button-outline button-small" disabled={locked || value.length >= MAX_IMAGES} onClick={() => input.current.click()}>
      <ImagePlus size={16} />{busy ? "Đang xử lý ảnh…" : "Chọn nhiều ảnh"}
    </button>
    <div className="product-image-url">
      <input aria-label="Đường dẫn ảnh sản phẩm" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Hoặc dán đường dẫn ảnh…" />
      <button type="button" disabled={locked || !url.trim() || value.length >= MAX_IMAGES} onClick={() => {
        const source = url.trim();
        if (!/^https?:\/\//i.test(source) && !/^\/(?!\/)/.test(source)) { setError("Nhập đường dẫn http, https hoặc /images/…"); return; }
        append([source]); setUrl(""); setError("");
      }}>Thêm ảnh</button>
    </div>
    {error && <p className="image-editor-error" role="alert">{error}</p>}
    <div className="product-image-editor-grid">
      {value.map((source, index) => <div key={source} className="product-image-tile">
        <img src={source} alt={`Ảnh sản phẩm ${index + 1}`} onError={imageFallback} />
        <span>{index === 0 ? "Ảnh đại diện" : `Ảnh ${index + 1}`}</span>
        <div>
          <button type="button" disabled={locked || index === 0} aria-label={`Đặt ảnh ${index + 1} làm đại diện`} title="Đặt làm ảnh đại diện" onClick={() => move(index, 0)}><Star size={14} /></button>
          <button type="button" disabled={locked || index === 0} aria-label={`Chuyển ảnh ${index + 1} lên trước`} onClick={() => move(index, index - 1)}><ArrowLeft size={14} /></button>
          <button type="button" disabled={locked || index === value.length - 1} aria-label={`Chuyển ảnh ${index + 1} ra sau`} onClick={() => move(index, index + 1)}><ArrowRight size={14} /></button>
          <button type="button" disabled={locked} aria-label={`Xóa ảnh ${index + 1}`} onClick={() => onChange(value.filter((_, n) => n !== index))}><Trash2 size={14} /></button>
        </div>
      </div>)}
    </div>
  </fieldset>;
}
