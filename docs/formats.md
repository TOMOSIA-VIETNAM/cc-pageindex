# Định dạng tài liệu

Chia hai nhóm, khác nhau ở chỗ **index có tốn token hay không**.

## Có sẵn cấu trúc — index không tốn token

File đã ghi sẵn cấp bậc tiêu đề, công cụ đọc thẳng, xong trong vài giây.

| Định dạng | Cây mục lục lấy từ | Trích dẫn ra |
| --- | --- | --- |
| `.pdf` có text | Bố cục trang và bookmark | Số trang |
| `.docx` | Style `Heading 1..9` của Word | Số dòng |
| `.pptx` | Mỗi slide một mục | Số slide |
| Thư mục `.adoc` | Cấp `=` của AsciiDoc | Tên file và dòng |
| `.md` | Tiêu đề `#` | Số dòng |

## Không có cấu trúc — index tốn thêm một lượt đọc

Không có gì trong file nói đâu là tiêu đề, nên Claude phải đọc hết rồi tự xác định bố cục.

| Định dạng | Claude phải đọc gì |
| --- | --- |
| `.pdf` bản scan | Từng trang dưới dạng ảnh, rồi viết lại thành markdown có tiêu đề |
| `.txt` | Toàn bộ text, rồi viết ra danh sách tiêu đề kèm số dòng |
| `.docx` viết toàn body text, không dùng style Heading | Như `.txt` |

## Token đi đâu

Dù tài liệu thuộc nhóm nào, sau khi dựng cây vẫn cần một lượt Claude viết tóm tắt cho từng mục — **đó mới là phần tốn token chính**. Nhóm không có cấu trúc chỉ tốn thêm một lượt đọc ở trước.

Chi phí này trả **một lần cho mỗi tài liệu**. Index xong thì hỏi bao nhiêu lần cũng không tốn token cho việc tra cứu.

Số đo thật:

| Tài liệu | Dựng cây | Viết tóm tắt |
| --- | --- | --- |
| Sách 131 trang tiếng Việt, có text layer | 5 giây, 0 token | ~315 nghìn token |
| 230 file `.adoc` tiếng Nhật | 6,7 giây, 0 token | tuỳ số mục |

## Không hỗ trợ

`.doc`, `.ppt` (bản nhị phân cũ), `.xls`, `.xlsx`.

Chuyển sang một định dạng ở trên trước. Riêng bảng tính không có cấp bậc để dựng cây — nên trích xuất thành tài liệu có tiêu đề rồi mới index.
