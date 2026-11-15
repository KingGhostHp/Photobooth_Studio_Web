const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { query, initDb, pool } = require('./db');
const { registerStudio, migrateStudio } = require('./studio');
const { registerAnalytics } = require('./studio/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.disable('x-powered-by');
app.use(cors({ origin: false }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

registerStudio(app, pool);
registerAnalytics(app, pool);

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await query('SELECT NOW()');
    res.json({
      status: 'OK',
      message: 'Aura Studio Backend REST API with PostgreSQL is running smoothly',
      dbTime: dbRes.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/* ==========================================================================
   1. COSTUME CATEGORIES ENDPOINTS (PostgreSQL CRUD)
   ========================================================================== */

// GET All Categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await query('SELECT * FROM costume_categories ORDER BY created_at ASC');
    const categories = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      title: row.title,
      subtitle: row.subtitle,
      seoIntro: row.seo_intro,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || [])
    }));
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Single Category
app.get('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM costume_categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        name: row.name,
        title: row.title,
        subtitle: row.subtitle,
        seoIntro: row.seo_intro,
        features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || [])
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Create Category
app.post('/api/categories', async (req, res) => {
  try {
    const { id, name, title, subtitle, seoIntro, features } = req.body;
    const catId = id || `cat-${Date.now()}`;
    const insertQuery = `
      INSERT INTO costume_categories (id, name, title, subtitle, seo_intro, features)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      catId,
      name,
      title || `CHO THUÊ ${name.toUpperCase()}`,
      subtitle || '',
      seoIntro || '',
      JSON.stringify(features || [])
    ];
    const result = await query(insertQuery, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT Update Category
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, subtitle, seoIntro, features } = req.body;
    const updateQuery = `
      UPDATE costume_categories
      SET name = COALESCE($1, name),
          title = COALESCE($2, title),
          subtitle = COALESCE($3, subtitle),
          seo_intro = COALESCE($4, seo_intro),
          features = COALESCE($5, features)
      WHERE id = $6
      RETURNING *;
    `;
    const values = [
      name,
      title,
      subtitle,
      seoIntro,
      features ? JSON.stringify(features) : null,
      id
    ];
    const result = await query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Updated category successfully in PostgreSQL', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM costume_categories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Deleted category successfully from PostgreSQL' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


/* ==========================================================================
   2. COSTUMES ENDPOINTS (PostgreSQL CRUD)
   ========================================================================== */

require('./studio/costumes').registerCostumes(app, pool);

// PUT Update Costume Lifecycle Status
app.put('/api/costumes/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await query('UPDATE costumes SET available_status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true, message: 'Updated costume status state successfully in PostgreSQL' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Costume
app.delete('/api/costumes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM costumes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Costume not found' });
    }
    res.json({ success: true, message: 'Deleted costume successfully from PostgreSQL' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Catalog and CMS routes. Checkout, payments and reporting live in src/studio/.

// GET All Banners
app.get('/api/banners', async (req, res) => {
  try {
    const { all } = req.query;
    let sql = 'SELECT * FROM hero_banners';
    if (all !== 'true') {
      sql += ' WHERE is_active = true';
    }
    sql += ' ORDER BY sort_order ASC, created_at DESC';
    const result = await query(sql);
    const banners = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      tag: row.tag,
      badge: row.badge,
      image: row.image,
      buttonText: row.button_text,
      buttonLink: row.button_link,
      hotline: row.hotline,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at
    }));
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Create Banner
app.post('/api/banners', async (req, res) => {
  try {
    const { title, subtitle, tag, badge, image, buttonText, buttonLink, hotline, isActive, sortOrder } = req.body;
    const id = req.body.id || `banner-${Date.now()}`;
    const insertQuery = `
      INSERT INTO hero_banners (id, title, subtitle, tag, badge, image, button_text, button_link, hotline, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      id,
      title || 'BANNER MỚI 2026',
      subtitle || '',
      tag || 'Concept 2026',
      badge || 'Studio VIP',
      image || '/images/banners/banner1.png',
      buttonText || 'Đặt Lịch ngay',
      buttonLink || '#booking',
      hotline || '0975.475.789',
      isActive !== undefined ? isActive : true,
      sortOrder || 1
    ];
    const result = await query(insertQuery, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT Update Banner
app.put('/api/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, tag, badge, image, buttonText, buttonLink, hotline, isActive, sortOrder } = req.body;
    const updateQuery = `
      UPDATE hero_banners SET
        title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        tag = COALESCE($3, tag),
        badge = COALESCE($4, badge),
        image = COALESCE($5, image),
        button_text = COALESCE($6, button_text),
        button_link = COALESCE($7, button_link),
        hotline = COALESCE($8, hotline),
        is_active = COALESCE($9, is_active),
        sort_order = COALESCE($10, sort_order)
      WHERE id = $11
      RETURNING *;
    `;
    const values = [
      title, subtitle, tag, badge, image, buttonText, buttonLink, hotline, isActive, sortOrder, id
    ];
    const result = await query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, message: 'Updated banner successfully in PostgreSQL', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH Toggle Active State
app.patch('/api/banners/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE hero_banners SET is_active = NOT is_active WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Banner
app.delete('/api/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM hero_banners WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, message: 'Deleted banner successfully from PostgreSQL' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


/* ==========================================================================
   5. SERVICE PACKAGES ENDPOINTS (Gói Chụp Ảnh Concept)
   ========================================================================== */

// GET All Packages
app.get('/api/packages', async (req, res) => {
  try {
    const result = await query('SELECT * FROM service_packages ORDER BY created_at ASC');
    const packages = result.rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      subtitle: row.subtitle,
      basePricePerPerson: row.base_price_per_person,
      deposit: row.deposit,
      includedPeople: row.included_people,
      outfitsCount: row.outfits_count,
      retouchedCount: row.retouched_count,
      image: row.image,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []),
      isPopular: row.is_popular
    }));
    res.json({ success: true, data: packages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Create Package
app.post('/api/packages', async (req, res) => {
  try {
    const { code, name, subtitle, basePricePerPerson, deposit, includedPeople, outfitsCount, retouchedCount, image, features, isPopular } = req.body;
    const id = req.body.id || `pkg-${Date.now()}`;
    const insertQuery = `
      INSERT INTO service_packages (id, code, name, subtitle, base_price_per_person, deposit, included_people, outfits_count, retouched_count, image, features, is_popular)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const values = [
      id, code || 'PKG-CUSTOM', name, subtitle || '',
      basePricePerPerson || 500000, deposit || 200000,
      includedPeople || 1, outfitsCount || 1, retouchedCount || 10,
      image || '/images/costume_ao_dai_viet_1786199756012.png',
      JSON.stringify(features || []), isPopular || false
    ];
    const result = await query(insertQuery, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT Update Package (Including Price!)
app.put('/api/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, subtitle, basePricePerPerson, deposit, includedPeople, outfitsCount, retouchedCount, image, features, isPopular } = req.body;
    const updateQuery = `
      UPDATE service_packages SET
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        subtitle = COALESCE($3, subtitle),
        base_price_per_person = COALESCE($4, base_price_per_person),
        deposit = COALESCE($5, deposit),
        included_people = COALESCE($6, included_people),
        outfits_count = COALESCE($7, outfits_count),
        retouched_count = COALESCE($8, retouched_count),
        image = COALESCE($9, image),
        features = COALESCE($10, features),
        is_popular = COALESCE($11, is_popular)
      WHERE id = $12
      RETURNING *;
    `;
    const values = [
      code, name, subtitle, basePricePerPerson, deposit, includedPeople, outfitsCount, retouchedCount, image,
      features ? JSON.stringify(features) : null, isPopular, id
    ];
    const result = await query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, message: 'Updated package price successfully', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Package
app.delete('/api/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM service_packages WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, message: 'Deleted package successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


/* ==========================================================================
   6. SERVICE ADDONS ENDPOINTS (Dịch Vụ Đi Kèm & Phụ Phí)
   ========================================================================== */

// GET All Addons
app.get('/api/addons', async (req, res) => {
  try {
    const result = await query('SELECT * FROM service_addons ORDER BY created_at ASC');
    const addons = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price
    }));
    res.json({ success: true, data: addons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Create Addon
app.post('/api/addons', async (req, res) => {
  try {
    const { name, price } = req.body;
    const id = req.body.id || `addon-${Date.now()}`;
    const result = await query('INSERT INTO service_addons (id, name, price) VALUES ($1, $2, $3) RETURNING *', [id, name, price || 0]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT Update Addon Price
app.put('/api/addons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const result = await query(
      'UPDATE service_addons SET name = COALESCE($1, name), price = COALESCE($2, price) WHERE id = $3 RETURNING *',
      [name, price, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Addon not found' });
    }
    res.json({ success: true, message: 'Updated addon price successfully', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Addon
app.delete('/api/addons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM service_addons WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Addon not found' });
    }
    res.json({ success: true, message: 'Deleted addon successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


/* ==========================================================================
   7. PHOTOBOOTH CONCEPTS ENDPOINTS (Giá Khung Ảnh Photobooth Y2K)
   ========================================================================== */

// GET All Photobooth Concepts
app.get('/api/photobooth', async (req, res) => {
  try {
    const result = await query('SELECT * FROM photobooth_concepts ORDER BY created_at ASC');
    const concepts = result.rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      price: row.price,
      image: row.image,
      perks: Array.isArray(row.perks) ? row.perks : [
        'Miễn phí mượn 50+ phụ kiện',
        'File ảnh gốc + Video GIF hậu trường',
        'In 4 dải ảnh Strip Glossy cao cấp',
        'Quét mã QR lấy file siêu tốc'
      ]
    }));
    res.json({ success: true, data: concepts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Create Photobooth Concept
app.post('/api/photobooth', async (req, res) => {
  try {
    const { code, name, description, price, image, perks } = req.body;
    const id = req.body.id || `pb-${Date.now()}`;
    const insertQuery = `
      INSERT INTO photobooth_concepts (id, code, name, description, price, image, perks)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const defaultPerks = [
      'Miễn phí mượn 50+ phụ kiện',
      'File ảnh gốc + Video GIF hậu trường',
      'In 4 dải ảnh Strip Glossy cao cấp',
      'Quét mã QR lấy file siêu tốc'
    ];
    const perksJson = JSON.stringify(Array.isArray(perks) && perks.length > 0 ? perks : defaultPerks);
    const values = [id, code || 'PB-CUSTOM', name, description || '', price || 50000, image || '', perksJson];
    const result = await query(insertQuery, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT Update Photobooth Concept Price & Details
app.put('/api/photobooth/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, price, image, perks } = req.body;
    const updateQuery = `
      UPDATE photobooth_concepts SET
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        image = COALESCE($5, image),
        perks = COALESCE($6, perks)
      WHERE id = $7
      RETURNING *;
    `;
    const perksJson = perks !== undefined ? JSON.stringify(perks) : null;
    const values = [code, name, description, price, image, perksJson, id];
    const result = await query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Photobooth concept not found' });
    }
    res.json({ success: true, message: 'Updated photobooth details successfully', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Photobooth Concept
app.delete('/api/photobooth/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM photobooth_concepts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Photobooth concept not found' });
    }
    res.json({ success: true, message: 'Deleted photobooth concept successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ==========================================================================
   8. WEB VISITOR TRACKING & MONTHLY ANALYTICS (AI & EXCEL EXPORT)
   ========================================================================== */

const XLSX = require('xlsx');

// 1. POST Track Web Visitor (Condition: Stay >= 5 seconds)
// 1. GET Current Bank Configuration (MB Bank, Vietcombank, ACB, etc.)
app.get('/api/payment/bank-config', async (req, res) => {
  try {
    const result = await query('SELECT * FROM bank_configs WHERE id = $1', ['primary_bank']);
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          id: 'primary_bank',
          bankCode: 'MB',
          bankBin: '970422',
          bankName: 'MB Bank (Quân Đội)',
          accountNumber: '0975397923',
          accountHolder: 'AURA STUDIO',
          qrTemplate: 'compact2',
          qrType: 'dynamic',
          customQrImage: null,
          isAutoConfirmEnabled: true
        }
      });
    }
    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        bankCode: row.bank_code,
        bankBin: row.bank_bin,
        bankName: row.bank_name,
        accountNumber: row.account_number,
        accountHolder: row.account_holder,
        qrTemplate: row.qr_template,
        qrType: row.qr_type || 'dynamic',
        customQrImage: row.custom_qr_image || null,
        isAutoConfirmEnabled: row.is_auto_confirm_enabled
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. PUT Update Bank Configuration (Cho phép đổi STK, Ngân hàng, Upload QR ảnh riêng trong Admin)
app.put('/api/payment/bank-config', async (req, res) => {
  try {
    const { bankCode, bankBin, bankName, accountNumber, accountHolder, qrTemplate, qrType, customQrImage, isAutoConfirmEnabled } = req.body;
    const result = await query(`
      UPDATE bank_configs SET
        bank_code = COALESCE($1, bank_code),
        bank_bin = COALESCE($2, bank_bin),
        bank_name = COALESCE($3, bank_name),
        account_number = COALESCE($4, account_number),
        account_holder = COALESCE($5, account_holder),
        qr_template = COALESCE($6, qr_template),
        qr_type = COALESCE($7, qr_type),
        custom_qr_image = $8,
        is_auto_confirm_enabled = COALESCE($9, is_auto_confirm_enabled),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 'primary_bank'
      RETURNING *;
    `, [bankCode, bankBin, bankName, accountNumber, accountHolder, qrTemplate, qrType, customQrImage, isAutoConfirmEnabled]);

    res.json({ success: true, message: 'Cập nhật tài khoản ngân hàng & mã QR nhận tiền thành công!', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, message: status >= 500 ? 'Không thể xử lý yêu cầu. Vui lòng thử lại.' : error.message });
});

async function start() {
  await initDb();
  await migrateStudio(pool);
  app.listen(PORT, () => console.log(`Aura Studio API: http://localhost:${PORT}`));
}
start().catch(error => { console.error('Startup failed:', error.message); process.exitCode = 1; pool.end(); });
