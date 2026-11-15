# Ghi nhớ cho các lần làm việc sau

Repo gồm `frontend/` (React + Vite), `backend/` (Express + PostgreSQL).

**Sau rework 04/11/2026:** đọc [docs/rework/README.md](docs/rework/README.md)
và [API mới](docs/rework/api.md) trước. Checkout/auth/payment/analytics nằm ở
`backend/src/studio/`; frontend mới ở `frontend/src/studio/`.
`docs/project/` là mốc khảo sát trước rework. Không nối lại checkout cũ,
không dùng dữ liệu giả khi ghi DB lỗi. Test tạo đơn/payment phải chạy trong
database riêng kết thúc `_test`, không dùng DB đang vận hành.

Bản đồ code, luồng nghiệp vụ, 48 API và các vấn đề đã ghi nhận ở
[docs/project/README.md](docs/project/README.md). Đọc phần liên quan trước khi sửa;
đặc biệt checkout, thanh toán, tồn kho, lịch và analytics có logic liên kết nhiều file.

Kiến thức nghiên cứu animation/video/3D/audio được lưu tại
[docs/creative-toolkit/README.md](docs/creative-toolkit/README.md).
Khi làm tính năng liên quan, đọc ghi chú công cụ và kế hoạch Photobooth trong đó.
`sources.json` lưu commit nguồn; các đề xuất và ví dụ chưa được kiểm thử tích hợp.

Nghiên cứu này không cài toàn bộ toolkit. Đối chiếu dependencies và API hiện tại
trước khi triển khai. Ghi kết quả thử nghiệm mới vào tài liệu để tái sử dụng.

Nghiên cứu `vn-law-check`: [docs/research/vn-law-check.md](docs/research/vn-law-check.md).
Đọc khi được yêu cầu rà soát pháp lý/chính sách; ghi chú có commit nguồn và giới hạn
scanner/fetcher đã kiểm tra. Rà soát sơ bộ Aura ngày 04/11/2026 tại
[docs/compliance/2026-11-04/README.md](docs/compliance/2026-11-04/README.md):
Mốc audit ban đầu: 4 mục đỏ, 6 vàng, 5 xanh; chưa cài toolkit vào runtime.
Không xem báo cáo là kết luận pháp lý; đặc biệt không bỏ sót analytics tự viết hoặc
tự yêu cầu checkbox dữ liệu cho mọi hoạt động cần thiết để thực hiện thỏa thuận.

## Sửa kỹ thuật sau audit và phần studio bổ sung sau

Theo chỉ đạo người dùng: **studio sẽ cung cấp điều khoản/chính sách sau**. Dev sửa
phần kỹ thuật trước; không tự bịa tên pháp nhân, mã thuế, địa chỉ, điều kiện hủy/hoàn,
khấu trừ cọc, thời hạn lưu dữ liệu, nghĩa vụ giấy tờ hoặc tuyên bố tuân thủ pháp luật.
Chi tiết: [docs/compliance/2026-11-04/technical-fixes.md](docs/compliance/2026-11-04/technical-fixes.md).

- Analytics tùy chọn đã tắt: App không tạo UUID/gửi lượt truy cập, xóa key cũ
  `aura-visitor-v2`; POST `/api/analytics/track-visit` trả **410**, không ghi DB.
  Không bật lại tracking trước khi chốt mục đích, dữ liệu tối thiểu và lựa chọn phù hợp.
  Dashboard giữ số liệu cũ và ghi rõ tạm dừng; Excel chỉ xuất tổng lượt theo tháng,
  không xuất visitor ID/route/IP/user-agent. Không tự xóa log cũ hay đơn hàng.
- Font Be Vietnam Pro/Playfair Display phục vụ từ frontend qua Fontsource;
  không thêm lại Google Fonts từ CDN. Giữ các file OFL trong `frontend/public/licenses/`.
- `bookingAcknowledgement` là **xác nhận chi phí và 15 phút giữ chỗ hiện có**,
  không phải consent dữ liệu hay toàn bộ điều khoản studio. Quote trả version/text;
  checkout bắt buộc accepted boolean true và đúng version. Server lưu nội dung chuẩn
  + acceptedAt vào `orders.booking_acknowledgement`; đơn cũ để NULL, không tạo bằng chứng giả.
  Đổi ngày/ca/số lượng/dịch vụ làm bỏ chọn xác nhận để khách xem lại báo giá.
  Đổi nội dung phải tăng version trong `BOOKING_ACKNOWLEDGEMENT` ở `domain.js`.
- Khi studio cung cấp policy: thêm trang/link footer và form, dùng bản được studio
  chốt; lưu version/nội dung chấp thuận thích hợp tại server. Xác định căn cứ xử lý dữ liệu
  từng mục đích; không dùng xác nhận chi phí thay cho đồng ý dữ liệu/marketing.
- Cần studio xác nhận tiếp: thông tin đơn vị/đầu mối, hủy/đổi/hoàn/cọc, giá gồm thuế/phí,
  nơi deploy/nhà cung cấp, retention/quy trình quyền dữ liệu và ảnh/nội dung sản phẩm.
