import React, { useState } from 'react';
import { COSTUMES_DATA } from '../../data/costumes';
import { Shirt, Sparkles, AlertCircle, RefreshCw, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminInventory() {
  const [costumeList, setCostumeList] = useState(COSTUMES_DATA);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const updateCostumeStatus = (id, newStatus) => {
    setCostumeList(costumeList.map(item => item.id === id ? { ...item, availableStatus: newStatus } : item));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-serif-title text-slate-900">Quản Lý Vòng Đời Kho Trang Phục</h2>
          <p className="text-xs text-slate-500">Theo dõi trạng thái: Sẵn sàng, Đang cho thuê, Đang giặt sấy, Cần sửa chữa.</p>
        </div>

        <button className="btn-gold px-4 py-2.5 text-xs font-bold shadow-md">
          <Plus className="w-4 h-4" />
          <span>Thêm Mới Mẫu Trang Phục</span>
        </button>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {costumeList.map((item) => (
          <div key={item.id} className="card-clean bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 badge-gold">
                  {item.code}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-amber-700 font-bold uppercase">{item.categoryName}</span>
                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h3>
                <div className="text-xs text-slate-600 flex justify-between pt-1">
                  <span>Giá thuê: <strong>{item.rentalPrice.toLocaleString('vi-VN')}đ</strong></span>
                  <span>Cọc: <strong>{item.depositAmount.toLocaleString('vi-VN')}đ</strong></span>
                </div>
              </div>
            </div>

            {/* Lifecycle Status Select Bar */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Cập Nhật Trạng Thái Kho:</label>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                <button
                  onClick={() => updateCostumeStatus(item.id, 'AVAILABLE')}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                    item.availableStatus === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Sẵn Sàng
                </button>

                <button
                  onClick={() => updateCostumeStatus(item.id, 'RENTED')}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                    item.availableStatus === 'RENTED'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Đang Thuê
                </button>

                <button
                  onClick={() => updateCostumeStatus(item.id, 'LAUNDRY')}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                    item.availableStatus === 'LAUNDRY'
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Giặt Sấy
                </button>

                <button
                  onClick={() => updateCostumeStatus(item.id, 'REPAIR')}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                    item.availableStatus === 'REPAIR'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Cần Sửa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
