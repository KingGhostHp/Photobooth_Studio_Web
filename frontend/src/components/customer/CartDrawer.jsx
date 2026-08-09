import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveFromCart,
  onClearCart,
  onProceedToBooking
}) {
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    startDate: '',
    returnDate: '',
    note: ''
  });
  const [showVietQR, setShowVietQR] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  if (!isOpen) return null;

  const totalRentalPrice = cartItems.reduce((sum, item) => sum + item.rentalPrice, 0);
  const totalDepositAmount = cartItems.reduce((sum, item) => sum + item.depositAmount, 0);
  const grandTotal = totalRentalPrice + totalDepositAmount;

  const handleSimulatePayment = () => {
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
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-250 border-l border-slate-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-lg text-slate-900 font-serif-title">
              {isCheckoutStep ? 'Thanh Toán Đặt Cọc' : 'Giỏ Thuê Trang Phục'}
            </h3>
            <span className="badge-gold">
              {cartItems.length} Món
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isCheckoutStep ? (
          /* Step 1: Cart Items List */
          <div className="flex-1 py-4 space-y-4 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 text-sm font-medium">Giỏ thuê của bạn hiện đang trống.</p>
                <button onClick={onClose} className="btn-outline-gold px-5 py-2 text-xs font-bold">
                  Khám Phá Kho Trang Phục
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="card-clean p-3 rounded-2xl flex items-center justify-between gap-3 border border-slate-200"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-xl bg-slate-100"
                  />
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] text-amber-700 font-bold uppercase">{item.categoryName}</span>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.name}</h4>
                    <div className="text-[11px] text-slate-600 space-x-2">
                      <span>Thuê: <strong>{item.rentalPrice.toLocaleString('vi-VN')}đ</strong></span>
                      <span>• Cọc: <strong>{item.depositAmount.toLocaleString('vi-VN')}đ</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromCart(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Step 2: Checkout Form & Dates */
          <div className="flex-1 py-4 space-y-4 overflow-y-auto text-xs">
            <div className="space-y-3">
              <label className="font-bold text-slate-900 block">Thông Tin Người Thuê:</label>
              <input
                type="text"
                placeholder="Họ và tên khách hàng *"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <input
                type="tel"
                placeholder="Số điện thoại Zalo *"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày nhận đồ:</label>
                <input
                  type="date"
                  value={customerInfo.startDate}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, startDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày trả đồ:</label>
                <input
                  type="date"
                  value={customerInfo.returnDate}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, returnDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            {showVietQR && (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-center space-y-3">
                <span className="badge-gold">Chuyển Khoản QR Ngân Hàng</span>
                <p className="text-xs text-slate-700">Quét mã VietQR để thanh toán tiền cọc thuê đồ:</p>

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
                    className="btn-gold w-full justify-center py-3 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Đã Chuyển Khoản</span>
                  </button>
                ) : (
                  <div className="text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
                    <span>Thanh toán thành công! Đơn hàng đã được lưu.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Totals & Action */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tiền thuê trang phục:</span>
                <strong className="text-slate-900">{totalRentalPrice.toLocaleString('vi-VN')} VNĐ</strong>
              </div>
              <div className="flex justify-between">
                <span>Tiền đặt cọc quy định:</span>
                <strong className="text-slate-900">{totalDepositAmount.toLocaleString('vi-VN')} VNĐ</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-900">
                <span>Tổng Thanh Toán Cần Cọc:</span>
                <strong className="text-amber-700 font-extrabold">{grandTotal.toLocaleString('vi-VN')} VNĐ</strong>
              </div>
            </div>

            {!isCheckoutStep ? (
              <button
                onClick={() => setIsCheckoutStep(true)}
                className="btn-gold w-full justify-center py-3.5 text-xs font-bold"
              >
                <span>Tiến Hành Đặt Cọc Thuê Đồ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : !showVietQR ? (
              <button
                onClick={() => setShowVietQR(true)}
                className="btn-gold w-full justify-center py-3.5 text-xs font-bold"
              >
                <QrCode className="w-4 h-4" />
                <span>Hiển Thị Mã Thanh Toán VietQR</span>
              </button>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
