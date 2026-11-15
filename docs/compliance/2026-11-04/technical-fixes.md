# Sửa kỹ thuật sau rà soát — 04/11/2026

Người dùng yêu cầu sửa phần kỹ thuật trước; điều khoản/chính sách kinh doanh do studio bổ sung sau. Đây là nhật ký triển khai, không phải kết luận pháp lý mới.

## Đã triển khai

| Phần | Thay đổi |
| --- | --- |
| Thống kê | Bỏ timer và UUID ở `App.jsx`, dọn `aura-visitor-v2`. API cũ trả 410 và không lưu request vào `visitor_logs`, kể cả client cũ vẫn gửi. Không tạo một cơ chế tracking mới thay thế. |
| Báo cáo | Giữ lịch sử hiện có; ghi rõ dashboard đang tạm dừng lượt mới. Excel `Luot_truy_cap` chỉ gồm `month,total_visits`, bỏ visitor ID và route. Không tự xóa dữ liệu cũ khi chưa có lịch lưu. |
| Font | Be Vietnam Pro 400/500/600/700 và Playfair Display Variable thường/nghiêng được đóng gói bằng Fontsource 5.3.0. Bỏ link/preconnect Google Fonts; giữ license OFL trong `public/licenses/`. [Nguồn Fontsource](https://fontsource.org/fonts/be-vietnam-pro/use). |
| Xác nhận chi phí | Nội dung checkbox hiện có được cấp từ quote. POST checkout yêu cầu `{accepted:true,version:"booking-costs-v1"}`. Server lưu version/text chuẩn và thời điểm server, bỏ các giá trị text/thời điểm client tự gửi. Đơn cũ giữ NULL. |
| Báo giá thay đổi | Đổi ngày/ca/số ngày/số lượng/dịch vụ làm bỏ chọn xác nhận. Khóa xác nhận khi đang tính lại giá; server kiểm tra lại giá/tồn kho như trước. |
| Dependencies | Frontend bỏ xlsx không được import; cập nhật Vite/source-map-js. Backend vá dependencies, dùng nodemailer 10.3.1, SheetJS 0.20.3 theo [nguồn cài đặt chính thức](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/). Dev dùng `node --watch`, bỏ nodemon; override qs 6.17.1 vì nhánh Express hiện tại còn kéo phiên bản cũ. Hai lockfile lưu phiên bản/integrity. |

`bookingAcknowledgement` chỉ là bằng chứng kỹ thuật về chi phí/giữ chỗ, chưa phải đồng ý chính sách bảo mật hay điều khoản chưa được studio cung cấp. Không gắn nhãn consent dữ liệu cho bản ghi này.

## Kiểm chứng

- Frontend build và lint các file thay đổi đạt; 4/4 test ngày đạt.
- Backend **16/16 test đạt**, chạy trên `aura_studio_rework_test`, không tạo đơn/payment vào DB vận hành.
- Test mới kiểm tra thiếu xác nhận, false, chuỗi `"true"`, version cũ bị từ chối trước khi ghi đơn; quote trả nội dung chuẩn; client không sửa được text/thời điểm lưu; retry giữ nguyên biên nhận.
- Test analytics kiểm tra API trả 410 và số lượt không tăng; tạo lịch sử mẫu trong DB test rồi đọc Excel, chỉ còn tổng theo tháng, không chứa định danh/route.
- `npm audit` frontend và backend: **0 cảnh báo tại thời điểm kiểm tra**. Đây là kết quả của cơ sở advisory hiện tại, không phải cam kết không có lỗi bảo mật khác.
- Bản chạy tại 5173/5000 đã khởi động lại. UI tải font nội bộ, không còn link Google Fonts; chọn lại ngày làm checkbox về chưa chọn sau khi báo giá tải xong. Dọn mục giỏ thử, không nhập thông tin khách hay tạo đơn thật.

## Studio cung cấp sau

Thông tin đơn vị/địa chỉ/đầu mối; policy dữ liệu và thời hạn lưu; điều kiện hủy/đổi/hoàn/cọc/khấu trừ; thuế/phí; hosting và các bên xử lý; xác minh ảnh/tên sản phẩm. Thêm link công khai và lưu các phiên bản chấp thuận phù hợp sau khi nội dung được chốt. Không tự hứa hoàn tiền, xóa chứng từ, hoặc ghi nhận người dùng đã đồng ý với điều khoản chưa tồn tại.

Audit ban đầu vẫn được giữ ở [README](README.md) để truy nguyên bằng chứng trước sửa. Mục 🔴2 đã được xử lý bằng dừng thu thập mới; mục 🟡2/3 được cải thiện phần kỹ thuật, còn chính sách/nghiệp vụ để studio xác nhận.

![Kiểm tra checkout sau đổi ngày, chưa nhập dữ liệu khách](D:/Downloads/his/Photobooth_Studio_Web/docs/compliance/2026-11-04/technical-fixes-checkout.png)
