const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { query, initDb } = require('./db');
const { sendOrderConfirmationEmail } = require('./emailService');

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

// Helper function to calculate end date (YYYY-MM-DD) from start date and days
function calculateEndDateIso(startDateStr, days = 1) {
  try {
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return startDateStr;
    const end = new Date(start);
    end.setDate(end.getDate() + parseInt(days, 10));
    return end.toISOString().split('T')[0];
  } catch {
    return startDateStr;
  }
}

// Check costume rental availability & conflict
async function checkCostumeRentalConflict(costumeIds = [], startDateStr, rentalDays = 1) {
  if (!costumeIds || costumeIds.length === 0 || !startDateStr) {
    return { hasConflict: false };
  }

  const reqStart = startDateStr;
  const reqEnd = calculateEndDateIso(startDateStr, rentalDays);

  // Query all active rental orders that have NOT been confirmed returned by Admin
  const activeOrdersRes = await query(`
    SELECT id, customer_name, phone, item_details, costume_ids, booking_date, return_date, rental_days, start_date, end_date, is_returned, booking_status
    FROM orders
    WHERE (service_type LIKE '%Thuê%' OR service_type LIKE '%Trang Phục%')
      AND is_returned = FALSE
      AND booking_status NOT IN ('CANCELLED', 'RETURNED')
  `);

  for (const existing of activeOrdersRes.rows) {
    const existingCostumeIds = Array.isArray(existing.costume_ids) ? existing.costume_ids : [];
    
    // Check if any requested costume is in this existing order
    const hasMatchingCostume = costumeIds.some(cid => {
      if (existingCostumeIds.includes(cid)) return true;
      if (existing.item_details && typeof cid === 'string' && existing.item_details.toLowerCase().includes(cid.toLowerCase())) return true;
      return false;
    });

    if (hasMatchingCostume) {
      const existStart = existing.start_date || existing.booking_date;
      const existEnd = existing.end_date || calculateEndDateIso(existStart, existing.rental_days || 1);

      // Conflict condition 1: Date ranges overlap
      const isDateOverlapping = (reqStart <= existEnd && reqEnd >= existStart);

      // Conflict condition 2: Costume has not been confirmed returned by Admin
      if (isDateOverlapping || !existing.is_returned) {
        return {
          hasConflict: true,
          conflictingOrderId: existing.id,
          conflictingOrderCustomer: existing.customer_name,
          existingStart: existStart,
          existingEnd: existEnd,
          itemDetails: existing.item_details,
          message: `Trang phục bạn chọn đang có khách thuê từ ngày ${existStart} đến ${existEnd} (chưa được Admin xác nhận trả đồ). Quý khách vui lòng chọn khoảng thời gian khác hoặc chọn trang phục khác!`
        };
      }
    }
  }

  return { hasConflict: false };
}

