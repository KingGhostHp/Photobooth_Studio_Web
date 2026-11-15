# Hành vi và vấn đề cần nhớ trước khi sửa

[Về bản đồ dự án](README.md). Ghi nhận ngày 04/11/2026. Các mục dưới đây dựa trên code/metadata đã đọc, không phải báo cáo pentest hoặc kiểm thử giao dịch thật. Chưa sửa các vấn đề này trong lượt đọc dự án.

## 1. Quyền truy cập và thanh toán

### F01 — Khu admin chưa có cơ chế xác thực

Header đổi trực tiếp `isAdminMode`; Express chỉ đăng ký CORS/body parser và các route, chưa có middleware login/role. App còn tải `/api/orders` ngay ở phiên khách. Hệ quả theo code: ẩn/hiện UI admin chưa bảo vệ quyền đọc/ghi API.

Bằng chứng: [Header:72](../../frontend/src/components/common/Header.jsx#L72), [App:39](../../frontend/src/App.jsx#L39), [server:11](../../backend/src/server.js#L11), [API map](api-map.md).

### F02 — Backend nhận tiền và trạng thái từ payload khách

`POST /api/orders` lấy `totalAmount`, `depositAmount`, `paymentStatus`, `bookingStatus` từ body; chưa tính lại theo bản ghi sản phẩm/gói trong database. Default còn là DEPOSITED/CONFIRMED. Photobooth gửi PAID_FULL hoặc DEPOSITED_50% rồi hiện success ngay sau INSERT.

Đây là lý do phải đọc cả frontend và backend khi sửa thanh toán: hiện tạo order và xác nhận đã nhận tiền chưa được tách thống nhất. Chưa tạo order thử để kiểm chứng bằng mutation.

Bằng chứng: [server:593](../../backend/src/server.js#L593), [server:700](../../backend/src/server.js#L700), [Photobooth:164](../../frontend/src/components/customer/PhotoboothSection.jsx#L164).

### F03 — Webhook thiếu các điều kiện xác minh và xử lý trùng

Handler webhook chưa kiểm tra chữ ký/API key, chiều tiền vào hoặc đối chiếu tài khoản nhận trước khi xác nhận. `GET bank-config` còn trả `webhookApiKey`. Flag `isAutoConfirmEnabled` được lưu/hiển thị nhưng webhook chưa đọc nó để quyết định có tự xác nhận hay không. Simulator cũng đang public theo middleware hiện tại và cập nhật order thật.

Schema chưa unique transaction ID; handler dùng từng callback amount thay vì cộng dồn. Vì thế callback trùng hoặc một lần chuyển ít hơn sau lần thanh toán đủ có thể ghi log/cập nhật lại trạng thái theo amount lần sau. Đây là suy luận từ đường code, chưa gửi callback thử.

Bằng chứng: [bank-config:1573](../../backend/src/server.js#L1573), [webhook:1642](../../backend/src/server.js#L1642), [simulator:1791](../../backend/src/server.js#L1791), [schema log:227](../../backend/src/db.js#L227).

### F04 — Bộ tên trạng thái thanh toán chưa thống nhất

Photobooth dùng `PAID_FULL`, `DEPOSITED_50%`; webhook dùng `FULLY_PAID`, `DEPOSITED`, `PARTIALLY_PAID`. Check-status chỉ coi DEPOSITED/FULLY_PAID/DEPOSITED_30% là paid; filter/select admin cũng không bao hết trạng thái Photobooth. Cùng một tình huống có thể bị hiển thị/phân loại khác nhau giữa màn hình.

Bằng chứng: [Photobooth:180](../../frontend/src/components/customer/PhotoboothSection.jsx#L180), [AdminOrders:134](../../frontend/src/components/admin/AdminOrders.jsx#L134), [check-status:1775](../../backend/src/server.js#L1775).

## 2. Giá, tồn kho và lịch

### F05 — Công thức tiền cần thống nhất theo loại dịch vụ

Cart cộng một lần rentalPrice mỗi item, cộng thêm depositAmount thành grandTotal; rentalDays không nhân vào phí dù catalog ghi giá/24H. Combo cũng được gộp vào công thức này, trong khi tiền cọc combo có thể là một phần của giá gói. Cần chốt riêng cọc bảo đảm hoàn lại và tiền trả trước dịch vụ, không tự diễn giải chúng thành cùng một khoản.

Bằng chứng: [Cart:122](../../frontend/src/components/customer/CartDrawer.jsx#L122), [Cart:209](../../frontend/src/components/customer/CartDrawer.jsx#L209), [Combo:61](../../frontend/src/components/customer/ComboPackagesSection.jsx#L61), [Catalog:368](../../frontend/src/components/customer/CostumesCatalog.jsx#L368).

### F06 — Kiểm tra trùng chưa gắn với số lượng hoặc tài nguyên

Rental conflict chặn khi thấy một order cùng costume ID có khoảng ngày chồng nhau, không cân đối `available_count`, size hay số lượng từng order. Ca chụp được kiểm bằng ngày + chuỗi giờ trên toàn bộ orders, chưa tách cabin/phòng/ekip/capacity. SELECT kiểm tra và INSERT tách rời; schema local không có unique/exclusion constraint giữ chỗ. Có nguy cơ hai request đồng thời cùng vượt kiểm tra — chưa stress test.

Khoảng ngày đang dùng hai đầu bao gồm (`reqStart <= existEnd && reqEnd >= existStart`), end là start + rentalDays. Cần chốt có cho nhận đơn mới vào ngày trả cũ không.

Bằng chứng: [conflict:382](../../backend/src/server.js#L382), [slot check:648](../../backend/src/server.js#L648), [order schema:70](../../backend/src/db.js#L70).

### F07 — Thời hạn giữ chỗ và cách giải phóng chưa nhất quán

Cart đặt booking status `HOLD_15MIN`, nhưng helper rental xóa PENDING quá **10 phút**. Dọn đơn chỉ xảy ra khi helper được gọi, không có scheduler; booked-slots không tự lọc đơn pending hết hạn. DELETE trong helper áp dụng mọi PENDING, không chỉ order có trang phục. Khi thiết kế lại nên có một quy tắc expiry dùng chung.

Bằng chứng: [Cart:224](../../frontend/src/components/customer/CartDrawer.jsx#L224), [cleanup:390](../../backend/src/server.js#L390), [booked-slots:495](../../backend/src/server.js#L495).

## 3. Tính đúng của báo cáo và lưu dữ liệu

### F08 — Dashboard có số mẫu trong response được trình bày như số thật

Summary API đặt sàn visitor và các default revenue/deposit/orders khi số thật bằng 0. Tổng orders không lọc theo tháng được dùng để dựng current-month summary; snapshot cũng lấy tất cả orders cho target month. Frontend còn có fallback riêng. Dữ liệu local hiện 0 order nhưng dashboard vẫn có thể thể hiện doanh thu và số đơn mẫu.

Bằng chứng: [analytics:1312](../../backend/src/server.js#L1312), [floors/defaults:1365](../../backend/src/server.js#L1365), [snapshot:1414](../../backend/src/server.js#L1414), [Dashboard:66](../../frontend/src/components/admin/AdminDashboard.jsx#L66).

### F09 — Phụ phí có đường bị cộng hai lần vào doanh thu

AdminOrders cộng penalty vào cả `penaltyFee` và `totalAmount`; dashboard/backend summary lại cộng `totalAmount + penaltyFee`. Ví dụ thêm phạt 100.000 vào đơn 500.000 có thể cho doanh thu 700.000 theo công thức này. Đây là ví dụ suy luận từ code, chưa sửa/tạo đơn thử.

Bằng chứng: [AdminOrders:40](../../frontend/src/components/admin/AdminOrders.jsx#L40), [Dashboard:53](../../frontend/src/components/admin/AdminDashboard.jsx#L53), [server:1338](../../backend/src/server.js#L1338).

### F10 — Lỗi API có thể vẫn thể hiện thay đổi thành công ở local

App fallback cập nhật order kể cả API thất bại; delete bỏ item khỏi state mà không kiểm tra response.ok. Inventory có các nhánh create/update/delete chỉ thay đổi local khi backend lỗi. Màn hình có thể trông đã lưu nhưng reload lại mất thay đổi. PUT order còn thiếu `notes` trong object response dù có ghi trường đó.

Bằng chứng: [App:114](../../frontend/src/App.jsx#L114), [Inventory:143](../../frontend/src/components/admin/AdminInventory.jsx#L143), [PUT order:806](../../backend/src/server.js#L806).

### F11 — Phân công ekip chưa lưu database

AdminCalendar chỉ `setAssignedStaff` theo slot ID, không gọi API cập nhật assignedPhotographer/assignedMakeup; state không phân biệt ngày trong key. Đổi tab/reload có thể mất phân công; đổi ngày vẫn dùng map theo slot cũ. Endpoint PUT orders có trường staff nhưng UI này chưa nối.

Bằng chứng: [AdminCalendar:23](../../frontend/src/components/admin/AdminCalendar.jsx#L23), [PUT orders:757](../../backend/src/server.js#L757).

### F12 — Khởi tạo DB có thao tác xóa dữ liệu nghiệp vụ

`initDb()` không chỉ tạo bảng/seed; nó DELETE một số mẫu mã đơn và mọi order có dấu `?` trong customer_name mỗi lần chạy. Server gọi initDb mà không await trước listen; initDb catch/log lỗi thay vì trả lỗi khởi động. Health chỉ query NOW, chưa chứng minh toàn bộ schema/seed đã sẵn sàng.

Bằng chứng: [db:296](../../backend/src/db.js#L296), [server:16](../../backend/src/server.js#L16), [db:518](../../backend/src/db.js#L518). Lượt đọc này không gọi initDb hay restart backend.

## 4. Nội dung, mã chưa nối và cấu hình

### F13 — Nguồn dữ liệu động và tĩnh còn chồng nhau

Catalog title/SEO dùng CATEGORY_DETAILS tĩnh; admin editor cũng ưu tiên detail tĩnh cho category có sẵn. Nhiều component chỉ nhận API list khi length > 0 nên danh sách rỗng hợp lệ có thể vẫn hiện dữ liệu cũ/mẫu. Lookbook đang dùng data file, chưa có CMS/API riêng. Menu CMS nhắc lookbook nhưng render banner editor.

Bằng chứng: [Catalog:24](../../frontend/src/components/customer/CostumesCatalog.jsx#L24), [Inventory:323](../../frontend/src/components/admin/AdminInventory.jsx#L323), [Lookbook](../../frontend/src/components/customer/LookbookSection.jsx), [App](../../frontend/src/App.jsx).

### F14 — Asset thiếu và code cũ dễ gây sửa nhầm

Lookbook đang trỏ một ảnh vest không có trong public. Hai backdrop của builder cũ cũng thiếu. BookingSlotSection, MixMatchBuilder, PackagesSection và App.css không reachable từ import graph hiện tại; sửa các file này có thể không thay đổi màn hình đang chạy. Không đề xuất xóa trước khi chốt tính năng.

Bằng chứng: [snapshot](source-snapshot.json), [data/lookbook.js](../../frontend/src/data/lookbook.js), [App](../../frontend/src/App.jsx).

### F15 — Cấu hình môi trường và credential cần tách rõ khi triển khai

Compose có credential đặt trực tiếp trong cấu hình được track; local setup sử dụng env riêng bị ignore. Ghi chú này không sao chép giá trị secret. Frontend/backend Docker dùng Node 20 image tag động; cần đối chiếu engine của package thực tế và kiểm thử Docker riêng trước khi coi tương đương setup Node 22 local.

Bằng chứng: [Compose](../../docker-compose.yml), [Docker frontend](../../frontend/Dockerfile), [Docker backend](../../backend/Dockerfile), [gitignore](../../.gitignore). Docker chưa được chạy trong lượt đọc này.

## Cách dùng các ghi chú

Các mục F01–F15 phục vụ chọn đúng phạm vi sửa và kiểm tra lại. Khi xử lý một mục, cần cập nhật bằng chứng code mới và thêm kết quả thử nghiệm; không coi việc ghi nhận là đã sửa. Những chỗ cần quyết định nghiệp vụ (định nghĩa cọc, capacity, ngày trả, expiry) được để rõ để không tự thay đổi hành vi ngoài yêu cầu.
