# Aura Studio & Costume Rental Web Application

Ứng dụng Web App quản lý studio chụp ảnh & cho thuê trang phục cao cấp với thiết kế **Dark Luxury Aesthetic** (Obsidian Charcoal & Gold Accent).

## 📁 Cấu Trúc Dự Án (Folder Architecture)

Dự án được phân chia rõ ràng thành 2 thư mục độc lập:

```text
Photobooth_Studio_Web/
├── frontend/                   # Frontend SPA (React + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/        # Common, Customer Portal, Admin CMS components
│   │   ├── data/              # Mock Data (Costumes, Packages, Bookings, Photobooth)
│   │   ├── index.css          # Design System CSS (Dark Luxury tokens & Glassmorphism)
│   │   └── App.jsx            # Dynamic View Controller (Customer & Admin views)
│   ├── public/                # Public Static Assets & AI Generated Images
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                    # Backend REST API Service (Node.js + Express)
│   ├── src/
│   │   └── server.js          # Express API server (Costumes, Orders, Admin stats)
│   ├── .env                   # Environment configurations (PORT=5000, CLIENT_URL)
│   └── package.json
│
└── package.json                # Root monorepo script helper
```

---

## 🚀 Hướng Dẫn Khởi Chạy (Local Execution)

### 1. Khởi chạy Frontend (React + Vite)
```bash
cd frontend
npm run dev
# Mở trình duyệt tại: http://localhost:5173/ hoặc http://127.0.0.1:3000/
```

### 2. Khởi chạy Backend (Node.js + Express)
```bash
cd backend
npm run dev
# Máy chủ REST API sẵn sàng tại: http://localhost:5000/api/health
```

### 3. Lệnh khởi chạy nhanh từ thư mục gốc
- Khởi chạy FE: `npm run dev:fe`
- Khởi chạy BE: `npm run dev:be`
