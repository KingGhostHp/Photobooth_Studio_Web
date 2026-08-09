import React from 'react';
import { Camera, Shirt, Calendar, Star, CheckCircle, ArrowRight, Sparkles, Award } from 'lucide-react';

export default function HeroSection({ setCurrentTab }) {
  return (
    <section className="relative bg-gradient-to-b from-white via-amber-50/30 to-slate-50 py-16 lg:py-24 overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-100/80 border border-amber-300 px-4 py-2 rounded-full shadow-sm text-xs font-bold text-amber-900">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Thương Hiệu Chụp Ảnh & Cho Thuê Trang Phục Trọn Gói Hàng Đầu 2026</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif-title text-slate-900 leading-tight">
                Lưu Giữ Khoảnh Khắc <br />
                <span className="text-gold-gradient">Nghệ Thuật & Đắng Cấp</span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
                Hệ thống Studio chuyên nghiệp với hơn <strong>500+ bộ trang phục Áo Dài, Cổ Phục, Tuxedo Nam</strong> (Cộng Suit) và các gói chụp kỷ yếu, doanh nhân, phóng sự cưới trọn gói không phát sinh chi phí.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setCurrentTab('mix-match')}
                className="btn-gold px-7 py-3.5 text-sm font-bold shadow-lg"
              >
                <Sparkles className="w-4.5 h-4.5" />
                <span>Thử Phối Đồ Ảo (Mix & Match)</span>
              </button>

              <button
                onClick={() => setCurrentTab('packages')}
                className="btn-outline-gold px-7 py-3.5 text-sm font-bold"
              >
                <span>Xem Bảng Giá Gói Chụp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="font-semibold">500+ Mẫu Đồ Thuê</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="font-semibold">Trang Điểm Chuyên Nghiệp</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="font-semibold">100% Ảnh Đã Chỉnh Sửa</span>
              </div>
            </div>
          </div>

          {/* Right Image Showcase Column (Clean Card Grid) */}
          <div className="lg:col-span-5 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="card-clean p-2 rounded-3xl overflow-hidden shadow-md group">
                  <img
                    src="/images/costume_ao_dai_viet_1786199756012.png"
                    alt="Áo Dài Kỷ Yếu"
                    className="w-full h-56 sm:h-64 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-3 text-center">
                    <span className="text-xs font-bold text-slate-900 block">Áo Dài Hoàng Cúc Đỏ</span>
                    <span className="text-[10px] text-amber-700 font-semibold">250.000 VNĐ / ngày</span>
                  </div>
                </div>

                <div className="card-clean p-4 rounded-3xl text-center bg-gradient-to-br from-amber-50 to-white border-amber-200">
                  <div className="flex justify-center text-amber-500 gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <strong className="text-xl font-bold text-slate-900 block font-serif-title">15.000+</strong>
                  <span className="text-xs text-slate-600 font-medium">Khách hàng hài lòng</span>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="card-clean p-2 rounded-3xl overflow-hidden shadow-md group">
                  <img
                    src="/images/costume_co_phuc_viet_1786199773916.png"
                    alt="Cổ Phục Nhật Bình"
                    className="w-full h-64 sm:h-72 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-3 text-center">
                    <span className="text-xs font-bold text-slate-900 block">Cổ Phục Nhật Bình</span>
                    <span className="text-[10px] text-amber-700 font-semibold">450.000 VNĐ / ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
