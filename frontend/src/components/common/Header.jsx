import React, { useState } from 'react';
import { ShoppingBag, Search, Shield, ChevronDown, Phone, MapPin, Clock, Sparkles, Camera } from 'lucide-react';

export default function Header({
  currentTab,
  setCurrentTab,
  selectedCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  onOpenSearch,
  isAdminMode,
  setIsAdminMode
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navItems = [
    { id: 'home', label: 'Trang Chủ' },
    {
      id: 'costumes',
      label: 'Thuê Trang Phục',
      dropdown: [
        { label: 'Cho Thuê Áo Dài Cưới Hỏi', tab: 'costumes', category: 'ao-dai-cuoi-hoi' },
        { label: 'Cho Thuê Áo Dài Bê Tráp', tab: 'costumes', category: 'ao-dai-be-trap' },
        { label: 'Cho Thuê Áo Dài Sui Gia', tab: 'costumes', category: 'ao-dai-sui-gia' },
        { label: 'Cho Thuê Áo Dài Kỷ Yếu', tab: 'costumes', category: 'ao-dai-ky-yeu' },
        { label: 'Cho Thuê Cổ Phục Việt Triều Nguyễn', tab: 'costumes', category: 'co-phuc' },
        { label: 'Cho Thuê Vest Nam & Tuxedo', tab: 'costumes', category: 'vest-nam' },
        { label: 'Cho Thuê Áo Cử Nhân Tốt Nghiệp', tab: 'costumes', category: 'ao-cu-nhan' },
        { label: 'Cho Thuê Đầm Dạ Hội & Váy Trắng', tab: 'costumes', category: 'da-hoi' },
        { label: 'Cho Thuê Phụ Kiện Chụp Ảnh', tab: 'costumes', category: 'phu-kien' }
      ]
    },
    { id: 'mix-match', label: 'Thử Phối Đồ Ảo', highlight: true },
    {
      id: 'packages',
      label: 'Bảng Giá Gói Chụp',
      dropdown: [
        { label: 'Bảng Giá Chụp Profile Doanh Nhân', tab: 'packages' },
        { label: 'Bảng Giá Chụp Kỷ Yếu & MV', tab: 'packages' },
        { label: 'Bảng Giá Phóng Sự Cưới', tab: 'packages' }
      ]
    },
    { id: 'photobooth', label: 'Photobooth Y2K' },
    { id: 'lookbook', label: 'Album Lookbook' },
    { id: 'booking', label: 'Đặt Lịch Ca Giờ' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Contact & Utility Bar (Inspired by Cong Studio) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Hotline / Zalo: 0975.397.923</span>
          </span>
          <span className="hidden md:flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>Showroom: Thiên Hương, Thủy Nguyên, Hải Phòng</span>
          </span>
          <span className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Mở cửa: 08:00 - 21:00 hàng ngày</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white px-3 py-1 rounded-full font-bold transition-all text-[11px] border border-amber-500/30"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAdminMode ? 'Thoát CMS Admin' : 'Vào CMS Admin Quản Lý'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Camera className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-title font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                AURA
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                STUDIO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase font-medium">Chụp Ảnh & Cho Thuê Trang Phục</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.id}
              className="relative group"
              onMouseEnter={() => item.dropdown && setActiveDropdown(item.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => setCurrentTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${currentTab === item.id
                  ? 'text-amber-700 bg-amber-50'
                  : item.highlight
                    ? 'text-amber-600 bg-amber-50/60 border border-amber-200 hover:bg-amber-100/80'
                    : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
                  }`}
              >
                <span>{item.label}</span>
                {item.dropdown && <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />}
              </button>

              {/* Dropdown Menu */}
              {item.dropdown && activeDropdown === item.id && (
                <div 
                  className="absolute top-full left-0 pt-1.5 w-64 z-50"
                  onMouseEnter={() => setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    {item.dropdown.map((drop, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentTab(drop.tab);
                          if (drop.category && onSelectCategory) {
                            onSelectCategory(drop.category);
                          }
                          setActiveDropdown(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:text-amber-700 hover:bg-amber-50 font-semibold transition-colors flex items-center justify-between"
                      >
                        <span>{drop.label}</span>
                        <span className="text-amber-500 text-[10px]">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-full text-slate-600 hover:text-amber-600 hover:bg-slate-100 transition-colors"
            title="Tìm kiếm sản phẩm"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCart}
            className="relative btn-gold px-4 py-2 text-xs font-bold flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Giỏ Thuê</span>
            {cartCount > 0 && (
              <span className="bg-slate-900 text-amber-300 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
