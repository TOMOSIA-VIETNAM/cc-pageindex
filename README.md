# cc-pageindex

Skill cho Claude Code để hỏi đáp trên tài liệu dài: báo cáo, hợp đồng, spec màn hình tiếng Nhật, sách nội bộ.

Tài liệu được index một lần thành cây mục lục. Khi hỏi, công cụ xếp hạng các mục ngay trên máy — không gọi model, không tốn token — rồi Claude chỉ đọc đúng vài mục liên quan thay vì nuốt cả tài liệu.

Hỗ trợ file PDF (kể cả bản scan) và thư mục AsciiDoc (`.adoc`).

## Cài đặt

Cần Python 3.12 trở lên. Có [uv](https://github.com/astral-sh/uv) thì nhanh hơn, không có cũng chạy.

```bash
git clone git@github.com:tms-minhtang1/cc-pageindex.git
cd cc-pageindex
./install.sh
```

Windows chạy `.\install.ps1` thay cho `./install.sh`.

Script dựng môi trường Python riêng rồi liên kết skill vào `~/.claude/skills/`. Mở session Claude Code ở thư mục nào cũng dùng được.

Gỡ: `./install.sh --uninstall`.

## Dùng

Nói chuyện với Claude, không cần gõ lệnh.

**Lần đầu với một tài liệu — index:**

```
Dùng skill pageindex, index file ~/Documents/bao-cao-2025.pdf
```

Mất vài phút cho tài liệu dài: dựng cây rất nhanh, phần lâu là viết tóm tắt cho từng mục. Chỉ làm một lần cho mỗi tài liệu.

Thư mục spec AsciiDoc cũng vậy:

```
Index thư mục ~/code/du-an/documents/spec-docs/admin/会員管理
```

**Sau đó — hỏi:**

```
Dùng skill pageindex. Trong báo cáo 2025, doanh thu quý 3 là bao nhiêu?
```

Claude trả lời kèm số trang, hoặc tên file và dòng với tài liệu AsciiDoc. Bấm theo trích dẫn để kiểm chứng.

**Hỏi ở session mới không cần index lại.** Tài liệu đã index nằm trong kho dùng chung, mọi session đều thấy.

## Xem kho tài liệu

```bash
PI=~/.claude/skills/pageindex

$PI/.venv/bin/python $PI/tools/pi.py list           # tài liệu đã có
$PI/.venv/bin/python $PI/tools/pi.py tree <tên>     # cây mục lục + tình trạng tóm tắt
$PI/.venv/bin/python $PI/tools/pi.py html --out xem.html   # trang web xem cây, tìm kiếm được
```

`xem.html` mở bằng trình duyệt, gấp mở từng nhánh, tìm theo tên bảng hay tên cột.

## Dữ liệu nằm ở đâu

| Hệ điều hành | Đường dẫn |
| --- | --- |
| macOS, Linux | `~/.local/share/pageindex` |
| Windows | `%LOCALAPPDATA%\pageindex` |

Đổi bằng biến môi trường `PAGEINDEX_STORE`.

Kho này chứa **bản sao toàn bộ nội dung tài liệu đã index**. Đừng đặt trong thư mục được đồng bộ lên mây (Documents của iCloud, OneDrive) nếu tài liệu là của khách hàng. Đừng commit vào git.

## Giới hạn

- Ảnh trong tài liệu chưa được đọc. Câu hỏi về bố cục màn hình hay nội dung nằm trong ảnh sẽ trả lời thiếu.
- Xếp hạng theo từ khoá, không theo ngữ nghĩa. Hỏi bằng từ khác hẳn chữ trong tài liệu thì kết quả kém — dùng đúng từ tài liệu dùng.
- Câu bắt liệt kê cả tài liệu ("có những nhân vật nào") không hợp với xếp hạng; Claude sẽ chuyển sang đọc toàn bộ cây mục lục, chậm hơn.
