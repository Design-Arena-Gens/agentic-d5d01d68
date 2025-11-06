"use client";

import React, { useMemo, useState } from "react";
import { useGraphStore } from "../lib/store";
import type { NodeType } from "../lib/types";

const NODE_TYPES: NodeType[] = [
  "character",
  "concept",
  "dialogue",
  "location",
  "artifact",
  "theme",
  "plot",
];

export function NodeForm() {
  const [type, setType] = useState<NodeType>("concept");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [edgeLabel, setEdgeLabel] = useState("relates to");

  const addNode = useGraphStore((s) => s.addNode);
  const nodes = useGraphStore((s) => s.nodes);
  const selected = useGraphStore((s) => s.selectedNodeId);
  const setSelected = useGraphStore((s) => s.setSelectedNodeId);
  const addEdge = useGraphStore((s) => s.addEdge);
  const removeNode = useGraphStore((s) => s.removeNode);
  const clearAll = useGraphStore((s) => s.clearAll);

  const otherNodes = useMemo(() => nodes.filter((n) => n.id !== selected), [nodes, selected]);
  const [targetId, setTargetId] = useState<string>("");

  const canLink = selected && targetId;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="row">
        <div style={{ flex: 1 }}>
          <div className="label">Type</div>
          <select value={type} onChange={(e) => setType(e.target.value as NodeType)}>
            {NODE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 2 }}>
          <div className="label">Title</div>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Protagonist Doubt" />
        </div>
      </div>
      <div>
        <div className="label">Content</div>
        <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe the node's meaning or essence" />
      </div>
      <div className="row">
        <button
          className="button"
          onClick={() => {
            if (!title.trim()) return;
            const newNode = addNode({ type, title, content });
            setTitle("");
            setContent("");
            setSelected(newNode.id);
          }}
        >
          Add Node
        </button>
        <button className="button secondary" onClick={() => clearAll()}>Clear All</button>
        {selected && (
          <button className="button danger" onClick={() => removeNode(selected)}>Delete Selected</button>
        )}
      </div>

      <div className="hr" />

      <div className="row" style={{ alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <div className="label">Selected</div>
          <div className="badge" style={{ width: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selected ? nodes.find((n) => n.id === selected)?.title : "None"}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="label">Link To</div>
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            <option value="">-- choose --</option>
            {otherNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div className="label">Relation Label</div>
          <input className="input" value={edgeLabel} onChange={(e) => setEdgeLabel(e.target.value)} />
        </div>
        <button
          className="button"
          disabled={!canLink}
          onClick={() => {
            if (!selected || !targetId) return;
            addEdge({ sourceId: selected, targetId, label: edgeLabel, weight: 0.7, bidirectional: true });
          }}
        >
          Link
        </button>
      </div>
    </div>
  );
}
