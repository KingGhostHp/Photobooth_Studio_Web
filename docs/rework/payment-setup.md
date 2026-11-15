# Kết nối thanh toán thật khi phát triển local

Ngày chuẩn bị: 04/11/2026. Người dùng xác nhận **chưa cấu hình SePay/webhook**.
QR chuyển khoản và nút auto-confirm không tự tạo kết nối ngân hàng.

## Phần đã sẵn sàng ở repo

- Backend nhận POST `/api/payment/webhook`, xác thực bằng `Authorization: Apikey <PAYMENT_WEBHOOK_SECRET>`. Secret được cấu hình ở máy chủ, không lấy khóa mẫu cũ trong bảng `bank_configs` và không đưa secret vào frontend/Git/chat.
- `backend/scripts/webhook-gateway.cjs` là gateway dành riêng cho tunnel dev: chỉ chuyển tiếp đúng POST `/api/payment/webhook` tới backend `127.0.0.1:5000`, yêu cầu header xác thực và JSON, giới hạn body 64 KiB. Backend vẫn kiểm tra secret thật và nội dung giao dịch.
- Gateway chỉ bind `127.0.0.1:5002`, không chuyển tiếp admin/catalog/đường dẫn khác. Khởi động thủ công bằng `npm run payment:gateway` trong `backend/` nếu chưa có process.
- Phiên chuẩn bị này đã chạy gateway local; PID lưu trong `.local/webhook-gateway-process.json`, log riêng trong `.local/`. **Chưa mở tunnel/public URL**, chưa tạo webhook ở SePay, chưa xác nhận tiền hoặc sửa đơn thật.
- Test `npm run test:local`: **20/20 đạt** trong DB `_test` và server mock. Gateway local thật: route admin trả 404; thiếu key trả 401; key đúng + payload rỗng trả 400 từ backend trước khi ghi tiền.

## Phần chủ tài khoản thực hiện trên SePay

1. Đăng nhập/đăng ký tại [my.sepay.vn](https://my.sepay.vn/). Chọn Ngân hàng → Kết nối thêm → MB, đúng loại tài khoản. Chủ tài khoản tự nhập thông tin và OTP theo [hướng dẫn MB chính thức](https://docs.sepay.vn/ket-noi-mb-api.html); không gửi CCCD/OTP/đăng nhập ngân hàng qua chat.
2. Liên kết đúng tài khoản đang nhận QR của website. Nếu dùng tài khoản ảo VA khác, cần đối chiếu lại cấu hình và adapter trước khi test vì backend hiện so khớp `accountNumber` với tài khoản nhận đã lưu.
3. Sau khi có URL HTTPS public, tạo Webhook theo [hướng dẫn SePay](https://docs.sepay.vn/tich-hop-webhooks.html): sự kiện **Có tiền vào**, chọn đúng tài khoản; URL `<HTTPS_PUBLIC_ORIGIN>/api/payment/webhook`; xác thực **API Key**, giá trị lấy từ `PAYMENT_WEBHOOK_SECRET` trong cấu hình backend riêng. Adapter hiện không xác minh HMAC/OAuth của SePay.
4. Chưa đặt bộ lọc tiền tố cho tới khi chắc bộ lọc khớp nội dung `AURA AUR...` của dự án; không giữ bộ lọc ví dụ `SEV...` nếu nó loại giao dịch thực tế. Không đưa secret vào URL query.
5. Kiểm tra Nhật ký webhook. Response thành công theo SePay là HTTP 200/201 và JSON `success:true`. `401`: sai/thiếu key; `400`: xem payload/mã đơn/tài khoản; lỗi kết nối: xem tunnel/gateway/backend. Payload Gửi thử mặc định của SePay có thể không khớp đơn/tài khoản của dự án; không sửa nó thành giao dịch thanh toán giả cho một đơn thật. Nếu cần test thành công, dùng DB `_test` hoặc giao dịch thật đã được provider ghi nhận.

## Đường HTTPS tạm thời

[Cloudflare Quick Tunnel](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/) có thể đưa gateway local ra URL tạm để thử. Chỉ trỏ tới **5002**, không trỏ toàn backend 5000 hoặc frontend 5173.

Việc mở tunnel cần người dùng xác nhận trước vì đây là mở truy cập từ Internet tới endpoint thanh toán trên máy, thông qua Cloudflare. Lệnh tham khảo sau chỉ chạy khi đã được cho phép:

```powershell
cloudflared tunnel --url http://127.0.0.1:5002
```

Quick Tunnel dùng cho phát triển, URL thay đổi khi tạo tunnel mới và ngừng hoạt động khi tắt process; cần cập nhật URL trên SePay tương ứng. Production cần hostname ổn định và triển khai phù hợp. SePay là client máy chủ, không dùng cổng xác thực email tương tác của tunnel cho endpoint này.

## Khoản 2.000đ người dùng đã chuyển

Không yêu cầu chuyển thêm chỉ để bù việc chưa cấu hình. Sau khi liên kết, xem giao dịch cũ có trong SePay/ngân hàng hay không; không giả định SePay sẽ tự đồng bộ/gửi lại khoản phát sinh trước liên kết. Nếu provider có giao dịch đó, dùng cơ chế gửi lại **giao dịch thật cùng ID**, không tạo mã giao dịch giả.

Đơn giữ 15 phút. Callback thật tới sau hạn vẫn được ghi nhận tiền và đánh dấu cần studio đối soát, không tự xác nhận/chiếm lại lịch đã hết hạn. Có thể ghi nhận thủ công qua admin sau khi chủ tài khoản đối chiếu giao dịch thật, đúng mã đơn và số tiền; không tự đổi trạng thái chỉ theo báo cáo chuyển tiền hoặc chạy callback giả.
