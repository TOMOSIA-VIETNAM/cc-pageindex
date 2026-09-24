import type { Dictionary } from "./en";

const ja: Dictionary = {
  meta: {
    title: "pageindex — 長い文書を、人と同じ読み方で。Claude Code のために",
    description:
      "PDF・Word・スライド・仕様書フォルダを目次のツリーに変え、モデルを呼ばずにローカルで節を順位付けし、答えのあるページだけを読む Claude Code スキル。API キー不要。",
  },
  nav: {
    how: "仕組み",
    graph: "グラフ",
    install: "インストール",
    github: "GitHub",
    theme: "テーマを切り替え",
    language: "言語",
  },
  hero: {
    eyebrow: "Claude Code スキル · API キー不要",
    title: "300ページの文書も、人と同じ読み方で。",
    lead:
      "pageindex は PDF、Word、スライド、仕様書のフォルダを目次に変えます。Claude はツリーを見て必要な数節だけを開き、読んだページを添えて答えます。埋め込みもベクトルDBも、モデルのキーも要りません。",
    ctaGraph: "グラフを触る",
    ctaGithub: "GitHub で見る",
    copy: "コピー",
    copied: "コピー済み",
    flowPages: "{pages} ページ",
    flowSections: "{sections} 節",
    flowAnswer: "答えと、その出典",
    flowCite: "{from}–{to} ページ",
  },
  graph: {
    title: "これは本物のインデックスです。",
    caption:
      "{book} — {pages} ページが {levels} 階層・{sections} 節になりました。ノードにカーソルを合わせると経路が流れ、丸をクリックすると枝を畳み、タイトルをクリックすると要約が開きます。",
    meta: "{pages} ページ · {sections} 節",
    open: "ビューアを全画面で開く",
    frameTitle: "サンプル書籍の節グラフ(操作できます)",
  },
  numbers: {
    pages: "書籍のページ数",
    sections: "ツリーの節",
    leaves: "末端の節",
    read: "下の質問に答えるため読んだページ",
    keys: "API キー",
  },
  problem: {
    title: "長い文書は、いつもの聞き方を壊す",
    items: [
      {
        title: "全部貼り付ける",
        body: "トークンを消費し、コンテキストがあふれ、長いほどモデルは読み飛ばします。",
      },
      {
        title: "ベクトルに刻む",
        body: "断片は属していた章を失い、表は二つに割れ、「似ている」は「答えが書いてある」ではありません。",
      },
      {
        title: "目次をたどる",
        body: "きちんとした文書には最初から構造があります。pageindex はそれを保つので、答え探しは節を選ぶことになり、出典も自然に付きます。",
      },
    ],
  },
  how: {
    title: "二つの層、はっきりした境界",
    lead: "ツールは機械的な処理だけを行い、モデルを一切呼びません。文章はすべてあなたの Claude Code セッションが書きます。",
    tool: "ツール",
    session: "Claude",
    steps: [
      {
        title: "一度だけインデックス",
        body: "PDF のレイアウト、Word の見出しスタイル、AsciiDoc の階層、スライドのタイトルが節のツリーになり、手元に保存されます。スキャンや素のテキストは Claude が一度だけ見出しを書きます。",
      },
      {
        title: "ローカルで順位付け",
        body: "質問ごとにタイトルと要約との語の重なりを、珍しい語ほど重く数えます。日本語と中国語は二文字ずつに分けます。同じ質問なら毎回同じ順位です。",
      },
      {
        title: "読んで、出典を示す",
        body: "Claude は上位の節だけを開き、本当に答えになっているか確かめ、ページ・スライド・ファイルと行番号を添えて答えます。たどって確かめられます。",
      },
    ],
  },
  example: {
    title: "質問ひとつ、読んだのは{pages}ページ",
    lead: "サンプル書籍での実際の実行記録です。ツールはモデルなしで全節を順位付けし、Claude はそのうち{read}節を読んで答えました。",
    you: "あなた",
    question: "職人は改善(カイゼン)と AI をどう組み合わせるのか?",
    ranked: "ツールによる順位付け — モデル呼び出しなし",
    readTag: "読んだ",
    answer:
      "どちらか一方を選ぶのではありません。職人は小さく継続的に良くするカイゼン — 1% の原則、(1.01)^365 — を守り、AI をその努力を増幅する道具として使います。改善が続くのは、それが共通の基準になったときだけ。坂の上へ大砲を引き上げるとき、ずり落ちないよう差し込む楔のように。",
    score: "スコア {score} · {from}–{to} ページ",
    source: "出典: {from}–{to} ページ",
  },
  features: {
    title: "グラフはスキルに付いてきます",
    lead: "はオフラインで動く 1 ファイルを書き出します。上で触ったのは、まさにそのファイルです。",
    items: [
      { title: "どの経路もたどれる", body: "ノードや辺にカーソルを合わせると、ルートからの経路が流れ、配下の枝全体が光ります。" },
      { title: "要らない枝は畳む", body: "丸をクリックすると枝がまとまり、ノードは視線の位置から動きません。" },
      { title: "ツリーか放射状か", body: "タイトルを読むなら左から右へ、全体の形を見るなら放射状に。" },
      { title: "検索と点検", body: "一致した節が光って枝が開き、Enter で順に移動。要約のない節もワンクリックで一覧できます。" },
      { title: "数字がひと目で", body: "階層ごとの節数、末端の節、畳んだ枝、各節が文書のどれだけを占めるか。" },
      { title: "1 ファイル、オフライン", body: "サーバーも CDN も不要、何も外に出ません。ライトとダーク、マウス・キーボード・タッチに対応。" },
    ],
  },
  formats: {
    title: "文書が元から持つ形をそのまま読む",
    lead: "ほとんどの形式は自前のアウトラインを持つので、インデックスは無料です。二つだけ Claude が一度読みます。",
    free: "モデル不要",
    pass: "モデル 1 回",
    rows: {
      pdf: { format: "テキスト付き PDF", source: "レイアウトとしおり" },
      scan: { format: "スキャン PDF", source: "Claude が読むページ画像" },
      docx: { format: "Word .docx", source: "見出し 1–9 のスタイル" },
      pptx: { format: "PowerPoint .pptx", source: "スライドごとに 1 ノード" },
      md: { format: "Markdown", source: "# 見出し" },
      txt: { format: "プレーンテキスト", source: "Claude が書く見出し" },
      adoc: { format: "AsciiDoc フォルダ", source: "= の階層、ファイルと行で出典" },
    },
  },
  install: {
    title: "1 分でインストール",
    lead: "uv か Python 3.10 以上が必要です。スクリプトが専用の環境を作り、スキルを ~/.claude/skills にリンクします。",
    clone: "クローン",
    setup: "インストール",
    windows: "Windows では .\\install.ps1 を実行します。",
    use: "あとはどのディレクトリからでも聞くだけ",
    indexPrompt: "pageindex スキルで ~/Documents/report-2025.pdf をインデックスして",
    askPrompt: "pageindex スキルを使って。2025 年レポートの第3四半期の売上は?",
  },
  cta: {
    title: "いちばん長い文書で試してください。",
    lead: "インストールも、インデックスも一度だけ。あとはどの Claude Code セッションからでも聞けます。",
    button: "GitHub から入手",
  },
  footer: {
    builtOn: "VectifyAI の PageIndex をもとに、Claude Code のスキルとして動かしています。",
    notOfficial: "どちらの公式製品でもありません。名称とロゴは各権利者に帰属します。",
    sample: "サンプル書籍: 「SHOKUNIN IT – Cách người TOMOSIA làm việc」Lưu Tuấn Anh 著(TOMOSIA)、許可を得て使用。",
  },
};

export default ja;
