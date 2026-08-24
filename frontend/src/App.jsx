import React, { useState } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HeroSection from './components/customer/HeroSection';
import CostumesCatalog from './components/customer/CostumesCatalog';
import MixMatchBuilder from './components/customer/MixMatchBuilder';
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

import { INITIAL_ORDERS } from './data/bookings';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCostumeCategory, setSelectedCostumeCategory] = useState('all');
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState(null);

  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const handleAddToCart = (item) => {
    setCartItems([...cartItems, item]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleSelectPackageForBooking = (pkg) => {
    setSelectedPackageForBooking(pkg);
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteBooking = (newBookingOrder) => {
    setOrders([newBookingOrder, ...orders]);
    setCartItems([]);
  };

  const handleUpdateOrder = (updatedOrder) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
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
              {activeAdminTab === 'calendar' && <AdminCalendar />}
              {activeAdminTab === 'orders' && (
                <AdminOrders orders={orders} onUpdateOrder={handleUpdateOrder} />
              )}
              {(activeAdminTab === 'cms' || activeAdminTab === 'staff') && (
                <div className="glass-panel p-8 text-center space-y-4 max-w-2xl mx-auto text-slate-900">
                  <h3 className="text-xl font-bold text-slate-900">Chức năng CMS & Quản lý Nhân sự</h3>
                  <p className="text-xs text-slate-600">Phân hệ CMS quản lý Lookbook, Banner & mã voucher đã được liên kết trong hệ thống.</p>
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
                <HeroSection setCurrentTab={setCurrentTab} />
                <CostumesCatalog 
                  onAddToCart={handleAddToCart} 
                  onOpenMixMatch={() => setCurrentTab('mix-match')}
                  selectedCategory={selectedCostumeCategory}
                  setSelectedCategory={setSelectedCostumeCategory}
                />
                <MixMatchBuilder onAddToCart={handleAddToCart} />
                <PackagesSection onSelectPackageForBooking={handleSelectPackageForBooking} />
                <PhotoboothSection onBookingPhotobooth={() => setCurrentTab('booking')} />
                <LookbookSection />
              </>
            )}

            {currentTab === 'costumes' && (
              <CostumesCatalog 
                onAddToCart={handleAddToCart} 
                onOpenMixMatch={() => setCurrentTab('mix-match')} 
                selectedCategory={selectedCostumeCategory}
                setSelectedCategory={setSelectedCostumeCategory}
              />
            )}

            {currentTab === 'mix-match' && (
              <MixMatchBuilder onAddToCart={handleAddToCart} />
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
          />

          <Footer setCurrentTab={setCurrentTab} />
        </>
      )}
    </div>
  );
}
