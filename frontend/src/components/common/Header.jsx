import React, { useState } from 'react';
import { ShoppingBag, Shield, ChevronDown, ChevronRight, Phone, MapPin, Clock, Sparkles, Camera, Menu, X } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCostumesExpanded, setIsMobileCostumesExpanded] = useState(false);

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
    { id: 'combo', label: 'Gói Chụp Combo' },
    { id: 'photobooth', label: 'Photobooth' },
    { id: 'lookbook', label: 'Album Lookbook' },
    { id: 'lookup', label: 'Tra Cứu Đơn Thuê' },
  ];

  const handleMobileNavClick = (tabId, category = null) => {
    setCurrentTab(tabId);
    if (category && onSelectCategory) {
      onSelectCategory(category);
    }
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Contact & Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center gap-2 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
          <a href="tel:0975397923" className="flex items-center gap-1.5 text-amber-400 font-semibold hover:underline">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Hotline / Zalo: 0975.397.923</span>
          </a>
          <span className="hidden md:flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>Showroom: Hải Phòng</span>
          </span>
          <span className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>08:00 - 21:00 hàng ngày</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white px-2.5 py-0.5 sm:py-1 rounded-full font-bold transition-all text-[10px] sm:text-[11px] border border-amber-500/30"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAdminMode ? 'Thoát CMS Admin' : 'Vào CMS Admin Quản Lý'}</span>
            <span className="sm:hidden">{isAdminMode ? 'Thoát' : 'CMS Admin'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => {
            setCurrentTab('home');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-title font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                AURA
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                STUDIO
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 tracking-wider uppercase font-medium">Chụp Ảnh & Thuê Đồ</p>
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

        {/* Action Controls (Cart + Mobile Hamburger) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCart}
            className="relative btn-gold px-3.5 sm:px-4 py-2 text-xs font-bold flex items-center gap-1.5 sm:gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Giỏ Thuê</span>
            {cartCount > 0 && (
              <span className="bg-slate-900 text-amber-300 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[96px] z-50 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 flex justify-end">
          <div className="bg-white w-full max-w-xs h-[calc(100vh-96px)] overflow-y-auto p-5 space-y-4 shadow-2xl border-l border-slate-200 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-2">
                Danh Mục Dịch Vụ
              </span>

              {/* Home */}
              <button
                onClick={() => handleMobileNavClick('home')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between ${
                  currentTab === 'home' ? 'bg-amber-50 text-amber-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Trang Chủ</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Costumes with Accordion */}
              <div>
                <button
                  onClick={() => setIsMobileCostumesExpanded(!isMobileCostumesExpanded)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between ${
                    currentTab === 'costumes' ? 'bg-amber-50 text-amber-800' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Thuê Trang Phục</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isMobileCostumesExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isMobileCostumesExpanded && (
                  <div className="pl-3 pr-1 py-1 space-y-1 bg-slate-50 rounded-xl my-1 border border-slate-100">
                    <button
                      onClick={() => handleMobileNavClick('costumes', 'all')}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-amber-700 hover:underline"
                    >
                      • Xem Tất Cả Trang Phục
                    </button>
                    {navItems[1].dropdown.map((sub, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleMobileNavClick(sub.tab, sub.category)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:text-amber-700 font-medium transition-colors"
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Combo */}
              <button
                onClick={() => handleMobileNavClick('combo')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between ${
                  currentTab === 'combo' ? 'bg-amber-50 text-amber-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Gói Chụp Combo</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Photobooth */}
              <button
                onClick={() => handleMobileNavClick('photobooth')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between ${
                  currentTab === 'photobooth' ? 'bg-amber-50 text-amber-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Photobooth</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Lookbook */}
              <button
                onClick={() => handleMobileNavClick('lookbook')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between ${
                  currentTab === 'lookbook' ? 'bg-amber-50 text-amber-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Album Lookbook</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Order Lookup */}
              <button
                onClick={() => handleMobileNavClick('lookup')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between ${
                  currentTab === 'lookup' ? 'bg-amber-50 text-amber-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Tra Cứu Đơn Thuê</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Mobile Footer & Quick Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <a
                href="tel:0975397923"
                className="w-full btn-outline-gold justify-center py-2.5 text-xs font-bold flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Gọi Hotline: 0975.397.923</span>
              </a>

              <button
                onClick={() => {
                  setIsAdminMode(!isAdminMode);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-slate-900 text-amber-400 hover:bg-slate-800 p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>{isAdminMode ? 'Thoát Admin CMS' : 'Vào CMS Quản Trị Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

