import React from 'react';
import { Camera, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ setCurrentTab }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">

        {/* Main Footer Multi-Column Grid (Inspired by Cong Studio) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <span className="font-serif-title font-extrabold text-xl text-white tracking-tight">
                AURA STUDIO
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống Chụp Ảnh Nghệ Thuật, Kỷ Yếu & Cho Thuê Trang Phục uy tín hàng đầu. Trọn gói chuyên nghiệp không phát sinh chi phí.
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Hotline: 0975.397.923 / 0975.475.789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Email: contact@aurastudio.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Giờ mở cửa: 08:00 - 21:00 hàng ngày</span>
              </div>
            </div>
          </div>

          {/* Column 2: Services List */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-serif-title border-b border-slate-800 pb-2">
              Dịch Vụ Chụp Ảnh
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentTab('packages')} className="hover:text-amber-400 transition-colors">
                  • Chụp Ảnh Kỷ Yếu Cấp 1, 2, 3 & Đại Học
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('packages')} className="hover:text-amber-400 transition-colors">
                  • Tour Du Lịch Kỷ Yếu Trọn Gói
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('packages')} className="hover:text-amber-400 transition-colors">
                  • Chụp Phóng Sự Cưới & Ăn Hỏi
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('packages')} className="hover:text-amber-400 transition-colors">
                  • Chụp Ảnh Profile Doanh Nhân & Beauty
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('photobooth')} className="hover:text-amber-400 transition-colors">
                  • Photobooth Cabin Y2K Hàn Quốc
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Costume Brands (Áo Dài Nhân & Cộng Suit) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-serif-title border-b border-slate-800 pb-2">
              Thuê Trang Phục (Áo Dài Nhân)
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentTab('costumes')} className="hover:text-amber-400 transition-colors">
                  • Cho Thuê Áo Dài Kỷ Yếu & Cưới Hỏi
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('costumes')} className="hover:text-amber-400 transition-colors">
                  • Cho Thuê Cổ Phục Triều Nguyễn
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('costumes')} className="hover:text-amber-400 transition-colors">
                  • Cho Thuê Vest Nam & Tuxedo
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('costumes')} className="hover:text-amber-400 transition-colors">
                  • Cho Thuê Phụ Kiện Chụp Ảnh & Decor
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Showrooms */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-serif-title border-b border-slate-800 pb-2">
              Hệ Thống Showroom
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Showroom 1: 101 Hoàng Cầu, Đống Đa, Hà Nội</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Showroom 2: 235 Nguyễn Trãi, Thanh Xuân, Hà Nội</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Showroom 3: 154 Cầu Giấy, Hà Nội</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AURA STUDIO & THUÊ TRANG PHỤC. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Thiết kế theo chuẩn định hướng Cộng Studio</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>

      </div>
    </footer>
  );
}
