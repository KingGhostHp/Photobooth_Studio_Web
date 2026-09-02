import React from 'react';
import { LayoutDashboard, Shirt, Calendar, ShoppingCart, LogOut, Camera, Users, FileText, Tag } from 'lucide-react';

export default function AdminSidebar({ activeAdminTab, setActiveAdminTab, setIsAdminMode }) {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan Báo Cáo', icon: LayoutDashboard },
    { id: 'orders', label: 'Xử Lý Đơn Hàng & Phạt', icon: ShoppingCart, badge: 'Mới' },
    { id: 'inventory', label: 'Quản Lý Kho Trang Phục', icon: Shirt },
    { id: 'photobooth', label: 'Quản Lý Photobooth', icon: Camera, badge: 'Hot' },
    { id: 'pricing', label: 'Quản Lý Bảng Giá Dịch Vụ', icon: Tag },
    { id: 'calendar', label: 'Lịch Ca Chụp & Nhân Sự', icon: Calendar },
    { id: 'cms', label: 'Quản Lý Banner & Lookbook', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex flex-shrink-0 z-20">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-title font-extrabold text-base text-slate-900">AURA</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">CMS</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Hệ Thống Quản Lý Studio</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1">
          <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Phân Hệ Quản Lý
          </span>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeAdminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveAdminTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Exit Button */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => setIsAdminMode(false)}
          className="w-full btn-outline-gold justify-center py-2.5 text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Về Cổng Khách Hàng</span>
        </button>
      </div>
    </aside>
  );
}
