import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Aperture,
  ShoppingBag,
  Menu,
  X,
  Check,
  Heart,
  Search,
  Plus,
  Camera,
  Clock,
  Shirt,
  Mail,
  Phone,
} from "lucide-react";
import { images, money, imageFallback } from "./api";
import { Modal, Button, Eyebrow, SectionHeading, ArrowLink, Empty } from "./UI";
import { Dropdown } from "./Dropdown";
import { ProductGallery } from "./ProductGallery";
const nav = [
  ["/", "Trang chủ"],
  ["/costumes", "Trang phục"],
  ["/packages", "Gói chụp"],
  ["/photobooth", "Photobooth"],
  ["/lookbook", "Lookbook"],
];
export function Header({ route, count, openCart }) {
  const [menu, setMenu] = useState(false);
  return (
    <>
      <div className="announcement">
        <span>Một chút chuẩn bị. Một buổi chụp thật đáng nhớ.</span>
        <a href="#/lookup">
          Tra cứu lịch hẹn <ArrowUpRight size={12} />
        </a>
      </div>
      <header className="site-header">
        <a href="#/" className="wordmark" aria-label="Aura Studio, trang chủ">
          aura<span>✳</span>
          <small>STUDIO & WARDROBE</small>
        </a>
        <nav aria-label="Điều hướng chính" className={menu ? "open" : ""}>
          {nav.map(([path, label]) => (
            <a
              key={path}
              href={`#${path}`}
              className={route === path ? "active" : ""}
              aria-current={route === path ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            onClick={openCart}
            className="cart-trigger"
            aria-label={`Mở giỏ dịch vụ, ${count} mục`}
          >
            <ShoppingBag size={19} />
            <span className="cart-count">{count}</span>
          </button>
          <a className="button button-small header-book" href="#/photobooth">
            Đặt lịch ngay <ArrowUpRight size={16} />
          </a>
          <button
            className="icon-button mobile-menu"
            aria-label={menu ? "Đóng menu" : "Mở menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <a className="wordmark" href="#/">
            aura<span>✳</span>
          </a>
          <h2>
            Let’s make
            <br />
            <i>something yours.</i>
          </h2>
          <ArrowLink href="#/photobooth">Bắt đầu câu chuyện của bạn</ArrowLink>
        </div>
        <div>
          <p className="eyebrow">KHÁM PHÁ AURA</p>
          {nav.slice(1).map(([path, label]) => (
            <a key={path} href={`#${path}`}>
              {label}
            </a>
          ))}
        </div>
        <div>
          <p className="eyebrow">KẾT NỐI VỚI STUDIO</p>
          <a href="tel:0975397923">
            <Phone size={15} />
            0975 397 923
          </a>
          <a href="mailto:contact@aurastudio.vn">
            <Mail size={15} />
            contact@aurastudio.vn
          </a>
          <p>
            <Clock size={15} />
            08:00–21:00, mỗi ngày
          </p>
          <a href="https://zalo.me/0975397923" target="_blank" rel="noreferrer">
            Trò chuyện qua Zalo <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Aura Studio.</span>
        <a href="#/lookup">Tra cứu đơn</a>
        <a href="#/admin">
          Quản trị studio <ArrowUpRight size={12} />
        </a>
        <span>MADE FOR YOUR MOMENTS</span>
      </div>
    </footer>
  );
}
export function Home({ catalog, onProduct, onPackage }) {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Eyebrow>YOUR MOMENT, YOUR AURA</Eyebrow>
            <h1>
              Một khoảnh khắc.
              <br />
              Một dấu ấn
              <br />
              <em>rất riêng.</em>
              <span className="hero-spark">✳</span>
            </h1>
            <p>
              Không cần trở thành ai khác. Chỉ cần là bạn —
              <br className="desktop-break" /> với một bộ trang phục đẹp, một
              góc nhìn mới
              <br className="desktop-break" /> và những khoảnh khắc đáng giữ
              lại.
            </p>
            <div className="hero-buttons">
              <a href="#/packages" className="button">
                Tìm trải nghiệm của bạn <ArrowUpRight size={18} />
              </a>
              <ArrowLink href="#/lookbook">Xem lookbook</ArrowLink>
            </div>
          </motion.div>
          <div className="hero-footnote">
            <span className="mini-aperture">
              <Aperture size={23} />
            </span>
            <div>
              <strong>Studio. Trang phục. Photobooth.</strong>
              <span>Ba cách để kể câu chuyện của bạn.</span>
            </div>
            <span className="hero-index">01 / AURA</span>
          </div>
        </div>
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            className="hero-photo"
            src={images.heritage}
            alt="Chân dung trong cổ phục Nhật Bình thêu vàng, ánh sáng ấm"
            fetchPriority="high"
          />
          <div className="hero-photo-top">
            <span>AURA / THE EDITORIAL</span>
            <span>COLLECTION 01</span>
          </div>
          <div className="hero-photo-caption">
            <div>
              <small>DI SẢN, QUA MỘT GÓC NHÌN MỚI</small>
              <p>
                Heritage,
                <br />
                <i>reimagined.</i>
              </p>
            </div>
            <a
              href="#/costumes?category=co-phuc"
              className="round-link"
              aria-label="Khám phá bộ sưu tập cổ phục"
            >
              <ArrowUpRight size={25} />
            </a>
          </div>
          <div className="hero-stamp">
            made to
            <br />
            <i>remember</i>
            <span>✳</span>
          </div>
        </motion.div>
      </section>
      <div className="brand-strip">
        <div className="container">
          <span>CHÚNG MÌNH LO PHẦN CHUẨN BỊ.</span>
          <p>
            Bạn chỉ cần mang đến <i>chính mình.</i>
          </p>
          <span>✳</span>
          <span>STYLING · PORTRAITS · GOOD MEMORIES</span>
        </div>
      </div>
      <section className="section container">
        <SectionHeading
          eyebrow="THE AURA EXPERIENCE"
          title={
            <>
              Một studio.
              <br />
              <i>Nhiều cách là bạn.</i>
            </>
          }
          link="Khám phá dịch vụ"
          href="#/packages"
        >
          Từ chọn một bộ đồ thật hợp đến lưu lại một buổi hẹn vui.
        </SectionHeading>
        <div className="experience-grid">
          {[
            {
              n: "01",
              title: "Tủ đồ của những cảm hứng",
              desc: "Áo dài, cổ phục, vest và những lựa chọn cho buổi chụp của bạn.",
              image: images.aodai,
              href: "#/costumes",
              tag: "THE WARDROBE",
            },
            {
              n: "02",
              title: "Một góc nhìn khác về bạn",
              desc: "Chọn gói chụp, thêm chút makeup và để ekip lo phần còn lại.",
              image: images.suit,
              href: "#/packages",
              tag: "THE STUDIO",
            },
            {
              n: "03",
              title: "Một cuộc hẹn, nhiều nụ cười",
              desc: "Chọn concept Photobooth, chọn ca và giữ chỗ cho buổi hẹn tới.",
              image: images.heritage,
              href: "#/photobooth",
              tag: "THE PHOTOBOOTH",
            },
          ].map((item) => (
            <a key={item.n} href={item.href} className="experience-card">
              <div className="experience-image">
                <img src={item.image} alt={item.title} loading="lazy" />
                <span className="image-label">
                  {item.n} / {item.tag}
                </span>
                <span className="experience-arrow">
                  <ArrowUpRight size={22} />
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </a>
          ))}
        </div>
      </section>
      {catalog.banners.length > 0 && (
        <section className="container studio-campaigns">
          <div className="campaign-label">
            <Eyebrow>STUDIO NOTES</Eyebrow>
            <h2>Đang có tại Aura.</h2>
          </div>
          <div className="campaign-grid">
            {catalog.banners.map((banner) => (
              <article className="campaign-card" key={banner.id}>
                <img
                  src={banner.image}
                  alt={banner.title}
                  onError={imageFallback}
                  loading="lazy"
                />
                <div>
                  {banner.tag && <small>{banner.tag}</small>}
                  <h3>{banner.title}</h3>
                  <p>{banner.subtitle}</p>
                  <ArrowLink href={campaignHref(banner.buttonLink)}>
                    {banner.buttonText || "Tìm hiểu thêm"}
                  </ArrowLink>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="wardrobe-section">
        <div className="container section">
          <SectionHeading
            eyebrow="THE CONSIDERED WARDROBE"
            title={
              <>
                Chọn một bộ đồ.
                <br />
                <i>Mở một câu chuyện.</i>
              </>
            }
            link="Vào tủ đồ"
            href="#/costumes"
          >
            Những thiết kế nổi bật từ tủ trang phục của Aura.
          </SectionHeading>
          <div className="product-grid">
            {catalog.costumes.slice(0, 4).map((item) => (
              <ProductCard key={item.id} item={item} onSelect={onProduct} />
            ))}
          </div>
        </div>
      </section>
      <section className="photobooth-feature container section">
        <div
          className="strip-art"
          aria-label="Minh họa dải ảnh Photobooth từ bộ sưu tập Aura"
        >
          <div className="photo-strip strip-one">
            {[images.aodai, images.heritage, images.aodai].map((src, i) => (
              <img key={i} src={src} alt="" loading="lazy" />
            ))}
            <span>aura ✳</span>
          </div>
          <div className="photo-strip strip-two">
            {[images.suit, images.heritage, images.suit].map((src, i) => (
              <img key={i} src={src} alt="" loading="lazy" />
            ))}
            <span>moments, together.</span>
          </div>
          <span className="art-star">✳</span>
          <small>A LITTLE STRIP. A BIG MEMORY.</small>
        </div>
        <div className="feature-copy">
          <Eyebrow>STEP IN. BE YOURSELF.</Eyebrow>
          <h2>
            Hẹn nhau một buổi.
            <br />
            Giữ lại <i>thật nhiều.</i>
          </h2>
          <p>
            Một mình, cùng người thương hay cả hội bạn. Chọn concept, đặt ca
            Photobooth và dành một khoảng thời gian thật vui cho nhau.
          </p>
          <div className="inline-details">
            <span>
              <Camera size={17} />
              Concept riêng
            </span>
            <span>
              <Clock size={17} />
              Đặt ca trực tuyến
            </span>
          </div>
          <a href="#/photobooth" className="button">
            Chọn một cuộc hẹn <ArrowUpRight size={18} />
          </a>
          <small>Dải ảnh minh họa từ bộ sưu tập của studio.</small>
        </div>
      </section>
      <section className="container section process-section">
        <SectionHeading
          eyebrow="A LITTLE GUIDE"
          title={
            <>
              Từ cảm hứng
              <br />
              đến <i>cuộc hẹn.</i>
            </>
          }
        />
        <div className="process-grid">
          {[
            [
              "01",
              "Tìm điều hợp với bạn",
              "Khám phá trang phục, gói chụp hoặc concept Photobooth.",
            ],
            [
              "02",
              "Chọn ngày, chọn ca",
              "Xem giá rõ ràng và kiểm tra lịch trống trước khi giữ chỗ.",
            ],
            [
              "03",
              "Sẵn sàng tỏa sáng",
              "Hoàn tất khoản giữ chỗ. Studio xác nhận và chuẩn bị cho bạn.",
            ],
          ].map(([n, t, d]) => (
            <div key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      {catalog.packages[0] && (
        <section className="closing-cta container">
          <div>
            <Eyebrow>YOUR NEXT CHAPTER</Eyebrow>
            <h2>
              Phiên bản tiếp theo
              <br />
              của bạn <i>trông thế nào?</i>
            </h2>
          </div>
          <Button onClick={() => onPackage(catalog.packages[0])}>
            Cùng Aura khám phá <ArrowUpRight size={18} />
          </Button>
        </section>
      )}
    </>
  );
}
export function ProductCard({ item, onSelect }) {
  const [favorite, setFavorite] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("aura-favorites") || "[]",
      ).includes(item.id);
    } catch {
      return false;
    }
  });
  const toggle = () => {
    try {
      const all = JSON.parse(localStorage.getItem("aura-favorites") || "[]");
      localStorage.setItem(
        "aura-favorites",
        JSON.stringify(
          favorite ? all.filter((id) => id !== item.id) : [...all, item.id],
        ),
      );
    } catch {
      /* optional */
    }
    setFavorite(!favorite);
  };
  return (
    <article className="product-card">
      <div className="product-image">
        <button
          className="product-open"
          onClick={() => onSelect(item)}
          aria-label={`Xem ${item.name}`}
        >
          <img
            src={item.image}
            alt={item.name}
            onError={imageFallback}
            loading="lazy"
          />
        </button>
        <button
          className={`favorite ${favorite ? "selected" : ""}`}
          onClick={toggle}
          aria-label={favorite ? "Bỏ yêu thích" : "Lưu yêu thích"}
          aria-pressed={favorite}
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </button>
        <span className="product-category">
          {item.categoryName || "AURA COLLECTION"}
        </span>
        <button
          className="product-plus"
          onClick={() => onSelect(item)}
          aria-label={`Chọn size ${item.name}`}
        >
          <Plus size={19} />
        </button>
        {(item.availableStatus !== "AVAILABLE" || !item.availableCount) && (
          <span className="unavailable-label">Tạm ngừng cho thuê</span>
        )}
      </div>
      <div className="product-meta">
        <span>{item.code}</span>
        <span>{Array.isArray(item.sizes) ? item.sizes.join(" / ") : ""}</span>
      </div>
      <button className="product-name" onClick={() => onSelect(item)}>
        {item.name}
      </button>
      <p className="product-price">
        {money(item.rentalPrice)} <span>/ ngày</span>
      </p>
    </article>
  );
}
export function Collection({ catalog, onSelect, query }) {
  const [category, setCategory] = useState(
    new URLSearchParams(query).get("category") || "all",
  );
  const [gender, setGender] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const items = catalog.costumes
    .filter(
      (i) =>
        (category === "all" || i.category === category) &&
        (gender === "all" || i.gender === gender) &&
        `${i.name} ${i.code} ${i.description}`
          .toLocaleLowerCase("vi")
          .includes(search.toLocaleLowerCase("vi")),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.rentalPrice - b.rentalPrice
        : sort === "high"
          ? b.rentalPrice - a.rentalPrice
          : 0,
    );
  return (
    <div className="container page-space">
      <div className="page-heading">
        <Eyebrow>AURA WARDROBE / BỘ SƯU TẬP</Eyebrow>
        <h1>
          Tủ đồ, cho mọi
          <br />
          <i>phiên bản của bạn.</i>
        </h1>
        <p>
          Một bộ trang phục đẹp là khởi đầu của một câu chuyện mới.
          <br />
          Chọn thiết kế, kích cỡ và ngày bạn muốn khoác lên mình.
        </p>
      </div>
      <div className="category-tabs" aria-label="Danh mục trang phục">
        <button
          onClick={() => setCategory("all")}
          className={category === "all" ? "active" : ""}
        >
          Tất cả <span>{catalog.costumes.length}</span>
        </button>
        {catalog.categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={category === c.id ? "active" : ""}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="catalog-toolbar">
        <label className="search-input">
          <Search size={17} />
          <input
            aria-label="Tìm trang phục"
            placeholder="Tìm một thiết kế, một cảm hứng…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span className="result-count">{items.length} thiết kế</span>
        <Dropdown label="Giới tính" value={gender} onChange={setGender}
          options={[
            { value: "all", label: "Mọi phong cách" },
            ...["Nữ", "Nam", "Unisex"].map((value) => ({ value, label: value })),
          ]} />
        <Dropdown label="Sắp xếp" value={sort} onChange={setSort}
          options={[
            { value: "featured", label: "Lựa chọn của Aura" },
            { value: "low", label: "Giá từ thấp đến cao" },
            { value: "high", label: "Giá từ cao đến thấp" },
          ]} />
      </div>
      {items.length ? (
        <div className="product-grid collection-grid">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} onSelect={onSelect} />
          ))}
        </div>
      ) : (
        <Empty
          title="Chưa tìm thấy thiết kế phù hợp"
          action={
            <Button
              className="button-outline"
              onClick={() => {
                setCategory("all");
                setGender("all");
                setSearch("");
              }}
            >
              Xem lại tất cả
            </Button>
          }
        >
          Thử một từ khóa khác hoặc mở rộng bộ lọc nhé.
        </Empty>
      )}
      <div className="collection-note">
        <Shirt size={21} />
        <p>
          Chưa chắc kích cỡ nào hợp với bạn?{" "}
          <a href="https://zalo.me/0975397923" target="_blank" rel="noreferrer">
            Nhắn Aura để được tư vấn <ArrowUpRight size={13} />
          </a>
        </p>
      </div>
    </div>
  );
}
export function ProductDetails({ item, onClose, onAdd }) {
  const [size, setSize] = useState(item.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [customQuantity, setCustomQuantity] = useState(false);
  const quantityInput = useRef(null);
  const quantityHint = useId();
  const maxQuantity = Math.min(item.availableCount, 20);
  const validQuantity = Number.isInteger(Number(quantity)) &&
    Number(quantity) >= (customQuantity ? 4 : 1) && Number(quantity) <= maxQuantity;
  useEffect(() => {
    if (customQuantity) quantityInput.current?.focus({ preventScroll: true });
  }, [customQuantity]);
  const available =
    item.availableStatus === "AVAILABLE" && item.availableCount > 0;
  return (
    <Modal title="Một thiết kế cho bạn" onClose={onClose} wide className="product-dialog">
      <div className="product-detail">
        <ProductGallery item={item} />
        <div className="product-info">
          <Eyebrow>{item.categoryName}</Eyebrow>
          <h2>{item.name}</h2>
          <p className="detail-price">
            {money(item.rentalPrice)} <small>/ ngày thuê</small>
          </p>
          <p>{item.description}</p>
          <div className="field">
            <span>
              Kích cỡ <small>Chọn kích cỡ bạn muốn thuê</small>
            </span>
            <div className="size-options">
              {(item.sizes || []).map((s) => (
                <button
                  key={s}
                  className={s === size ? "selected" : ""}
                  onClick={() => setSize(s)}
                  aria-pressed={s === size}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span>Số lượng</span>
            <div className={`quantity-picker ${customQuantity ? "is-custom" : ""}`}>
              <Dropdown
                label="Số lượng"
                value={customQuantity ? "other" : quantity}
                disabled={!available}
                options={[
                  ...Array.from({ length: Math.min(maxQuantity, 3) }, (_, i) => ({
                    value: i + 1, label: `${i + 1} bộ`,
                  })),
                  ...(maxQuantity > 3 ? [{ value: "other", label: "Khác" }] : []),
                ]}
                onChange={(value) => {
                  setCustomQuantity(value === "other");
                  setQuantity(value === "other" ? "" : value);
                }}
              />
              {customQuantity && (
                <div className="quantity-custom-input">
                  <input
                    ref={quantityInput}
                    type="number"
                    inputMode="numeric"
                    min={4}
                    max={maxQuantity}
                    step={1}
                    aria-label="Số bộ khác"
                    aria-describedby={quantityHint}
                    aria-invalid={quantity !== "" && !validQuantity}
                    placeholder={`4–${maxQuantity}`}
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                  <span>bộ</span>
                </div>
              )}
            </div>
            {maxQuantity > 3 && (
              <small
                id={quantityHint}
                className={`quantity-hint ${quantity !== "" && !validQuantity ? "quantity-error" : ""}`}
                data-visible={customQuantity}
                aria-hidden={!customQuantity}
              >
                Nhập số nguyên từ 4 đến {maxQuantity} bộ.
              </small>
            )}
          </div>
          <div className="deposit-note">
            <Check size={16} />
            <div>
              <strong>Cọc bảo đảm: {money(item.depositAmount)} / bộ</strong>
              <p>
                Hoàn lại khi trả trang phục nguyên vẹn. Phí thuê tính theo số
                ngày bạn chọn.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="product-dialog-actions">
        <Button
          disabled={!available || !size || !validQuantity}
          onClick={() =>
            onAdd({
              type: "costume",
              id: item.id,
              name: item.name,
              image: item.image,
              size,
              quantity: Number(quantity),
              unitPrice: item.rentalPrice,
              deposit: item.depositAmount,
            })
          }
        >
          {available
            ? "Thêm vào giỏ dịch vụ"
            : "Trang phục tạm ngừng cho thuê"}
          <Plus size={17} />
        </Button>
      </div>
    </Modal>
  );
}
export function Packages({ catalog, onSelect }) {
  return (
    <div className="container page-space">
      <div className="page-heading">
        <Eyebrow>THE STUDIO SESSIONS</Eyebrow>
        <h1>
          Một buổi chụp.
          <br />
          <i>Một bạn thật khác.</i>
        </h1>
        <p>
          Chọn một trải nghiệm phù hợp, thêm những điều bạn thích.
          <br />
          Giá và khoản giữ chỗ luôn rõ ràng trước khi xác nhận.
        </p>
      </div>
      <div className="package-list">
        {catalog.packages.map((pkg, i) => (
          <article className="package-card" key={pkg.id}>
            <div className="package-image">
              <img src={pkg.image} alt={pkg.name} onError={imageFallback} />
              <span>SESSION / 0{i + 1}</span>
            </div>
            <div className="package-copy">
              <Eyebrow>
                {pkg.isPopular ? "AURA’S SELECTION" : "YOUR OWN PERSPECTIVE"}
              </Eyebrow>
              <h2>{pkg.name}</h2>
              <p>{pkg.subtitle}</p>
              <div className="package-facts">
                <span>
                  {pkg.includedPeople > 1
                    ? `Từ ${pkg.includedPeople} người`
                    : "Chân dung cá nhân"}
                </span>
                <span>{pkg.outfitsCount} bộ trang phục</span>
                <span>{pkg.retouchedCount} ảnh retouch</span>
              </div>
              <ul>
                {(pkg.features || []).slice(0, 4).map((f) => (
                  <li key={f}>
                    <Check size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="package-bottom">
                <div>
                  <strong>{money(pkg.basePricePerPerson)}</strong>
                  <span> / người</span>
                </div>
                <Button onClick={() => onSelect(pkg)}>
                  Thiết kế buổi chụp <ArrowUpRight size={17} />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
export function PackageOptions({ item, addons, onClose, onAdd }) {
  const [people, setPeople] = useState(item.includedPeople || 1);
  const [selected, setSelected] = useState([]);
  const total =
    item.basePricePerPerson * people +
    addons
      .filter((a) => selected.includes(a.id))
      .reduce((s, a) => s + a.price, 0);
  return (
    <Modal title="Buổi chụp theo cách của bạn" onClose={onClose}>
      <Eyebrow>AURA STUDIO SESSION</Eyebrow>
      <h3>{item.name}</h3>
      <label className="field">
        Số người tham gia
        <input
          type="number"
          min={item.includedPeople || 1}
          max="100"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
        />
        <small>
          Gói nhận từ {item.includedPeople || 1} người. Phụ phí dưới đây tính
          một lần.
        </small>
      </label>
      <p className="field-label">Thêm một chút đặc biệt</p>
      <div className="addon-list">
        {addons.map((addon) => (
          <label key={addon.id}>
            <input
              type="checkbox"
              checked={selected.includes(addon.id)}
              onChange={() =>
                setSelected(
                  selected.includes(addon.id)
                    ? selected.filter((id) => id !== addon.id)
                    : [...selected, addon.id],
                )
              }
            />
            <span>{addon.name}</span>
            <strong>+ {money(addon.price)}</strong>
          </label>
        ))}
      </div>
      <div className="summary-row">
        <span>Chi phí buổi chụp</span>
        <strong>{money(total)}</strong>
      </div>
      <p className="muted">
        Chọn ngày và ca chụp ở bước tiếp theo. Tiền giữ chỗ là một phần của giá
        gói.
      </p>
      <Button
        disabled={
          !Number.isInteger(Number(people)) ||
          Number(people) < (item.includedPeople || 1) ||
          Number(people) > 100
        }
        onClick={() =>
          onAdd({
            type: "package",
            id: item.id,
            name: item.name,
            image: item.image,
            people: Number(people),
            addons: selected,
            quantity: 1,
          })
        }
      >
        Thêm buổi chụp <ArrowRight size={17} />
      </Button>
    </Modal>
  );
}
export function Photobooth({ catalog, onAdd }) {
  const [selected, setSelected] = useState(catalog.photobooth[0]);
  if (!selected)
    return (
      <Empty title="Concept đang được chuẩn bị">
        Aura sẽ cập nhật concept mới tại đây.
      </Empty>
    );
  return (
    <div className="container page-space">
      <div className="page-heading centered">
        <Eyebrow>SMALL STRIPS, BIG FEELINGS</Eyebrow>
        <h1>
          Chụp một chút.
          <br />
          <i>Vui thật nhiều.</i>
        </h1>
        <p>
          Chọn khung hình cho buổi hẹn tới. Lịch trống được cập nhật
          <br />
          khi bạn chọn ngày và giữ chỗ.
        </p>
      </div>
      <div className="booth-layout">
        <div className="booth-preview">
          <div className="photo-strip booth-strip">
            {[images.aodai, images.suit, images.heritage].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Ảnh minh họa Photobooth từ bộ sưu tập Aura"
              />
            ))}
            <span>
              aura ✳<small>YOUR MOMENT, PRINTED.</small>
            </span>
          </div>
          <span className="booth-spark">✳</span>
          <p>
            Những khoảnh khắc nhỏ,
            <br />
            <i>những kỷ niệm dài lâu.</i>
          </p>
        </div>
        <div className="booth-options">
          <Eyebrow>01 / CHỌN CONCEPT CỦA BẠN</Eyebrow>
          {catalog.photobooth.map((concept, i) => (
            <button
              className={`concept-option ${selected.id === concept.id ? "selected" : ""}`}
              key={concept.id}
              onClick={() => setSelected(concept)}
            >
              <span className="concept-number">0{i + 1}</span>
              <div>
                <h3>{concept.name}</h3>
                <p>{concept.description}</p>
              </div>
              <strong>{money(concept.price)}</strong>
              <span className="radio-indicator">
                {selected.id === concept.id && <Check size={12} />}
              </span>
            </button>
          ))}
          <div className="booth-perks">
            {(selected.perks || []).map((p) => (
              <span key={p}>
                <Check size={15} />
                {p}
              </span>
            ))}
          </div>
          <div className="booth-action">
            <div>
              <small>Concept đã chọn</small>
              <strong>
                {money(selected.price)} <span>/ lượt</span>
              </strong>
            </div>
            <Button
              onClick={() =>
                onAdd({
                  type: "photobooth",
                  id: selected.id,
                  name: selected.name,
                  image: selected.image,
                  quantity: 1,
                })
              }
            >
              Chọn ngày & ca chụp <ArrowRight size={17} />
            </Button>
          </div>
          <p className="muted">
            Ảnh trên là minh họa. Chi tiết concept và quyền lợi theo thông tin
            studio.
          </p>
        </div>
      </div>
    </div>
  );
}
export function Lookbook() {
  const [selected, setSelected] = useState(null);
  const items = [
    {
      image: images.heritage,
      title: "Di sản trong một ánh nhìn",
      tag: "HERITAGE PORTRAITS",
    },
    {
      image: images.suit,
      title: "Một phong thái rất riêng",
      tag: "THE MODERN PORTRAIT",
    },
    {
      image: images.aodai,
      title: "Sắc đỏ, và những dịu dàng",
      tag: "ÁO DÀI EDITORIAL",
    },
  ];
  return (
    <div className="container page-space">
      <div className="page-heading">
        <Eyebrow>AURA JOURNAL / LOOKBOOK</Eyebrow>
        <h1>
          Những câu chuyện
          <br />
          <i>kể bằng ánh sáng.</i>
        </h1>
        <p>
          Cảm hứng hình ảnh từ bộ sưu tập studio.
          <br />
          Một chút gợi ý cho câu chuyện tiếp theo của bạn.
        </p>
      </div>
      <div className="lookbook-grid">
        {items.map((item, i) => (
          <button
            key={item.tag}
            onClick={() => setSelected(item)}
            className={`lookbook-item look-${i}`}
          >
            <img src={item.image} alt={item.title} />
            <div>
              <span>{item.tag}</span>
              <h2>{item.title}</h2>
            </div>
            <span className="round-link">
              <ArrowUpRight />
            </span>
          </button>
        ))}
      </div>
      <div className="lookbook-note">
        <span>YOUR STORY COULD BE NEXT.</span>
        <ArrowLink href="#/packages">Cùng tạo một bộ ảnh riêng</ArrowLink>
      </div>
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)} wide>
          <img
            className="lightbox-photo"
            src={selected.image}
            alt={selected.title}
          />
          <p className="muted">Hình ảnh cảm hứng từ bộ sưu tập Aura Studio.</p>
        </Modal>
      )}
    </div>
  );
}

function campaignHref(value = "") {
  if (value.startsWith("#/")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return /costume|trang-phuc/.test(value) ? "#/costumes" : "#/packages";
}
