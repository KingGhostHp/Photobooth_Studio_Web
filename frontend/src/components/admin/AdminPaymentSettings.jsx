import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  Building, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Send, 
  History, 
  DollarSign, 
  Sparkles,
  Copy,
  Upload,
  Image as ImageIcon,
  Check,
  HelpCircle
} from 'lucide-react';

const POPULAR_BANKS = [
  { code: 'MB', bin: '970422', name: 'MB Bank (Ngân Hàng Quân Đội)' },
  { code: 'VCB', bin: '970436', name: 'Vietcombank (Ngoại Thương Việt Nam)' },
  { code: 'TCB', bin: '970407', name: 'Techcombank (Kỹ Thương Việt Nam)' },
  { code: 'ACB', bin: '970416', name: 'ACB (Á Châu)' },
  { code: 'VPB', bin: '970432', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { code: 'TPB', bin: '970458', name: 'TPBank (Tiên Phong)' },
  { code: 'BIDV', bin: '970418', name: 'BIDV (Đầu Tư & Phát Triển)' },
  { code: 'VIB', bin: '970441', name: 'VIB (Quốc Tế)' }
];

export default function AdminPaymentSettings({ orders = [], onRefreshOrders }) {
  const [bankConfig, setBankConfig] = useState({
    bankCode: 'MB',
    bankBin: '970422',
    bankName: 'MB Bank (Ngân Hàng Quân Đội)',
    accountNumber: '0975397923',
    accountHolder: 'AURA STUDIO',
    qrTemplate: 'compact2',
    qrType: 'dynamic', // 'dynamic' (VietQR Napas tự động) | 'custom_image' (Ảnh QR cá nhân tải lên)
    customQrImage: null,
    isAutoConfirmEnabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File Upload State
  const fileInputRef = useRef(null);

  // Webhook Simulator State
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [simAmount, setSimAmount] = useState('');
  const [simContent, setSimContent] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // Webhook Logs State
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Load current bank config and webhook logs
  const loadData = async () => {
    try {
      setIsLoading(true);
      const resConfig = await fetch('/api/payment/bank-config');
      const dataConfig = await resConfig.json();
      if (dataConfig.success && dataConfig.data) {
        setBankConfig(prev => ({
          ...prev,
          ...dataConfig.data,
          qrType: dataConfig.data.qrType || 'dynamic'
        }));
      }

      loadWebhookLogs();
    } catch (err) {
      console.error('Lỗi tải cấu hình ngân hàng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWebhookLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const resLogs = await fetch('/api/payment/webhook-logs');
      const dataLogs = await resLogs.json();
      if (dataLogs.success) {
        setLogs(dataLogs.data);
      }
    } catch (err) {
      console.error('Lỗi tải logs webhook:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update bank selection
  const handleSelectBank = (bank) => {
    setBankConfig(prev => ({
      ...prev,
      bankCode: bank.code,
      bankBin: bank.bin,
      bankName: bank.name
    }));
  };

  // Handle local image file upload -> Base64
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, JPEG, WEBP)!');
      return;
    }

    // Limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBankConfig(prev => ({
        ...prev,
        qrType: 'custom_image',
        customQrImage: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save bank configuration to PostgreSQL
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch('/api/payment/bank-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankConfig)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Lỗi lưu cấu hình ngân hàng:', err);
      alert('Không thể lưu cấu hình ngân hàng!');
    } finally {
      setIsSaving(false);
    }
  };

  // Run Webhook Simulator
  const handleRunSimulator = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert('Vui lòng chọn một đơn hàng để test giả lập Webhook!');
      return;
    }

    try {
      setIsSimulating(true);
      setSimResult(null);
      const res = await fetch('/api/payment/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          amount: simAmount || undefined,
          customContent: simContent || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data);
        if (onRefreshOrders) onRefreshOrders();
        loadWebhookLogs();
      } else {
        alert(data.message || 'Lỗi giả lập webhook!');
      }
    } catch (err) {
      console.error('Lỗi giả lập webhook:', err);
      alert('Không thể kích hoạt bộ giả lập!');
    } finally {
      setIsSimulating(false);
    }
  };

  // When an order is picked in simulator dropdown
  const handleSelectSimOrder = (ordId) => {
    setSelectedOrderId(ordId);
    const ord = orders.find(o => o.id === ordId);
    if (ord) {
      setSimAmount(ord.depositAmount || ord.totalAmount || 500000);
      setSimContent(`AURA ${ord.id} ${ord.phone || ''}`);
    }
  };

  // Live preview QR URL calculation
  const dynamicQrUrl = `https://api.vietqr.io/image/${bankConfig.bankBin}-${bankConfig.accountNumber}-${bankConfig.qrTemplate || 'compact2'}.jpg?accountName=${encodeURIComponent(bankConfig.accountHolder)}&amount=500000&addInfo=${encodeURIComponent('AURA DEMO TEST')}`;
  const activeQrPreview = bankConfig.qrType === 'custom_image' && bankConfig.customQrImage 
    ? bankConfig.customQrImage 
    : dynamicQrUrl;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold font-serif-title text-slate-900">
              Cấu Hình Ngân Hàng & Mã QR Tự Động Callback
            </h2>
            <span className="badge-gold">Tùy Chọn QR Tự Động / Ảnh Riêng</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đổi số tài khoản ngân hàng, chọn tạo VietQR động tự động hoặc tải lên ảnh mã QR riêng của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Webhook API: Sẵn Sàng (Live)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column: Bank Configuration & QR Mode Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 font-serif-title flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-600" />
                <span>1. Thông Tin Tài Khoản Ngân Hàng Nhận Tiền</span>
              </h3>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã lưu vào PostgreSQL!</span>
                </span>
              )}
            </div>

            {/* Step A: Choose QR Mode */}
            <div className="space-y-3 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
              <label className="text-xs font-extrabold text-amber-950 uppercase flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-700" />
                <span>Chọn Cơ Chế Hiển Thị Mã QR Cho Khách Hàng:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Dynamic VietQR (Auto amount & memo) */}
                <button
                  type="button"
                  onClick={() => setBankConfig(prev => ({ ...prev, qrType: 'dynamic' }))}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    bankConfig.qrType === 'dynamic'
                      ? 'border-2 border-amber-600 bg-white text-slate-900 shadow-sm ring-2 ring-amber-500/20'
                      : 'border-amber-200/70 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-900">1. VietQR Động Chuẩn Quốc Gia</span>
                    {bankConfig.qrType === 'dynamic' && <Check className="w-4 h-4 text-amber-600 font-bold" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Tự động tạo mã QR chứa chính xác số tiền cọc & mã đơn của từng khách. Khách quét là chuyển ngay.
                  </p>
                </button>

                {/* Option 2: Custom QR Image Upload */}
                <button
                  type="button"
                  onClick={() => setBankConfig(prev => ({ ...prev, qrType: 'custom_image' }))}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    bankConfig.qrType === 'custom_image'
                      ? 'border-2 border-amber-600 bg-white text-slate-900 shadow-sm ring-2 ring-amber-500/20'
                      : 'border-amber-200/70 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-900">2. Tải Ảnh Mã QR Riêng Của Bạn</span>
                    {bankConfig.qrType === 'custom_image' && <Check className="w-4 h-4 text-amber-600 font-bold" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Tải lên file ảnh mã QR lưu từ App ngân hàng của bạn hoặc ảnh chụp mã để bàn.
                  </p>
                </button>
              </div>

              {/* Upload input if Custom QR mode is selected */}
              {bankConfig.qrType === 'custom_image' && (
                <div className="pt-2 space-y-2 border-t border-amber-200 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Tải File Ảnh Mã QR Ngân Hàng:</span>
                    {bankConfig.customQrImage && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ Đã có ảnh QR riêng
                      </span>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>{bankConfig.customQrImage ? 'Chọn Ảnh QR Khác Để Thay Thế' : 'Bấm Để Tải Lên Ảnh Mã QR (PNG/JPG)'}</span>
                    </button>

                    {bankConfig.customQrImage && (
                      <button
                        type="button"
                        onClick={() => setBankConfig(prev => ({ ...prev, customQrImage: null }))}
                        className="py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold"
                      >
                        Xóa Ảnh
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Select Popular Bank */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Chọn Ngân Hàng Nhận Tiền:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POPULAR_BANKS.map((bank) => {
                  const isSelected = bankConfig.bankCode === bank.code;
                  return (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => handleSelectBank(bank)}
                      className={`p-2.5 rounded-2xl border text-left transition-all text-xs ${
                        isSelected 
                          ? 'border-2 border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-500/20'
                          : 'border-slate-200 bg-white hover:border-amber-300 text-slate-700'
                      }`}
                    >
                      <div className="font-extrabold">{bank.code}</div>
                      <div className="text-[10px] text-slate-500 truncate">{bank.name.split('(')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Số Tài Khoản (STK) *:
                </label>
                <input
                  type="text"
                  value={bankConfig.accountNumber}
                  onChange={(e) => setBankConfig({ ...bankConfig, accountNumber: e.target.value })}
                  placeholder="Ví dụ: 0975397923"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-2xl border border-slate-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              {/* Account Holder */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Tên Chủ Tài Khoản (Viết Hoa Không Dấu) *:
                </label>
                <input
                  type="text"
                  value={bankConfig.accountHolder}
                  onChange={(e) => setBankConfig({ ...bankConfig, accountHolder: e.target.value.toUpperCase() })}
                  placeholder="Ví dụ: NGUYEN VAN A / AURA STUDIO"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-2xl border border-slate-300 font-bold text-sm uppercase focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Webhook Endpoint Info */}
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Webhook Callback URL (Dùng cho SePay / Casso / PayOS):</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">POST</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl text-xs font-mono text-slate-300 break-all border border-slate-800 flex items-center justify-between">
                <span>{window.location.origin}/api/payment/webhook</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/payment/webhook`);
                    alert('Đã copy URL Webhook vào Clipboard!');
                  }}
                  className="text-slate-400 hover:text-white p-1"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Khi có biến động số dư, cổng ngân hàng sẽ tự động gửi thông báo về URL này để xác nhận đơn hàng trong 1-2 giây.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-gold w-full justify-center py-3.5 text-xs font-bold shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSaving ? 'Đang Lưu...' : 'Lưu Thay Đổi Thông Tin Ngân Hàng & Mã QR'}</span>
            </button>
          </form>

          {/* Webhook Logs Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 font-serif-title flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <span>Nhật Ký Biến Động Số Dư & Webhook ({logs.length})</span>
              </h3>
              <button
                type="button"
                onClick={loadWebhookLogs}
                className="text-slate-500 hover:text-amber-800 p-1.5 rounded-xl hover:bg-slate-100 text-xs font-bold flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-72">
              {logs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Chưa có giao dịch webhook nào được ghi nhận. Hãy sử dụng bộ giả lập bên phải để test ngay!
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Thời Gian</th>
                      <th className="py-2.5 px-3">Mã Đơn</th>
                      <th className="py-2.5 px-3">Số Tiền</th>
                      <th className="py-2.5 px-3">Nội Dung</th>
                      <th className="py-2.5 px-3">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString('vi-VN') : ''}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-800">
                          {log.orderId || '---'}
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-emerald-600">
                          +{Number(log.amountIn).toLocaleString('vi-VN')}đ
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] truncate max-w-[160px]">
                          {log.transactionContent}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'SUCCESS_MATCHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {log.status === 'SUCCESS_MATCHED' ? 'Khớp Đơn' : 'Chưa Khớp'}
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

        {/* Right Column: Live QR Preview & Webhook Simulator */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live VietQR Preview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-base text-slate-900 font-serif-title flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-600" />
                <span>Mã QR Sẽ Hiển Thị Cho Khách</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {bankConfig.qrType === 'custom_image' ? 'Ảnh Tải Lên' : 'VietQR Động'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block mx-auto max-w-full">
              <div className="w-48 h-48 sm:w-52 sm:h-52 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center mx-auto overflow-hidden">
                <img
                  src={activeQrPreview}
                  alt="Mã QR Thanh Toán"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-3 text-xs space-y-0.5 text-center">
                <div className="font-bold text-slate-800">{bankConfig.bankName.split('(')[0]}</div>
                <div className="font-mono font-extrabold text-amber-800 text-sm">{bankConfig.accountNumber}</div>
                <div className="font-bold text-slate-600 uppercase text-[11px]">{bankConfig.accountHolder}</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              {bankConfig.qrType === 'custom_image'
                ? 'Đang sử dụng ảnh mã QR riêng do bạn tải lên.'
                : 'Đang sử dụng VietQR tự động sinh mã theo STK ngân hàng và số tiền đơn.'}
            </p>
          </div>

          {/* Webhook Simulator Card (Test Ngay) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-50 p-6 rounded-3xl border-2 border-amber-500/40 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-amber-500 text-white shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-amber-950 font-serif-title">
                  Bộ Giả Lập Webhook Ngân Hàng
                </h3>
                <p className="text-[11px] text-amber-800">
                  Giả lập sự kiện khách hàng chuyển khoản thành công từ App Ngân Hàng.
                </p>
              </div>
            </div>

            <form onSubmit={handleRunSimulator} className="space-y-3.5 pt-2">
              {/* Pick Order */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  1. Chọn Đơn Hàng Cần Test *:
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleSelectSimOrder(e.target.value)}
                  className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:outline-none focus:border-amber-500 shadow-sm"
                  required
                >
                  <option value="">-- Chọn đơn hàng trong danh sách --</option>
                  {orders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      [{ord.id}] {ord.customerName} - Cọc: {(Number(ord.depositAmount) || 0).toLocaleString('vi-VN')}đ ({ord.paymentStatus})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount to simulate */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  2. Số Tiền Ngân Hàng Nhận Được (VNĐ):
                </label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  placeholder="500000"
                  className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Transfer Content */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  3. Nội Dung Chuyển Khoản:
                </label>
                <input
                  type="text"
                  value={simContent}
                  onChange={(e) => setSimContent(e.target.value)}
                  placeholder="Ví dụ: AURA DH1002"
                  className="w-full bg-white text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <Send className={`w-4 h-4 ${isSimulating ? 'animate-bounce' : ''}`} />
                <span>{isSimulating ? 'Đang Bắn Webhook...' : '⚡ Bắn Webhook Giả Lập Ngay'}</span>
              </button>
            </form>

            {/* Simulator Result Toast */}
            {simResult && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1 animate-in zoom-in-95">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{simResult.message}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Đơn hàng <strong>{simResult.data?.orderId}</strong> đã tự động chuyển sang: <strong className="text-emerald-700">{simResult.data?.paymentStatus}</strong>.
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
