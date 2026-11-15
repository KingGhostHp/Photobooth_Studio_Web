# Sổ tay animation, video, 3D và âm thanh

Ngày nghiên cứu: **04/11/2026**, múi giờ Asia/Saigon. Phạm vi: 20 nguồn người dùng cung cấp, phục vụ Photobooth Studio và các dự án media sau này.

## Đọc từ đâu

| Tài liệu | Nội dung |
| --- | --- |
| [Ghi chú 20 công cụ](tool-notes.md) | Cơ chế, API đáng nhớ, cách bắt đầu, giới hạn và trường hợp sử dụng |
| [Quy trình và ví dụ](workflows.md) | Phối hợp công cụ, quy đổi thời gian, đoạn mã tham khảo, kiểm tra đầu ra |
| [Áp dụng cho Photobooth Studio](photobooth-plan.md) | Đối chiếu code hiện tại, thứ tự triển khai đề xuất, điều kiện để chọn công cụ |
| [Danh mục nguồn](sources.md) | Repo đầy đủ, commit đã đọc, tài liệu chính thức bổ sung |
| [Dữ liệu nguồn có cấu trúc](sources.json) | 20 commit, đường dẫn README cố định theo commit và SHA-256 của tài liệu đã tải |

## Phạm vi và mức độ xác minh

Đã đọc README của cả 20 repo; đọc bổ sung tài liệu chính thức và một số implementation/example: Remotion markup, API WebGPU pathtracer, EffectComposer, ComfyUI API example, librosa beat tracker và WhisperX alignment. Đây là tổng hợp từ các phần được chọn, chưa phải kiểm toán toàn bộ mã nguồn hay kiểm thử tích hợp cả 20 công cụ.

