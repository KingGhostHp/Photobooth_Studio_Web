# Ghi chú 20 công cụ

[Về chỉ mục](README.md). Nghiên cứu ngày 04/11/2026. Mỗi mục nêu kiến thức rút ra từ nguồn và cách dùng dự kiến; chưa xác nhận chạy trên máy này. Repo và tài liệu theo commit nằm trong [danh mục nguồn](sources.md).

## 01 Remotion

**Cốt lõi:** composition kết hợp React component với kích thước, FPS và số frame. `useCurrentFrame()` cho biết frame đang render; `useVideoConfig()` cung cấp cấu hình. Frame đầu là 0, frame cuối là `durationInFrames - 1`.

**Đáng nhớ:** tính opacity/vị trí từ frame; dùng `interpolate()` và các thành phần timing thay cho thời gian thực. Studio phục vụ xem trước; render tạo file; Player phục vụ nhúng preview. Cần chọn đường render phù hợp, không coi Player là nút xuất MP4 tự động.

**Bắt đầu:** tạo project riêng bằng `npx create-video@latest`; đăng ký composition, preview trước khi xuất. Giữ phiên bản các package Remotion đồng bộ.

**Giới hạn:** CSS transition/animation không phải nền tảng đúng cho render từng frame. Media, font và tính ngẫu nhiên phải được kiểm soát. Remotion có giấy phép riêng; xem điều kiện chính thức trước khi dùng thương mại.

**Đề xuất cho dự án:** template video giới thiệu gói chụp hoặc slideshow từ ảnh đã chọn.

