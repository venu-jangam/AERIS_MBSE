# AERIS FDM System — Web-Based MBSE Dashboard

A bespoke, **Model-Based Systems Engineering (MBSE)** dashboard for the **AERIS FDM
System** — an autonomous, field-deployable additive-manufacturing platform by
Space Copy Inc. Inspired by Cameo Systems Modeler, Capella, and Innoslate, and
aligned to **SysML v2** and **NASA/SP-2016-6105 Rev 2**.

## ▶ Run it (zero install, fully offline)

Just **open `index.html` in any modern browser** — double-click it or:

```
# optional: serve it (any static server works)
python3 -m http.server 8000   # then visit http://localhost:8000
```

There is **no build step, no backend, and no network dependency**. The entire
SysML-aligned model, the digital-thread impact engine, and all ten views are
pure HTML/CSS/JS + SVG, so the dashboard renders immediately on open.

## 🧭 Views (left sidebar)

| # | View | What it shows |
|---|------|---------------|
| — | 🛰 Overview | KPIs, active configuration, post-process KPI, enforced constraints, change/impact feed |
| 1 | 📐 RFLP Navigator | Requirements → Functions → Logical → Physical swim-lanes; click to highlight the full traceability thread |
| 2 | 🗂 PBS Explorer | 8 subsystems + child nodes, colour-coded; detail drawer with reqs, BOM, functions, control loops, risks |
| 3 | 🔄 FFBD Flow Viewer | 4-stage pipeline (SVG), material-state transitions, sensors, **DRM off-nominal overlays**, Stage-4 20-min KPI |
| 4 | 📊 Data Tiers | Per-stage 3-tier tables (Raw → Processed → Decision) with signal-chain `[A]…[K]` traces and Halt/Alert flags |
| 5 | 📋 Requirements Matrix | Filter/sort the authoritative requirement set; click a row for its digital thread; CSV export |
| 6 | 🧾 BOM Manager | BOM Rev 2 table, subsystem cost rollup, Rev 1→2 delta, FMEA-critical flags, CSV export |
| 7 | ⚙️ Software Architecture | Layered diagram, five control loops (CL-1…CL-5) as clickable cards, background processes |
| 8 | 📅 Product Life Cycle | 6-phase timeline with MDR/SDR/PDR/CDR/SAR/ORR gates, TRL progression, deliverables, tech gaps |
| 9 | ⚠️ Risk Register | 5×5 likelihood×impact matrix + risk cards linked to reqs, mitigations, subsystems, DRM scenarios |
| 10 | 🔗 Digital Thread | Impact tracer — pick any element, traverse the propagation chain, classified Critical/Warning/Info, with built-in DRM scenarios |

## 🗄 Data model (SysML v2-aligned)

`assets/js/data.js` is the in-browser model store, mirroring the Neo4j schema
from the master spec (Module 1.2):

- **Nodes:** `Requirement`, `Subsystem`, `Component`, `Function`, `ControlLoop`,
  `DataSignal`, `Risk`, `LifeCyclePhase`
- **Edges:** `ALLOCATED_TO`, `CONTAINS`, `PERFORMS`, `FEEDS_INTO`, `MONITORED_BY`,
  `GOVERNS`, `READS`, `SATISFIES`, `IMPACTS`, `THREATENS`, `SOURCED_IN`, `BASELINED_IN`

`assets/js/thread.js` implements the **Digital Thread** engine — the in-browser
equivalent of the Neo4j variable-length traversal — as a bounded BFS (depth ≤ 5)
with severity classification per Module 3.1:

- 🔴 **Critical** — affects FR/SC, a control loop, or a risk
- 🟡 **Warning** — affects OR/ER, a function, or a PLC gate item
- 🔵 **Info** — affects C/IR, a data signal, subsystem, or BOM-only item

## ⚠️ Note on source documents

The original engineering source files (`AERIS_ConOps_Final.docx`,
`SpaceCopy_Requirements_Matrix_Complete_Rev_0_1.xlsx`,
`Space_Copy_BOM_Rev_2_April_2026.xlsx`, the PBS/FFBD/PLC/Data-Tiers/
Software-Architecture/Dimensions PDFs, etc.) were **not present in the project
folder** when this dashboard was built. The model in `data.js` is therefore
**seeded from the authoritative data in the AERIS Master Development Prompt**
(requirement IDs, FFBD steps, control loops, PLC phases, risks, BOM categories,
design tokens) and is clearly marked as the seed dataset.

To swap in parsed source data later, replace the collections in `data.js`
(`requirements`, `subsystems`, `components`, `functions`, `controlLoops`,
`dataSignals`, `risks`, `lifecyclePhases`) — the entire view layer reads from
those arrays and the typed `edges`, so **no view code needs to change**. Drop the
source files into `/data/` and add a parsing step (SheetJS for `.xlsx`, etc.).

## 🎨 Design system

Tokens in `assets/css/styles.css` match the AERIS documents: deep-space navy
`#0A1628`, Space Copy blue `#1A6EFF`, the four stage colours (blue/orange/yellow/
green), cross-cut grey, alert red/amber, and **deferred purple `#7C3AED`** (dashed
badges for spaceflight items **ER-1 / ER-2 / ER-4**). Typography: Inter (UI) +
JetBrains Mono (IDs/signals), with graceful system-font fallback offline.

## 📁 Structure

```
index.html                 # entry point — open this
assets/css/styles.css      # design tokens + all view styles
assets/js/data.js          # SysML-aligned model store (nodes + typed edges)
assets/js/thread.js        # Digital Thread impact-traversal engine (Module 3)
assets/js/ui.js            # shared DOM / render helpers
assets/js/app.js           # app shell, router, drawer, all 10 views
data/                      # drop parsed source documents here (future)
```

## 🛣 Roadmap (post-MVP)

Per the master spec: Neo4j/Express or FastAPI backend, PostgreSQL audit log,
Redis pub/sub + WebSocket live collaboration, server-side `.xlsx/.docx/.pdf`
parsing on import, a Three.js 3D physical-model viewer from the Dimensions doc,
live telemetry ingestion (FR-6/IR-3), and a SysML v2 textual export.
