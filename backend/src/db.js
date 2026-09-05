const { Pool } = require('pg');

// Create Postgres Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://aura_admin:aura_password_2026@localhost:5432/aura_studio_db',
});

// Enforce UTF8 encoding on all PostgreSQL connections
pool.on('connect', (client) => {
  client.query("SET client_encoding TO 'UTF8'");
});

// Helper for running queries
const query = (text, params) => pool.query(text, params);

// Auto-migration & Initial Seeding Routine
const initDb = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      console.log('🔄 Connecting to PostgreSQL Database...');
      await pool.query('SELECT NOW()');
      await pool.query("SET client_encoding TO 'UTF8'");
      console.log('✅ PostgreSQL Database connection established successfully!');
      break;
    } catch (err) {
      console.log(`⚠️ Database connection failed. Retrying... (${retries} attempts left)`);
      retries -= 1;
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  try {
    // 1. Create costume_categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS costume_categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title TEXT,
        subtitle TEXT,
        seo_intro TEXT,
        features JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create costumes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS costumes (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        category_name VARCHAR(100),
        gender VARCHAR(20),
        sizes JSONB,
        rental_price INTEGER NOT NULL,
        deposit_amount INTEGER NOT NULL,
        image TEXT,
        description TEXT,
        available_status VARCHAR(50) DEFAULT 'AVAILABLE',
        available_count INTEGER DEFAULT 1,
        tags JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        service_type VARCHAR(255) NOT NULL,
        item_details TEXT,
        booking_date VARCHAR(50),
        return_date VARCHAR(50),
        rental_days INTEGER DEFAULT 1,
        time_slot VARCHAR(100),
        total_amount INTEGER NOT NULL,
        deposit_amount INTEGER NOT NULL,
        penalty_fee INTEGER DEFAULT 0,
        payment_status VARCHAR(50) NOT NULL,
        booking_status VARCHAR(50) NOT NULL,
        assigned_photographer VARCHAR(255),
        assigned_makeup VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist if table was already created
    await pool.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_date VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS rental_days INTEGER DEFAULT 1;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS costume_ids JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_returned BOOLEAN DEFAULT FALSE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS start_date VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS end_date VARCHAR(50);
    `);

    // 4. Create hero_banners table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_banners (
        id VARCHAR(100) PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        tag VARCHAR(100),
        badge VARCHAR(100),
        image TEXT NOT NULL,
        button_text VARCHAR(100),
        button_link VARCHAR(255),
        hotline VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create service_packages table (Gói Chụp Ảnh Concept)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_packages (
        id VARCHAR(100) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        subtitle TEXT,
        base_price_per_person INTEGER NOT NULL,
        deposit INTEGER NOT NULL,
        included_people INTEGER DEFAULT 1,
        outfits_count INTEGER DEFAULT 1,
        retouched_count INTEGER DEFAULT 10,
        image TEXT,
        features JSONB,
        is_popular BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create service_addons table (Dịch Vụ Phụ Phí Đi Kèm)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_addons (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Create photobooth_concepts table (Giá Khung Ảnh Photobooth)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS photobooth_concepts (
        id VARCHAR(100) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image TEXT,
        perks JSONB DEFAULT '["Miễn phí mượn 50+ phụ kiện", "File ảnh gốc + Video GIF hậu trường", "In 4 dải ảnh Strip Glossy cao cấp", "Quét mã QR lấy file siêu tốc"]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE photobooth_concepts ADD COLUMN IF NOT EXISTS perks JSONB DEFAULT '["Miễn phí mượn 50+ phụ kiện", "File ảnh gốc + Video GIF hậu trường", "In 4 dải ảnh Strip Glossy cao cấp", "Quét mã QR lấy file siêu tốc"]'::jsonb;
    `);

    // 8. Create visitor_logs table (Tracking người truy cập >= 5s)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitor_logs (
        id SERIAL PRIMARY KEY,
        visitor_id VARCHAR(100),
        page_url VARCHAR(255),
        user_agent TEXT,
        ip_address VARCHAR(100),
        duration_seconds INTEGER DEFAULT 5,
        visited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        visited_date VARCHAR(20),
        visited_month VARCHAR(10)
      );
      CREATE INDEX IF NOT EXISTS idx_visitor_logs_month ON visitor_logs (visited_month);
      CREATE INDEX IF NOT EXISTS idx_visitor_logs_date ON visitor_logs (visited_date);
    `);

    // 9. Create analytics_monthly_summaries table (Dữ liệu tổng hợp theo tháng cho AI & Excel)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_monthly_summaries (
        id SERIAL PRIMARY KEY,
        month VARCHAR(10) UNIQUE NOT NULL,
        total_visitors INTEGER DEFAULT 0,
        total_revenue BIGINT DEFAULT 0,
        total_deposits BIGINT DEFAULT 0,
        rental_orders_count INTEGER DEFAULT 0,
        photo_slots_count INTEGER DEFAULT 0,
        total_orders_count INTEGER DEFAULT 0,
        ai_structured_data JSONB DEFAULT '{}'::jsonb,
        last_exported_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed Categories if Table is Empty
    const catCountRes = await pool.query('SELECT COUNT(*) FROM costume_categories');
    if (parseInt(catCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding costume categories into PostgreSQL...');
      const initialCategories = [
        ['ao-dai-cuoi-hoi', 'Áo Dài Cưới Hỏi', 'CHO THUÊ ÁO DÀI CƯỚI HỎI - ÁO DÀI CÔ DÂU, ÁO DÀI CHÚ RỂ', 'Mẫu mã cao cấp, tinh tế tôn vinh vẻ đẹp truyền thống & sang trọng trong ngày cưới.', 'Với các nàng dâu và chú rể, áo dài cưới hỏi luôn là sắc phục tôn vinh giá trị văn hóa số 1 trong ngày trọng đại.', JSON.stringify(['Chuẩn Form May Đo', 'Size S - 7XL', 'Miễn Phí Mấn Xếp & Quạt', 'Giặt Hấp Khử Khuẩn 100%'])],
        ['ao-dai-be-trap', 'Áo Dài Bê Tráp', 'CHO THUÊ ÁO DÀI BÊ TRÁP - ĐỘI NGHĨA TÂN NỮ ĐỒNG BỘ', 'Thiết kế trẻ trung, tone màu hot trend 2026 cho đội hình bê tráp lung linh.', 'Dịch vụ cho thuê áo dài bê tráp nam nữ đồng bộ tone màu hot trend.', JSON.stringify(['Đồng Bộ Số Lượng Lớn', 'Tone Màu Hot Trend 2026', 'Lụa Co Giãn 4 Chiều', 'Ủi Hấp Phôi Sẵn Cung Cấp'])],
        ['ao-dai-sui-gia', 'Áo Dài Sui Gia', 'CHO THUÊ ÁO DÀI SUI GIA - ÁO DÀI MẸ CÔ DÂU CHÚ RỂ', 'Nhung thêu sang trọng, giấu khuyết điểm chuẩn tôn vinh vẻ đẹp quý phái.', 'Các mẫu áo dài sui gia nhung thêu đắp nổi sang trọng, lụa gấm dệt kim sa quý phái.', JSON.stringify(['Nhung Gấm Thêu Tay Quý Phái', 'Giấu Khuyết Điểm Tinh Tế', 'Đủ Size Cho Các Mẹ', 'Tư Vấn Thử Đồ Tận Tình'])],
        ['ao-dai-ky-yeu', 'Áo Dài Kỷ Yếu', 'CHO THUÊ ÁO DÀI KỶ YẾU - ÁO DÀI TRẮNG NỮ SINH & TỐT NGHIỆP', 'Áo dài lụa tơ ý bay bổng thướt tha, giá thuê ưu đãi đặc biệt cho tập thể lớp.', 'Bộ sưu tập áo dài kỷ yếu nữ sinh vải lụa tơ ý, lụa ngọc trai thướt tha mềm mại.', JSON.stringify(['Chất Lụa Tơ Ý Bay Bổng', 'Giá Thuê Học Sinh / Sinh Viên', 'Ưu Đãi Thuê Theo Lớp', 'Tặng Kèm Nơ & Kẹp Tóc'])],
        ['co-phuc', 'Cổ Phục Việt Triều Nguyễn', 'CHO THUÊ CỔ PHỤC VIỆT - NHẬT BÌNH, ÁO TẮC & NGŨ THÂN', 'Tái hiện di sản hoàng gia Triều Nguyễn thêu rồng phượng tỉ mỉ sắc nét.', 'Tái hiện vẻ đẹp di sản hoàng gia Việt Nam với bộ sưu tập Cổ Phục Triều Nguyễn.', JSON.stringify(['Họa Tiết Thêu Chuẩn Sử', 'Trọn Bộ Trang Sức Hoàng Gia', 'Chất Lụa Gấm Cao Cấp', 'Form Rộng Sang Trọng'])],
        ['vest-nam', 'Vest Nam & Tuxedo', 'CHO THUÊ VEST NAM & TUXEDO DOANH NHÂN - CỘNG SUIT LUXURY', 'Vest may đo chuẩn form Ý & Hàn Quốc cho chú rể và chụp ảnh profile doanh nhân.', 'Bộ sưu tập Cộng Suit với hơn 200+ bộ Vest Nam, Tuxedo Velvet Navy.', JSON.stringify(['Phong Cách Ý & Hàn Quốc', 'Đủ Form S - 3XL', 'Kèm Nơ & Khuy Măng Sét', 'Ủi Phôi Chuẩn Form'])],
        ['ao-cu-nhan', 'Áo Cử Nhân Tốt Nghiệp', 'CHO THUÊ ÁO CỬ NHÂN - LỄ PHỤC TỐT NGHIỆP ĐẠI HỌC & CẤP 3', 'Lễ phục cử nhân cao cấp vải dệt không nhăn, kèm mũ & bằng tốt nghiệp mô hình.', 'Lễ phục cử nhân chất liệu vải dệt nhập khẩu cao cấp, không nhăn.', JSON.stringify(['Vải Dệt Chuẩn Không Nhăn', 'Đủ Size Cho Cả Nhóm', 'Đầy Đủ Mũ & Bằng Tốt Nghiệp', 'Giá Thuê Tập Thể'])],
        ['da-hoi', 'Đầm Dạ Hội & Váy Trắng', 'CHO THUÊ ĐẦM DẠ HỘI & VÁY TRẮNG DỰ TIỆC - PROM & BEAUTY SHOT', 'Satin ngọc trai, đính kết pha lê sang trọng cho các buổi dạ tiệc & beauty shot.', 'Váy dạ hội satin ngọc trai dáng xòe công chúa, đầm cúp ngực đính kết pha lê.', JSON.stringify(['Satin Ngọc Trai & Lụa Ý', 'Đính Kết Pha Lê VIP', 'Nhiều Dáng Xòe & Ôm Body', 'Thích Hợp Prom & Event'])],
        ['phu-kien', 'Phụ Kiện & Giày Nam', 'CHO THUÊ PHỤ KIỆN CHỦP ẢNH, MẤN ĐỘI, QUẠT LỤA & GIÀY TÂY', 'Đầy đủ phụ kiện cao cấp đi kèm tôn vinh nét hoàn hảo cho bộ trang phục.', 'Đầy đủ các loại phụ kiện đi kèm phong phú: Giày tây da bò cao cấp, mấn đội đầu dát vàng.', JSON.stringify(['Trọn Bộ Phụ Kiện Đi Kèm', 'Giày Da Bò Đủ Size', 'Mấn & Trang Sức Dát Vàng', 'Giá Thuê Rẻ Đi Kèm'])]
      ];

      for (const row of initialCategories) {
        await pool.query(
          `INSERT INTO costume_categories (id, name, title, subtitle, seo_intro, features)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          row
        );
      }
    }

    // Seed Initial Data if Costumes Table is Empty
    const costumeCountRes = await pool.query('SELECT COUNT(*) FROM costumes');
    if (parseInt(costumeCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial costumes data into PostgreSQL...');
      const initialCostumes = [
        ['AD-101', 'AD-101', 'Áo Dài Hoàng Cúc Đỏ Dát Vàng', 'ao-dai-cuoi-hoi', 'Áo Dài Cưới Hỏi', 'Nữ', JSON.stringify(['S', 'M', 'L']), 250000, 500000, '/images/costume_ao_dai_viet_1786199756012.png', 'Áo dài lụa tơ tằm thêu hoàng cúc dệt chỉ vàng sang trọng.', 'AVAILABLE', 4, JSON.stringify(['Best Seller', 'Cưới Hỏi'])],
        ['AD-102', 'AD-102', 'Áo Dài Cô Dâu Lụa Ngọc Trai Đỏ Tía', 'ao-dai-cuoi-hoi', 'Áo Dài Cưới Hỏi', 'Nữ', JSON.stringify(['S', 'M', 'L', 'XL']), 350000, 700000, '/images/costume_ao_dai_viet_1786199756012.png', 'Áo dài cô dâu thiết kế cổ trụ kết ngọc trai tỉ mỉ, đi kèm mấn xếp dát vàng.', 'AVAILABLE', 3, JSON.stringify(['Cô Dâu VIP'])],
        ['AD-201', 'AD-201', 'Set Áo Dài Bê Tráp Nữ Hồng Pastel', 'ao-dai-be-trap', 'Áo Dài Bê Tráp', 'Nữ', JSON.stringify(['S', 'M', 'L']), 120000, 250000, '/images/costume_ao_dai_viet_1786199756012.png', 'Áo dài bê tráp lụa Tây Hà tone hồng phấn nhẹ nhàng, tay bồng thanh lịch.', 'AVAILABLE', 12, JSON.stringify(['Bê Tráp'])],
        ['AD-301', 'AD-301', 'Áo Dài Sui Gia Nhung Đỏ Thêu Phượng', 'ao-dai-sui-gia', 'Áo Dài Sui Gia', 'Nữ', JSON.stringify(['L', 'XL', '2XL']), 380000, 800000, '/images/costume_ao_dai_viet_1786199756012.png', 'Áo dài nhung cao cấp dành cho mẹ cô dâu chú rể quý phái.', 'AVAILABLE', 5, JSON.stringify(['Nhung VIP'])],
        ['AD-401', 'AD-401', 'Áo Dài Kỷ Yếu Trắng Lụa Tơ Ý', 'ao-dai-ky-yeu', 'Áo Dài Kỷ Yếu', 'Nữ', JSON.stringify(['S', 'M', 'L']), 90000, 200000, '/images/costume_ao_dai_viet_1786199756012.png', 'Áo dài trắng nữ sinh lụa tơ ý 4 tà thướt tha.', 'AVAILABLE', 20, JSON.stringify(['Kỷ Yếu'])],
        ['CP-201', 'CP-201', 'Cổ Phục Nhật Bình Triều Nguyễn', 'co-phuc', 'Cổ Phục Việt', 'Nữ', JSON.stringify(['M', 'L']), 450000, 900000, '/images/costume_co_phuc_viet_1786199773916.png', 'Cổ phục triều đình thêu họa tiết rồng phượng tỉ mỉ, đi kèm quạt lụa và mấn xếp dát vàng.', 'AVAILABLE', 2, JSON.stringify(['Hoàng Gia'])],
        ['CP-202', 'CP-202', 'Bộ Áo Tấc Ngũ Thân Nam Nữ', 'co-phuc', 'Cổ Phục Việt', 'Unisex', JSON.stringify(['M', 'L', 'XL']), 400000, 800000, '/images/costume_co_phuc_viet_1786199773916.png', 'Áo Tấc lụa gấm dệt hoa văn cổ truyền.', 'AVAILABLE', 4, JSON.stringify(['Áo Tấc'])],
        ['VT-301', 'VT-301', 'Bộ Tuxedo Velvet Navy Luxury', 'vest-nam', 'Vest Nam & Tuxedo', 'Nam', JSON.stringify(['M', 'L', 'XL']), 380000, 700000, '/images/costume_vest_luxury_1786199794453.png', 'Vest nhung cao cấp tone xanh dạ hội may đo chuẩn form.', 'AVAILABLE', 5, JSON.stringify(['Cộng Suit'])],
        ['VT-302', 'VT-302', 'Bộ Vest Be Kem Phong Cách Hàn Quốc', 'vest-nam', 'Vest Nam', 'Nam', JSON.stringify(['S', 'M', 'L']), 320000, 600000, '/images/costume_vest_luxury_1786199794453.png', 'Vest phong cách trẻ trung tone be kem lịch lãm.', 'AVAILABLE', 6, JSON.stringify(['Hàn Quốc'])],
        ['KY-501', 'KY-501', 'Set Áo Cử Nhân Tốt Nghiệp Đại Học', 'ao-cu-nhan', 'Áo Cử Nhân', 'Unisex', JSON.stringify(['S', 'M', 'L', 'XL']), 80000, 150000, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', 'Bộ lễ phục tốt nghiệp đầy đủ nón cử nhân, dây vạt áo thêu logo.', 'AVAILABLE', 50, JSON.stringify(['Kỷ Yếu'])],
        ['DH-401', 'DH-401', 'Đầm Dạ Hội Satin Trắng Công Chúa', 'da-hoi', 'Đầm Dạ Hội', 'Nữ', JSON.stringify(['S', 'M']), 500000, 1000000, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80', 'Váy dự tiệc lụa satin ngọc trai ôm eo xòe nhẹ.', 'AVAILABLE', 3, JSON.stringify(['Prom VIP'])],
        ['PK-601', 'PK-601', 'Giày Tây Da Bò Ý Mạ Khóa Vàng', 'phu-kien', 'Phụ Kiện & Giày', 'Nam', JSON.stringify(['39', '40', '41', '42', '43']), 100000, 300000, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80', 'Giày tây da thật bóng bẩy êm chân.', 'AVAILABLE', 10, JSON.stringify(['Giày Nam'])]
      ];

      for (const row of initialCostumes) {
        await pool.query(
          `INSERT INTO costumes (id, code, name, category, category_name, gender, sizes, rental_price, deposit_amount, image, description, available_status, available_count, tags)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          row
        );
      }
    }

    // Clean up any legacy mock orders or test orders with corrupted characters
    await pool.query("DELETE FROM orders WHERE id LIKE 'AUR-20260808-%' OR customer_name LIKE '%?%' OR id = 'AUR-20260902-785'");

    // Seed Initial Hero Banners if Empty
    const bannerCountRes = await pool.query('SELECT COUNT(*) FROM hero_banners');
    if (parseInt(bannerCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial hero banners into PostgreSQL...');
      const initialBanners = [
        [
          'banner-1',
          'KỶ YẾU MIỀN BẮC & CONCEPT ĐỘC BẢN',
          'Hơn 100+ Concept Kỷ Yếu Học Sinh, Sinh Viên Đỉnh Cao • Trọn Gói Phim Ảnh & Trang Phục',
          'Yearbook Concept 2026',
          'Cộng Studio Style',
          '/images/banners/banner1.png',
          'Đặt Lịch Chụp Kỷ Yếu',
          '#booking',
          '0975.475.789 - 0968.475.789',
          true,
          1
        ],
        [
          'banner-2',
          'CỔ PHỤC TRIỀU NGUYỄN & ÁO DÀI DI SẢN',
          'Cho Thuê Trang Phục Cao Cấp Của Áo Dài Nhân & Cổ Phục Việt • Chuẩn Phom Dáng Hoàn Hảo',
          'Bộ Sưu Tập Trang Phục 2026',
          'Áo Dài Nhân',
          '/images/banners/banner2.png',
          'Xem Bộ Sưu Tập Trang Phục',
          '#costumes',
          '0975.397.923 - 0399.475.789',
          true,
          2
        ],
        [
          'banner-3',
          'TUXEDO NAM LUXURY & CHỤP ẢNH DOANH NHÂN',
          'Vest Nhung Dạ Hội, Suit Chú Rể Cao Cấp & Gói Chụp Ảnh Nghệ Thuật Đẳng Cấp 5 Sao',
          'Cộng Suit & High Fashion',
          'Cộng Suit',
          '/images/banners/banner3.png',
          'Khám Phá Bảng Giá Suit',
          '#pricing',
          '0975.475.789',
          true,
          3
        ]
      ];

      for (const row of initialBanners) {
        await pool.query(
          `INSERT INTO hero_banners (id, title, subtitle, tag, badge, image, button_text, button_link, hotline, is_active, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          row
        );
      }
    }

    // Seed Service Packages if Empty
    const pkgCountRes = await pool.query('SELECT COUNT(*) FROM service_packages');
    if (parseInt(pkgCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial service packages into PostgreSQL...');
      const initialPkgs = [
        [
          'pkg-profile-vip', 'PKG-PROFILE', 'Gói Profile Doanh Nhân VIP',
          'Phong cách Black Statement & Executive Elite', 1500000, 500000, 1, 2, 10,
          '/images/costume_vest_luxury_1786199794453.png',
          JSON.stringify([
            'Bao gồm 2 bộ Vest Tuxedo / Đầm Dạ Hội cao cấp',
            'Chuyên viên Makeup & Làm tóc phong cách Doanh nhân',
            'Chụp 150-200 file ảnh gốc góc nghệ thuật',
            'Trả 10 file retouch da mịn chi tiết 4K',
            'Tặng 1 ảnh ép gỗ cao cấp để bàn (20x30cm)'
          ]),
          true
        ],
        [
          'pkg-co-phuc', 'PKG-COPHUC', 'Gói Chân Dung Cổ Phục Việt Hoàng Gia',
          'Nhật Bình & Giao Lĩnh Triều Nguyễn chính gốc', 1800000, 600000, 1, 2, 12,
          '/images/costume_co_phuc_viet_1786199773916.png',
          JSON.stringify([
            'Bao gồm 2 bộ Cổ Phục Nhật Bình / Áo Giao Lĩnh chính gốc',
            'Đầy đủ bộ phụ kiện: Trâm ngọc, quạt lụa, mấn xếp dát vàng',
            'Trang điểm phong cách Cung đình xưa thanh thoát',
            'Trả toàn bộ file gốc + 12 file retouch sắc nét',
            'Tặng 1 khung ảnh mica vàng kim để bàn'
          ]),
          true
        ],
        [
          'pkg-ky-yeu-group', 'PKG-KYYEU', 'Gói Chụp Kỷ Yếu Lớp / Nhóm',
          'Urban School Vibes & Concept Học Đường', 350000, 1000000, 10, 2, 30,
          '/images/costume_ao_dai_viet_1786199756012.png',
          JSON.stringify([
            'Áp dụng trọn gói cho nhóm / lớp học (350k/người)',
            'Bao gồm 2 concept trang phục: Áo Cử Nhân + Áo Dài/Vest',
            'Ekip 2 Nhiếp ảnh gia + 1 Hỗ trợ pose dáng vui nhộn',
            'Bàn giao 500+ file ảnh gốc sắc nét qua Google Drive',
            'Tặng 1 Video Highlight kỷ niệm dài 2 phút HD'
          ]),
          false
        ]
      ];

      for (const row of initialPkgs) {
        await pool.query(
          `INSERT INTO service_packages (id, code, name, subtitle, base_price_per_person, deposit, included_people, outfits_count, retouched_count, image, features, is_popular)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          row
        );
      }
    }

    // Seed Service Addons if Empty
    const addonCountRes = await pool.query('SELECT COUNT(*) FROM service_addons');
    if (parseInt(addonCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial service addons into PostgreSQL...');
      const initialAddons = [
        ['addon-makeup', 'Makeup & Tóc Thêm 1 Lần', 250000],
        ['addon-mv', 'Quay MV Kỷ Yếu Highlight 4K', 600000],
        ['addon-photobook', 'In Album Photobook Bìa Da 20 Trang', 450000],
        ['addon-drone', 'Quay Flycam Bối Cảnh Toàn Cảnh', 800000]
      ];

      for (const row of initialAddons) {
        await pool.query(
          `INSERT INTO service_addons (id, name, price) VALUES ($1, $2, $3)`,
          row
        );
      }
    }

    // Seed Photobooth Concepts if Empty
    const pbCountRes = await pool.query('SELECT COUNT(*) FROM photobooth_concepts');
    if (parseInt(pbCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial photobooth concepts into PostgreSQL...');
      const initialPb = [
        [
          'pb-korean-4cut', 'PB-KOREAN-01', 'Korean Vintage 4-Cut Frame',
          'Chụp 4 ô phong cách thanh lịch Hàn Quốc viền vàng kim nhũ nhã nhặn.', 70000,
          'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80'
        ],
        [
          'pb-y2k-cyber', 'PB-Y2K-02', 'Retro Y2K Cyberpunk Pink Strip',
          'Phong cách dải ảnh Y2K cá tính, hiệu ứng màu neon độc đáo.', 60000,
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
        ],
        [
          'pb-co-phuc-strip', 'PB-HERITAGE-03', 'Cổ Phục Hoàng Cung Vintage',
          'Họa tiết hoa sen dát vàng tôn vinh nét đẹp văn hóa Việt.', 80000,
          '/images/costume_co_phuc_viet_1786199773916.png'
        ]
      ];

      for (const row of initialPb) {
        await pool.query(
          `INSERT INTO photobooth_concepts (id, code, name, description, price, image)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          row
        );
      }
    }

    // Seed initial Visitor Logs & Monthly Analytics if empty
    const visitorCountRes = await pool.query('SELECT COUNT(*) FROM visitor_logs');
    if (parseInt(visitorCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial visitor traffic logs and monthly analytics into PostgreSQL...');
      const monthsData = [
        { month: '2026-05', visitors: 1420, rev: 14850000, dep: 4500000, rentals: 14, slots: 28, totalOrders: 42 },
        { month: '2026-06', visitors: 2150, rev: 22400000, dep: 7200000, rentals: 22, slots: 45, totalOrders: 67 },
        { month: '2026-07', visitors: 3340, rev: 35600000, dep: 11500000, rentals: 38, slots: 68, totalOrders: 106 },
        { month: '2026-08', visitors: 4890, rev: 52300000, dep: 17800000, rentals: 56, slots: 95, totalOrders: 151 },
        { month: '2026-09', visitors: 5820, rev: 61850000, dep: 21400000, rentals: 64, slots: 112, totalOrders: 176 }
      ];

      for (const m of monthsData) {
        // Insert aggregated monthly summary
        const aiData = {
          month: m.month,
          metrics: {
            retentionRate: '68.5%',
            avgSessionDuration: '3m 42s',
            conversionRate: '3.1%',
            popularCategory: 'Cổ Phục Việt & Áo Dài Kỷ Yếu',
            photoboothPopularity: 'Retro Y2K Cyberpunk Pink Strip',
            peakHours: '14:00 - 18:00',
            trafficSources: { direct: 42, social: 38, organicSearch: 20 }
          }
        };

        await pool.query(`
          INSERT INTO analytics_monthly_summaries 
            (month, total_visitors, total_revenue, total_deposits, rental_orders_count, photo_slots_count, total_orders_count, ai_structured_data)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (month) DO UPDATE SET
            total_visitors = EXCLUDED.total_visitors,
            total_revenue = EXCLUDED.total_revenue,
            total_deposits = EXCLUDED.total_deposits,
            rental_orders_count = EXCLUDED.rental_orders_count,
            photo_slots_count = EXCLUDED.photo_slots_count,
            total_orders_count = EXCLUDED.total_orders_count,
            ai_structured_data = EXCLUDED.ai_structured_data;
        `, [m.month, m.visitors, m.rev, m.dep, m.rentals, m.slots, m.totalOrders, JSON.stringify(aiData)]);

        // Insert sample visitor log batch for the month
        await pool.query(`
          INSERT INTO visitor_logs (visitor_id, page_url, user_agent, ip_address, duration_seconds, visited_date, visited_month)
          VALUES 
            ($1, '/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '127.0.0.1', 45, $2, $3),
            ($4, '/#costumes', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)', '127.0.0.1', 85, $2, $3),
            ($5, '/#photobooth', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '127.0.0.1', 120, $2, $3);
        `, [
          `VISIT-${m.month}-01`, `${m.month}-05`, m.month,
          `VISIT-${m.month}-02`, `${m.month}-12`,
          `VISIT-${m.month}-03`
        ]);
      }
    }

    console.log('✅ PostgreSQL Schema & Seed initialized successfully!');
  } catch (err) {
    console.error('❌ Error during PostgreSQL initialization:', err);
  }
};

module.exports = {
  pool,
  query,
  initDb
};
