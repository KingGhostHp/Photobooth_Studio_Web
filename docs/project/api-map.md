# Bản đồ API hiện tại

[Về bản đồ dự án](README.md). Ngày đọc: 04/11/2026. Danh sách sinh từ các lời đăng ký route trong `backend/src/server.js`; đây là inventory của code, không khẳng định mọi endpoint đã được chạy thử.

## Quy ước hiện tại

- Phần lớn response dùng `{ success, data, message/error }`; health dùng `{ status, message, dbTime }`, export trả file XLSX.
- GET danh sách thường ánh xạ snake_case trong PostgreSQL sang camelCase. Nhiều response ghi trả trực tiếp `RETURNING *` nên shape khác GET; cần đọc handler cụ thể.
- Chưa thấy middleware xác thực/phân quyền trong server hiện tại. Tên admin hay vị trí trên giao diện không tạo ra giới hạn quyền ở API.

## Route đăng ký

| Method | Endpoint | Dòng khai báo |
| --- | --- | --- |
| GET | `/api/health` | [server.js:19](../../backend/src/server.js#L19) |
| GET | `/api/categories` | [server.js:37](../../backend/src/server.js#L37) |
| GET | `/api/categories/:id` | [server.js:55](../../backend/src/server.js#L55) |
| POST | `/api/categories` | [server.js:80](../../backend/src/server.js#L80) |
| PUT | `/api/categories/:id` | [server.js:105](../../backend/src/server.js#L105) |
| DELETE | `/api/categories/:id` | [server.js:138](../../backend/src/server.js#L138) |
| GET | `/api/costumes` | [server.js:157](../../backend/src/server.js#L157) |
| GET | `/api/costumes/:id` | [server.js:183](../../backend/src/server.js#L183) |
| POST | `/api/costumes` | [server.js:216](../../backend/src/server.js#L216) |
| PUT | `/api/costumes/:id` | [server.js:239](../../backend/src/server.js#L239) |
| PUT | `/api/costumes/:id/status` | [server.js:278](../../backend/src/server.js#L278) |
| DELETE | `/api/costumes/:id` | [server.js:290](../../backend/src/server.js#L290) |
| GET | `/api/orders` | [server.js:449](../../backend/src/server.js#L449) |
| POST | `/api/costumes/check-conflict` | [server.js:484](../../backend/src/server.js#L484) |
| GET | `/api/orders/booked-slots` | [server.js:495](../../backend/src/server.js#L495) |
| GET | `/api/orders/lookup` | [server.js:517](../../backend/src/server.js#L517) |
| PUT | `/api/orders/:id/confirm-return` | [server.js:567](../../backend/src/server.js#L567) |
| POST | `/api/orders` | [server.js:593](../../backend/src/server.js#L593) |
| PUT | `/api/orders/:id` | [server.js:757](../../backend/src/server.js#L757) |
| DELETE | `/api/orders/:id` | [server.js:837](../../backend/src/server.js#L837) |
| GET | `/api/admin/stats` | [server.js:851](../../backend/src/server.js#L851) |
| GET | `/api/banners` | [server.js:879](../../backend/src/server.js#L879) |
| POST | `/api/banners` | [server.js:909](../../backend/src/server.js#L909) |
| PUT | `/api/banners/:id` | [server.js:939](../../backend/src/server.js#L939) |
| PATCH | `/api/banners/:id/toggle` | [server.js:972](../../backend/src/server.js#L972) |
| DELETE | `/api/banners/:id` | [server.js:986](../../backend/src/server.js#L986) |
| GET | `/api/packages` | [server.js:1005](../../backend/src/server.js#L1005) |
| POST | `/api/packages` | [server.js:1029](../../backend/src/server.js#L1029) |
| PUT | `/api/packages/:id` | [server.js:1053](../../backend/src/server.js#L1053) |
| DELETE | `/api/packages/:id` | [server.js:1088](../../backend/src/server.js#L1088) |
| GET | `/api/addons` | [server.js:1107](../../backend/src/server.js#L1107) |
| POST | `/api/addons` | [server.js:1122](../../backend/src/server.js#L1122) |
| PUT | `/api/addons/:id` | [server.js:1134](../../backend/src/server.js#L1134) |
| DELETE | `/api/addons/:id` | [server.js:1152](../../backend/src/server.js#L1152) |
| GET | `/api/photobooth` | [server.js:1171](../../backend/src/server.js#L1171) |
| POST | `/api/photobooth` | [server.js:1195](../../backend/src/server.js#L1195) |
| PUT | `/api/photobooth/:id` | [server.js:1220](../../backend/src/server.js#L1220) |
| DELETE | `/api/photobooth/:id` | [server.js:1248](../../backend/src/server.js#L1248) |
| POST | `/api/analytics/track-visit` | [server.js:1268](../../backend/src/server.js#L1268) |
| GET | `/api/analytics/summary` | [server.js:1312](../../backend/src/server.js#L1312) |
| POST | `/api/analytics/save-snapshot` | [server.js:1414](../../backend/src/server.js#L1414) |
| GET | `/api/analytics/export-excel` | [server.js:1483](../../backend/src/server.js#L1483) |
| GET | `/api/payment/bank-config` | [server.js:1573](../../backend/src/server.js#L1573) |
| PUT | `/api/payment/bank-config` | [server.js:1616](../../backend/src/server.js#L1616) |
| POST | `/api/payment/webhook` | [server.js:1642](../../backend/src/server.js#L1642) |
| GET | `/api/payment/check-status/:orderId` | [server.js:1768](../../backend/src/server.js#L1768) |
| POST | `/api/payment/simulate-webhook` | [server.js:1791](../../backend/src/server.js#L1791) |
| GET | `/api/payment/webhook-logs` | [server.js:1859](../../backend/src/server.js#L1859) |

## Side effect dễ bỏ sót

- `POST /api/costumes/check-conflict`: helper có thể DELETE đơn PENDING quá 10 phút.
- `POST /api/orders`: có thể gọi cùng helper dọn đơn; tạo đơn xong có thể gửi email ngay.
- `GET /api/analytics/export-excel`: cập nhật `last_exported_at` trong database.
- `POST /api/payment/simulate-webhook`: thật sự sửa trạng thái đơn và ghi log trong database, không chỉ trả bản preview.
- Các request đến frontend `/api` được Vite proxy khi dev và NGINX proxy khi chạy Docker.

## Mức kiểm tra lần này

Đã gọi health và sáu GET danh sách: categories, costumes, packages, addons, photobooth, banners; đều trả thành công ở môi trường local. Không gọi endpoint tạo/sửa/xóa đơn, webhook, gửi mail, snapshot hoặc export. Chi tiết business flow và rủi ro có căn cứ ở [ghi chú nghiệp vụ](findings.md).
