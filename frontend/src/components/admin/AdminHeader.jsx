import React from 'react';
import { Bell, Search, User, ShieldCheck, LogOut, Menu } from 'lucide-react';

export default function AdminHeader({ activeAdminTab, setIsAdminMode, onToggleMobileMenu }) {
  const getTabTitle = () => {
    switch (activeAdminTab) {
      case 'dashboard': return 'Bảng Điều Khiển Tổng Quan (Dashboard)';
      case 'orders': return 'Quản Lý Đơn Hàng & Phụ Phí Phạt';
      case 'inventory': return 'Quản Lý Kho Trang Phục (Lifecycle)';
      case 'photobooth': return 'Quản Lý Dịch Vụ Photobooth';
      case 'pricing': return 'Quản Lý Bảng Giá Dịch Vụ';
      case 'calendar': return 'Lịch Ca Chụp & Nhân Sự';
      case 'cms': return 'Phân Hệ Quản Lý CMS Nội Dung';
      default: return 'Trang Quản Lý Admin';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 py-3 sm:py-4 px-4 sm:px-8 flex items-center justify-between gap-3 sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Hamburger Button for Admin */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Mở menu quản lý"
        >
          <Menu className="w-5 h-5 text-amber-700" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 font-serif-title flex items-center gap-2">
            <span className="line-clamp-1">{getTabTitle()}</span>
            <span className="hidden sm:inline badge-gold">Live System</span>
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500 font-medium">Ghi nhận dữ liệu đơn hàng & kho thời gian thực.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-900 block">Quản Lý Trưởng</span>
            <span className="text-[9px] text-amber-700 font-semibold">Studio Admin Level 1</span>
          </div>
        </div>
      </div>
    </header>
  );
}
