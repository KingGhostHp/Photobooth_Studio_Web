# Aura Studio — ghi chú bản rework

Ngày: 04/11/2026. Đây là tài liệu phiên bản hiện tại; `docs/project/` là khảo sát trước rework.

## Hướng sản phẩm

Giữ React vì dự án đã dùng React 19. Xây mới storefront và khung quản trị, tách nghiệp vụ nhạy cảm khỏi file server lớn.

- Màu kem/mực/đất nung, chữ Be Vietnam Pro và Playfair Display; ảnh cổ phục, áo dài và vest có sẵn trong repo.
- Trang chủ editorial, catalog tìm kiếm/lọc/sắp xếp, xem chi tiết/chọn size/số lượng, gói chụp/người/addon, chọn concept Photobooth, lookbook và tra cứu mã đơn + điện thoại.
- Banner đang bật xuất hiện ở Studio Notes; hero có hình ảnh riêng. Anchor banner cũ chuyển sang route dịch vụ phù hợp.
- Giỏ lưu trên thiết bị; báo giá, lịch trống, tiền cọc và thời gian giữ chỗ rõ ràng trước khi tạo đơn.
- Quản trị: đăng nhập, tổng quan, đơn hàng/ghi nhận tiền, lịch Studio/Photobooth riêng, lưu phân công ekip, kho/danh mục, giá, concept, banner và tài khoản nhận tiền.
- Các màn hình CMS/kho cũ được giữ và điều chỉnh. Đã bỏ fallback giả thành công khi kho không lưu được; request CMS lỗi phải báo lỗi.
- Motion chỉ dùng opacity/transform nhẹ. Tôn trọng reduced motion, có focus rõ, skip link, dialog hỗ trợ Escape và giữ focus.

## Bản đồ code

| Khu vực | File |
| --- | --- |
| Màn hình, route hash, giỏ, catalog | `frontend/src/App.jsx` |
| Trang khách, chọn sản phẩm/gói | `frontend/src/studio/Storefront.jsx` |
| Quote, đặt đơn, QR, polling, resume | `frontend/src/studio/Checkout.jsx` |
| Quản trị, báo cáo, ghi nhận tiền | `frontend/src/studio/Admin.jsx` |
| Theme admin gọn, sidebar thu/mở và bảng kho | `frontend/src/studio/admin.css` |
| Lịch, lưu phân công | `frontend/src/studio/Calendar.jsx` |
| Thành phần dùng chung/theme | `frontend/src/studio/UI.jsx`, `studio.css`, `api.js` |
| Migration, checkout, khóa tài nguyên, payment | `backend/src/studio/index.js` |
| Tính tiền/validation | `backend/src/studio/domain.js` |
| Phiên quản trị/kiểm tra nguồn request | `backend/src/studio/auth.js` |
| Báo cáo, lượt truy cập, Excel | `backend/src/studio/analytics.js` |
| Catalog/CMS tương thích | `backend/src/server.js`, `frontend/src/components/admin/` |

`LegacyApp.jsx` và component khách cũ chỉ để tham khảo, không import vào entry hiện tại. Endpoint đặt đơn/thanh toán cũ không còn là đường hoạt động.

## Giá và tồn kho

| Dịch vụ | Chi phí | Khoản giữ chỗ |
| --- | --- | --- |
| Trang phục | giá/ngày × số ngày × số lượng | cọc bảo đảm × số lượng; không nhân ngày |
| Gói chụp | giá/người × số người + addon một lần | cọc cấu hình, hoặc 30%; không vượt giá gói |
| Photobooth | giá concept | toàn bộ nếu ≤200.000đ; nếu cao hơn thì 50% |

Cọc bảo đảm tách khỏi doanh thu dịch vụ. Tổng phải thanh toán = dịch vụ + cọc bảo đảm + phụ phí. Phần dịch vụ còn lại trả khi đến studio. Đơn thuần trang phục cần cọc bảo đảm >0; dịch vụ giá 0 không nhận checkout tự động.

`includedPeople` được hiểu là **số người tối thiểu** của gói, phù hợp giá/người hiện có. Nếu đổi sang gói trọn nhóm phải sửa admin, giao diện và domain cùng lúc. Addon tính một lần/đơn gói.

Kho có tổng số lượng theo SKU, chưa có số lượng từng size. Hai size khác nhau vẫn được cộng khi kiểm tra số lượng cùng SKU.

