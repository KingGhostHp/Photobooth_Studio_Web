import React, { useState, useEffect } from 'react';
import { Tag, Edit2, Plus, Trash2, Check, RefreshCw, Sparkles, Camera, Sparkle, Film, ShieldCheck, DollarSign, X, Upload, Image as ImageIcon } from 'lucide-react';

export default function AdminPricing() {
  const [activeSubTab, setActiveSubTab] = useState('packages'); // 'packages' | 'addons' | 'photobooth'
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [photobooth, setPhotobooth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // Modals state
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgForm, setPkgForm] = useState({
    code: 'PKG-NEW',
    name: '',
    subtitle: '',
    basePricePerPerson: 1000000,
    deposit: 300000,
    includedPeople: 1,
    outfitsCount: 2,
    retouchedCount: 10,
    image: '/images/costume_ao_dai_viet_1786199756012.png',
    featuresText: 'Bao gồm 2 bộ trang phục cao cấp\nTrang điểm & Làm tóc chuyên nghiệp\nBàn giao toàn bộ file gốc',
    isPopular: false
  });

  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [addonForm, setAddonForm] = useState({ name: '', price: 200000 });

  const [showPbModal, setShowPbModal] = useState(false);
  const [editingPb, setEditingPb] = useState(null);
  const [pbForm, setPbForm] = useState({
    code: 'PB-NEW',
    name: '',
    description: '',
    price: 70000,
    image: ''
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPkg, resAddon, resPb] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/addons'),
        fetch('/api/photobooth')
      ]);
      const dataPkg = await resPkg.json();
      const dataAddon = await resAddon.json();
      const dataPb = await resPb.json();

      if (dataPkg.success) setPackages(dataPkg.data);
      if (dataAddon.success) setAddons(dataAddon.data);
      if (dataPb.success) setPhotobooth(dataPb.data);
    } catch (err) {
      console.error('Error fetching pricing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format currency
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  /* ==================== 1. PACKAGES HANDLERS ==================== */
  const handleOpenPkgAdd = () => {
    setEditingPkg(null);
    setPkgForm({
      code: 'PKG-CUSTOM',
      name: 'Gói Chụp Concept Mới 2026',
      subtitle: 'Phong cách độc bản & ấn tượng',
      basePricePerPerson: 1200000,
      deposit: 400000,
      includedPeople: 1,
      outfitsCount: 2,
      retouchedCount: 12,
      image: '/images/costume_ao_dai_viet_1786199756012.png',
      featuresText: 'Bao gồm 2 bộ trang phục tự chọn\nMakeup & Làm tóc cao cấp\nBàn giao toàn bộ file ảnh gốc HD',
      isPopular: false
    });
    setShowPkgModal(true);
  };

  const handleOpenPkgEdit = (pkg) => {
    setEditingPkg(pkg);
    setPkgForm({
      code: pkg.code || '',
      name: pkg.name || '',
      subtitle: pkg.subtitle || '',
      basePricePerPerson: pkg.basePricePerPerson || 0,
      deposit: pkg.deposit || 0,
      includedPeople: pkg.includedPeople || 1,
      outfitsCount: pkg.outfitsCount || 1,
      retouchedCount: pkg.retouchedCount || 10,
      image: pkg.image || '',
      featuresText: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
      isPopular: !!pkg.isPopular
    });
    setShowPkgModal(true);
  };

  const handleSavePkg = async (e) => {
    e.preventDefault();
    const features = pkgForm.featuresText.split('\n').filter(line => line.trim().length > 0);
    const body = {
      ...pkgForm,
      features
    };

    try {
      let res;
      if (editingPkg) {
        res = await fetch(`/api/packages/${editingPkg.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }

      const data = await res.json();
      if (data.success) {
        setStatusMessage(editingPkg ? 'Cập nhật giá gói chụp thành công!' : 'Thêm gói chụp mới thành công!');
        setTimeout(() => setStatusMessage(null), 3000);
        setShowPkgModal(false);
        fetchData();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  const handleDeletePkg = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Gói chụp này?')) return;
    try {
      const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Đã xóa gói chụp khỏi hệ thống!');
        setTimeout(() => setStatusMessage(null), 3000);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi xóa gói chụp: ' + err.message);
    }
  };

  /* ==================== 2. ADDONS HANDLERS ==================== */
  const handleOpenAddonAdd = () => {
    setEditingAddon(null);
    setAddonForm({ name: 'Dịch vụ chụp thêm góc cận nghệ thuật', price: 300000 });
    setShowAddonModal(true);
  };

  const handleOpenAddonEdit = (addon) => {
    setEditingAddon(addon);
    setAddonForm({ name: addon.name, price: addon.price });
    setShowAddonModal(true);
  };

  const handleSaveAddon = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingAddon) {
        res = await fetch(`/api/addons/${editingAddon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addonForm)
        });
      } else {
        res = await fetch('/api/addons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addonForm)
        });
      }

      const data = await res.json();
      if (data.success) {
        setStatusMessage('Cập nhật bảng giá phụ phí thành công!');
        setTimeout(() => setStatusMessage(null), 3000);
        setShowAddonModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDeleteAddon = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ phụ phí này?')) return;
    try {
      const res = await fetch(`/api/addons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Đã xóa dịch vụ phụ phí!');
        setTimeout(() => setStatusMessage(null), 3000);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi xóa: ' + err.message);
    }
  };

  /* ==================== 3. PHOTOBOOTH HANDLERS ==================== */
  const handlePbImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPbForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenPbAdd = () => {
    setEditingPb(null);
    setPbForm({
      code: 'PB-Y2K-04',
      name: 'Khung In Dải Ảnh Vintage 6-Cut',
      description: 'Chụp dải ảnh 6 ô độc đáo viền hologram lấp lánh',
      price: 90000,
      image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80'
    });
    setShowPbModal(true);
  };

  const handleOpenPbEdit = (pb) => {
    setEditingPb(pb);
    setPbForm({
      code: pb.code || '',
      name: pb.name || '',
      description: pb.description || '',
      price: pb.price || 0,
      image: pb.image || ''
    });
    setShowPbModal(true);
  };

  const handleSavePb = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingPb) {
        res = await fetch(`/api/photobooth/${editingPb.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pbForm)
        });
      } else {
        res = await fetch('/api/photobooth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pbForm)
        });
      }

      const data = await res.json();
      if (data.success) {
        setStatusMessage('Cập nhật bảng giá Photobooth thành công!');
        setTimeout(() => setStatusMessage(null), 3000);
        setShowPbModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDeletePb = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khung ảnh Photobooth này?')) return;
    try {
      const res = await fetch(`/api/photobooth/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Đã xóa khung ảnh Photobooth!');
        setTimeout(() => setStatusMessage(null), 3000);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi xóa: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif-title text-slate-900">Quản Lý Bảng Giá & Các Gói Dịch Vụ</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200">
              Pricing CMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Điều chỉnh giá các Gói chụp ảnh Concept, Dịch vụ phụ phí đi kèm và Bảng giá khung ảnh Photobooth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Sub Tabs Selection */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 max-w-xl">
        <button
          onClick={() => setActiveSubTab('packages')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'packages'
              ? 'bg-white text-amber-800 shadow-sm border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-600" />
          <span>Gói Chụp Concept ({packages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('addons')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'addons'
              ? 'bg-white text-amber-800 shadow-sm border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4 text-amber-600" />
          <span>Dịch Vụ Phụ Phí ({addons.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('photobooth')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'photobooth'
              ? 'bg-white text-amber-800 shadow-sm border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Film className="w-4 h-4 text-amber-600" />
          <span>Khung Photobooth ({photobooth.length})</span>
        </button>
      </div>

      {/* TAB 1: SERVICE PACKAGES */}
      {activeSubTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Danh Sách Bảng Giá Gói Chụp Ảnh</h3>
            <button
              onClick={handleOpenPkgAdd}
              className="btn-gold px-4 py-2 text-xs font-extrabold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Gói Chụp Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow">
                      {pkg.code}
                    </div>
                    {pkg.isPopular && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow">
                        Hot Pick 2026
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-base font-extrabold font-serif-title text-slate-900 leading-snug">{pkg.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{pkg.subtitle}</p>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Giá Gói Trọn Gói</span>
                        <span className="text-base font-black text-amber-900">{formatVND(pkg.basePricePerPerson)}</span>
                        <span className="text-[10px] font-bold text-slate-500"> / người</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Tiền Cọc Giữ Lịch</span>
                        <span className="text-xs font-extrabold text-slate-800">{formatVND(pkg.deposit)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      {Array.isArray(pkg.features) && pkg.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
                  <button
                    onClick={() => handleOpenPkgEdit(pkg)}
                    className="btn-outline-gold px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Sửa Giá & Chi Tiết</span>
                  </button>
                  <button
                    onClick={() => handleDeletePkg(pkg.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE ADDONS */}
      {activeSubTab === 'addons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Danh Sách Giá Dịch Vụ Đi Kèm & Phụ Phí</h3>
            <button
              onClick={handleOpenAddonAdd}
              className="btn-gold px-4 py-2 text-xs font-extrabold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Dịch Vụ Mới</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="p-4">Tên Dịch Vụ Phụ Phí</th>
                  <th className="p-4">Đơn Giá Niêm Yết (VNĐ)</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {addons.map((addon) => (
                  <tr key={addon.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{addon.name}</td>
                    <td className="p-4 font-extrabold text-amber-800">{formatVND(addon.price)}</td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenAddonEdit(addon)}
                        className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs hover:bg-amber-100 transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Sửa Giá</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAddon(addon.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PHOTOBOOTH CONCEPTS */}
      {activeSubTab === 'photobooth' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Danh Sách Bảng Giá Khung Ảnh Photobooth</h3>
            <button
              onClick={handleOpenPbAdd}
              className="btn-gold px-4 py-2 text-xs font-extrabold flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Khung Ảnh Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {photobooth.map((pb) => (
              <div key={pb.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                    {pb.image ? (
                      <img src={pb.image} alt={pb.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-100">
                        <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-[10px] font-bold">Chưa có ảnh mẫu</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow">
                      {pb.code}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900">{pb.name}</h4>
                      <span className="text-base font-black text-amber-900">{formatVND(pb.price)}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">{pb.description}</p>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
                  <button
                    onClick={() => handleOpenPbEdit(pb)}
                    className="btn-outline-gold px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Sửa Giá & Ảnh Mẫu</span>
                  </button>
                  <button
                    onClick={() => handleDeletePb(pb.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL EDIT / ADD PACKAGE */}
      {showPkgModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold font-serif-title text-slate-900">
                {editingPkg ? `Chỉnh Sửa Giá & Thông Tin (${editingPkg.code})` : 'Thêm Gói Chụp Ảnh Mới'}
              </h3>
              <button onClick={() => setShowPkgModal(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePkg} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block">Tên Gói Chụp</label>
                  <input
                    type="text"
                    required
                    value={pkgForm.name}
                    onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block">Mã Gói (Code)</label>
                  <input
                    type="text"
                    required
                    value={pkgForm.code}
                    onChange={(e) => setPkgForm({ ...pkgForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block">Tiêu Đề Phụ (Subtitle)</label>
                <input
                  type="text"
                  value={pkgForm.subtitle}
                  onChange={(e) => setPkgForm({ ...pkgForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 outline-none"
                />
              </div>

              {/* Price & Deposit Inputs */}
              <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                <div>
                  <label className="text-xs font-extrabold text-amber-900 block">Đơn Giá Gói / Người (VNĐ)</label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={pkgForm.basePricePerPerson}
                    onChange={(e) => setPkgForm({ ...pkgForm, basePricePerPerson: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-black text-amber-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block">Tiền Cọc Giữ Lịch (VNĐ)</label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={pkgForm.deposit}
                    onChange={(e) => setPkgForm({ ...pkgForm, deposit: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-extrabold focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block">Các Ưu Đãi Bao Gồm (Mỗi dòng 1 ý)</label>
                <textarea
                  rows={4}
                  value={pkgForm.featuresText}
                  onChange={(e) => setPkgForm({ ...pkgForm, featuresText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowPkgModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">Hủy</button>
                <button type="submit" className="btn-gold px-5 py-2 text-xs font-extrabold">Lưu Bảng Giá</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / ADD ADDON */}
      {showAddonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold font-serif-title text-slate-900">
                {editingAddon ? 'Chỉnh Sửa Giá Phụ Phí' : 'Thêm Dịch Vụ Đi Kèm'}
              </h3>
              <button onClick={() => setShowAddonModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddon} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Tên Dịch Vụ Đi Kèm</label>
                <input
                  type="text"
                  required
                  value={addonForm.name}
                  onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-amber-900 block">Đơn Giá Phụ Phí (VNĐ)</label>
                <input
                  type="number"
                  step="10000"
                  required
                  value={addonForm.price}
                  onChange={(e) => setAddonForm({ ...addonForm, price: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-black text-amber-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddonModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">Hủy</button>
                <button type="submit" className="btn-gold px-5 py-2 text-xs font-extrabold">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / ADD PHOTOBOOTH */}
      {showPbModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold font-serif-title text-slate-900">
                {editingPb ? `Chỉnh Sửa Giá Photobooth (${editingPb.code})` : 'Thêm Khung Ảnh Photobooth Mới'}
              </h3>
              <button onClick={() => setShowPbModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePb} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Tên Khung Ảnh Photobooth</label>
                <input
                  type="text"
                  required
                  value={pbForm.name}
                  onChange={(e) => setPbForm({ ...pbForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block">Mã Khung Ảnh</label>
                <input
                  type="text"
                  required
                  value={pbForm.code}
                  onChange={(e) => setPbForm({ ...pbForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block">Mô Tả Kiểu Dáng</label>
                <input
                  type="text"
                  value={pbForm.description}
                  onChange={(e) => setPbForm({ ...pbForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-amber-900 block">Đơn Giá / Dải Ảnh (VNĐ)</label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={pbForm.price}
                  onChange={(e) => setPbForm({ ...pbForm, price: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-black text-amber-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
                />
              </div>

              {/* Image Upload & Preview Box */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block">Ảnh Mẫu Khung Photobooth</label>
                
                {pbForm.image && (
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img src={pbForm.image} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-slate-950/80 text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                      Ảnh mẫu xem trước
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex-1 btn-gold py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>Chọn Ảnh Từ Máy Tính</span>
                    <input type="file" accept="image/*" onChange={handlePbImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowPbModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">Hủy</button>
                <button type="submit" className="btn-gold px-5 py-2 text-xs font-extrabold">Lưu Bảng Giá & Ảnh Vào SQL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