app.get('/api/orders', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      phone: row.phone,
      email: row.email || '',
      serviceType: row.service_type,
      itemDetails: row.item_details,
      costumeIds: row.costume_ids || [],
      isReturned: Boolean(row.is_returned),
      startDate: row.start_date || row.booking_date,
      endDate: row.end_date || row.return_date,
      bookingDate: row.booking_date,
      returnDate: row.return_date || '',
      rentalDays: row.rental_days || 1,
      timeSlot: row.time_slot,
      totalAmount: parseInt(row.total_amount || 0, 10),
      depositAmount: parseInt(row.deposit_amount || 0, 10),
      penaltyFee: parseInt(row.penalty_fee || 0, 10),
      paymentStatus: row.payment_status,
      bookingStatus: row.booking_status,
      assignedPhotographer: row.assigned_photographer || 'Chưa phân công',
      assignedMakeup: row.assigned_makeup || 'Chưa phân công',
      notes: row.notes || '',
      createdAt: row.created_at
    }));
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint for checking conflict in real-time
app.post('/api/costumes/check-conflict', async (req, res) => {
  try {
    const { costumeIds, startDate, rentalDays } = req.body;
    const conflictResult = await checkCostumeRentalConflict(costumeIds, startDate, rentalDays);
    res.json({ success: true, ...conflictResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint for looking up orders (by Order ID, Phone number, or Email)
app.get('/api/orders/lookup', async (req, res) => {
  try {
    const { query: searchQuery } = req.query;
    if (!searchQuery || !searchQuery.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã đơn, số điện thoại hoặc email để tra cứu.' });
    }

    const trimmed = searchQuery.trim();
    const result = await query(
      `SELECT * FROM orders 
       WHERE LOWER(id) = LOWER($1) 
          OR phone = $1 
          OR LOWER(email) = LOWER($1)
       ORDER BY created_at DESC`,
      [trimmed]
    );

    const orders = result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      phone: row.phone,
      email: row.email || '',
      serviceType: row.service_type,
      itemDetails: row.item_details,
      costumeIds: row.costume_ids || [],
      isReturned: Boolean(row.is_returned),
      startDate: row.start_date || row.booking_date,
      endDate: row.end_date || row.return_date,
      bookingDate: row.booking_date,
      returnDate: row.return_date || '',
      rentalDays: row.rental_days || 1,
      timeSlot: row.time_slot,
      totalAmount: parseInt(row.total_amount || 0, 10),
      depositAmount: parseInt(row.deposit_amount || 0, 10),
      penaltyFee: parseInt(row.penalty_fee || 0, 10),
      paymentStatus: row.payment_status,
      bookingStatus: row.booking_status,
      assignedPhotographer: row.assigned_photographer || 'Chưa phân công',
      assignedMakeup: row.assigned_makeup || 'Chưa phân công',
      notes: row.notes || '',
      createdAt: row.created_at
    }));

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint for Admin confirming costume return
app.put('/api/orders/:id/confirm-return', async (req, res) => {
  try {
    const { id } = req.params;
    const updateRes = await query(
      `UPDATE orders 
       SET is_returned = TRUE, 
           booking_status = 'RETURNED', 
           notes = CONCAT(notes, ' [Đã trả đồ & kiểm tra hoàn tất]') 
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.json({
      success: true,
      message: 'Xác nhận trả đồ và giải phóng lịch trang phục thành công!',
      data: updateRes.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      id: customId,
      customerName,
      phone,
      email,
      serviceType,
      itemDetails,
      costumeIds,
      bookingDate,
      returnDate,
      rentalDays,
      timeSlot,
      totalAmount,
      depositAmount,
      penaltyFee,
      paymentStatus,
      bookingStatus,
      assignedPhotographer,
      assignedMakeup,
      notes
    } = req.body;

    // Check conflict if this is a costume rental order
    const isRental = (serviceType || '').includes('Thuê') || (serviceType || '').includes('Trang Phục');
    if (isRental && costumeIds && costumeIds.length > 0) {
      const conflictCheck = await checkCostumeRentalConflict(costumeIds, bookingDate, rentalDays || 1);
      if (conflictCheck.hasConflict) {
        return res.status(400).json({
          success: false,
          conflict: true,
          message: conflictCheck.message,
          conflictDetail: conflictCheck
        });
      }
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const id = customId || `AUR-${dateStr}-${randomSuffix}`;
    const startIso = bookingDate || new Date().toISOString().split('T')[0];
    const endIso = calculateEndDateIso(startIso, rentalDays || 1);

    const insertQuery = `
      INSERT INTO orders (
        id, customer_name, phone, email, service_type, item_details,
        costume_ids, is_returned, start_date, end_date,
        booking_date, return_date, rental_days, time_slot,
        total_amount, deposit_amount, penalty_fee,
        payment_status, booking_status, assigned_photographer, assigned_makeup, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *;
    `;
    const values = [
      id,
      customerName || 'Khách Hàng',
      phone || '',
      email || '',
      serviceType || 'Dịch Vụ Studio',
      itemDetails || '',
      JSON.stringify(costumeIds || []),
      false,
      startIso,
      endIso,
      bookingDate || '',
      returnDate || '',
      parseInt(rentalDays || 1, 10),
      timeSlot || '',
      parseInt(totalAmount || 0, 10),
      parseInt(depositAmount || 0, 10),
      parseInt(penaltyFee || 0, 10),
      paymentStatus || 'DEPOSITED',
      bookingStatus || 'CONFIRMED',
      assignedPhotographer || 'Chưa phân công',
      assignedMakeup || 'Chưa phân công',
      notes || ''
    ];

    const result = await query(insertQuery, values);
    const row = result.rows[0];

    const orderData = {
      id: row.id,
      customerName: row.customer_name,
      phone: row.phone,
      email: row.email,
      serviceType: row.service_type,
      itemDetails: row.item_details,
      costumeIds: row.costume_ids || [],
      isReturned: Boolean(row.is_returned),
      startDate: row.start_date,
      endDate: row.end_date,
      bookingDate: row.booking_date,
      returnDate: row.return_date,
      rentalDays: row.rental_days,
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
    };

    // Trigger email confirmation asynchronously in background
    if (orderData.email) {
      sendOrderConfirmationEmail(orderData).catch(emailErr => {
        console.error('⚠️ [Email Trigger Error]:', emailErr);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được lưu thành công vào cơ sở dữ liệu PostgreSQL',
      data: orderData
    });
  } catch (err) {
    console.error('Error in POST /api/orders:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      penaltyFee,
      totalAmount,
      depositAmount,
      notes,
      bookingStatus,
      paymentStatus,
      assignedPhotographer,
      assignedMakeup,
      isReturned
    } = req.body;

    const updateQuery = `
      UPDATE orders SET
        penalty_fee = COALESCE($1, penalty_fee),
        total_amount = COALESCE($2, total_amount),
        deposit_amount = COALESCE($3, deposit_amount),
        notes = COALESCE($4, notes),
        booking_status = COALESCE($5, booking_status),
        payment_status = COALESCE($6, payment_status),
        assigned_photographer = COALESCE($7, assigned_photographer),
        assigned_makeup = COALESCE($8, assigned_makeup),
        is_returned = COALESCE($9, is_returned)
      WHERE id = $10
      RETURNING *;
    `;
    const values = [
      penaltyFee !== undefined ? parseInt(penaltyFee, 10) : null,
      totalAmount !== undefined ? parseInt(totalAmount, 10) : null,
      depositAmount !== undefined ? parseInt(depositAmount, 10) : null,
      notes,
      bookingStatus,
      paymentStatus,
      assignedPhotographer,
      assignedMakeup,
      isReturned !== undefined ? Boolean(isReturned) : null,
      id
    ];
    const result = await query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const row = result.rows[0];
    res.json({
      success: true,
      message: 'Order updated successfully',
      data: {
        id: row.id,
        customerName: row.customer_name,
        phone: row.phone,
        email: row.email,
        serviceType: row.service_type,
        itemDetails: row.item_details,
        costumeIds: row.costume_ids || [],
        isReturned: Boolean(row.is_returned),
        startDate: row.start_date,
        endDate: row.end_date,
        bookingDate: row.booking_date,
        returnDate: row.return_date,
        rentalDays: row.rental_days,
        timeSlot: row.time_slot,
        totalAmount: row.total_amount,
        depositAmount: row.deposit_amount,
        penaltyFee: row.penalty_fee,
        paymentStatus: row.payment_status,
        bookingStatus: row.booking_status,
        assignedPhotographer: row.assigned_photographer,
        assignedMakeup: row.assigned_makeup,
        createdAt: row.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Xóa đơn hàng thành công khỏi PostgreSQL' });
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


/* ==========================================================================
   4. HERO BANNERS ENDPOINTS (PostgreSQL CRUD)
   ========================================================================== */

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

app.listen(PORT, () => {
  console.log(`🚀 Aura Studio Backend REST API Server listening at http://localhost:${PORT}`);
});

