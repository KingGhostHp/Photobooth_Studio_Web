import React, { useState, useEffect, useRef } from 'react';
import { PHOTOBOOTH_CONCEPTS } from '../../data/photobooth';
import { TIME_SLOTS } from '../../data/bookings';
import { 
  Camera, 
  Sparkles, 
  CheckCircle, 
  Calendar, 
  ArrowRight, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  XCircle, 
  ClockAlert,
  Zap,
  Tag,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getVietnamDateString, getVietnamTime, isSlotInPastVietnam } from '../../utils/vietnamTime';

export default function PhotoboothSection({ onCompleteBooking, initialSelectedConcept = null }) {
  const [concepts, setConcepts] = useState(PHOTOBOOTH_CONCEPTS);
  const [selectedConcept, setSelectedConcept] = useState(initialSelectedConcept || PHOTOBOOTH_CONCEPTS[0]);

  // Booking Slot Form state (Vietnam Timezone GMT+7)
  const todayStr = getVietnamDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Realtime Booked Slots state from PostgreSQL
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [conflictWarning, setConflictWarning] = useState('');

  const bookingFormRef = useRef(null);

  // Fetch photobooth concepts from database API
  useEffect(() => {
    fetch('/api/photobooth')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setConcepts(data.data);
          if (!initialSelectedConcept) {
            setSelectedConcept(data.data[0]);
          }
        }
      })
      .catch(err => console.warn('Using fallback photobooth concepts:', err));
  }, [initialSelectedConcept]);

  // Fetch Booked Slots whenever selectedDate changes
  const fetchBookedSlots = async (date) => {
    if (!date) return;
    setIsLoadingSlots(true);
    setConflictWarning('');
    try {
      const res = await fetch(`/api/orders/booked-slots?date=${date}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBookedSlots(data.data);
        
        // Check if current selected slot is past or booked
        const isCurrentSlotUnavailable = 
          isSlotInPastVietnam(date, selectedSlot?.time) || 
          data.data.includes(selectedSlot?.time);

        if (isCurrentSlotUnavailable) {
          const firstAvailable = TIME_SLOTS.find(
            s => !isSlotInPastVietnam(date, s.time) && !data.data.includes(s.time)
          );
          if (firstAvailable) {
            setSelectedSlot(firstAvailable);
          }
        }
      } else {
        setBookedSlots([]);
      }
    } catch (err) {
      console.warn('Lỗi khi tải ca giờ đã đặt:', err);
      setBookedSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchBookedSlots(selectedDate);
  }, [selectedDate]);

  const handleSelectConcept = (concept) => {
    setSelectedConcept(concept);
    if (bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentPrice = Number(selectedConcept?.price || 100000);
  const depositAmount = selectedConcept?.deposit 
    ? Number(selectedConcept.deposit) 
    : (currentPrice <= 200000 ? currentPrice : Math.round(currentPrice * 0.5));

  const isSelectedDateInPast = selectedDate < todayStr;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại Zalo và Email!');
      return;
    }

    // Check if selected date or slot is in the past (Vietnam time)
    if (isSlotInPastVietnam(selectedDate, selectedSlot.time)) {
      const errorMsg = selectedDate < todayStr
        ? `Ngày ${selectedDate} đã qua theo giờ Việt Nam và không còn khả dụng!`
        : `Ca giờ ${selectedSlot.time} hôm nay đã qua theo giờ Việt Nam và không còn khả dụng! Vui lòng chọn ca giờ tiếp theo.`;
      setConflictWarning(errorMsg);
      alert(errorMsg);
      return;
    }

    // Verify slot is not booked
    if (bookedSlots.includes(selectedSlot.time)) {
      setConflictWarning(`Ca giờ ${selectedSlot.time} ngày ${selectedDate} đã có khách đặt trước! Vui lòng chọn ca giờ khác.`);
      alert(`Ca giờ ${selectedSlot.time} ngày ${selectedDate} đã có khách đặt trước! Vui lòng chọn ca giờ khác.`);
      return;
    }

    setIsSubmitting(true);
    setConflictWarning('');

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        serviceType: `Photobooth: ${selectedConcept?.name || 'Cabin Chụp Tự Động'}`,
        itemDetails: `Cabin Photobooth (${selectedConcept?.name || 'Tiêu Chuẩn'}) - 4 Strip Prints + File GIF`,
        bookingDate: selectedDate,
        returnDate: selectedDate,
        rentalDays: 1,
        timeSlot: selectedSlot.time,
        totalAmount: currentPrice,
        depositAmount: depositAmount,
        penaltyFee: 0,
        paymentStatus: depositAmount >= currentPrice ? 'PAID_FULL' : 'DEPOSITED_50%',
        bookingStatus: 'CONFIRMED',
        assignedPhotographer: 'Cabin Tự Động',
        assignedMakeup: 'Khu vực Makeup Studio',
        notes: `Khách đặt lịch Photobooth concept ${selectedConcept?.name} ca ${selectedSlot.time} ngày ${selectedDate}.`
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        if (resData.conflict) {
          setConflictWarning(resData.message || 'Ca giờ này vừa có khách đặt trước. Vui lòng chọn ca giờ khác!');
          alert(resData.message || 'Ca giờ này vừa có khách đặt trước. Vui lòng chọn ca giờ khác!');
          fetchBookedSlots(selectedDate);
        } else {
          alert(resData.message || 'Có lỗi xảy ra khi đặt lịch!');
        }
        setIsSubmitting(false);
        return;
      }

      if (resData.success && resData.data) {
        setConfirmedOrder(resData.data);
        if (onCompleteBooking) {
          onCompleteBooking(resData.data);
        }
        fetchBookedSlots(selectedDate);
      }

      setIsSuccess(true);
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });
      setIsSubmitting(false);
    } catch (err) {
      console.error('Lỗi khi lưu lịch đặt:', err);
      alert('Có lỗi xảy ra khi lưu lịch đặt. Vui lòng thử lại!');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Cabin Chụp Ảnh Tự Động & Đặt Lịch Ca Giờ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-slate-900">
            Aura Photobooth Studio
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Trải nghiệm cabin chụp ảnh tự động phong cách Hàn Quốc & Đa dạng Concept. In ảnh liền sau 30 giây kèm QR tải file GIF & video hiệu ứng. Chọn concept và giữ ca giờ chụp trực tuyến ngay bên dưới.
          </p>
        </div>

        {/* Photobooth Showcase & Concept Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          
          {/* Left: Concept Display Image */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-slate-900">
              <img
                src={selectedConcept?.image || '/images/costume_ao_dai_viet_1786199756012.png'}
                alt={selectedConcept?.name || 'Photobooth'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <span className="text-xs text-amber-400 font-bold uppercase">{selectedConcept?.code || 'PHOTOBOOTH'}</span>
                  <h3 className="text-2xl font-bold font-serif-title">{selectedConcept?.name}</h3>
                  <p className="text-xs text-slate-300">{selectedConcept?.description}</p>
                </div>
              </div>
            </div>

            {/* Concept Thumbnails List */}
            <div className="grid grid-cols-3 gap-3">
              {concepts.map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => setSelectedConcept(concept)}
                  className={`p-2 rounded-2xl border text-left transition-all ${
                    selectedConcept?.id === concept.id
                      ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <img 
                    src={concept.image || '/images/costume_ao_dai_viet_1786199756012.png'} 
                    alt={concept.name} 
                    className="w-full h-16 object-cover rounded-xl mb-1.5" 
                  />
                  <span className="text-[11px] font-bold text-slate-900 block line-clamp-1">{concept.name}</span>
                  <span className="text-[10px] text-amber-700 font-extrabold block">
                    {(Number(concept.price) || 0).toLocaleString('vi-VN')} đ
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Concept Details & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="badge-gold">Mở Cửa: 08:00 - 22:00 Hàng Ngày</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-title">
                Cabin Chụp {selectedConcept?.name}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {selectedConcept?.description || 'Cabin chụp 1-6 người với hệ thống đèn studio chuẩn beauty, đạo cụ hóa trang đa dạng phong cách.'}
              </p>
            </div>

            {/* Price Tag Box */}
            <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/40 p-5 rounded-2xl border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-800 font-bold uppercase block">Giá Vé Chụp / 1 Lượt (4 Strip Prints):</span>
                <strong className="text-3xl font-extrabold text-amber-900 font-serif-title">
                  {currentPrice.toLocaleString('vi-VN')} VNĐ
                </strong>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 font-bold px-3 py-1 rounded-full">
                In Liền 30 Giây
              </span>
            </div>

            {/* Perks Checklist */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Đặc Quyền Đi Kèm Lượt Chụp:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                {(Array.isArray(selectedConcept?.perks) && selectedConcept.perks.length > 0 ? selectedConcept.perks : [
                  'Miễn phí mượn 50+ phụ kiện',
                  'File ảnh gốc + Video GIF hậu trường',
                  'In 4 dải ảnh Strip Glossy cao cấp',
                  'Quét mã QR lấy file siêu tốc'
                ]).map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-700">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectConcept(selectedConcept)}
              className="btn-gold w-full justify-center py-3.5 text-xs font-bold shadow-lg hover:scale-[1.01] active:scale-98 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Chọn Cabin & Đặt Lịch Ca Giờ Trực Tuyến</span>
            </button>
          </div>

        </div>

        {/* =========================================================================
           PART 2: INTEGRATED TIME-SLOT BOOKING FORM FOR PHOTOBOOTH
           ========================================================================= */}
        <div ref={bookingFormRef} className="pt-6 scroll-mt-24">
          <div className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Booking Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="badge-gold">Giữ Chỗ Trực Tuyến</span>
                <h3 className="text-2xl font-bold text-slate-900 font-serif-title mt-2">
                  Đặt Lịch Ca Giờ Cabin Photobooth
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Đang đặt lịch cho: <strong className="text-amber-800">{selectedConcept?.name}</strong> • Giờ Việt Nam (GMT+7)
                </p>
              </div>

              {/* Conflict or Past Alert Banner */}
              {conflictWarning && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-3 animate-in shake">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              {isSelectedDateInPast && (
                <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-2xl text-xs text-slate-700 font-bold flex items-center gap-2.5">
                  <ClockAlert className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <span>Ngày đã chọn ({selectedDate}) là ngày trong quá khứ. Tất cả ca chụp đều không khả dụng. Vui lòng chọn từ ngày hôm nay ({todayStr}) trở đi.</span>
                </div>
              )}

              <form onSubmit={handleSubmitBooking} className="space-y-6">
                
                {/* Step 1 & 2: Date & Concept Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>1. Chọn Ngày Chụp (Từ hôm nay):</span>
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white text-slate-900 px-4 py-3 rounded-2xl border border-slate-300 font-bold text-sm focus:outline-none focus:border-amber-500 shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>2. Chọn Concept Cabin:</span>
                    </label>
                    <select
                      value={selectedConcept?.id}
                      onChange={(e) => {
                        const found = concepts.find(c => c.id === e.target.value);
                        if (found) setSelectedConcept(found);
                      }}
                      className="w-full bg-white text-slate-900 px-4 py-3 rounded-2xl border border-slate-300 font-bold text-sm focus:outline-none focus:border-amber-500 shadow-sm"
                    >
                      {concepts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} - {(Number(c.price) || 0).toLocaleString('vi-VN')} VNĐ
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 3: Select Time Slot */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>3. Chọn Ca Giờ Còn Trống Ngày {selectedDate}:</span>
                    </label>
                    {isLoadingSlots && (
                      <span className="text-[11px] text-amber-600 font-semibold animate-pulse">
                        Đang đồng bộ ca trống...
                      </span>
                    )}
                  </div>

                  {bookedSlots.length > 0 && !isSelectedDateInPast && (
                    <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Ngày {selectedDate} đã có <strong>{bookedSlots.length}</strong> ca giờ được giữ chỗ (hiển thị <strong className="text-rose-600">"Đã kín lịch"</strong>). Quý khách vui lòng chọn các ca giờ <strong className="text-emerald-700">"Còn trống"</strong>.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.includes(slot.time);
                      const isPast = isSlotInPastVietnam(selectedDate, slot.time);
                      const isUnavailable = isBooked || isPast;
                      const isSelected = selectedSlot.id === slot.id && !isUnavailable;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setConflictWarning('');
                          }}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-center items-center gap-1 ${
                            isSelected
                              ? 'border-2 border-amber-500 bg-amber-50 text-slate-900 font-extrabold shadow-md ring-2 ring-amber-500/20'
                              : isPast
                                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through opacity-60'
                                : isBooked
                                  ? 'border-rose-200 bg-rose-50 text-rose-400 cursor-not-allowed'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-amber-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`text-xs font-bold ${isPast ? 'line-through' : ''}`}>
                            {slot.time}
                          </span>
                          <span className={`text-[10px] font-semibold ${
                            isPast
                              ? 'text-slate-400'
                              : isBooked
                                ? 'text-rose-500 font-bold'
                                : isSelected
                                  ? 'text-emerald-700 font-bold'
                                  : 'text-emerald-600'
                          }`}>
                            {isPast ? '● Không khả dụng' : isBooked ? '● Đã kín lịch' : '● Còn trống'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 4: Customer Information */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>4. Thông Tin Khách Hàng Đặt Lịch:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Họ và tên *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="bg-white text-slate-900 px-4 py-3 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:border-amber-500 shadow-sm"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Số điện thoại Zalo *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="bg-white text-slate-900 px-4 py-3 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:border-amber-500 shadow-sm"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Địa chỉ Email / Gmail *"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="bg-white text-slate-900 px-4 py-3 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:border-amber-500 shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isSlotInPastVietnam(selectedDate, selectedSlot.time) || bookedSlots.includes(selectedSlot.time)}
                  className="w-full btn-gold py-4 text-sm font-extrabold justify-center shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang Xử Lý Đặt Lịch...' : 'Xác Nhận Giữ Lịch Ca Giờ & Nhận Email Xác Nhận'}</span>
                </button>
              </form>
            </div>

            {/* Right Column: Order Summary & VietQR Transfer (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/70 to-amber-100/30 rounded-3xl p-6 sm:p-8 border border-amber-200/80 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                  <span className="badge-gold">Tóm Tắt Giữ Lịch</span>
                  <span className="text-xs font-bold text-amber-800 font-mono">
                    {selectedConcept?.code || 'PHOTOBOOTH'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cabin chụp:</span>
                    <strong className="text-slate-900">{selectedConcept?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày thực hiện:</span>
                    <strong className="text-slate-900">{selectedDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khung giờ chụp:</span>
                    <strong className="text-amber-800 font-bold">{selectedSlot.time}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Địa điểm:</span>
                    <span className="text-slate-800 font-semibold">Studio Thiên Hương, Hải Phòng</span>
                  </div>
                </div>

                {/* Deposit Amount Display */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-200 text-center space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">
                    Số Tiền Đặt Cọc Giữ Chỗ:
                  </span>
                  <div className="text-2xl font-black text-amber-900 font-serif-title">
                    {depositAmount.toLocaleString('vi-VN')} VNĐ
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    (Tổng chi phí vé: {currentPrice.toLocaleString('vi-VN')} VNĐ)
                  </span>
                </div>

                {/* Dynamic VietQR Block */}
                <div className="bg-white p-4 rounded-2xl border border-amber-200 text-center space-y-2 shadow-inner">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Quét QR VietQR Chuyển Cọc Giữ Lịch:
                  </span>
                  <div className="w-36 h-36 mx-auto bg-slate-100 p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                    <img
                      src={`https://api.vietqr.io/image/970422-0975397923-qM3y46g.jpg?accountName=AURA%20STUDIO&amount=${depositAmount}&addInfo=${encodeURIComponent(`AURA PHOTOBOOTH ${customerPhone || '0975397923'}`)}`}
                      alt="VietQR MB Bank"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Ngân hàng Quân Đội (MB Bank) - STK: <strong>0975397923</strong> (Aura Studio)
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-200/60 text-center">
                <p className="text-[11px] text-slate-500 leading-tight">
                  🔒 Lịch đặt được bảo lưu 24H. Sau khi đặt, nhân viên sẽ gửi email & liên hệ Zalo xác nhận ngay.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Success Modal Confirmation */}
      {isSuccess && confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-5 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-serif-title text-slate-900">
                Đặt Lịch Photobooth Thành Công!
              </h3>
              <p className="text-xs text-slate-600">
                Hệ thống đã lưu thông tin giữ lịch của bạn vào cơ sở dữ liệu.
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã Đơn Hàng:</span>
                <strong className="text-amber-800 font-mono font-bold text-sm">{confirmedOrder.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng:</span>
                <strong className="text-slate-900">{confirmedOrder.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dịch vụ:</span>
                <strong className="text-slate-900">{confirmedOrder.serviceType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày & Ca giờ:</span>
                <strong className="text-slate-900">{confirmedOrder.bookingDate} ({confirmedOrder.timeSlot})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tiền cọc giữ lịch:</span>
                <strong className="text-emerald-600 font-bold">{(Number(confirmedOrder.depositAmount) || 0).toLocaleString('vi-VN')} VNĐ</strong>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSuccess(false);
                setConfirmedOrder(null);
              }}
              className="btn-gold w-full justify-center py-3 text-xs font-bold"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
