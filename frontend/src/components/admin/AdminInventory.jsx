import React, { useState, useEffect } from "react";
import { CATEGORY_DETAILS } from "../../data/costumes";
import {
  Shirt,
  Plus,
  Edit3,
  Trash2,
  X,
  Tag,
  Layers,
  Search,
} from "lucide-react";
import CustomSelect from "../common/CustomSelect";
import { adminFetch, money, imageFallback, productImages } from "../../studio/api";

import ProductImageEditor from "./ProductImageEditor";

export default function AdminInventory({ refreshKey = 0 }) {
  const [activeTab, setActiveTab] = useState("costumes"); // 'costumes' | 'categories'
  const [costumeList, setCostumeList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [processingImages, setProcessingImages] = useState(false);
  const [savingCostume, setSavingCostume] = useState(false);

  // Image Upload Mode: 'file' | 'url'

  // Modals state
  const [isAddCostumeOpen, setIsAddCostumeOpen] = useState(false);
  const [editingCostume, setEditingCostume] = useState(null);
  const [deletingCostume, setDeletingCostume] = useState(null);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Costume Form State
  const [costumeForm, setCostumeForm] = useState({
    code: "",
    name: "",
    category: "ao-dai-cuoi-hoi",
    categoryName: "Áo Dài Cưới Hỏi",
    gender: "Nữ",
    sizes: ["S", "M", "L"],
    rentalPrice: 250000,
    depositAmount: 500000,
    images: [],
    description: "",
    availableCount: 5,
    tags: ["Mới"],
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    id: "",
    name: "",
    title: "",
    subtitle: "",
    seoIntro: "",
    features: [
      "Chất Lượng High-end",
      "Đủ Size",
      "Bóp Sửa Miễn Phí",
      "Khử Khuẩn 100%",
    ],
  });

  // Fetch Costumes & Categories from Backend API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCostumes, resCategories] = await Promise.all([
        adminFetch("/api/costumes").then((r) => r.json()),
        adminFetch("/api/categories").then((r) => r.json()),
      ]);

      if (resCostumes?.success) {
        setCostumeList(resCostumes.data);
      }
      if (resCategories?.success) {
        setCategoryList(resCategories.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  /* ==========================================================================
     COSTUME CRUD ACTIONS
     ========================================================================== */

  const handleCreateCostume = async (e) => {
    e.preventDefault();
    if (processingImages || savingCostume || !costumeForm.images.length) return;
    setSavingCostume(true);
    const newId = `ITEM-${Date.now()}`;
    const selectedCatObj = categoryList.find(
      (c) => c.id === costumeForm.category,
    );
    const categoryName = selectedCatObj
      ? selectedCatObj.name
      : costumeForm.categoryName;

    const payload = {
      ...costumeForm,
      image: costumeForm.images[0],
      id: newId,
      code: costumeForm.code || newId,
      categoryName,
      rentalPrice: Number(costumeForm.rentalPrice),
      depositAmount: Number(costumeForm.depositAmount),
      availableCount: Number(costumeForm.availableCount),
    };

    try {
      await adminFetch("/api/costumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchData();
    } catch (err) {
      setError(err.message);
      return;
    } finally { setSavingCostume(false); }

    setIsAddCostumeOpen(false);
    resetCostumeForm();
  };

  const handleUpdateCostume = async (e) => {
    e.preventDefault();
    if (!editingCostume || processingImages || savingCostume || !costumeForm.images.length) return;
    setSavingCostume(true);

    const selectedCatObj = categoryList.find(
      (c) => c.id === costumeForm.category,
    );
    const categoryName = selectedCatObj
      ? selectedCatObj.name
      : costumeForm.categoryName;

    const updatedData = {
      ...costumeForm,
      image: costumeForm.images[0],
      categoryName,
      rentalPrice: Number(costumeForm.rentalPrice),
      depositAmount: Number(costumeForm.depositAmount),
      availableCount: Number(costumeForm.availableCount),
    };

    try {
      await adminFetch(`/api/costumes/${editingCostume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      await fetchData();
    } catch (err) {
      setError(err.message);
      return;
    } finally { setSavingCostume(false); }

    setEditingCostume(null);
    resetCostumeForm();
  };

  const updateCostumeStatus = async (id, newStatus) => {
    try {
      await adminFetch(`/api/costumes/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchData();
    } catch (err) {
      setError(err.message);
      return;
    }
  };

  const handleDeleteCostume = async () => {
    if (!deletingCostume) return;
    try {
      await adminFetch(`/api/costumes/${deletingCostume.id}`, {
        method: "DELETE",
      });
    } catch (err) {
      setError(err.message);
      return;
    }
    setCostumeList(
      costumeList.filter((item) => item.id !== deletingCostume.id),
    );
    setDeletingCostume(null);
  };

  const openEditCostumeModal = (item) => {
    setError("");
    setProcessingImages(false);
    setEditingCostume(item);
    setCostumeForm({
      code: item.code || item.id,
      name: item.name,
      category: item.category || "ao-dai-cuoi-hoi",
      categoryName: item.categoryName || "Áo Dài Cưới Hỏi",
      gender: item.gender || "Nữ",
      sizes: item.sizes || ["S", "M"],
      rentalPrice: item.rentalPrice,
      depositAmount: item.depositAmount,
      images: productImages(item),
      description: item.description || "",
      availableCount: item.availableCount ?? 1,
      tags: item.tags || [],
    });
  };

  const resetCostumeForm = () => {
    setError("");
    setProcessingImages(false);
    setCostumeForm({
      code: "",
      name: "",
      category: "ao-dai-cuoi-hoi",
      categoryName: "Áo Dài Cưới Hỏi",
      gender: "Nữ",
      sizes: ["S", "M", "L"],
      rentalPrice: 250000,
      depositAmount: 500000,
      images: [],
      description: "",
      availableCount: 5,
      tags: ["Mới"],
    });
  };

  /* ==========================================================================
     CATEGORY CRUD ACTIONS
     ========================================================================== */

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const catId = categoryForm.id
      ? categoryForm.id.toLowerCase().replace(/\s+/g, "-")
      : `cat-${Date.now()}`;
    const payload = {
      ...categoryForm,
      id: catId,
      title:
        categoryForm.title || `CHO THUÊ ${categoryForm.name.toUpperCase()}`,
    };

    try {
      await adminFetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchData();
    } catch (err) {
      setError(err.message);
      return;
    }

    setIsAddCategoryOpen(false);
    resetCategoryForm();
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      await adminFetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      await fetchData();
    } catch (err) {
      setError(err.message);
      return;
    }

    setEditingCategory(null);
    resetCategoryForm();
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await adminFetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });
    } catch (err) {
      setError(err.message);
      return;
    }
    setCategoryList(categoryList.filter((c) => c.id !== deletingCategory.id));
    setDeletingCategory(null);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    const detail = CATEGORY_DETAILS[cat.id] || {};
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      title: detail.title || cat.title || "",
      subtitle: detail.subtitle || cat.subtitle || "",
      seoIntro: detail.seoIntro || cat.seoIntro || "",
      features: detail.features ||
        cat.features || ["Chất Lượng High-end", "Khử Khuẩn 100%"],
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      id: "",
      name: "",
      title: "",
      subtitle: "",
      seoIntro: "",
      features: [
        "Chất Lượng High-end",
        "Đủ Size",
        "Bóp Sửa Miễn Phí",
        "Khử Khuẩn 100%",
      ],
    });
  };

  // Filtered Costumes
  const filteredCostumes = costumeList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filteredCostumes.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visibleCostumes = filteredCostumes.slice(
    (currentPage - 1) * 10,
    currentPage * 10,
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="error-state" role="alert">
          {error}
          <button onClick={() => setError("")}>Đóng</button>
        </div>
      )}

      <div className="admin-module-toolbar inventory-toolbar">
        <div
          className="inventory-tabs"
          role="group"
          aria-label="Loại dữ liệu kho"
        >
          <button
            className={activeTab === "costumes" ? "active" : ""}
            onClick={() => setActiveTab("costumes")}
            aria-pressed={activeTab === "costumes"}
          >
            <Shirt size={15} />
            Trang phục <span>{costumeList.length}</span>
          </button>
          <button
            className={activeTab === "categories" ? "active" : ""}
            onClick={() => setActiveTab("categories")}
            aria-pressed={activeTab === "categories"}
          >
            <Layers size={15} />
            Danh mục <span>{categoryList.length}</span>
          </button>
        </div>
        <button
          className="button button-small"
          onClick={() => {
            if (activeTab === "costumes") {
              resetCostumeForm();
              setIsAddCostumeOpen(true);
            } else {
              resetCategoryForm();
              setIsAddCategoryOpen(true);
            }
          }}
        >
          <Plus size={15} />
          {activeTab === "costumes" ? "Thêm trang phục" : "Thêm danh mục"}
        </button>
      </div>

      {/* ===================================================================
         TAB 1: COSTUMES MANAGEMENT (Mẫu Trang Phục)
         =================================================================== */}
      {activeTab === "costumes" && (
        <div className="inventory-list">
          <div className="inventory-search">
            <label className="search-input">
              <Search size={16} />
              <input
                aria-label="Tìm trang phục trong kho"
                placeholder="Tìm tên, mã hoặc danh mục…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <span>
              {filteredCostumes.length} trang phục
              {loading ? " · Đang tải…" : ""}
            </span>
          </div>
          <div className="table-scroll">
            <table className="studio-table inventory-table">
              <thead>
                <tr>
                  <th>Trang phục</th>
                  <th>Danh mục / Size</th>
                  <th>Giá thuê / ngày</th>
                  <th>Cọc bảo đảm</th>
                  <th>Số lượng</th>
                  <th>Trạng thái</th>
                  <th>
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleCostumes.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="inventory-product">
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          onError={imageFallback}
                        />
                        <div>
                          <strong title={item.name}>{item.name}</strong>
                          <small>{item.code}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {item.categoryName || item.category}
                      <small>{(item.sizes || []).join(" / ")}</small>
                    </td>
                    <td>{money(item.rentalPrice)}</td>
                    <td>{money(item.depositAmount)}</td>
                    <td>{item.availableCount ?? 0}</td>
                    <td>
                      <select
                        aria-label={`Trạng thái ${item.name}`}
                        value={item.availableStatus || "AVAILABLE"}
                        onChange={(e) =>
                          updateCostumeStatus(item.id, e.target.value)
                        }
                      >
                        <option value="AVAILABLE">Sẵn sàng</option>
                        <option value="RENTED">Đang thuê</option>
                        <option value="LAUNDRY">Giặt sấy</option>
                        <option value="REPAIR">Cần sửa</option>
                      </select>
                    </td>
                    <td>
                      <div className="inventory-actions">
                        <button
                          className="icon-button"
                          onClick={() => openEditCostumeModal(item)}
                          aria-label={`Sửa ${item.name}`}
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="icon-button danger-text"
                          onClick={() => setDeletingCostume(item)}
                          aria-label={`Xóa ${item.name}`}
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredCostumes.length && (
              <p className="admin-empty">Không có trang phục khớp từ khóa.</p>
            )}
          </div>
          <div className="inventory-pagination">
            <span>Tối đa 10 trang phục / trang</span>
            <div>
              <button
                className="button button-outline button-small"
                disabled={currentPage <= 1}
                onClick={() => setPage(Math.max(1, currentPage - 1))}
              >
                Trước
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                className="button button-outline button-small"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
         TAB 2: CATEGORIES MANAGEMENT (Loại Trang Phục)
         =================================================================== */}
      {activeTab === "categories" && (
        <div className="table-scroll">
          <table className="studio-table inventory-table">
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Mã danh mục</th>
                <th>Số trang phục</th>
                <th>
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryList.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <strong>{cat.name}</strong>
                  </td>
                  <td>{cat.id}</td>
                  <td>
                    {costumeList.filter((i) => i.category === cat.id).length}
                  </td>
                  <td>
                    <div className="inventory-actions">
                      <button
                        className="icon-button"
                        aria-label={`Sửa danh mục ${cat.name}`}
                        onClick={() => openEditCategoryModal(cat)}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="icon-button danger-text"
                        aria-label={`Xóa danh mục ${cat.name}`}
                        onClick={() => setDeletingCategory(cat)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              {editingCostume
                ? "Cập Nhật Mẫu Trang Phục"
                : "Thêm Mới Mẫu Trang Phục Thuê"}
            </h3>

            <form
              onSubmit={
                editingCostume ? handleUpdateCostume : handleCreateCostume
              }
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mã Sản Phẩm *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: AD-108"
                    value={costumeForm.code}
                    onChange={(e) =>
                      setCostumeForm({ ...costumeForm, code: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tên Trang Phục *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Áo Dài Thêu Hoa Cúc"
                    value={costumeForm.name}
                    onChange={(e) =>
                      setCostumeForm({ ...costumeForm, name: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Loại Trang Phục *
                  </label>
                  <CustomSelect
                    value={costumeForm.category}
                    onChange={(val) => {
                      const catObj = categoryList.find((c) => c.id === val);
                      setCostumeForm({
                        ...costumeForm,
                        category: val,
                        categoryName: catObj ? catObj.name : val,
                      });
                    }}
                    options={categoryList.map((cat) => ({
                      label: cat.name,
                      value: cat.id,
                    }))}
                    placeholder="Chọn loại trang phục"
                    icon={Layers}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Giới Tính Phù Hợp
                  </label>
                  <CustomSelect
                    value={costumeForm.gender}
                    onChange={(val) =>
                      setCostumeForm({ ...costumeForm, gender: val })
                    }
                    options={[
                      { label: "Nữ", value: "Nữ" },
                      { label: "Nam", value: "Nam" },
                      { label: "Unisex", value: "Unisex" },
                    ]}
                    placeholder="Chọn giới tính"
                    icon={Tag}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Giá Thuê / Ngày (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    step="10000"
                    value={costumeForm.rentalPrice}
                    onChange={(e) =>
                      setCostumeForm({
                        ...costumeForm,
                        rentalPrice: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tiền Đặt Cọc (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    step="10000"
                    value={costumeForm.depositAmount}
                    onChange={(e) =>
                      setCostumeForm({
                        ...costumeForm,
                        depositAmount: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Số Lượng Kho
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={costumeForm.availableCount}
                    onChange={(e) =>
                      setCostumeForm({
                        ...costumeForm,
                        availableCount: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <ProductImageEditor
                value={costumeForm.images}
                onChange={(pictures) => setCostumeForm((prev) => ({ ...prev, images: pictures }))}
                onBusyChange={setProcessingImages}
                disabled={savingCostume}
              />
              {!costumeForm.images.length && <p className="image-editor-error">Thêm ít nhất một ảnh cho sản phẩm.</p>}
              {error && <p className="image-editor-error" role="alert">{error}</p>}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mô Tả Sản Phẩm
                </label>
                <textarea
                  rows="3"
                  placeholder="Mô tả chất liệu lụa, họa tiết thêu, phụ kiện đi kèm..."
                  value={costumeForm.description}
                  onChange={(e) =>
                    setCostumeForm({
                      ...costumeForm,
                      description: e.target.value,
                    })
                  }
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
                <button
                  type="submit"
                  disabled={processingImages || savingCostume || !costumeForm.images.length}
                  className="btn-gold px-6 py-2.5 text-xs font-bold"
                >
                  {editingCostume ? "Lưu Thay Đổi" : "Thêm Mới Vào Kho"}
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
            <h3 className="text-lg font-bold text-slate-900">
              Xác Nhận Xóa Trang Phục
            </h3>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <strong>"{deletingCostume.name}"</strong> (Mã:{" "}
              {deletingCostume.code}) khỏi tủ trang phục?
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
              {editingCategory
                ? "Chỉnh Sửa Loại Trang Phục"
                : "Thêm Mới Loại Trang Phục (Category)"}
            </h3>

            <form
              onSubmit={
                editingCategory ? handleUpdateCategory : handleCreateCategory
              }
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ID Loại Trang Phục *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCategory}
                    placeholder="VD: ao-dai-tet"
                    value={categoryForm.id}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, id: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tên Loại Trang Phục *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Áo Dài Tết 2026"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tiêu Đề Trang Danh Mục (Title Banner)
                </label>
                <input
                  type="text"
                  placeholder="VD: CHO THUÊ ÁO DÀI TẾT - BỘ SƯU TẬP HOÀNG CÚC DÁT VÀNG"
                  value={categoryForm.title}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, title: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Bài Đoạn Văn Giới Thiệu SEO
                </label>
                <textarea
                  rows="3"
                  placeholder="Nội dung giới thiệu chi tiết xuất hiện ở đầu trang danh mục..."
                  value={categoryForm.seoIntro}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      seoIntro: e.target.value,
                    })
                  }
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
                <button
                  type="submit"
                  className="btn-gold px-6 py-2.5 text-xs font-bold"
                >
                  {editingCategory ? "Lưu Thay Đổi" : "Tạo Loại Trang Phục Mới"}
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
            <h3 className="text-lg font-bold text-slate-900">
              Xác Nhận Xóa Loại Trang Phục
            </h3>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa loại trang phục{" "}
              <strong>"{deletingCategory.name}"</strong> (ID:{" "}
              {deletingCategory.id}) khỏi danh mục?
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