Nguồn: [repo](https://github.com/remotion-dev/remotion), [core idea](https://www.remotion.dev/docs/idea), [markup](https://github.com/remotion-dev/skills/blob/main/skills/remotion-markup/SKILL.md), [license](https://www.remotion.dev/docs/license/pricing).

## 02 Remotion Skills

**Cốt lõi:** kho hướng dẫn dành cho agent, bổ sung quy trình và kinh nghiệm dùng Remotion. Nó không thay thế package Remotion, Chromium, encoder hay một project video.

**Đáng nhớ:** có các nhánh hướng dẫn tạo video, markup, Studio, render, captions, multimedia, SaaS và nâng cấp. Chỉ đọc phần phù hợp nhiệm vụ. Markup yêu cầu animation bám frame; chuyển giây sang frame theo FPS composition.

**Bắt đầu:** README hướng dẫn `npx skills add remotion-dev/skills`; đây là lệnh tham khảo, chưa thực hiện trong đợt nghiên cứu. Môi trường hiện đã cung cấp các skill Remotion.

**Giới hạn:** hướng dẫn thay đổi theo phiên bản; file skill upstream mới hơn có thể mô tả API chưa có trong package đang cài. Đối chiếu version trước khi sao chép code.

**Đề xuất cho dự án:** dùng như checklist khi làm video promo, caption và worker render; ghi kết quả thực nghiệm vào sổ tay này.

Nguồn: [repo](https://github.com/remotion-dev/skills), [markup skill](https://github.com/remotion-dev/skills/blob/main/skills/remotion-markup/SKILL.md).

## 03 Anime.js

**Cốt lõi:** engine animation cho DOM, CSS, SVG và thuộc tính object JavaScript. Timeline phối hợp nhiều chuyển động bằng vị trí tuyệt đối, tương đối và label.

**Đáng nhớ:** API v4 dùng `animate`, `createTimeline`, `stagger`; không trộn với mẫu `anime({...})` của đời cũ. Với React, tạo scope bám vào root của component trong effect và gọi `scope.revert()` khi cleanup.

**Bắt đầu:** package `animejs`; đọc timeline và React integration. Các duration trong ví dụ mặc định dùng mili giây; kiểm tra cấu hình time unit nếu thay đổi engine.

**Giới hạn:** imperative animation có thể tranh quyền cập nhật cùng thuộc tính với React/CSS/thư viện khác. Cần phân chia phần tử hoặc thuộc tính, dừng vòng lặp khi unmount.

**Đề xuất cho dự án:** chuyển động nhiều lớp trong banner, vẽ đường SVG hoặc thứ tự xuất hiện các frame ảnh; chỉ dùng khi timeline thực sự cần thiết.

Nguồn: [repo](https://github.com/juliangarnier/anime), [timeline](https://animejs.com/documentation/timeline/), [React](https://animejs.com/documentation/getting-started/using-with-react/).

## 04 Motion

**Cốt lõi:** animation khai báo theo trạng thái React. Các thành phần `motion.*` hỗ trợ animation vào/ra, gesture và spring; `layout` chuyển động khi bố cục đổi, `layoutId` kết nối phần tử giữa trạng thái.

**Đáng nhớ:** import từ `motion/react`; dùng `AnimatePresence` bao phần tử conditionally rendered khi cần exit animation. Layout thay đổi qua React render và style/class; giữ key ổn định.

**Bắt đầu:** package `motion`. Dùng `MotionConfig reducedMotion="user"` hoặc `useReducedMotion()` để điều chỉnh chuyển động. Duration thường tính bằng giây.

**Giới hạn:** animation không tự giải quyết focus, bàn phím hay semantics của dialog. Thay đổi layout có thể làm ảnh/chữ biến dạng khi scale; cần chọn kiểu chuyển động phù hợp.

**Đề xuất cho dự án:** ứng viên đầu tiên cho CartDrawer, lọc catalog, đổi tab và trạng thái đặt chỗ vì code hiện là React.

Nguồn: [repo](https://github.com/motiondivision/motion), [animation](https://motion.dev/docs/react-animation), [layout](https://motion.dev/docs/react-layout-animations), [accessibility](https://motion.dev/docs/react-accessibility).

## 05 Manim

**Cốt lõi:** mô tả animation bằng Python, tổ chức theo `Scene`, các đối tượng đồ họa và lời gọi `self.play(...)`. Phù hợp trình bày quan hệ, đồ thị, công thức và biến đổi hình học.

**Đáng nhớ:** chọn Manim Community tại `ManimCommunity/manim`, không trộn hướng dẫn/API từ bản `3b1b/manim`. `Text` và `MathTex` có yêu cầu khác nhau; công thức TeX cần môi trường tương ứng.

**Bắt đầu:** theo hướng dẫn cài cho hệ điều hành; render cảnh thử ở chất lượng thấp trước. README có mẫu `manim -p -ql example.py SquareToCircle`.

**Giới hạn:** là quy trình xuất animation, không phải thư viện tương tác trực tiếp cho React. Font tiếng Việt và dependency native cần thử thực tế.

**Đề xuất cho dự án:** video giải thích quy trình thuê đồ hoặc sơ đồ ánh sáng studio; không ưu tiên cho drawer hay gallery web.

Nguồn: [repo](https://github.com/ManimCommunity/manim), [quickstart](https://docs.manim.community/en/stable/tutorials/quickstart.html).

## 06 Lottie Web

**Cốt lõi:** phát dữ liệu animation JSON xuất qua hệ sinh thái Bodymovin/After Effects. Chọn `lottie-web` cho web; bản Android/iOS là những repo khác.

**Đáng nhớ:** `loadAnimation()` nhận container và `path` hoặc `animationData`; renderer có SVG/canvas/HTML. Điều khiển bằng `play`, `pause`, `goToAndStop`, và hủy bằng `destroy()`.

**Bắt đầu:** package `lottie-web`; thử một asset đơn giản ở renderer định dùng. Lưu cả JSON lẫn hình/font phụ thuộc nếu có.

**Giới hạn:** không phải mọi hiệu ứng After Effects đều tương đương trên mọi renderer. “Vector” không đảm bảo file nhỏ hoặc render rẻ; asset có thể chứa ảnh raster. Khi không cần chuyển động, cung cấp trạng thái tĩnh và tránh vòng lặp vô hạn.

**Đề xuất cho dự án:** minh họa trạng thái trống hoặc xác nhận thành công có thiết kế sẵn. Việc xác nhận thanh toán vẫn dựa vào backend.

Nguồn: [repo và API](https://github.com/airbnb/lottie-web), [docs](https://airbnb.io/lottie/).

## 07 MCP for Blender

**Cốt lõi:** addon trong Blender nhận lệnh qua kết nối với MCP server; agent có thể đọc scene, chạy Python, thao tác vật thể/material và kiểm tra hình ảnh. Đây là tích hợp bên thứ ba.

**Đáng nhớ:** repo/package hiện mang tên `mcp-for-blender`, trước đây là `blender-mcp`. Cần đúng cặp addon/server và Blender đang kết nối; chỉ cài package Python chưa đủ.

**Bắt đầu:** đọc README tại commit đã lưu và kiểm tra trạng thái kết nối. Khi dựng scene: chia bước, đặt tên object rõ, lưu `.blend`, kiểm tra bằng nhiều góc nhìn trước khi render/xuất asset.

**Giới hạn:** lời nhắc không bảo đảm hình học đẹp hay đúng tỷ lệ. Python có quyền sửa scene và truy cập môi trường; README có phần telemetry cần hiểu trước khi dùng dữ liệu khách hàng.

**Đề xuất cho dự án:** dựng mô hình kiosk/phòng chụp rồi xuất GLB hoặc render ảnh; Blender không nằm trong frontend bundle.

Nguồn: [repo, kiến trúc, đổi tên và telemetry](https://github.com/ahujasid/mcp-for-blender).

## 08 Three.js

**Cốt lõi:** scene graph gồm geometry, material, mesh, light và camera; renderer biến scene thành hình ảnh. Repo hỗ trợ các hướng WebGL/WebGPU và có addon riêng.

**Đáng nhớ:** vòng render và resize canvas phải gắn với lifecycle. Khi thay model hoặc rời component, dừng loop và giải phóng texture, material, geometry bằng `dispose()`; bỏ object khỏi scene chưa đủ.

**Bắt đầu:** package `three`; tạo một scene/camera/renderer đơn giản trước khi thêm loader, control và model. Kiểm tra khả năng GPU và giới hạn asset trên thiết bị mục tiêu.

**Giới hạn:** không tự tạo model, không tự mô phỏng vật lý và không tự render ảnh photorealistic. Ảnh texture nén nhỏ trên đĩa vẫn có thể dùng nhiều bộ nhớ GPU.

**Đề xuất cho dự án:** preview kiosk hoặc không gian studio 3D; luôn có ảnh thay thế nếu tải scene thất bại.

Nguồn: [repo](https://github.com/mrdoob/three.js), [cleanup](https://threejs.org/manual/pages/cleanup.html).

## 09 Three GPU Pathtracer

**Cốt lõi:** render ánh sáng vật lý bằng nhiều sample tích lũy; đánh đổi thời gian/GPU để giảm nhiễu. Dùng acceleration structure để truy vấn giao cắt.

**Đáng nhớ:** README ở commit đã đọc dùng `three/webgpu` và `WebGPUPathTracer` từ `three-gpu-pathtracer/webgpu`; ghi rõ yêu cầu WebGPU. Sau `setScene`, gọi `renderSample()` để tích lũy mẫu; kiểm tra API cập nhật/reset khi đổi scene hoặc camera.

**Bắt đầu:** chạy basic example với phiên bản tương thích. Đối chiếu package đã phát hành với nhánh `main`; không ghép ví dụ WebGL cũ vào API WebGPU mới.

**Giới hạn:** README giới hạn material được hỗ trợ. Scene chuyển động liên tục gây khó hội tụ. Không mặc định nối trực tiếp với `pmndrs/postprocessing` dành cho WebGL.

**Đề xuất cho dự án:** thử cho ảnh hero chất lượng cao hoặc viewer chuyên biệt; chưa chọn làm mặc định trên trang đặt lịch.

Nguồn: [README](https://github.com/gkjohnson/three-gpu-pathtracer), [WebGPU API](https://github.com/gkjohnson/three-gpu-pathtracer/blob/main/src/webgpu/API.md).

## 10 Jolt Physics

**Cốt lõi:** engine C++ cho collision, rigid bodies, constraints và soft bodies. Nó tính trạng thái vật lý; renderer chịu trách nhiệm hiển thị.

**Đáng nhớ:** web dùng bản port/binding riêng `JoltPhysics.js` qua Emscripten. Chọn timestep ổn định, collision layer và collider phù hợp; đồng bộ transform sang scene render.

**Bắt đầu:** đọc HelloWorld và sample tương ứng; trên web kiểm tra cách tải WASM và bản build phù hợp. Bản đa luồng cần xem yêu cầu môi trường riêng của binding.

**Giới hạn:** không phải package JSX cài vào là có vật lý. Determinism có điều kiện theo tài liệu; không suy ra kết quả giống tuyệt đối trên mọi build. Soft body không tự tạo giải pháp thử trang phục đúng kích cỡ.

**Đề xuất cho dự án:** chỉ thử nếu có tương tác 3D cần va chạm thực sự, ví dụ đạo cụ rơi hoặc kéo thả trong scene.

Nguồn: [JoltPhysics](https://github.com/jrouwe/JoltPhysics), [JavaScript/WASM](https://github.com/jrouwe/JoltPhysics.js).

## 11 postprocessing

**Cốt lõi:** chuỗi xử lý ảnh render của Three.js. `EffectComposer` chạy các pass; thường mở bằng `RenderPass`, sau đó `EffectPass` với bloom hoặc effect khác.

**Đáng nhớ:** cần peer dependency `three`. Quy trình màu ảnh hưởng trực tiếp kết quả: README hướng dẫn dùng `NoToneMapping` ở renderer, buffer độ chính xác cao khi cần HDR và tone mapping cuối pipeline.

**Bắt đầu:** `npm install three postprocessing`, chạy một effect rồi đo hiệu năng. Đọc đúng API package này, không lẫn với `EffectComposer` addon của Three.js hoặc React wrapper.

**Giới hạn:** mỗi effect có chi phí, cần depth/buffer tương ứng. Tài liệu đang xét dùng WebGLRenderer; không mặc định chạy với WebGPURenderer hay API pathtracer mới.

**Đề xuất cho dự án:** bloom/DOF nhẹ cho cảnh 3D có sẵn, tránh xử lý quá mức làm sai màu trang phục.

Nguồn: [README](https://github.com/pmndrs/postprocessing), [EffectComposer implementation](https://github.com/pmndrs/postprocessing/blob/main/src/core/EffectComposer.js).

## 12 Three.quarks

**Cốt lõi:** particle/VFX engine cho Three.js, với emitter, lifetime, material và hành vi như đổi màu/kích thước hoặc trails.

**Đáng nhớ:** thêm hệ hạt vào `BatchedRenderer`, gọi `update(delta)` từ loop. Có thể thiết kế effect rồi tải JSON qua `QuarksLoader`. README giới thiệu `quarks.r3f` cho React Three Fiber.

**Bắt đầu:** package `three.quarks`; thử giới hạn ít hạt, lifetime ngắn, kiểm tra texture và transparency. Tách cấu hình effect khỏi logic nghiệp vụ.

**Giới hạn:** batch giúp giảm draw calls nhưng không loại bỏ chi phí overdraw. README vẫn có mục WebGPU trong roadmap; không coi tương thích WebGPU là điều mặc định.

**Đề xuất cho dự án:** ánh sáng lấp lánh trong scene 3D. Với confetti 2D đơn giản, dự án đã có `canvas-confetti`; ưu tiên đánh giá thư viện đang dùng trước.

Nguồn: [repo và ví dụ](https://github.com/Alchemist0823/three.quarks), [docs](https://quarks.art/).

## 13 Tweakpane

**Cốt lõi:** bảng điều khiển tham số số, màu, boolean, vector; hữu ích để chỉnh scene và quan sát giá trị ngay khi phát triển.

**Đáng nhớ:** v4 là ESM, API binding dùng `pane.addBinding(params, 'name', options)`. Cho slider bằng `min`, `max`, `step`; có import/export trạng thái để lưu preset.

**Bắt đầu:** package `tweakpane`; tạo `Pane`, bind một object cấu hình và xử lý sự kiện thay đổi. Nếu dùng TypeScript, xem yêu cầu type/core của phiên bản chọn.

**Giới hạn:** sửa object imperative không tự làm React render lại; cần nối state/invalidation chủ động. Khi bỏ component, hủy pane và các listener.

**Đề xuất cho dự án:** bảng dev hoặc công cụ quản trị giới hạn để tinh chỉnh lighting, camera, mật độ hạt; chỉ xuất các tham số đã duyệt thành preset cho khách.

Nguồn: [repo](https://github.com/cocopon/tweakpane), [bindings](https://tweakpane.github.io/docs/input-bindings/).

## 14 ComfyUI

**Cốt lõi:** workflow dạng graph kết nối các node và model; có queue thực thi và API để đưa vào pipeline tạo media.

**Đáng nhớ:** JSON bố cục workflow và JSON dùng để gọi API cần phân biệt. Example upstream dùng graph với `class_type`, `inputs`; `POST /prompt` trả ID job, `/ws` phát trạng thái, `/history/{prompt_id}` đọc kết quả.

**Bắt đầu:** chạy workflow mẫu bằng model phù hợp phần cứng trước; lưu workflow, seed, model/checkpoint và phiên bản custom node. Gọi dịch vụ qua backend khi tích hợp.

**Giới hạn:** dependency, GPU/VRAM và tính tương thích phụ thuộc model/node. Seed không bảo đảm tái lập từng bit khi môi trường đổi. Custom node thực thi code; một số node có thể gọi dịch vụ ngoài.

**Đề xuất cho dự án:** tạo ý tưởng background/khung ảnh trong pipeline biên tập có người duyệt; chưa phải tự động sửa mọi ảnh khách.

Nguồn: [repo](https://github.com/Comfy-Org/ComfyUI), [API routes](https://docs.comfy.org/development/comfyui-server/comms_routes), [API example](https://github.com/Comfy-Org/ComfyUI/blob/master/script_examples/basic_api_example.py).

## 15 CosyVoice

**Cốt lõi:** hệ thống text-to-speech với model riêng, hỗ trợ nhiều ngôn ngữ, conditioning giọng và các chế độ streaming tùy đời model.

**Đáng nhớ:** code, model weights, prompt giọng và môi trường inference là những thành phần riêng. Giữ tên/checkpoint model cùng cấu hình sample rate và generation.

**Bắt đầu:** theo môi trường và ví dụ của đúng model; README có yêu cầu submodule và tải checkpoint. Tách môi trường Python khỏi backend Node hiện tại.

**Giới hạn:** README CosyVoice 3 liệt kê Trung, Anh, Nhật, Hàn, Đức, Tây Ban Nha, Pháp, Ý và Nga; chưa xác nhận tiếng Việt. Không suy từ khả năng cross-lingual ra chất lượng tiếng Việt. Dùng giọng mẫu có quyền sử dụng và nghe kiểm tra tên riêng, số, ngắt câu.

**Đề xuất cho dự án:** thử voiceover ngôn ngữ được hỗ trợ; với nội dung Việt cần bài thử/giải pháp giọng đọc phù hợp trước khi cam kết.

Nguồn: [repo và danh sách ngôn ngữ/model](https://github.com/QwenAudio/CosyVoice).

## 16 librosa

**Cốt lõi:** xử lý tín hiệu âm thanh và phân tích nhạc trong Python. Beat tracker ước lượng tempo và mốc beat, phục vụ đổi ảnh/cảnh theo nhạc.

**Đáng nhớ:** `beat_track(y=y, sr=sr, units='time')` trả beat theo giây. Mặc định `units='frames'` là audio analysis frame, không phải frame video. Lưu sample rate, hop length và offset cùng kết quả.

**Bắt đầu:** package `librosa` trong môi trường Python riêng; phân tích một track, xuất JSON thời gian rồi để renderer đọc. Dữ liệu beat thường tính một lần thay vì phân tích lại ở mỗi frame.

**Giới hạn:** beat ước lượng có thể sai, trống hoặc không phù hợp tiết tấu mong muốn. Số BPM không tự cho biết điểm nhấn nghệ thuật và không thay thế bước nghe thử.

**Đề xuất cho dự án:** slideshow lookbook đổi ảnh theo các beat đã duyệt; để người biên tập điều chỉnh offset.

Nguồn: [repo](https://github.com/librosa/librosa), [beat tracker implementation](https://librosa.org/doc/latest/_modules/librosa/beat.html), [rhythm tutorial](https://librosa.org/doc/latest/auto_tutorials/01-intro/06-rhythm.html).

## 17 WhisperX

**Cốt lõi:** pipeline nhận dạng lời nói, forced alignment để tìm thời gian từng từ, và diarization tùy chọn để gắn nhãn người nói. Ba nhiệm vụ này cần phân biệt.

**Đáng nhớ:** ASR xong vẫn cần alignment với model đúng ngôn ngữ. Source hiện có mapping `vi` đến model `nguyenvulebinh/wav2vec2-base-vi-vlsp2020`; không phải bảo đảm accuracy cho mọi giọng Việt.

**Bắt đầu:** package `whisperx`, chọn CPU/GPU và compute type phù hợp; giảm batch size khi thiếu VRAM. Diarization có dependency/model/token riêng.

**Giới hạn:** speech chồng nhau, từ ngoài dictionary và một số số/ký hiệu có thể thiếu thời gian. Không tự gán mốc 0 cho từ chưa align; đưa sang kiểm tra hoặc fallback theo segment.

**Đề xuất cho dự án:** subtitle video hướng dẫn hoặc clip có lời; rà lại tên dịch vụ và tiếng Việt trước xuất.

Nguồn: [README](https://github.com/m-bain/whisperX), [alignment implementation](https://github.com/m-bain/whisperX/blob/main/whisperx/alignment.py).

## 18 OBS Studio

**Cốt lõi:** ứng dụng quay, ghép nguồn, encode và stream hình/âm thanh. Scene chứa nhiều nguồn như cửa sổ ứng dụng, camera và microphone.

**Đáng nhớ:** đặt canvas/output, FPS và các audio track chủ động. MKV là một lựa chọn chống hỏng bản ghi khi dừng bất thường; sau đó remux sang container tương thích với phần mềm dựng.

**Bắt đầu:** tạo scene quay cửa sổ web, kiểm tra vùng hình, tiếng mic và tiếng hệ thống bằng bản quay ngắn. Dùng encoder phù hợp phần cứng.

**Giới hạn:** OBS ghi lại trạng thái chạy thật nên thời gian không xác định như video render theo frame. Không mặc định mọi codec trong MKV đều chuyển nguyên vẹn sang MP4 được.

**Đề xuất cho dự án:** quay walkthrough đặt lịch/thuê đồ, tái hiện lỗi hoặc tạo clip hướng dẫn quản trị bằng dữ liệu demo.

Nguồn: [repo](https://github.com/obsproject/obs-studio), [format guide](https://obsproject.com/kb/audio-video-formats-guide), [recording guide](https://obsproject.com/kb/standard-recording-output-guide).

## 19 LosslessCut

**Cốt lõi:** giao diện cho các thao tác FFmpeg như cắt, ghép và remux với ưu tiên stream copy, giữ chất lượng mã hóa gốc.

**Đáng nhớ:** chọn đoạn theo keyframe khi muốn cắt lossless. Các file muốn ghép phải có stream tương thích; container giống nhau chưa đủ.

**Bắt đầu:** mở bản ghi, đánh dấu đoạn cần giữ, xuất sang file mới và xem lại đầu/cuối đoạn cùng audio sync. Giữ file gốc để có thể đổi điểm cắt.

**Giới hạn:** keyframe cut có thể bắt đầu sớm hơn mốc mong muốn. Smart Cut là chế độ có tái mã hóa một phần và giới hạn tương thích; không đồng nghĩa mọi codec đều cắt chính xác được.

**Đề xuất cho dự án:** bỏ thời gian chờ hoặc thao tác lỗi từ bản quay OBS trước khi dựng caption/title.

Nguồn: [repo](https://github.com/mifi/lossless-cut), [giới hạn điểm cắt](https://losslesscut.app/docs/troubleshooting).

## 20 FFmpeg

**Cốt lõi:** công cụ và thư viện đọc/ghi container, decode/encode, filter, xử lý audio và subtitle. `ffprobe` kiểm tra stream/metadata trước và sau xử lý.

**Đáng nhớ:** `-c copy` sao chép stream không decode/filter/encode; resize, burn caption hoặc grading cần xử lý frame. `-map` chọn stream rõ ràng, tránh dựa hoàn toàn vào tự động chọn.

**Bắt đầu:** dùng binary có codec/filter cần thiết, đọc `ffmpeg -version`, `ffmpeg -encoders`, `ffprobe`; xuất file mới. Không suy ra khả năng binary từ việc có repo nguồn.

**Giới hạn:** đuôi MP4 không cho biết codec hoặc alpha. Tùy build có encoder/filter khác nhau; dự án có nhiều thành phần/giấy phép, cần kiểm tra bản phân phối khi đóng gói.

**Đề xuất cho dự án:** chuẩn hóa video promo, tạo thumbnail và kiểm tra duration/audio sync trong worker xuất media.

Nguồn: [repo](https://github.com/FFmpeg/FFmpeg), [CLI và streamcopy](https://www.ffmpeg.org/ffmpeg.html), [ffprobe](https://ffmpeg.org/ffprobe.html).