## Đặt lịch và dữ liệu

1. Quote lấy giá từ DB, bỏ qua tổng tiền/trạng thái từ client.
2. Checkout kiểm tra lại trong transaction; khóa PostgreSQL theo SKU và phòng/ngày/ca theo thứ tự ổn định. Không tạo hai đơn cùng chiếm chỗ.
3. Kho dùng khoảng nửa mở `[ngày nhận, ngày trả)`; đơn kế tiếp có thể nhận đúng ngày trả của đơn trước. Mỗi đơn có tối đa một dịch vụ có ca.
4. Studio và Photobooth là hai tài nguyên độc lập, mỗi nơi sáu ca; chưa mô hình thời lượng khác nhau từng gói.
5. Giữ 15 phút theo server. Query lịch/kho loại giữ chỗ hết hạn dù chưa có tác vụ nền đổi trạng thái DB.
6. `requestId` chống tạo đơn hai lần khi retry; cùng mã/payload trả cùng đơn, payload khác bị từ chối.
7. Token checkout lưu dạng hash; trình duyệt giữ token để tiếp tục thanh toán. Không trả hash/secret trong danh sách đơn.
8. Chỉ hủy giữ chỗ chưa nhận tiền; giữ lịch sử. Không mở lại đơn đã đóng; cần đặt mới sau khi kiểm tra lịch.

Migration thêm `line_items`, `security_deposit`, `amount_paid`, `resource_id`, `expires_at`, trường idempotency/token, index và `studio_payments`. Không xóa bảng/đơn cũ. Đơn hệ thống cũ thiếu dòng hàng/biên nhận tiền cần đối soát; không suy đoán đã nhận tiền từ nhãn trạng thái cũ.

## Thanh toán và quản trị

