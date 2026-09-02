import React from 'react';
import { DollarSign, Calendar, Shirt, ArrowUpRight, TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';

export default function AdminDashboard({ orders = [], onNavigateTab }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalDeposits = orders.reduce((sum, o) => sum + (o.depositAmount || 0), 0);
  const rentalOrdersCount = orders.filter((o) => (o.serviceType || '').includes('Thuê Trang Phục')).length;
  const bookingOrdersCount = orders.filter((o) => !(o.serviceType || '').includes('Thuê Trang Phục')).length;

  return (
    <div className="space-y-8">
      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="card-clean p-6 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tổng Doanh Thu Dịch Vụ</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 font-serif-title">
              {totalRevenue.toLocaleString('vi-VN')} VNĐ
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Dữ liệu thực từ PostgreSQL</span>
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card-clean p-6 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tổng Tiền Cọc Đã Thu</span>
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 font-serif-title">
              {totalDeposits.toLocaleString('vi-VN')} VNĐ
            </h3>
            <span className="text-[11px] text-sky-700 font-medium">{orders.length} Đơn đặt online</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card-clean p-6 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Đơn Thuê Trang Phục</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Shirt className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 font-serif-title">
              {rentalOrdersCount} Đơn Thuê
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold">Cọc & Hạn trả tự động</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card-clean p-6 rounded-3xl space-y-3 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Lịch Chụp Studio</span>
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 font-serif-title">
              {bookingOrdersCount} Ca Chụp
            </h3>
            <span className="text-[11px] text-purple-600 font-bold">Concept & Photobooth</span>
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 font-serif-title">Danh Sách Đơn Đặt Lịch & Thuê Gần Đây</h3>
            <p className="text-xs text-slate-500">Ghi nhận thông tin khách hàng, số điện thoại và khoản tiền đặt cọc.</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="btn-outline-gold text-xs px-4 py-2 font-bold"
          >
            <span>Quản Lý Đơn Hàng</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Chưa có đơn hàng nào từ khách hàng trong cơ sở dữ liệu SQL.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Mã Đơn</th>
                  <th className="py-3.5 px-4">Khách Hàng</th>
                  <th className="py-3.5 px-4">Loại Dịch Vụ</th>
                  <th className="py-3.5 px-4">Ngày Chụp / Sử Dụng</th>
                  <th className="py-3.5 px-4">Tổng Tiền</th>
                  <th className="py-3.5 px-4">Trạng Thái Đặt Cọc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{order.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{order.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{order.serviceType}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">{order.bookingDate} ({order.timeSlot})</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : 0}đ</td>
                    <td className="py-3.5 px-4">
                      <span className="badge-gold">
                        {order.paymentStatus === 'FULLY_PAID' ? 'Hoàn Tất 100%' : 'Đã Cọc Giữ Chỗ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
