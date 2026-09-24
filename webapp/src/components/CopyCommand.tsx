"use client";

import { useState } from "react";
import { Icon } from "./Icon";

export function CopyCommand({ command, copy, copied, prompt = "$" }: {
  command: string; copy: string; copied: string; prompt?: string;
}) {
  const [done, setDone] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {}
  };
  return (
    <div className="command">
      <pre>
        {command.split("\n").map(line => (
          <span key={line} className="line">{prompt && <span className="prompt" aria-hidden="true">{prompt} </span>}{line}</span>
        ))}
      </pre>
      <button type="button" className="icon-button" onClick={onCopy} aria-label={done ? copied : copy} title={done ? copied : copy}>
        <Icon name={done ? "check" : "copy"} />
      </button>
      <span className="visually-hidden" aria-live="polite">{done ? copied : ""}</span>
    </div>
  );
}
