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

export const INITIAL_ORDERS = [];

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
