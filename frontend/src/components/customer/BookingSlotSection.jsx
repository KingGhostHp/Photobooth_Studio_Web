import React, { useState } from 'react';
import { TIME_SLOTS, SHOOT_TYPES } from '../../data/bookings';
import { Calendar, Clock, User, Phone, CheckCircle, QrCode, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingSlotSection({ selectedPackage, onBookingComplete }) {
  const [selectedDate, setSelectedDate] = useState('2026-08-10');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [selectedType, setSelectedType] = useState(SHOOT_TYPES[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const depositPrice = selectedPackage ? selectedPackage.basePricePerPerson * 0.3 : 300000;

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="badge-gold">Hệ Thống Đặt Lịch Ca Giờ Online</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-slate-900">
            Đặt Lịch Ca Chụp & Tư Vấn
          </h2>
          <p className="text-slate-600 text-sm">
            Chọn ngày, ca giờ chụp và hoàn tất giữ chỗ để ekip Aura Studio phục vụ tốt nhất.
          </p>
        </div>

        {/* 2-Column Booking Form & Slot Selector (Inspired by Cong Studio Contact/Booking Layout) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form & Details */}
          <div className="lg:col-span-7 space-y-6">
            {!isSuccess ? (
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                
                {/* 1. Date & Type Select */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 uppercase block">1. Chọn Ngày Chụp:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 uppercase block">2. Loaị Hình Chụp:</label>
                    <select
                      value={selectedType.id}
                      onChange={(e) => setSelectedType(SHOOT_TYPES.find((t) => t.id === e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      {SHOOT_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Slot Picker Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 uppercase block">3. Chọn Ca Giờ Còn Trống:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        type="button"
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          selectedSlot.id === slot.id
                            ? 'border-amber-600 bg-amber-50 text-amber-900 font-extrabold ring-2 ring-amber-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-amber-600" />
                        <span className="text-xs block">{slot.time}</span>
                        <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Còn trống</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Customer Info */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 uppercase block">4. Thông Tin Khách Hàng:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Họ và tên *"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="Số điện thoại Zalo *"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-gold w-full justify-center py-4 text-sm font-bold shadow-lg"
                >
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>Xác Nhận Giữ Lịch Ca Giờ</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-12 space-y-4 animate-in zoom-in-95 duration-200">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-bold font-serif-title text-slate-900">Đặt Lịch Ca Giờ Thành Công!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Ekip Aura Studio đã nhận được yêu cầu giữ chỗ của quý khách cho ca <strong>{selectedSlot.time}</strong> ngày <strong>{selectedDate}</strong>. Chuyên viên sẽ gọi điện tư vấn trong 15 phút.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="btn-outline-gold px-6 py-2.5 text-xs font-bold"
                >
                  Đặt Thêm Lịch Khác
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Payment & Deposit Summary Box */}
          <div className="lg:col-span-5 bg-amber-50/60 p-6 rounded-3xl border border-amber-200 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="badge-gold">Tóm Tắt Giữ Lịch</span>
              
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-2 border-b border-amber-200/60">
                  <span>Gói đã chọn:</span>
                  <strong className="text-slate-900">{selectedPackage ? selectedPackage.name : 'Gói Chụp Tùy Chỉnh'}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/60">
                  <span>Ngày thực hiện:</span>
                  <strong className="text-slate-900">{selectedDate}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/60">
                  <span>Khung giờ chụp:</span>
                  <strong className="text-amber-800">{selectedSlot.time}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/60">
                  <span>Địa điểm:</span>
                  <strong className="text-slate-900">Studio 101 Hoàng Cầu</strong>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 text-center space-y-2 shadow-sm">
                <span className="text-xs text-amber-800 font-bold uppercase block">Số Tiền Đặt Cọc Giữ Chỗ (30%):</span>
                <strong className="text-3xl font-extrabold text-amber-900 font-serif-title block">
                  {depositPrice.toLocaleString('vi-VN')} VNĐ
                </strong>
                <p className="text-[10px] text-slate-500">Khách hàng có thể chuyển khoản QR hoặc cọc trực tiếp tại cửa hàng.</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-amber-200 text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">Quét QR VietQR Chuyển Cọc Giữ Lịch:</span>
              <img
                src={`https://api.vietqr.io/image/970422-190356789010-compact2.png?amount=${depositPrice}&addInfo=AURA%20COC%20LICH`}
                alt="VietQR Deposit"
                className="w-36 h-36 object-contain mx-auto rounded-xl border border-slate-100"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
