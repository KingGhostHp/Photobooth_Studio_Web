import React, { useState, useEffect } from 'react';
import { COSTUME_ITEMS, COSTUME_CATEGORIES, CATEGORY_DETAILS } from '../../data/costumes';
import { Filter, Search, ShoppingBag, Eye, Sparkles, Check, X, Phone, ChevronRight, ShieldCheck, Shirt, Award } from 'lucide-react';

export default function CostumesCatalog({
  onAddToCart,
  onOpenMixMatch,
  selectedCategory = 'all',
  setSelectedCategory
}) {
  const [selectedGender, setSelectedGender] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalItem, setDetailModalItem] = useState(null);

  // Dynamic state for costumes & categories fetched from PostgreSQL database
  const [itemsList, setItemsList] = useState(COSTUME_ITEMS);
  const [categoryList, setCategoryList] = useState(COSTUME_CATEGORIES);

  useEffect(() => {
    // Fetch live costumes and categories from PostgreSQL API
    const fetchLiveCostumes = async () => {
      try {
        const [resCostumes, resCategories] = await Promise.all([
          fetch('/api/costumes').then(r => r.ok ? r.json() : null),
          fetch('/api/categories').then(r => r.ok ? r.json() : null)
        ]);

        if (resCostumes?.success && resCostumes.data.length > 0) {
          setItemsList(resCostumes.data);
        }
        if (resCategories?.success && resCategories.data.length > 0) {
          setCategoryList(resCategories.data);
        }
      } catch (err) {
        console.warn('Using default mock costumes fallback:', err);
      }
    };

    fetchLiveCostumes();
  }, []);

  // Active Category metadata
  const currentCategoryDetail = CATEGORY_DETAILS[selectedCategory] || CATEGORY_DETAILS['all'];
  const activeCategoryObj = categoryList.find(c => c.id === selectedCategory) || categoryList[0] || COSTUME_CATEGORIES[0];

  const filteredItems = itemsList.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchGen = selectedGender === 'all' || item.gender === selectedGender;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.code || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchGen && matchSearch;
  });

  return (
    <section className="py-10 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Breadcrumb Navigation Bar (Cong Studio Style) */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white py-3 px-5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <button 
            onClick={() => setSelectedCategory && setSelectedCategory('all')}
            className="hover:text-amber-600 transition-colors whitespace-nowrap"
          >
            Trang Chủ
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          <span className="text-slate-400 whitespace-nowrap">Dịch Vụ</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          <button 
            onClick={() => setSelectedCategory && setSelectedCategory('all')}
            className="hover:text-amber-600 transition-colors whitespace-nowrap"
          >
            Thuê Trang Phục
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          <span className="text-amber-600 font-bold whitespace-nowrap">
            {activeCategoryObj.name.toUpperCase()}
          </span>
        </nav>

        {/* Dedicated Category Page Header & Rich Content Section */}
        <div className="bg-gradient-to-br from-white to-amber-50/40 p-6 sm:p-10 rounded-3xl border border-amber-100/80 shadow-md space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="badge-gold inline-flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Aura Studio Premium Collection</span>
                </span>
                <span className="text-xs text-amber-700 font-bold bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Hơn {filteredItems.length}+ Mẫu Có Sẵn
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif-title text-slate-900 leading-tight">
                {currentCategoryDetail.title}
              </h1>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {currentCategoryDetail.seoIntro}
              </p>
            </div>

            {/* Quick Consultation CTA Box */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              <a
                href="tel:0975397923"
                className="btn-gold px-6 py-3 text-xs font-bold justify-center"
              >
                <Phone className="w-4 h-4" />
                <span>Hotline Thuê Đồ: 0975.397.923</span>
              </a>

              <a
                href="https://zalo.me/0975397923"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Tư Vẫn Zalo: 0975.397.923</span>
              </a>
            </div>
          </div>

          {/* Feature Highlights Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-200/60">
            {currentCategoryDetail.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Category Tabs & Filters */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-600" />
              <span>Danh Mục Trang Phục Thuê</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Hiển thị {filteredItems.length} kết quả
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {categoryList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory && setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Right Filters: Gender & Search */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-4 py-2.5 rounded-full focus:outline-none focus:border-amber-500"
              >
                <option value="all">Tất Cả Giới Tính</option>
                <option value="Nữ">Nữ (Áo Dài & Váy)</option>
                <option value="Nam">Nam (Vest & Tuxedo)</option>
                <option value="Unisex">Unisex (Áo Tấc & Cử Nhân)</option>
              </select>

              <div className="relative flex-1 lg:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mã SP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-10 pr-4 py-2.5 rounded-full focus:outline-none focus:border-amber-500 placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
            <Shirt className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Chưa tìm thấy mẫu trang phục phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Không tìm thấy sản phẩm thuộc danh mục này với từ khóa "{searchQuery}". Vui lòng thử lại với từ khóa khác hoặc xem tất cả trang phục.
            </p>
            <button
              onClick={() => {
                setSelectedCategory && setSelectedCategory('all');
                setSearchQuery('');
                setSelectedGender('all');
              }}
              className="btn-gold px-6 py-2.5 text-xs font-bold inline-flex"
            >
              Xem Tất Cả Trang Phục Sẵn Có
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="card-clean rounded-3xl overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container with Hover Actions */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Category Tag Badge */}
                    <span className="absolute top-3 left-3 badge-gold shadow-sm">
                      {item.categoryName}
                    </span>

                    {/* Hover Quick Action Buttons */}
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                      <button
                        onClick={() => setDetailModalItem(item)}
                        className="p-3 rounded-full bg-white text-slate-900 hover:bg-amber-500 hover:text-white transition-colors shadow-lg"
                        title="Xem Chi Tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAddToCart(item)}
                        className="p-3 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-lg"
                        title="Thuê Ngay"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{item.code}</span>
                      <div className="flex gap-1">
                        {(Array.isArray(item.sizes) ? item.sizes : []).map((sz) => (
                          <span key={sz} className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Pricing & Rent Button */}
                <div className="p-5 pt-0 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Giá thuê / ngày</span>
                      <strong className="text-amber-700 font-extrabold text-base">
                        {(Number(item.rentalPrice) || 0).toLocaleString('vi-VN')} VNĐ
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Đặt cọc</span>
                      <span className="text-slate-600 font-bold text-xs">
                        {(Number(item.depositAmount) || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart(item)}
                    className="w-full btn-gold justify-center py-2.5 text-xs font-bold"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Chọn Thuê Bộ Này</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Detail Modal */}
        {detailModalItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl p-6 relative border border-slate-200 space-y-6">
              <button
                onClick={() => setDetailModalItem(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-slate-100">
                  <img
                    src={detailModalItem.image}
                    alt={detailModalItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="badge-gold">{detailModalItem.categoryName}</span>
                    <h3 className="text-2xl font-bold font-serif-title text-slate-900">{detailModalItem.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{detailModalItem.description}</p>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mã sản phẩm:</span>
                        <strong className="text-slate-900">{detailModalItem.code}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Kích cỡ có sẵn:</span>
                        <strong className="text-slate-900">{detailModalItem.sizes.join(', ')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tình trạng kho:</span>
                        <span className="text-emerald-600 font-bold">✓ Còn {detailModalItem.availableCount} bộ sẵn có</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-600 font-semibold">Giá thuê / 24H:</span>
                      <strong className="text-lg text-amber-800 font-extrabold">{detailModalItem.rentalPrice.toLocaleString('vi-VN')} VNĐ</strong>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Tiền đặt cọc quy định:</span>
                      <strong className="text-slate-900">{detailModalItem.depositAmount.toLocaleString('vi-VN')} VNĐ</strong>
                    </div>

                    <button
                      onClick={() => {
                        onAddToCart(detailModalItem);
                        setDetailModalItem(null);
                      }}
                      className="btn-gold w-full justify-center py-3 text-xs"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Thêm Vào Giỏ Thuê Trực Tiếp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
