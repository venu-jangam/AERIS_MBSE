/* =====================================================================
   AERIS FDM — MBSE Dashboard | Application shell + 10 views
   Pure vanilla JS (no build, no CDN). Runs by opening index.html.
   ===================================================================== */
(function (global) {
  "use strict";
  const A = global.AERIS, T = global.THREAD, U = global.UI;
  const { h, el, esc, reqChip } = U;

  const NAV = [
    { id: "home", icon: "🛰", label: "Overview" },
    { id: "rflp", icon: "📐", label: "RFLP Navigator" },
    { id: "pbs", icon: "🗂", label: "PBS Explorer" },
    { id: "ffbd", icon: "🔄", label: "FFBD Flow Viewer" },
    { id: "datatiers", icon: "📊", label: "Data Tiers" },
    { id: "requirements", icon: "📋", label: "Requirements Matrix" },
    { id: "bom", icon: "🧾", label: "BOM Manager" },
    { id: "swarch", icon: "⚙️", label: "Software Architecture" },
    { id: "plc", icon: "📅", label: "Product Life Cycle" },
    { id: "risk", icon: "⚠️", label: "Risk Register" },
    { id: "thread", icon: "🔗", label: "Digital Thread" },
  ];

  let current = "home";
  let configMode = "STANDARD";

  /* ---------------- Shell ---------------------------------------- */
  function renderShell() {
    const cfg = A.config;
    document.body.appendChild(h("div", { id: "app" }, [
      // top bar
      h("div", { class: "topbar" }, [
        h("div", { class: "brand" }, [
          h("div", { class: "logo" }, "Æ"),
          h("div", null, [document.createTextNode("AERIS FDM"), h("small", null, "SPACE COPY · MBSE")]),
        ]),
        h("span", { class: "pill" }, [document.createTextNode("System: "), h("b", null, cfg.system)]),
        configSelect(),
        h("span", { class: "pill" }, [document.createTextNode("Phase: "), h("b", null, cfg.phase)]),
        h("span", { class: "pill tag-trl" }, [document.createTextNode("TRL "), h("b", { class: "tag-trl" }, cfg.trl), document.createTextNode(" ▸ " + cfg.trlTarget)]),
        h("span", { class: "grow" }),
        h("input", { class: "search", id: "globalSearch", placeholder: "Search model…", oninput: onSearch }),
        h("button", { class: "btn sm", onclick: exportView }, "Export ▾"),
        h("button", { class: "btn sm", title: "Notifications", onclick: () => go("home"), id: "notif-btn" },
          ["🔔 ", h("span", { id: "notif-count" }, "0")]),
      ]),
      // sidebar
      h("div", { class: "sidebar" }, [
        h("div", { class: "nav", id: "nav" }, buildNav()),
        h("div", { class: "sidefoot" }, [
          h("div", { class: "lbl", style: "margin-bottom:6px;color:var(--text-dim)" }, "👥 Collaborators"),
          h("div", { class: "collab" }, [
            avatar("VJ", "#1A6EFF"), avatar("SC", "#22C55E"), avatar("ME", "#F97316"),
          ]),
          h("div", { class: "lbl small" }, "🔒 Live sync ready · 3 online"),
        ]),
      ]),
      // main
      h("div", { class: "main", id: "main" }),
    ]));

    // drawer + mask
    document.body.appendChild(h("div", { class: "drawer-mask", id: "mask", onclick: closeDrawer }));
    document.body.appendChild(h("div", { class: "drawer", id: "drawer" }));
    go("home");
  }

  function buildNav() {
    const items = [];
    NAV.forEach((n, i) => {
      if (i === 1 || i === 10) items.push(h("div", { class: "sep" }));
      items.push(h("button", { class: "navbtn" + (n.id === current ? " active" : ""), "data-id": n.id, onclick: () => go(n.id) },
        [h("span", { class: "ic" }, n.icon), h("span", { class: "lbl" }, n.label)]));
    });
    return items;
  }
  const avatar = (t, c) => h("div", { class: "avatar", style: `background:${c}` }, t);

  function configSelect() {
    const s = h("select", { id: "cfgSel", title: "Configuration",
      onchange: (e) => { configMode = e.target.value; U.notify(`Configuration set to AERIS ${configMode}`, "info"); go(current); } });
    ["STANDARD", "DESKTOP"].forEach(k => {
      const o = h("option", { value: k }, "Config: " + k);
      if (k === configMode) o.selected = true; s.appendChild(o);
    });
    return s;
  }

  /* ---------------- Router --------------------------------------- */
  function go(id) {
    current = id;
    document.querySelectorAll(".navbtn").forEach(b => b.classList.toggle("active", b.getAttribute("data-id") === id));
    const main = el("main"); main.innerHTML = "";
    (VIEWS[id] || VIEWS.home)(main);
    main.scrollTop = 0;
  }
  global.go = go;

  /* ---------------- Drawer (shared detail / thread) -------------- */
  function openDrawer(title, sub, bodyNodes) {
    const d = el("drawer");
    d.innerHTML = "";
    d.appendChild(h("header", null, [
      h("div", null, [h("h2", null, title), sub ? h("div", { class: "muted small" }, sub) : null]),
      h("button", { class: "x", onclick: closeDrawer }, "×"),
    ]));
    d.appendChild(h("div", { class: "body" }, bodyNodes));
    d.classList.add("open"); el("mask").classList.add("open");
  }
  function closeDrawer() { el("drawer").classList.remove("open"); el("mask").classList.remove("open"); }

  /* Digital-thread panel reused from chips everywhere */
  function openThread(nodeId) {
    const rep = T.report(nodeId, 5);
    const sect = (title, nodes) => h("div", { class: "sect" }, [h("h4", null, title), nodes]);
    const sevList = rep.affected.slice(0, 60).map(n =>
      h("div", { class: "impact-item" }, [
        U.sevDot(n.severity),
        h("span", { class: "badge mono" }, n.kind),
        h("span", { style: "flex:1", html: esc(n.label) }),
        h("span", { class: "depth-pill" }, "d" + n.depth),
      ]));
    openDrawer("🔗 " + rep.origin.label, "Digital Thread · " + rep.summary, [
      sect("Impact summary", h("div", { class: "legend" }, [
        h("span", null, [U.sevDot("critical"), `${rep.counts.critical} critical`]),
        h("span", null, [U.sevDot("warning"), `${rep.counts.warning} warning`]),
        h("span", null, [U.sevDot("info"), `${rep.counts.info} info`]),
      ])),
      sect(`Affected elements (${rep.affected.length})`, h("div", null, sevList.length ? sevList : [h("div", { class: "empty" }, "No downstream impact")])),
      rep.recommendations.length ? sect("Recommended actions", h("div", null,
        rep.recommendations.slice(0, 20).map(r => h("div", { class: "small", style: "margin:5px 0;color:var(--text-dim)" },
          [h("b", { style: "color:var(--text)" }, "• "), r.action])))) : null,
    ]);
    U.notify(`Impact analysis on ${nodeId}: ${rep.summary}`, rep.counts.critical ? "critical" : "warning");
  }
  global.openThread = openThread;

  function onSearch(e) {
    const q = e.target.value.trim().toLowerCase();
    if (e.key === "Enter" || q.length < 2) {}
    // lightweight: jump to requirements view filtered when typing
  }
  function exportView() {
    // Offline export: dump the current model collection to CSV / JSON download
    const blob = new Blob([JSON.stringify({ view: current, config: configMode, model: {
      requirements: A.requirements, components: A.components, risks: A.risks } }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = h("a", { href: url, download: `AERIS_${current}_export.json` }); document.body.appendChild(a); a.click(); a.remove();
    U.notify("Exported " + current + " (JSON)", "info");
  }

  /* helper: view header */
  function head(title, sub, tools) {
    return h("div", null, [
      h("div", { class: "view-head" }, [h("h1", null, title)]),
      h("p", { class: "view-sub" }, sub),
      tools ? h("div", { class: "toolbar" }, tools) : null,
    ]);
  }

  /* ================================================================
     VIEW: HOME / OVERVIEW
     ================================================================ */
  const VIEWS = {};
  VIEWS.home = function (root) {
    const v = h("div", { class: "view" });
    v.appendChild(head("AERIS FDM System — MBSE Dashboard",
      "Model-Based Systems Engineering workspace for the AERIS field-deployable additive manufacturing platform. SysML v2-aligned digital thread across requirements, functions, logical & physical architecture. Compliant with " + A.config.standard + "."));

    const verified = A.requirements.filter(r => r.status === "Verified").length;
    const deferred = A.requirements.filter(r => r.deferred).length;
    const bomTotal = A.components.reduce((s, c) => s + c.unitCost * c.quantity, 0);
    const kpis = [
      ["Requirements", A.requirements.length, "📋", "requirements"],
      ["Subsystems (PBS)", A.subsystems.filter(s => !s.parentId).length + " top / " + A.subsystems.length + " nodes", "🗂", "pbs"],
      ["FFBD Functions", A.functions.length, "🔄", "ffbd"],
      ["Control Loops", A.controlLoops.length, "⚙️", "swarch"],
      ["BOM Line Items", A.components.length, "🧾", "bom"],
      ["BOM Cost (Rev 2)", "$" + bomTotal.toLocaleString(), "💰", "bom"],
      ["Open Risks", A.risks.length, "⚠️", "risk"],
      ["Deferred Reqs", deferred + " (spaceflight)", "🟣", "requirements"],
    ];
    const grid = h("div", { class: "grid", style: "grid-template-columns:repeat(auto-fill,minmax(190px,1fr))" },
      kpis.map(([l, n, ic, view]) => h("div", { class: "card kpi", style: "cursor:pointer", onclick: () => go(view) },
        [h("div", { class: "l" }, ic + " " + l), h("div", { class: "n" }, String(n))])));
    v.appendChild(grid);

    // config card + post-process KPI + notifications
    const cfg = A.config.configurations[configMode];
    const row = h("div", { class: "grid", style: "grid-template-columns:1.2fr 1fr;margin-top:14px" }, [
      h("div", { class: "card" }, [
        h("h3", null, ["🛰 Active Configuration ", h("span", { class: "badge" + (configMode === "DESKTOP" ? " desktop" : "") }, "AERIS " + configMode)]),
        kv("Build volume", cfg.build), kv("Power", cfg.power),
        kv("Phase / Gate", A.config.phase), kv("TRL", A.config.trl + " → target " + A.config.trlTarget),
        kv("Post-process window", A.config.postProcessWindowMin + " min (Stage 4 KPI)"),
        kv("Standard", A.config.standard),
        configMode === "DESKTOP" ? h("div", { class: "small", style: "margin-top:8px;color:var(--deferred)" }, "DESKTOP is a secondary configuration.") : null,
      ]),
      h("div", { class: "card", id: "notif-card" }, [h("h3", null, "🔔 Change & Impact Feed"), h("div", { id: "notif-feed" })]),
    ]);
    v.appendChild(row);

    // constraints enforcement banner
    v.appendChild(h("div", { class: "card", style: "margin-top:14px" }, [
      h("h3", null, "⚠️ Enforced Model Constraints"),
      h("div", { class: "small muted", html:
        "• Deferred items <b style='color:#c9a8ff'>ER-1 / ER-2 / ER-4</b> shown with purple dashed badges (not verification-active).<br>" +
        "• <b>BOM Rev 2 (Apr 2026)</b> is the authoritative hardware source — PBS nodes without a BOM line are flagged as BOM gaps.<br>" +
        "• <b>Requirements Matrix</b> is the authoritative requirement source.<br>" +
        "• <b>AERIS STANDARD</b> is primary; DESKTOP carries a badge.<br>" +
        "• Post-processing <b>20-minute</b> window is a Stage-4 KPI." }),
    ]));

    root.appendChild(v);
    refreshNotifications();
  };
  function kv(k, val) { return h("div", { class: "kv" }, [h("span", { class: "k" }, k), h("span", null, val)]); }

  global.refreshNotifications = function () {
    const f = el("notif-feed"); if (!f) return; f.innerHTML = "";
    const list = U.notifications.slice(0, 12);
    if (!list.length) { f.appendChild(h("div", { class: "small muted" }, "No changes yet. Run a Digital Thread analysis to populate impact alerts.")); return; }
    list.forEach(n => f.appendChild(h("div", { class: "feed-item" }, [U.sevDot(n.sev),
      h("span", { style: "flex:1" }, n.msg), h("span", { class: "small muted" }, n.t.toLocaleTimeString())])));
  };

  /* ================================================================
     VIEW 1: RFLP NAVIGATOR  (swimlanes R / F / L / P)
     ================================================================ */
  VIEWS.rflp = function (root) {
    const v = h("div", { class: "view" });
    v.appendChild(head("RFLP Navigator",
      "Requirements → Functions → Logical → Physical. Click any element to highlight its full traceability thread across all four lanes."));
    let hl = null;

    const laneNode = (id, label, kind) => h("div", { class: "lane-node", "data-id": id, "data-kind": kind,
      onclick: () => highlight(id) }, label);

    const reqLane = h("div", { class: "lane" }, A.requirements.map(r => {
      const n = laneNode(r.id, r.id, "R");
      if (r.deferred) n.style.borderColor = A.TOKENS.deferred;
      n.style.color = A.CATEGORY_COLOR[r.category]; return n;
    }));
    const fnLane = h("div", { class: "lane" }, A.functions.map(f => laneNode(f.ffbdId, f.ffbdId + " " + f.name, "F")));
    const logLane = h("div", { class: "lane" }, A.controlLoops.map(c => laneNode(c.id, c.id + " " + c.name, "L")));
    const physLane = h("div", { class: "lane" }, A.subsystems.filter(s => !s.parentId).map(s => {
      const n = laneNode(s.pbsId, s.pbsId + " " + s.name.split("(")[0].trim(), "P");
      n.style.borderLeft = "3px solid " + s.color; return n;
    }));

    const swim = h("div", { class: "swim" }, [
      h("div", { class: "lane-label", style: "color:#1A6EFF" }, "R"), reqLane,
      h("div", { class: "lane-label", style: "color:#EAB308" }, "F"), fnLane,
      h("div", { class: "lane-label", style: "color:#22C55E" }, "L"), logLane,
      h("div", { class: "lane-label", style: "color:#F97316" }, "P"), physLane,
    ]);
    v.appendChild(swim);
    v.appendChild(h("div", { class: "small muted", style: "margin-top:10px" }, "Tip: clicking dims unrelated nodes and highlights the allocation chain. Click the same node again to clear."));
    root.appendChild(v);

    function highlight(id) {
      if (hl === id) { document.querySelectorAll(".lane-node").forEach(n => n.classList.remove("hl", "dim")); hl = null; return; }
      hl = id;
      const reach = new Set([id]);
      T.trace(id, 5).forEach(n => reach.add(n.id));
      document.querySelectorAll(".lane-node").forEach(n => {
        const nid = n.getAttribute("data-id");
        n.classList.toggle("hl", nid === id);
        n.classList.toggle("dim", !reach.has(nid) && nid !== id);
      });
    }
  };

  /* ================================================================
     VIEW 2: PBS EXPLORER  (tree + detail drawer)
     ================================================================ */
  VIEWS.pbs = function (root) {
    const v = h("div", { class: "view" });
    v.appendChild(head("PBS Explorer",
      "Product Breakdown Structure — 8 subsystems and child nodes, colour-coded per the Diagram Reference Guide. Click a node for its detail drawer."));
    v.appendChild(h("div", { class: "legend" }, [
      lg(A.TOKENS.stage1, "1 MBU"), lg(A.TOKENS.stage2, "2 Filament"), lg(A.TOKENS.stage3, "3 Gantry"),
      lg(A.TOKENS.stage4, "4 Post-Proc"), lg(A.TOKENS.crosscut, "5–8 Cross-cut"),
      h("span", null, [h("span", { class: "badge crit" }, "⚠ FMEA-critical")]),
    ]));

    const roots = A.subsystems.filter(s => !s.parentId);
    const grid = h("div", { class: "grid", style: "grid-template-columns:repeat(auto-fill,minmax(260px,1fr))" });
    roots.forEach(s => {
      const kids = A.subsystems.filter(k => k.parentId === s.pbsId);
      const bomCount = A.components.filter(c => A.subById[c.pbsId] && (c.pbsId === s.pbsId || c.pbsId.indexOf(s.pbsId + ".") === 0)).length;
      const card = h("div", { class: "card", style: `border-left:4px solid ${s.color}` }, [
        h("div", { style: "display:flex;align-items:center;gap:8px;cursor:pointer", onclick: () => pbsDetail(s.pbsId) }, [
          h("span", { class: "mono", style: "font-weight:700;color:" + s.color }, s.pbsId),
          h("span", { style: "flex:1;font-weight:600" }, s.name),
          s.critical ? h("span", { class: "badge crit" }, "⚠") : null,
        ]),
        h("div", { class: "small muted", style: "margin:6px 0" }, s.desc),
        h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px" }, [
          h("span", { class: "badge trl" }, "TRL " + s.trlCurrent),
          h("span", { class: "badge" }, "🧾 " + bomCount + " BOM"),
          s.ffbdStage ? h("span", { class: "badge" }, "Stage " + s.ffbdStage) : null,
        ]),
        h("div", { style: "display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px" },
          (s.req || []).slice(0, 8).map(r => reqChip(r, openThread))),
        kids.length ? h("div", { class: "small muted", style: "border-top:1px solid var(--border);padding-top:7px" },
          "Children: " + kids.map(k => k.pbsId).join(", ")) : null,
      ]);
      grid.appendChild(card);
    });
    v.appendChild(grid);
    root.appendChild(v);
  };
  function lg(c, t) { return h("span", null, [h("span", { class: "dot", style: "background:" + c }), t]); }

  function pbsDetail(pbsId) {
    const s = A.subById[pbsId];
    const kids = A.subsystems.filter(k => k.parentId === pbsId);
    const comps = A.components.filter(c => c.pbsId === pbsId || c.pbsId.indexOf(pbsId + ".") === 0 || kids.some(k => k.pbsId === c.pbsId));
    const fns = A.functions.filter(f => f.pbsId === pbsId || kids.some(k => k.pbsId === f.pbsId));
    const cls = A.controlLoops.filter(c => c.functions.some(fi => fns.some(f => f.ffbdId === fi)));
    const rks = A.risks.filter(r => r.pbs === pbsId || r.pbs.indexOf(pbsId + ".") === 0 || kids.some(k => k.pbs === r.pbs));
    const sect = (t, n) => h("div", { class: "sect" }, [h("h4", null, t), n]);
    openDrawer(pbsId + " · " + s.name, "TRL " + s.trlCurrent + (s.ffbdStage ? " · FFBD Stage " + s.ffbdStage : ""), [
      sect("Description", h("div", { class: "small" }, s.desc)),
      sect("Allocated requirements", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, (s.req || []).map(r => reqChip(r, openThread)))),
      sect("BOM components (Rev 2)", comps.length ? h("div", null, comps.map(c =>
        h("div", { class: "kv" }, [h("span", { class: "mono small", style: "min-width:120px;color:var(--accent)" }, c.partNumber),
          h("span", { class: "small" }, c.name + " ×" + c.quantity + (c.critical ? " ⚠" : ""))]))) : h("div", { class: "small muted" }, "⚠ BOM gap — no parts allocated.")),
      sect("FFBD functions", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, fns.length ? fns.map(f => h("span", { class: "badge" }, f.ffbdId + " " + f.name)) : [h("span", { class: "small muted" }, "—")])),
      sect("Control loops active", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, cls.length ? cls.map(c => h("span", { class: "badge", style: "color:var(--accent)" }, c.id)) : [h("span", { class: "small muted" }, "—")])),
      sect("FMEA / risk entries", rks.length ? h("div", null, rks.map(r => h("div", { class: "small", style: "margin:4px 0" }, "⚠ " + r.id + " " + r.title))) : h("div", { class: "small muted" }, "None")),
      sect("Digital thread", h("button", { class: "btn primary sm", onclick: () => openThread(pbsId) }, "🔗 Trace impact of " + pbsId)),
    ]);
  }

  /* ================================================================
     VIEW 3: FFBD FLOW VIEWER (SVG, 4 stages)
     ================================================================ */
  let drmOverlay = null;
  VIEWS.ffbd = function (root) {
    const v = h("div", { class: "view" });
    const drmBtns = A.drmScenarios.map(d => h("button", { class: "btn sm" + (drmOverlay === d.id ? " active" : ""),
      onclick: () => { drmOverlay = drmOverlay === d.id ? null : d.id; go("ffbd"); } }, d.id));
    v.appendChild(head("FFBD Flow Viewer",
      "Functional Flow Block Diagram — 4-stage operational pipeline with material-state transitions, sensors and decision gates. Toggle a DRM overlay to animate the off-nominal path.",
      [h("span", { class: "small muted" }, "DRM overlay:"), ...drmBtns,
       h("span", { class: "grow" }), h("span", { class: "badge", style: "color:var(--stage4)" }, "⏱ Stage-4 KPI: " + A.config.postProcessWindowMin + " min post-process window")]));

    const stageColors = [A.TOKENS.stage1, A.TOKENS.stage2, A.TOKENS.stage3, A.TOKENS.stage4];
    const stageNames = ["Material Beneficiation", "Filament Preparation", "Printing Operations", "Post-Processing & QC"];
    const overlaySet = drmOverlay ? new Set((A.drmScenarios.find(d => d.id === drmOverlay) || {}).path) : null;

    const colW = 250, rowH = 64, padX = 16, padTop = 44, gap = 18;
    const stages = [1, 2, 3, 4].map(st => A.functions.filter(f => f.stage === st));
    const maxRows = Math.max(...stages.map(s => s.length));
    const W = padX * 2 + colW * 4 + gap * 3;
    const Hh = padTop + maxRows * rowH + 40;
    const svg = svgEl("svg", { width: W, height: Hh, viewBox: `0 0 ${W} ${Hh}` });
    svg.appendChild(arrowDefs());

    stages.forEach((fns, si) => {
      const x = padX + si * (colW + gap);
      // stage header
      svg.appendChild(svgEl("rect", { x, y: 8, width: colW, height: 28, rx: 7, fill: stageColors[si], opacity: .9 }));
      svg.appendChild(svgText(x + 10, 26, `Stage ${si + 1}: ${stageNames[si]}`, { fill: "#0A1628", "font-weight": 700, "font-size": 12 }));
      fns.forEach((f, ri) => {
        const y = padTop + ri * rowH;
        const onPath = overlaySet && overlaySet.has(f.ffbdId);
        const g = svgEl("g", { class: "node-rect", style: "cursor:pointer" });
        g.addEventListener("click", () => fnDetail(f.ffbdId));
        g.appendChild(svgEl("rect", { x, y, width: colW, height: rowH - gap, rx: 9, fill: "#0d1117",
          stroke: onPath ? A.TOKENS.alertAmber : stageColors[si], "stroke-width": onPath ? 2.5 : 1.4 }));
        g.appendChild(svgText(x + 12, y + 20, f.ffbdId + "  " + f.name, { "font-weight": 600, "font-size": 12.5 }));
        g.appendChild(svgText(x + 12, y + 37, (f.sensors || []).slice(0, 2).join(", "), { fill: "#8B949E", "font-size": 10, class: "glab" }));
        svg.appendChild(g);
        // vertical feed arrow within stage
        if (ri < fns.length - 1) svg.appendChild(svgEl("line", { x1: x + colW / 2, y1: y + rowH - gap, x2: x + colW / 2, y2: y + rowH, class: "edge" }));
      });
      // material flow label to next stage
      if (si < 3) {
        const mf = A.materialFlow.find(m => m.from === si + 1);
        const mx = x + colW, my = padTop + 14;
        svg.appendChild(svgEl("line", { x1: mx, y1: my, x2: mx + gap, y2: my, class: "edge flow" + (overlaySet ? "" : "") }));
        svg.appendChild(svgEl("rect", { x: mx - 4, y: my + 6, width: gap + 8, height: 16, rx: 4, fill: A.TOKENS.accent, opacity: .15 }));
        svg.appendChild(svgText(mx - 2, my + 18, "▸ " + (mf ? mf.label : ""), { "font-size": 8.5, fill: A.TOKENS.accent, class: "glab" }));
      }
    });
    v.appendChild(h("div", { class: "diagram", style: "padding:6px" }, svg));

    // material state ribbon
    v.appendChild(h("div", { class: "card", style: "margin-top:14px" }, [
      h("h3", null, "🔀 Material State Transitions (Flow)"),
      h("div", { class: "small mono", style: "color:var(--text-dim)" },
        "[Raw Material 20kg]  →  [Slurry]  →  [Wire Filament]  →  [Cooled Complete Print]  →  [Finished Part]"),
    ]));
    if (drmOverlay) {
      const d = A.drmScenarios.find(x => x.id === drmOverlay);
      v.appendChild(h("div", { class: "card", style: "margin-top:12px;border-color:var(--alert-amber)" }, [
        h("h3", null, "⚠️ " + d.id + " — " + d.name),
        h("div", { class: "small mono muted" }, "Off-nominal path: " + d.path.join("  →  ")),
      ]));
    }
    root.appendChild(v);
  };

  function fnDetail(id) {
    const f = A.fnById[id];
    const cls = A.controlLoops.filter(c => c.functions.includes(id));
    const sigs = A.dataSignals.filter(s => s.source === id);
    const sect = (t, n) => h("div", { class: "sect" }, [h("h4", null, t), n]);
    openDrawer(id + " · " + f.name, "FFBD Stage " + f.stage, [
      sect("Inputs", h("div", { class: "small" }, (f.inputs || []).join(", "))),
      sect("Outputs", h("div", { class: "small" }, (f.outputs || []).join(", "))),
      sect("Sensors", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, (f.sensors || []).map(s => h("span", { class: "badge" }, s)))),
      sect("Devices", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, (f.devices || []).map(s => h("span", { class: "badge" }, s)))),
      sect("Governing control loops", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, cls.map(c => h("span", { class: "badge", style: "color:var(--accent)" }, c.id + " " + c.name)))),
      sect("Monitored signals", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, sigs.map(s => h("span", { class: "badge mono" }, "[" + s.tag + "]")))),
      sect("Digital thread", h("button", { class: "btn primary sm", onclick: () => openThread(id) }, "🔗 Trace impact")),
    ]);
  }

  /* ================================================================
     VIEW 4: DATA TIERS  (tabbed 3-tier tables, signal traces)
     ================================================================ */
  let dtStage = 1;
  VIEWS.datatiers = function (root) {
    const v = h("div", { class: "view" });
    v.appendChild(head("Data Tiers Viewer",
      "Three-tier data model per stage: Tier 1 raw sensor signals → Tier 2 processed/fused → Tier 3 decision/actuation. Signal tags [A]…[K] carry through T1→T2→T3."));
    const tabs = h("div", { class: "tier-tabs" }, [1, 2, 3, 4].map(s =>
      h("button", { class: "btn" + (dtStage === s ? " active" : ""), onclick: () => { dtStage = s; go("datatiers"); } }, "Stage " + s)));
    v.appendChild(tabs);

    const sigs = A.dataSignals.filter(s => s.stage === dtStage);
    const palette = ["#1A6EFF", "#22C55E", "#F97316", "#EAB308", "#A855F7", "#06B6D4"];
    const rows = sigs.map((s, i) => {
      const color = palette[i % palette.length];
      const trace = (col) => `<div class="trace" style="background:${color};opacity:${col === 3 && s.trigger ? 1 : .55}"></div>`;
      const haltCls = /halt|stop|reject|jam|over-temp|wait|correct/i.test(s.tier3) ? (/over-temp|stop|jam/i.test(s.tier3) ? "halt red" : "halt") : "";
      return h("tr", null, [
        h("td", { html: `<span class="badge mono" style="color:${color};border-color:${color}">[${s.tag}]</span> ${esc(s.tier1)}${trace(1)}` }),
        h("td", { html: `${esc(s.tier2)}${trace(2)}` }),
        h("td", { html: `<span class="${haltCls}">${esc(s.tier3)}</span>${trace(3)}<div class="small muted mono" style="margin-top:3px">via ${s.loop}</div>` }),
      ]);
    });
    v.appendChild(h("div", { class: "tbl-wrap" }, h("table", { class: "tbl tier-grid" }, [
      h("thead", null, h("tr", null, [th("Tier 1 — Raw"), th("Tier 2 — Processed"), th("Tier 3 — Decision")])),
      h("tbody", null, rows),
    ])));
    v.appendChild(h("div", { class: "small muted", style: "margin-top:10px" }, "Amber/red Tier-3 cells indicate Halt / Alert / fault decisions. Colored trace bars show signal derivation T1→T2→T3."));
    root.appendChild(v);
  };

  /* ================================================================
     VIEW 5: REQUIREMENTS MATRIX
     ================================================================ */
  let reqFilter = { cat: "", status: "", deferred: "", q: "" };
  let reqSort = { key: "id", dir: 1 };
  VIEWS.requirements = function (root) {
    const v = h("div", { class: "view" });
    v.appendChild(head("Requirements Matrix",
      "Authoritative requirement source (Requirements Matrix Rev 0.1). Filter, sort, and click a row to open its Digital Thread."));
    const catSel = sel(["", "FR", "OR", "ER", "IR", "C", "SC"], reqFilter.cat, (val) => { reqFilter.cat = val; go("requirements"); }, "All categories");
    const stSel = sel(["", "Verified", "In Progress", "Open", "Deferred"], reqFilter.status, (val) => { reqFilter.status = val; go("requirements"); }, "All status");
    const defSel = sel(["", "Active", "Deferred"], reqFilter.deferred, (val) => { reqFilter.deferred = val; go("requirements"); }, "Active + Deferred");
    const search = h("input", { class: "f", placeholder: "Search text…", value: reqFilter.q, oninput: (e) => { reqFilter.q = e.target.value; rerenderReqBody(); } });
    v.appendChild(h("div", { class: "toolbar" }, [catSel, stSel, defSel, search, h("span", { class: "grow" }),
      h("button", { class: "btn sm", onclick: () => downloadCSV("requirements") }, "⬇ CSV")]));

    const wrap = h("div", { id: "reqbody" });
    v.appendChild(wrap);
    root.appendChild(v);
    rerenderReqBody();
  };
  function filteredReqs() {
    let rows = A.requirements.filter(r =>
      (!reqFilter.cat || r.category === reqFilter.cat) &&
      (!reqFilter.status || r.status === reqFilter.status) &&
      (!reqFilter.deferred || (reqFilter.deferred === "Deferred") === !!r.deferred) &&
      (!reqFilter.q || (r.id + r.title + r.text).toLowerCase().includes(reqFilter.q.toLowerCase())));
    rows = rows.slice().sort((a, b) => {
      const x = a[reqSort.key], y = b[reqSort.key];
      return (x > y ? 1 : x < y ? -1 : 0) * reqSort.dir;
    });
    return rows;
  }
  function rerenderReqBody() {
    const wrap = el("reqbody"); if (!wrap) return; wrap.innerHTML = "";
    const rows = filteredReqs();
    const cols = [["id", "ID"], ["title", "Title"], ["category", "Cat"], ["pbs", "PBS"], ["verificationMethod", "Verify"], ["status", "Status"]];
    const thead = h("tr", null, cols.map(([k, l]) => h("th", { onclick: () => { reqSort.dir = reqSort.key === k ? -reqSort.dir : 1; reqSort.key = k; rerenderReqBody(); } }, l + (reqSort.key === k ? (reqSort.dir > 0 ? " ▲" : " ▼") : ""))));
    const tbody = h("tbody", null, rows.map(r => h("tr", { style: "cursor:pointer", onclick: () => reqDetail(r.id) }, [
      h("td", { html: `<span class="mono" style="color:${A.CATEGORY_COLOR[r.category]};font-weight:700">${r.id}</span>` }),
      h("td", null, [h("div", { style: "font-weight:600" }, r.title), h("div", { class: "small muted", style: "max-width:480px" }, r.text.slice(0, 90) + "…")]),
      h("td", { html: `<span class="chip req${r.deferred ? " deferred" : ""}" style="${r.deferred ? "" : "background:" + A.CATEGORY_COLOR[r.category]}">${r.category}</span>` }),
      h("td", { class: "small mono muted" }, (r.pbs || []).join(", ")),
      h("td", { class: "small" }, r.verificationMethod),
      h("td", { html: `<span class="st ${U.statusClass(r.status)}">${U.statusIcon(r.status)} ${r.status}</span>` }),
    ])));
    wrap.appendChild(h("div", { class: "tbl-wrap" }, h("table", { class: "tbl" }, [h("thead", null, thead), tbody])));
    wrap.appendChild(h("div", { class: "small muted", style: "margin-top:8px" }, rows.length + " of " + A.requirements.length + " requirements"));
  }
  function reqDetail(id) {
    const r = A.reqById[id];
    const subs = A.subsystems.filter(s => (r.pbs || []).includes(s.pbsId));
    const fns = A.functions.filter(f => subs.some(s => s.pbsId === f.pbsId || f.pbsId.indexOf(s.pbsId + ".") === 0));
    const comps = A.components.filter(c => (r.pbs || []).some(p => c.pbsId === p || c.pbsId.indexOf(p + ".") === 0));
    const phase = A.lifecyclePhases.find(p => (p.activeRequirements || []).includes(id));
    const rks = A.risks.filter(rk => (rk.req || []).includes(id));
    const sect = (t, n) => h("div", { class: "sect" }, [h("h4", null, t), n]);
    openDrawer(r.id + " · " + r.title, r.category + " · " + r.verificationMethod + (r.deferred ? " · DEFERRED (spaceflight)" : ""), [
      r.deferred ? h("div", { class: "st deferred", style: "display:inline-block;margin-bottom:10px" }, "⛔ Deferred — not verification-active for current MVP PBS stage") : null,
      sect("Requirement text", h("div", { class: "small" }, r.text)),
      sect("Allocated to PBS", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, subs.map(s => h("span", { class: "badge", style: "cursor:pointer", onclick: () => pbsDetail(s.pbsId) }, s.pbsId + " " + s.name.split("(")[0])))),
      sect("FFBD functions covered", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, fns.length ? fns.map(f => h("span", { class: "badge" }, f.ffbdId)) : [h("span", { class: "small muted" }, "—")])),
      sect("Supporting BOM parts", comps.length ? h("div", null, comps.map(c => h("div", { class: "small mono", style: "color:var(--text-dim)" }, c.partNumber + " · " + c.name))) : h("div", { class: "small muted" }, "⚠ BOM gap")),
      sect("Baselined in PLC phase", h("div", { class: "small" }, phase ? phase.phase + " (" + phase.gateReview + ")" : "—")),
      rks.length ? sect("Threatened by risks", h("div", null, rks.map(rk => h("div", { class: "small" }, "⚠ " + rk.id + " " + rk.title)))) : null,
      sect("Digital thread", h("button", { class: "btn primary sm", onclick: () => openThread(id) }, "🔗 Trace full impact")),
    ]);
  }

  /* ================================================================
     VIEW 6: BOM MANAGER
     ================================================================ */
  VIEWS.bom = function (root) {
    const v = h("div", { class: "view" });
    v.appendChild(head("BOM Manager",
      "Authoritative hardware source — Space Copy BOM Rev 2 (Apr 2026). Cost rollup by subsystem, Rev 1→2 delta, and FMEA-critical flags."));
    const total = A.components.reduce((s, c) => s + c.unitCost * c.quantity, 0);
    const totalR1 = A.components.reduce((s, c) => s + (c.rev1Cost || c.unitCost) * c.quantity, 0);
    v.appendChild(h("div", { class: "toolbar" }, [
      h("span", { class: "badge", style: "font-size:12px" }, "Total Rev 2: $" + total.toLocaleString()),
      h("span", { class: "badge", style: "font-size:12px;color:" + (total >= totalR1 ? "var(--alert-amber)" : "var(--green)") }, "Δ vs Rev 1: " + (total - totalR1 >= 0 ? "+" : "") + "$" + (total - totalR1).toLocaleString()),
      h("span", { class: "grow" }), h("button", { class: "btn sm", onclick: () => downloadCSV("bom") }, "⬇ CSV"),
    ]));

    // rollup by subsystem
    const roots = A.subsystems.filter(s => !s.parentId);
    const rollup = h("div", { class: "card", style: "margin-bottom:14px" }, [h("h3", null, "💰 Subsystem Cost Rollup"),
      h("div", { class: "grid", style: "grid-template-columns:repeat(auto-fill,minmax(200px,1fr))" }, roots.map(s => {
        const cs = A.components.filter(c => c.pbsId === s.pbsId || c.pbsId.indexOf(s.pbsId + ".") === 0);
        const sub = cs.reduce((a, c) => a + c.unitCost * c.quantity, 0);
        return h("div", { style: `border-left:3px solid ${s.color};padding:6px 10px` }, [
          h("div", { class: "small muted" }, s.pbsId + " " + s.name.split("(")[0]),
          h("div", { class: "mono", style: "font-weight:700" }, "$" + sub.toLocaleString()),
          h("div", { class: "small muted" }, cs.length + " parts"),
        ]);
      }))]);
    v.appendChild(rollup);

    const cols = [["partNumber", "Part #"], ["name", "Name"], ["pbsId", "PBS"], ["quantity", "Qty"], ["unitCost", "Unit $"], ["total", "Total $"], ["supplier", "Supplier"], ["notes", "Notes"]];
    const thead = h("tr", null, cols.map(([k, l]) => h("th", null, l)));
    const tbody = h("tbody", null, A.components.map(c => h("tr", null, [
      h("td", { html: `<span class="mono" style="color:var(--accent)">${c.partNumber}</span>${c.critical ? ' <span class="badge crit">⚠</span>' : ""}` }),
      h("td", null, c.name),
      h("td", { class: "mono small" }, c.pbsId),
      h("td", { class: "mono" }, String(c.quantity)),
      h("td", { class: "mono" }, "$" + c.unitCost.toLocaleString()),
      h("td", { class: "mono", style: "font-weight:600" }, "$" + (c.unitCost * c.quantity).toLocaleString()),
      h("td", { class: "small" }, c.supplier),
      h("td", { class: "small muted" }, c.notes || "—"),
    ])));
    v.appendChild(h("div", { class: "tbl-wrap" }, h("table", { class: "tbl" }, [h("thead", null, thead), tbody])));
    root.appendChild(v);
  };

  /* ================================================================
     VIEW 7: SOFTWARE ARCHITECTURE
     ================================================================ */
  VIEWS.swarch = function (root) {
    const v = h("div", { class: "view" });
    v.appendChild(head("Software Architecture Viewer",
      "Layered control architecture — five control loops (CL-1…CL-5) between the sensor data bus and actuator commands, plus background processes."));
    const layers = [
      ["Hardware Layer", ["Sensor Suite (TC, Cameras, SWIR)", "Actuators (Gantry, Arm, Heaters)"]],
      ["Sensor Data Bus", ["IR-3 Data Interface · Tier-1 raw signals"]],
    ];
    const arch = h("div", { class: "card" });
    layers.forEach(([rl, blocks]) => arch.appendChild(h("div", { class: "arch-row" },
      [h("div", { class: "rl" }, rl), h("div", { class: "rc" }, blocks.map(b => h("div", { class: "arch-block" }, b)))])));
    // control loop row
    arch.appendChild(h("div", { class: "arch-row" }, [h("div", { class: "rl" }, "Software Decision Logic"),
      h("div", { class: "rc" }, A.controlLoops.map(cl => h("div", { class: "cl-card", onclick: () => clDetail(cl.id) }, [
        h("div", { class: "id" }, cl.id),
        h("div", { style: "font-weight:600;font-size:12px" }, cl.name),
        h("div", { class: "small muted" }, cl.logic + " · " + cl.scope),
        h("div", { style: "display:flex;gap:4px;flex-wrap:wrap;margin-top:5px" }, (cl.req || []).map(r => reqChip(r, openThread))),
      ])))]));
    [["Hardware Abstraction Layer", ["Device drivers · command marshalling"]],
     ["Actuator Commands", ["Heater duty · Gantry moves · Arm joints · Mode transitions"]]]
      .forEach(([rl, blocks]) => arch.appendChild(h("div", { class: "arch-row" },
        [h("div", { class: "rl" }, rl), h("div", { class: "rc" }, blocks.map(b => h("div", { class: "arch-block" }, b)))])));
    v.appendChild(arch);

    v.appendChild(h("div", { class: "card", style: "margin-top:14px" }, [h("h3", null, "Background Processes"),
      h("div", { style: "display:flex;gap:10px;flex-wrap:wrap" }, A.backgroundProcesses.map(b =>
        h("div", { class: "badge", style: "padding:7px 11px;font-size:12px" }, [document.createTextNode(b.name + "  "), ...(b.req || []).map(r => reqChip(r, openThread))])))]));
    root.appendChild(v);
  };
  function clDetail(id) {
    const cl = A.clById[id];
    const fns = A.functions.filter(f => cl.functions.includes(f.ffbdId));
    const sigs = A.dataSignals.filter(s => s.loop === id);
    const sect = (t, n) => h("div", { class: "sect" }, [h("h4", null, t), n]);
    openDrawer(cl.id + " · " + cl.name, cl.logic + " · " + cl.scope, [
      sect("Input signals", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, (cl.inputSignals || []).map(s => h("span", { class: "badge" }, s)))),
      sect("Output commands", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, (cl.outputCommands || []).map(s => h("span", { class: "badge" }, s)))),
      sect("Governs functions", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, fns.map(f => h("span", { class: "badge" }, f.ffbdId + " " + f.name)))),
      sect("Reads data signals", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, sigs.map(s => h("span", { class: "badge mono" }, "[" + s.tag + "] " + s.tier1)))),
      sect("Linked requirements", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, (cl.req || []).map(r => reqChip(r, openThread)))),
      sect("Digital thread", h("button", { class: "btn primary sm", onclick: () => openThread(id) }, "🔗 Trace impact")),
    ]);
  }

  /* ================================================================
     VIEW 8: PRODUCT LIFE CYCLE (timeline)
     ================================================================ */
  VIEWS.plc = function (root) {
    const v = h("div", { class: "view" });
    v.appendChild(head("Product Life Cycle",
      "Six phases (Pre-Phase A → Phase E) with NASA/SP-2016-6105 Rev 2 gate reviews, TRL progression, deliverables and technology gaps. Click a gate to open its requirement baseline."));
    const tl = h("div", { class: "timeline" }, A.lifecyclePhases.map(p =>
      h("div", { class: "phase" + (p.current ? " current" : "") }, [
        p.current ? h("div", { class: "here" }, "▲") : null,
        h("div", { class: "gate", style: "cursor:pointer", onclick: () => gateDetail(p.phase) }, p.gateReview + " gate"),
        h("div", { style: "font-weight:700;margin:3px 0" }, p.phase),
        h("div", { class: "small muted" }, p.name),
        h("div", { class: "badge trl", style: "margin:7px 0" }, "TRL " + p.trlRange),
        h("div", { class: "small muted", style: "margin-top:6px" }, "Active reqs:"),
        h("div", { style: "display:flex;gap:4px;flex-wrap:wrap;margin:3px 0" }, (p.activeRequirements || []).slice(0, 6).map(r => reqChip(r, openThread))),
        h("div", { class: "small muted", style: "margin-top:6px" }, "Tech gaps:"),
        h("ul", { class: "small muted", style: "margin:3px 0;padding-left:16px" }, (p.techGaps || []).map(g => h("li", null, g))),
      ])));
    v.appendChild(tl);
    v.appendChild(h("div", { class: "small muted", style: "margin-top:10px" }, "▲ marks the current programme position (" + A.config.phase + ")."));
    root.appendChild(v);
  };
  function gateDetail(phaseName) {
    const p = A.lifecyclePhases.find(x => x.phase === phaseName);
    const reqs = (p.activeRequirements || []).map(id => A.reqById[id]).filter(Boolean);
    const sect = (t, n) => h("div", { class: "sect" }, [h("h4", null, t), n]);
    openDrawer(p.gateReview + " · " + p.phase, "TRL " + p.trlRange + " · " + p.name, [
      sect("Deliverables", h("ul", { class: "small", style: "padding-left:16px" }, (p.deliverables || []).map(d => h("li", null, d)))),
      sect("Requirement baseline & closure", h("div", null, reqs.map(r => h("div", { class: "kv" }, [
        h("span", { html: `<span class="chip req${r.deferred ? " deferred" : ""}" style="${r.deferred ? "" : "background:" + A.CATEGORY_COLOR[r.category]}">${r.id}</span>` }),
        h("span", { class: "small", style: "flex:1" }, r.title),
        h("span", { html: `<span class="st ${U.statusClass(r.status)}">${r.status}</span>` }),
      ])))),
      sect("Technology gaps", h("ul", { class: "small muted", style: "padding-left:16px" }, (p.techGaps || []).map(g => h("li", null, g)))),
      sect("Standard", h("div", { class: "small muted" }, A.config.standard)),
    ]);
  }

  /* ================================================================
     VIEW 9: RISK REGISTER (5×5 matrix + cards)
     ================================================================ */
  VIEWS.risk = function (root) {
    const v = h("div", { class: "view" });
    v.appendChild(head("Risk Register",
      "5×5 likelihood × impact matrix from ConOps Section 8.0. Each risk links to affected requirements, mitigation, responsible subsystem and DRM scenario."));
    // matrix
    const grid = h("div", { class: "riskgrid" });
    grid.appendChild(h("div", { class: "axis" }, ""));
    for (let i = 1; i <= 5; i++) grid.appendChild(h("div", { class: "axis" }, "I" + i));
    for (let l = 5; l >= 1; l--) {
      grid.appendChild(h("div", { class: "axis" }, "L" + l));
      for (let im = 1; im <= 5; im++) {
        const score = l * im;
        const bg = score >= 15 ? "rgba(239,68,68,.25)" : score >= 8 ? "rgba(245,158,11,.2)" : "rgba(34,197,94,.15)";
        const cell = h("div", { class: "cell", style: "background:" + bg });
        A.risks.filter(r => r.likelihood === l && r.impact === im).forEach(r => {
          const c = score >= 15 ? "#EF4444" : score >= 8 ? "#F59E0B" : "#22C55E";
          cell.appendChild(h("div", { class: "risk-dot", style: "background:" + c, title: r.title, onclick: () => riskDetail(r.id) }, r.id.split("-")[1]));
        });
        grid.appendChild(cell);
      }
    }
    v.appendChild(h("div", { style: "display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start" }, [
      h("div", null, [h("div", { class: "small muted", style: "margin-bottom:6px" }, "Likelihood (rows) × Impact (cols)"), grid]),
      h("div", { style: "flex:1;min-width:280px" }, [h("div", { class: "small muted", style: "margin-bottom:6px" }, "Risk cards (click for detail)"),
        h("div", { class: "grid", style: "grid-template-columns:repeat(auto-fill,minmax(220px,1fr))" }, A.risks.map(r => {
          const score = r.likelihood * r.impact;
          const c = score >= 15 ? "#EF4444" : score >= 8 ? "#F59E0B" : "#22C55E";
          return h("div", { class: "card", style: `border-left:4px solid ${c};cursor:pointer;padding:11px`, onclick: () => riskDetail(r.id) }, [
            h("div", { style: "display:flex;align-items:center;gap:7px" }, [h("span", { class: "mono", style: "font-weight:700;color:" + c }, r.id), h("span", { class: "small muted" }, "L" + r.likelihood + "×I" + r.impact + "=" + score)]),
            h("div", { style: "font-weight:600;margin:4px 0;font-size:12.5px" }, r.title),
            h("div", { style: "display:flex;gap:4px;flex-wrap:wrap" }, [h("span", { class: "badge" }, r.drm), h("span", { class: "badge" }, "PBS " + r.pbs)]),
          ]);
        }))]),
    ]));
    root.appendChild(v);
  };
  function riskDetail(id) {
    const r = A.riskById[id];
    const sect = (t, n) => h("div", { class: "sect" }, [h("h4", null, t), n]);
    openDrawer(r.id + " · " + r.title, "Likelihood " + r.likelihood + " × Impact " + r.impact + " = " + (r.likelihood * r.impact), [
      h("div", { html: `<span class="st ${U.statusClass(r.status)}">${r.status}</span>`, style: "margin-bottom:10px" }),
      sect("Mitigation", h("div", { class: "small" }, r.mitigation)),
      sect("Affected requirements", h("div", { style: "display:flex;gap:5px;flex-wrap:wrap" }, (r.req || []).map(rq => reqChip(rq, openThread)))),
      sect("Responsible subsystem", h("div", { class: "badge", style: "cursor:pointer", onclick: () => pbsDetail(r.pbs) }, r.pbs + " " + (A.subById[r.pbs] ? A.subById[r.pbs].name : ""))),
      sect("DRM scenario", h("div", { class: "badge" }, r.drm)),
      r.component ? sect("Linked BOM part", h("div", { class: "mono small" }, r.component + " · " + (A.compById[r.component] || {}).name)) : null,
      sect("Digital thread", h("button", { class: "btn primary sm", onclick: () => openThread(id) }, "🔗 Trace impact")),
    ]);
  }

  /* ================================================================
     VIEW 10: DIGITAL THREAD — IMPACT TRACER
     ================================================================ */
  let threadTarget = "FR-2";
  VIEWS.thread = function (root) {
    const v = h("div", { class: "view" });
    v.appendChild(head("Digital Thread — Impact Tracer",
      "Select any model element to traverse the propagation chain (bounded BFS, depth ≤ 5) across requirements, functions, control loops, signals, risks, BOM and PLC. Severity classified per Module 3.1."));

    // node picker
    const groups = [
      ["Requirements", A.requirements.map(r => ["R", r.id, r.id + " " + r.title])],
      ["Functions", A.functions.map(f => ["F", f.ffbdId, f.ffbdId + " " + f.name])],
      ["Control Loops", A.controlLoops.map(c => ["L", c.id, c.id + " " + c.name])],
      ["Subsystems", A.subsystems.filter(s => !s.parentId).map(s => ["P", s.pbsId, s.pbsId + " " + s.name])],
      ["Components", A.components.map(c => ["B", c.partNumber, c.partNumber + " " + c.name])],
      ["Risks", A.risks.map(r => ["X", r.id, r.id + " " + r.title])],
    ];
    const picker = h("select", { class: "f", style: "min-width:320px", onchange: (e) => { threadTarget = e.target.value; renderThreadResult(); } });
    groups.forEach(([label, items]) => {
      const og = h("optgroup", { label });
      items.forEach(([, id, txt]) => { const o = h("option", { value: id }, txt); if (id === threadTarget) o.selected = true; og.appendChild(o); });
      picker.appendChild(og);
    });

    const scenBtns = [
      ["Scenario A: Nozzle setpoint", "F"],
      ["Scenario B: ER-4 undeferred", "ER-4"],
      ["Scenario C: DRM-0500 over-temp", "SIG-F"],
    ].map(([lbl, tgt]) => h("button", { class: "btn sm", onclick: () => { threadTarget = tgt; picker.value = tgt; renderThreadResult(); } }, lbl));

    v.appendChild(h("div", { class: "toolbar" }, [h("span", { class: "small muted" }, "Element:"), picker, h("span", { class: "grow" }), ...scenBtns]));
    v.appendChild(h("div", { id: "threadResult" }));
    root.appendChild(v);
    renderThreadResult();
  };
  function renderThreadResult() {
    const box = el("threadResult"); if (!box) return; box.innerHTML = "";
    const rep = T.report(threadTarget, 5);
    box.appendChild(h("div", { class: "grid", style: "grid-template-columns:repeat(3,1fr);max-width:520px;margin-bottom:14px" }, [
      sevCard("Critical", rep.counts.critical, "critical"),
      sevCard("Warning", rep.counts.warning, "warning"),
      sevCard("Info", rep.counts.info, "info"),
    ]));
    // origin + radial-ish list grouped by depth
    box.appendChild(h("div", { class: "card", style: "margin-bottom:14px" }, [
      h("h3", null, "🎯 Origin: " + rep.origin.label),
      h("div", { class: "small muted" }, "Summary — " + rep.summary),
    ]));
    const list = h("div", { class: "card" }, [h("h3", null, "Propagation chain (" + rep.affected.length + " affected)"),
      h("div", null, rep.affected.map(n => h("div", { class: "impact-item" }, [
        U.sevDot(n.severity), h("span", { class: "badge mono" }, n.kind),
        h("span", { style: "flex:1", html: esc(n.label) }),
        h("span", { class: "depth-pill" }, n.via + " · d" + n.depth),
        h("span", { class: "path" }, n.path.join(" → ")),
      ])))]);
    box.appendChild(list);
    if (rep.recommendations.length) box.appendChild(h("div", { class: "card", style: "margin-top:14px" }, [h("h3", null, "✅ Recommended actions"),
      h("div", null, rep.recommendations.slice(0, 24).map(r => h("div", { class: "small", style: "margin:5px 0;color:var(--text-dim)" }, "• " + r.action)))]));
    U.notify("Impact analysis on " + threadTarget + ": " + rep.summary, rep.counts.critical ? "critical" : "warning");
  }
  function sevCard(label, n, sev) {
    return h("div", { class: "card kpi", style: "text-align:center" }, [
      h("div", { class: "n sev-" + sev }, String(n)), h("div", { class: "l" }, label)]);
  }

  /* ---------------- small SVG / form helpers --------------------- */
  function svgEl(tag, attrs) { const e = document.createElementNS("http://www.w3.org/2000/svg", tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function svgText(x, y, txt, attrs) { const t = svgEl("text", Object.assign({ x, y }, attrs || {})); t.textContent = txt; return t; }
  function arrowDefs() { const d = svgEl("defs"); const m = svgEl("marker", { id: "arrow", markerWidth: 8, markerHeight: 8, refX: 7, refY: 3, orient: "auto", markerUnits: "strokeWidth" }); m.appendChild(svgEl("path", { d: "M0,0 L7,3 L0,6 Z", fill: "#3b4756" })); d.appendChild(m); return d; }
  function th(t) { return h("th", { style: "cursor:default" }, t); }
  function sel(opts, val, on, allLabel) {
    const s = h("select", { class: "f", onchange: (e) => on(e.target.value) });
    opts.forEach(o => { const opt = h("option", { value: o }, o === "" ? allLabel : o); if (o === val) opt.selected = true; s.appendChild(opt); });
    return s;
  }
  function downloadCSV(kind) {
    let rows, headers;
    if (kind === "bom") { headers = ["partNumber", "name", "pbsId", "quantity", "unitCost", "supplier", "notes"]; rows = A.components; }
    else { headers = ["id", "title", "category", "status", "verificationMethod", "deferred"]; rows = filteredReqs(); }
    const csv = [headers.join(",")].concat(rows.map(r => headers.map(hd => `"${String(r[hd] == null ? "" : r[hd]).replace(/"/g, '""')}"`).join(","))).join("\n");
    const a = h("a", { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: `AERIS_${kind}.csv` });
    document.body.appendChild(a); a.click(); a.remove();
    U.notify("Exported " + kind + ".csv", "info");
  }

  /* ---------------- boot ----------------------------------------- */
  document.addEventListener("DOMContentLoaded", renderShell);
})(typeof window !== "undefined" ? window : globalThis);
