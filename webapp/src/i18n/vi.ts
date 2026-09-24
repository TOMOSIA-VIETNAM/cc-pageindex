import type { Dictionary } from "./en";

const vi: Dictionary = {
  meta: {
    title: "pageindex — đọc tài liệu dài như người thật, ngay trong Claude Code",
    description:
      "Skill cho Claude Code biến PDF, Word, slide và thư mục spec thành cây mục lục, xếp hạng các mục ngay trên máy mà không gọi model, rồi chỉ đọc đúng những trang trả lời được câu hỏi. Không cần API key.",
  },
  nav: {
    how: "Cách hoạt động",
    graph: "Đồ thị",
    install: "Cài đặt",
    github: "GitHub",
    theme: "Đổi giao diện sáng/tối",
    language: "Ngôn ngữ",
  },
  hero: {
    eyebrow: "Skill cho Claude Code · không cần API key",
    title: "Đọc tài liệu 300 trang như một người thật.",
    lead:
      "pageindex biến PDF, Word, slide hay cả thư mục spec thành cây mục lục. Claude nhìn cây, mở đúng vài mục cần thiết, rồi trả lời kèm trang đã đọc. Không embedding, không vector database, không cần key của model.",
    ctaGraph: "Xem đồ thị",
    ctaGithub: "Xem trên GitHub",
    copy: "Sao chép",
    copied: "Đã chép",
    flowPages: "{pages} trang",
    flowSections: "{sections} mục",
    flowAnswer: "Câu trả lời, kèm nguồn",
    flowCite: "trang {from}–{to}",
  },
  graph: {
    title: "Đây là một index thật.",
    caption:
      "{book} — {pages} trang thành {sections} mục trên {levels} tầng. Rê chuột lên một node để thấy đường đi, bấm vòng tròn để gấp nhánh, bấm tên mục để đọc tóm tắt.",
    meta: "{pages} trang · {sections} mục",
    open: "Mở trình xem đầy đủ",
    frameTitle: "Đồ thị các mục của cuốn sách mẫu, thao tác được",
  },
  numbers: {
    pages: "trang trong sách",
    sections: "mục trong cây",
    leaves: "mục lá",
    read: "trang được đọc để trả lời câu hỏi bên dưới",
    keys: "API key",
  },
  problem: {
    title: "Tài liệu dài làm hỏng những cách hỏi quen thuộc",
    items: [
      {
        title: "Dán hết vào chat",
        body: "Đốt token, tràn context, và tài liệu càng dài thì model càng đọc lướt.",
      },
      {
        title: "Băm thành vector",
        body: "Đoạn bị cắt rời khỏi chương của nó, bảng đứt làm đôi, và “nghe giống” không có nghĩa là “chứa câu trả lời”.",
      },
      {
        title: "Đi theo mục lục",
        body: "Tài liệu nghiêm túc nào cũng có sẵn cấu trúc. pageindex giữ nguyên cấu trúc đó, nên tìm câu trả lời trở thành chọn đúng mục — và trích dẫn có sẵn theo.",
      },
    ],
  },
  how: {
    title: "Hai lớp, ranh giới rõ ràng",
    lead: "Công cụ làm phần cơ học và không bao giờ gọi model. Session Claude Code của bạn viết mọi chữ.",
    tool: "công cụ",
    session: "Claude",
    steps: [
      {
        title: "Index một lần",
        body: "Bố cục của PDF, style Heading của Word, cấp tiêu đề AsciiDoc hay tiêu đề slide thành cây mục, lưu ngay trên máy bạn. Trang scan và văn bản thuần thì Claude viết tiêu đề — một lần duy nhất.",
      },
      {
        title: "Xếp hạng tại chỗ",
        body: "Mỗi câu hỏi được so với tiêu đề và tóm tắt theo độ trùng từ, từ càng hiếm càng nặng ký; tiếng Nhật và tiếng Trung được tách thành cụm hai ký tự. Cùng một câu hỏi luôn cho cùng một thứ hạng.",
      },
      {
        title: "Đọc và trích dẫn",
        body: "Claude chỉ mở các mục đứng đầu, kiểm tra chúng có thật sự trả lời được không, rồi đáp kèm số trang, số slide, hoặc tên file và dòng — lần theo là kiểm chứng được.",
      },
    ],
  },
  example: {
    title: "Một câu hỏi, {pages} trang được đọc",
    lead: "Một lần chạy thật trên cuốn sách mẫu. Công cụ xếp hạng mọi mục mà không cần model; Claude đọc {read} mục rồi trả lời.",
    you: "Bạn",
    question: "Shokunin kết hợp Kaizen với AI như thế nào?",
    ranked: "Công cụ xếp hạng — không gọi model",
    readTag: "đã đọc",
    answer:
      "Họ không chọn một trong hai. Shokunin giữ tinh thần Kaizen — cải tiến từng bước nhỏ và liên tục, theo nguyên lý 1% với phép tính (1.01)^365 — và dùng AI như công cụ khuếch đại chính nỗ lực đó. Cải tiến chỉ bền khi trở thành tiêu chuẩn chung, như miếng chèn giữ khẩu pháo không tụt lại khi cả đội kéo pháo lên dốc.",
    score: "điểm {score} · tr. {from}–{to}",
    source: "Nguồn: trang {from}–{to}",
  },
  features: {
    title: "Đồ thị đi kèm skill",
    lead: "ghi ra một file chạy offline. Thứ bạn vừa kéo ở trên chính là file đó.",
    items: [
      { title: "Lần theo mọi đường đi", body: "Rê lên một node hay một cạnh, đường từ gốc chảy tới đó và cả nhánh con sáng lên." },
      { title: "Gấp phần không cần", body: "Bấm vòng tròn để thu gọn một nhánh; node vẫn đứng yên đúng chỗ mắt bạn đang nhìn." },
      { title: "Dạng cây hoặc tỏa tròn", body: "Trái sang phải để đọc tiêu đề, tỏa tròn để thấy toàn bộ hình dáng tài liệu." },
      { title: "Tìm và rà soát", body: "Kết quả sáng lên và tự mở nhánh, Enter để nhảy qua từng kết quả, một cú bấm hiện mọi mục chưa có tóm tắt." },
      { title: "Số liệu trong tầm mắt", body: "Số mục mỗi tầng, mục lá, nhánh đang gấp, và mỗi mục chiếm bao nhiêu phần tài liệu." },
      { title: "Một file, offline", body: "Không server, không CDN, không gì rời khỏi máy. Sáng và tối, chuột, bàn phím và cảm ứng." },
    ],
  },
  formats: {
    title: "Đọc tài liệu đúng như nó vốn là",
    lead: "Phần lớn định dạng đã có sẵn dàn ý, nên index không tốn gì. Hai loại cần Claude đọc qua một lần.",
    free: "không tốn lượt model",
    pass: "một lượt model",
    rows: {
      pdf: { format: "PDF có lớp chữ", source: "bố cục và bookmark" },
      scan: { format: "PDF scan", source: "ảnh trang do Claude đọc" },
      docx: { format: "Word .docx", source: "style Heading 1–9" },
      pptx: { format: "PowerPoint .pptx", source: "mỗi slide một node" },
      md: { format: "Markdown", source: "tiêu đề #" },
      txt: { format: "Văn bản thuần", source: "tiêu đề do Claude viết" },
      adoc: { format: "Thư mục AsciiDoc", source: "cấp =, trích dẫn theo file và dòng" },
    },
  },
  install: {
    title: "Cài trong một phút",
    lead: "Cần uv hoặc Python 3.10+. Script dựng môi trường Python riêng rồi liên kết skill vào ~/.claude/skills.",
    clone: "Clone",
    setup: "Cài",
    windows: "Trên Windows, chạy .\\install.ps1.",
    use: "Rồi hỏi, ở bất kỳ thư mục nào",
    indexPrompt: "Dùng skill pageindex, index file ~/Documents/bao-cao-2025.pdf",
    askPrompt: "Dùng skill pageindex. Doanh thu quý 3 trong báo cáo 2025 là bao nhiêu?",
  },
  cta: {
    title: "Thử với tài liệu dài nhất của bạn.",
    lead: "Cài một lần, index một lần, rồi hỏi từ bất kỳ session Claude Code nào.",
    button: "Lấy trên GitHub",
  },
  footer: {
    builtOn: "Dựng trên PageIndex của VectifyAI, chạy như một skill của Claude Code.",
    notOfficial: "Không phải sản phẩm chính thức của hai bên; tên và logo thuộc về chủ sở hữu tương ứng.",
    sample: "Sách mẫu: “SHOKUNIN IT – Cách người TOMOSIA làm việc” của Lưu Tuấn Anh (TOMOSIA), dùng khi đã được cho phép.",
  },
};

export default vi;
