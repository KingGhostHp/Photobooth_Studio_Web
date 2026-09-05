import React, { useState, useEffect } from 'react';
import { PACKAGES_DATA, ADDONS_LIST } from '../../data/packages';
import { 
  Check, 
  Users, 
  Sparkles, 
  Sliders, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Camera, 
  Award,
  Zap,
  Tag
} from 'lucide-react';

export default function ComboPackagesSection({ onAddToCart, initialSelectedPackage = null }) {
  // Packages & Add-ons state
  const [personCount, setPersonCount] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [packages, setPackages] = useState(PACKAGES_DATA);
  const [addonsList, setAddonsList] = useState(ADDONS_LIST);
  const [selectedPackage, setSelectedPackage] = useState(initialSelectedPackage || PACKAGES_DATA[0]);
  const [addedToast, setAddedToast] = useState(null);

  // Fetch Packages & Add-ons from PostgreSQL API
  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPackages(data.data);
          if (!initialSelectedPackage) {
            setSelectedPackage(data.data[0]);
          }
        }
      })
      .catch(err => console.warn('Using fallback packages:', err));

    fetch('/api/addons')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAddonsList(data.data);
        }
      })
      .catch(err => console.warn('Using fallback addons:', err));
  }, [initialSelectedPackage]);

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
      const found = addonsList.find((a) => a.id === id);
      if (found) addonTotal += Number(found.price || 0);
    });
    return (Number(basePricePerPerson || 0) * personCount) + addonTotal;
  };

  const getSelectedAddonObjects = () => {
    return addonsList.filter(a => selectedAddons.includes(a.id));
  };

  const handleAddPackageToCart = (pkg) => {
    const totalAmount = calculatePackageTotal(pkg.basePricePerPerson || pkg.price);
    const depositAmount = pkg.deposit ? pkg.deposit : Math.round(totalAmount * 0.3);
    const selectedAddonsObjs = getSelectedAddonObjects();
    const addonNames = selectedAddonsObjs.map(a => a.name).join(', ');

    const cartItem = {
      id: `COMBO-${pkg.id || Date.now()}-${Date.now()}`,
      code: pkg.code || 'COMBO',
      name: `Gói Chụp: ${pkg.name}`,
      category: 'combo',
      categoryName: 'Gói Chụp Combo',
      gender: 'Unisex',
      sizes: [`${personCount} Người`],
      rentalPrice: totalAmount,
      depositAmount: depositAmount,
      image: pkg.image || '/images/banners/banner1.png',
      description: `${pkg.subtitle || pkg.name} • ${personCount} người chụp ${addonNames ? '• Thêm: ' + addonNames : ''}`,
      personCount: personCount,
      addons: selectedAddonsObjs,
      itemDetails: `${pkg.name} (${personCount} người) + Dịch vụ thêm: ${addonNames || 'Không'}`
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    }

    setAddedToast(pkg.name);
    setTimeout(() => {
      setAddedToast(null);
    }, 3000);
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200 relative">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-300">Đã thêm vào giỏ: </span>
            <span>{addedToast} ({personCount} người)</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Gói Chụp Nghệ Thuật & Kỷ Yếu Trọn Gói
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-slate-900">
            Bảng Giá Gói Chụp Combo Trọn Gói
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Cam kết trọn gói bao gồm trang phục, makeup và ảnh photoshop hoàn thiện. Tùy chỉnh số lượng người chụp, chọn dịch vụ cộng thêm và thêm trực tiếp vào <strong>Giỏ Hàng</strong> để thanh toán thuận tiện.
          </p>
        </div>

        {/* Interactive Price Calculator Controls */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-700">
                <Sliders className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base font-serif-title">Máy Tính Tùy Chọn Gói Combo:</h3>
                <p className="text-xs text-slate-500">Tự động nhân đơn giá theo số lượng người & cộng dịch vụ phụ</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>Số Lượng Người:</span>
              </label>
              <div className="flex items-center bg-white rounded-full border border-slate-300 p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setPersonCount(Math.max(1, personCount - 1))}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-900 font-bold hover:bg-amber-500 hover:text-white flex items-center justify-center text-xs transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-extrabold text-slate-900 text-sm">{personCount}</span>
                <button
                  type="button"
                  onClick={() => setPersonCount(personCount + 1)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-900 font-bold hover:bg-amber-500 hover:text-white flex items-center justify-center text-xs transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Addons Checklist Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Tùy Chọn Dịch Vụ Cộng Thêm (Add-ons):</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Đã chọn {selectedAddons.length} dịch vụ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {addonsList.map((addon) => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 text-slate-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{addon.name}</div>
                      <div className="text-[11px] text-amber-800 font-extrabold">
                        +{(Number(addon.price) || 0).toLocaleString('vi-VN')} VNĐ
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-amber-500 text-white' : 'bg-slate-200 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const calculatedTotal = calculatePackageTotal(pkg.basePricePerPerson || pkg.price);
            const depositAmt = pkg.deposit ? pkg.deposit : Math.round(calculatedTotal * 0.3);

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                  pkg.isPopular
                    ? 'border-2 border-amber-500 shadow-xl ring-2 ring-amber-500/10'
                    : 'border border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>Gói Được Chọn Nhiều Nhất</span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Title & Subtitle */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                      {pkg.code || 'COMBO'}
                    </span>
                    <h3 className="text-xl font-bold font-serif-title text-slate-900">{pkg.name}</h3>
                    <p className="text-xs text-slate-500">{pkg.subtitle || pkg.description}</p>
                  </div>

                  {/* Calculated Price Display */}
                  <div className="bg-gradient-to-br from-amber-50/50 to-amber-100/30 p-4 rounded-2xl border border-amber-200/60 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                      <span>Tổng Chi Phí ({personCount} người):</span>
                      <span className="text-amber-700 font-bold">Cọc: {depositAmt.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="text-2xl font-black text-amber-900 font-serif-title">
                      {calculatedTotal.toLocaleString('vi-VN')} VNĐ
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Đơn giá gốc: {(Number(pkg.basePricePerPerson || pkg.price) || 0).toLocaleString('vi-VN')} VNĐ / người
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      Đặc Quyền Gói Combo:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {(Array.isArray(pkg.features) ? pkg.features : []).map((feat, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Add to Cart Action Button */}
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleAddPackageToCart(pkg)}
                    className="w-full btn-gold justify-center py-3.5 text-xs font-bold shadow-md hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Thêm Gói Này Vào Giỏ Hàng</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cam kết 100% không phát sinh chi phí ngoài bảng giá niêm yết.</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-600" />
            <span>Nhiếp ảnh gia chuyên nghiệp trên 5 năm kinh nghiệm.</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Tặng kèm toàn bộ file gốc chụp chất lượng cao sau buổi chụp.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
