const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { query, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Initialize Database Schema and Initial Seed Data
initDb();

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

// GET All Costumes
app.get('/api/costumes', async (req, res) => {
  try {
    const result = await query('SELECT * FROM costumes ORDER BY created_at DESC');
    const costumes = result.rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      category: row.category,
      categoryName: row.category_name,
      gender: row.gender,
      sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes,
      rentalPrice: row.rental_price,
      depositAmount: row.deposit_amount,
      image: row.image,
      description: row.description,
      availableStatus: row.available_status,
      availableCount: row.available_count,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
    }));
    res.json({ success: true, data: costumes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Single Costume
app.get('/api/costumes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM costumes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Costume not found' });
    }
    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        code: row.code,
        name: row.name,
        category: row.category,
        categoryName: row.category_name,
        gender: row.gender,
        sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes,
        rentalPrice: row.rental_price,
        depositAmount: row.deposit_amount,
        image: row.image,
        description: row.description,
        availableStatus: row.available_status,
        availableCount: row.available_count,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Create Costume
app.post('/api/costumes', async (req, res) => {
  try {
    const { code, name, category, categoryName, gender, sizes, rentalPrice, depositAmount, image, description, availableCount, tags } = req.body;
    const id = req.body.id || `ITEM-${Date.now()}`;
    const insertQuery = `
      INSERT INTO costumes (id, code, name, category, category_name, gender, sizes, rental_price, deposit_amount, image, description, available_status, available_count, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'AVAILABLE', $12, $13)
      RETURNING *;
    `;
    const values = [
      id, code || id, name, category, categoryName || category, gender || 'Unisex',
      JSON.stringify(sizes || ['M']), rentalPrice || 0, depositAmount || 0,
      image || '/images/costume_ao_dai_viet_1786199756012.png', description || '',
      availableCount || 1, JSON.stringify(tags || [])
    ];
    const result = await query(insertQuery, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT Update Costume Details
app.put('/api/costumes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, category, categoryName, gender, sizes, rentalPrice, depositAmount, image, description, availableCount, tags } = req.body;
    const updateQuery = `
      UPDATE costumes SET
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        category_name = COALESCE($4, category_name),
        gender = COALESCE($5, gender),
        sizes = COALESCE($6, sizes),
        rental_price = COALESCE($7, rental_price),
        deposit_amount = COALESCE($8, deposit_amount),
        image = COALESCE($9, image),
        description = COALESCE($10, description),
        available_count = COALESCE($11, available_count),
        tags = COALESCE($12, tags)
      WHERE id = $13
      RETURNING *;
    `;
    const values = [
      code, name, category, categoryName, gender,
      sizes ? JSON.stringify(sizes) : null,
      rentalPrice, depositAmount, image, description, availableCount,
      tags ? JSON.stringify(tags) : null,
      id
    ];
    const result = await query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Costume not found' });
    }
    res.json({ success: true, message: 'Updated costume details in PostgreSQL', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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


/* ==========================================================================
   3. BOOKINGS & ORDERS ENDPOINTS (PostgreSQL CRUD)
   ========================================================================== */

app.get('/api/orders', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      phone: row.phone,
      serviceType: row.service_type,
      itemDetails: row.item_details,
      bookingDate: row.booking_date,
      timeSlot: row.time_slot,
      totalAmount: row.total_amount,
      depositAmount: row.deposit_amount,
      penaltyFee: row.penalty_fee,
      paymentStatus: row.payment_status,
      bookingStatus: row.booking_status,
      assignedPhotographer: row.assigned_photographer,
      assignedMakeup: row.assigned_makeup,
      notes: row.notes,
      createdAt: row.created_at
    }));
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, serviceType, itemDetails, bookingDate, timeSlot, totalAmount, depositAmount, paymentStatus, bookingStatus, notes } = req.body;
    const id = `AUR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const insertQuery = `
      INSERT INTO orders (id, customer_name, phone, service_type, item_details, booking_date, time_slot, total_amount, deposit_amount, penalty_fee, payment_status, booking_status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, $11, $12)
      RETURNING *;
    `;
    const values = [
      id, customerName, phone, serviceType, itemDetails, bookingDate, timeSlot,
      totalAmount, depositAmount, paymentStatus || 'DEPOSITED_30%', bookingStatus || 'CONFIRMED', notes || ''
    ];
    const result = await query(insertQuery, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { penaltyFee, totalAmount, notes, bookingStatus, paymentStatus } = req.body;
    await query(
      `UPDATE orders SET
         penalty_fee = COALESCE($1, penalty_fee),
         total_amount = COALESCE($2, total_amount),
         notes = COALESCE($3, notes),
         booking_status = COALESCE($4, booking_status),
         payment_status = COALESCE($5, payment_status)
       WHERE id = $6`,
      [penaltyFee, totalAmount, notes, bookingStatus, paymentStatus, id]
    );
    res.json({ success: true, message: 'Order updated successfully in PostgreSQL' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Stats Endpoint (PostgreSQL)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const revResult = await query('SELECT SUM(total_amount) as total_rev, SUM(deposit_amount) as total_dep, COUNT(*) as active_orders FROM orders');
    const costumeResult = await query("SELECT COUNT(*) as avail_costumes FROM costumes WHERE available_status = 'AVAILABLE'");

    const stats = revResult.rows[0];
    const costumeStats = costumeResult.rows[0];

    res.json({
      success: true,
      data: {
        totalRevenue: parseInt(stats.total_rev || 0, 10),
        totalDeposits: parseInt(stats.total_dep || 0, 10),
        activeOrdersCount: parseInt(stats.active_orders || 0, 10),
        availableCostumesCount: parseInt(costumeStats.avail_costumes || 0, 10)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Aura Studio Backend REST API Server listening at http://localhost:${PORT}`);
});
