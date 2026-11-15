# Aura Studio — Studio & Wardrobe

Bản rework ngày 04/11/2026: giới thiệu studio, thuê trang phục, đặt gói chụp/Photobooth và quản trị. React 19 + Vite 8 + Motion, Express + PostgreSQL. Thiết kế màu kem, mực và đất nung; ưu tiên hình ảnh và đặt lịch rõ giá.

## Mở trên máy này

- Website: http://127.0.0.1:5173/
- Quản trị: http://127.0.0.1:5173/#/admin
- Thông tin đăng nhập riêng: `.local/admin-access.txt` (không đưa vào Git).
- Bật lại: PowerShell `& ./.local/start.ps1` tại thư mục repo. Dừng bằng `.local/stop.ps1`.

PostgreSQL local dùng cổng 55432; cấu hình máy này ở `.local/backend.env`. Không dùng database `aura_studio_rework_test` làm dữ liệu vận hành.

## Cài trên máy khác

Yêu cầu Node 22.12+ và PostgreSQL 16 trở lên.

1. Chạy `npm ci` trong cả `backend/` và `frontend/`.
2. Sao chép `backend/.env.example` thành `backend/.env`; cấu hình database và ba secret độc lập.
3. Trong `backend/`, chạy `npm run dev` hoặc `npm start`.
4. Trong `frontend/`, chạy `npm run dev`. Vite chuyển `/api` tới cổng 5000.

Server khởi tạo schema và catalog mẫu nếu bảng rỗng; không tạo đơn hàng/doanh thu/lượt truy cập giả. Migration bản mới bổ sung cột và bảng, giữ lịch sử đơn có sẵn.

## Docker

Sao chép `.env.example` ở gốc thành `.env`, thay các giá trị mẫu rồi chạy `docker compose up --build -d`. Website ở http://localhost. Các cổng được giới hạn trên máy local. Đã cập nhật cấu hình, chưa chạy xác minh Docker trong lượt rework này.

## Triển khai trên Vercel và Render

1. Trên Render, tạo PostgreSQL và một **Web Service** từ nhánh `main`. Chọn Root Directory `backend`, Build Command `npm ci`, Start Command `npm start` và Health Check Path `/api/health`.
2. Trên Render, đặt `NODE_ENV=production`, `DATABASE_URL` bằng URL kết nối PostgreSQL và thiết lập `ADMIN_PASSWORD`, `CHECKOUT_SECRET`, `PAYMENT_WEBHOOK_SECRET` với các giá trị riêng. Thêm `ADMIN_USERNAME` nếu muốn đổi tên đăng nhập mặc định `admin`. Cổng `PORT` do Render cấp.
3. Trên Vercel, import cùng repo và chọn nhánh production `main`, Root Directory `frontend`, Framework Preset **Vite**. Thêm `RENDER_BACKEND_URL` cho môi trường Production, ví dụ `https://aura-api.onrender.com`, rồi deploy. `vercel.mjs` chuyển tiếp `/api/*` sang Render. Nếu chưa đặt biến này, Vercel chỉ phục vụ các tệp frontend.
4. Trên Render, đặt `APP_ORIGIN` bằng domain production trên Vercel (hoặc domain riêng), ví dụ `https://aura-studio.vercel.app`. Mở `/api/health` trên domain Vercel để kiểm tra kết nối, sau đó thử đăng nhập tại `/#/admin`.
5. Khi bật SePay, trỏ webhook thẳng đến `/api/payment/webhook` trên domain Render và dùng API Key khớp `PAYMENT_WEBHOOK_SECRET`. Cập nhật tài khoản nhận tiền trong admin trước khi nhận giao dịch của khách.

Render khởi tạo catalog mẫu khi dùng database mới. Đơn hàng, cấu hình ngân hàng và sản phẩm đã nhập trên máy local cần được chuyển riêng nếu muốn sử dụng trên production.

## Kiểm tra

```powershell
# frontend/
npm run build
npm run lint

# backend/: nghiệp vụ không cần DB
npm test

# backend/: 13 kiểm tra đầy đủ với PostgreSQL local của máy này
npm run test:local
```

`test:local` tạo/tái sử dụng database riêng `aura_studio_rework_test`, xóa dữ liệu kiểm thử trong database đó. Không tác động đơn hàng của database đang chạy. Trên máy khác, xem hướng dẫn trong tài liệu bản mới.

## Tài liệu

- [Bản rework: kiến trúc, quy tắc, kiểm thử và vận hành](docs/rework/README.md) — nguồn chính cho code hiện tại.
- [API mới](docs/rework/api.md).
- [Bản đồ dự án trước rework](docs/project/README.md) — mốc nghiên cứu.
- [Sổ tay 20 nguồn animation/video/3D/audio](docs/creative-toolkit/README.md).

Photobooth hiện là chọn concept và đặt lịch tại studio. Webcam, chụp/in ảnh, xuất GIF/video, hoàn tiền tự động và email xác nhận tự động chưa thuộc bản này. Ngân hàng thật cần cấu hình nhà cung cấp webhook và kiểm chứng riêng trước khi sử dụng với khách.
