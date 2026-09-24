import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, fill, isLocale, localeNames, locales, type Locale } from "@/i18n";
import { DEMO_PAGE, demoStats, exampleRun } from "@/lib/demo";
import { BRAND, CLAUDE_CODE_URL, PAGEINDEX_URL, REPO_DIR, REPO_URL } from "@/lib/site";
import { CopyCommand } from "@/components/CopyCommand";
import { GraphFrame } from "@/components/GraphFrame";
import { HeroFlow } from "@/components/HeroFlow";
import { Icon, type IconName } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";

const featureIcons: IconName[] = ["route", "fold", "radial", "search", "chart", "shield"];
// Every format the skill reads, and whether indexing it needs one pass of the model:
// the rest carry their own outline.
const FORMATS = [
  { id: "pdf", model: false }, { id: "scan", model: true }, { id: "docx", model: false },
  { id: "pptx", model: false }, { id: "md", model: false }, { id: "txt", model: true },
  { id: "adoc", model: false },
] as const;

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = dictionaries[lang];
  const stats = demoStats();
  const read = exampleRun.read.map(id => stats.titles.get(id)!);
  const pagesRead = read.reduce((total, node) => total + node.end - node.start + 1, 0);
  const topScore = exampleRun.ranked[0].score;
  const book = stats.name.replace(/\.pdf$/i, "");
  const clone = `git clone ${REPO_URL}.git\ncd ${REPO_DIR}`;

  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <Link href={`/${lang}`} className="wordmark" aria-label={BRAND}>
            <span className="wordmark-dot" aria-hidden="true" />{BRAND}
          </Link>
          <nav className="nav-links" aria-label="Sections">
            <a href="#how">{t.nav.how}</a>
            <a href="#graph">{t.nav.graph}</a>
            <a href="#install">{t.nav.install}</a>
          </nav>
          <div className="nav-tools">
            <LanguageSwitch current={lang} label={t.nav.language} />
            <ThemeToggle label={t.nav.theme} />
            <a className="icon-button" href={REPO_URL} aria-label={t.nav.github} title={t.nav.github}>
              <Icon name="github" />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero container">
          <div className="hero-text">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.hero.title}</h1>
          <p className="lead">{t.hero.lead}</p>
          <div className="hero-actions">
            <a className="button primary" href="#graph">{t.hero.ctaGraph}<Icon name="arrow" /></a>
            <a className="button" href={REPO_URL}><Icon name="github" />{t.hero.ctaGithub}</a>
          </div>
          <div className="hero-command">
            <CopyCommand command={clone + "\n./install.sh"} copy={t.hero.copy} copied={t.hero.copied} />
          </div>
          </div>
          <HeroFlow
            pagesLabel={fill(t.hero.flowPages, { pages: stats.pages })}
            sectionsLabel={fill(t.hero.flowSections, { sections: stats.sections })}
            answerLabel={t.hero.flowAnswer}
            citeLabel={fill(t.hero.flowCite, { from: read[0].start, to: read[read.length - 1].end })}
          />
        </section>

        <section id="graph" className="container graph-section" aria-labelledby="graph-title">
          <div className="window">
            <div className="window-bar">
              <span className="window-file"><span className="live-dot" aria-hidden="true" />{stats.name}</span>
              <span className="window-meta">{fill(t.graph.meta, { pages: stats.pages, sections: stats.sections })}</span>
              <a className="window-open" href={DEMO_PAGE} target="_blank" rel="noopener">
                {t.graph.open}<Icon name="external" />
              </a>
            </div>
            <GraphFrame src={DEMO_PAGE} title={t.graph.frameTitle} />
          </div>
          <div className="graph-caption">
            <h2 id="graph-title">{t.graph.title}</h2>
            <p>{fill(t.graph.caption, { book, pages: stats.pages, sections: stats.sections, levels: stats.levels })}</p>
          </div>
        </section>

        <section className="container numbers" aria-label="Sample index in numbers">
          <Number value={stats.pages} label={t.numbers.pages} />
          <Number value={stats.sections} label={t.numbers.sections} />
          <Number value={stats.leaves} label={t.numbers.leaves} />
          <Number value={pagesRead} label={t.numbers.read} accent />
          <Number value={0} label={t.numbers.keys} />
        </section>

        <section className="container band reveal" aria-labelledby="problem-title">
          <h2 id="problem-title" className="section-title">{t.problem.title}</h2>
          <div className="grid three">
            {t.problem.items.map((item, index) => (
              <article key={item.title} className={`card ${index === t.problem.items.length - 1 ? "card-accent" : "card-muted"}`}>
                <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="container band reveal" aria-labelledby="how-title">
          <h2 id="how-title" className="section-title">{t.how.title}</h2>
          <p className="section-lead">{t.how.lead}</p>
          <ol className="steps">
            {t.how.steps.map((step, index) => (
              <li key={step.title} className="step">
                <div className="step-head">
                  <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                  {/* the last step is the session's; the ones before it are the tool's */}
                  <span className={`badge ${index === t.how.steps.length - 1 ? "badge-claude" : ""}`}>
                    {index === t.how.steps.length - 1 ? t.how.session : t.how.tool}
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="container band reveal" aria-labelledby="example-title">
          <h2 id="example-title" className="section-title">{fill(t.example.title, { pages: pagesRead })}</h2>
          <p className="section-lead">{fill(t.example.lead, { read: read.length })}</p>
          <div className="example">
            <div className="chat">
              <div className="bubble bubble-you">
                <span className="speaker">{t.example.you}</span>
                <p>{t.example.question}</p>
              </div>
              <div className="bubble bubble-claude">
                <span className="speaker">Claude</span>
                <p>{t.example.answer}</p>
                <p className="source">
                  {fill(t.example.source, { from: read[0].start, to: read[read.length - 1].end })}
                  {" · "}{read.map(node => node.title).join(" · ")}
                </p>
              </div>
            </div>
            <div className="ranked">
              <p className="ranked-label">{t.example.ranked}</p>
              <ol>
                {exampleRun.ranked.map(entry => {
                  const node = stats.titles.get(entry.id)!;
                  const isRead = exampleRun.read.includes(entry.id);
                  return (
                    <li key={entry.id} className={isRead ? "is-read" : ""}>
                      <div className="ranked-row">
                        <span className="ranked-id">#{entry.id}</span>
                        <span className="ranked-title">{node.title}</span>
                        {isRead && <span className="badge badge-claude">{t.example.readTag}</span>}
                      </div>
                      <div className="ranked-bar" aria-hidden="true">
                        <span style={{ width: `${(entry.score / topScore) * 100}%` }} />
                      </div>
                      <div className="ranked-meta">{fill(t.example.score, { score: entry.score.toFixed(2), from: node.start, to: node.end })}</div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        <section className="container band reveal" aria-labelledby="features-title">
          <h2 id="features-title" className="section-title">{t.features.title}</h2>
          <p className="section-lead"><code>pi.py html</code> {t.features.lead}</p>
          <div className="grid three">
            {t.features.items.map((item, index) => (
              <article key={item.title} className="feature">
                <span className="feature-icon"><Icon name={featureIcons[index]} /></span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container band reveal" aria-labelledby="formats-title">
          <h2 id="formats-title" className="section-title">{t.formats.title}</h2>
          <p className="section-lead">{t.formats.lead}</p>
          <ul className="formats">
            {FORMATS.map(({ id, model }) => (
              <li key={id}>
                <span className="format-name">{t.formats.rows[id].format}</span>
                <span className="format-source">{t.formats.rows[id].source}</span>
                <span className={`pill ${model ? "pill-pass" : "pill-free"}`}>{model ? t.formats.pass : t.formats.free}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="install" className="container band reveal" aria-labelledby="install-title">
          <h2 id="install-title" className="section-title">{t.install.title}</h2>
          <p className="section-lead">{t.install.lead}</p>
          <div className="install">
            <div className="install-step">
              <span className="step-number">01</span>
              <h3>{t.install.clone}</h3>
              <CopyCommand command={clone} copy={t.hero.copy} copied={t.hero.copied} />
            </div>
            <div className="install-step">
              <span className="step-number">02</span>
              <h3>{t.install.setup}</h3>
              <CopyCommand command="./install.sh" copy={t.hero.copy} copied={t.hero.copied} />
              <p className="note">{t.install.windows}</p>
            </div>
            <div className="install-step">
              <span className="step-number">03</span>
              <h3>{t.install.use}</h3>
              <CopyCommand command={t.install.indexPrompt} copy={t.hero.copy} copied={t.hero.copied} prompt="›" />
              <CopyCommand command={t.install.askPrompt} copy={t.hero.copy} copied={t.hero.copied} prompt="›" />
            </div>
          </div>
        </section>
        <section className="container cta reveal" aria-labelledby="cta-title">
          <h2 id="cta-title">{t.cta.title}</h2>
          <p>{t.cta.lead}</p>
          <a className="button primary" href={REPO_URL}><Icon name="github" />{t.cta.button}</a>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <p>
            <a href={PAGEINDEX_URL}>PageIndex</a> · <a href={CLAUDE_CODE_URL}>Claude Code</a> · <a href={REPO_URL}>GitHub</a>
          </p>
          <p>{t.footer.builtOn} {t.footer.notOfficial}</p>
          <p>{t.footer.sample}</p>
        </div>
      </footer>
    </>
  );
}

function Number({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className={`number ${accent ? "number-accent" : ""}`}>
      <span className="number-value">{value}</span>
      <span className="number-label">{label}</span>
    </div>
  );
}

// Plain links, not client-side navigation: each language is its own root layout, and a
// client transition kept the old scroll offset, which lands mid-page on text of another length.
// A fresh load opens the chosen language at the top.
function LanguageSwitch({ current, label }: { current: Locale; label: string }) {
  return (
    <nav className="lang" aria-label={label}>
      {locales.map(locale => (
        <a key={locale} href={`/${locale}`} hrefLang={locale} lang={locale} title={localeNames[locale]}
           aria-current={locale === current ? "page" : undefined}>
          {locale.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}
