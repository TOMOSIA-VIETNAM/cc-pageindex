// The skill in one picture: a long document becomes a tree, one path through the tree
// is followed, and the answer cites the pages at its end. The lit path flows the same
// way the viewer's does on hover.

type Props = { pagesLabel: string; sectionsLabel: string; citeLabel: string; answerLabel: string };

const R = 6;
const root = { x: 196, y: 214 };
const branches = [
  { x: 300, y: 92 }, { x: 300, y: 164 }, { x: 300, y: 250, lit: true }, { x: 300, y: 330 },
];
const leaves = [
  { from: 2, x: 404, y: 214 }, { from: 2, x: 404, y: 262, lit: true }, { from: 2, x: 404, y: 310 },
  { from: 0, x: 404, y: 70 }, { from: 0, x: 404, y: 114 },
];

const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const mid = (a.x + b.x) / 2;
  return `M${a.x + R},${a.y} C${mid},${a.y} ${mid},${b.y} ${b.x - R},${b.y}`;
};

export function HeroFlow({ pagesLabel, sectionsLabel, citeLabel, answerLabel }: Props) {
  const litLeaf = leaves.find(leaf => leaf.lit)!;
  return (
    <svg className="hero-flow" data-reveal="load" viewBox="0 0 480 440" role="img" aria-label={`${pagesLabel} → ${sectionsLabel} → ${citeLabel}`}>
      {/* the document */}
      <g className="flow-doc">
        <rect x="18" y="150" width="120" height="150" rx="10" className="flow-sheet flow-sheet-back" transform="rotate(-6 78 225)" />
        <rect x="24" y="146" width="120" height="150" rx="10" className="flow-sheet" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map(line => (
          <rect key={line} x="40" y={170 + line * 14} width={line % 3 === 2 ? 58 : 88} height="5" rx="2.5" className="flow-text" />
        ))}
        <text x="84" y="324" className="flow-label" textAnchor="middle">{pagesLabel}</text>
      </g>

      <path d={`M146,221 C170,221 170,${root.y} ${root.x - R},${root.y}`} className="flow-edge flow-lit" />

      {/* the tree */}
      {branches.map((branch, index) => (
        <path key={`b${index}`} d={curve(root, branch)} className={`flow-edge ${branch.lit ? "flow-lit" : ""}`} />
      ))}
      {leaves.map((leaf, index) => (
        <path key={`l${index}`} d={curve(branches[leaf.from], leaf)} className={`flow-edge ${leaf.lit ? "flow-lit" : ""}`} />
      ))}
      <circle cx={root.x} cy={root.y} r={R + 1} className="flow-node flow-node-lit" />
      {branches.map((branch, index) => (
        <circle key={`bn${index}`} cx={branch.x} cy={branch.y} r={R} className={`flow-node ${branch.lit ? "flow-node-lit" : ""}`} />
      ))}
      {leaves.map((leaf, index) => (
        <circle key={`ln${index}`} cx={leaf.x} cy={leaf.y} r={R} className={`flow-node ${leaf.lit ? "flow-node-lit" : ""}`} />
      ))}
      <text x={branches[3].x} y={branches[3].y + 30} className="flow-label" textAnchor="middle">{sectionsLabel}</text>

      {/* the answer, citing what was read */}
      <path d={`M${litLeaf.x},${litLeaf.y + R} C${litLeaf.x},${litLeaf.y + 50} 420,340 420,376`} className="flow-edge flow-lit" />
      <g className="flow-answer">
        <rect x="150" y="376" width="300" height="50" rx="12" className="flow-bubble" />
        <text x="170" y="398" className="flow-answer-title">{answerLabel}</text>
        <text x="170" y="415" className="flow-cite">{citeLabel}</text>
      </g>
    </svg>
  );
}
