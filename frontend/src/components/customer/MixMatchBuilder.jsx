import React, { useState } from 'react';
import { VIRTUAL_BUILDER_DATA } from '../../data/costumes';
import { Sparkles, ShoppingBag, RotateCcw, Check, Layers, Image as ImageIcon } from 'lucide-react';

export default function MixMatchBuilder({ onAddToCart }) {
  const [selectedOutfit, setSelectedOutfit] = useState(VIRTUAL_BUILDER_DATA.outfits[0]);
  const [selectedAccessory, setSelectedAccessory] = useState(VIRTUAL_BUILDER_DATA.accessories[0]);
  const [selectedBackdrop, setSelectedBackdrop] = useState(VIRTUAL_BUILDER_DATA.backdrops[0]);

  const totalRentalPrice = selectedOutfit.rentalPrice + (selectedAccessory?.rentalPrice || 0);
  const totalDeposit = selectedOutfit.depositAmount + (selectedAccessory?.depositAmount || 0);

  const handleAddComboToCart = () => {
    const comboItem = {
      id: `COMBO-${Date.now()}`,
      code: `COMBO-${selectedOutfit.id}`,
      name: `Bộ Phối: ${selectedOutfit.name} + ${selectedAccessory?.name || 'Không phụ kiện'}`,
      categoryName: 'Bộ Phối Đồ Ảo',
      rentalPrice: totalRentalPrice,
      depositAmount: totalDeposit,
      image: selectedOutfit.image,
      sizes: ['M', 'L']
    };
    onAddToCart(comboItem);
  };

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="badge-gold">Chức Năng Độc Quyền</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-slate-900">
            Thử Phối Đồ Ảo (Mix & Match Builder)
          </h2>
          <p className="text-slate-600 text-sm">
            Tự do kết hợp Trang phục chính, Phụ kiện đội đầu/cầm tay và Bối cảnh Studio để xem trước phối cảnh bộ ảnh của bạn.
          </p>
        </div>

        {/* Builder Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Preview Display Area */}
          <div className="lg:col-span-7 bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-inner bg-slate-900">
              {/* Studio Background Layer */}
              <img
                src={selectedBackdrop.image}
                alt={selectedBackdrop.name}
                className="w-full h-full object-cover opacity-80"
              />

              {/* Main Model Outfit Layer */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <img
                  src={selectedOutfit.image}
                  alt={selectedOutfit.name}
                  className="max-h-full object-contain filter drop-shadow-2xl animate-in fade-in duration-300"
                />
              </div>

              {/* Top Accessory Overlay Badge */}
              {selectedAccessory && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-md flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>+ {selectedAccessory.name}</span>
                </div>
              )}

              {/* Bottom Backdrop Info Overlay */}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-medium border border-slate-700">
                <span> Bối cảnh: {selectedBackdrop.name}</span>
              </div>
            </div>

            {/* Total Combo Price Summary Box */}
            <div className="glass-panel-gold p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-amber-800 font-bold uppercase block">Tổng Giá Thuê Combo / 24H:</span>
                <strong className="text-2xl font-extrabold text-amber-900 font-serif-title">
                  {totalRentalPrice.toLocaleString('vi-VN')} VNĐ
                </strong>
                <span className="text-[11px] text-slate-600 block">
                  (Tiền cọc quy định: {totalDeposit.toLocaleString('vi-VN')}đ)
                </span>
              </div>

              <button
                onClick={handleAddComboToCart}
                className="btn-gold px-6 py-3 text-xs font-bold w-full sm:w-auto"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm Bộ Phối Này Vào Giỏ</span>
              </button>
            </div>
          </div>

          {/* Right: Customization Controls (Tabs & Options List) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Select Main Outfit */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-slate-800 tracking-wider block flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center">1</span>
                <span>Chọn Trang Phục Chủ Đạo:</span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                {VIRTUAL_BUILDER_DATA.outfits.map((outfit) => (
                  <button
                    key={outfit.id}
                    onClick={() => setSelectedOutfit(outfit)}
                    className={`p-2 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      selectedOutfit.id === outfit.id
                        ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={outfit.image}
                      alt={outfit.name}
                      className="w-full h-24 object-cover rounded-xl mb-2"
                    />
                    <span className="text-[11px] font-bold text-slate-900 block line-clamp-1">{outfit.name}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">{outfit.rentalPrice.toLocaleString('vi-VN')}đ</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Select Accessory */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-slate-800 tracking-wider block flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center">2</span>
                <span>Chọn Phụ Kiện Đi Kèm:</span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                {VIRTUAL_BUILDER_DATA.accessories.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccessory(acc)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      selectedAccessory.id === acc.id
                        ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block line-clamp-1">{acc.name}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">+{acc.rentalPrice.toLocaleString('vi-VN')}đ</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Select Backdrop Environment */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-slate-800 tracking-wider block flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center">3</span>
                <span>Chọn Bối Cảnh Studio:</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                {VIRTUAL_BUILDER_DATA.backdrops.map((bd) => (
                  <button
                    key={bd.id}
                    onClick={() => setSelectedBackdrop(bd)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      selectedBackdrop.id === bd.id
                        ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <img src={bd.image} alt={bd.name} className="w-10 h-10 rounded-xl object-cover" />
                    <span className="text-xs font-bold text-slate-900">{bd.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
