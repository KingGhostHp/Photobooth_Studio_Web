import React from 'react';
import { Bell, Search, User, ShieldCheck, LogOut } from 'lucide-react';

export default function AdminHeader({ activeAdminTab, setIsAdminMode }) {
  const getTabTitle = () => {
    switch (activeAdminTab) {
      case 'dashboard': return 'Bảng Điều Khiển Tổng Quan (Dashboard)';
      case 'orders': return 'Quản Lý Đơn Hàng & Tính Phụ Phí Phạt';
      case 'inventory': return 'Quản Lý Vòng Đời Kho Trang Phục (Lifecycle)';
      case 'calendar': return 'Quản Lý Lịch Ca Chụp & Phân Công Staff';
      case 'cms': return 'Phân Hệ Quản Lý CMS Nội Dung';
      default: return 'Trang Quản Lý Admin';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 py-4 px-6 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 font-serif-title flex items-center gap-2">
          <span>{getTabTitle()}</span>
          <span className="badge-gold">Live System</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">Hệ thống ghi nhận dữ liệu đơn hàng & tình trạng kho thời gian thực.</p>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-slate-900 block">Quản Lý Trưởng</span>
            <span className="text-[10px] text-amber-700 font-semibold">Studio Admin Level 1</span>
          </div>
        </div>
      </div>
    </header>
  );
}
