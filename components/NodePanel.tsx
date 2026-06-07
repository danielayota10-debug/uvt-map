"use client";

import type { CSNode } from "@/types/map";

const ACTIVITY_STYLE: Record<string, { bg: string; color: string }> = {
  theory:     { bg: "#1e1a3a", color: "#9b94f0" },
  experiment: { bg: "#0e2820", color: "#4eca99" },
  design:     { bg: "#2a1e06", color: "#d4950a" },
};

const LEVEL_LABELS: Record<string, string> = {
  bachelor: "BSc", master: "MSc", phd: "PhD",
};

interface Props {
  node: CSNode;
  lang: "en" | "ro";
  allNodes: CSNode[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export default function NodePanel({ node, lang, allNodes, onClose, onNavigate }: Props) {
  const label = lang === "en" ? node.label : node.labelRO;
  const tagline = lang === "en" ? node.tagline : node.taglineRO;
  const uvtText = lang === "en" ? node.uvt : node.uvtRO;

  return (
    <div
      className="panel-scroll"
      style={{
        width: 290,
        flexShrink: 0,
        borderLeft: "0.5px solid var(--border)",
        overflowY: "auto",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "0.5px solid var(--border)",
          position: "sticky",
          top: 0,
          background: "var(--surface)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div
            style={{
              width: 10, height: 10, borderRadius: "50%",
              background: node.color, marginTop: 4, flexShrink: 0,
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text3)", fontSize: 16, lineHeight: 1, padding: "0 0 0 8px",
            }}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
        <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>
          {label.replace("\n", " ")}
        </div>
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--text2)", lineHeight: 1.45 }}>
          {tagline}
        </div>

        {/* Activities + levels */}
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {node.activities.map((a) => (
            <span
              key={a}
              style={{
                ...ACTIVITY_STYLE[a],
                fontSize: 10, padding: "2px 7px", borderRadius: 10, fontWeight: 500,
              }}
            >
              {a}
            </span>
          ))}
          {node.studyLevel.map((l) => (
            <span
              key={l}
              style={{
                background: "rgba(59,139,212,0.15)", color: "#3B8BD4",
                fontSize: 10, padding: "2px 7px", borderRadius: 10,
              }}
            >
              {LEVEL_LABELS[l]}
            </span>
          ))}
          <span
            style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 10,
              background: node.color + "28", color: node.color,
            }}
          >
            {node.cluster}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Problems */}
        {node.problems.length > 0 && (
          <Section label={lang === "en" ? "Problems" : "Probleme"}>
            {node.problems.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 10px",
                  borderLeft: `2px solid ${p.open ? "#BA7517" : "#3B8BD4"}`,
                  background: p.open ? "rgba(186,117,23,0.07)" : "rgba(59,139,212,0.07)",
                  borderRadius: "0 5px 5px 0",
                  marginBottom: i < node.problems.length - 1 ? 6 : 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{p.title}</span>
                  {p.open && (
                    <span
                      style={{
                        fontSize: 9, padding: "1px 5px", borderRadius: 8,
                        background: "rgba(186,117,23,0.2)", color: "#BA7517", flexShrink: 0,
                      }}
                    >
                      open
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: "var(--text2)", lineHeight: 1.5 }}>{p.example}</div>
              </div>
            ))}
          </Section>
        )}

        {/* People */}
        {node.people.length > 0 && (
          <Section label={lang === "en" ? "Key People" : "Persoane Cheie"}>
            <PillList items={node.people} />
          </Section>
        )}

        {/* Venues */}
        {node.venues.length > 0 && (
          <Section label={lang === "en" ? "Venues" : "Publicații & Conferințe"}>
            <PillList items={node.venues} />
          </Section>
        )}

        {/* Connections */}
        {node.connections.length > 0 && (
          <Section label={lang === "en" ? "Connections" : "Conexiuni"}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {node.connections.map((c) => {
                const target = allNodes.find((n) => n.id === c.to);
                if (!target) return null;
                const tLabel = lang === "en" ? target.label : target.labelRO;
                return (
                  <button
                    key={c.to}
                    onClick={() => onNavigate(c.to)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "none", border: "0.5px solid var(--border)",
                      borderRadius: 6, padding: "5px 8px", cursor: "pointer",
                      textAlign: "left", transition: "background .12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <span
                      style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: target.color, flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 11, color: "var(--text)", flex: 1 }}>
                      {tLabel.replace("\n", " ")}
                    </span>
                    <span
                      style={{
                        fontSize: 9, padding: "1px 5px", borderRadius: 8,
                        background: "var(--surface2)", color: "var(--text3)",
                        flexShrink: 0,
                      }}
                    >
                      {c.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* @ UVT */}
        {uvtText && (
          <Section label="@ FMI-UVT">
            <div
              style={{
                fontSize: 11, color: "var(--text2)", lineHeight: 1.6,
                padding: "8px 10px",
                borderLeft: "2px solid #3B8BD4",
                background: "rgba(59,139,212,0.07)",
                borderRadius: "0 5px 5px 0",
              }}
            >
              {uvtText}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 9, fontWeight: 600, letterSpacing: "0.07em",
          textTransform: "uppercase", color: "var(--text3)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function PillList({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {items.map((item, i) => (
        <span
          key={i}
          style={{
            fontSize: 10, padding: "3px 8px", borderRadius: 10,
            background: "var(--surface2)", border: "0.5px solid var(--border)",
            color: "var(--text2)",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
