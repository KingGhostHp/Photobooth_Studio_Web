import { adminFetch } from "../../studio/api";
import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Plus,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Eye,
  X,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const DEFAULT_PERKS_SUGGESTIONS = [
  "Miễn phí mượn 50+ phụ kiện & đạo cụ",
  "File ảnh gốc + Video GIF hậu trường",
  "In 4 dải ảnh Strip Glossy cao cấp",
  "Quét mã QR lấy file ảnh siêu tốc",
  "Hỗ trợ chỉnh sửa da đẹp mịn màng",
  "Tặng khung mica trong suốt để bàn",
];

export default function AdminPhotobooth({ refreshKey = 0 }) {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);

  // File Input Ref & Drag State
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newPerkInput, setNewPerkInput] = useState("");
  const [formData, setFormData] = useState({
    code: "PB-FRAME-01",
    name: "",
    description: "",
    price: 70000,
    image: "",
    perks: [
      "Miễn phí mượn 50+ phụ kiện",
      "File ảnh gốc + Video GIF hậu trường",
      "In 4 dải ảnh Strip Glossy cao cấp",
      "Quét mã QR lấy file siêu tốc",
    ],
  });

  const fetchPhotobooth = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/photobooth");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setConcepts(data.data);
        if (data.data.length > 0) {
          setSelectedPreview(data.data[0]);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách Photobooth:", err);
      showNotification(
        "Chưa tải được dữ liệu studio. Vui lòng thử lại.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotobooth();
  }, [refreshKey]);

  const showNotification = (msg, type = "success") => {
    setStatusMessage({ text: msg, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  /* ==========================================================================
     IMAGE UPLOAD, DRAG & DROP AND BASE64 CANVAS COMPRESSION FOR SQL
     ========================================================================== */
  const processImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Vui lòng chọn một file ảnh hợp lệ (PNG, JPG, WEBP)!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image via Canvas to optimize SQL payload size
        const canvas = document.createElement("canvas");
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
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to compressed Base64 data URL string
        const base64DataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setFormData((prev) => ({ ...prev, image: base64DataUrl }));
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  /* ==========================================================================
     PERKS / ĐẶC QUYỀN CRUD ACTIONS
     ========================================================================== */
  const handleAddPerk = (textToAdd) => {
    const text = (
      typeof textToAdd === "string" ? textToAdd : newPerkInput
    ).trim();
    if (!text) return;
    if (formData.perks.includes(text)) {
      alert("Đặc quyền này đã có trong danh sách!");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      perks: [...prev.perks, text],
    }));
    setNewPerkInput("");
  };

  const handleRemovePerk = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      perks: prev.perks.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleEditPerk = (indexToEdit, newText) => {
    setFormData((prev) => ({
      ...prev,
      perks: prev.perks.map((p, idx) => (idx === indexToEdit ? newText : p)),
    }));
  };

  /* ==========================================================================
     MODAL ACTIONS (ADD / EDIT / DELETE)
     ========================================================================== */
  const handleOpenAdd = () => {
    setEditingItem(null);
    setNewPerkInput("");
    setFormData({
      code: `PB-${String(concepts.length + 1).padStart(2, "0")}`,
      name: "",
      description:
        "Chụp 4 ô phong cách thanh lịch Hàn Quốc, in ảnh lấy ngay sau 30 giây.",
      price: 70000,
      image: "",
      perks: [
        "Miễn phí mượn 50+ phụ kiện",
        "File ảnh gốc + Video GIF hậu trường",
        "In 4 dải ảnh Strip Glossy cao cấp",
        "Quét mã QR lấy file siêu tốc",
      ],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setNewPerkInput("");
    setFormData({
      code: item.code || "",
      name: item.name || "",
      description: item.description || "",
      price: item.price || 0,
      image: item.image || "",
      perks:
        Array.isArray(item.perks) && item.perks.length > 0
          ? item.perks
          : [
              "Miễn phí mượn 50+ phụ kiện",
              "File ảnh gốc + Video GIF hậu trường",
              "In 4 dải ảnh Strip Glossy cao cấp",
              "Quét mã QR lấy file siêu tốc",
            ],
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên khung ảnh / gói Photobooth!");
      return;
    }

    if (!formData.image) {
      alert("Vui lòng chọn hoặc kéo thả ảnh khung Photobooth từ thiết bị!");
      return;
    }

    try {
      if (editingItem) {
        // PUT Update
        const res = await adminFetch(`/api/photobooth/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showNotification("Cập nhật khung Photobooth & đặc quyền thành công!");
          setShowModal(false);
          fetchPhotobooth();
        } else {
          alert(data.message || "Lỗi khi cập nhật");
        }
      } else {
        // POST Create
        const res = await adminFetch("/api/photobooth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showNotification("Thêm mới khung Photobooth & đặc quyền thành công!");
          setShowModal(false);
          fetchPhotobooth();
        } else {
          alert(data.message || "Lỗi khi thêm mới");
        }
      }
    } catch (err) {
      console.error("Lỗi khi lưu Photobooth:", err);
      alert("Có lỗi xảy ra khi lưu vào cơ sở dữ liệu!");
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa khung Photobooth "${name}" khỏi danh sách concept?`,
      )
    ) {
      return;
    }

    try {
      const res = await adminFetch(`/api/photobooth/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Đã xóa khung "${name}" thành công!`);
        fetchPhotobooth();
      } else {
        alert(data.message || "Lỗi khi xóa");
      }
    } catch (err) {
      console.error("Lỗi khi xóa Photobooth:", err);
      alert("Không thể xóa khung Photobooth này!");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="admin-module-toolbar">
        <span>{concepts.length} concept</span>
        <button className="button button-small" onClick={handleOpenAdd}>
          <Plus size={15} />
          Thêm concept
        </button>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-2 ${
            statusMessage.type === "error"
              ? "bg-rose-50 text-rose-800 border border-rose-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Management Table & Live Preview */}
      <div className="admin-concepts-grid grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Photobooth Concepts List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                Danh Sách Khung Ảnh & Mức Giá Hiện Hành
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Chọn concept; mở phần xem trước khi cần.
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                <p className="text-xs">Đang tải concept…</p>
              </div>
            ) : concepts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Camera className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs font-medium">
                  Chưa có khung Photobooth nào. Hãy nhấn "Thêm Khung / Gói Mới".
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {concepts.map((concept) => (
                  <div
                    key={concept.id}
                    onClick={() => setSelectedPreview(concept)}
                    className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all ${
                      selectedPreview?.id === concept.id
                        ? "bg-amber-50/70 border-l-4 border-amber-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={
                          concept.image ||
                          "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={concept.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl bg-slate-100 border border-slate-200 shadow-sm flex-shrink-0"
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                            {concept.code}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            In Liền 30s
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                            {Array.isArray(concept.perks)
                              ? concept.perks.length
                              : 4}{" "}
                            Đặc Quyền
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">
                          {concept.name}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {concept.description || "Chưa có mô tả"}
                        </p>
                        <div className="text-xs font-extrabold text-amber-800">
                          Giá vé:{" "}
                          {Number(concept.price || 0).toLocaleString("vi-VN")}{" "}
                          VNĐ / 1 lượt
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(concept);
                        }}
                        className="btn-outline-gold px-3 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                        title="Chỉnh sửa thông tin, ảnh, giá và đặc quyền"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(concept.id, concept.name);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Xóa concept"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Customer Interface Preview (4 Cols) */}
        <details className="admin-concept-preview">
          <summary>Xem trước concept đã chọn</summary>
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-400" />
                  Mô Phỏng Giao Diện Khách Hàng
                </span>
                <span className="text-[10px] text-slate-400">Live Preview</span>
              </div>

              {selectedPreview ? (
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={
                        selectedPreview.image ||
                        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={selectedPreview.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-4">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase">
                          {selectedPreview.code}
                        </span>
                        <h4 className="font-bold text-base text-white">
                          {selectedPreview.name}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">
                      Mức Giá & Mô Tả Cho Khách:
                    </span>
                    <div className="text-2xl font-black text-amber-300 font-serif-title">
                      {Number(selectedPreview.price || 0).toLocaleString(
                        "vi-VN",
                      )}{" "}
                      VNĐ
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {selectedPreview.description ||
                        "Chưa có mô tả phong cảnh."}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Đặc Quyền Đi Kèm (
                      {Array.isArray(selectedPreview.perks)
                        ? selectedPreview.perks.length
                        : 4}
                      ):
                    </span>
                    <div className="space-y-1.5">
                      {(Array.isArray(selectedPreview.perks) &&
                      selectedPreview.perks.length > 0
                        ? selectedPreview.perks
                        : [
                            "Miễn phí mượn 50+ phụ kiện",
                            "File ảnh gốc + Video GIF hậu trường",
                            "In 4 dải ảnh Strip Glossy cao cấp",
                            "Quét mã QR lấy file siêu tốc",
                          ]
                      ).map((perk, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-slate-200"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">
                  Chọn một khung để xem mô phỏng.
                </p>
              )}
            </div>
          </div>
        </details>
      </div>

      {/* Modal: Create / Edit Photobooth Concept */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-100 shadow-2xl my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-700">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-serif-title">
                    {editingItem
                      ? "Chỉnh Sửa Khung & Đặc Quyền Photobooth"
                      : "Thêm Mới Khung Photobooth"}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Tải ảnh từ thiết bị của bạn
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mã Khung / Gói *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    placeholder="VD: PB-01"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mức Giá Vé / Lượt (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    step="5000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-amber-800 focus:outline-none focus:border-amber-500"
                    placeholder="VD: 70000"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Khung Ảnh / Gói Chụp *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  placeholder="VD: Korean Vintage 4-Cut Frame"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mô Tả Chi Tiết & Phong Cách (Hiển thị cho khách) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                  placeholder="VD: Phong cảnh trong phòng ngủ, ánh sáng ấm áp..."
                />
              </div>

              {/* DRAG & DROP / FILE SELECTOR */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>Hình Ảnh Khung Photobooth *:</span>
                </label>

                {/* Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 group ${
                    isDragging
                      ? "border-amber-500 bg-amber-100/60 scale-[1.01]"
                      : "border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {isDragging
                        ? "Thả ảnh vào đây ngay"
                        : "Kéo thả ảnh hoặc nhấp để chọn từ máy tính"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Hỗ trợ PNG, JPG, JPEG, WEBP · Ảnh được tối ưu trước khi
                      lưu
                    </p>
                  </div>
                </div>

                {/* LIVE PREVIEW OF SELECTED IMAGE */}
                {formData.image && (
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group mt-2">
                    <img
                      src={formData.image}
                      alt="Preview Khung Photobooth"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 border border-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Xem trước hình ảnh</span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: "" }))
                      }
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-colors"
                      title="Xóa ảnh để chọn lại"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* ==========================================================
                 CRUD SECTION FOR PERKS / ĐẶC QUYỀN ĐI KÈM LƯỢT CHỤP
                 ========================================================== */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>
                      Quản Lý Đặc Quyền Đi Kèm Lượt Chụp (
                      {formData.perks.length}):
                    </span>
                  </label>
                </div>

                {/* List of current perks */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.perks.map((perk, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 group"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <input
                        type="text"
                        value={perk}
                        onChange={(e) => handleEditPerk(index, e.target.value)}
                        className="flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none focus:text-amber-800"
                        placeholder="Nội dung đặc quyền..."
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePerk(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa đặc quyền này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new perk input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPerkInput}
                    onChange={(e) => setNewPerkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPerk(newPerkInput);
                      }
                    }}
                    placeholder="Nhập đặc quyền mới (Ví dụ: Tặng kèm khung ảnh mica...)"
                    className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPerk(newPerkInput)}
                    className="btn-gold px-3.5 py-2 text-xs font-bold flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm</span>
                  </button>
                </div>

                {/* Quick Add Suggestions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Gợi ý mẫu đặc quyền nhanh:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_PERKS_SUGGESTIONS.map((sugg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPerk(sugg)}
                        className="text-[10px] bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 text-slate-600 font-medium px-2 py-1 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>{sugg}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2.5 rounded-xl font-bold shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? "Lưu thay đổi" : "Lưu concept"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
