# Rà soát sơ bộ Aura Studio bằng vn-law-check

🤖 Báo cáo do AI tạo từ mã nguồn, chỉ để tham khảo, không phải ý kiến pháp lý. Phần lớn mục 🔴 là chỉnh sửa nhỏ trong code, làm được trong vài giờ, không cần quá lo. Việc gì quan trọng thì hỏi lại người làm luật.

**Ngày kiểm tra:** 04/11/2026, múi giờ Việt Nam. **Đối tượng:** bản đang phát triển tại `http://127.0.0.1:5173`, đánh giá mức sẵn sàng trước khi công bố/nhận khách thật. Không kết luận website đang vi phạm pháp luật chỉ từ trạng thái chạy local.

**Kết quả:** 4 mục 🔴 cần hoàn thiện trước khi public; 6 mục 🟡 cần cải thiện hoặc xác minh; 5 mục 🟢 có nền tảng phù hợp ở phạm vi đã kiểm tra. Đây không phải điểm số hay chứng nhận tuân thủ.

**Cập nhật sau audit:** người dùng yêu cầu studio bổ sung chính sách sau, dev sửa kỹ thuật trước. Xem [các thay đổi đã triển khai](technical-fixes.md): dừng analytics mới, tổng hợp export, font nội bộ, biên nhận xác nhận chi phí và vá dependencies. Các phát hiện bên dưới là mốc **trước khi sửa**, không phải trạng thái triển khai mới nhất.

**Verify mới nhất:** [reverification.md](reverification.md). Trong 15 mục gốc hiện còn 3 đỏ, 6 vàng, 6 xanh; ba nhóm đỏ là phần nội dung/thông tin studio chưa cung cấp và tích hợp. Kết quả test kỹ thuật không thay cho xác nhận pháp lý toàn website.

## Phương pháp và phạm vi

- Dùng [skill vn-law-check](D:/Downloads/his/.references/vn-law-check/SKILL.md), commit `3a8617dfdec8ac6e125146ae71614e5caa40aeab`, plugin 1.5.3. Nguồn luật trong toolkit ghi cập nhật 03/11/2026.
- Chạy `scripts/scan.sh` trên frontend/backend studio, rồi trên bản sao 25 file code cốt lõi có cả `App.jsx`, entry HTML, backend server/schema. Không quét `.local` chứa dữ liệu vận hành, secrets, thư viện hoặc toàn bộ code khách cũ. Xem [scan.txt](D:/Downloads/his/Photobooth_Studio_Web/docs/compliance/2026-11-04/scan.txt) và [dấu vân tay file nguồn](D:/Downloads/his/Photobooth_Studio_Web/docs/compliance/2026-11-04/source-manifest.json).
- Kết quả máy: `LEVEL=2 AI=no FOREIGN_HOST=no APP=no TRACKING_CONSENT=none`. Tự đọc lại bằng chứng: đây là website bán dịch vụ trực tiếp, có giỏ, đặt lịch, thanh toán và đăng nhập **admin**, không phải sàn nhiều người bán. Không nâng lên mức 3 chỉ vì có đăng nhập quản trị.
- Checklist chính: 01 dữ liệu cá nhân, 02 TMĐT, 04 người tiêu dùng, 06 giao dịch điện tử; rà nội dung giới thiệu theo 05. Xem thêm 03 ở phần bảo vệ dữ liệu/vận hành, không áp mọi nghĩa vụ của nền tảng lớn lên studio.
- Đọc code đang được import và kiểm tra DOM/giao diện catalog, footer, popup sản phẩm, checkout với một mục thử. Không nhập thông tin khách, không tạo đơn, không chuyển tiền, không đọc đơn trong DB. Mục thử đã được bỏ khỏi giỏ. Lượt truy cập có thể được hệ thống hiện tại ghi như mọi lần mở website.
- Scanner bỏ sót analytics tự viết và không chứng minh được nơi đặt máy chủ. Hai nhãn `TRACKING` và `FOREIGN_HOST` âm tính **không được coi là đạt**.
- Chỉ tạo tài liệu/bằng chứng; chưa sửa chính sách, analytics, nội dung kinh doanh hay logic checkout.

## Nguồn pháp luật đã đối chiếu

