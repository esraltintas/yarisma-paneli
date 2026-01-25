"use client";

import * as React from "react";

type Props = {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;

  /** Accordion mod */
  collapsible?: boolean;
  defaultOpen?: boolean;

  /** Accordion kapalıyken kısa özet (opsiyonel) */
  summary?: React.ReactNode;

  /** Altta sabit footer (accordion açık/kapalı fark etmez) */
  footer?: React.ReactNode;

  className?: string;
};

export default function MobileCard({
  title,
  right,
  children,
  collapsible = false,
  defaultOpen = false,
  summary,
  footer,
  className,
}: Props) {
  // accordion değilse: açık varsay
  const [open, setOpen] = React.useState(!collapsible ? true : defaultOpen);

  const Header = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {title ? (
          <div style={{ fontWeight: 900, fontSize: 16, color: "#111827" }}>
            {title}
          </div>
        ) : null}

        {!open && summary ? (
          <div
            style={{
              marginTop: 4,
              color: "#6B7280",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {summary}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {right ? <div>{right}</div> : null}

        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              fontWeight: 900,
              lineHeight: 1,
            }}
            title={open ? "Kapat" : "Aç"}
          >
            <span
              style={{
                display: "inline-block",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ▼
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <section
      className={className}
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: 14,
      }}
    >
      {title || right || collapsible ? (
        <header style={{ marginBottom: open ? 12 : footer ? 12 : 0 }}>
          {Header}
        </header>
      ) : null}

      {open ? <div>{children}</div> : null}

      {footer && open ? (
        <footer
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid #F3F4F6",
          }}
        >
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
