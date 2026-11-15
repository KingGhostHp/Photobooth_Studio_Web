import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { productImages, imageFallback } from "./api";

export function ProductGallery({ item }) {
  const pictures = useMemo(() => productImages(item), [item]);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(Boolean(reduceMotion));
  const [visible, setVisible] = useState(!document.hidden);
  const index = active % pictures.length;
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  useEffect(() => {
    if (pictures.length < 2 || paused || !visible) return;
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % pictures.length), 5000);
    return () => window.clearTimeout(timer);
  }, [active, pictures, paused, visible]);
  const select = (value) => setActive((value + pictures.length) % pictures.length);
  return (
    <div className="product-gallery" role="region" aria-roledescription="carousel" aria-label={`Ảnh ${item.name}`}>
      <div className="product-gallery-stage">
        <img key={pictures[index]} src={pictures[index]} alt={`${item.name} — ảnh ${index + 1}/${pictures.length}`} onError={imageFallback} />
        {pictures.length > 1 && (
          <button type="button" className="gallery-playback" aria-label={paused ? "Tiếp tục tự chuyển ảnh" : "Tạm dừng tự chuyển ảnh"} onClick={() => setPaused(!paused)}>
            {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          </button>
        )}
      </div>
      {pictures.length > 1 && <div className="product-gallery-thumbnails" aria-label="Chọn ảnh sản phẩm">
        {pictures.map((src, n) => <button key={src} type="button" aria-label={`Xem ảnh ${n + 1}`} aria-pressed={n === index} onClick={() => select(n)}>
          <img src={src} alt="" onError={imageFallback} />
        </button>)}
      </div>}
    </div>
  );
}
