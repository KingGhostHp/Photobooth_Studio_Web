export const BOOKING_SLOTS = [
  { id: 'slot-0830', time: '08:30 - 10:00', label: 'Ca Sáng 1', capacity: 3, bookedCount: 1, period: 'Morning' },
  { id: 'slot-1000', time: '10:00 - 11:30', label: 'Ca Sáng 2', capacity: 3, bookedCount: 3, period: 'Morning', isFull: true },
  { id: 'slot-1330', time: '13:30 - 15:00', label: 'Ca Chiều 1', capacity: 4, bookedCount: 2, period: 'Afternoon' },
  { id: 'slot-1500', time: '15:00 - 16:30', label: 'Ca Chiều 2', capacity: 4, bookedCount: 1, period: 'Afternoon' },
  { id: 'slot-1800', time: '18:00 - 19:30', label: 'Ca Tối 1', capacity: 2, bookedCount: 0, period: 'Evening' },
  { id: 'slot-1930', time: '19:30 - 21:00', label: 'Ca Tối 2', capacity: 2, bookedCount: 1, period: 'Evening' },
];

export const TIME_SLOTS = BOOKING_SLOTS;

export const SHOOT_TYPES = [
  { id: 'profile', name: 'Chụp Profile Doanh Nhân & Beauty' },
  { id: 'ky-yeu', name: 'Chụp Kỷ Yếu & MV Học Đường' },
  { id: 'co-phuc', name: 'Chụp Cổ Phục Việt Triều Nguyễn' },
  { id: 'thue-do', name: 'Thử & Thuê Trang Phục (Áo Dài Nhân)' }
];

export const STAFF_LIST = [
  { id: 'stf-1', name: 'Nhiếp ảnh gia Tuấn Nguyễn', role: 'PHOTOGRAPHER', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 'stf-2', name: 'Nhiếp ảnh gia Hoàng Nam', role: 'PHOTOGRAPHER', rating: 4.8, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'stf-3', name: 'Stylist / Makeup Linh Trần', role: 'MAKEUP_ARTIST', rating: 5.0, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: 'stf-4', name: 'Makeup Artist Mai Phương', role: 'MAKEUP_ARTIST', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
];

export const INITIAL_ORDERS = [
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
  },
  {
    id: 'AUR-20260808-02',
    customerName: 'Trần Minh Quân',
    phone: '0988.111.222',
    serviceType: 'Cho Thuê Trang Phục',
    itemDetails: 'Bộ Tuxedo Velvet Navy Luxury (Size L)',
    bookingDate: '2026-08-09',
    timeSlot: 'Chỉ Thuê Đồ (Nhận 09/08 - Trả 11/08)',
    totalAmount: 380000,
    depositAmount: 700000,
    paymentStatus: 'FULLY_PAID',
    bookingStatus: 'IN_PROGRESS',
    assignedPhotographer: 'Không áp dụng',
    assignedMakeup: 'Không áp dụng',
    createdAt: '2026-08-08 10:15'
  },
  {
    id: 'AUR-20260808-03',
    customerName: 'Lê Thị Thu Thảo',
    phone: '0934.567.890',
    serviceType: 'Chụp Cổ Phục & Thử Phối Đồ',
    itemDetails: 'Cổ Phục Nhật Bình + Quạt Lụa + Trâm Ngọc',
    bookingDate: '2026-08-12',
    timeSlot: '13:30 - 15:00',
    totalAmount: 2300000,
    depositAmount: 700000,
    paymentStatus: 'UNPAID',
    bookingStatus: 'PENDING_CONFIRM',
    assignedPhotographer: 'Nhiếp ảnh gia Hoàng Nam',
    assignedMakeup: 'Makeup Artist Mai Phương',
    createdAt: '2026-08-08 16:45'
  }
];

export const INITIAL_LOOKBOOK = [
  {
    id: 'lb-1',
    title: 'Bộ Ảnh Cổ Phục Nhật Bình Triều Nguyễn',
    clientName: 'Khách hàng Khánh Linh',
    concept: 'Heritage Royalty',
    image: '/images/costume_co_phuc_viet_1786199773916.png',
    likes: 342,
    location: 'Studio bối cảnh Cổ Kính Hà Nội'
  },
  {
    id: 'lb-2',
    title: 'Bộ Ảnh Áo Dài Hoàng Cúc Đón Xuân',
    clientName: 'Khách hàng Minh Trang',
    concept: 'Urban Elegant',
    image: '/images/costume_ao_dai_viet_1786199756012.png',
    likes: 512,
    location: 'Studio bối cảnh Hoàng Cúc'
  },
  {
    id: 'lb-3',
    title: 'Chân Dung Profile Doanh Nhân Velvet Tuxedo',
    clientName: 'Anh Quốc Bảo (CEO Tech)',
    concept: 'Black Statement',
    image: '/images/costume_vest_luxury_1786199794453.png',
    likes: 420,
    location: 'Studio bối cảnh Dark Minimalist'
  }
];
