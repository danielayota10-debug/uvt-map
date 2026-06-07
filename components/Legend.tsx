"use client";

import { useState } from "react";

interface Props {
  lang: "en" | "ro";
}

const ITEMS = [
  { color: "#9b94f0", bg: "#1e1a3a", label: "Theory activity",     labelRO: "Activitate: Teorie" },
  { color: "#4eca99", bg: "#0e2820", label: "Experiment activity",  labelRO: "Activitate: Experiment" },
  { color: "#d4950a", bg: "#2a1e06", label: "Design activity",      labelRO: "Activitate: Proiectare" },
  { color: "#EF9F27", bg: "transparent", label: "Selected / edge highlight", labelRO: "Selectat / evidențiat" },
  { color: "#3B8BD4", bg: "transparent", label: "UVT local node (dashed ring)", labelRO: "Nod local UVT (inel punctat)" },
  { color: "#888",    bg: "transparent", label: "Dimmed = not connected",       labelRO: "Atenuat = neconectat" },
];

export default function Legend({ lang }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        position: "absolute", bottom: 14, right: 14,
        zIndex: 20,
      }}
    >
      {open && (
        <div
          style={{
            background: "rgba(14,14,20,0.94)",
            border: "0.5px solid var(--border2)",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 8,
            minWidth: 220,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
            {lang === "en" ? "Legend" : "Legendă"}
          </div>
          {ITEMS.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  display: "inline-block", width: 10, height: 10, borderRadius: "50%",
                  background: item.color, flexShrink: 0,
                  boxShadow: item.bg !== "transparent" ? `0 0 0 3px ${item.bg}` : undefined,
                  border: item.label.includes("dashed") ? `1.5px dashed ${item.color}` : undefined,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--text2)" }}>
                {lang === "en" ? item.label : item.labelRO}
              </span>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          fontSize: 11, padding: "4px 12px", borderRadius: 8,
          border: "0.5px solid var(--border2)", background: "rgba(14,14,20,0.88)",
          color: "var(--text2)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
        }}
      >
        <span style={{ fontSize: 12 }}>⊚</span>
        {lang === "en" ? "Legend" : "Legendă"}
      </button>
    </div>
  );
}
