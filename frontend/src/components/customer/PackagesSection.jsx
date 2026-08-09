import React, { useState } from 'react';
import { PACKAGES_DATA, ADDONS_LIST } from '../../data/packages';
import { Check, Calendar, Users, Sparkles, Sliders, ArrowRight } from 'lucide-react';

export default function PackagesSection({ onSelectPackageForBooking }) {
  const [personCount, setPersonCount] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const toggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter((id) => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  const calculatePackageTotal = (basePricePerPerson) => {
    let addonTotal = 0;
    selectedAddons.forEach((id) => {
      const found = ADDONS_LIST.find((a) => a.id === id);
      if (found) addonTotal += found.price;
    });
    return basePricePerPerson * personCount + addonTotal;
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="badge-gold">Bảng Giá Niêm Yết</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-slate-900">
            Các Gói Chụp Ảnh Nghệ Thuật & Kỷ Yếu
          </h2>
          <p className="text-slate-600 text-sm">
            Cam kết giá trọn gói không phát sinh. Tự do tùy chỉnh số lượng người chụp và các dịch vụ cộng thêm linh hoạt.
          </p>
        </div>

        {/* Interactive Price Calculator Controls */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">Máy Tính Giá Tùy Chỉnh Theo Nhóm:</h3>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600">Số Lượng Người Chụp:</label>
              <div className="flex items-center bg-slate-100 rounded-full border border-slate-200 p-1">
                <button
                  onClick={() => setPersonCount(Math.max(1, personCount - 1))}
                  className="w-7 h-7 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 flex items-center justify-center text-xs"
                >
                  -
                </button>
                <span className="w-10 text-center font-extrabold text-slate-900 text-sm">{personCount}</span>
                <button
                  onClick={() => setPersonCount(personCount + 1)}
                  className="w-7 h-7 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Addons Checklist Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 block">Tùy Chọn Dịch Vụ Cộng Thêm (Add-ons):</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ADDONS_LIST.map((addon) => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50 text-slate-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{addon.name}</span>
                    <span className="text-amber-700 font-bold">+{addon.price.toLocaleString('vi-VN')}đ</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid (Bright Studio Vertical Card Design - Cong Studio Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PACKAGES_DATA.map((pkg) => {
            const calculatedTotal = calculatePackageTotal(pkg.basePricePerPerson);
            return (
              <div
                key={pkg.id}
                className={`card-clean rounded-3xl p-8 flex flex-col justify-between relative ${
                  pkg.isPopular ? 'border-2 border-amber-500 shadow-xl bg-gradient-to-b from-amber-50/40 to-white' : 'bg-white'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 badge-gold shadow-md">
                    Gói Được Chọn Nhiều Nhất
                  </div>
                )}

                <div className="space-y-6">
                  {/* Package Title & Price Header */}
                  <div className="border-b border-slate-100 pb-6 space-y-2 text-center">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">{pkg.code}</span>
                    <h3 className="text-2xl font-bold font-serif-title text-slate-900">{pkg.name}</h3>
                    <p className="text-xs text-slate-500">{pkg.subtitle}</p>

                    <div className="pt-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng Chi Phí Dự Tính ({personCount} Người)</span>
                      <strong className="text-3xl font-extrabold text-amber-800 font-serif-title block">
                        {calculatedTotal.toLocaleString('vi-VN')} VNĐ
                      </strong>
                      <span className="text-[11px] text-slate-500 font-medium">({pkg.basePricePerPerson.toLocaleString('vi-VN')}đ / người)</span>
                    </div>
                  </div>

                  {/* Included Features List */}
                  <div className="space-y-3 text-xs">
                    <span className="font-bold text-slate-900 uppercase block tracking-wider text-[11px]">Quyền Lợi Bao Gồm:</span>
                    <ul className="space-y-2.5">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Booking CTA Button */}
                <div className="pt-8 mt-6 border-t border-slate-100">
                  <button
                    onClick={() => onSelectPackageForBooking(pkg)}
                    className={`w-full justify-center py-3.5 text-xs font-bold ${
                      pkg.isPopular ? 'btn-gold' : 'btn-outline-gold'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Đặt Lịch Gói Chụp Này</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
