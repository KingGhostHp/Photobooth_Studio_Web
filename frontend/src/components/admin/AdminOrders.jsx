import React, { useState } from 'react';
import { 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  QrCode, 
  Search, 
  RefreshCw, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  Info, 
  ShieldAlert, 
  Check, 
  X, 
  Ban, 
  RotateCcw,
  UserCheck
} from 'lucide-react';

export default function AdminOrders({ orders = [], onUpdateOrder, onDeleteOrder, onRefreshOrders }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeOrderForFee, setActiveOrderForFee] = useState(null);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [penaltyReason, setPenaltyReason] = useState('Hư hỏng nhẹ / Trễ hạn trả');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefreshOrders) {
      setIsRefreshing(true);
      await onRefreshOrders();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleApplyPenalty = (order) => {
    const updated = {
      ...order,
      penaltyFee: (order.penaltyFee || 0) + Number(penaltyAmount),
      totalAmount: (order.totalAmount || 0) + Number(penaltyAmount),
      notes: `${order.notes || ''} [Phạt ${Number(penaltyAmount).toLocaleString('vi-VN')}đ - ${penaltyReason}]`
    };
    onUpdateOrder(updated);
    setActiveOrderForFee(null);
    setPenaltyAmount(0);
  };

  const handleStatusChange = (order, newStatus) => {
    const isCancel = newStatus === 'CANCELLED';
    onUpdateOrder({
      ...order,
      paymentStatus: newStatus,
      bookingStatus: isCancel ? 'CANCELLED' : (order.bookingStatus === 'CANCELLED' ? 'CONFIRMED' : order.bookingStatus),
      notes: isCancel 
        ? `${order.notes || ''} [Admin đã chuyển sang Đã Hủy Đơn & Mở lại ca giờ]`
        : order.notes
    });
  };

  // Manual cancel booking and release slot to "Còn trống"
  const handleCancelBooking = (order) => {
    const slotInfo = order.timeSlot ? `ca "${order.timeSlot}" ngày ${order.bookingDate}` : `ngày ${order.bookingDate}`;
    if (window.confirm(`Xác nhận HỦY ĐẶT LỊCH cho đơn #${order.id} của khách hàng "${order.customerName}"?\n\nCa giờ ${slotInfo} sẽ lập tức được giải phóng về trạng thái "CÒN TRỐNG" để khách hàng khác có thể đặt.`)) {
      onUpdateOrder({
        ...order,
        bookingStatus: 'CANCELLED',
        paymentStatus: 'CANCELLED',
        notes: `${order.notes || ''} [Admin đã hủy lịch ngày ${order.bookingDate} - Ca giờ đã mở lại Còn Trống]`
      });
    }
  };

  // Reinstate order
  const handleReinstateBooking = (order) => {
    if (window.confirm(`Khôi phục lại lịch đặt cho đơn #${order.id} của "${order.customerName}"?`)) {
      onUpdateOrder({
        ...order,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'DEPOSITED',
        notes: `${order.notes || ''} [Admin đã khôi phục lại lịch đặt]`
      });
    }
  };

  const handleConfirmReturn = async (order) => {
    if (window.confirm(`Xác nhận khách hàng "${order.customerName}" đã trả đầy đủ trang phục của đơn #${order.id}? Hệ thống sẽ giải phóng lịch để khách khác có thể thuê.`)) {
      try {
        const res = await fetch(`/api/orders/${order.id}/confirm-return`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
          if (onRefreshOrders) {
            onRefreshOrders();
          } else if (onUpdateOrder) {
            onUpdateOrder({
              ...order,
              isReturned: true,
              bookingStatus: 'RETURNED',
              notes: `${order.notes || ''} [Đã trả đồ & kiểm tra hoàn tất]`
            });
          }
        }
      } catch (err) {
        console.error('Lỗi khi xác nhận trả đồ:', err);
        alert('Có lỗi xảy ra khi cập nhật trạng thái trả đồ!');
      }
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${id} khỏi hệ thống SQL?`)) {
      if (onDeleteOrder) {
        onDeleteOrder(id);
      }
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.phone || '').includes(searchTerm) ||
      (o.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const isRental = (o.serviceType || '').includes('Thuê') || (o.serviceType || '').includes('Trang Phục');
    const isCancelled = o.bookingStatus === 'CANCELLED' || o.paymentStatus === 'CANCELLED';

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'DEPOSITED' && (o.paymentStatus === 'DEPOSITED' || o.paymentStatus === 'DEPOSITED_30%') && !isCancelled) ||
      (statusFilter === 'PAID' && o.paymentStatus === 'FULLY_PAID' && !isCancelled) ||
      (statusFilter === 'RENTING' && isRental && !o.isReturned && o.bookingStatus !== 'RETURNED' && !isCancelled) ||
      (statusFilter === 'RETURNED' && (o.isReturned || o.bookingStatus === 'RETURNED')) ||
      (statusFilter === 'CANCELLED' && isCancelled);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Search, Filter & Refresh Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-serif-title text-slate-900">Quản Lý Đơn Hàng & Thuê Đồ</h2>
            <span className="badge-gold">{orders.length} Đơn Trong SQL</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Xác nhận đơn hàng, kiểm tra trả trang phục, hủy lịch giải phóng ca trống và quản lý phụ phí trực tiếp trên PostgreSQL.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('RENTING')}
              className={`px-3 py-1.5 rounded-xl transition-all ${statusFilter === 'RENTING' ? 'bg-white text-amber-900 shadow-sm font-black' : 'hover:text-slate-900'}`}
            >
              ⏳ Đang Thuê
            </button>
            <button
              onClick={() => setStatusFilter('RETURNED')}
              className={`px-3 py-1.5 rounded-xl transition-all ${statusFilter === 'RETURNED' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'hover:text-slate-900'}`}
            >
              ✅ Đã Trả Đồ
            </button>
            <button
              onClick={() => setStatusFilter('DEPOSITED')}
              className={`px-3 py-1.5 rounded-xl transition-all ${statusFilter === 'DEPOSITED' ? 'bg-white text-amber-800 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Đã Cọc
            </button>
            <button
              onClick={() => setStatusFilter('CANCELLED')}
              className={`px-3 py-1.5 rounded-xl transition-all ${statusFilter === 'CANCELLED' ? 'bg-white text-rose-800 shadow-sm font-black' : 'hover:text-slate-900'}`}
            >
              ❌ Đã Hủy (Ca Trống)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors"
            title="Tải lại dữ liệu từ cơ sở dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-serif-title">Chưa có đơn hàng nào trong hệ thống</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Khi khách hàng đặt thuê trang phục hoặc đặt lịch chụp ảnh trên web, thông tin sẽ được tự động lưu vào SQL và hiển thị tức thì tại đây.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-4 px-5">Mã Đơn / Ngày Tạo</th>
                  <th className="py-4 px-5">Thông Tin Khách Hàng</th>
                  <th className="py-4 px-5">Dịch Vụ / Thời Gian</th>
                  <th className="py-4 px-5">Chi Tiết Sản Phẩm</th>
                  <th className="py-4 px-5">Chi Phí & Đặt Cọc</th>
                  <th className="py-4 px-5">Phụ Phí Phạt</th>
                  <th className="py-4 px-5">Trạng Thái & Lịch Trình</th>
                  <th className="py-4 px-5 text-right">Thao Tác Quản Trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => {
                  const isCancelled = order.bookingStatus === 'CANCELLED' || order.paymentStatus === 'CANCELLED';

                  return (
                    <tr key={order.id} className={`hover:bg-slate-50/80 transition-colors ${isCancelled ? 'bg-rose-50/30' : ''}`}>
                      <td className="py-4 px-5 align-top">
                        <strong className="font-mono text-slate-900 block font-bold">{order.id}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Mới tạo'}
                        </span>
                      </td>

                      <td className="py-4 px-5 align-top space-y-1">
                        <strong className="text-slate-900 block text-xs font-extrabold">{order.customerName}</strong>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{order.phone}</span>
                        </div>
                        {order.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-700">
                            <Mail className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span className="truncate max-w-[140px]">{order.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 align-top space-y-1">
                        <span className="font-extrabold text-amber-800 block text-xs">{order.serviceType}</span>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{order.bookingDate || 'Chưa định ngày'}</span>
                        </div>
                        {order.returnDate && (
                          <div className="text-[10px] text-slate-500">
                            Hạn trả: <strong>{order.returnDate}</strong>
                          </div>
                        )}
                        {order.timeSlot && (
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            isCancelled 
                              ? 'bg-rose-100 text-rose-700 line-through' 
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {order.timeSlot}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 align-top max-w-[220px]">
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2" title={order.itemDetails}>
                          {order.itemDetails || 'Không có mô tả chi tiết'}
                        </p>
                        {order.notes && (
                          <p className="text-[10px] text-amber-800 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200/60 mt-1 line-clamp-2">
                            📝 {order.notes}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-5 align-top space-y-1">
                        <div className="font-black text-slate-900 text-xs">
                          Tổng: {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : '0'} VNĐ
                        </div>
                        <div className="text-[11px] text-amber-800 font-bold">
                          Cọc: {order.depositAmount ? order.depositAmount.toLocaleString('vi-VN') : '0'} VNĐ
                        </div>
                      </td>

                      <td className="py-4 px-5 align-top">
                        {order.penaltyFee ? (
                          <span className="text-rose-700 font-black bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-[11px] inline-block">
                            +{order.penaltyFee.toLocaleString('vi-VN')}đ
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">0 đ</span>
                        )}
                      </td>

                      <td className="py-4 px-5 align-top space-y-1.5">
                        <select
                          value={order.paymentStatus || 'DEPOSITED'}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer w-full ${
                            isCancelled
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : order.paymentStatus === 'FULLY_PAID'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="DEPOSITED">Đã Cọc Giữ Chỗ</option>
                          <option value="DEPOSITED_30%">Đã Cọc 30%</option>
                          <option value="FULLY_PAID">Đã Thanh Toán 100%</option>
                          <option value="CANCELLED">❌ Đã Hủy Đơn (Mở Ca Trống)</option>
                        </select>

                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-100/80 px-2 py-0.5 rounded-lg">
                            <CheckCircle className="w-3 h-3 text-rose-600" />
                            <span>Đã mở lại ca trống</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 align-top text-right space-x-1.5 whitespace-nowrap">
                        {/* Cancel / Reinstate Slot Action */}
                        {isCancelled ? (
                          <button
                            onClick={() => handleReinstateBooking(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1.5 rounded-xl text-[11px] inline-flex items-center gap-1 border border-slate-300 transition-all"
                            title="Khôi phục lại lịch hẹn"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                            <span>Khôi Phục</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCancelBooking(order)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1.5 rounded-xl text-[11px] inline-flex items-center gap-1 border border-rose-200 shadow-sm transition-all"
                            title="Khách hủy hẹn: Hủy đơn và giải phóng ca giờ này về 'Còn trống'"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            <span>Hủy Lịch (Mở Ca Trống)</span>
                          </button>
                        )}

                        {/* Return Costume Confirmation Button */}
                        {((order.serviceType || '').includes('Thuê') || (order.serviceType || '').includes('Trang Phục')) && (
                          order.isReturned || order.bookingStatus === 'RETURNED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã Trả Đồ</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConfirmReturn(order)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px] inline-flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95"
                              title="Xác nhận khách đã trả đồ và hoàn cọc (giải phóng lịch cho khách khác)"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Nhận Trả Đồ</span>
                            </button>
                          )
                        )}

                        <button
                          onClick={() => setActiveOrderForFee(order)}
                          className="btn-outline-gold px-2.5 py-1.5 text-[11px] font-bold inline-flex items-center gap-1"
                          title="Thêm phụ phí phạt"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Phạt</span>
                        </button>

                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors inline-block"
                          title="Xóa đơn hàng khỏi SQL"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Apply Penalty Fee */}
      {activeOrderForFee && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-serif-title flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Ghi Nhận Phụ Phí Phạt Cho Đơn #{activeOrderForFee.id}</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số Tiền Phạt (VNĐ):</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 100000"
                  step="10000"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lý Do Phạt:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trả muộn 1 ngày, dính bẩn nhẹ, mất phụ kiện..."
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveOrderForFee(null)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => handleApplyPenalty(activeOrderForFee)}
                className="btn-gold px-5 py-2.5 text-xs font-bold"
              >
                Lưu Vào Cơ Sở Dữ Liệu SQL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
