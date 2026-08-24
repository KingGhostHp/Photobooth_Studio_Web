# Aura Studio & Costume Rental Web Application

Ứng dụng Web App quản lý studio chụp ảnh & cho thuê trang phục cao cấp với thiết kế **Bright Clean Studio Layout** (chuẩn phong cách Cộng Studio `congstudio.vn`).

---

## 🗄️ Kiến Trúc Cơ Sở Dữ Liệu PostgreSQL (Relational Database)

Dự án sử dụng cơ sở dữ liệu quan hệ **PostgreSQL 16** với cơ chế tự động tạo bảng (Auto-Migration) và nạp dữ liệu mẫu (Seeding) khi khởi chạy:

### các Bảng Chính (Database Tables):
1. **`costumes`**: Quản lý trang phục cho thuê (Mã SP, tên, danh mục, giá thuê/ngày, tiền cọc, số lượng khả dụng, tags, trạng thái kho).
2. **`orders`**: Quản lý đơn đặt lịch & thuê đồ (Mã đơn `AUR-YYYYMMDD-XXX`, tên khách, SĐT, gói chụp/sản phẩm, ngày chụp, ca giờ, tổng tiền, cọc 30%, phụ phí phạt, trạng thái thanh toán & booking).

---

## 📁 Cấu Trúc Dự Án (Folder Architecture)

```text
Photobooth_Studio_Web/
├── frontend/                   # Frontend SPA (React + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/        # Common, Customer Portal, Admin CMS components
│   │   ├── data/              # Static & Fallback Data
│   │   ├── index.css          # Design System CSS (Bright Studio tokens)
│   │   └── App.jsx            # Dynamic View Controller
│   ├── Dockerfile             # Multi-stage Docker build cho NGINX
│   └── nginx.conf             # NGINX reverse proxy & SPA router
│
├── backend/                    # Backend REST API Service (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── db.js              # PostgreSQL Pool & Auto-Migration / Seeding
│   │   └── server.js          # Express REST API Endpoints
│   ├── Dockerfile             # Docker container cho Node.js API
│   └── package.json           # Khai báo node-postgres (pg) dependency
│
├── docker-compose.yml          # Container orchestration (Frontend + Backend + PostgreSQL)
├── start-studio-docker.bat     # File 1-Click khởi chạy toàn bộ hệ thống
└── stop-studio-docker.bat      # File 1-Click dừng hệ thống
```

---

## 🐳 Triển Khai Với Docker Compose

Chạy lệnh 1-Click nhấp đúp vào **`start-studio-docker.bat`** hoặc gõ lệnh:

```bash
docker compose up --build -d
```

Hệ thống sẽ khởi tạo 3 container:
- **`aura-studio-frontend`**: NGINX Web Server tại `http://localhost` (Cổng 80)
- **`aura-studio-backend`**: Node.js REST API tại `http://localhost:5000` (Cổng 5000)
- **`aura-studio-db`**: PostgreSQL 16 Database tại `localhost:5432` (Cổng 5432) với Volume `postgres_data` lưu trữ dữ liệu vĩnh viễn.
