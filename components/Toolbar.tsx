"use client";

import type { Cluster } from "@/types/map";

interface Props {
  clusters: Cluster[];
  activeCluster: string;
  onClusterChange: (id: string) => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  lang: "en" | "ro";
  onLangToggle: () => void;
  selectedLevel: string;
  onLevelChange: (l: string) => void;
}

const LEVELS = [
  { id: "all",      label: "All Levels", labelRO: "Toate" },
  { id: "bachelor", label: "BSc",        labelRO: "Licență" },
  { id: "master",   label: "MSc",        labelRO: "Master" },
  { id: "phd",      label: "PhD",        labelRO: "Doctorat" },
];

export default function Toolbar({
  clusters, activeCluster, onClusterChange,
  searchQuery, onSearch,
  lang, onLangToggle,
  selectedLevel, onLevelChange,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 14px",
        height: 48,
        borderBottom: "0.5px solid var(--border)",
        background: "var(--surface)",
        flexShrink: 0,
        flexWrap: "wrap",
        rowGap: 0,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 6 }}>
        <div
          style={{
            width: 24, height: 24, borderRadius: 6,
            background: "linear-gradient(135deg,#534AB7,#993556)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
          }}
        >
          CS
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap" }}>
          {lang === "en" ? "CS Knowledge Map" : "Harta Informaticii"}
        </span>
        <span style={{ fontSize: 10, color: "var(--text3)", whiteSpace: "nowrap" }}>
          FMI-UVT
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />

      {/* Search */}
      <input
        type="text"
        placeholder={lang === "en" ? "Search nodes…" : "Caută noduri…"}
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          fontSize: 12, padding: "4px 10px", borderRadius: 8,
          border: "0.5px solid var(--border2)", background: "var(--surface2)",
          color: "var(--text)", width: 140, outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent2)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border2)")}
      />

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />

      {/* Cluster filters */}
      <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflowX: "auto" }}>
        <FilterBtn
          label={lang === "en" ? "All" : "Toate"}
          active={activeCluster === "all"}
          color="#888"
          onClick={() => onClusterChange("all")}
        />
        {clusters.map((c) => (
          <FilterBtn
            key={c.id}
            label={lang === "en" ? c.label : c.labelRO}
            active={activeCluster === c.id}
            color={c.color}
            onClick={() => onClusterChange(c.id)}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />

      {/* Level filters */}
      <div style={{ display: "flex", gap: 4 }}>
        {LEVELS.map((l) => (
          <FilterBtn
            key={l.id}
            label={lang === "en" ? l.label : l.labelRO}
            active={selectedLevel === l.id}
            color="#3B8BD4"
            onClick={() => onLevelChange(l.id)}
          />
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Keyboard hint */}
      <span
        style={{
          fontSize: 10, color: "var(--text3)", whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <kbd style={kbdStyle}>↑↓←→</kbd> navigate
        <kbd style={kbdStyle}>Enter</kbd> select
        <kbd style={kbdStyle}>Tab</kbd> cycle
        <kbd style={kbdStyle}>Esc</kbd> close
        <kbd style={kbdStyle}>scroll</kbd> zoom
      </span>

      {/* Lang toggle */}
      <button
        onClick={onLangToggle}
        style={{
          fontSize: 11, padding: "3px 10px", borderRadius: 8,
          border: "0.5px solid var(--border2)", background: "var(--surface2)",
          color: "var(--text2)", cursor: "pointer", fontWeight: 500,
          transition: "all .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent2)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
        title="Toggle language"
      >
        {lang === "en" ? "🇷🇴 RO" : "🇬🇧 EN"}
      </button>
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "1px 5px",
  borderRadius: 4,
  background: "var(--surface2)",
  border: "0.5px solid var(--border2)",
  fontFamily: "monospace",
  fontSize: 9,
  color: "var(--text2)",
};

function FilterBtn({
  label, active, color, onClick,
}: {
  label: string; active: boolean; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 10,
        padding: "3px 9px",
        borderRadius: 10,
        border: `0.5px solid ${active ? color : "var(--border)"}`,
        background: active ? color + "28" : "transparent",
        color: active ? color : "var(--text3)",
        cursor: "pointer",
        fontWeight: active ? 600 : 400,
        transition: "all .15s",
        whiteSpace: "nowrap",
      }}
    >
      {active && (
        <span
          style={{
            display: "inline-block", width: 5, height: 5,
            borderRadius: "50%", background: color,
            marginRight: 4, verticalAlign: "middle",
          }}
        />
      )}
      {label}
    </button>
  );
}