- Dependencies đã vá tại thời điểm sửa: audit npm frontend/backend **0 cảnh báo**.
  Backend SheetJS 0.20.3 từ CDN chính thức (npm registry cũ chỉ có 0.18.5);
  không đổi về bản npm cũ. Frontend không cần xlsx. Backend dev dùng `node --watch`
  thay nodemon; `qs` override 6.17.1 cần kiểm tra lại khi cập nhật Express.
- Kiểm chứng lần sửa: build/lint đạt, 16 test backend trong `_test`, 4 test ngày;
  kiểm tra UI đổi ngày bỏ chọn xác nhận, giỏ thử được dọn và không tạo đơn vận hành.

## Verify lại sau sửa

Kết quả mới nhất: [docs/compliance/2026-11-04/reverification.md](docs/compliance/2026-11-04/reverification.md).
Đã quét 25 file hiện tại, kiểm tra API thật (tracking 410, admin 401), 16/16 test
backend đạt trong `_test`, tải lại PDF Chính phủ để đối chiếu các điều liên quan.
Trong 15 mục gốc hiện là **3 đỏ, 6 vàng, 6 xanh**: tracking mới đã đóng về kỹ thuật;
ba nhóm chính sách dữ liệu, điều kiện dịch vụ/hủy/hoàn và thông tin đơn vị/khiếu nại
vẫn mở trước public. Studio bổ sung sau không đồng nghĩa các nhóm này đã đạt.
Khi có nội dung thật, dev vẫn cần tích hợp trang/link/luồng và lưu phiên bản thích hợp.
Log cũ, retention, vendor/hosting và hồ sơ ngoài code chưa được chốt; không tự xóa hoặc
tuyên bố tuân thủ đầy đủ. Không gộp xác nhận chi phí với đồng ý dữ liệu/điều khoản.

## Item thử thanh toán theo yêu cầu người dùng

Ngày 04/11/2026 đã tạo **một concept Photobooth trong DB đang chạy** bằng API admin:
`pb-test-payment-1000` (giữ ID cũ), hiện code `PB-TEST-2000`, tên `[TEST] Thanh toán 2.000đ`.
Ban đầu giá 1.000đ, sau đó người dùng yêu cầu tăng lên **2.000đ**; quote đã xác nhận
phải trả 2.000đ, cọc bảo đảm 0đ. Đơn đã tạo trước đổi giá giữ giá tại lúc đặt; không tự sửa đơn cũ. Đây là item thử do
người dùng yêu cầu, không phải gói dịch vụ chính thức. Chưa tạo đơn hay thực hiện
thanh toán trong thao tác tạo item; người dùng tự test bước đó. Không tự đưa vào seed,
đổi giá dịch vụ thật hoặc xóa item/đơn của người dùng khi chạy test tự động.

Người dùng đã báo chuyển tiền cho item 2.000đ ngày 04/11/2026. Lúc chẩn đoán,
đơn thử mới nhất còn AWAITING_PAYMENT, amount_paid=0, không có studio_payments
cho các đơn thử; auto-confirm đang bật và server có PAYMENT_WEBHOOK_SECRET.
Endpoint local đã kiểm tra: thiếu key trả 401; key đúng + payload rỗng trả 400 trước
khi ghi tiền. Test callback trong `_test` đạt. Chưa thấy tiến trình tunnel cục bộ;
chưa xác minh tài khoản ngân hàng đã kết nối SePay/nhà cung cấp và webhook public.
Không coi QR VietQR hoặc việc bật auto-confirm là đã kết nối ngân hàng; không tự
tạo callback giả/ghi tiền/xác nhận đơn thật để che lỗi. Cần xác minh delivery log
nhà cung cấp, URL public `/api/payment/webhook`, tài khoản nhận và API Key khớp
PAYMENT_WEBHOOK_SECRET. Giao dịch thật gửi lại sau hết hạn sẽ cần đối soát theo
luồng late-payment hiện có, không tự chiếm lại lịch đã hết hạn.

Người dùng sau đó xác nhận **chưa cấu hình SePay/webhook**. Đã chuẩn bị
[docs/rework/payment-setup.md](docs/rework/payment-setup.md) và gateway dev riêng
`backend/scripts/webhook-gateway.cjs`, chỉ POST `/api/payment/webhook` trên loopback
5002 rồi chuyển tới backend 5000; không đưa admin/catalog qua gateway. Đã chạy gateway
local (PID trong `.local/webhook-gateway-process.json`); **chưa mở tunnel/public URL**.
20/20 test đạt. Khi được người dùng cho phép mở public, trỏ tunnel tới **5002**, không
đưa toàn bộ 5000/5173 ra ngoài. Chủ tài khoản tự liên kết MB/OTP trên SePay; không tự
đăng ký/chấp nhận điều khoản/liên kết ngân hàng thay họ. Cấu hình SePay dùng API Key
khớp PAYMENT_WEBHOOK_SECRET và tài khoản nhận đúng; kiểm tra delivery log trước khi
yêu cầu chuyển tiền mới. Khoản cũ trước liên kết có được provider đồng bộ không chưa
xác minh; không tự tạo callback giả để xác nhận khoản đó.
