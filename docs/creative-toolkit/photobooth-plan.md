# Áp dụng cho Photobooth Studio

[Về chỉ mục](README.md). Ghi nhận ngày 04/11/2026. Tài liệu này tách hiện trạng quan sát trong repo và hướng triển khai đề xuất. Nghiên cứu toolkit không đồng nghĩa đã thêm các tính năng bên dưới.

## 1. Hiện trạng đã đọc trong code

| Nguồn trong repo | Quan sát | Ý nghĩa đối với toolkit |
| --- | --- | --- |
| [frontend/package.json](../../frontend/package.json) | React 19, Vite, Tailwind; có `canvas-confetti`, `lucide-react`, `xlsx` | Chưa khai báo Motion, Anime.js, Lottie, Three.js hay Remotion |
| [backend/package.json](../../backend/package.json) | Express, PostgreSQL, email và XLSX | Chưa khai báo worker render hoặc môi trường Python cho toolkit |
| [App.jsx](../../frontend/src/App.jsx) | Đổi tab/view bằng state; điều khiển cart, booking và khu admin | Animation có thể bám vào state hiện tại |
| [HeroBannerCarousel.jsx](../../frontend/src/components/customer/HeroBannerCarousel.jsx) | Có timer 4,5 giây, swipe, CSS transition và lấy banner API | Đã có chuyển động; cần cải tiến theo mục tiêu cụ thể |
| [CostumesCatalog.jsx](../../frontend/src/components/customer/CostumesCatalog.jsx) | Catalog lấy dữ liệu API, lọc và chọn trang phục | Có thể thử layout transition nếu thay đổi grid |
| [CartDrawer.jsx](../../frontend/src/components/customer/CartDrawer.jsx) | Giỏ hàng, checkout, QR và trạng thái thanh toán; có confetti | Motion có thể hỗ trợ mở/đóng; giữ state nghiệp vụ độc lập |
| [PhotoboothSection.jsx](../../frontend/src/components/customer/PhotoboothSection.jsx) | Chọn concept, ngày, ca chụp và đặt chỗ qua API | Đây là flow đặt lịch; chưa có logic webcam/capture trong component được đọc |
| [AdminBanners.jsx](../../frontend/src/components/admin/AdminBanners.jsx) | Quản lý banner | Điểm tích hợp asset đã biên tập/duyệt nếu sau này có pipeline media |

Các liên kết trỏ tới code trong checkout, không phải mô tả tính năng của toolkit. Trước khi triển khai, đọc lại file vì code có thể thay đổi sau ngày nghiên cứu.

## 2. Thứ tự đề xuất

### Bước 1: cải thiện một tương tác UI

**Ứng viên:** CartDrawer hoặc chuyển bộ lọc catalog bằng Motion. Lý do: ứng dụng React đã có state phù hợp; thay đổi có thể cô lập và kiểm tra trực tiếp. Nếu chỉ cần hiệu ứng rất đơn giản, đánh giá CSS hiện tại trước.

Phạm vi thử nghiệm nên nhỏ: một component, reduced motion, mở/đóng liên tục, mobile và focus. Animation phải phản ánh chính xác response API; không tự đánh dấu booking/thanh toán thành công.

**Điều kiện xong:** hành vi cũ vẫn đúng, không gây chậm thao tác, không mất state và có bằng chứng kiểm tra trên kích thước màn hình mục tiêu.

### Bước 2: tạo quy chuẩn chuyển động

Sau khi có thử nghiệm đạt yêu cầu, chuẩn hóa duration/easing/khoảng dịch chuyển dùng chung. Dùng Anime.js cho vùng choreography riêng nếu có nhu cầu thật; Lottie cho asset minh họa được duyệt.

Không để nhiều engine cùng animate một thuộc tính trên cùng phần tử. Các thông số như 180–250 ms hoặc khoảng dịch chuyển 8–24 px chỉ nên là điểm khởi đầu để thử, không coi là kết quả UX đã đo.

### Bước 3: video promo ngoài flow đặt lịch

Thử một project Remotion riêng với ảnh concept và thông tin gói chụp đã chọn. Tạo một template ngắn, preview và xuất bản thử; thêm FFmpeg khi cần định dạng/thumbnail.

librosa chỉ thêm khi cần nhịp nhạc; WhisperX chỉ thêm khi clip có lời cần phụ đề. Không bắt pipeline phải đi qua tất cả công cụ. Với voiceover Việt, chọn và đánh giá giọng đọc trước khi chọn CosyVoice.

**Điều kiện xong:** có input snapshot, template version, video đầu ra, kết quả kiểm tra hình/âm thanh và thời gian/tài nguyên render.

### Bước 4: pipeline asset hoặc 3D khi có yêu cầu sản phẩm

ComfyUI phục vụ tạo và biên tập asset; Blender MCP phục vụ dựng scene; Three.js phục vụ viewer. Chỉ thêm worker/storage/job API khi sản phẩm thật cần tạo media từ dữ liệu người dùng.

Pathtracer, Jolt, quarks và postprocessing là phần mở rộng có chi phí cần đo. Chưa có bằng chứng chúng cần thiết cho flow đặt lịch hiện tại.

