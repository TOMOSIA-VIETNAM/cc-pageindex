# Thư mục tài liệu thiết kế

Mỗi hạng mục công việc một thư mục con, đặt tên theo thứ nó tạo ra, không đánh số. Tên thư mục là thứ được nhắc đến ở nơi khác, nên không đổi tên sau khi đã có người tham chiếu tới.

Trong mỗi thư mục, đặt tên file theo vai trò:

| File | Nội dung |
| --- | --- |
| `Proposal.md` | Đề xuất kỹ thuật: vì sao làm, kiến trúc, cái gì đã kiểm chứng, cái gì còn treo |
| `SPEC.md` | Cái sẽ build: mục tiêu, ranh giới, chức năng, giao diện, cách kiểm thử |
| `PLAN.md` | Thứ tự làm: phụ thuộc giữa các việc, điều kiện hoàn thành, rủi ro |

Không bắt buộc đủ cả ba. Hạng mục nhỏ có thể chỉ cần một file.

## Đang có

| Thư mục | Hạng mục | Trạng thái |
| --- | --- | --- |
| `document-retrieval-skill/` | Lớp truy xuất tài liệu dùng PageIndex, đóng gói thành skill cho Claude Code | Đã build, đã chạy trên tài liệu thật |
| `internal-qa-webapp/` | Webapp chat nội bộ hỏi đáp trên lớp truy xuất đó | Mới có spec và plan, chưa viết code |
