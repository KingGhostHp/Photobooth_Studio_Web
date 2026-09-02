import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HeroSection from './components/customer/HeroSection';
import HeroBannerCarousel from './components/customer/HeroBannerCarousel';
import CostumesCatalog from './components/customer/CostumesCatalog';
import OrderLookupSection from './components/customer/OrderLookupSection';
import PackagesSection from './components/customer/PackagesSection';
import PhotoboothSection from './components/customer/PhotoboothSection';
import BookingSlotSection from './components/customer/BookingSlotSection';
import LookbookSection from './components/customer/LookbookSection';
import CartDrawer from './components/customer/CartDrawer';

import AdminSidebar from './components/admin/AdminSidebar';
import AdminHeader from './components/admin/AdminHeader';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminInventory from './components/admin/AdminInventory';
import AdminCalendar from './components/admin/AdminCalendar';
import AdminOrders from './components/admin/AdminOrders';
import AdminPhotobooth from './components/admin/AdminPhotobooth';
import AdminPricing from './components/admin/AdminPricing';
import AdminBanners from './components/admin/AdminBanners';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCostumeCategory, setSelectedCostumeCategory] = useState('all');
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fetch orders from PostgreSQL
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách đơn hàng:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAddToCart = (item) => {
    setCartItems(prev => [...prev, item]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectPackageForBooking = (pkg) => {
    setSelectedPackageForBooking(pkg);
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteBooking = (newBookingOrder) => {
    if (newBookingOrder) {
      setOrders(prev => [newBookingOrder, ...prev.filter(o => o.id !== newBookingOrder.id)]);
    }
    setCartItems([]);
    fetchOrders();
  };

  const handleUpdateOrder = async (updatedOrder) => {
    try {
      const res = await fetch(`/api/orders/${updatedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? data.data : o));
      } else {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật đơn hàng:', err);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Lỗi khi xóa đơn hàng:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900">
      {isAdminMode ? (
        /* Admin Management Portal View */
        <div className="flex min-h-screen bg-slate-900 text-slate-100">
          <AdminSidebar 
            activeAdminTab={activeAdminTab} 
            setActiveAdminTab={setActiveAdminTab} 
            setIsAdminMode={setIsAdminMode} 
          />
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
            <AdminHeader 
              activeAdminTab={activeAdminTab} 
              setIsAdminMode={setIsAdminMode} 
            />
            <main className="p-6 sm:p-8 flex-1">
              {activeAdminTab === 'dashboard' && (
                <AdminDashboard orders={orders} onNavigateTab={setActiveAdminTab} />
              )}
              {activeAdminTab === 'inventory' && <AdminInventory />}
              {activeAdminTab === 'photobooth' && <AdminPhotobooth />}
              {activeAdminTab === 'pricing' && <AdminPricing />}
              {activeAdminTab === 'calendar' && <AdminCalendar />}
              {activeAdminTab === 'orders' && (
                <AdminOrders 
                  orders={orders} 
                  onUpdateOrder={handleUpdateOrder} 
                  onDeleteOrder={handleDeleteOrder}
                  onRefreshOrders={fetchOrders}
                />
              )}
              {activeAdminTab === 'cms' && <AdminBanners />}
              {activeAdminTab === 'staff' && (
                <div className="glass-panel p-8 text-center space-y-4 max-w-2xl mx-auto text-slate-900">
                  <h3 className="text-xl font-bold text-slate-900">Quản lý Nhân sự & Nhiếp ảnh gia</h3>
                  <p className="text-xs text-slate-600">Phân hệ quản lý lịch làm việc và phân ca nhiếp ảnh gia, chuyên viên trang điểm.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      ) : (
        /* Customer Web Portal View */
        <>
          <Header 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
            selectedCategory={selectedCostumeCategory}
            onSelectCategory={(catId) => {
              setSelectedCostumeCategory(catId);
              setCurrentTab('costumes');
            }}
            cartCount={cartItems.length}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenSearch={() => {
              setSelectedCostumeCategory('all');
              setCurrentTab('costumes');
            }}
            isAdminMode={isAdminMode}
            setIsAdminMode={setIsAdminMode}
          />

          <main className="flex-1">
            {currentTab === 'home' && (
              <>
                <HeroBannerCarousel 
                  onOpenBooking={() => setCurrentTab('booking')} 
                  onSelectTab={(tab) => setCurrentTab(tab)} 
                />
                <HeroSection setCurrentTab={setCurrentTab} />
                <CostumesCatalog 
                  onAddToCart={handleAddToCart} 
                  selectedCategory={selectedCostumeCategory}
                  setSelectedCategory={setSelectedCostumeCategory}
                />
                <PackagesSection onSelectPackageForBooking={handleSelectPackageForBooking} />
                <PhotoboothSection onBookingPhotobooth={() => setCurrentTab('booking')} />
                <OrderLookupSection />
                <LookbookSection />
              </>
            )}

            {currentTab === 'costumes' && (
              <CostumesCatalog 
                onAddToCart={handleAddToCart} 
                selectedCategory={selectedCostumeCategory}
                setSelectedCategory={setSelectedCostumeCategory}
              />
            )}

            {currentTab === 'lookup' && (
              <OrderLookupSection />
            )}

            {currentTab === 'packages' && (
              <PackagesSection onSelectPackageForBooking={handleSelectPackageForBooking} />
            )}

            {currentTab === 'photobooth' && (
              <PhotoboothSection onBookingPhotobooth={() => setCurrentTab('booking')} />
            )}

            {currentTab === 'booking' && (
              <BookingSlotSection 
                selectedPackage={selectedPackageForBooking} 
                onCompleteBooking={handleCompleteBooking} 
              />
            )}

            {currentTab === 'lookbook' && (
              <LookbookSection />
            )}
          </main>

          <CartDrawer 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={() => setCartItems([])}
            onProceedToBooking={() => setCurrentTab('booking')}
            onCompleteBooking={handleCompleteBooking}
          />

          <Footer setCurrentTab={setCurrentTab} />
        </>
      )}
    </div>
  );
}
