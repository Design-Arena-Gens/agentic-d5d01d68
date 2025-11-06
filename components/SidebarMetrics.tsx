"use client";

import React, { useMemo } from "react";
import { useGraphStore } from "../lib/store";

export function SidebarMetrics() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);

  const { density, avgDegree, biDirectionalShare } = useMemo(() => {
    const n = nodes.length;
    const m = edges.length;
    const undirectedEdgeCount = edges.reduce((acc, e) => acc + (e.bidirectional ? 1 : 0), 0);
    const density = n > 1 ? (2 * m) / (n * (n - 1)) : 0;
    const degree = n ? (2 * m) / n : 0;
    const biDirectionalShare = m ? undirectedEdgeCount / m : 0;
    return { density, avgDegree: degree, biDirectionalShare };
  }, [nodes, edges]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div className="label">Relational Density ?(N??N?)d?</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{density.toFixed(3)}</div>
        </div>
        <div className="badge">Avg Degree: {avgDegree.toFixed(2)}</div>
      </div>
      <div className="hr" />
      <div className="list">
        <div>
          <div className="label">Bidirectional Link Share</div>
          <progress max={1} value={biDirectionalShare} style={{ width: "100%" }} />
          <div className="small muted">{(biDirectionalShare * 100).toFixed(0)}%</div>
        </div>
        <InsightBlurb />
      </div>
    </div>
  );
}

function InsightBlurb() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);

  const top = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of edges) {
      counts[e.sourceId] = (counts[e.sourceId] ?? 0) + 1;
      counts[e.targetId] = (counts[e.targetId] ?? 0) + 1;
    }
    const items = Object.entries(counts)
      .map(([id, c]) => ({ id, c }))
      .sort((a, b) => b.c - a.c)
      .slice(0, 3);
    return items.map((i) => nodes.find((n) => n.id === i.id)?.title || i.id);
  }, [nodes, edges]);

  if (!nodes.length) return null;
  return (
    <div className="small">
      <div className="label">Insights</div>
      <div className="muted">
        Key hubs: {top.length ? top.join(", ") : "-"}. Consider reinforcing cross-bridges between disparate clusters.
      </div>
    </div>
  );
}
