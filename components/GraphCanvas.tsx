"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useGraphStore } from "../lib/store";
import { DataSet, Network, Node, Edge } from "vis-network/standalone";

export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<Network | null>(null);

  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const setSelected = useGraphStore((s) => s.setSelectedNodeId);

  const visNodes = useMemo(() => new DataSet<Node>(nodes.map(toVisNode)), [nodes]);
  const visEdges = useMemo(() => new DataSet<Edge>(edges.map(toVisEdge)), [edges]);

  useEffect(() => {
    if (!containerRef.current) return;
    const network = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      {
        autoResize: true,
        physics: { stabilization: true },
        interaction: { hover: true, navigationButtons: true },
        nodes: { shape: "dot", size: 14, font: { color: "#e6f0ff" } },
        edges: { color: { color: "#2c3a4a" }, width: 1, smooth: { type: "continuous" } },
      }
    );
    networkRef.current = network;
    const selectHandler = (params: any) => {
      const id = params.nodes?.[0];
      setSelected(id);
    };
    network.on("selectNode", selectHandler);
    network.on("deselectNode", () => setSelected(undefined));

    return () => {
      network.off("selectNode", selectHandler as any);
      network.destroy();
      networkRef.current = null;
    };
  }, [visNodes, visEdges, setSelected]);

  useEffect(() => {
    if (!networkRef.current) return;
    if (selectedNodeId) {
      networkRef.current.selectNodes([selectedNodeId]);
      networkRef.current.focus(selectedNodeId, { scale: 1, animation: true });
    }
  }, [selectedNodeId]);

  return <div ref={containerRef} className="graphContainer" />;
}

function toVisNode(n: any): Node {
  const color = typeColor(n.type);
  return {
    id: n.id,
    label: n.title,
    color: { background: color.bg, border: color.border },
    borderWidth: 2,
  } as Node;
}

function toVisEdge(e: any): Edge {
  return {
    id: e.id,
    from: e.sourceId,
    to: e.targetId,
    arrows: e.bidirectional ? "to, from" : "to",
    label: e.label,
    width: 1 + e.weight * 2,
    color: { color: "#334257" },
    font: { color: "#93a4b7", size: 10 },
  } as Edge;
}

function typeColor(type: string) {
  switch (type) {
    case "character":
      return { bg: "#1f2937", border: "#60a5fa" };
    case "concept":
      return { bg: "#102a26", border: "#6ee7b7" };
    case "dialogue":
      return { bg: "#2d1a2f", border: "#f472b6" };
    case "location":
      return { bg: "#1a2e2f", border: "#22d3ee" };
    case "artifact":
      return { bg: "#2f241a", border: "#f59e0b" };
    case "theme":
      return { bg: "#231a2f", border: "#a78bfa" };
    case "plot":
      return { bg: "#2f1a1a", border: "#ef4444" };
    default:
      return { bg: "#0f141b", border: "#93a4b7" };
  }
}
