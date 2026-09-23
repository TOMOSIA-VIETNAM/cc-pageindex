# cc-pageindex

<p align="center">
  <a href="https://pageindex.ai/"><img src="assets/pageindex.png" alt="PageIndex" height="22" style="vertical-align:middle"></a>
  &nbsp;&nbsp;<strong>×</strong>&nbsp;&nbsp;
  <a href="https://claude.com/claude-code"><img src="assets/claude.svg" alt="Claude" height="22" style="vertical-align:middle"></a>
  &nbsp;<strong>Claude Code</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude%20Code-skill-d97757" alt="Claude Code skill">
  <img src="https://img.shields.io/badge/PageIndex-vectorless%20RAG-4e86d2" alt="PageIndex">
  <img src="https://img.shields.io/badge/python-3.10%2B-3776ab?logo=python&logoColor=white" alt="Python 3.10+">
  <img src="https://img.shields.io/badge/macOS%20%C2%B7%20Linux%20%C2%B7%20Windows-lightgrey" alt="macOS, Linux, Windows">
  <img src="https://img.shields.io/badge/pdf%20%C2%B7%20docx%20%C2%B7%20pptx%20%C2%B7%20adoc%20%C2%B7%20md%20%C2%B7%20txt-informational" alt="Định dạng hỗ trợ">
</p>

> Một bộ spec ba trăm trang chẳng trả lời được gì cho tới khi có người mở đúng trang. Dán trọn nó vào chat thì đốt token và tràn context, mà càng dài model càng đọc lướt. Không đưa tài liệu thì nó vẫn trả lời, trôi chảy và sai.
>
> Người thật không làm vậy. Họ liếc mục lục, nhảy thẳng tới mục cần, đọc vài trang rồi trả lời — và chỉ được ra mình lấy từ đâu. Skill này cho Claude làm đúng như thế.

Dùng được với báo cáo, hợp đồng, spec màn hình tiếng Nhật, sách nội bộ — bất cứ thứ gì dài tới mức bạn không muốn đọc lại từ đầu.

```
Bạn:    Trong spec 会員管理, 退会処理 cập nhật cột email thế nào?

Claude: Ghi email thành "<địa chỉ cũ>_<thời điểm hiện tại>", đồng thời đặt
        status = 退会, encrypted_password = chuỗi ngẫu nhiên 20 ký tự đã hash,
        phone_number = NULL, quit_at = thời điểm hiện tại.
        Nguồn: 2.1.会員詳細画面_機能詳細.adoc, dòng 110.
```

## Vì sao không phải vector RAG

Cách quen thuộc là băm tài liệu thành từng đoạn, nhúng mỗi đoạn thành một vector, rồi lấy những đoạn nằm gần câu hỏi nhất trong không gian đó. Cái giá phải trả là cấu trúc: một điều khoản bị cắt rời khỏi mục nó thuộc về, một bảng bị đứt làm đôi, và người đọc mất luôn manh mối rằng đoạn này nằm trong chương nào. Tệ hơn, "gần giống về ngôn từ" không đồng nghĩa với "chỗ chứa câu trả lời" — hỏi quy định nào áp dụng cho một trường hợp, thì đoạn giống câu hỏi nhất thường là đoạn nhắc lại chính câu hỏi, còn đoạn quy định lại dùng từ khác hẳn. Chưa kể bạn phải nuôi thêm một embedding model và một vector database, rồi index lại mỗi lần tài liệu đổi.

PageIndex bỏ hẳn lớp đó. Tài liệu nghiêm túc nào cũng đã có sẵn cấu trúc — mục lục của PDF, style Heading của Word, cấp tiêu đề của AsciiDoc — nên thay vì phá đi rồi dựng lại bằng vector, nó giữ nguyên và biến việc tìm kiếm thành việc đi trong cây mục lục. Claude nhìn cây, chọn mục, mở ra đọc. Vì biết mình đã mở mục nào nên trích dẫn đi kèm là chuyện đương nhiên, không phải tính năng gắn thêm.

Còn nếu chỉ hỏi Claude mà không có lớp này? Nó chỉ nắm được những gì bạn kịp dán vào, và phần còn lại nó lấp bằng suy đoán — nghe rất thuyết phục. Sự khác biệt không nằm ở chỗ model thông minh hơn, mà ở chỗ nó đang đọc đúng trang.

Chi tiết cơ chế: [Cách nó làm việc](docs/how-it-works.md).

## Cài đặt

Cần **[uv](https://github.com/astral-sh/uv)** hoặc **Python 3.10+**. Có uv thì khỏi cài Python, uv tự tải bản nó cần.

```bash
git clone git@github.com:tms-minhtang1/cc-pageindex.git
cd cc-pageindex
./install.sh
```

Windows: `.\install.ps1`. Gỡ: `./install.sh --uninstall`.

Script dựng môi trường Python riêng rồi liên kết skill vào `~/.claude/skills/`. Sau đó mở session Claude Code ở thư mục nào cũng dùng được.

## Dùng

**Index — một lần cho mỗi tài liệu:**

```
Dùng skill pageindex, index file ~/Documents/bao-cao-2025.pdf
```

**Hỏi — ở bất kỳ session nào sau đó:**

```
Dùng skill pageindex. Doanh thu quý 3 trong báo cáo 2025 là bao nhiêu?
```

Claude trả lời kèm trích dẫn: số trang với PDF, số slide với PowerPoint, tên file và dòng với AsciiDoc. Lần theo trích dẫn để kiểm chứng.

Nhận `.pdf` (kể cả bản scan), `.docx`, `.pptx`, `.md`, `.txt`, và thư mục `.adoc`.

## Tìm hiểu thêm

| | |
| --- | --- |
| [Định dạng tài liệu](docs/formats.md) | Loại nào index miễn phí, loại nào tốn token, và vì sao |
| [Cách nó làm việc](docs/how-it-works.md) | Công cụ làm gì, Claude làm gì, luồng trả lời một câu hỏi |
| [Kho tài liệu](docs/store.md) | Nằm ở đâu, chứa gì, cách xem và xoá |

## Giới hạn

Ảnh trong tài liệu chưa được đọc, trừ khi tài liệu là PDF bản scan. Câu hỏi về bố cục màn hình hay nội dung nằm trong ảnh sẽ trả lời thiếu.

---

Dựng trên [PageIndex](https://pageindex.ai/) ([source](https://github.com/VectifyAI/PageIndex)) — tree-index và truy xuất không cần vector — chạy như một skill của [Claude Code](https://claude.com/claude-code). Đây không phải sản phẩm chính thức của hai bên; logo thuộc về chủ sở hữu tương ứng.
