import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { MotionConfig, AnimatePresence, motion } from "motion/react";
import { Check, ArrowUpRight, ShoppingBag } from "lucide-react";
import { api, stored, save } from "./studio/api";
import {
  Header,
  Footer,
  Home,
  Collection,
  Packages,
  Photobooth,
  Lookbook,
  ProductDetails,
  PackageOptions,
} from "./studio/Storefront";
import { ErrorState, Empty } from "./studio/UI";
import Checkout from "./studio/Checkout";
import Lookup from "./studio/Lookup";
const Admin = lazy(() => import("./studio/Admin"));
function locationRoute() {
  const hash = window.location.hash.slice(1) || "/";
  const [path, query = ""] = hash.split("?");
  return { path, query };
}
export default function App() {
  const [location, setLocation] = useState(locationRoute);
  const admin = location.path === "/admin";
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState(() => {
    const data = stored("aura-cart-v2", []);
    return Array.isArray(data)
      ? data.filter(
          (i) =>
            i && ["costume", "package", "photobooth"].includes(i.type) && i.id,
        )
      : [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [toast, setToast] = useState("");
  useEffect(() => {
    const handler = () => {
      setLocation(locationRoute());
      setProduct(null);
      setPkg(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const load = useCallback(async () => {
    setError(null);
    try {
      const names = [
        "costumes",
        "categories",
        "packages",
        "addons",
        "photobooth",
        "banners",
      ];
      const data = await Promise.all(names.map((name) => api(`/${name}`)));
      setCatalog(
        Object.fromEntries(names.map((name, i) => [name, data[i].data])),
      );
    } catch (e) {
      setError(e);
    }
  }, []);
  useEffect(() => {
    if (!admin) {
      setCatalog(null);
      load();
    }
  }, [load, admin]);
  useEffect(() => {
    save("aura-cart-v2", cart);
  }, [cart]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    // Optional analytics stays off until its purpose and user controls are defined.
    try { localStorage.removeItem("aura-visitor-v2"); } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => {
    const titles = {
      "/": "Studio & Wardrobe",
      "/costumes": "Tủ trang phục",
      "/packages": "Gói chụp",
      "/photobooth": "Đặt lịch Photobooth",
      "/lookbook": "Lookbook",
      "/lookup": "Tra cứu lịch hẹn",
      "/admin": "Quản trị studio",
    };
    document.title = `${titles[location.path] || "Khám phá"} — Aura Studio`;
  }, [location.path]);
  const add = (item) => {
    if (item.type !== "costume" && cart.some((i) => i.type !== "costume")) {
      setToast(
        "Mỗi đơn nhận một gói chụp hoặc Photobooth. Hãy hoàn tất hoặc bỏ dịch vụ đã chọn.",
      );
      return;
    }
    setCart((previous) => {
      const index = previous.findIndex(
        (i) => i.type === item.type && i.id === item.id && i.size === item.size,
      );
      return index >= 0
        ? previous.map((i, n) =>
            n === index ? { ...i, quantity: i.quantity + item.quantity } : i,
          )
        : [...previous, { ...item, key: crypto.randomUUID() }];
    });
    setProduct(null);
    setPkg(null);
    setToast("Đã thêm vào giỏ dịch vụ của bạn.");
    if (item.type !== "costume") setCartOpen(true);
  };
  let page = null;
  if (catalog) {
    switch (location.path) {
      case "/":
        page = (
          <Home catalog={catalog} onProduct={setProduct} onPackage={setPkg} />
        );
        break;
      case "/costumes":
        page = (
          <Collection
            key={location.query}
            catalog={catalog}
            onSelect={setProduct}
            query={location.query}
          />
        );
        break;
      case "/packages":
        page = <Packages catalog={catalog} onSelect={setPkg} />;
        break;
      case "/photobooth":
        page = <Photobooth catalog={catalog} onAdd={add} />;
        break;
      case "/lookbook":
        page = <Lookbook />;
        break;
      case "/lookup":
        page = <Lookup />;
        break;
      default:
        page = (
          <Empty
            title="Trang này chưa có trong câu chuyện"
            action={
              <a href="#/" className="button">
                Về trang chủ <ArrowUpRight size={16} />
              </a>
            }
          >
            Cùng trở lại Aura và chọn một trải nghiệm khác nhé.
          </Empty>
        );
    }
  }
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Bỏ qua điều hướng
      </a>
      {admin ? (
        <Suspense
          fallback={<div className="loading-screen">Đang mở studio…</div>}
        >
          <Admin />
        </Suspense>
      ) : (
        <>
          <Header
            route={location.path}
            count={cart.reduce((s, i) => s + i.quantity, 0)}
            openCart={() => setCartOpen(true)}
          />
          <main id="main-content" tabIndex="-1">
            {error ? (
              <div className="container page-space">
                <ErrorState error={error} retry={load} />
              </div>
            ) : !catalog ? (
              <div className="container page-space loading-catalog">
                <span className="wordmark">aura✳</span>
                <p>Đang chuẩn bị những điều đẹp đẽ…</p>
                <div className="loading-line" />
              </div>
            ) : (
              page
            )}
          </main>
          <Footer />
        </>
      )}
      {product && (
        <ProductDetails
          key={product.id}
          item={product}
          onClose={() => setProduct(null)}
          onAdd={add}
        />
      )}
      {pkg && (
        <PackageOptions
          key={pkg.id}
          item={pkg}
          addons={catalog?.addons || []}
          onClose={() => setPkg(null)}
          onAdd={add}
        />
      )}
      <AnimatePresence>
        {cartOpen && (
          <Checkout
            key="checkout"
            items={cart}
            onChange={setCart}
            onClose={() => setCartOpen(false)}
            onDone={() => {
              setCart([]);
              load();
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Check size={18} />
            <span>{toast}</span>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  setToast("");
                  setCartOpen(true);
                }}
              >
                Xem giỏ <ShoppingBag size={14} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
