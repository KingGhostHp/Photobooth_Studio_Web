import React, { useState } from 'react';
import { TIME_SLOTS, STAFF_LIST } from '../../data/bookings';
import { 
  Calendar as CalendarIcon, 
  UserCheck, 
  Clock, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Ban, 
  Phone, 
  Mail, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import CustomSelect from '../common/CustomSelect';
import { getVietnamDateString } from '../../utils/vietnamTime';

export default function AdminCalendar({ orders = [], onUpdateOrder, onRefreshOrders }) {
  const todayStr = getVietnamDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [assignedStaff, setAssignedStaff] = useState({});

  const assignStaffToSlot = (slotId, staffId) => {
    setAssignedStaff({ ...assignedStaff, [slotId]: staffId });
  };

  // Find active order for a given slot on selectedDate
  const getSlotOrder = (timeSlot) => {
    return orders.find(
      (o) =>
        o.bookingDate === selectedDate &&
        o.timeSlot === timeSlot &&
        o.bookingStatus !== 'CANCELLED' &&
        o.paymentStatus !== 'CANCELLED'
    );
  };

  // Handle Cancel Booking from Calendar
  const handleCancelSlotBooking = (order) => {
    if (
      window.confirm(
        `Xác nhận HỦY ĐẶT LỊCH cho khách hàng "${order.customerName}" (Đơn #${order.id})?\n\nCa giờ "${order.timeSlot}" ngày ${selectedDate} sẽ được chuyển ngay về trạng thái "CÒN TRỐNG".`
      )
    ) {
      if (onUpdateOrder) {
        onUpdateOrder({
          ...order,
          bookingStatus: 'CANCELLED',
          paymentStatus: 'CANCELLED',
          notes: `${order.notes || ''} [Admin đã hủy lịch từ Lịch Studio - Đặt lại trạng thái Còn Trống]`
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Date Header Picker */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-title text-slate-900">Điều Phối Ca Chụp & Lịch Studio</h2>
          <p className="text-xs text-slate-500">
            Xem danh sách khách đặt theo ca giờ, điều phối Ekip hoặc hủy lịch để thủ công đưa ca giờ về <strong>"Còn Trống"</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Chọn Ngày:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Slots List */}
      <div className="space-y-4">
        {TIME_SLOTS.map((slot) => {
          const currentAssignee = assignedStaff[slot.id];
          const slotOrder = getSlotOrder(slot.time);
          const isBooked = Boolean(slotOrder);

          return (
            <div
              key={slot.id}
              className={`p-6 rounded-3xl border transition-all ${
                isBooked
                  ? 'bg-amber-50/40 border-amber-300 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                
                {/* Slot Info & Booking Status */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-gold">{slot.label}</span>
                    <h3 className="font-extrabold text-base text-slate-900 font-serif-title flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{slot.time}</span>
                    </h3>

                    {isBooked ? (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                        <span>Đã có khách đặt (# {slotOrder.id})</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Còn trống (Sẵn sàng nhận khách)</span>
                      </span>
                    )}
                  </div>

                  {/* Customer Booking Details if booked */}
                  {isBooked && (
                    <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/80 mt-2 space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-4 text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-600" />
                          <span>Khách hàng: <strong>{slotOrder.customerName}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>SĐT: <strong>{slotOrder.phone}</strong></span>
                        </div>
                        {slotOrder.email && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{slotOrder.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 pt-0.5">
                        Dịch vụ: <strong className="text-amber-900">{slotOrder.serviceType}</strong> • Chi tiết: {slotOrder.itemDetails || 'Không có mô tả'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Staff Assignment & Manual Reset to Còn Trống Button */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* Staff Select */}
                  <div className="w-full sm:w-56">
                    <CustomSelect
                      value={currentAssignee || ''}
                      onChange={(val) => assignStaffToSlot(slot.id, val)}
                      options={[
                        { label: '-- Phân Công Ekip --', value: '' },
                        ...STAFF_LIST.map((stf) => ({
                          label: `${stf.name} (${stf.role === 'PHOTOGRAPHER' ? 'Photo' : 'Makeup'})`,
                          value: stf.id
                        }))
                      ]}
                      placeholder="Phân Công Ekip"
                      icon={User}
                    />
                  </div>

                  {/* If slot is booked, offer Admin manual Cancel / Reset button */}
                  {isBooked && (
                    <button
                      onClick={() => handleCancelSlotBooking(slotOrder)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-2xl text-xs flex items-center gap-1.5 border border-rose-200 transition-all shadow-sm hover:scale-105 active:scale-95"
                      title="Hủy lịch đặt này và lập tức mở lại ca giờ về trạng thái Còn Trống"
                    >
                      <Ban className="w-4 h-4 text-rose-600" />
                      <span>Hủy Lịch (Đặt Lại Còn Trống)</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
