const { Pool } = require('pg');

// Create Postgres Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://aura_admin:aura_password_2026@localhost:5432/aura_studio_db',
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
        service_type VARCHAR(255) NOT NULL,
        item_details TEXT,
        booking_date VARCHAR(50),
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

    // Seed Initial Orders if Empty
    const orderCountRes = await pool.query('SELECT COUNT(*) FROM orders');
    if (parseInt(orderCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial orders data into PostgreSQL...');
      const initialOrders = [
        [
          'AUR-20260808-01', 'Nguyễn Phương Anh', '0912.345.678', 'Chụp Ảnh Concept & Thuê Đồ',
          'Áo Dài Hoàng Cúc Đỏ + Gói Profile Business', '2026-08-10', '08:30 - 10:00',
          1750000, 500000, 0, 'DEPOSITED_30%', 'CONFIRMED', 'Nhiếp ảnh gia Tuấn Nguyễn', 'Stylist / Makeup Linh Trần', 'Khách hẹn trang điểm lúc 8:00'
        ],
        [
          'AUR-20260808-02', 'Trần Minh Quân', '0988.111.222', 'Cho Thuê Trang Phục (Cộng Suit)',
          'Bộ Tuxedo Velvet Navy Luxury (Size L)', '2026-08-09', 'Chỉ Thuê Đồ (Nhận 09/08 - Trả 11/08)',
          380000, 700000, 0, 'FULLY_PAID', 'IN_PROGRESS', 'Không áp dụng', 'Không áp dụng', 'Đã cọc chứng minh thư'
        ]
      ];

      for (const row of initialOrders) {
        await pool.query(
          `INSERT INTO orders (id, customer_name, phone, service_type, item_details, booking_date, time_slot, total_amount, deposit_amount, penalty_fee, payment_status, booking_status, assigned_photographer, assigned_makeup, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          row
        );
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
