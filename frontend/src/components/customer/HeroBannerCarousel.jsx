import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Phone, ArrowRight, Camera, ShieldCheck, Award } from 'lucide-react';

const DEFAULT_BANNERS = [
  {
    id: 1,
    image: '/images/banners/banner1.png',
    tag: 'Yearbook Concept 2026',
    title: 'KỶ YẾU MIỀN BẮC & CONCEPT ĐỘC BẢN',
    subtitle: 'Hơn 100+ Concept Kỷ Yếu Học Sinh, Sinh Viên Đỉnh Cao • Trọn Gói Phim Ảnh & Trang Phục',
    buttonText: 'Đặt Lịch Chụp Kỷ Yếu',
    buttonLink: '#booking',
    hotline: '0975.475.789 - 0968.475.789',
    badge: 'Cộng Studio Style'
  },
  {
    id: 2,
    image: '/images/banners/banner2.png',
    tag: 'Bộ Sưu Tập Trang Phục 2026',
    title: 'CỔ PHỤC TRIỀU NGUYỄN & ÁO DÀI DI SẢN',
    subtitle: 'Cho Thuê Trang Phục Cao Cấp Của Áo Dài Nhân & Cổ Phục Việt • Chuẩn Phom Dáng Hoàn Hảo',
    buttonText: 'Xem Bộ Sưu Tập Trang Phục',
    buttonLink: '#costumes',
    hotline: '0975.397.923 - 0399.475.789',
    badge: 'Áo Dài Nhân'
  },
  {
    id: 3,
    image: '/images/banners/banner3.png',
    tag: 'Cộng Suit & High Fashion',
    title: 'TUXEDO NAM LUXURY & CHỤP ẢNH DOANH NHÂN',
    subtitle: 'Vest Nhung Dạ Hội, Suit Chú Rể Cao Cấp & Gói Chụp Ảnh Nghệ Thuật Đẳng Cấp 5 Sao',
    buttonText: 'Khám Phá Bảng Giá Suit',
    buttonLink: '#pricing',
    hotline: '0975.475.789',
    badge: 'Cộng Suit'
  }
];

export default function HeroBannerCarousel({ banners: initialBanners, onOpenBooking, onSelectTab }) {
  const [banners, setBanners] = useState(initialBanners || DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fetch banners from API if available
  useEffect(() => {
    fetch('/api/banners')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setBanners(resData.data);
        }
      })
      .catch((err) => {
        console.warn('Using fallback static banners:', err.message);
      });
  }, []);

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Touch Swipe Support for Mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      handlePrev();
    }
  };

  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 select-none">
      <div
        className="relative w-full aspect-[16/7] sm:aspect-[21/8] lg:aspect-[24/9] min-h-[360px] sm:min-h-[440px] max-h-[560px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Container */}
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={banner.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image with Zoom Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className={`w-full h-full object-cover object-center transition-transform duration-10000 ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />
                {/* Gradient Overlays for High Contrast & Text Clarity */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/40" />
              </div>

              {/* Content Overlay Container */}
              <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-12 sm:pb-16 text-white space-y-3 sm:space-y-4">
                
                {/* Tag & Badge Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>{banner.badge || 'Cộng Studio Style'}</span>
                  </span>
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full">
                    {banner.tag}
                  </span>
                </div>

                {/* Main Headline */}
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif-title tracking-tight leading-tight max-w-3xl text-amber-50 drop-shadow-md">
                  {banner.title}
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm lg:text-base text-slate-200/90 font-medium max-w-2xl leading-relaxed drop-shadow">
                  {banner.subtitle}
                </p>

                {/* Actions & Call-to-action Row */}
                <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      if (onOpenBooking) onOpenBooking();
                      else if (onSelectTab) onSelectTab('rental');
                    }}
                    className="btn-gold px-6 py-3 text-xs sm:text-sm font-extrabold shadow-xl shadow-amber-500/25 flex items-center gap-2 group transform active:scale-95 transition-all"
                  >
                    <span>{banner.buttonText || 'Đặt Lịch Chụp Ngay'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <a
                    href={`tel:${(banner.hotline || '').split('-')[0].trim()}`}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>Hotline: {banner.hotline}</span>
                  </a>
                </div>

              </div>
            </div>
          );
        })}

        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-amber-500 text-white hover:text-slate-950 border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-xl group opacity-80 hover:opacity-100"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-amber-500 text-white hover:text-slate-950 border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-xl group opacity-80 hover:opacity-100"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Pagination Dots & Progress Bar */}
        <div className="absolute bottom-4 right-6 sm:right-12 z-20 flex items-center gap-2 bg-slate-900/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-amber-500 shadow-sm shadow-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
