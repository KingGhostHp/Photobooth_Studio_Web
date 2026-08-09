import React, { useState } from 'react';
import { ShoppingBag, AlertTriangle, CheckCircle, Clock, DollarSign, QrCode, Search } from 'lucide-react';

export default function AdminOrders({ orders, onUpdateOrder }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOrderForFee, setActiveOrderForFee] = useState(null);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [penaltyReason, setPenaltyReason] = useState('Hư hỏng nhẹ / Trễ hạn trả');

  const handleApplyPenalty = (order) => {
    const updated = {
      ...order,
      penaltyFee: (order.penaltyFee || 0) + Number(penaltyAmount),
      totalAmount: order.totalAmount + Number(penaltyAmount),
      notes: `${order.notes || ''} [Phạt ${Number(penaltyAmount).toLocaleString()}đ - ${penaltyReason}]`
    };
    onUpdateOrder(updated);
    setActiveOrderForFee(null);
    setPenaltyAmount(0);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Search & Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-title text-slate-900">Quản Lý Đơn Hàng & Phụ Phí Phạt</h2>
          <p className="text-xs text-slate-500">Xem danh sách đặt cọc, xác nhận thanh toán và ghi nhận phạt khi trả đồ muộn/hư hỏng.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT hoặc mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-4 px-6">Mã Đơn / Ngày Tạo</th>
                <th className="py-4 px-6">Khách Hàng</th>
                <th className="py-4 px-6">Chi Tiết Sản Phẩm/Gói</th>
                <th className="py-4 px-6">Tổng Chi Phí</th>
                <th className="py-4 px-6">Phụ Phí Phạt</th>
                <th className="py-4 px-6">Trạng Thái Thanh Toán</th>
                <th className="py-4 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <strong className="font-mono text-slate-900 block">{order.id}</strong>
                    <span className="text-[10px] text-slate-400">{order.createdAt}</span>
                  </td>

                  <td className="py-4 px-6">
                    <strong className="text-slate-900 block">{order.customerName}</strong>
                    <span className="text-[11px] text-slate-500">{order.phone}</span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="font-bold text-amber-800 block">{order.serviceType}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{order.itemDetails}</span>
                  </td>

                  <td className="py-4 px-6 font-extrabold text-slate-900">
                    {order.totalAmount.toLocaleString('vi-VN')} VNĐ
                  </td>

                  <td className="py-4 px-6">
                    {order.penaltyFee ? (
                      <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-[11px]">
                        +{order.penaltyFee.toLocaleString('vi-VN')}đ
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Không có</span>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <span className="badge-gold">
                      {order.paymentStatus === 'DEPOSITED_30%' ? 'Đã Cọc 30%' : 'Đã Thanh Toán 100%'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setActiveOrderForFee(order)}
                      className="btn-outline-gold px-3 py-1.5 text-[11px] font-bold"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tính Phạt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Apply Penalty Fee */}
      {activeOrderForFee && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-serif-title flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Tính Phụ Phí Phạt Cho Đơn {activeOrderForFee.id}</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số Tiền Phạt (VNĐ):</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 100000"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lý Do Phạt:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trả muộn 1 ngày, dính bẩn nhẹ..."
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
                Xác Nhận Áp Phụ Phí
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