## 3. Bảng quyết định cho các yêu cầu tương lai

| Yêu cầu | Công cụ ứng viên | Cần xác nhận trước khi làm |
| --- | --- | --- |
| Drawer/đổi tab mượt | Motion hoặc CSS | Lifecycle, focus, reduced motion |
| Banner có choreography | Anime.js | Storyboard, cleanup, quyền quản lý thuộc tính |
| Minh họa empty/success | Lottie | Asset, renderer, kích thước và fallback |
| Promo tự thay ảnh/giá | Remotion + FFmpeg | Template, dữ liệu đầu vào, license và đường render |
| Slideshow theo nhạc | Remotion + librosa | Track, beat/offset đã duyệt |
| Hướng dẫn có phụ đề | OBS / WhisperX / Remotion | Audio sạch, alignment tiếng Việt, font |
| Sơ đồ giải thích studio | Manim | Nội dung sơ đồ, cài môi trường render |
| Viewer kiosk 3D | Blender MCP + Three.js | Model, texture, GPU và ảnh fallback |
| Phản xạ chất lượng cao | Pathtracer | Nhánh/version, WebGPU, thời gian hội tụ |
| Va chạm đạo cụ | Jolt + renderer | Binding/WASM, timestep và đồng bộ transform |
| VFX trong scene | Three.quarks | Số hạt, texture, overdraw và renderer tương thích |
| Bloom/grading cảnh WebGL | postprocessing | Color pipeline và ngân sách GPU |
| Tinh chỉnh camera/ánh sáng | Tweakpane | Vai trò dev/admin và giới hạn tham số |
| Tạo background có workflow | ComfyUI | Model/node version, tài nguyên và bước duyệt |
| Voiceover đa ngôn ngữ | CosyVoice sau đánh giá | Ngôn ngữ, checkpoint và chất lượng giọng |
| Lược bỏ đoạn quay thừa | LosslessCut | Keyframe, stream tương thích và audio sync |

Đây là danh sách ứng viên theo nghiên cứu, chưa phải lựa chọn công nghệ cuối cùng hay cam kết hiệu năng.

## 4. Ranh giới kiến trúc đề xuất

- **Frontend:** state UI, animation nhẹ, preview asset/video. Lazy-load phần nặng khi người dùng mở chức năng tương ứng.
- **Backend Express:** API nghiệp vụ và điều phối job nếu có. Giữ tính toán render/ML dài ở tiến trình khác.
- **Media worker tương lai:** Remotion/FFmpeg hoặc dịch vụ Python cho model, analysis, caption. Đóng gói dependency riêng.
- **Storage tương lai:** asset gốc, bản xuất và manifest. Có version/checksum để truy lại nguồn tạo media.

Tên folder, queue provider và endpoint cần thiết kế khi triển khai thật; hiện chưa tạo thêm package/service/schema database.

## 5. Ghi nhớ về tương thích

| Quyết định / nhận định | Cơ sở | Trạng thái |
| --- | --- | --- |
| Motion là ứng viên đầu tiên cho UI React | `motion/react`, state/layout API và stack hiện có | Đề xuất, chưa benchmark |
| Giữ project video tách khỏi ứng dụng đặt lịch ở thử nghiệm đầu | Cô lập môi trường render và phạm vi tính năng | Đề xuất kiến trúc |
| Không thay confetti 2D bằng VFX 3D chỉ để có thư viện mới | `canvas-confetti` đã có trong code | Đề xuất giảm chi phí tích hợp |
| Chưa chọn CosyVoice cho voiceover Việt | Danh sách ngôn ngữ chính thức chưa có Việt | Hạn chế từ nguồn, chưa chạy thử |
| WhisperX có mapping alignment Việt | `DEFAULT_ALIGN_MODELS_HF['vi']` | Đã đọc source; chưa đánh giá accuracy |
| Không mặc định ghép WebGPU pathtracer với composer WebGL | README/API của hai dự án ở mốc nghiên cứu | Cần prototype tương thích |
| Nghiên cứu không xác nhận package mới đã cài | Manifest dependency hiện tại | Đã đối chiếu file |

Nguồn kỹ thuật: [Motion](https://motion.dev/docs/react-animation), [CosyVoice model card](https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512), [WhisperX alignment](https://github.com/m-bain/whisperX/blob/main/whisperx/alignment.py), [pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer), [postprocessing](https://github.com/pmndrs/postprocessing).

## 6. Mẫu cập nhật sau khi triển khai thật

Mỗi thử nghiệm thêm một bản ghi:

```text
Ngày:
Mục tiêu / component:
Repo/package và version/commit:
Môi trường: OS, browser, CPU/GPU; Python/CUDA nếu dùng
Input / asset / model / workflow version:
Đã chạy lệnh hoặc kiểm tra nào:
Output / screenshot / log:
Kết quả, giới hạn và quyết định tiếp theo:
```

Tới thời điểm tạo tài liệu, chưa có bản ghi thực nghiệm toolkit. Dùng mẫu trên để lần sau phân biệt kiến thức từ tài liệu với bằng chứng trên dự án.
