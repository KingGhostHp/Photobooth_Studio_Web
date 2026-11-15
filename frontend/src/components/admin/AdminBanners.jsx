import { adminFetch } from "../../studio/api";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

export default function AdminBanners({ refreshKey = 0 }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    tag: "",
    badge: "",
    image: "",
    buttonText: "",
    buttonLink: "#booking",
    hotline: "0975.475.789",
    isActive: true,
    sortOrder: 1,
  });
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch Banners from PostgreSQL API
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/banners?all=true");
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [refreshKey]);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "KỶ YẾU MIỀN BẮC & CONCEPT ĐỘC BẢN 2026",
      subtitle:
        "Hơn 100+ Concept Kỷ Yếu Học Sinh, Sinh Viên Đỉnh Cao • Trọn Gói Phim Ảnh & Trang Phục",
      tag: "Yearbook Concept 2026",
      badge: "Cộng Studio Style",
      image: "/images/banners/banner1.png",
      buttonText: "Đặt Lịch Chụp Kỷ Yếu",
      buttonLink: "#booking",
      hotline: "0975.475.789 - 0968.475.789",
      isActive: true,
      sortOrder: (banners.length || 0) + 1,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      tag: banner.tag || "",
      badge: banner.badge || "",
      image: banner.image || "",
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "#booking",
      hotline: banner.hotline || "",
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      sortOrder: banner.sortOrder || 1,
    });
    setShowModal(true);
  };

  // Upload image file directly from local computer (Base64)
  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Vui lòng chọn ảnh dung lượng dưới 5MB để đạt hiệu năng tốt nhất!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({
        ...prev,
        image: uploadEvent.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submit Form (Save to PostgreSQL)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      alert("Vui lòng nhập đầy đủ tiêu đề và hình ảnh!");
      return;
    }

    try {
      let res;
      if (editingBanner) {
        // PUT update
        res = await adminFetch(`/api/banners/${editingBanner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // POST create
        res = await adminFetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      const data = await res.json();
      if (data.success) {
        setStatusMessage(
          editingBanner
            ? "Cập nhật Banner thành công!"
            : "Thêm Banner mới thành công!",
        );
        setTimeout(() => setStatusMessage(null), 3000);
        setShowModal(false);
        fetchBanners();
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    }
  };

  // Toggle active banner state
  const handleToggleActive = async (banner) => {
    try {
      const res = await adminFetch(`/api/banners/${banner.id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        fetchBanners();
      }
    } catch (err) {
      alert("Lỗi cập nhật trạng thái banner: " + err.message);
    }
  };

  // Delete banner
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Banner này khỏi hệ thống?"))
      return;
    try {
      const res = await adminFetch(`/api/banners/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Đã xóa Banner thành công!");
        setTimeout(() => setStatusMessage(null), 3000);
        fetchBanners();
      }
    } catch (err) {
      alert("Lỗi xóa Banner: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="error-state" role="alert">
          {loadError}
        </div>
      )}
      <div className="admin-module-toolbar">
        <span>{banners.length} banner · Hiển thị tại Studio Notes</span>
        <button className="button button-small" onClick={handleOpenAddModal}>
          <Plus size={15} />
          Thêm banner
        </button>
      </div>

      {/* Success Notification */}
      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Banners List Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
          <p className="text-xs font-bold">Đang tải nội dung banner…</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-3">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-600">
            Chưa có Banner nào trong cơ sở dữ liệu
          </p>
          <button
            onClick={handleOpenAddModal}
            className="btn-gold px-4 py-2 text-xs font-bold"
          >
            Tạo Banner Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-sm hover:shadow-md ${
                banner.isActive
                  ? "border-slate-200"
                  : "border-slate-300 opacity-60 bg-slate-50"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                {/* Banner Thumbnail Preview (16:9) */}
                <div className="lg:col-span-5 relative aspect-[16/8] bg-slate-900 overflow-hidden group">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow">
                      #{banner.sortOrder || index + 1}
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                      {banner.badge || "Cộng Studio Style"}
                    </span>
                  </div>

                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-red-500 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                        Đang Ẩn Banner
                      </span>
                    </div>
                  )}
                </div>

                {/* Banner Content Details */}
                <div className="lg:col-span-7 p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-amber-200">
                      Tag: {banner.tag || "Concept 2026"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                          banner.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300"
                        }`}
                      >
                        {banner.isActive ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {banner.isActive ? "Đang Hiển Thị" : "Đã Ẩn"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold font-serif-title text-slate-900 leading-snug">
                      {banner.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium">
                      {banner.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                        Nút: {banner.buttonText || "Đặt Lịch"}
                      </span>
                      <span className="font-semibold text-slate-500">
                        Hotline: {banner.hotline || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(banner)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Chỉnh Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold font-serif-title text-slate-900">
                  {editingBanner
                    ? "Chỉnh Sửa Hero Banner"
                    : "Thêm Hero Banner Mới"}
                </h3>
                <p className="text-xs text-slate-500">
                  Cập nhật nội dung hiển thị tại mục Studio Notes trên trang
                  chủ.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Row */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Hình Ảnh Banner (16:9)
                </label>

                {/* Image Preview Box */}
                {formData.image && (
                  <div className="relative aspect-[16/7] bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 mb-3">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-1 rounded-lg">
                      Preview Banner
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Local File Upload Input */}
                  <div>
                    <label className="btn-outline-gold w-full justify-center py-2.5 text-xs font-bold cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Chọn Ảnh Từ Máy Tính</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* URL Path Input */}
                  <div>
                    <input
                      type="text"
                      placeholder="Hoặc nhập đường dẫn URL ảnh..."
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Tiêu Đề Lớn (Title)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CỔ PHỤC TRIỀU NGUYỄN & ÁO DÀI DI SẢN"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-extrabold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Subtitle Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Mô Tả Ngắn (Subtitle)
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả nổi bật thu hút khách hàng..."
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Badge & Tag Input Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nhãn Badge Thương Hiệu
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Áo Dài Nhân / Cộng Studio Style"
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Tag Chủ Đề
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Bộ Sưu Tập Trang Phục 2026"
                    value={formData.tag}
                    onChange={(e) =>
                      setFormData({ ...formData, tag: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Button Text & Hotline Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Tên Nút Bấm Action
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Xem Bộ Sưu Tập Trang Phục"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonText: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Hotline Hiển Thị
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 0975.397.923 - 0399.475.789"
                    value={formData.hotline}
                    onChange={(e) =>
                      setFormData({ ...formData, hotline: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Order & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Thứ Tự Hiển Thị (#)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="space-y-1 flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      Cho Phép Hiển Thị Banner Ngay
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2.5 text-xs font-extrabold flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {editingBanner ? "Lưu cập nhật" : "Tạo Banner Mới"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
