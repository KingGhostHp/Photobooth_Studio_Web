const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// In-Memory Database Store
let costumesStore = [
  {
    id: 'AD-101',
    code: 'AD-101',
    name: 'Áo Dài Hoàng Cúc Đỏ Dát Vàng',
    category: 'ao-dai',
    categoryName: 'Áo Dài Truyền Thống',
    gender: 'Nữ',
    sizes: ['S', 'M', 'L'],
    rentalPrice: 250000,
    depositAmount: 500000,
    image: '/images/costume_ao_dai_viet_1786199756012.png',
    description: 'Áo dài lụa tơ tằm thêu hoàng cúc dệt chỉ vàng sang trọng, phù hợp chụp ảnh Tết, kỷ yếu và cưới hỏi.',
    availableStatus: 'AVAILABLE',
    availableCount: 4,
    tags: ['Best Seller', 'Tết 2026', 'Thêu Tay']
  },
  {
    id: 'CP-201',
    code: 'CP-201',
    name: 'Cổ Phục Nhật Bình Triều Nguyễn',
    category: 'co-phuc',
    categoryName: 'Cổ Phục Việt',
    gender: 'Nữ',
    sizes: ['M', 'L'],
    rentalPrice: 450000,
    depositAmount: 900000,
    image: '/images/costume_co_phuc_viet_1786199773916.png',
    description: 'Cổ phục triều đình thêu họa tiết rồng phượng tỉ mỉ, đi kèm quạt lụa và mấn xếp dát vàng cao cấp.',
    availableStatus: 'AVAILABLE',
    availableCount: 2,
    tags: ['Hoàng Gia', 'Di Sản', 'Cổ Kính']
  },
  {
    id: 'VT-301',
    code: 'VT-301',
    name: 'Bộ Tuxedo Velvet Navy Luxury (Cộng Suit)',
    category: 'vest-nam',
    categoryName: 'Vest Nam & Tuxedo',
    gender: 'Nam',
    sizes: ['M', 'L', 'XL'],
    rentalPrice: 380000,
    depositAmount: 700000,
    image: '/images/costume_vest_luxury_1786199794453.png',
    description: 'Vest nhung cao cấp tone xanh dạ hội may đo chuẩn form, đi kèm khuy măng sét mạ vàng và nơ cổ.',
    availableStatus: 'AVAILABLE',
    availableCount: 5,
    tags: ['Cộng Suit', 'Doanh Nhân', 'Chú Rể']
  }
];

let ordersStore = [
  {
    id: 'AUR-20260808-01',
    customerName: 'Nguyễn Phương Anh',
    phone: '0912.345.678',
    serviceType: 'Chụp Ảnh Concept & Thuê Đồ',
    itemDetails: 'Áo Dài Hoàng Cúc Đỏ + Gói Profile Business',
    bookingDate: '2026-08-10',
    timeSlot: '08:30 - 10:00',
    totalAmount: 1750000,
    depositAmount: 500000,
    paymentStatus: 'DEPOSITED_30%',
    bookingStatus: 'CONFIRMED',
    assignedPhotographer: 'Nhiếp ảnh gia Tuấn Nguyễn',
    assignedMakeup: 'Stylist / Makeup Linh Trần',
    createdAt: '2026-08-08 14:20'
  }
];

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Aura Studio Backend API is running smoothly' });
});

// Costumes Endpoints
app.get('/api/costumes', (req, res) => {
  res.json({ success: true, data: costumesStore });
});

app.post('/api/costumes', (req, res) => {
  const newItem = { id: `ITEM-${Date.now()}`, ...req.body };
  costumesStore.unshift(newItem);
  res.status(201).json({ success: true, data: newItem });
});

app.put('/api/costumes/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  costumesStore = costumesStore.map(item => item.id === id ? { ...item, availableStatus: status } : item);
  res.json({ success: true, message: 'Updated costume status state successfully' });
});

// Bookings & Orders Endpoints
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: ordersStore });
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: `AUR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  ordersStore.unshift(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

// Admin Stats
app.get('/api/admin/stats', (req, res) => {
  const totalRevenue = ordersStore.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalDeposits = ordersStore.reduce((sum, o) => sum + (o.depositAmount || 0), 0);
  res.json({
    success: true,
    data: {
      totalRevenue,
      totalDeposits,
      activeOrdersCount: ordersStore.length,
      availableCostumesCount: costumesStore.filter(c => c.availableStatus === 'AVAILABLE').length
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Aura Studio Backend REST API Server listening at http://localhost:${PORT}`);
});
