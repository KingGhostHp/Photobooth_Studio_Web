import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Calendar, 
  Mail, 
  User, 
  Phone, 
  Info, 
  Sparkles, 
  AlertCircle,
  Clock,
  Loader2,
  Copy
} from 'lucide-react';
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
  const [currentOrder, setCurrentOrder] = useState(null);
  
  // Bank config from server
  const [bankConfig, setBankConfig] = useState({
    bankBin: '970422',
    bankName: 'MB Bank (Quân Đội)',
    accountNumber: '0975397923',
    accountHolder: 'AURA STUDIO',
    qrTemplate: 'compact2'
  });

  // Fetch dynamic bank config
  useEffect(() => {
    fetch('/api/payment/bank-config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBankConfig(data.data);
        }
      })
      .catch(err => console.warn('Lỗi tải bank config:', err));
  }, []);

  // Reset states
  useEffect(() => {
    setIsPaymentCompleted(false);
    setIsSubmitting(false);
    setConflictError('');
    if (!isOpen) {
      setShowVietQR(false);
      setIsCheckoutStep(false);
      setCurrentOrder(null);
    }
  }, [isOpen, cartItems]);

  // Realtime Polling Webhook Checker: When QR is open, poll server every 2 seconds
  useEffect(() => {
    if (!showVietQR || !currentOrder?.id || isPaymentCompleted) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/check-status/${currentOrder.id}`);
        const data = await res.json();
        if (data.success && data.isPaid) {
          setIsPaymentCompleted(true);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
          setTimeout(() => {
            if (onCompleteBooking) onCompleteBooking(currentOrder);
            onClearCart();
            setShowVietQR(false);
            setIsCheckoutStep(false);
            setIsPaymentCompleted(false);
            setCurrentOrder(null);
            onClose();
          }, 3000);
        }
      } catch (err) {
        console.warn('Lỗi kiểm tra webhook status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [showVietQR, currentOrder, isPaymentCompleted]);

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

  // Create pending order and open dynamic VietQR with webhook listening
  const handleProceedToQR = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email!');
      return;
    }

    const isAvailable = await checkAvailability();
    if (!isAvailable) {
      return;
    }

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
        paymentStatus: 'PENDING',
        bookingStatus: 'HOLD_15MIN',
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
        setIsSubmitting(false);
        return;
      }

      if (resData.success && resData.data) {
        setCurrentOrder(resData.data);
        setShowVietQR(true);
      }
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPendingOrder = async () => {
    if (currentOrder?.id && !isPaymentCompleted) {
      try {
        await fetch(`/api/orders/${currentOrder.id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Lỗi dọn dẹp đơn pending:', e);
      }
      setCurrentOrder(null);
    }
    setShowVietQR(false);
    setIsPaymentCompleted(false);
    setIsSubmitting(false);
  };

  const handleClose = async () => {
    await handleCancelPendingOrder();
    setIsCheckoutStep(false);
    setShowVietQR(false);
    setIsPaymentCompleted(false);
    setIsSubmitting(false);
    setConflictError('');
    setCurrentOrder(null);
    onClose();
  };

  const transferSyntax = currentOrder ? `AURA ${currentOrder.id}` : `AURA CART ${customerInfo.phone || '0975397923'}`;
  const dynamicQrUrl = `https://api.vietqr.io/image/${bankConfig.bankBin || '970422'}-${bankConfig.accountNumber || '0975397923'}-${bankConfig.qrTemplate || 'compact2'}.jpg?accountName=${encodeURIComponent(bankConfig.accountHolder || 'AURA STUDIO')}&amount=${totalDepositAmount}&addInfo=${encodeURIComponent(transferSyntax)}`;
  const activeQrImage = bankConfig.qrType === 'custom_image' && bankConfig.customQrImage
    ? bankConfig.customQrImage
    : dynamicQrUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-800">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 font-serif-title">
                {isCheckoutStep ? 'Thông Tin Khách & Đặt Cọc' : 'Giỏ Hàng Thuê & Đặt Lịch'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {cartItems ? cartItems.length : 0} dịch vụ đã chọn
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Cart Items List */}
        {!isCheckoutStep ? (
          <div className="flex-1 py-4 space-y-3 overflow-y-auto">
            {(!cartItems || cartItems.length === 0) ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Giỏ hàng của bạn đang trống.</p>
                <button
                  onClick={onClose}
                  className="btn-outline-gold text-xs px-4 py-2"
                >
                  Khám Phá Dịch Vụ Ngay
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.id || item.code}-${idx}`}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.category === 'combo' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.category === 'combo' ? 'Gói Combo Chụp' : 'Trang Phục'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <div className="text-[11px] text-slate-600">
                      Giá: <strong className="text-amber-800 font-extrabold">{(Number(item.rentalPrice) || 0).toLocaleString('vi-VN')} VNĐ</strong>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Cọc quy định: {(Number(item.depositAmount) || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromCart(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Xóa món này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Step 2: Customer Checkout Info Form */
          <div className="flex-1 py-4 space-y-4 overflow-y-auto">
            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Quy trình thanh toán tự động VietQR:</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Sau khi điền thông tin, hệ thống sẽ sinh mã VietQR. Bạn chỉ cần quét chuyển khoản từ App Ngân Hàng, hệ thống sẽ <strong>tự động nhận diện và hoàn tất đơn</strong> trong 2 giây.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Họ và Tên Khách Hàng *:</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Phương Linh"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Số Điện Thoại *:</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>Email Nhận Vé *:</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@gmail.com"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ngày Nhận / Thực Hiện *:</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={customerInfo.startDate}
                    onChange={(e) => {
                      setCustomerInfo({ ...customerInfo, startDate: e.target.value });
                      setConflictError('');
                    }}
                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Thời Gian Thuê *:</span>
                  </label>
                  <select
                    value={customerInfo.rentalDays}
                    onChange={(e) => {
                      setCustomerInfo({ ...customerInfo, rentalDays: e.target.value });
                      setConflictError('');
                    }}
                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="1">1 Ngày (24 Giờ)</option>
                    <option value="2">2 Ngày</option>
                    <option value="3">3 Ngày (Ưu đãi)</option>
                    <option value="5">5 Ngày (Kỷ yếu / Sự kiện)</option>
                  </select>
                </div>
              </div>

              {/* Calculated return date info */}
              {hasCostumes && (
                <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Hạn trả đồ dự kiến:</span>
                  <strong className="text-amber-900 font-bold">{getCalculatedReturnDate()}</strong>
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
                  disabled={isCheckingConflict || isSubmitting}
                  className="w-full btn-gold justify-center py-3.5 text-xs font-bold shadow-lg"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang Tạo Mã VietQR...' : 'Hiện Mã VietQR Chuyển Khoản'}</span>
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

      {/* VietQR Real-time Auto-Confirmed Payment Modal Popup */}
      {showVietQR && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center space-y-4 border border-amber-200 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="badge-gold">VietQR Auto-Callback</span>
              <button 
                onClick={handleCancelPendingOrder} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic VietQR or Custom Uploaded QR with Bank details from DB */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center relative overflow-hidden">
                <img
                  src={activeQrImage}
                  alt="Mã QR Thanh Toán"
                  className="w-full h-full object-contain"
                />
                {isPaymentCompleted && (
                  <div className="absolute inset-0 bg-emerald-950/80 rounded-xl flex flex-col items-center justify-center text-white space-y-1 animate-in zoom-in">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                    <span className="text-xs font-extrabold">ĐÃ NHẬN ĐỦ TIỀN!</span>
                  </div>
                )}
              </div>

              <div className="text-xs space-y-1.5 text-slate-700 text-left bg-white p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền cọc:</span>
                  <strong className="text-amber-800 text-sm font-extrabold">{totalDepositAmount.toLocaleString('vi-VN')} VNĐ</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <strong className="text-slate-900">{bankConfig.bankName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">STK:</span>
                  <strong className="text-amber-700 font-mono text-sm">{bankConfig.accountNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <strong className="text-slate-900">{bankConfig.accountHolder}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Nội dung CK:</span>
                  <strong className="text-emerald-700 font-mono font-extrabold">{transferSyntax}</strong>
                </div>
              </div>
            </div>

            {/* Listening animation banner */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center gap-2 text-xs text-amber-900 font-bold">
              {isPaymentCompleted ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ngân hàng đã xác nhận thành công! Đang chuyển trang...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-800">
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                  <span>Đang lắng nghe biến động số dư từ Ngân Hàng...</span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400">
              * Khi bạn chuyển khoản đúng số tiền và nội dung, màn hình sẽ tự động xác nhận và lưu đơn thuê ngay lập tức.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
