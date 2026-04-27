"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label = "Copy bản tối ưu",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Browser blocked clipboard — silently ignore.
        }
      }}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M2 7l3 3 7-7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Đã copy
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <rect
              x="3"
              y="3"
              width="8"
              height="9"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M5.5 3V2a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-1"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
