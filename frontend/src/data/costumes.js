export const COSTUME_CATEGORIES = [
  { id: 'all', name: 'Tất Cả Trang Phục' },
  { id: 'ao-dai', name: 'Áo Dài Truyền Thống & Kỷ Yếu' },
  { id: 'co-phuc', name: 'Cổ Phục Việt Triều Nguyễn' },
  { id: 'vest-nam', name: 'Vest Nam & Tuxedo (Cộng Suit)' },
  { id: 'da-hoi', name: 'Đầm Dạ Hội & Váy Trắng' },
  { id: 'ky-yeu', name: 'Lễ Phục Cử Nhân Tốt Nghiệp' },
];

export const COSTUMES_DATA = [
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
  },
  {
    id: 'DH-401',
    code: 'DH-401',
    name: 'Đầm Dạ Hội Satin Trắng Dáng Xòe Công Chúa',
    category: 'da-hoi',
    categoryName: 'Đầm Dạ Hội',
    gender: 'Nữ',
    sizes: ['S', 'M'],
    rentalPrice: 500000,
    depositAmount: 1000000,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    description: 'Váy dự tiệc lụa satin ngọc trai ôm eo xòe nhẹ, phong cách thanh lịch sang trọng cho các buổi prom & beauty shot.',
    availableStatus: 'AVAILABLE',
    availableCount: 3,
    tags: ['Prom VIP', 'High Fashion']
  },
  {
    id: 'KY-501',
    code: 'KY-501',
    name: 'Set Áo Cử Nhân Đại Học Quốc Tế',
    category: 'ky-yeu',
    categoryName: 'Trang Phục Kỷ Yếu',
    gender: 'Unisex',
    sizes: ['S', 'M', 'L', 'XL'],
    rentalPrice: 80000,
    depositAmount: 150000,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: 'Bộ lễ phục tốt nghiệp đầy đủ nón cử nhân, dây vạt áo thêu logo và bằng tốt nghiệp mô hình.',
    availableStatus: 'AVAILABLE',
    availableCount: 50,
    tags: ['Kỷ Yếu', 'Giá Tốt']
  },
  {
    id: 'VT-302',
    code: 'VT-302',
    name: 'Bộ Vest Be Kem Phong Cách Hàn Quốc',
    category: 'vest-nam',
    categoryName: 'Vest Nam',
    gender: 'Nam',
    sizes: ['S', 'M', 'L'],
    rentalPrice: 320000,
    depositAmount: 600000,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    description: 'Vest tone màu be kem trẻ trung hiện đại Hàn Quốc, thích hợp chụp concept thanh xuân, couple.',
    availableStatus: 'AVAILABLE',
    availableCount: 4,
    tags: ['Korean Vibes', 'Trẻ Trung']
  }
];

export const COSTUME_ITEMS = COSTUMES_DATA;

export const VIRTUAL_ACCESSORIES = [
  { id: 'acc-1', name: 'Trâm Cài Ngọc Dát Vàng', price: 50000, deposit: 100000, rentalPrice: 50000, depositAmount: 100000, type: 'Cổ Phục' },
  { id: 'acc-2', name: 'Quạt Lụa Thêu Hoa Sen', price: 40000, deposit: 80000, rentalPrice: 40000, depositAmount: 80000, type: 'Cổ Phục / Áo Dài' },
  { id: 'acc-3', name: 'Mấn Xếp Gấm Thêu Chỉ Vàng', price: 60000, deposit: 120000, rentalPrice: 60000, depositAmount: 120000, type: 'Áo Dài' },
  { id: 'acc-4', name: 'Kính Râm Vintage Retro Gold', price: 30000, deposit: 50000, rentalPrice: 30000, depositAmount: 50000, type: 'Vintage / Photobooth' },
  { id: 'acc-5', name: 'Nơ Cổ Velvet Đen & Khuy Măng Sét', price: 50000, deposit: 100000, rentalPrice: 50000, depositAmount: 100000, type: 'Vest Nam' },
];

export const VIRTUAL_BACKDROPS = [
  { id: 'bg-1', name: 'Bối Cảnh Cung Điện Cổ Phục', color: 'from-amber-950 via-red-950 to-[#0d0e12]', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80' },
  { id: 'bg-2', name: 'Studio Minimalist Dark Luxe', color: 'from-[#1a1c24] via-[#0d0e12] to-black', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80' },
  { id: 'bg-3', name: 'Góc Hoa Đào Xuân Thơ Mộng', color: 'from-rose-950 via-amber-950 to-[#0d0e12]', image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80' },
  { id: 'bg-4', name: 'Không Gian Cyberpunk Photobooth', color: 'from-purple-950 via-indigo-950 to-[#0d0e12]', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80' },
];

export const VIRTUAL_BUILDER_DATA = {
  outfits: COSTUMES_DATA,
  accessories: VIRTUAL_ACCESSORIES,
  backdrops: VIRTUAL_BACKDROPS
};
