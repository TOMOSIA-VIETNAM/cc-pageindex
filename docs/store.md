# Kho tài liệu

## Nằm ở đâu

| Hệ điều hành | Đường dẫn |
| --- | --- |
| macOS, Linux | `$XDG_DATA_HOME/pageindex`, mặc định `~/.local/share/pageindex` |
| Windows | `%LOCALAPPDATA%\pageindex` |

Đổi bằng biến môi trường `PAGEINDEX_STORE`. Công cụ từ chối kho đặt trong thư mục tạm của hệ điều hành — kho chết theo phiên làm việc thì lần sau phải index lại từ đầu.

Mọi session và mọi dự án dùng chung một kho.

## Chứa gì

Định dạng kho local của thư viện `pageindex`:

```
manifest.json                 danh sách tài liệu
docs/<doc_id>/doc.json        tên, mô tả, số đơn vị đọc, đường dẫn nguồn
docs/<doc_id>/tree.json       cây mục lục + tóm tắt
docs/<doc_id>/pages.json      nguyên văn đã cắt theo đơn vị đọc
```

`pages.json` là **bản sao toàn bộ nội dung tài liệu**. Đừng đặt kho trong thư mục đồng bộ lên mây (Documents của iCloud, OneDrive) nếu tài liệu là của khách hàng — nội dung sẽ bị đẩy lên cloud, và cơ chế ghi atomic của kho hỏng khi bị sync. Đừng commit vào git.

## Xem kho

```bash
PI=~/.claude/skills/pageindex

$PI/.venv/bin/python $PI/tools/pi.py list           # tài liệu đã có
$PI/.venv/bin/python $PI/tools/pi.py tree <tên>     # cây mục lục + tình trạng tóm tắt
$PI/.venv/bin/python $PI/tools/pi.py html --out xem.html
```

`xem.html` mở bằng trình duyệt. Tab Graph vẽ các mục thành đồ thị node trên một board: kéo để di chuyển, ⌘/Ctrl + cuộn để zoom, click vòng tròn để gấp mở nhánh, click tên mục để xem tóm tắt, hover để thấy đường đi từ gốc. Card góc trên trái cho số mục, số tầng, số mục mỗi tầng, số mục chưa tóm tắt và số nhánh đang gấp; panel của mỗi mục cho số mục bên dưới và phần tài liệu mục đó phủ. Tab List là dạng danh sách gấp mở được. Cả hai tìm được theo tên bảng hay tên cột. Trang này nhúng nguyên văn tóm tắt của tài liệu — gửi cho ai thì cân nhắc như gửi chính tài liệu.

## Xoá một tài liệu

```bash
$PI/.venv/bin/python $PI/tools/pi.py remove <tên>
```
