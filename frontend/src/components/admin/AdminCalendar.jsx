import React, { useState } from 'react';
import { TIME_SLOTS, STAFF_LIST } from '../../data/bookings';
import { Calendar as CalendarIcon, UserCheck, Clock, Shield, Sparkles, CheckCircle2, User } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState('2026-08-10');
  const [assignedStaff, setAssignedStaff] = useState({});

  const assignStaffToSlot = (slotId, staffId) => {
    setAssignedStaff({ ...assignedStaff, [slotId]: staffId });
  };

  return (
    <div className="space-y-8">
      
      {/* Date Header Picker */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-title text-slate-900">Điều Phối Ca Chụp & Ekip Studio</h2>
          <p className="text-xs text-slate-500">Phân công Nhiếp ảnh gia & Chuyên viên Makeup theo khung giờ đã nhận lịch.</p>
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

          return (
            <div
              key={slot.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge-gold">{slot.label}</span>
                  <h3 className="font-extrabold text-base text-slate-900 font-serif-title flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{slot.time}</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Sức chứa studio: <strong>{slot.capacity} khách</strong> • Đã nhận: <strong>{slot.bookedCount} khách</strong>
                </p>
              </div>

              {/* Staff Assignment Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="w-full sm:w-64">
                  <CustomSelect
                    value={currentAssignee || ''}
                    onChange={(val) => assignStaffToSlot(slot.id, val)}
                    options={[
                      { label: '-- Chưa Phân Công Ekip --', value: '' },
                      ...STAFF_LIST.map(stf => ({
                        label: `${stf.name} (${stf.role === 'PHOTOGRAPHER' ? 'Photo' : 'Makeup'})`,
                        value: stf.id
                      }))
                    ]}
                    placeholder="Chưa Phân Công Ekip"
                    icon={User}
                  />
                </div>

                {currentAssignee ? (
                  <span className="text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-2xl flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã Giao Ekip</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold text-xs bg-amber-50 border border-amber-200 px-3 py-2 rounded-2xl">
                    Chờ Phân Công
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
