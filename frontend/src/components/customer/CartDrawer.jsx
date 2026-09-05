import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, QrCode, Calendar, Mail, User, Phone, Info, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getVietnamDateString } from '../../utils/vietnamTime';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveFromCart,
  onClearCart,
  onProceedToBooking,
  onCompleteBooking
}) {
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  
  // Today YYYY-MM-DD in Vietnam timezone (GMT+7)
  const todayStr = getVietnamDateString();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    startDate: todayStr,
    rentalDays: 1,
    note: ''
  });
  
  const [showVietQR, setShowVietQR] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [conflictError, setConflictError] = useState('');
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset payment states whenever cart items or open state changes
  React.useEffect(() => {
    setIsPaymentCompleted(false);
    setIsSubmitting(false);
    setConflictError('');
    if (!isOpen) {
      setShowVietQR(false);
      setIsCheckoutStep(false);
    }
  }, [isOpen, cartItems]);

  if (!isOpen) return null;

  const totalRentalPrice = (cartItems || []).reduce((sum, item) => sum + (Number(item?.rentalPrice) || 0), 0);
  const totalDepositAmount = (cartItems || []).reduce((sum, item) => sum + (Number(item?.depositAmount) || 0), 0);
  const grandTotal = totalRentalPrice + totalDepositAmount;

  const hasCostumes = (cartItems || []).some(i => i?.category !== 'combo');
  const hasCombos = (cartItems || []).some(i => i?.category === 'combo');

  // Calculate return date string automatically based on startDate + rentalDays
  const getCalculatedReturnDate = () => {
    if (!customerInfo.startDate) return 'Vui lòng chọn ngày sử dụng';
    const start = new Date(customerInfo.startDate);
    if (isNaN(start.getTime())) return 'Vui lòng chọn ngày hợp lệ';
    
    const returnDate = new Date(start);
    returnDate.setDate(returnDate.getDate() + parseInt(customerInfo.rentalDays || 1, 10));
    
    const day = String(returnDate.getDate()).padStart(2, '0');
    const month = String(returnDate.getMonth() + 1).padStart(2, '0');
    const year = returnDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const checkAvailability = async () => {
    const costumeItems = (cartItems || []).filter(i => i.category !== 'combo');
    const costumeIds = costumeItems.map(i => i.id || i.code);
    if (costumeIds.length === 0 || !customerInfo.startDate) return true;

    setIsCheckingConflict(true);
    setConflictError('');

    try {
      const res = await fetch('/api/costumes/check-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          costumeIds,
          startDate: customerInfo.startDate,
          rentalDays: parseInt(customerInfo.rentalDays || 1, 10)
        })
      });
      const data = await res.json();
      if (data.hasConflict) {
        setConflictError(data.message || 'Trang phục này đã có khách thuê trùng lịch. Vui lòng chọn ngày khác!');
        setIsCheckingConflict(false);
        return false;
      }
    } catch (err) {
      console.warn('Lỗi khi kiểm tra lịch trống:', err);
    } finally {
      setIsCheckingConflict(false);
    }
    return true;
  };

  const handleProceedToQR = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email!');
      return;
    }

    const isAvailable = await checkAvailability();
    if (!isAvailable) {
      return;
    }

    setIsPaymentCompleted(false);
    setIsSubmitting(false);
    setShowVietQR(true);
  };

  const handleSimulatePayment = async () => {
    if (isSubmitting || isPaymentCompleted) return;
    setIsSubmitting(true);
    setConflictError('');

    try {
      const costumeIds = (cartItems || []).map(i => i.id || i.code);
      let serviceTitle = 'Cho Thuê Trang Phục';
      if (hasCombos && hasCostumes) {
        serviceTitle = 'Thuê Trang Phục & Gói Chụp Combo';
      } else if (hasCombos) {
        serviceTitle = 'Gói Chụp Combo Nghệ Thuật';
      }

      const itemDetailsText = (cartItems || []).map(i => {
        if (i.category === 'combo') {
          return `${i.name} (${(Number(i.rentalPrice) || 0).toLocaleString('vi-VN')}đ, Cọc ${(Number(i.depositAmount) || 0).toLocaleString('vi-VN')}đ)`;
        }
        return `${i.name || 'Trang phục'} (Thuê: ${(Number(i.rentalPrice) || 0).toLocaleString('vi-VN')}đ, Cọc: ${(Number(i.depositAmount) || 0).toLocaleString('vi-VN')}đ)`;
      }).join(' + ');

      const orderPayload = {
        customerName: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
        serviceType: serviceTitle,
        itemDetails: itemDetailsText,
        costumeIds: costumeIds,
        bookingDate: customerInfo.startDate,
        returnDate: hasCostumes ? getCalculatedReturnDate() : customerInfo.startDate,
        rentalDays: parseInt(customerInfo.rentalDays || 1, 10),
        timeSlot: hasCostumes 
          ? `Sử dụng ${customerInfo.rentalDays} ngày (Nhận ${customerInfo.startDate} - Trả ${getCalculatedReturnDate()})`
          : `Thực hiện ngày ${customerInfo.startDate}`,
        totalAmount: grandTotal,
        depositAmount: totalDepositAmount,
        penaltyFee: 0,
        paymentStatus: 'DEPOSITED',
        bookingStatus: 'CONFIRMED',
        assignedPhotographer: hasCombos ? 'Đang phân công' : 'Không áp dụng',
        assignedMakeup: hasCombos ? 'Đang phân công' : 'Không áp dụng',
        notes: `Khách đặt ${(cartItems || []).length} mục dịch vụ qua Giỏ Hàng. Ghi chú: ${customerInfo.note || 'Không'}`
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const resData = await res.json();
      if (!res.ok || resData.conflict) {
        setConflictError(resData.message || 'Dịch vụ đã có người đặt trùng lịch!');
        setShowVietQR(false);
        setIsSubmitting(false);
        setIsPaymentCompleted(false);
        return;
      }

      if (resData.success && resData.data) {
        if (onCompleteBooking) {
          onCompleteBooking(resData.data);
        }
      }

      setIsPaymentCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onClearCart();
        setShowVietQR(false);
        setIsCheckoutStep(false);
        setIsPaymentCompleted(false);
        setIsSubmitting(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Lỗi khi lưu đơn hàng:', err);
      alert('Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại!');
      setIsSubmitting(false);
      setIsPaymentCompleted(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutStep(false);
    setShowVietQR(false);
    setIsPaymentCompleted(false);
    setIsSubmitting(false);
    setConflictError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 font-serif-title leading-snug">
                {isCheckoutStep ? 'Thanh Toán & Xác Nhận Đơn Hàng' : 'Giỏ Hàng Dịch Vụ Studio'}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {(cartItems || []).length} mục dịch vụ đã chọn
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        {!isCheckoutStep ? (
          /* Step 1: Cart Items List */
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {(!cartItems || cartItems.length === 0) ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 text-sm font-medium">Giỏ hàng của bạn hiện đang trống.</p>
                <button onClick={handleClose} className="btn-outline-gold px-5 py-2 text-xs font-bold">
                  Khám Phá Dịch Vụ
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="card-clean p-3.5 rounded-2xl flex items-center justify-between gap-4 border border-slate-200 hover:border-amber-300 transition-all bg-white"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-xl bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.category === 'combo' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.categoryName || (item.category === 'combo' ? 'Gói Chụp Combo' : 'Trang Phục')}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                    <div className="text-xs text-slate-600 space-x-2 pt-0.5">
                      <span>Giá: <strong className="text-amber-800 font-bold">{(Number(item.rentalPrice) || 0).toLocaleString('vi-VN')}đ</strong></span>
                      <span>• Cọc: <strong className="text-slate-800 font-bold">{(Number(item.depositAmount) || 0).toLocaleString('vi-VN')}đ</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromCart(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Xóa khỏi giỏ"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Step 2: Customer Information & Auto Date Calculation Form */
          <div className="space-y-5 text-xs max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">Thông Tin Khách Hàng:</span>
              
              {/* Customer Name */}
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Họ và tên người đặt *"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Customer Phone */}
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="Số điện thoại Zalo liên hệ *"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Customer Email */}
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Địa chỉ Email / Gmail nhận xác nhận *"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            {/* Date Selection & Automatic Return Calculation */}
            <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Thời Gian Thực Hiện Dịch Vụ:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Ngày Bắt Đầu / Sử Dụng:</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={customerInfo.startDate}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, startDate: e.target.value })}
                    className="w-full bg-white border border-amber-300 p-2 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                {hasCostumes && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Số Ngày Thuê Đồ:</label>
                    <select
                      value={customerInfo.rentalDays}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, rentalDays: parseInt(e.target.value, 10) })}
                      className="w-full bg-white border border-amber-300 p-2 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="1">1 Ngày (24 Giờ)</option>
                      <option value="2">2 Ngày (48 Giờ)</option>
                      <option value="3">3 Ngày (72 Giờ)</option>
                      <option value="5">5 Ngày</option>
                      <option value="7">1 Tuần</option>
                    </select>
                  </div>
                )}
              </div>

              {hasCostumes && (
                <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200 text-slate-700">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Hạn trả đồ dự kiến: <strong className="text-amber-900">{getCalculatedReturnDate()}</strong></span>
                </div>
              )}
            </div>

            {/* Conflict Warning if any */}
            {conflictError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold text-xs flex items-center gap-2 animate-in shake">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{conflictError}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom Footer Actions */}
        {cartItems && cartItems.length > 0 && (
          <div className="border-t border-slate-100 pt-4 space-y-4">
            
            {/* Price Summary Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tổng chi phí dịch vụ:</span>
                <span className="font-bold text-slate-900">{totalRentalPrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span>Tiền đặt cọc quy định:</span>
                <span className="font-bold text-slate-900">{totalDepositAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
                <strong className="text-slate-900 font-bold">Tổng thanh toán / đặt cọc:</strong>
                <strong className="text-amber-800 font-extrabold text-base">{grandTotal.toLocaleString('vi-VN')} VNĐ</strong>
              </div>
            </div>

            {/* Buttons Flow */}
            {!isCheckoutStep ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onClearCart}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                >
                  Xóa Hết
                </button>
                <button
                  onClick={() => setIsCheckoutStep(true)}
                  className="flex-1 btn-gold justify-center py-3.5 text-xs font-bold"
                >
                  <span>Tiến Hành Đặt Cọc</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleProceedToQR}
                  disabled={isCheckingConflict}
                  className="w-full btn-gold justify-center py-3.5 text-xs font-bold shadow-lg"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isCheckingConflict ? 'Đang Kiểm Tra Lịch Trống...' : 'Hiện Mã VietQR Chuyển Khoản'}</span>
                </button>

                <button
                  onClick={() => setIsCheckoutStep(false)}
                  className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Quay lại danh sách món đồ
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* VietQR Payment Modal Popup */}
      {showVietQR && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center space-y-4 border border-amber-200 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="badge-gold">VietQR Thanh Toán Tự Động</span>
              <button 
                onClick={() => {
                  setShowVietQR(false);
                  setIsPaymentCompleted(false);
                  setIsSubmitting(false);
                }} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VietQR Dynamic Image */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                <img
                  src={`https://api.vietqr.io/image/970422-0975397923-qM3y46g.jpg?accountName=AURA%20STUDIO&amount=${totalDepositAmount}&addInfo=${encodeURIComponent(`AURA CART ${customerInfo.phone || '0975397923'}`)}`}
                  alt="VietQR MB Bank"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-xs space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền cọc:</span>
                  <strong className="text-amber-800 text-sm font-extrabold">{totalDepositAmount.toLocaleString('vi-VN')} VNĐ</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <strong className="text-slate-900">MB Bank (Quân Đội)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">STK:</span>
                  <strong className="text-amber-700 font-mono text-sm">0975397923</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <strong className="text-slate-900">AURA STUDIO</strong>
                </div>
              </div>
            </div>

            {/* Payment simulation action */}
            <button
              onClick={handleSimulatePayment}
              disabled={isSubmitting || isPaymentCompleted}
              className="w-full btn-gold justify-center py-3.5 text-xs font-bold shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isPaymentCompleted ? '✓ Đã Thanh Toán & Lưu Đơn Hàng!' : isSubmitting ? 'Đang Xử Lý...' : 'Tôi Đã Chuyển Khoản Xong'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
