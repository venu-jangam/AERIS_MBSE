/* =====================================================================
   AERIS DIGITAL THREAD — Impact Analysis Engine (Module 3)
   ---------------------------------------------------------------------
   In-browser equivalent of the Neo4j traversal:
     MATCH (changed)-[:ALLOCATED_TO|FEEDS_INTO|MONITORED_BY|GOVERNS|
                      THREATENS|IMPACTS|CONTAINS|PERFORMS|READS
                      |SATISFIES|SOURCED_IN|BASELINED_IN *1..5]-(affected)
   Performs a bounded BFS over the typed edge list (both directions),
   resolves human-readable labels, and classifies impact severity.
   ===================================================================== */
(function (global) {
  "use strict";
  const A = global.AERIS;

  /* Build adjacency (undirected for impact reach, but remember direction) */
  const adj = {};
  function add(a, b, type, dir) {
    (adj[a] = adj[a] || []).push({ to: b, type, dir });
  }
  A.edges.forEach(e => { add(e.from, e.to, e.type, "out"); add(e.to, e.from, e.type, "in"); });

  /* Resolve any node id -> descriptor {id,kind,label,severityClass} */
  function resolve(id) {
    if (A.reqById[id]) {
      const r = A.reqById[id];
      return { id, kind: "Requirement", label: `${id} ${r.title}`, category: r.category, deferred: r.deferred };
    }
    if (A.subById[id]) return { id, kind: "Subsystem", label: `${id} ${A.subById[id].name}` };
    if (A.compById[id]) return { id, kind: "Component", label: `${id} ${A.compById[id].name}`, critical: A.compById[id].critical };
    if (A.fnById[id]) return { id, kind: "Function", label: `${id} ${A.fnById[id].name}` };
    if (A.clById[id]) return { id, kind: "ControlLoop", label: `${id} ${A.clById[id].name}` };
    if (A.riskById[id]) return { id, kind: "Risk", label: `${id} ${A.riskById[id].title}` };
    if (id.indexOf("SIG-") === 0) {
      const s = A.sigByTag[id.slice(4)];
      return { id, kind: "DataSignal", label: `Signal [${s.tag}] ${s.tier1}` };
    }
    if (A.lifecyclePhases.find(p => p.phase === id)) {
      const p = A.lifecyclePhases.find(p => p.phase === id);
      return { id, kind: "LifeCyclePhase", label: `${p.phase} (${p.gateReview})` };
    }
    return { id, kind: "Unknown", label: id };
  }

  /* Severity classification per Module 3.1 */
  function classify(node) {
    if (node.kind === "Requirement") {
      if (node.category === "FR" || node.category === "SC") return "critical";
      if (node.category === "OR" || node.category === "ER") return "warning";
      return "info";
    }
    if (node.kind === "ControlLoop") return "critical";   // SAFE/FAULT capable
    if (node.kind === "Risk") return "critical";
    if (node.kind === "LifeCyclePhase") return "warning"; // PLC gate item
    if (node.kind === "Function") return "warning";
    if (node.kind === "DataSignal") return "info";
    if (node.kind === "Component") return "info";          // BOM-only
    if (node.kind === "Subsystem") return "info";
    return "info";
  }

  /* Bounded BFS — returns ordered list of affected descriptors w/ path */
  function trace(startId, maxDepth) {
    maxDepth = maxDepth || 5;
    const seen = { [startId]: true };
    const out = [];
    let frontier = [{ id: startId, depth: 0, path: [startId], via: "" }];
    while (frontier.length) {
      const next = [];
      frontier.forEach(cur => {
        (adj[cur.id] || []).forEach(e => {
          if (seen[e.to] || cur.depth >= maxDepth) return;
          seen[e.to] = true;
          const node = resolve(e.to);
          node.depth = cur.depth + 1;
          node.via = e.type;
          node.path = cur.path.concat(e.to);
          node.severity = classify(node);
          out.push(node);
          next.push({ id: e.to, depth: cur.depth + 1, path: node.path });
        });
      });
      frontier = next;
    }
    out.sort((a, b) => a.depth - b.depth || a.severity.localeCompare(b.severity));
    return out;
  }

  /* Full impact report (Module 3.2) */
  function report(startId, maxDepth) {
    const affected = trace(startId, maxDepth);
    const counts = { critical: 0, warning: 0, info: 0 };
    affected.forEach(n => counts[n.severity]++);
    const reqs = affected.filter(n => n.kind === "Requirement");
    const comps = affected.filter(n => n.kind === "Component");
    const phases = affected.filter(n => n.kind === "LifeCyclePhase");
    return {
      origin: resolve(startId),
      summary: `${counts.critical} critical, ${counts.warning} warnings, ${counts.info} info items`,
      counts, affected,
      affectedRequirements: reqs,
      affectedComponents: comps,
      affectedPhases: phases,
      recommendations: recommend(reqs, comps, phases),
    };
  }

  function recommend(reqs, comps, phases) {
    const recs = [];
    reqs.forEach(r => recs.push({ target: r.label, action: `Re-verify requirement ${r.id} (${(A.reqById[r.id]||{}).verificationMethod || "TBD"}).` }));
    comps.forEach(c => recs.push({ target: c.label, action: `Assess BOM substitution / re-qualification for ${c.id}.` }));
    phases.forEach(p => recs.push({ target: p.label, action: `Re-check ${p.id} gate deliverables and baseline.` }));
    return recs;
  }

  /* Resolve a DRM scenario's pre-wired path into descriptors */
  function drm(scenarioId) {
    const sc = A.drmScenarios.find(s => s.id === scenarioId);
    if (!sc) return null;
    return { id: sc.id, name: sc.name, nodes: sc.path.map(p => resolve(p.indexOf("SIG-") === 0 ? p : (A.sigByTag[p] ? "SIG-" + p : p))) };
  }

  global.THREAD = { trace, report, resolve, classify, drm };
})(typeof window !== "undefined" ? window : globalThis);