| Nguồn chính thức | Cách dùng trong báo cáo |
| --- | --- |
| [Luật 91/2025/QH15, ban hành 26/06/2025, hiệu lực 01/01/2026](https://chinhphu.vn/?classid=1&docid=214590&pageid=27160&typegroupid=3), [PDF ký số](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/7/91qh.signed.pdf) | Đã đọc trực quan trang 6 và 11: Điều 9, 10; điểm d khoản 1 Điều 19; Điều 20. Các quyền/lưu trữ khác dùng làm mục cần đối chiếu tiếp theo checklist. |
| [NĐ 356/2025/NĐ-CP, ban hành 31/12/2025, hiệu lực 01/01/2026](https://vanban.chinhphu.vn/?pageid=27160&docid=216387), [PDF ký số](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/01/356-nd.signed.pdf) | Đã đọc trang 5–6, Điều 6 về chứng minh/lưu sự đồng ý. Không tự điền các thời hạn xử lý quyền dữ liệu chưa đối chiếu đầy đủ. |
| [Luật 122/2025/QH15, ban hành 10/12/2025, hiệu lực 01/07/2026](https://online.gov.vn/tintucsct-14/van-ban-phap-luat), [PDF ký số](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/01/luat122.2025.qh15.pdf) | Đã đọc trang 7–8, Điều 11–12 về thông tin và đặt hàng. |
| [Luật 19/2023/QH15, ban hành 20/06/2023, hiệu lực 01/07/2024](https://congbao.chinhphu.vn/van-ban/luat-so-19-2023-qh15-39843/45917.htm) | Xác minh metadata nguồn chính thức; Điều 21/31 được dùng theo checklist để rà thông tin/tiếp nhận phản ánh, không suy ra quyền hoàn tiền vô điều kiện. |
| [Luật 20/2023/QH15, ban hành 22/06/2023, hiệu lực 01/07/2024](https://chinhphu.vn/default.aspx?classid=1&docid=208421&pageid=27160&typegroupid=3) | Checklist 06: lưu bằng chứng giao dịch. Chưa đánh giá một giao dịch thực tế có đủ giá trị chứng cứ hay không. |

**Điểm cần phân biệt:** điểm d khoản 1 Điều 19 Luật 91 có trường hợp thực hiện thỏa thuận không cần đồng ý riêng. Vì vậy, thiếu một checkbox riêng cho dữ liệu đặt lịch **không tự động chứng minh sai luật**. Cần xác định căn cứ xử lý, phạm vi dữ liệu cần thiết và thông tin đã cung cấp. Analytics tùy chọn phải được đánh giá riêng với xử lý đơn đặt lịch.

## 🔴 Cần xử lý trước khi public

### 1. Chưa có chính sách dữ liệu và thông báo tương ứng tại form

**Bằng chứng:** [App.jsx:140](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/App.jsx:140) không có route chính sách; [Storefront.jsx:84](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Storefront.jsx:84) không có link chính sách ở footer. [Checkout.jsx:555](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Checkout.jsx:555) thu họ tên, điện thoại, email tùy chọn và ghi chú; [Lookup.jsx:12](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Lookup.jsx:12) gửi mã đơn/điện thoại. Giao diện đã kiểm tra không giải thích nơi lưu, bên xử lý, thời hạn lưu hay cách thực hiện quyền dữ liệu. Xem [footer-dom.txt](D:/Downloads/his/Photobooth_Studio_Web/docs/compliance/2026-11-04/footer-dom.txt), [checkout-dom.txt](D:/Downloads/his/Photobooth_Studio_Web/docs/compliance/2026-11-04/checkout-dom.txt).

**Căn cứ:** checklist 01-A/B, 02-C; Điều 9 Luật 91 và điểm b khoản 1, khoản 2 Điều 11 Luật 122, nguồn chính thức ở bảng trên.

**Đề xuất:** lập bản đồ dữ liệu thực tế, viết chính sách phù hợp studio, thêm link dễ thấy ở footer/checkout/tra cứu. Điền thông tin đơn vị, lưu trữ, nhà cung cấp và đầu mối thật; không dùng thông tin giả để lấp chỗ trống. Nêu căn cứ xử lý từng mục đích; nếu dựa vào đồng ý thì thiết kế thông tin/lựa chọn tương ứng.

### 2. Analytics có định danh tự chạy trước khi khách có lựa chọn

**Bằng chứng:** [App.jsx:86](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/App.jsx:86) đặt timer 5 giây, tạo UUID bền vững trong `aura-visitor-v2`, gửi route hiện tại. [analytics.js:92](D:/Downloads/his/Photobooth_Studio_Web/backend/src/studio/analytics.js:92) lưu UUID, page URL, user-agent, `req.socket.remoteAddress`, ngày và thời điểm vào `visitor_logs`. Effect chạy cả khi mở admin; không phụ thuộc lựa chọn thống kê. Không có giao diện bật/tắt/rút lựa chọn trong route/footer đã kiểm tra.

Đây là thống kê nội bộ, **không thấy GA/Meta Pixel** trong code đang hoạt động. Tuy nhiên UUID giả danh không đồng nghĩa đã khử nhận dạng hoàn toàn. Địa chỉ lưu là địa chỉ kết nối mà backend nhìn thấy; sau proxy có thể là IP proxy, chưa xác định IP khách thật trong production. Kết luận dựa vào luồng code và UI, không truy vấn dữ liệu khách hay bắt gói mạng.

**Căn cứ:** checklist 01-B/C; Điều 9 Luật 91, Điều 6 NĐ 356. Chưa có bằng chứng một căn cứ khác đã được studio xác lập cho thống kê này.

**Đề xuất:** trước khi public, tắt thống kê có định danh hoặc thiết kế lựa chọn phù hợp trước khi tạo/lưu/gửi UUID; từ chối không ảnh hưởng đặt lịch. Có thể thay bằng thống kê tổng hợp tối thiểu nếu đáp ứng được nhu cầu. Không cần áp một banner cookie chung cho mọi chức năng cần thiết chỉ vì dùng localStorage.

### 3. Điều kiện hủy, hoàn tiền và hoàn cọc chưa đủ để khách quyết định

**Bằng chứng:** [Storefront.jsx:726](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Storefront.jsx:726) chỉ nêu hoàn cọc khi trả nguyên vẹn; [Checkout.jsx:628](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Checkout.jsx:628) hiển thị cọc hoàn lại. Không thấy chính sách công khai về hủy sau khi trả trước, đổi lịch, vắng mặt, hạn/phương thức hoàn cọc, trễ/hỏng/mất đồ, hoặc studio hủy dịch vụ. [index.js:389](D:/Downloads/his/Photobooth_Studio_Web/backend/src/studio/index.js:389) chỉ cho tự hủy khi chưa nhận tiền; đã nhận tiền phải liên hệ studio.

Checkbox [Checkout.jsx:658](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Checkout.jsx:658) chỉ xác nhận chi phí và 15 phút giữ chỗ, không dẫn tới bộ điều kiện dịch vụ đầy đủ.

**Căn cứ:** checklist 02-C, 04-B/C/D, 06-A; điểm c khoản 3 Điều 11 và khoản 1 Điều 12 Luật 122. Với trang phục, cần xác định mô hình cho thuê/dịch vụ thực tế để viết điều kiện phù hợp, không sao chép chính sách đổi trả hàng bán.

**Đề xuất:** chốt và công khai điều kiện theo từng dịch vụ trước nút giữ chỗ, cho khách xem lại, lưu phiên bản điều kiện cùng giao dịch. Không tự hứa hoàn tiền tự động hoặc cho rằng khách có quyền hoàn vô điều kiện trong mọi trường hợp.

### 4. Thông tin đơn vị và cách khiếu nại còn thiếu

**Bằng chứng:** footer [Storefront.jsx:84](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Storefront.jsx:84) có thương hiệu, điện thoại, email, giờ mở cửa, Zalo; chưa có tên đơn vị chịu trách nhiệm đầy đủ, địa chỉ studio, thông tin đăng ký phù hợp loại chủ thể, hay quy trình tiếp nhận/giải quyết khiếu nại. Chưa xác minh số điện thoại/email hiện có thuộc đơn vị thực tế nào.

**Căn cứ:** checklist 02-C, 04-D; điểm a và d khoản 1, khoản 2 Điều 11 Luật 122. Checklist dẫn thêm Điều 31 Luật 19 về tiếp nhận phản ánh; thời hạn/quy trình cần đối chiếu và thống nhất trước khi công bố.

**Đề xuất:** cung cấp thông tin thật, nêu đầu mối và cách xử lý phản ánh dễ tìm. Mã đăng ký/thuế chỉ công bố theo tư cách thực tế được xác nhận; không tự gán Aura là công ty hay hộ kinh doanh.

## 🟡 Nên cải thiện hoặc xác minh

| Mục | Bằng chứng và giới hạn | Hành động / căn cứ |
| --- | --- | --- |
| 1. Thời hạn lưu và thực hiện quyền dữ liệu | Schema [db.js:76](D:/Downloads/his/Photobooth_Studio_Web/backend/src/db.js:76), [db.js:174](D:/Downloads/his/Photobooth_Studio_Web/backend/src/db.js:174) có đơn/visitor logs; chưa tìm thấy cơ chế retention/khử nhận dạng hoặc quy trình yêu cầu dữ liệu trong code đang dùng. Đơn hủy/hết hạn vẫn được giữ. Có thể có quy trình thủ công ngoài repo, chưa xác minh. | Chốt lịch lưu theo mục đích và nghĩa vụ chứng từ; có kênh tiếp nhận, xác minh người yêu cầu và xử lý bản sao/export/backup. Không tự xóa sổ giao dịch khi có yêu cầu. Checklist 01-A/E; Điều 4, 10, 14 Luật 91 và Điều 5 NĐ 356 là các mục cần đối chiếu chi tiết. |
| 2. Bằng chứng đồng ý/điều kiện chưa theo giao dịch | [Checkout.jsx:208](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Checkout.jsx:208) gửi payload/customer/requestId, không gửi phiên bản điều kiện hay nội dung checkbox; [index.js:341](D:/Downloads/his/Photobooth_Studio_Web/backend/src/studio/index.js:341) chưa lưu các trường này. Chỉ khóa nút ở UI chưa phải bằng chứng server. | Lưu điều kiện đã chấp thuận, thời điểm, mục đích khi dùng cơ sở đồng ý; backend kiểm tra phiên bản. Điều 6 NĐ 356 khi dựa vào đồng ý; checklist 06, Điều 13 Luật 20 về hồ sơ giao dịch cần đối chiếu thêm. Không yêu cầu đồng ý riêng máy móc cho xử lý cần thiết theo thỏa thuận. |
| 3. Nhà cung cấp và chuyển dữ liệu chưa được xác định đầy đủ | [index.html:10](D:/Downloads/his/Photobooth_Studio_Web/frontend/index.html:10) tải Google Fonts; [Checkout.jsx:271](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Checkout.jsx:271) dùng ảnh VietQR theo cấu hình, kèm ngân hàng/tài khoản thụ hưởng, số tiền, mã đơn; không thấy nhét tên/điện thoại khách vào URL QR. Zalo là link do khách bấm. Compose chỉ cho thấy PostgreSQL container, không xác định quốc gia deployment. | Lập danh sách bên nhận và nơi xử lý thật, cân nhắc self-host font. Không suy ra đã chuyển dữ liệu ra nước ngoài từ tên vendor; chỉ xét hồ sơ khi đã xác định luồng thuộc phạm vi Điều 20 Luật 91. Checklist 01-D. |
| 4. Thuế, phí và phương thức thanh toán trước đặt lịch | [Checkout.jsx:614](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Checkout.jsx:614) chia phí dịch vụ/cọc/trả trước nhưng chưa nói giá gồm thuế hay chưa, điều kiện phát sinh phụ phí. QR/chỉ dẫn chuyển khoản nằm sau khi tạo giữ chỗ. | Công bố cách tính/bao gồm thuế, phí áp dụng và phương thức thanh toán ngay trước giữ chỗ; nếu chỉ nhận/trả tại studio thì nêu rõ. Checklist 02-H/04-A; điểm d, đ khoản 1 Điều 12 Luật 122. Không kết luận đang thu phí ẩn khi chưa có giao dịch thực tế. |
| 5. Nội dung sản phẩm cần đối chiếu ảnh thực tế | UI mẫu ghi “Đầm Dạ Hội Satin Trắng Công Chúa”, ảnh hiển thị váy tím; được thấy trong popup và thumbnail checkout. Chưa đối chiếu hàng thật hoặc nguồn ảnh, không suy đoán toàn catalog sai. | Kiểm tra lại tên/màu/ảnh; nếu ảnh minh họa phải rõ, không để khách hiểu nhầm bộ thực nhận. Checklist 04-A, 05-B; Điều 21 Luật 19 theo checklist. Chưa có bằng chứng nội dung tạo bằng AI để tự áp nghĩa vụ gắn nhãn. |
| 6. Các thủ tục và vận hành ngoài code | Không thể xác nhận hồ sơ thông báo TMĐT, quy mô/pháp nhân, nơi lưu dữ liệu, hồ sơ đánh giá tác động hay quy trình sự cố chỉ qua repo. Không có link xác nhận trong footer không chứng minh chưa làm thủ tục. | Theo checklist 02-B, rà Điều 14 và chuyển tiếp Điều 41 Luật 122 trước public. Với hồ sơ dữ liệu xem Điều 20–22, miễn/hoãn theo Điều 38 Luật 91 nếu thực sự áp dụng; sự cố theo Điều 23. Chi tiết phạm vi/ngoại lệ chưa xác minh đầy đủ, nên hỏi người làm luật. Không suy nghĩa vụ lưu mọi log 12 tháng cho studio từ một checklist chung. |

## 🟢 Các điểm đã có trong phạm vi kiểm tra

1. **Báo giá tách dịch vụ/cọc/số phải trả.** UI cho sửa ngày/số ngày/số lượng trước gửi; [domain.js:76](D:/Downloads/his/Photobooth_Studio_Web/backend/src/studio/domain.js:76) tính lại từ catalog server. Mẫu 1 bộ/1 ngày hiển thị 500.000đ phí thuê, 1.000.000đ cọc và phần còn lại rõ. Đây là nền tảng cho Điều 12 Luật 122, chưa bao phủ thiếu sót ở mục 🟡4.
2. **Checkbox không tích sẵn, không ép nhận quảng cáo.** [Checkout.jsx:99](D:/Downloads/his/Photobooth_Studio_Web/frontend/src/studio/Checkout.jsx:99) mặc định false. Chỉ ghi nhận điểm UI này theo checklist 01-B, không coi là đã có đồng ý xử lý dữ liệu đầy đủ.
3. **Dữ liệu đặt lịch có giới hạn cơ bản.** Email là tùy chọn, không thấy yêu cầu CCCD/ngày sinh/vị trí; [domain.js:55](D:/Downloads/his/Photobooth_Studio_Web/backend/src/studio/domain.js:55) giới hạn tên/email/ghi chú. Phù hợp hướng tối thiểu dữ liệu ở checklist 01-F; chưa kết luận đủ cho mọi mục đích xử lý.
4. **Thông tin đơn và export có lớp truy cập.** [index.js:415](D:/Downloads/his/Photobooth_Studio_Web/backend/src/studio/index.js:415) tra cứu bằng cả mã đơn + điện thoại; checkout cần token; [index.js:660](D:/Downloads/his/Photobooth_Studio_Web/backend/src/studio/index.js:660) bảo vệ các API còn lại bằng admin. Cookie phiên [auth.js:111](D:/Downloads/his/Photobooth_Studio_Web/backend/src/studio/auth.js:111) HttpOnly/SameSite. Ghi nhận biện pháp kỹ thuật theo checklist 01/03, không thay cho pentest hay kiểm chứng production.
5. **Có bản ghi đơn, giá tại thời điểm đặt và giao dịch.** `line_items`, `created_at`, `studio_payments` có trong [index.js:38](D:/Downloads/his/Photobooth_Studio_Web/backend/src/studio/index.js:38) và luồng checkout. Giữ chỗ có thời hạn server thực, không thấy đồng hồ giả ép mua. Phù hợp hướng lưu dấu vết ở checklist 06 và 04-E; chưa lưu toàn bộ điều kiện như 🟡2.

## Bản đồ dữ liệu đã xác định

| Dữ liệu | Nơi thu / mục đích suy ra từ code | Nơi lưu / bên nhận đã thấy |
| --- | --- | --- |
| Họ tên, điện thoại, email tùy chọn, ghi chú; ngày/ca/dịch vụ | Checkout, vận hành lịch hẹn; mục đích nghiệp vụ cần chủ studio xác nhận | PostgreSQL `orders`; admin; Excel có tên/điện thoại. Không có bằng chứng gửi email trong luồng checkout mới. |
| Mã đơn và điện thoại tra cứu | Xác thực việc tìm lịch hẹn | POST `/lookup`; đọc DB. Không thấy ghi một bản lookup riêng trong handler. |
| UUID, route, user-agent, địa chỉ kết nối, ngày/thời điểm | Thống kê truy cập tự viết | `aura-visitor-v2` ở localStorage và PostgreSQL `visitor_logs`; Excel chỉ lấy UUID/route/ngày, không xuất IP/UA trong query hiện tại. |
| Giỏ, yêu thích, mã/token checkout | Duy trì lựa chọn và tiếp tục lịch hẹn | `aura-cart-v2`, `aura-favorites`, `aura-active-checkout` trên thiết bị; có thể tồn tại qua các phiên. Không thấy tên/điện thoại khách được lưu trực tiếp trong các key này. |
| Tài khoản quản trị và cookie phiên | Quản lý studio | Mật khẩu gửi tới backend khi đăng nhập; token phiên trong cookie HttpOnly; bản phiên trong RAM backend. Không đọc credential thật khi audit. |
| Mã/số tiền giao dịch; dữ liệu tạo QR | Đối soát thanh toán | `studio_payments`, dữ liệu đơn; ảnh VietQR khi cấu hình tương ứng. Không thử callback hay giao dịch thật trong lượt này. |

## Thứ tự hoàn thiện đề xuất

1. Chốt thông tin đơn vị và chính sách nghiệp vụ với chủ studio; xử lý analytics tự chạy trước khi public.
2. Tạo chính sách dữ liệu, điều kiện dịch vụ/hủy/hoàn/cọc, kênh yêu cầu dữ liệu và khiếu nại; nối link vào footer và bước giữ chỗ.
3. Lưu phiên bản điều kiện/lựa chọn ở server; bổ sung lịch lưu và quy trình xử lý dữ liệu; rà vendor/deployment.
4. Kiểm thử lại bằng DB `_test`: lựa chọn thống kê, API thiếu/phiên bản điều kiện cũ, từ chối thống kê vẫn đặt được, dữ liệu consent/điều kiện gắn đúng đơn. Rà lại nội dung sản phẩm trước nhận khách.

Để triển khai phần nội dung đúng thực tế cần: tên/tư cách đơn vị, địa chỉ, mã đăng ký nếu có, đầu mối thật; chính sách hủy/đổi/hoàn và khoản khấu trừ; giá/thuế/phí; nhà cung cấp/nơi deploy; lịch lưu dữ liệu. Báo cáo không tự điền các thông tin này.

## Mức phạt tham khảo

Không định lượng tiền phạt trong lượt này. Bảng 08 của toolkit có nhiều mục chưa xác minh đầy đủ; chưa đối chiếu khung xử phạt hiện hành với tư cách và hành vi thực tế của studio. Không lấy mức trần để suy ra số tiền website sẽ bị phạt, không cộng mức phạt giữa các phát hiện.

## Giới hạn & khuyến nghị

Đây là rà soát do AI từ bản code đang phát triển và UI local, không phải ý kiến pháp lý chính thức. Chưa xác minh vận hành ngoài repo, giao dịch/hoàn tiền thật, nội dung DB khách, hồ sơ thủ tục, vị trí hosting, bản backup hay toàn bộ văn bản dẫn chiếu. Các điểm 🟢 chỉ áp dụng cho chi tiết đã kiểm tra.

⚪ Chưa thấy sàn nhiều người bán, mạng xã hội/livestream, ứng dụng mobile, SDK quảng cáo hay chatbot/API AI trong luồng đang dùng; không áp các nghĩa vụ chuyên biệt này. Nguồn gốc nội dung/ảnh AI chưa được chứng minh. Bản quyền ảnh, thuế thực nộp và rà soát lỗ hổng bảo mật toàn diện nằm ngoài phạm vi, nên kiểm tra riêng.

Trước khi công bố chính sách hoặc quyết định nghĩa vụ pháp lý, xác minh lại văn bản còn hiệu lực tại nguồn chính thức và nhờ người có chuyên môn xem các mục 🔴 cùng phần thủ tục. Nếu tiếp tục sửa, có thể yêu cầu “soạn chính sách bảo mật cho dự án này” theo checklist 10, dựa trên bản đồ dữ liệu và thông tin thật ở trên.

### Bằng chứng giao diện

![Checkout, chưa có link chính sách dữ liệu/điều kiện đầy đủ](D:/Downloads/his/Photobooth_Studio_Web/docs/compliance/2026-11-04/checkout.png)

![Footer với các thông tin công khai hiện có](D:/Downloads/his/Photobooth_Studio_Web/docs/compliance/2026-11-04/footer.png)
