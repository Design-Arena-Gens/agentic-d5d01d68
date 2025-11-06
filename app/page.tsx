"use client";

import React, { useEffect } from "react";
import { NodeForm } from "../components/NodeForm";
import { GraphCanvas } from "../components/GraphCanvas";
import { SwarmConsole } from "../components/SwarmConsole";
import { SidebarMetrics } from "../components/SidebarMetrics";
import { useGraphStore } from "../lib/store";

export default function Page() {
  const init = useGraphStore((s) => s.initFromStorage);

  useEffect(() => {
    init();
  }, [init]);

  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="h1">The Living Archive</h1>
          <div className="muted small">Self-organizing decentralized creative consciousness</div>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <div className="badge">Nodes: {nodes.length}</div>
          <div className="badge">Links: {edges.length}</div>
        </div>
      </div>

      <div className="panel">
        <NodeForm />
      </div>

      <div className="panel" style={{ overflow: "hidden" }}>
        <GraphCanvas />
      </div>

      <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SidebarMetrics />
        <div className="hr" />
        <SwarmConsole />
      </div>
    </div>
  );
}
