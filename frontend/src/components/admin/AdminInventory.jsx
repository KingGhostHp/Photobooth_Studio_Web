import React, { useState, useEffect, useRef } from 'react';
import { COSTUME_ITEMS, COSTUME_CATEGORIES, CATEGORY_DETAILS } from '../../data/costumes';
import { Shirt, Plus, Edit3, Trash2, CheckCircle2, RefreshCw, X, Tag, Layers, Search, Filter, ShieldCheck, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

export default function AdminInventory() {
  const [activeTab, setActiveTab] = useState('costumes'); // 'costumes' | 'categories'
  const [costumeList, setCostumeList] = useState(COSTUME_ITEMS);
  const [categoryList, setCategoryList] = useState(COSTUME_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  // Image Upload Mode: 'file' | 'url'
  const [imageUploadMode, setImageUploadMode] = useState('file');

  // Modals state
  const [isAddCostumeOpen, setIsAddCostumeOpen] = useState(false);
  const [editingCostume, setEditingCostume] = useState(null);
  const [deletingCostume, setDeletingCostume] = useState(null);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Costume Form State
  const [costumeForm, setCostumeForm] = useState({
    code: '',
    name: '',
    category: 'ao-dai-cuoi-hoi',
    categoryName: 'Áo Dài Cưới Hỏi',
    gender: 'Nữ',
    sizes: ['S', 'M', 'L'],
    rentalPrice: 250000,
    depositAmount: 500000,
    image: '/images/costume_ao_dai_viet_1786199756012.png',
    description: '',
    availableCount: 5,
    tags: ['Mới']
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    title: '',
    subtitle: '',
    seoIntro: '',
    features: ['Chất Lượng High-end', 'Đủ Size', 'Bóp Sửa Miễn Phí', 'Khử Khuẩn 100%']
  });

  // Fetch Costumes & Categories from Backend API (PostgreSQL)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCostumes, resCategories] = await Promise.all([
        fetch('/api/costumes').then(r => r.ok ? r.json() : null),
        fetch('/api/categories').then(r => r.ok ? r.json() : null)
      ]);

      if (resCostumes?.success && resCostumes.data.length > 0) {
        setCostumeList(resCostumes.data);
      }
      if (resCategories?.success && resCategories.data.length > 0) {
        setCategoryList(resCategories.data);
      }
    } catch (err) {
      console.warn('Backend API connection failed, using local mock data fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ==========================================================================
     IMAGE UPLOAD & BASE64 COMPRESSION HANDLER
     ========================================================================== */

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image via Canvas to keep SQL payload fast & optimized
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to compressed Base64 data URL string
        const base64DataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCostumeForm(prev => ({ ...prev, image: base64DataUrl }));
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  /* ==========================================================================
     COSTUME CRUD ACTIONS
     ========================================================================== */

  const handleCreateCostume = async (e) => {
    e.preventDefault();
    const newId = `ITEM-${Date.now()}`;
    const selectedCatObj = categoryList.find(c => c.id === costumeForm.category);
    const categoryName = selectedCatObj ? selectedCatObj.name : costumeForm.categoryName;
    
    const payload = {
      ...costumeForm,
      id: newId,
      code: costumeForm.code || newId,
      categoryName,
      rentalPrice: Number(costumeForm.rentalPrice),
      depositAmount: Number(costumeForm.depositAmount),
      availableCount: Number(costumeForm.availableCount)
    };

    try {
      const res = await fetch('/api/costumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchData();
      } else {
        setCostumeList([payload, ...costumeList]);
      }
    } catch (err) {
      setCostumeList([payload, ...costumeList]);
    }

    setIsAddCostumeOpen(false);
    resetCostumeForm();
  };

  const handleUpdateCostume = async (e) => {
    e.preventDefault();
    if (!editingCostume) return;

    const selectedCatObj = categoryList.find(c => c.id === costumeForm.category);
    const categoryName = selectedCatObj ? selectedCatObj.name : costumeForm.categoryName;

    const updatedData = {
      ...costumeForm,
      categoryName,
      rentalPrice: Number(costumeForm.rentalPrice),
      depositAmount: Number(costumeForm.depositAmount),
      availableCount: Number(costumeForm.availableCount)
    };

    try {
      const res = await fetch(`/api/costumes/${editingCostume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        fetchData();
      } else {
        setCostumeList(costumeList.map(item => item.id === editingCostume.id ? { ...item, ...updatedData } : item));
      }
    } catch (err) {
      setCostumeList(costumeList.map(item => item.id === editingCostume.id ? { ...item, ...updatedData } : item));
    }

    setEditingCostume(null);
    resetCostumeForm();
  };

  const updateCostumeStatus = async (id, newStatus) => {
    setCostumeList(costumeList.map(item => item.id === id ? { ...item, availableStatus: newStatus } : item));
    try {
      await fetch(`/api/costumes/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to sync status to database:', err);
    }
  };

  const handleDeleteCostume = async () => {
    if (!deletingCostume) return;
    try {
      await fetch(`/api/costumes/${deletingCostume.id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API delete error, deleting locally:', err);
    }
    setCostumeList(costumeList.filter(item => item.id !== deletingCostume.id));
    setDeletingCostume(null);
  };

  const openEditCostumeModal = (item) => {
    setEditingCostume(item);
    setCostumeForm({
      code: item.code || item.id,
      name: item.name,
      category: item.category || 'ao-dai-cuoi-hoi',
      categoryName: item.categoryName || 'Áo Dài Cưới Hỏi',
      gender: item.gender || 'Nữ',
      sizes: item.sizes || ['S', 'M'],
      rentalPrice: item.rentalPrice,
      depositAmount: item.depositAmount,
      image: item.image,
      description: item.description || '',
      availableCount: item.availableCount || 1,
      tags: item.tags || []
    });
  };

  const resetCostumeForm = () => {
    setCostumeForm({
      code: '',
      name: '',
      category: 'ao-dai-cuoi-hoi',
      categoryName: 'Áo Dài Cưới Hỏi',
      gender: 'Nữ',
      sizes: ['S', 'M', 'L'],
      rentalPrice: 250000,
      depositAmount: 500000,
      image: '/images/costume_ao_dai_viet_1786199756012.png',
      description: '',
      availableCount: 5,
      tags: ['Mới']
    });
  };

  /* ==========================================================================
     CATEGORY CRUD ACTIONS
     ========================================================================== */

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const catId = categoryForm.id ? categoryForm.id.toLowerCase().replace(/\s+/g, '-') : `cat-${Date.now()}`;
    const payload = {
      ...categoryForm,
      id: catId,
      title: categoryForm.title || `CHO THUÊ ${categoryForm.name.toUpperCase()}`
    };

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchData();
      } else {
        setCategoryList([...categoryList, { id: catId, name: payload.name }]);
      }
    } catch (err) {
      setCategoryList([...categoryList, { id: catId, name: payload.name }]);
    }

    setIsAddCategoryOpen(false);
    resetCategoryForm();
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        fetchData();
      } else {
        setCategoryList(categoryList.map(c => c.id === editingCategory.id ? { ...c, name: categoryForm.name } : c));
      }
    } catch (err) {
      setCategoryList(categoryList.map(c => c.id === editingCategory.id ? { ...c, name: categoryForm.name } : c));
    }

    setEditingCategory(null);
    resetCategoryForm();
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await fetch(`/api/categories/${deletingCategory.id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Delete category API error:', err);
    }
    setCategoryList(categoryList.filter(c => c.id !== deletingCategory.id));
    setDeletingCategory(null);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    const detail = CATEGORY_DETAILS[cat.id] || {};
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      title: detail.title || cat.title || '',
      subtitle: detail.subtitle || cat.subtitle || '',
      seoIntro: detail.seoIntro || cat.seoIntro || '',
      features: detail.features || cat.features || ['Chất Lượng High-end', 'Khử Khuẩn 100%']
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      id: '',
      name: '',
      title: '',
      subtitle: '',
      seoIntro: '',
      features: ['Chất Lượng High-end', 'Đủ Size', 'Bóp Sửa Miễn Phí', 'Khử Khuẩn 100%']
    });
  };

  // Filtered Costumes
  const filteredCostumes = costumeList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header & Section Switcher */}
      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4 text-slate-100 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                PostgreSQL Realtime Database
              </span>
              {loading && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
            </div>
            <h2 className="text-2xl font-bold font-serif-title text-white">Quản Lý Kho Trang Phục & Loại Trang Phục</h2>
            <p className="text-xs text-slate-400">Thêm, sửa, xóa (CRUD) danh mục trang phục và tải ảnh lưu trữ trực tiếp vào SQL.</p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'costumes' ? (
              <button
                onClick={() => {
                  resetCostumeForm();
                  setIsAddCostumeOpen(true);
                }}
                className="btn-gold px-5 py-2.5 text-xs font-bold shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Mẫu Trang Phục</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  resetCategoryForm();
                  setIsAddCategoryOpen(true);
                }}
                className="btn-gold px-5 py-2.5 text-xs font-bold shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Loại Trang Phục Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="flex items-center gap-2 border-t border-slate-700/80 pt-4">
          <button
            onClick={() => setActiveTab('costumes')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'costumes'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Danh Sách Mẫu Trang Phục ({costumeList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Các Loại Trang Phục ({categoryList.length})</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
         TAB 1: COSTUMES MANAGEMENT (Mẫu Trang Phục)
         =================================================================== */}
      {activeTab === 'costumes' && (
        <div className="space-y-6">
          {/* Search & Counter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên mẫu, mã sản phẩm hoặc danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Hiển thị {filteredCostumes.length} / {costumeList.length} mẫu
            </span>
          </div>

          {/* Costumes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCostumes.map((item) => (
              <div key={item.id} className="card-clean bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-3 left-3 badge-gold">
                      {item.code}
                    </span>
                    
                    {/* Action Buttons (Edit / Delete) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => openEditCostumeModal(item)}
                        className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-amber-500 hover:text-white transition-colors shadow-md"
                        title="Chỉnh sửa chi tiết"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingCostume(item)}
                        className="p-2 rounded-xl bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors shadow-md"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-700 font-bold uppercase">{item.categoryName || item.category}</span>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                    <div className="text-xs text-slate-600 flex justify-between pt-1 font-semibold">
                      <span>Giá thuê: <strong className="text-amber-800 font-extrabold">{item.rentalPrice?.toLocaleString('vi-VN')}đ</strong></span>
                      <span>Cọc: <strong>{item.depositAmount?.toLocaleString('vi-VN')}đ</strong></span>
                    </div>
                  </div>
                </div>

                {/* Lifecycle Status Select Bar */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>Cập Nhật Trạng Thái Kho:</span>
                    <span className="text-slate-600">Kho: {item.availableCount || 1} bộ</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                    <button
                      onClick={() => updateCostumeStatus(item.id, 'AVAILABLE')}
                      className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                        item.availableStatus === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ✓ Sẵn Sàng
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
      )}

      {/* ===================================================================
         TAB 2: CATEGORIES MANAGEMENT (Loại Trang Phục)
         =================================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryList.map((cat) => {
              const detail = CATEGORY_DETAILS[cat.id] || {};
              const countItems = costumeList.filter(i => i.category === cat.id || i.categoryName === cat.name).length;

              return (
                <div key={cat.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="badge-gold font-mono text-[10px]">ID: {cat.id}</span>
                      <span className="text-xs text-amber-700 bg-amber-50 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                        {countItems} sản phẩm
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 font-serif-title">{cat.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {detail.seoIntro || cat.seoIntro || 'Chưa có mô tả chi tiết cho loại trang phục này.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditCategoryModal(cat)}
                      className="flex-1 py-2 px-3 bg-slate-100 text-slate-800 hover:bg-amber-500 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh Sửa</span>
                    </button>

                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-colors"
                      title="Xóa Loại Trang Phục"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
         MODALS FOR COSTUMES (ADD / EDIT / DELETE)
         =================================================================== */}

      {/* Add / Edit Costume Modal */}
      {(isAddCostumeOpen || editingCostume) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl p-6 relative border border-slate-200 space-y-5 my-8">
            <button
              onClick={() => {
                setIsAddCostumeOpen(false);
                setEditingCostume(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-serif-title text-slate-900">
              {editingCostume ? 'Cập Nhật Mẫu Trang Phục' : 'Thêm Mới Mẫu Trang Phục Thuê'}
            </h3>

            <form onSubmit={editingCostume ? handleUpdateCostume : handleCreateCostume} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mã Sản Phẩm *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: AD-108"
                    value={costumeForm.code}
                    onChange={(e) => setCostumeForm({ ...costumeForm, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tên Trang Phục *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Áo Dài Thêu Hoa Cúc"
                    value={costumeForm.name}
                    onChange={(e) => setCostumeForm({ ...costumeForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Loại Trang Phục *</label>
                  <CustomSelect
                    value={costumeForm.category}
                    onChange={(val) => {
                      const catObj = categoryList.find(c => c.id === val);
                      setCostumeForm({
                        ...costumeForm,
                        category: val,
                        categoryName: catObj ? catObj.name : val
                      });
                    }}
                    options={categoryList.map(cat => ({ label: cat.name, value: cat.id }))}
                    placeholder="Chọn loại trang phục"
                    icon={Layers}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Giới Tính Phù Hợp</label>
                  <CustomSelect
                    value={costumeForm.gender}
                    onChange={(val) => setCostumeForm({ ...costumeForm, gender: val })}
                    options={[
                      { label: 'Nữ', value: 'Nữ' },
                      { label: 'Nam', value: 'Nam' },
                      { label: 'Unisex', value: 'Unisex' }
                    ]}
                    placeholder="Chọn giới tính"
                    icon={Tag}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Giá Thuê / Ngày (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    step="10000"
                    value={costumeForm.rentalPrice}
                    onChange={(e) => setCostumeForm({ ...costumeForm, rentalPrice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tiền Đặt Cọc (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    step="10000"
                    value={costumeForm.depositAmount}
                    onChange={(e) => setCostumeForm({ ...costumeForm, depositAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Số Lượng Kho</label>
                  <input
                    type="number"
                    min="1"
                    value={costumeForm.availableCount}
                    onChange={(e) => setCostumeForm({ ...costumeForm, availableCount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* IMAGE UPLOAD SECTION: DIRECT FILE UPLOAD TO SQL */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>Hình Ảnh Mẫu Trang Phục (Tải file từ máy - Lưu vào SQL):</span>
                </label>

                <div className="space-y-3">
                  {/* Drag and Drop / Click File Selector Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 p-4 rounded-2xl cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Nhấp vào đây để chọn ảnh từ máy tính</p>
                      <p className="text-[11px] text-slate-500">Hỗ trợ JPG, PNG, WEBP (Tự động nén & lưu trực tiếp vào CSDL SQL)</p>
                    </div>
                  </div>
                </div>

                {/* LIVE IMAGE PREVIEW BOX */}
                {costumeForm.image && (
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group">
                    <img
                      src={costumeForm.image}
                      alt="Preview Trang Phục"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 border border-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Xem Trước Ảnh Sẽ Lưu SQL</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCostumeForm({ ...costumeForm, image: '' })}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                      title="Xóa ảnh"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mô Tả Sản Phẩm</label>
                <textarea
                  rows="3"
                  placeholder="Mô tả chất liệu lụa, họa tiết thêu, phụ kiện đi kèm..."
                  value={costumeForm.description}
                  onChange={(e) => setCostumeForm({ ...costumeForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCostumeOpen(false);
                    setEditingCostume(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn-gold px-6 py-2.5 text-xs font-bold">
                  {editingCostume ? 'Lưu Thay Đổi (PostgreSQL)' : 'Thêm Mới Vào Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Costume Modal */}
      {deletingCostume && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Xác Nhận Xóa Trang Phục</h3>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa sản phẩm <strong>"{deletingCostume.name}"</strong> (Mã: {deletingCostume.code}) khỏi cơ sở dữ liệu PostgreSQL?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCostume(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleDeleteCostume}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ===================================================================
         MODALS FOR CATEGORIES (ADD / EDIT / DELETE)
         =================================================================== */}

      {/* Add / Edit Category Modal */}
      {(isAddCategoryOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl p-6 relative border border-slate-200 space-y-5 my-8">
            <button
              onClick={() => {
                setIsAddCategoryOpen(false);
                setEditingCategory(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-serif-title text-slate-900">
              {editingCategory ? 'Chỉnh Sửa Loại Trang Phục' : 'Thêm Mới Loại Trang Phục (Category)'}
            </h3>

            <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ID Loại Trang Phục *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCategory}
                    placeholder="VD: ao-dai-tet"
                    value={categoryForm.id}
                    onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tên Loại Trang Phục *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Áo Dài Tết 2026"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tiêu Đề Trang Danh Mục (Title Banner)</label>
                <input
                  type="text"
                  placeholder="VD: CHO THUÊ ÁO DÀI TẾT - BỘ SƯU TẬP HOÀNG CÚC DÁT VÀNG"
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Bài Đoạn Văn Giới Thiệu SEO</label>
                <textarea
                  rows="3"
                  placeholder="Nội dung giới thiệu chi tiết xuất hiện ở đầu trang danh mục..."
                  value={categoryForm.seoIntro}
                  onChange={(e) => setCategoryForm({ ...categoryForm, seoIntro: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCategoryOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn-gold px-6 py-2.5 text-xs font-bold">
                  {editingCategory ? 'Lưu Thay Đổi (PostgreSQL)' : 'Tạo Loại Trang Phục Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Xác Nhận Xóa Loại Trang Phục</h3>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa loại trang phục <strong>"{deletingCategory.name}"</strong> (ID: {deletingCategory.id}) khỏi PostgreSQL?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
