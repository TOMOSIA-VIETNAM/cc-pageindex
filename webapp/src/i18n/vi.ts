import type { Dictionary } from "./en";

const vi: Dictionary = {
  meta: {
    title: "cc-pageindex — Claude đọc tài liệu dài như người thật",
    description:
      "Skill cho Claude Code: biến PDF, Word, slide hay cả thư mục spec thành mục lục, tự tìm đúng mục cần đọc ngay trên máy, rồi trả lời kèm số trang. Không cần API key.",
  },
  nav: {
    how: "Cách hoạt động",
    graph: "Xem thử",
    install: "Cài đặt",
    github: "GitHub",
    theme: "Đổi giao diện sáng/tối",
    language: "Ngôn ngữ",
  },
  hero: {
    eyebrow: "Skill cho Claude Code · không cần API key",
    title: "Tài liệu 300 trang, Claude chỉ đọc đúng vài trang cần thiết.",
    lead:
      "Để trả lời một câu hỏi, chẳng ai đọc lại cả cuốn sách — người ta mở mục lục, lật tới đúng chương, đọc vài trang là xong. pageindex giúp Claude làm y như vậy với PDF, Word, slide hay cả thư mục spec. Không embedding, không vector database, cũng chẳng cần API key.",
    ctaGraph: "Kéo thử đồ thị",
    ctaGithub: "Xem trên GitHub",
    copy: "Sao chép",
    copied: "Đã sao chép",
    flowPages: "{pages} trang",
    flowSections: "{sections} mục",
    flowAnswer: "Câu trả lời kèm nguồn",
    flowCite: "trang {from}–{to}",
  },
  graph: {
    title: "Đây là index thật, không phải ảnh minh hoạ.",
    caption:
      "Cuốn {book} dày {pages} trang, được chia thành {sections} mục trên {levels} cấp. Rê chuột vào một mục để thấy đường đi từ gốc, bấm vào vòng tròn để gập nhánh, bấm vào tên mục để đọc tóm tắt.",
    meta: "{pages} trang · {sections} mục",
    open: "Mở toàn màn hình",
    frameTitle: "Đồ thị mục lục của cuốn sách mẫu, có thể kéo, phóng to và bấm thử",
  },
  numbers: {
    pages: "trang sách",
    sections: "mục trong mục lục",
    leaves: "mục không chia nhỏ thêm",
    read: "trang Claude thật sự đọc để trả lời câu hỏi bên dưới",
    keys: "API key phải có",
  },
  problem: {
    title: "Hỏi về tài liệu dài, cách quen thuộc nào cũng hụt",
    items: [
      {
        title: "Dán hết vào khung chat",
        body: "Tốn token, tràn context, mà tài liệu càng dài thì model càng đọc lướt và bỏ sót.",
      },
      {
        title: "Cắt nhỏ rồi tìm bằng vector",
        body: "Mỗi đoạn bị tách khỏi chương của nó, bảng biểu đứt làm đôi. Mà đoạn “nghe na ná” câu hỏi chưa chắc đã là đoạn có câu trả lời.",
      },
      {
        title: "Lần theo mục lục",
        body: "Tài liệu tử tế nào cũng có sẵn mục lục. pageindex giữ nguyên nó, nên tìm câu trả lời chỉ còn là chọn đúng mục — và đã biết mình đọc ở đâu thì trích nguồn là chuyện đương nhiên.",
      },
    ],
  },
  how: {
    title: "Việc tay chân để máy lo, việc suy nghĩ để Claude",
    lead: "Công cụ chỉ làm phần cơ học và không bao giờ gọi model. Từng chữ trong câu trả lời đều do chính session Claude Code của bạn viết.",
    tool: "công cụ",
    session: "Claude",
    steps: [
      {
        title: "Index một lần là xong",
        body: "Công cụ dựng mục lục từ bố cục của PDF, style Heading của Word, cấp tiêu đề AsciiDoc hay tiêu đề từng slide, rồi lưu ngay trên máy bạn. Gặp bản scan hay file text trơn thì Claude đọc qua một lượt và tự đặt tiêu đề.",
      },
      {
        title: "Tìm mục ngay trên máy",
        body: "Câu hỏi được đem so với tên và tóm tắt của từng mục, từ nào càng hiếm thì càng được tính nặng. Tiếng Nhật và tiếng Trung được tách thành từng cụm hai chữ. Hỏi lại đúng câu cũ, kết quả vẫn y như cũ.",
      },
      {
        title: "Đọc xong mới trả lời",
        body: "Claude chỉ mở vài mục đứng đầu, xem chúng có thật sự trả lời được không, rồi đáp kèm số trang, số slide, hoặc tên file và số dòng để bạn tự kiểm lại.",
      },
    ],
  },
  example: {
    title: "Một câu hỏi, chỉ cần đọc {pages} trang",
    lead: "Lần chạy thật trên cuốn sách mẫu. Công cụ chấm điểm toàn bộ các mục mà không cần tới model, còn Claude mở {read} mục đứng đầu rồi trả lời.",
    you: "Bạn",
    question: "Shokunin kết hợp Kaizen với AI như thế nào?",
    ranked: "Công cụ chấm điểm các mục — không gọi model",
    readTag: "đã đọc",
    answer:
      "Không phải chọn một trong hai. Người shokunin giữ tinh thần Kaizen — cải tiến từng chút nhưng không ngừng, như nguyên lý mỗi ngày tốt hơn 1%, tức (1.01)^365 — và dùng AI để khuếch đại chính nỗ lực đó. Có điều, cải tiến chỉ bền khi nó trở thành tiêu chuẩn chung của cả đội, giống miếng chèn giữ khẩu pháo khỏi tụt dốc trong lúc cả tiểu đội đang kéo pháo lên.",
    score: "điểm {score} · tr. {from}–{to}",
    source: "Nguồn: trang {from}–{to}",
  },
  features: {
    title: "Đồ thị này có sẵn trong skill",
    lead: "tạo ra một file HTML duy nhất, mở offline được. Cái bạn vừa kéo thử ở trên chính là file đó.",
    items: [
      { title: "Thấy ngay đường đi", body: "Rê chuột vào một mục hay một đường nối, đường từ gốc tới đó sẽ chạy sáng lên, kèm theo toàn bộ mục con bên dưới." },
      { title: "Gập bớt cho gọn", body: "Bấm vào vòng tròn để gập một nhánh. Mục vừa bấm vẫn đứng yên chỗ cũ, không nhảy đi đâu cả." },
      { title: "Dạng cây hay dạng tròn", body: "Xem từ trái sang phải để dễ đọc tên mục, hoặc xoè tròn ra để thấy toàn cảnh cả tài liệu." },
      { title: "Tìm và rà soát", body: "Mục khớp sẽ sáng lên và tự mở nhánh, nhấn Enter để nhảy qua từng kết quả. Chỉ một cú bấm là lọc ra mọi mục chưa có tóm tắt." },
      { title: "Số liệu ngay trước mắt", body: "Mỗi cấp có bao nhiêu mục, nhánh nào đang gập, và mỗi mục chiếm bao nhiêu phần của tài liệu." },
      { title: "Một file, chạy offline", body: "Không server, không CDN, dữ liệu không rời khỏi máy. Có cả giao diện sáng lẫn tối, dùng được bằng chuột, bàn phím hay màn hình cảm ứng." },
    ],
  },
  formats: {
    title: "Tài liệu có sẵn cấu trúc gì, dùng luôn cấu trúc đó",
    lead: "Hầu hết định dạng đã có sẵn mục lục bên trong, nên index không tốn đồng nào. Chỉ hai loại cần Claude đọc qua một lượt.",
    free: "không tốn model",
    pass: "Claude đọc 1 lượt",
    rows: {
      pdf: { format: "PDF có chữ", source: "lấy từ bố cục và bookmark" },
      scan: { format: "PDF scan", source: "Claude đọc ảnh từng trang" },
      docx: { format: "Word .docx", source: "lấy từ style Heading 1–9" },
      pptx: { format: "PowerPoint .pptx", source: "mỗi slide là một mục" },
      md: { format: "Markdown", source: "lấy từ các tiêu đề #" },
      txt: { format: "File text trơn", source: "Claude tự đặt tiêu đề" },
      adoc: { format: "Thư mục AsciiDoc", source: "lấy từ cấp tiêu đề =, trích nguồn theo file và dòng" },
    },
  },
  install: {
    title: "Cài mất chừng một phút",
    lead: "Chỉ cần có uv hoặc Python 3.10 trở lên. Script sẽ tự dựng môi trường Python riêng và gắn skill vào ~/.claude/skills.",
    clone: "Tải về",
    setup: "Cài đặt",
    windows: "Dùng Windows thì chạy .\\install.ps1.",
    use: "Rồi cứ thế hỏi, ở thư mục nào cũng được",
    indexPrompt: "Dùng skill pageindex, index file ~/Documents/bao-cao-2025.pdf",
    askPrompt: "Dùng skill pageindex. Doanh thu quý 3 trong báo cáo 2025 là bao nhiêu?",
  },
  cta: {
    title: "Thử ngay với tài liệu dài nhất bạn đang có.",
    lead: "Cài một lần, index một lần, từ đó mở session Claude Code nào cũng hỏi được.",
    button: "Tải về từ GitHub",
  },
  footer: {
    builtOn: "Xây trên nền PageIndex của VectifyAI, chạy dưới dạng skill của Claude Code.",
    notOfficial: "Đây không phải sản phẩm chính thức của bên nào; tên và logo thuộc về chủ sở hữu.",
    sample: "Sách mẫu: “SHOKUNIN IT – Cách người TOMOSIA làm việc” của tác giả Lưu Tuấn Anh (TOMOSIA), được sử dụng khi đã có sự cho phép.",
  },
};

export default vi;
