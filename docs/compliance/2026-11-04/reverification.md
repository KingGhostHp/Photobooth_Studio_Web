# Verify lại sau sửa kỹ thuật — 04/11/2026

🤖 Báo cáo do AI tạo từ mã nguồn, chỉ để tham khảo, không phải ý kiến pháp lý. Phần lớn mục 🔴 là chỉnh sửa nhỏ trong code, làm được trong vài giờ, không cần quá lo. Việc gì quan trọng thì hỏi lại người làm luật.

**Kết quả:** các phần kỹ thuật vừa sửa đạt kiểm tra lại trong phạm vi dưới đây. Từ 15 mục của audit gốc, hiện còn **3 🔴, 6 🟡, 6 🟢**. Mục tracking chuyển từ 🔴 sang 🟢 vì đã dừng thu thập mới. Các mục chính sách do studio bổ sung vẫn được giữ mở trước khi public; việc giao studio bổ sung sau không tự làm các mục này thành đạt.

Không phát hiện lỗi kỹ thuật mới trong các thay đổi được kiểm tra. Đây không phải xác nhận toàn bộ website đã tuân thủ pháp luật hoặc đã sẵn sàng nhận khách thật.

## Đã kiểm tra lại những gì

- Áp dụng lại `vn-law-check`, cùng commit `3a8617dfdec8ac6e125146ae71614e5caa40aeab`; phân loại mức 2, bán dịch vụ trực tiếp. Checklist 01/02/04/06 là chính; phần nội dung/triển khai theo phạm vi trong báo cáo gốc.
- Quét lại bản sao **25 file hiện tại**, không dùng bản snapshot trước sửa. [Output mới](scan-after-fixes.txt), [manifest mới](source-manifest-after-fixes.json). Kết quả vẫn `LEVEL=2 AI=no FOREIGN_HOST=no APP=no TRACKING_CONSENT=none`; đã đọc lại code ngoài regex vì scanner không chứng minh được compliance.
- Gọi bản đang chạy qua frontend proxy `127.0.0.1:5173`: POST tracking với payload rỗng trả **410**; GET đơn quản trị không có phiên trả **401**. [Bằng chứng runtime](runtime-after-fixes.json). Không gửi dữ liệu khách hoặc tạo đơn vào DB vận hành.
- Chạy lại backend với `npm run test:local`: **16/16 đạt**, trên DB `_test`. Các test gồm từ chối xác nhận thiếu/sai/version cũ trước khi ghi đơn, nội dung/thời điểm do server cấp, retry giữ bản ghi, tracking không ghi và Excel chỉ còn tổng theo tháng.
- Đọc lại entry HTML/App, collector, query Excel, quote/checkout/migration/serialize. Không thực hiện lượt kiểm tra UI mới; ảnh UI của lần sửa ở [technical-fixes.md](technical-fixes.md).
- Mở lại metadata nguồn Chính phủ và tải lại cả ba PDF 91/356/122 từ URL chính thức. Đều HTTP 200, SHA-256 trùng bản đã đọc; đọc lại các trang liên quan. [URL và hash](legal-source-recheck.json). So khớp file không phải kiểm chứng chữ ký số hoặc kiểm tra đầy đủ mọi văn bản sửa đổi.

## Đối chiếu pháp luật cần giữ đúng