URL trong tin nhắn có nhiều nhãn bị rút gọn. Danh mục nguồn dùng repo được xác minh theo tên và chủ sở hữu; hai URL `t.co` được thử truy cập không trả được nội dung qua công cụ đọc web. Vì vậy không coi tất cả short link đã được kiểm chứng chuyển hướng. Mục Lottie chọn bản **lottie-web** phù hợp dự án web; MCP for Blender chọn **ahujasid/mcp-for-blender**, tên trước đây là blender-mcp. [Nguồn Lottie](https://github.com/airbnb/lottie-web), [nguồn Blender MCP](https://github.com/ahujasid/mcp-for-blender).

Các mục ghi **Đề xuất cho dự án** là suy luận kỹ thuật từ nhu cầu và code hiện tại. Các ví dụ chỉ là mẫu để triển khai sau; đợt nghiên cứu này không cài thêm các thư viện, tải model, tạo worker hay thay đổi giao diện. Commit nhánh phát triển trong `sources.json` không đồng nghĩa phiên bản package đang phát hành.

## Bảng chọn công cụ

| # | Công cụ | Chọn khi cần | Nơi chạy / đầu ra | Điều phải nhớ |
| --- | --- | --- | --- | --- |
| 01 | [Remotion](tool-notes.md#01-remotion) | Video từ React và dữ liệu | Studio, renderer / video | Tính hình ảnh theo frame |
| 02 | [Remotion Skills](tool-notes.md#02-remotion-skills) | Hướng dẫn agent làm video | Tài liệu / quy tắc làm việc | Không phải thư viện render |
| 03 | [Anime.js](tool-notes.md#03-animejs) | Chuỗi chuyển động DOM/SVG | Browser / animation | Timeline, scope và cleanup |
| 04 | [Motion](tool-notes.md#04-motion) | Chuyển trạng thái, bố cục React | Browser / UI | `layout`, `AnimatePresence` |
| 05 | [Manim](tool-notes.md#05-manim) | Sơ đồ, toán, giải thích | Python / video | Chọn đúng Manim Community |
| 06 | [Lottie](tool-notes.md#06-lottie-web) | Animation thiết kế sẵn | Browser / SVG, canvas | JSON và asset đi kèm |
| 07 | [MCP for Blender](tool-notes.md#07-mcp-for-blender) | Agent dựng và sửa scene | Blender + MCP / scene, render | Cầu điều khiển ứng dụng 3D |
| 08 | [Three.js](tool-notes.md#08-threejs) | Scene 3D tương tác | Browser / canvas | Quản lý GPU và tài nguyên |
| 09 | [Three GPU Pathtracer](tool-notes.md#09-three-gpu-pathtracer) | Ánh sáng, phản xạ nhiều mẫu | GPU / ảnh hội tụ dần | Kiểm tra nhánh và WebGPU |
| 10 | [Jolt Physics](tool-notes.md#10-jolt-physics) | Va chạm, rigid/soft bodies | Native; web qua binding / mô phỏng | Vật lý tách khỏi render |
| 11 | [postprocessing](tool-notes.md#11-postprocessing) | Bloom, DOF, color grading | Three.js WebGL / canvas | Pipeline màu và thứ tự effect |
| 12 | [Three.quarks](tool-notes.md#12-threequarks) | Particles, trails, VFX 3D | Three.js / canvas | Cập nhật delta và giới hạn hạt |
| 13 | [Tweakpane](tool-notes.md#13-tweakpane) | Tinh chỉnh scene trực tiếp | Browser / bảng tham số | API v4 dùng `addBinding` |
| 14 | [ComfyUI](tool-notes.md#14-comfyui) | Workflow tạo media bằng model | Dịch vụ Python / media | Graph, model và API queue |
| 15 | [CosyVoice](tool-notes.md#15-cosyvoice) | Sinh giọng đọc | Python + model / audio | Tiếng Việt chưa được xác nhận |
| 16 | [librosa](tool-notes.md#16-librosa) | Phân tích nhạc, tìm beat | Python / dữ liệu thời gian | Audio frame khác video frame |
| 17 | [WhisperX](tool-notes.md#17-whisperx) | Transcript và mốc từng từ | Python + model / JSON, subtitle | ASR, alignment, diarization khác nhau |
| 18 | [OBS Studio](tool-notes.md#18-obs-studio) | Quay màn hình, camera, stream | Desktop / bản ghi | Chọn nguồn, track và container |
| 19 | [LosslessCut](tool-notes.md#19-losslesscut) | Lược bỏ nhanh đoạn thừa | Desktop / media đã cắt | Điểm cắt chịu giới hạn keyframe |
| 20 | [FFmpeg](tool-notes.md#20-ffmpeg) | Chuyển mã, ghép và xuất bản | CLI, worker / media | Container khác codec; probe trước |

Chi tiết và dẫn nguồn cho từng dòng nằm trong [ghi chú công cụ](tool-notes.md); bảng này là chỉ mục lựa chọn, không phải xác nhận mọi tổ hợp đều tương thích.

## Những điều cần nhớ lâu dài

1. **Tách animation giao diện và video.** UI phản hồi thao tác; video phải lấy đúng cùng hình ảnh khi yêu cầu lại cùng frame. Remotion dùng `useCurrentFrame()` và cấu hình FPS; không mang nguyên CSS animation/timer của UI sang composition. [Core idea](https://www.remotion.dev/docs/idea), [markup](https://github.com/remotion-dev/skills/blob/main/skills/remotion-markup/SKILL.md).
2. **Đọc đúng đời API.** Anime.js v4 dùng named imports; Motion React dùng `motion/react`; Tweakpane v4 dùng ESM. Ví dụ từ bài viết cũ cần đối chiếu lại. [Anime.js](https://github.com/juliangarnier/anime), [Motion](https://motion.dev/docs/react-animation), [Tweakpane](https://github.com/cocopon/tweakpane).
3. **Không suy ra chất lượng từ tên công cụ.** Beat là ước lượng; alignment có thể thiếu mốc; path tracing cần tích lũy mẫu. Cần kiểm tra đầu ra thực tế. [librosa](https://librosa.org/doc/latest/_modules/librosa/beat.html), [WhisperX](https://github.com/m-bain/whisperX), [pathtracer API](https://github.com/gkjohnson/three-gpu-pathtracer/blob/main/src/webgpu/API.md).
4. **Tiếng Việt cần kiểm chứng riêng.** CosyVoice 3 liệt kê 9 ngôn ngữ, chưa có tiếng Việt; WhisperX có mapping `vi` trong alignment, nhưng đó chưa phải bằng chứng chất lượng cho mọi bản ghi. [CosyVoice](https://github.com/QwenAudio/CosyVoice), [WhisperX alignment](https://github.com/m-bain/whisperX/blob/main/whisperx/alignment.py).
5. **Cắt lossless và cắt chính xác từng frame là hai yêu cầu khác nhau.** Smart Cut có giới hạn; filter/resize/burn caption thường cần mã hóa lại. [LosslessCut](https://losslesscut.app/docs/troubleshooting), [FFmpeg](https://www.ffmpeg.org/ffmpeg.html).

## Khi quay lại sử dụng

Đọc phần công cụ liên quan, mở nguồn theo commit trong `sources.json`, rồi đối chiếu phiên bản package thực sự sẽ cài. Nếu đổi API, model hoặc workflow, cập nhật ghi chú với ngày và bằng chứng mới. Giữ phân biệt giữa trạng thái **đã đọc**, **đã chạy thử**, **đã tích hợp**; hiện bộ tài liệu chỉ xác nhận trạng thái đầu tiên cho toolkit.
