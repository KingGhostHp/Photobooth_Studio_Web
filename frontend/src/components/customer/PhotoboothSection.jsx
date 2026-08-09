import React, { useState } from 'react';
import { PHOTOBOOTH_CONCEPTS } from '../../data/photobooth';
import { Camera, Sparkles, CheckCircle, Calendar, ArrowRight } from 'lucide-react';

export default function PhotoboothSection({ onBookPhotobooth }) {
  const [selectedConcept, setSelectedConcept] = useState(PHOTOBOOTH_CONCEPTS[0]);

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="badge-gold">Chụp Ảnh Nhanh Y2K</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title text-slate-900">
            Aura Photobooth Studio Y2K
          </h2>
          <p className="text-slate-600 text-sm">
            Trải nghiệm cabin chụp ảnh tự động phong cách Hàn Quốc & Retro Y2K. In ảnh liền sau 30 giây kèm QR tải file GIF & video hiệu ứng.
          </p>
        </div>

        {/* Photobooth Showcase & Booking Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
          
          {/* Left: Concept Display */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-slate-900">
              <img
                src={selectedConcept.image}
                alt={selectedConcept.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <span className="text-xs text-amber-400 font-bold uppercase">{selectedConcept.code}</span>
                  <h3 className="text-2xl font-bold font-serif-title">{selectedConcept.name}</h3>
                  <p className="text-xs text-slate-300">{selectedConcept.description}</p>
                </div>
              </div>
            </div>

            {/* Concept Thumbnails List */}
            <div className="grid grid-cols-3 gap-3">
              {PHOTOBOOTH_CONCEPTS.map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => setSelectedConcept(concept)}
                  className={`p-2 rounded-2xl border text-left transition-all ${
                    selectedConcept.id === concept.id
                      ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <img src={concept.image} alt={concept.name} className="w-full h-16 object-cover rounded-xl mb-1.5" />
                  <span className="text-[11px] font-bold text-slate-900 block line-clamp-1">{concept.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Booking & Pricing Info */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="badge-gold">Khung Khung Giờ Hoạt Động: 08:00 - 22:00</span>
              <h3 className="text-2xl font-bold text-slate-900 font-serif-title">
                Gói Chụp Cabin {selectedConcept.name}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Cabin chụp 1-6 người với hệ thống đèn studio chuẩn beauty, đạo cụ hóa trang đa dạng (kính mát, tai mèo, mũ cừu, đạo cụ sinh nhật).
              </p>
            </div>

            {/* Price Tag Box */}
            <div className="glass-panel-gold p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-800 font-bold uppercase block">Mức Giá Vé Chụp / 1 Lượt (4 Strip Prints):</span>
                <strong className="text-3xl font-extrabold text-amber-900 font-serif-title">
                  {selectedConcept.price.toLocaleString('vi-VN')} VNĐ
                </strong>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 font-bold px-3 py-1 rounded-full">
                In Liền 30S
              </span>
            </div>

            {/* Props Checklist */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Đặc Quyền Đi Kèm Lượt Chụp:</span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  <span>Miễn phí mượn 50+ phụ kiện</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  <span>File ảnh gốc + Video GIF hậu trường</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  <span>In 4 dải ảnh Strip Glossy cao cấp</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  <span>Quét mã QR lấy file siêu tốc</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onBookPhotobooth(selectedConcept)}
              className="btn-gold w-full justify-center py-3.5 text-xs font-bold"
            >
              <Calendar className="w-4 h-4" />
              <span>Đặt Suất Cabin Chụp Photobooth</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
