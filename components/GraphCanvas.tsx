"use client";

import { useEffect, useRef, useCallback } from "react";
import type { CSNode, Edge } from "@/types/map";

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface Props {
  nodes: CSNode[];
  edges: Edge[];
  visibleIds: Set<string>;
  selectedId: string | null;
  hoverId: string | null;
  lang: "en" | "ro";
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  transformRef: React.MutableRefObject<Transform>;
}

export default function GraphCanvas({
  nodes,
  edges,
  visibleIds,
  selectedId,
  hoverId,
  lang,
  onSelect,
  onHover,
  transformRef,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const transformStart = useRef({ x: 0, y: 0, scale: 1 });
  const animFrame = useRef<number>(0);

  const nodeById = useCallback(
    (id: string) => nodes.find((n) => n.id === id),
    [nodes],
  );

  const worldToScreen = useCallback(
    (wx: number, wy: number, t: Transform) => ({
      x: wx * t.scale + t.x,
      y: wy * t.scale + t.y,
    }),
    [],
  );

  const screenToWorld = useCallback(
    (sx: number, sy: number, t: Transform) => ({
      x: (sx - t.x) / t.scale,
      y: (sy - t.y) / t.scale,
    }),
    [],
  );

  const getNodeAt = useCallback(
    (sx: number, sy: number) => {
      const w = screenToWorld(sx, sy, transformRef.current);
      let best: CSNode | null = null;
      let bestD = Infinity;
      nodes.forEach((n) => {
        const d = Math.hypot(n.x - w.x, n.y - w.y);
        if (d < n.r + 6 && d < bestD) {
          best = n;
          bestD = d;
        }
      });
      return best;
    },
    [nodes, screenToWorld, transformRef],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width,
      H = canvas.height;
    const t = transformRef.current;

    ctx.clearRect(0, 0, W, H);

    // Subtle grid
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    ctx.lineWidth = 0.5;
    const gridSize = 60 * t.scale;
    const offX = ((t.x % gridSize) + gridSize) % gridSize;
    const offY = ((t.y % gridSize) + gridSize) % gridSize;
    for (let x = offX; x < W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = offY; y < H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(t.scale, t.scale);

    // ---- Edges ----
    edges.forEach((e) => {
      const a = nodeById(e.from),
        b = nodeById(e.to);
      if (!a || !b) return;

      const selA = selectedId === a.id,
        selB = selectedId === b.id;
      const isHighlighted = selA || selB;
      const isConnected =
        selectedId && (a.id === selectedId || b.id === selectedId);
      if (selectedId && !isConnected) return;

      const aVis = visibleIds.has(a.id),
        bVis = visibleIds.has(b.id);
      if (!aVis && !bVis) return;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);

      if (isHighlighted) {
        ctx.strokeStyle = "rgba(239,159,39,0.7)";
        ctx.lineWidth = 1.5 / t.scale;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = "rgba(150,148,168,0.12)";
        ctx.lineWidth = 0.8 / t.scale;
        ctx.setLineDash([4 / t.scale, 5 / t.scale]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // arrowhead on highlighted edges
      if (isHighlighted) {
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const ex = a.x + (dx / dist) * (dist - b.r - 4 / t.scale);
        const ey = a.y + (dy / dist) * (dist - b.r - 4 / t.scale);
        const angle = Math.atan2(dy, dx);
        const as = 7 / t.scale;
        ctx.beginPath();
        ctx.moveTo(
          ex - Math.cos(angle - 0.4) * as,
          ey - Math.sin(angle - 0.4) * as,
        );
        ctx.lineTo(ex, ey);
        ctx.lineTo(
          ex - Math.cos(angle + 0.4) * as,
          ey - Math.sin(angle + 0.4) * as,
        );
        ctx.strokeStyle = "#EF9F27";
        ctx.lineWidth = 1.5 / t.scale;
        ctx.stroke();
      }

      // Edge type label on highlighted
      if (isHighlighted) {
        const mx = (a.x + b.x) / 2,
          my = (a.y + b.y) / 2;
        const fs = Math.max(8, 10 / t.scale);
        ctx.font = `400 ${fs}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const tw = ctx.measureText(e.type).width;
        ctx.fillStyle = "rgba(20,20,28,0.85)";
        ctx.fillRect(mx - tw / 2 - 4, my - fs * 0.7, tw + 8, fs * 1.4);
        ctx.fillStyle = "#EF9F27";
        ctx.fillText(e.type, mx, my);
      }
    });

    // ---- Nodes ----
    nodes.forEach((n) => {
      const visible = visibleIds.has(n.id);
      const isSel = selectedId === n.id;
      const isHov = hoverId === n.id;
      const isDim =
        selectedId != null &&
        !isSel &&
        !edges.some(
          (e) =>
            (e.from === selectedId && e.to === n.id) ||
            (e.to === selectedId && e.from === n.id),
        );

      ctx.globalAlpha = !visible ? 0.06 : isDim ? 0.18 : 1;

      const r = n.r * (isSel ? 1.12 : isHov ? 1.05 : 1);

      // glow
      if (isSel) {
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 22;
      } else if (isHov) {
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
      }

      // UVT dashed ring
      if (n.cluster === "uvt" && visible) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 5 / t.scale, 0, Math.PI * 2);
        ctx.strokeStyle = "#3B8BD4";
        ctx.lineWidth = 1.5 / t.scale;
        ctx.setLineDash([4 / t.scale, 3 / t.scale]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // fill
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();

      ctx.shadowBlur = 0;

      // border
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = isSel
        ? "#EF9F27"
        : isHov
          ? "rgba(255,255,255,0.45)"
          : "rgba(255,255,255,0.18)";
      ctx.lineWidth = (isSel ? 2 : 0.8) / t.scale;
      ctx.stroke();

      // label
      const label = lang === "en" ? n.label : n.labelRO;
      const lines = label.split("\n");
      const fs = Math.max(6.5, Math.min(12, n.r / 2.4));
      ctx.font = `${isSel ? 600 : 500} ${fs}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = n.textColor ?? "#fff";
      const lh = fs * 1.28;
      lines.forEach((line, i) => {
        const yo = (i - (lines.length - 1) / 2) * lh;
        ctx.fillText(line, n.x, n.y + yo);
      });

      ctx.globalAlpha = 1;
    });

    ctx.restore();

    // ---- Minimap ----
    drawMinimap(ctx, W, H, t);
  }, [
    nodes,
    edges,
    visibleIds,
    selectedId,
    hoverId,
    lang,
    nodeById,
    transformRef,
  ]);

  function drawMinimap(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    t: Transform,
  ) {
    const mW = 130,
      mH = 90,
      pad = 8,
      mx0 = W - mW - 10,
      my0 = H - mH - 10;
    const minX = Math.min(...nodes.map((n) => n.x - n.r));
    const maxX = Math.max(...nodes.map((n) => n.x + n.r));
    const minY = Math.min(...nodes.map((n) => n.y - n.r));
    const maxY = Math.max(...nodes.map((n) => n.y + n.r));
    const sc =
      Math.min((mW - pad * 2) / (maxX - minX), (mH - pad * 2) / (maxY - minY)) *
      0.88;

    ctx.save();
    ctx.fillStyle = "rgba(14,14,20,0.88)";
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.roundRect(mx0, my0, mW, mH, 6);
    ctx.fill();
    ctx.stroke();

    nodes.forEach((n) => {
      const nx = mx0 + pad + (n.x - minX) * sc;
      const ny = my0 + pad + (n.y - minY) * sc;
      ctx.beginPath();
      ctx.arc(nx, ny, Math.max(1.5, n.r * sc), 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = visibleIds.has(n.id) ? 0.85 : 0.12;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // viewport rect
    const vpX = mx0 + pad + (-t.x / t.scale - minX) * sc;
    const vpY = my0 + pad + (-t.y / t.scale - minY) * sc;
    const vpW = (canvasRef.current!.width / t.scale) * sc;
    const vpH = (canvasRef.current!.height / t.scale) * sc;
    ctx.strokeStyle = "#EF9F27";
    ctx.lineWidth = 1;
    ctx.strokeRect(vpX, vpY, vpW, vpH);
    ctx.restore();
  }

  // Resize observer
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
      draw();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  // Redraw when props change
  useEffect(() => {
    cancelAnimationFrame(animFrame.current);
    animFrame.current = requestAnimationFrame(draw);
  }, [draw]);

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: MouseEvent) => {
      dragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      transformStart.current = { ...transformRef.current };
    };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (dragging.current) {
        transformRef.current.x =
          transformStart.current.x + (e.clientX - dragStart.current.x);
        transformRef.current.y =
          transformStart.current.y + (e.clientY - dragStart.current.y);
        draw();
      } else {
        const n: any = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
        const newHov = n ? n.id : null;
        onHover(newHov);
        canvas.style.cursor = newHov ? "pointer" : "grab";
      }
    };
    const onUp = (e: MouseEvent) => {
      const moved =
        Math.abs(e.clientX - dragStart.current.x) +
        Math.abs(e.clientY - dragStart.current.y);
      dragging.current = false;
      if (moved < 5) {
        const rect = canvas.getBoundingClientRect();
        const n:any = getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
        onSelect(n ? n.id : null);
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left,
        my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 0.91;
      const t = transformRef.current;
      t.x = mx - (mx - t.x) * factor;
      t.y = my - (my - t.y) * factor;
      t.scale = Math.max(0.18, Math.min(5, t.scale * factor));
      draw();
    };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [draw, getNodeAt, onSelect, onHover, transformRef]);

  return (
    <div
      ref={wrapRef}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        cursor: "grab",
        height: "85vh",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
