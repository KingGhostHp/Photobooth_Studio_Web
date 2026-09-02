import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, QrCode, Calendar, Mail, User, Phone, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  
  // Today YYYY-MM-DD for min date picker
  const todayStr = new Date().toISOString().split('T')[0];

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

  if (!isOpen) return null;

  const totalRentalPrice = (cartItems || []).reduce((sum, item) => sum + (Number(item?.rentalPrice) || 0), 0);
  const totalDepositAmount = (cartItems || []).reduce((sum, item) => sum + (Number(item?.depositAmount) || 0), 0);
  const grandTotal = totalRentalPrice + totalDepositAmount;

  // Calculate return date string automatically based on startDate + rentalDays
  const getCalculatedReturnDate = () => {
    if (!customerInfo.startDate) return 'Vui lòng chọn ngày sử dụng đồ';
    const start = new Date(customerInfo.startDate);
    if (isNaN(start.getTime())) return 'Vui lòng chọn ngày sử dụng hợp lệ';
    
    const returnDate = new Date(start);
    returnDate.setDate(returnDate.getDate() + parseInt(customerInfo.rentalDays || 1, 10));
    
    const day = String(returnDate.getDate()).padStart(2, '0');
    const month = String(returnDate.getMonth() + 1).padStart(2, '0');
    const year = returnDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [conflictError, setConflictError] = useState('');
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkAvailability = async () => {
    const costumeIds = (cartItems || []).map(i => i.id || i.code);
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

    setShowVietQR(true);
  };

  const handleSimulatePayment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setConflictError('');
    try {
      const costumeIds = (cartItems || []).map(i => i.id || i.code);
      const orderPayload = {
        customerName: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email,
        serviceType: 'Cho Thuê Trang Phục',
        itemDetails: (cartItems || []).map(i => `${i.name || 'Trang phục'} (Thuê: ${(Number(i.rentalPrice) || 0).toLocaleString('vi-VN')}đ, Cọc: ${(Number(i.depositAmount) || 0).toLocaleString('vi-VN')}đ)`).join(' + '),
        costumeIds: costumeIds,
        bookingDate: customerInfo.startDate,
        returnDate: getCalculatedReturnDate(),
        rentalDays: parseInt(customerInfo.rentalDays || 1, 10),
        timeSlot: `Thuê ${customerInfo.rentalDays} ngày (Nhận ${customerInfo.startDate} - Trả ${getCalculatedReturnDate()})`,
        totalAmount: grandTotal,
        depositAmount: totalDepositAmount,
        penaltyFee: 0,
        paymentStatus: 'DEPOSITED',
        bookingStatus: 'CONFIRMED',
        assignedPhotographer: 'Không áp dụng',
        assignedMakeup: 'Không áp dụng',
        notes: `Khách thuê ${(cartItems || []).length} trang phục. Email: ${customerInfo.email}`
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const resData = await res.json();
      if (!res.ok || resData.conflict) {
        setConflictError(resData.message || 'Trang phục đã có người thuê trùng lịch!');
        setShowVietQR(false);
        setIsSubmitting(false);
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
        setIsSubmitting(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Lỗi khi lưu đơn thuê đồ:', err);
      alert('Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại!');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutStep(false);
    setShowVietQR(false);
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
                {isCheckoutStep ? 'Thanh Toán Đặt Cọc Thuê Đồ' : 'Giỏ Thuê Trang Phục Studio'}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {(cartItems || []).length} món đồ đã chọn
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
                <p className="text-slate-500 text-sm font-medium">Giỏ thuê của bạn hiện đang trống.</p>
                <button onClick={handleClose} className="btn-outline-gold px-5 py-2 text-xs font-bold">
                  Khám Phá Kho Trang Phục
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
                    <span className="text-[10px] text-amber-700 font-black uppercase tracking-wider">{item.categoryName || item.category || 'Trang phục'}</span>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                    <div className="text-xs text-slate-600 space-x-2 pt-0.5">
                      <span>Thuê: <strong className="text-amber-800 font-bold">{(Number(item.rentalPrice) || 0).toLocaleString('vi-VN')}đ</strong></span>
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
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">Thông Tin Khách Hàng Thuê Đồ:</span>
              
              {/* Customer Name */}
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Họ và tên người thuê *"
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
                <span>Thời Gian Thuê Trang Phục:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">Ngày cần sử dụng đồ *</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={customerInfo.startDate}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, startDate: e.target.value })}
                    className="w-full bg-white border border-amber-300 p-2.5 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">Thời gian thuê (Số ngày)</label>
                  <select
                    value={customerInfo.rentalDays}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, rentalDays: parseInt(e.target.value, 10) })}
                    className="w-full bg-white border border-amber-300 p-2.5 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value={1}>1 Ngày (Trả ngày hôm sau)</option>
                    <option value={2}>2 Ngày</option>
                    <option value={3}>3 Ngày</option>
                    <option value={4}>4 Ngày</option>
                    <option value={5}>5 Ngày</option>
                    <option value={6}>6 Ngày</option>
                    <option value={7}>7 Ngày (Tối đa)</option>
                  </select>
                </div>
              </div>

              {/* Automatic Return Date Notice */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-[11px] font-bold text-slate-700">Ngày trả đồ (Hệ thống tự tính):</span>
                </div>
                <strong className="text-sm font-black text-amber-900 font-serif-title bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  {getCalculatedReturnDate()}
                </strong>
              </div>

              {/* Conflict Error Notification Box */}
              {conflictError && (
                <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-2xl text-rose-800 space-y-1.5 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                    <Info className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Trang Phục Không Khả Dụng (Trùng Lịch):</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-700">
                    {conflictError}
                  </p>
                </div>
              )}
            </div>

            {/* VietQR Payment Display */}
            {showVietQR && (
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl text-center space-y-3 shadow-lg">
                <span className="badge-gold">Chuyển Khoản QR Ngân Hàng</span>
                <p className="text-xs text-slate-300">Quét mã VietQR để thanh toán tiền cọc giữ trang phục:</p>

                <div className="bg-white p-3 rounded-xl inline-block shadow-md">
                  <img
                    src={`https://api.vietqr.io/image/970422-190356789010-compact2.png?amount=${grandTotal}&addInfo=AURA%20THUE%20DO`}
                    alt="VietQR Payment"
                    className="w-48 h-48 object-contain mx-auto"
                  />
                </div>

                {!isPaymentCompleted ? (
                  <button
                    onClick={handleSimulatePayment}
                    className="btn-gold w-full justify-center py-3 text-xs font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Đã Chuyển Khoản Thành Công</span>
                  </button>
                ) : (
                  <div className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 py-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                    <span>Thanh toán thành công! Đơn hàng đã ghi nhận.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Totals & Action */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span>Tiền thuê trang phục:</span>
                <strong className="text-slate-900">{totalRentalPrice.toLocaleString('vi-VN')} VNĐ</strong>
              </div>
              <div className="flex justify-between">
                <span>Tiền đặt cọc quy định:</span>
                <strong className="text-slate-900">{totalDepositAmount.toLocaleString('vi-VN')} VNĐ</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Tổng Thanh Toán Cần Cọc:</span>
                <strong className="text-amber-800 font-extrabold text-base">{grandTotal.toLocaleString('vi-VN')} VNĐ</strong>
              </div>
            </div>

            {!isCheckoutStep ? (
              <button
                onClick={() => setIsCheckoutStep(true)}
                className="btn-gold w-full justify-center py-3.5 text-xs font-bold shadow-md"
              >
                <span>Tiến Hành Đặt Cọc Thuê Đồ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : !showVietQR ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsCheckoutStep(false);
                    setConflictError('');
                  }}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleProceedToQR}
                  disabled={isCheckingConflict}
                  className="btn-gold flex-1 justify-center py-3.5 text-xs font-bold shadow-md disabled:opacity-50"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isCheckingConflict ? 'Đang Kiểm Tra Lịch Trống...' : 'Hiển Thị Mã Thanh Toán VietQR'}</span>
                </button>
              </div>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
