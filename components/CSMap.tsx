"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import mapData from "@/data/cs-map.json";
import type { CSMapData, CSNode, Edge } from "@/types/map";
import GraphCanvas from "./GraphCanvas";
import NodePanel from "./NodePanel";
import Toolbar from "./Toolbar";
import Legend from "./Legend";

const data = mapData as CSMapData;

// Build edge list from node connections (deduped)
function buildEdges(nodes: CSNode[]): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];
  nodes.forEach((n) => {
    (n.connections ?? []).forEach((c) => {
      const key = [n.id, c.to].sort().join("--");
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({ from: n.id, to: c.to, type: c.type });
      }
    });
  });
  return edges;
}

const ALL_EDGES = buildEdges(data.nodes);

export default function CSMap() {
  const [lang, setLang] = useState<"en" | "ro">("en");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCluster, setActiveCluster] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const transformRef = useRef({ x: 0, y: 0, scale: 0.82 });
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  // Compute visible node IDs
  const visibleIds = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return new Set(
      data.nodes
        .filter((n) => {
          const matchCluster =
            activeCluster === "all" || n.cluster === activeCluster;
          const matchLevel =
            selectedLevel === "all" ||
            n.studyLevel.includes(
              selectedLevel as "bachelor" | "master" | "phd",
            );
          const label = (lang === "en" ? n.label : n.labelRO).toLowerCase();
          const matchSearch =
            !q ||
            label.includes(q) ||
            n.id.toLowerCase().includes(q) ||
            n.people.some((p) => p.toLowerCase().includes(q)) ||
            n.venues.some((v) => v.toLowerCase().includes(q));
          return matchCluster && matchLevel && matchSearch;
        })
        .map((n) => n.id),
    );
  }, [searchQuery, activeCluster, selectedLevel, lang]);

  const selectedNode = useMemo(
    () =>
      selectedId ? (data.nodes.find((n) => n.id === selectedId) ?? null) : null,
    [selectedId],
  );

  // Center graph on first mount
  useEffect(() => {
    const nodes = data.nodes;
    if (!nodes.length) return;
    const cx = nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
    const cy = nodes.reduce((s, n) => s + n.y, 0) / nodes.length;
    // Use a reasonable starting viewport; canvas dims not known yet, use 900×580 estimate
    transformRef.current = {
      x: 900 / 2 - cx * 0.82,
      y: 580 / 2 - cy * 0.82 + 20,
      scale: 0.82,
    };
  }, []);

  // Keyboard navigation
  const focusIdxRef = useRef(0);

  const centerOnNode = useCallback((node: CSNode) => {
    if (!canvasWrapRef.current) return;
    const W = canvasWrapRef.current.clientWidth;
    const H = canvasWrapRef.current.clientHeight;
    const t = transformRef.current;
    const sx = node.x * t.scale + t.x;
    const sy = node.y * t.scale + t.y;
    const offX = W / 2 - sx;
    const offY = H / 2 - sy;
    transformRef.current.x += offX * 0.45;
    transformRef.current.y += offY * 0.45;
  }, []);

  useEffect(() => {
    const visArray = data.nodes.filter((n) => visibleIds.has(n.id));

    const handleKey = (e: KeyboardEvent) => {
      // Ignore when typing in search
      if (document.activeElement?.tagName === "INPUT") return;

      if (e.key === "Escape") {
        setSelectedId(null);
        return;
      }

      if (e.key === "Enter") {
        if (hoverId) {
          setSelectedId(hoverId);
        } else if (visArray[focusIdxRef.current]) {
          setSelectedId(visArray[focusIdxRef.current].id);
        }
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        focusIdxRef.current = (focusIdxRef.current + 1) % visArray.length;
        const n = visArray[focusIdxRef.current];
        if (n) {
          setHoverId(n.id);
          centerOnNode(n);
        }
        return;
      }

      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
        return;
      e.preventDefault();

      const dx = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      const dy = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;

      const curId = selectedId ?? hoverId ?? visArray[focusIdxRef.current]?.id;
      const cur = data.nodes.find((n) => n.id === curId) ?? visArray[0];
      if (!cur) return;

      let best: CSNode | null = null;
      let bestScore = Infinity;
      visArray.forEach((n) => {
        if (n.id === cur.id) return;
        const ddx = n.x - cur.x,
          ddy = n.y - cur.y;
        const dist = Math.hypot(ddx, ddy);
        if (dist === 0) return;
        const dot = (ddx / dist) * dx + (ddy / dist) * dy;
        if (dot < 0.25) return;
        const score = dist / (dot + 0.01);
        if (score < bestScore) {
          bestScore = score;
          best = n;
        }
      });

      if (best) {
        const b = best as CSNode;
        focusIdxRef.current = visArray.indexOf(b);
        setHoverId(b.id);
        if (selectedId) setSelectedId(b.id);
        centerOnNode(b);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visibleIds, selectedId, hoverId, centerOnNode]);

  const handleNavigate = useCallback(
    (id: string) => {
      setSelectedId(id);
      const n = data.nodes.find((x) => x.id === id);
      if (n) centerOnNode(n);
    },
    [centerOnNode],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Toolbar
        clusters={data.clusters}
        activeCluster={activeCluster}
        onClusterChange={setActiveCluster}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        lang={lang}
        onLangToggle={() => setLang((l) => (l === "en" ? "ro" : "en"))}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas area */}
        <div
          ref={canvasWrapRef}
          style={{ flex: 1, position: "relative", overflow: "hidden" }}
        >
          <GraphCanvas
            nodes={data.nodes}
            edges={ALL_EDGES}
            visibleIds={visibleIds}
            selectedId={selectedId}
            hoverId={hoverId}
            lang={lang}
            onSelect={(id) => setSelectedId(id)}
            onHover={setHoverId}
            transformRef={transformRef}
          />

          {/* Node count badge */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              fontSize: 10,
              color: "var(--text3)",
              background: "rgba(14,14,20,0.8)",
              border: "0.5px solid var(--border)",
              borderRadius: 6,
              padding: "4px 8px",
              pointerEvents: "none",
            }}
          >
            {visibleIds.size} / {data.nodes.length}{" "}
            {lang === "en" ? "nodes" : "noduri"}
            {selectedNode && (
              <span style={{ color: "var(--accent)", marginLeft: 6 }}>
                ·{" "}
                {(lang === "en"
                  ? selectedNode.label
                  : selectedNode.labelRO
                ).replace("\n", " ")}
              </span>
            )}
          </div>

          {/* Meta info */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 14,
              fontSize: 9,
              color: "var(--text3)",
              pointerEvents: "none",
              lineHeight: 1.6,
            }}
          >
            <div>{data.meta.source}</div>
            <div>
              {lang === "en" ? data.meta.institution : data.meta.institutionRO}{" "}
              · {data.meta.year}
            </div>
          </div>

          <Legend lang={lang} />
        </div>

        {/* Side panel */}
        {selectedNode && (
          <NodePanel
            node={selectedNode}
            lang={lang}
            allNodes={data.nodes}
            onClose={() => setSelectedId(null)}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  );
}
