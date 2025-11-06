"use client";

import React, { useMemo, useState } from "react";
import { orchestrate, getSwarm } from "../lib/swarm";
import { useGraphStore } from "../lib/store";
import type { SwarmSuggestion } from "../lib/types";

export function SwarmConsole() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SwarmSuggestion[]>([]);
  const [busy, setBusy] = useState(false);

  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const addNode = useGraphStore((s) => s.addNode);
  const addEdge = useGraphStore((s) => s.addEdge);

  const swarm = useMemo(() => getSwarm(), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="label">The Swarm Consciousness</div>
      <div className="small muted">{swarm.length} specialized agents, each with unique cryptographic identity.</div>
      <div className="row">
        <input
          className="input"
          placeholder="Pose a problem or intention (e.g., 'Map tension between duty and desire in Act II')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="button"
          disabled={busy || !query.trim()}
          onClick={() => {
            setBusy(true);
            // Simulate async orchestration
            setTimeout(() => {
              const res = orchestrate(query, nodes, edges);
              setSuggestions(res);
              setBusy(false);
            }, 200);
          }}
        >
          {busy ? "Thinking..." : "Swarm"}
        </button>
      </div>
      {suggestions.length > 0 && <div className="hr" />}
      {suggestions.map((s) => (
        <div key={s.id} className="panel" style={{ background: "#0c1218" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700 }}>{s.title}</div>
            <div className="badge">Endorsements: {s.agentEndorsements}</div>
          </div>
          <div className="small muted" style={{ marginTop: 6 }}>{s.rationale}</div>
          <div className="hr" />
          <div className="small label">Proposed Nodes</div>
          <div className="list">
            {s.nodes.map((n, i) => (
              <div key={i} className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <span className="badge" style={{ marginRight: 8 }}>{n.type}</span>
                  <b>{n.title}</b>
                  <span className="muted"> ? {n.content}</span>
                </div>
              </div>
            ))}
          </div>
          {s.edges.length > 0 && (
            <>
              <div className="hr" />
              <div className="small label">Proposed Links</div>
              <div className="list">
                {s.edges.map((e, i) => (
                  <div key={i} className="small muted">
                    link: {e.label} (w={e.weight?.toFixed(2)})
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="row" style={{ marginTop: 10 }}>
            <button
              className="button"
              onClick={() => {
                // Materialize nodes
                const idMap: Record<string, string> = {};
                const created = s.nodes.map((n) => {
                  const node = addNode({ type: n.type, title: n.title, content: n.content });
                  idMap[n.title] = node.id;
                  return node;
                });
                // Materialize edges, map placeholder anchor if empty
                s.edges.forEach((e) => {
                  const src = e.sourceId || created[0]?.id || nodes[nodes.length - 1]?.id;
                  const tgt = e.targetId || created[created.length - 1]?.id || nodes[nodes.length - 1]?.id;
                  if (src && tgt) addEdge({ sourceId: src, targetId: tgt, label: e.label, weight: e.weight, bidirectional: e.bidirectional });
                });
              }}
            >
              Accept
            </button>
            <button className="button secondary" onClick={() => setSuggestions((prev) => prev.filter((x) => x.id !== s.id))}>
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