- Ba secret độc lập: `ADMIN_PASSWORD`, `CHECKOUT_SECRET`, `PAYMENT_WEBHOOK_SECRET`. `.local/backend.env` và `.local/admin-access.txt` được ignore.
- Cookie phiên 12 giờ HttpOnly/SameSite Strict. Đăng xuất hoặc restart backend làm hết phiên. Hiện một tài khoản quản trị, chưa có phân quyền nhiều nhân viên.
- `APP_ORIGIN` cấu hình frontend được chấp nhận khi qua proxy. Dev mặc định 127.0.0.1/localhost:5173; production cấu hình đúng origin. Chặn cross-site; giới hạn thử đăng nhập và quote/checkout/lookup.
- Webhook dùng `Authorization: Apikey <PAYMENT_WEBHOOK_SECRET>` hoặc Bearer. Kiểm tra tiền vào, đúng tài khoản, số tiền dương, ID giao dịch ổn định và mã đơn đầy đủ.
- QR dùng nội dung `AURA AURYYYYMMDDXXXXXXXX` để tránh dấu đặc biệt. Parser nhận cả dạng liền và `AUR-YYYYMMDD-XXXXXXXX`, chuẩn hóa về mã DB. Nội dung nhiều mã khác nhau bị từ chối.
- Khóa mã giao dịch + đơn hàng; cộng mỗi giao dịch đúng một lần. Callback muộn/đơn hủy/hoàn tất/tắt auto-confirm được lưu và đánh dấu kiểm tra; không chiếm lại lịch hết hạn.
- Khi tắt auto-confirm, admin kiểm tra tiền đã ghi nhận rồi xác nhận trạng thái; không nhập cùng tiền thành giao dịch mới.
- Ghi nhận thủ công là ghi sổ nội bộ, không chuyển tiền ngân hàng. Cần đối chiếu giao dịch thật.
- Chế độ QR động dùng [VietQR qua SePay](https://developer.sepay.vn/vi/tien-ich-khac/tao-qr-code) tại `vietqr.app/img`, gửi số tài khoản đã cấu hình, mã BIN, khoản giữ chỗ còn thiếu và nội dung đơn. Chế độ ảnh QR riêng vẫn dùng ảnh đã tải. QR lỗi vẫn có thông tin chuyển khoản thủ công.
- Không gửi email khi vừa giữ chỗ. Chưa có outbox/email sau thanh toán, refund/hoàn cọc tự động. Cọc trong báo cáo là số đã nhận theo đơn hiệu lực, chưa phải sổ công nợ hoàn cọc.

Compose đã bỏ credential SMTP viết cứng trong file cũ. Nếu credential đó từng dùng thật, cần thay ở nhà cung cấp email; xóa khỏi file hiện tại không xóa lịch sử Git.

## Báo cáo

Doanh thu = `max(0, min(tiền nhận - cọc bảo đảm, phí dịch vụ + phụ phí))`, bỏ đơn hủy/hết hạn, không nhân phụ phí hai lần. Biểu đồ theo **tháng sử dụng dịch vụ**, sáu tháng gần nhất; chưa phải báo cáo kế toán theo ngày thu tiền. Tổng tiền đã nhận vẫn có trong dữ liệu để đối chiếu giao dịch cần kiểm tra.

Sau audit 04/11/2026, thu thập lượt truy cập mới đã tắt ở frontend và API (410).
Chỉ giữ báo cáo lịch sử, không tính seed `VISIT-%` hay summary giả cũ. Excel gồm tổng
quan, đơn hàng, giao dịch và **tổng lượt truy cập theo tháng**, không có định danh/route.
GET export không ghi snapshot DB. Dashboard ghi rõ dữ liệu cũ, ngừng ghi lượt mới.

## Kiểm chứng

- Frontend build thành công; JS khách khoảng 374 KB (119 KB gzip), admin/CMS tải riêng.
- `oxlint src/App.jsx src/studio`: không cảnh báo. Lint toàn repo hoàn tất nhưng code cũ còn cảnh báo unused/hooks.
- **13/13 test pass** với PostgreSQL riêng: ngày VN, giá/size/số lượng, tamper, idempotency, đặt đồng thời, phòng độc lập, auth/CSRF/logout, lookup, callback lặp/muộn, auto-confirm tắt, ekip/phụ phí, lượt truy cập và Excel.
- Trình duyệt: trang chủ, catalog/empty state/size/số lượng, báo giá 2 bộ ×3 ngày, đăng nhập, dashboard, quản trị và desktop/mobile. Ảnh trong `screenshots/`.
- Không tạo đơn thử vào database vận hành. Kiểm tra tạo đơn/payment dùng `_test`.
- Chưa xác minh ngân hàng/webhook nhà cung cấp thật, SMTP, camera/in ảnh hay chạy Docker.

Trong backend, `npm test` chạy unit và skip integration nếu thiếu `TEST_DATABASE_URL`. Máy này dùng `npm run test:local`, tự tạo/tái sử dụng `aura_studio_rework_test`. Máy khác cần `TEST_DATABASE_URL` kết thúc `_test`, `DATABASE_URL` tương ứng và secret thử nghiệm. Test xóa dữ liệu nghiệp vụ trong DB thử; không trỏ DB dùng cho khách.

## Áp dụng nghiên cứu 20 nguồn

Nguồn/commit trong `docs/creative-toolkit/`. Bản này dùng Motion và reduced motion theo [accessibility chính thức](https://motion.dev/docs/react-accessibility).

Remotion/FFmpeg dành cho xuất clip; Three.js/postprocessing/quarks dành cho preview/VFX; Lottie dành cho asset vector riêng. Chưa có nội dung video/3D nên không đưa cả toolkit vào runtime đặt lịch. Khi bổ sung, đọc lại đúng tài liệu/API và điều kiện giấy phép, đặc biệt Remotion theo mô hình sử dụng.

## Phát triển tiếp

1. Kiểm chứng ngân hàng/template QR, quy trình hoàn cọc/hoàn tiền, email sau xác nhận bằng outbox.
2. Phân trang đơn/báo cáo; hiện admin tối đa 500 đơn mới nhất. Chuyển ảnh base64 sang object storage khi dữ liệu lớn.
3. Nhân sự/giờ làm thật, tồn kho từng size, nhiều phòng và thời lượng gói.
4. Photobooth trực tiếp: xin quyền webcam, preview canvas, lưu strip, sau đó GIF/video bằng toolkit đã nghiên cứu. Hiện vẫn là chọn concept và đặt lịch studio.


## Điều chỉnh mật độ admin theo phản hồi sử dụng

- Theme riêng `frontend/src/studio/admin.css`, chỉ áp dụng dưới `.admin-shell`.
- Bỏ lời giới thiệu/tiêu đề trùng, thẻ workspace và footer trang trí. Thanh trên cao 48px; nút PC khoảng 32px, ô nhập 34px. Giữ cỡ chữ đọc được thay vì thu nhỏ toàn bộ giao diện.
- Sidebar mở 220px, thu gọn còn 64px bằng nút góc trái thanh trên. Biểu tượng giữ tên truy cập và tooltip. Trạng thái sidebar và mục đang xem được lưu trên thiết bị.
- Danh sách menu có vùng cuộn độc lập (`flex:1`, `min-height:0`, `overflow-y:auto`); logo và đăng xuất luôn nằm ngoài vùng cuộn. Đã kiểm tra ở màn hình 1366×360: menu cuộn 139px mà trang nội dung không cuộn theo.
- Điện thoại dùng menu kéo phủ, có nút đóng, đóng khi chọn mục/Escape và trả focus về nút menu. Menu đóng được ẩn khỏi điều hướng bàn phím. Không dùng chuyển động mở menu để thao tác nhanh, ổn định.
- Kho chuyển từ thẻ ảnh lớn sang bảng: ảnh nhỏ, mã/tên, danh mục/size, giá, cọc, số lượng, trạng thái và sửa/xóa. Tìm kiếm lọc trước phân trang, tối đa 10 dòng/trang. Danh mục cũng dùng bảng. Giá trị tồn kho bằng 0 được hiển thị đúng.
- Preview concept thu vào phần mở theo yêu cầu; ảnh banner/bảng giá giảm chiều cao. Nút Làm mới chung tải lại dữ liệu của phân hệ hiện tại, giữ các lựa chọn giao diện.
- Đo trên catalog mẫu tại 1366×768: kho trước chỉnh cao 2603px; sau chỉnh, trang 10 dòng cao 768px (vừa viewport), không cần cuộn trang. Dashboard, lịch, concept, giá và banner cũng vừa viewport với dữ liệu hiện có. Đơn/dữ liệu tăng vẫn có thể cần cuộn hoặc phân trang.
- Đã thử tìm kiếm, trang 2, mở/hủy biểu mẫu sửa, thu/mở và lưu menu sau reload, menu trên màn hình thấp và điện thoại. Không ghi thay đổi nghiệp vụ trong quá trình kiểm tra giao diện.


## Hiệu ứng checkout drawer

Checkout được bọc trong `AnimatePresence` ở `App.jsx`; `Modal` dùng `motion.dialog` để trượt từ phải vào 320ms, ra 220ms. Backdrop native mờ vào/ra bằng CSS. Component chỉ unmount sau exit nên focus trap và khóa cuộn giữ nguyên suốt chuyển động; sau đó khôi phục cuộn và focus về nút đã mở.

Đóng bằng X, Escape, bấm backdrop và các nút đóng trong checkout đều đi qua cùng exit animation. Tôn trọng `prefers-reduced-motion`; không dùng thời gian chờ cố định để giả lập unmount. Đã kiểm tra ba đường đóng, mở lại nhiều lần, focus/scroll lock và viewport điện thoại 390×844. Không tạo đơn hay thay đổi dữ liệu giỏ trong lượt kiểm tra này.


Sửa lệch nền khi mở checkout: `scrollbar-gutter: stable` ở root giữ nguyên khoảng thanh cuộn khi khóa body, tránh nới nền 8px. Backdrop checkout bỏ blur, chỉ phủ tối nhẹ; các dialog khác giữ theme riêng. Đã đo trước/mở/đóng: vị trí và kích thước hero/ảnh không đổi (độ lệch 0px) tại viewport 1280px.

## Dropdown khách và số lượng trang phục

- `Dropdown.jsx` dùng chung cho số lượng, số ngày thuê và hai bộ lọc catalog. Menu được vẽ theo theme, dấu tick ở lựa chọn hiện tại, hiệu ứng nhẹ và reduced motion. Native Popover đưa menu lên trên dialog, tránh bị cắt bởi vùng cuộn; tự chọn hướng mở theo chỗ trống, cuộn trong danh sách dài, đóng khi bấm ngoài/cuộn trang/đổi kích thước.
- Hỗ trợ combobox/listbox, mũi tên, Home/End, Enter/Space, gõ tìm, Tab và Escape. Escape đóng menu trước, giữ nguyên dialog.
- Số lượng chỉ hiện 1, 2, 3 theo tồn kho; có `Khác` khi còn hơn 3 bộ. Chọn Khác thu dropdown còn khoảng 43%, hiện ô số bên cạnh và tự focus. Quay về 1–3 sẽ ẩn ô nhập và mở rộng dropdown.
- Ô khác nhận số nguyên từ 4 tới `min(tồn kho, 20)`, khớp giới hạn backend. Trống, lẻ, âm hoặc vượt giới hạn sẽ khóa nút thêm giỏ; giỏ nhận giá trị số thay vì chuỗi. Không thay đổi quy tắc tồn kho theo ngày.
- Đã kiểm tra desktop và mobile 390×844: menu, bàn phím/Escape, bấm ngoài, số lượng vượt tồn kho, chuyển Khác về 2 bộ, thêm 5 bộ vào giỏ và chọn 30 ngày thuê. Dọn mục thử sau kiểm tra, không tạo đơn. Build và lint các file thay đổi thành công. Ảnh `screenshots/quantity-dropdown.png`, `quantity-custom.png`, `quantity-custom-mobile.png`.

### Sửa ảnh bị zoom khi chọn Khác

Ảnh chi tiết trước đây dùng `height: 100%` theo chiều cao hàng grid. Khi thêm dòng hướng dẫn Khác, ảnh giày tăng từ 527,89px lên 551,19px; `object-fit: cover` khiến phần ảnh nhìn như phóng lớn. Đây là lỗi bố cục trong bản dropdown đầu tiên.

Ảnh desktop nay có tỷ lệ 4:5, `height: auto`, `align-self: start`, độc lập với chiều cao nội dung. Cột grid dùng `minmax(0, 1fr)` và `min-width: 0` để ô nhập không làm nở cột. Vùng hướng dẫn giữ chỗ, chỉ hiện khi chọn Khác; focus ô số dùng `preventScroll` để tránh kéo dialog.

Đã chuyển lặp 1/2/3/Khác trên ảnh giày và vest. Ở desktop, ảnh luôn 410×512,5px; với chuột trực tiếp, vị trí x/y, kích thước ảnh và vị trí cuộn trước/sau Khác không đổi (0px). Mobile 390×844: ảnh luôn 298×280px, tổng chiều cao phần chi tiết không đổi, không tràn ngang. Build và lint thành công. Ảnh sau sửa: `screenshots/quantity-image-stable.png`.

### Popup trang phục thích ứng kích thước màn hình

- `Modal` nhận thêm `className`; chỉ popup trang phục dùng `.product-dialog`. Bố cục mới có thanh tiêu đề/nút đóng và thanh thêm giỏ luôn ở ngoài vùng cuộn. `.product-detail` cuộn riêng, giới hạn chiều cao theo `100dvh`, giữ khoảng cách mép màn hình và padding theo kích thước viewport; footer có safe area.
- Popup rộng tối đa 960px, hai cột khi rộng hơn 760px; từ 760px trở xuống dùng một cột. Màn hình thấp giảm khoảng cách, ảnh desktop tự giới hạn chiều cao và dùng contain; ảnh không phụ thuộc số lượng/Khác. Không thu nhỏ toàn bộ giao diện hoặc thay đổi logic thêm giỏ. Dropdown vẫn dùng popover phía trên vùng cuộn.
- Đã đo 16 viewport: 2560×1440, 1920×1080, 1366×768, 1280×720, 1024×600, 1024×768, 768×1024, 761×700, 760×700, 844×390, 640×360, 480×320, 390×844, 360×640, 320×568, 320×240. Tất cả popup nằm trong màn hình, không tràn ngang; nút đóng và thêm giỏ nằm trong viewport, nhận tương tác được. Laptop 1280×720, 1366×768 không cần cuộn với sản phẩm vest mẫu; màn hình nhỏ cuộn nội dung.
- Thử dropdown và nhập 5 bộ ở 320×568: chỉ vùng chi tiết cuộn, header/footer đứng yên; thêm giỏ nhận đúng 5 bộ. Đã dọn mục thử, không tạo đơn. Chuyển 1 bộ → Khác ở viewport mặc định giữ nguyên kích thước ảnh 434×484px. Viewport thử đã được reset.
- Ảnh: `screenshots/product-popup-responsive.png`, `product-popup-laptop.png`, `product-popup-mobile.png`, `product-popup-landscape.png`.

Điều chỉnh tiếp theo phản hồi: bỏ dòng “Số lượng còn trống được kiểm tra theo ngày ở bước đặt lịch.”. Desktop dùng grid có ảnh bên trái kéo xuống ngang đáy nút thêm giỏ bên phải, bỏ thanh footer chạy qua dưới ảnh. Khung ảnh có chiều cao theo viewport, dùng cover và không thay đổi khi chọn Khác. Thông tin bên phải cuộn riêng; mobile giữ một vùng cuộn nội dung với nút thêm bên dưới. Đã kiểm tra 9 viewport từ 320×240 tới 1920×1080, ảnh/nút thẳng đáy trên desktop, popup không tràn và nút đóng/thêm đều trong màn hình. Kiểm tra lại chọn Khác → 1 bộ giữ nguyên kích thước ảnh. Ảnh mới: `screenshots/product-popup-image-to-bottom.png`.

**Yêu cầu hiển thị ảnh hiện tại:** luôn hiện đầy đủ ảnh gốc, đúng tỷ lệ; không zoom/cắt ảnh để lấp khung. Popup dùng `object-fit: contain; object-position: center` ở mọi breakpoint, chấp nhận nền trống hai bên hoặc trên/dưới. Đã bỏ override cover trên cả desktop/mobile; giữ khung ảnh kéo tới đáy nút. Kiểm tra trực quan PC và mobile 390×844, build thành công. Ảnh mới: `screenshots/product-popup-full-image.png`.

## Nhiều ảnh cho một sản phẩm

- `backend/src/studio/costumes.js` chứa GET/list/create/update trang phục và chuẩn hóa gallery; hai route trạng thái/xóa vẫn ở `server.js`. `db.js` thêm `costumes.images JSONB`, chuyển ảnh cũ thành mảng một ảnh. `image` luôn đồng bộ với phần tử đầu để catalog/giỏ/checkout tương thích.
- Admin → Tủ trang phục → Thêm/Sửa → Ảnh sản phẩm: chọn nhiều file hoặc thêm đường dẫn; tối đa 10 ảnh. JPG/PNG/WEBP tối đa 10 MB/file được tối ưu về tối đa 1200px/WebP trước khi lưu. Có nút đặt ảnh đại diện, trước/sau và xóa từng ảnh. Khóa lưu trong lúc xử lý hoặc khi chưa có ảnh; lỗi xử lý/lưu hiển thị trong form. Vẫn dùng cách lưu data URL trong DB hiện có; chưa chuyển sang object storage.
- `ProductGallery.jsx` dùng danh sách ảnh trong popup. Tự chuyển mỗi 5 giây, quay lại ảnh đầu, có thumbnail và nút icon tạm dừng/tiếp tục. Chuyển tay đặt lại chu kỳ; dừng timer khi tab ẩn/unmount, mặc định dừng khi prefers-reduced-motion. Hiệu ứng chỉ opacity, ảnh luôn contain; kích thước khung không thay đổi theo ảnh hoặc số lượng. Sản phẩm chỉ có một ảnh không hiện điều khiển và không tạo timer.
- `App.jsx` tải lại catalog khi rời admin để thấy ảnh vừa lưu, không cần tải lại trang. `productImages()` trong `api.js` hỗ trợ dữ liệu cũ. CSS dùng `.product-gallery` và `.product-info` riêng để tránh gallery là div bị nhận nhầm thành cột thông tin.
- **15/15 test backend đạt** trong DB `_test`: thêm gallery, public GET, thay thứ tự/ảnh đại diện, giữ gallery khi sửa metadata hoặc dùng client cũ, loại trùng, từ chối gallery rỗng/quá giới hạn/sai loại và auth, cùng 13 kiểm tra nghiệp vụ trước đó. Build/lint các file thay đổi đạt.
- Kiểm tra UI bằng backend/frontend riêng trên 5001/5174 nối DB `_test`: upload đồng thời hai ảnh, tối ưu WebP, đổi cover, sắp xếp, xóa, lưu/mở lại và xem gallery 4 ảnh ngoài storefront. Đo hai chu kỳ tự chuyển liên tiếp 4.985ms và 4.989ms; tạm dừng, thumbnail, quay vòng hoạt động. Kiểm tra 8 viewport 320×240 → 1920×1080: nút thêm trong màn hình, không tràn ngang, ảnh contain. 12 sản phẩm đang vận hành giữ nguyên số lượng và ảnh đại diện sau migration; không thêm ảnh minh họa vào sản phẩm thật.
- Ảnh kiểm tra dùng dữ liệu mẫu riêng: `screenshots/product-gallery-preview.png`, `product-gallery-admin.png`. Các ảnh mẫu trong lượt kiểm tra chỉ minh họa chức năng gallery.

Điều chỉnh điều khiển gallery: chỉ giữ một nút icon play/pause ở góc trên bên phải; bỏ số đếm và hai nút trái/phải. Chọn ảnh thủ công qua thumbnail, giữ autoplay 5 giây. Đã kiểm tra cả pause/play trên sản phẩm 4 ảnh; build và lint đạt. Ảnh: `screenshots/gallery-icon-only.png`.

Theo phản hồi tiếp theo, nút play/pause thu từ 36×36px xuống 28×28px, icon từ 16px xuống 12px.

## Header và lịch chọn ngày

- Header bỏ `translateY` khi hover các liên kết điều hướng và nút Đặt lịch ngay; giữ đổi màu/gạch chân. Đã kiểm tra liên kết đang hover có `transform: none`, không đổi vị trí.
- `DatePicker.jsx` thay lịch native trong checkout và lịch làm việc admin. Giao diện tiếng Việt, ngày dạng dd/mm/yyyy, tuần bắt đầu thứ Hai; có dropdown tháng/năm, hai nút chuyển tháng và chọn nhanh Hôm nay.
- Checkout cho chọn từ hôm nay đến 365 ngày tới, khớp backend; khóa các ngày ngoài khoảng này. Admin không giới hạn ngày để tra cứu công việc cũ. Chọn lại ngày hiện tại không xóa ca đã chọn.
- Native Popover đưa lịch lên trên checkout. Tự mở trên/dưới hoặc điều chỉnh vị trí để nằm trong viewport; chỉ cuộn nội dung lịch khi chiều cao màn hình không đủ. Focus không kéo trang; bấm ngoài/Escape đóng lịch trước, không đóng giỏ. Escape ở dropdown tháng/năm đóng dropdown trước.
- Hỗ trợ mũi tên, Home/End, PageUp/PageDown, Shift+PageUp/PageDown để chuyển năm; Enter chọn ngày. `date-utils.js` tính ngày bằng UTC để tránh lệch ngày do múi giờ/DST, chuyển tháng có chặn ngày cuối tháng.
- Kiểm chứng: 4/4 test ngày đạt (`node --test test/date-utils.test.js`), build và lint các file thay đổi đạt. Trình duyệt checkout: chọn tháng/năm, giới hạn ngày cuối, bàn phím/Escape, Hôm nay; desktop 1280×720, mobile 320×568 và màn hình ngang 640×360. Đã dọn mục giỏ dùng để kiểm tra, không tạo đơn; viewport trả về mặc định. Ảnh: `screenshots/custom-date-picker.png`.

Theo phản hồi tiếp theo, lịch thu từ 320px xuống 280px; padding 12→9px, ô ngày cao 34→30px, giảm khoảng cách header/footer. Popup đo thực tế còn 280×314px, chữ ngày giữ 12px. Đã kiểm tra ở 627×892, 320×568 và 1280×720: không tràn, không cần cuộn lịch; dropdown tháng và chọn ngày bằng bàn phím hoạt động. Build/lint và 4 test ngày đạt. Ảnh: `screenshots/compact-date-picker.png`.

Nghiên cứu toolkit rà soát pháp lý: [vn-law-check](../research/vn-law-check.md), gồm commit nguồn, kiến trúc, kiểm tra mẫu, giới hạn scanner/fetcher và hướng dùng cho Aura. Đã áp dụng theo yêu cầu ngày 04/11/2026: [báo cáo sơ bộ trước sửa](../compliance/2026-11-04/README.md), 4 mục đỏ, 6 vàng, 5 xanh trong phạm vi kiểm tra. Không cài toolkit vào runtime; không xem báo cáo là xác nhận pháp lý.

Đã triển khai [phần sửa kỹ thuật sau audit](../compliance/2026-11-04/technical-fixes.md)
theo chỉ đạo mới: dừng analytics, export tổng hợp, font nội bộ, lưu xác nhận chi phí
phía server và vá dependencies. Studio bổ sung điều khoản/chính sách sau. Kết quả:
16 test backend + 4 test ngày, build/lint đạt; npm audit hai phía 0 cảnh báo tại thời
điểm sửa. Xem AGENTS.md để biết phạm vi chưa chốt và quy tắc không tự tạo chính sách.
