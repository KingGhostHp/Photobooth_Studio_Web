import React, { useState } from 'react';
import { Search, Package, Calendar, Clock, CheckCircle2, AlertCircle, Phone, Mail, User, ShieldCheck, ArrowRight, Sparkles, RefreshCw, ChevronRight, FileText } from 'lucide-react';

export default function OrderLookupSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMessage('Vui lòng nhập Mã đơn hàng, Số điện thoại hoặc Email để tra cứu.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/lookup?query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
        if (data.data?.length === 0) {
          setErrorMessage('Không tìm thấy đơn hàng nào khớp với thông tin đã nhập.');
        }
      } else {
        setErrorMessage(data.message || 'Lỗi khi tra cứu đơn hàng.');
        setOrders([]);
      }
    } catch (err) {
      console.error('Lỗi khi tra cứu:', err);
      setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (order) => {
    const isRental = (order.serviceType || '').includes('Thuê') || (order.serviceType || '').includes('Trang Phục');
    
    if (isRental) {
      if (order.isReturned || order.bookingStatus === 'RETURNED') {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã Trả Đồ Thành Công
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Đang Sử Dụng Đồ (Chưa Trả)
        </span>
      );
    }

    if (order.bookingStatus === 'CONFIRMED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          Đã Giữ Lịch Ca Chụp
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
        {order.bookingStatus || 'Đã Ghi Nhận'}
      </span>
    );
  };

  return (
    <section className="py-16 bg-slate-900 text-white min-h-[700px] relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Tra Cứu Trực Tuyến & Minh Bạch Dịch Vụ
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
            Tra Cứu Đơn Thuê & Lịch Hẹn
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Nhập <strong>Mã đơn hàng</strong> (được gửi trong email xác nhận), <strong>Số điện thoại</strong> hoặc <strong>Email</strong> để kiểm tra chi tiết trạng thái thuê đồ và lịch chụp của bạn.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-slate-800/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-700 shadow-2xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập mã đơn (VD: AUR-20260902-376) hoặc SĐT / Email..."
                className="w-full bg-slate-900/90 text-white placeholder-slate-500 pl-12 pr-4 py-3.5 rounded-2xl border border-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm outline-none transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Tra Cứu...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Tra Cứu Ngay</span>
                </>
              )}
            </button>
          </form>

          {/* Search tips */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Mẹo: Bạn có thể tra cứu bằng số điện thoại Zalo đã dùng khi đặt dịch vụ.</span>
          </div>
        </div>

        {/* Error / Empty Message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Search Results Display */}
        {searched && orders.length > 0 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4" />
                Tìm thấy {orders.length} đơn hàng trên hệ thống
              </h2>
            </div>

            <div className="space-y-6">
              {orders.map((order) => {
                const totalAmt = Number(order.totalAmount || 0);
                const depositAmt = Number(order.depositAmount || 0);
                const penaltyAmt = Number(order.penaltyFee || 0);
                const remainingAmt = Math.max(0, totalAmt + penaltyAmt - depositAmt);
                const isRental = (order.serviceType || '').includes('Thuê') || (order.serviceType || '').includes('Trang Phục');

                return (
                  <div
                    key={order.id}
                    className="bg-slate-800/90 rounded-3xl border border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-xl hover:border-amber-500/40 transition-all"
                  >
                    {/* Top Row: Order ID & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">Mã Đơn Hàng:</span>
                          <span className="text-base sm:text-lg font-bold font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                            {order.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Ngày tạo đơn: {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order)}
                      </div>
                    </div>

                    {/* Customer & Service Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          Thông Tin Khách Hàng
                        </h4>
                        <div className="space-y-1.5 text-sm">
                          <div className="font-bold text-white text-base">{order.customerName}</div>
                          <div className="text-slate-300 flex items-center gap-2 text-xs">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{order.phone}</span>
                          </div>
                          {order.email && (
                            <div className="text-slate-300 flex items-center gap-2 text-xs">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{order.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          Dịch Vụ & Thời Gian
                        </h4>
                        <div className="space-y-1.5 text-sm">
                          <div className="font-semibold text-amber-200">{order.serviceType}</div>
                          <div className="text-xs text-slate-300 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                            {order.itemDetails}
                          </div>
                          {isRental ? (
                            <div className="text-xs text-slate-300 flex items-center gap-2 pt-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              <span>Ngày nhận: <strong>{order.startDate || order.bookingDate}</strong> | Hạn trả: <strong className="text-rose-300">{order.endDate || order.returnDate}</strong> ({order.rentalDays} ngày)</span>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-300 flex items-center gap-2 pt-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              <span>Ngày chụp: <strong>{order.bookingDate}</strong> ({order.timeSlot || 'Ca tiêu chuẩn'})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60 text-center">
                        <span className="text-[11px] text-slate-400 block mb-1">Tổng Dịch Vụ</span>
                        <strong className="text-sm font-bold text-white">
                          {totalAmt.toLocaleString('vi-VN')} đ
                        </strong>
                      </div>
                      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60 text-center">
                        <span className="text-[11px] text-emerald-400 block mb-1">Đã Đặt Cọc</span>
                        <strong className="text-sm font-bold text-emerald-400">
                          {depositAmt.toLocaleString('vi-VN')} đ
                        </strong>
                      </div>
                      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60 text-center">
                        <span className="text-[11px] text-rose-400 block mb-1">Phụ Phí Phạt</span>
                        <strong className="text-sm font-bold text-rose-400">
                          {penaltyAmt > 0 ? `+${penaltyAmt.toLocaleString('vi-VN')} đ` : '0 đ'}
                        </strong>
                      </div>
                      <div className="bg-amber-950/30 p-3.5 rounded-2xl border border-amber-500/30 text-center">
                        <span className="text-[11px] text-amber-300 block mb-1 font-semibold">Còn Lại Khi Nhận Đồ</span>
                        <strong className="text-base font-extrabold text-amber-400">
                          {remainingAmt.toLocaleString('vi-VN')} đ
                        </strong>
                      </div>
                    </div>

                    {/* Notes if any */}
                    {order.notes && (
                      <div className="text-xs text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span><strong>Ghi chú:</strong> {order.notes}</span>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-700/60">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Đơn hàng được bảo đảm và lưu trữ an toàn trên máy chủ Aura Studio.
                      </span>

                      <a
                        href="tel:0975397923"
                        className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-700/60 hover:bg-slate-700 px-4 py-2.5 rounded-xl border border-slate-600 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Hotline Hỗ Trợ Đổi Lịch: 0975.397.923</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