| Nguồn chính thức | Điều đã đối chiếu / giới hạn |
| --- | --- |
| [Luật 91/2025/QH15](https://chinhphu.vn/?classid=1&docid=214590&pageid=27160&typegroupid=3), ban hành 26/06/2025, hiệu lực 01/01/2026; [PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/7/91qh.signed.pdf) | Điều 9–10; điểm d khoản 1 và khoản 2 Điều 19; Điều 20, trang 6/11. Xử lý để thực hiện thỏa thuận có thể thuộc trường hợp không cần đồng ý riêng; vẫn phải xác định phạm vi/căn cứ và cơ chế bảo vệ. Không dùng ngoại lệ này cho mọi mục đích tùy chọn. |
| [NĐ 356/2025/NĐ-CP](https://vanban.chinhphu.vn/?pageid=27160&docid=216387), ban hành 31/12/2025, hiệu lực 01/01/2026; [PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/01/356-nd.signed.pdf) | Điều 6, trang 5–6: khi dựa vào đồng ý xử lý dữ liệu phải có bằng chứng phù hợp. Bản ghi `booking-costs-v1` hiện chỉ xác nhận chi phí/giữ chỗ, không tự trở thành bằng chứng đồng ý chính sách dữ liệu. |
| [Luật 122/2025/QH15 — PDF Chính phủ](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/01/luat122.2025.qh15.pdf), ban hành 10/12/2025, hiệu lực 01/07/2026 | Điều 11–12, trang 7–8: thông tin công khai/điều kiện dịch vụ và nội dung trước đặt hàng vẫn phải được hoàn thiện. Lưu checkbox chi phí không tự thay thế các nội dung này. Trường hợp chuyển tiếp cụ thể của studio chưa được xác minh. |

NĐ 248/2026/NĐ-CP được [nguồn Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=218747) ghi ban hành 30/06/2026, hiệu lực 01/07/2026. Lượt này không kết luận chi tiết thủ tục hoặc miễn trừ của studio từ tên website.

## Trạng thái từng mục của audit gốc

Các số dưới đây giữ nguyên nhóm/mục ở [audit ban đầu](README.md), tránh đếm một thay đổi kỹ thuật thành nhiều nghĩa vụ pháp lý đã đạt.

| Mục gốc | Trạng thái hiện tại | Bằng chứng / phần còn lại |
| --- | --- | --- |
| 🔴1: chính sách dữ liệu và thông báo | 🔴 Còn mở, studio cung cấp nội dung | App/footer/form chưa có trang/link chính sách. Sau khi studio chốt nội dung, dev cần tích hợp vào UI/luồng và xác định căn cứ từng mục đích. Căn cứ: Điều 9 Luật 91; điểm b khoản 1, khoản 2 Điều 11 Luật 122. |
| 🔴2: analytics tự chạy | 🟢 Đã xử lý thu thập mới | `App.jsx:86` chỉ dọn key cũ; `analytics.js:92` trả 410, không INSERT. Runtime và test xác nhận. Căn cứ rà soát: checklist 01-B/C, Điều 9 Luật 91. Không xác nhận dữ liệu lịch sử đã được xử lý xong. |
| 🔴3: hủy/hoàn/cọc và điều kiện dịch vụ | 🔴 Còn mở, studio chốt nghiệp vụ | `booking-costs-v1` vẫn chỉ nói chi phí/15 phút. Chưa có điều kiện đầy đủ hoặc chấp thuận phiên bản điều kiện đó. Căn cứ: điểm c khoản 3 Điều 11, Điều 12 Luật 122. |
| 🔴4: đơn vị vận hành/khiếu nại | 🔴 Còn mở, studio cung cấp thông tin thật | Footer chưa có đủ thông tin đơn vị, địa chỉ và cách giải quyết phản ánh. Căn cứ: điểm a/d khoản 1, khoản 2 Điều 11 Luật 122. |
| 🟡1: retention/quyền dữ liệu | 🟡 Chưa xác minh quy trình | Log cũ/đơn cũ vẫn còn theo thiết kế. Cần căn cứ/lịch lưu, cách tiếp nhận và xử lý yêu cầu, kể cả bản export/backup. Không tự đặt retention hoặc xóa chứng từ. Checklist 01-A/E; Điều 10/14 Luật 91, Điều 5 NĐ 356 cần đối chiếu khi chốt quy trình. |
| 🟡2: chứng cứ xác nhận/điều kiện | 🟡 Đã sửa phần chi phí; còn chờ policy | Server xác thực version/boolean, lưu text chuẩn/acceptedAt; đơn cũ NULL; đổi báo giá bỏ chọn. Chưa có nội dung/version điều khoản studio để lưu. Điều 6 NĐ 356 chỉ áp dụng theo đúng mục đích khi dựa vào đồng ý dữ liệu; checklist 06 về bằng chứng giao dịch vẫn cần rà sau tích hợp policy. |
| 🟡3: vendor/chuyển dữ liệu | 🟡 Đã bỏ Google Fonts; phần khác chưa đủ thông tin | Font nội bộ và license có trong repo; QR bên thứ ba và nơi deploy thực tế vẫn cần đối chiếu. Không suy ra nơi lưu dữ liệu từ tên vendor hoặc kết quả `FOREIGN_HOST=no`. Căn cứ xem xét: Điều 20 Luật 91. |
| 🟡4: thuế/phí/phương thức thanh toán trước đặt | 🟡 Chờ studio chốt, sau đó cần tích hợp UI | Chưa có thông tin đầy đủ để công bố. Căn cứ: điểm d/đ khoản 1 Điều 12 Luật 122. Không tự đặt thuế/phí cho studio. |
| 🟡5: ảnh/tên hàng | 🟡 Chờ studio đối chiếu | Chưa có bằng chứng catalog đã được đối chiếu hàng thật. Checklist 04-A/05-B, Điều 21 Luật 19/2023/QH15 theo audit gốc; lượt này không đánh giá lại toàn bộ ảnh hoặc nguồn gốc AI. |
| 🟡6: thủ tục/vận hành ngoài repo | 🟡 Chưa xác minh | Không có dữ liệu mới về pháp nhân, hồ sơ TMĐT/dữ liệu, hosting, quy trình sự cố hay miễn/hoãn. Checklist 02-B/01-D/E; các điều cụ thể và ngoại lệ cần xác minh theo chủ thể, không kết luận thiếu giấy tờ chỉ vì repo không chứa chúng. |
| 🟢1–5 trong audit gốc | 🟢 Giữ kết quả ở phạm vi kỹ thuật đã nêu | Báo giá tách khoản; checkbox mặc định tắt; giới hạn input/email tùy chọn; kiểm soát truy cập; lưu dòng hàng/giao dịch. Test xác nhận phần liên quan, không biến thành chứng nhận pháp lý toàn hệ thống. |

## Những kết luận không được suy ra

- Không còn tracking mới **không có nghĩa** log lịch sử đã có căn cứ lưu mãi; phần này vẫn chờ quyết định retention/quyền dữ liệu.
- Có nội dung/thời điểm xác nhận chi phí **không có nghĩa** khách đã đồng ý chính sách chưa tồn tại.
- Tự host font **không chứng minh** toàn bộ hệ thống không có bên xử lý thứ ba hoặc luồng xuyên biên giới.
- Test đạt hoặc npm audit không cảnh báo **không chứng minh** website tuân thủ pháp luật.
- Không tự yêu cầu popup cookie cho mọi chức năng cần thiết, hoặc bắt thêm checkbox dữ liệu cho mọi xử lý theo thỏa thuận.

## Bước tiếp theo

Chờ studio cung cấp nội dung/thông tin đã liệt kê trong AGENTS.md. Khi có, dev nối trang/link tại footer/form, hiển thị điều kiện trước đặt lịch, lưu phiên bản chấp thuận phù hợp và kiểm thử lại bằng DB `_test`. Các mục đỏ giữ mở cho đến khi có nội dung thật và đã tích hợp, không chỉ vì người dùng đã phân công studio làm sau.

Lượt này chỉ verify và cập nhật tài liệu, không tự sửa chính sách, không tạo đơn thật, không xóa dữ liệu lịch sử. Không có dữ liệu mới để áp các nghĩa vụ chuyên biệt của mobile, sàn nhiều người bán, SDK quảng cáo hoặc chatbot AI.

## Giới hạn & khuyến nghị

Đây là rà soát sơ bộ bằng `vn-law-check` và đối chiếu nguồn chính thức trong phạm vi nêu trên, không phải tư vấn pháp lý. Chưa xác minh đầy đủ mọi sửa đổi pháp luật, tư cách/miễn trừ của studio hay vận hành production. Không định lượng mức phạt khi chưa xác minh căn cứ áp dụng. Trước khi public, nên nhờ người có chuyên môn kiểm tra ba nhóm 🔴 cùng chính sách và hồ sơ thực tế.
