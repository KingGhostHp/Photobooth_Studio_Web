# Nghiên cứu vn-law-check

Ngày đọc và kiểm tra: 04/11/2026.

- Repo: https://github.com/mhfed/vn-law-check
- Commit đã đọc: `3a8617dfdec8ac6e125146ae71614e5caa40aeab` (04/11/2026).
- Plugin khai báo phiên bản `1.5.3`.
- Bản clone để tham khảo trên máy: `D:/Downloads/his/.references/vn-law-check`.
- Phạm vi lần này: đọc README, hướng dẫn agent, checklist, nguồn dẫn, mẫu báo cáo/chính sách, installer, scanner/fetcher, đồng bộ và CI; chạy kiểm tra mẫu. Chưa thực hiện audit pháp lý Aura Studio hay xác minh độc lập toàn bộ văn bản luật.

## Repo dùng để làm gì

Đây là bộ hướng dẫn/checklist cho AI agent, kèm hai script Bash hỗ trợ tìm bằng chứng. Không có dịch vụ pháp lý/backend cần tích hợp vào runtime Aura Studio. `scan.sh` dò regex và đưa ra mức phân loại; agent phải đọc lại bằng chứng, chọn checklist phù hợp và lập báo cáo.

Theo [README tại commit đã đọc](https://github.com/mhfed/vn-law-check/blob/3a8617dfdec8ac6e125146ae71614e5caa40aeab/README.md), bộ tài liệu hỗ trợ nhiều coding agent, quét source hoặc URL, có mẫu báo cáo và khung chính sách. [DISCLAIMER](https://github.com/mhfed/vn-law-check/blob/3a8617dfdec8ac6e125146ae71614e5caa40aeab/DISCLAIMER.md) nêu giới hạn về độ chính xác/cập nhật của nguồn luật. Không coi kết quả tự động là kết luận pháp lý.

## Bản đồ để dùng lại

| Thành phần | Vai trò |
| --- | --- |
| `AGENTS.md`, `SKILL.md` | Quy trình và phạm vi rà soát cho agent |
| `references/00-triage.md` | Phân loại trước khi mở checklist |
| `references/01` đến `09` | Checklist dữ liệu cá nhân, TMĐT, an ninh mạng, người tiêu dùng, quảng cáo, giao dịch điện tử, AI, khung phạt, mobile |
| `references/10-generate-policy.md` | Lập bảng dữ liệu thực tế rồi soạn chính sách/form đồng ý |
| `sources/legal-references.md` | Nguồn dẫn, mốc hiệu lực do repo ghi nhận, lịch sử đính chính |
| `scripts/scan.sh` | Dò dấu hiệu trong source; xuất bằng chứng file:dòng và dòng tổng hợp `LEVEL=...` |
| `scripts/fetch-site.sh` | Tải HTML/JS để scanner đọc; không thực thi giao diện JavaScript |
| `examples/` | Khung báo cáo ngắn/đầy đủ và chính sách |
| `tests/run.sh` | Kiểm tra các website/app mẫu |
| `tools/sync.sh --check` | So sánh các bản hướng dẫn/plugin với bản nguồn |

## Kiểm tra mã nguồn và những điểm cần chú ý

### 1. Bộ tải URL chưa kiểm tra đúng origin

[`scripts/fetch-site.sh:34–44`](https://github.com/mhfed/vn-law-check/blob/3a8617dfdec8ac6e125146ae71614e5caa40aeab/scripts/fetch-site.sh#L34) chấp nhận URL khi chuỗi bắt đầu bằng `$origin`. Đây không phải phép so sánh scheme/hostname/port.

Đã gọi riêng hàm `resolve()` với `origin=https://example.com`, không thực hiện request mạng. Cả hai đầu vào sau đều được trả lại là hợp lệ:

```text
https://example.com.other.test/privacy
https://example.com@other.test/privacy
```

Hai URL này có hostname khác `example.com`. Vì vậy lời mô tả chỉ tải cùng tên miền chưa được bảo đảm bằng code. Ngoài ra, dòng 21 dùng `curl -L`, không kiểm tra origin của từng bước chuyển hướng. Phần chuyển hướng được xác định qua đọc code, chưa chạy thử chuyển hướng ra ngoài.

Nếu dùng URL mode sau này: sửa so sánh URL theo parser và kiểm tra từng redirect; không dùng bản hiện tại để cam kết giới hạn request trong một origin.

### 2. Có thể tải nhầm đường dẫn hoặc coi trang lỗi là kết quả bình thường

Hàm `resolve()` nối link tương đối vào gốc origin, thay vì resolve theo URL trang hiện tại. Với trang `/shop/`, link `privacy.html` bị ghép thành `/privacy.html`, thay vì `/shop/privacy.html`. Đã xác nhận cách ghép bằng gọi riêng hàm; chưa chạy tích hợp trên website có đường dẫn con.

`curl` không dùng `--fail` và script không kiểm tra HTTP status/content type. Theo code, response 404/500 có thể được lưu rồi quét như trang thật; đây là nguy cơ bỏ sót thông tin, chưa có test hồi quy cho trường hợp này trong bộ mẫu.

Fetcher còn giới hạn: tìm link/script bằng regex HTML, không chạy SPA, bỏ phần hash, không lần theo toàn bộ dynamic import; script `src` chỉ nhận mẫu dấu nháy kép. Với Aura dùng hash route, quét source đang hoạt động sẽ hữu ích hơn chỉ quét URL.

### 3. Kết quả scanner chỉ là dấu hiệu

[`scan.sh`](https://github.com/mhfed/vn-law-check/blob/3a8617dfdec8ac6e125146ae71614e5caa40aeab/scripts/scan.sh) không phân tích luồng dữ liệu hoặc cây import. Nó có thể nhận cả code cũ, test, ví dụ hoặc từ khóa trong nội dung. `.gitignore` không được dùng làm quy tắc loại trừ; scanner có danh sách bỏ qua riêng và đọc nhiều loại JSON/YAML/cấu hình.

- Tên một nhà cung cấp/CDN không chứng minh nơi lưu dữ liệu thực tế ở nước nào.
- Nhìn thấy biến/banner consent không chứng minh tracking đã được chặn trước đồng ý.
- `AUTH && MARKETPLACE` là điều kiện lên mức 3; vì vậy SaaS xử lý nhiều dữ liệu nhưng không có từ khóa marketplace vẫn có thể bị xếp thấp.
- Với Aura phải loại ảnh hưởng từ `LegacyApp.jsx`, component cũ, fixture và các thư mục dữ liệu local trước khi dùng bằng chứng. Không quét nguyên thư mục cha chứa dữ liệu riêng chỉ để lấy một nhãn mức độ.

### 4. Installer có thay đổi file

[`install.sh`](https://github.com/mhfed/vn-law-check/blob/3a8617dfdec8ac6e125146ae71614e5caa40aeab/install.sh) tải nhánh mặc định mới nhất, thay cả thư mục `.vn-law-check/`, chèn pointer vào các file hướng dẫn và ghi file Cursor riêng. Các lần chạy lại có thể thay chỉnh sửa bên trong toolkit hoặc file Cursor cùng tên. Không có pin commit trong luồng cài mặc định.

Lần nghiên cứu này không chạy installer, không đăng ký skill/plugin và không nhập các rule của repo ngoài vào hướng dẫn làm việc của Aura. Chỉ giữ clone riêng và ghi chú nghiên cứu.

## Kết quả kiểm chứng

| Kiểm tra | Kết quả |
| --- | --- |
| `bash -n` cho scanner, fetcher, installer, sync và test runner | Đạt |
| `tests/run.sh` | 11/11 fixture đạt, gồm SPA qua HTTP local |
| Chạy trên Windows | Dùng Git Bash; máy có `python` nhưng thiếu `python3`, nên truyền hàm alias `python3() { python "$@"; }` cho lượt test, không sửa repo |
| `tools/sync.sh --check` | Báo lệch file Cursor trên checkout CRLF của Windows; so sánh sau chuẩn hóa newline khớp hoàn toàn. Chưa có bằng chứng lệch nội dung, không tính là lỗi upstream |
| Tái hiện kiểm tra origin sai | Đã xác nhận bằng gọi hàm thuần local, không request tới hostname khác |
| Trạng thái clone sau kiểm tra | Sạch, không sửa source của repo tham khảo |

Bộ mẫu hiện tại kiểm tra tín hiệu/phân loại, không chứng minh tính đúng đắn pháp luật hoặc chặn request sai origin.

## Hướng áp dụng cho Aura Studio khi được yêu cầu audit

Đây là kế hoạch kiểm tra, chưa phải danh sách vi phạm hay kết luận tuân thủ:

1. Lập bản đồ dữ liệu từ frontend/backend đang dùng: thông tin đặt lịch, ghi chú, bản ghi đơn và thanh toán, cookie phiên admin, giỏ/lịch sử checkout trên thiết bị, thống kê truy cập.
2. Đối chiếu từng nơi thu dữ liệu với mục đích, thông tin công khai, lựa chọn của khách và bằng chứng được lưu. Phân biệt đồng ý chi phí/giữ chỗ với nội dung xử lý dữ liệu.
3. Kiểm tra điều kiện dịch vụ thực tế: cọc bảo đảm, tiền giữ chỗ, thời hạn thanh toán, hủy/hoàn, trả trang phục, khiếu nại. Không tự đặt chính sách kinh doanh thay chủ studio.
4. Đối chiếu nhà cung cấp và nơi triển khai thật; không suy từ tên dependency. Phần chưa có thông tin pháp nhân/thời hạn lưu/quy trình xử lý yêu cầu phải đánh dấu chờ xác nhận, không điền giả.
5. Tra lại văn bản chính thức và hiệu lực vào ngày audit trước khi gán nghĩa vụ, điều khoản hoặc mức phạt. Các dòng `CHƯA XÁC MINH` và lịch sử đính chính trong repo là tín hiệu cần kiểm chứng, không phải căn cứ để khẳng định.
6. Chỉ sau khi có kết quả và yêu cầu sửa mới triển khai policy/consent vào website; không tự thêm cookie banner hoặc cơ chế chặn toàn site từ một kết quả grep.

Điểm đáng học nhất: gắn phát hiện với bằng chứng thực tế, chọn phạm vi theo sản phẩm, và tách điều đã kiểm chứng khỏi điều còn chưa biết.

## Lần áp dụng thực tế

Ngày 04/11/2026 đã dùng skill/scanner để rà soát Aura theo yêu cầu người dùng.
Xem [báo cáo](../compliance/2026-11-04/README.md), output scanner và manifest nguồn
đi kèm. Đã phát hiện scanner bỏ sót analytics nội bộ; đối chiếu PDF chính thức cũng
cho thấy phải xét ngoại lệ thực hiện thỏa thuận ở Điều 19 Luật 91 trước khi kết luận
form nào cũng bắt buộc có một checkbox đồng ý dữ liệu riêng. Đây là audit sơ bộ,
không phải xác nhận pháp lý hay tự động sửa website.
