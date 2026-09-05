import React from 'react';
import { LayoutDashboard, Shirt, Calendar, ShoppingCart, LogOut, Camera, Users, FileText, Tag, X } from 'lucide-react';

export default function AdminSidebar({ 
  activeAdminTab, 
  setActiveAdminTab, 
  setIsAdminMode,
  isMobileOpen,
  onCloseMobile
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan Báo Cáo', icon: LayoutDashboard },
    { id: 'orders', label: 'Xử Lý Đơn Hàng & Phạt', icon: ShoppingCart, badge: 'Mới' },
    { id: 'inventory', label: 'Quản Lý Kho Trang Phục', icon: Shirt },
    { id: 'photobooth', label: 'Quản Lý Photobooth', icon: Camera, badge: 'Hot' },
    { id: 'pricing', label: 'Quản Lý Bảng Giá Dịch Vụ', icon: Tag },
    { id: 'calendar', label: 'Lịch Ca Chụp & Nhân Sự', icon: Calendar },
    { id: 'cms', label: 'Quản Lý Banner & Lookbook', icon: FileText },
  ];

  const handleSelectTab = (tabId) => {
    setActiveAdminTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full bg-white text-slate-900">
      <div className="space-y-4 sm:space-y-6">
        {/* Brand Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-title font-extrabold text-base text-slate-900">AURA</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">CMS</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-semibold">Hệ Thống Quản Lý Studio</p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition-all ${
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
          onClick={() => {
            setIsAdminMode(false);
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full btn-outline-gold justify-center py-2.5 text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Về Cổng Khách Hàng</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 z-30 sticky top-0 h-screen overflow-y-auto shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Off-canvas Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex animate-in fade-in duration-200">
          <div className="w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
