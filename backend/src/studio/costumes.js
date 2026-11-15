const DEFAULT_IMAGE = "/images/costume_ao_dai_viet_1786199756012.png";
const MAX_IMAGES = 10;

function galleryFromRow(row) {
  const images = Array.isArray(row.images) ? row.images : [];
  return [...new Set((images.length ? images : [row.image]).filter(Boolean))];
}
function validateGallery(images) {
  const fail = (message) => { throw Object.assign(new Error(message), { status: 400 }); };
  if (!Array.isArray(images) || !images.length || images.length > MAX_IMAGES)
    fail("Mỗi sản phẩm cần từ 1 đến 10 ảnh.");
  const cleaned = images.map((image) => {
    if (typeof image !== "string" || !image.trim() || image.length > 2000000)
      fail("Ảnh không hợp lệ hoặc quá lớn. Hãy chọn lại ảnh nhỏ hơn.");
    const value = image.trim();
    if (!/^\/(?!\/)/.test(value) && !/^https?:\/\//i.test(value) &&
        !/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/]+=*$/i.test(value))
      fail("Ảnh phải là JPG, PNG, WEBP hoặc đường dẫn ảnh hợp lệ.");
    return value;
  });
  return [...new Set(cleaned)];
}
function serializeCostume(row) {
  const images = galleryFromRow(row);
  return {
    id: row.id, code: row.code, name: row.name, category: row.category,
    categoryName: row.category_name, gender: row.gender,
    sizes: typeof row.sizes === "string" ? JSON.parse(row.sizes) : row.sizes,
    rentalPrice: row.rental_price, depositAmount: row.deposit_amount,
    image: images[0] || row.image, images, description: row.description,
    availableStatus: row.available_status, availableCount: row.available_count,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
  };
}
const route = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (error) { res.status(error.status || 500).json({ success: false, message: error.message }); }
};
function registerCostumes(app, pool) {
  app.get("/api/costumes", route(async (req, res) => {
    const result = await pool.query("SELECT * FROM costumes ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows.map(serializeCostume) });
  }));
  app.get("/api/costumes/:id", route(async (req, res) => {
    const { rows: [row] } = await pool.query("SELECT * FROM costumes WHERE id=$1", [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: "Không tìm thấy trang phục." });
    res.json({ success: true, data: serializeCostume(row) });
  }));
  app.post("/api/costumes", route(async (req, res) => {
    const b = req.body, id = b.id || `ITEM-${Date.now()}`;
    const images = validateGallery(b.images === undefined ? [b.image || DEFAULT_IMAGE] : b.images);
    const { rows: [row] } = await pool.query(`
      INSERT INTO costumes (id,code,name,category,category_name,gender,sizes,rental_price,deposit_amount,image,description,available_status,available_count,tags,images)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'AVAILABLE',$12,$13,$14) RETURNING *`,
    [id, b.code || id, b.name, b.category, b.categoryName || b.category, b.gender || "Unisex",
      JSON.stringify(b.sizes || ["M"]), b.rentalPrice || 0, b.depositAmount || 0,
      images[0], b.description || "", b.availableCount ?? 1, JSON.stringify(b.tags || []), JSON.stringify(images)]);
    res.status(201).json({ success: true, data: serializeCostume(row) });
  }));
  app.put("/api/costumes/:id", route(async (req, res) => {
    const b = req.body;
    let images = null;
    if (b.images !== undefined) images = validateGallery(b.images);
    else if (b.image !== undefined) {
      const { rows: [old] } = await pool.query("SELECT image,images FROM costumes WHERE id=$1", [req.params.id]);
      images = validateGallery([b.image, ...galleryFromRow(old || {}).slice(1)]);
    }
    const { rows: [row] } = await pool.query(`UPDATE costumes SET
      code=COALESCE($1,code), name=COALESCE($2,name), category=COALESCE($3,category),
      category_name=COALESCE($4,category_name), gender=COALESCE($5,gender), sizes=COALESCE($6,sizes),
      rental_price=COALESCE($7,rental_price), deposit_amount=COALESCE($8,deposit_amount),
      image=COALESCE($9,image), description=COALESCE($10,description), available_count=COALESCE($11,available_count),
      tags=COALESCE($12,tags), images=COALESCE($14::jsonb,images) WHERE id=$13 RETURNING *`,
    [b.code,b.name,b.category,b.categoryName,b.gender,b.sizes ? JSON.stringify(b.sizes) : null,
      b.rentalPrice,b.depositAmount,images?.[0] ?? null,b.description,b.availableCount,
      b.tags ? JSON.stringify(b.tags) : null,req.params.id,images ? JSON.stringify(images) : null]);
    if (!row) return res.status(404).json({ success: false, message: "Không tìm thấy trang phục." });
    res.json({ success: true, data: serializeCostume(row) });
  }));
}
module.exports = { registerCostumes, validateGallery, galleryFromRow };
