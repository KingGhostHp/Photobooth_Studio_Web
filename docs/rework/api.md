# API bản rework

Prefix `/api`; JSON mặc định. Lỗi mới `{success:false,message}`. Tiền VND nguyên. Admin yêu cầu cookie phiên; trình duyệt tự gửi qua frontend cùng origin.

| Method/path | Quyền | Ghi chú |
| --- | --- | --- |
| GET `/auth/session` | Public | authenticated/configured, không credential |
| POST `/auth/login` | Public | username/password, cookie 12h |
| POST `/auth/logout` | Public | Vô hiệu hóa phiên |
| GET `/costumes`, `/categories`, `/packages`, `/addons`, `/photobooth`, `/banners` | Public | Catalog; banners?all=true chỉ admin |
| GET `/availability?date=YYYY-MM-DD&resource=studio` | Public | studio/photobooth, ca đã qua bị khóa |
| POST `/checkout/quote` | Public | Báo giá + tồn kho/lịch |
| POST `/checkout` | Public | Quote + customer + requestId; trả data/checkoutToken |
| GET `/checkout/:id` | Token | Header X-Checkout-Token |
| POST `/checkout/:id/cancel` | Token | Chưa nhận tiền; giữ lịch sử |
| POST `/lookup` | Public | id + phone khớp cả hai |
| GET `/payment/bank-config` | Public | Không có secret |
| PUT `/payment/bank-config` | Admin | Validate ngân hàng/tài khoản/template/ảnh QR/auto-confirm |
| POST `/payment/webhook` | Secret | Authorization Apikey hoặc Bearer |
| GET `/admin/orders` | Admin | 500 đơn mới nhất, không trả token hash |
| PATCH `/admin/orders/:id` | Admin | bookingStatus, penaltyFee, notes, assignedPhotographer, assignedMakeup |
| POST `/admin/orders/:id/payment` | Admin | amount, transactionId duy nhất; retry không cộng lại |
| POST `/analytics/track-visit` | Public | 410, đã tắt thu thập mới; không lưu request |
| GET `/analytics/summary` | Admin | Dữ liệu thực/sáu tháng |
| POST `/analytics/save-snapshot` | Admin | month/customNotes, ghi snapshot rõ ràng |
| GET `/analytics/export-excel` | Admin | xlsx, không tạo snapshot |

CRUD catalog/CMS cũ trong `server.js` vẫn phục vụ form quản trị, được bảo vệ chung. POST/PUT đơn cũ và simulate-webhook trả 410. Không nối lại các component checkout/admin orders cũ.

## Quote/checkout

### Ảnh trang phục

`GET /api/costumes` và `GET /api/costumes/:id` trả `image` (ảnh đại diện) và `images` (danh sách có thứ tự). POST/PUT nhận `images: ["/images/a.png", "/images/b.png"]`; ảnh đầu tiên luôn là `image`. Từ 1–10 ảnh, loại trùng/trim, tối đa 2.000.000 ký tự mỗi ảnh; nhận đường dẫn nội bộ, URL http/https, hoặc data URL JPEG/PNG/WEBP. Danh sách rỗng/sai định dạng/vượt giới hạn trả 400 và không ghi thay đổi.

Client cũ chỉ gửi `image` vẫn được hỗ trợ; PUT `image` thay ảnh đầu và giữ ảnh còn lại. PUT không gửi ảnh giữ nguyên gallery. Dữ liệu cũ chỉ có `image` được chuyển thành gallery một ảnh; migration không xóa ảnh. CRUD ảnh yêu cầu phiên admin; hai GET là public.

### Payload đặt lịch

```json
{
  "date":"2026-11-10",
  "days":3,
  "slot":"",
  "items":[{"type":"costume","id":"AD-101","size":"M","quantity":2}]
}
```

Checkout thêm `customer:{name,phone,email?,notes?}`, requestId UUID và `bookingAcknowledgement:{accepted:true,version}`. Quote trả `bookingAcknowledgement:{version,text}`; client lấy version tại đó. Thiếu/không phải boolean true trả 400, version cũ trả 409. Server lưu version/text chuẩn + acceptedAt vào `orders.booking_acknowledgement`, serialize trả lại cùng đơn; đơn cũ NULL. Đây chỉ là xác nhận chi phí/giữ chỗ, chưa đại diện điều khoản hay consent dữ liệu. Package dùng `people,addons:[id]`; Photobooth dùng type/id. Có gói/Photobooth phải chọn ca; tối đa một dịch vụ có ca/đơn.

Excel `Luot_truy_cap` chỉ xuất tổng theo tháng (`month,total_visits`), không xuất visitor ID/route/IP/UA. Lịch sử DB không tự bị xóa; dashboard ghi rõ ngừng thu thập lượt mới.

Quote trả lines/date/endDate/days/slot/resource/serviceTotal/securityDeposit/advance/dueNow/totalPayable. Không tin tổng tiền, tên, giá hay trạng thái từ client.

## Webhook

```json
{
  "id":"provider-unique-transaction-id",
  "transferType":"in",
  "transferAmount":500000,
  "accountNumber":"configured-receiving-account",
  "content":"AURA AUR20261104ABCDEF12"
}
```

Adapter hiện theo payload dạng SePay, không tự tương thích schema/chữ ký PayOS/Casso. Đổi nhà cung cấp cần adapter xác minh riêng. Dùng HTTPS và cấu hình origin/domain đúng khi triển khai ngoài local.
