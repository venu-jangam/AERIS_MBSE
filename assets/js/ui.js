/* =====================================================================
   AERIS UI — DOM + render helpers (shared by all views)
   ===================================================================== */
(function (global) {
  "use strict";
  const A = global.AERIS;

  const el = (id) => document.getElementById(id);
  function h(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k === "style") e.style.cssText = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null || c === false) return;
      e.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(c) : c);
    });
    return e;
  }
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));

  /* status -> css class */
  const statusClass = (s) => ({
    "Verified": "verified", "In Progress": "progress", "Deferred": "deferred",
    "Open": "open", "Mitigating": "mitigating",
  }[s] || "open");
  const statusIcon = (s) => ({ "Verified": "✅", "In Progress": "🔄", "Deferred": "⛔", "Open": "❓", "Mitigating": "🟠" }[s] || "❓");

  /* requirement chip (clickable -> opens thread) */
  function reqChip(id, onClick) {
    const r = A.reqById[id];
    if (!r) return h("span", { class: "chip req", style: "background:#444" }, id);
    const cls = "chip req" + (r.deferred ? " deferred" : "");
    const e = h("span", { class: cls, title: r.title,
      style: r.deferred ? "" : `background:${A.CATEGORY_COLOR[r.category]}` }, id);
    if (onClick) e.addEventListener("click", () => onClick(id));
    return e;
  }

  /* severity dot */
  const sevDot = (sev) => h("span", { class: "dot bg-" + sev });

  /* simple sortable/filterable table builder */
  function table(columns, rows, opts) {
    opts = opts || {};
    const thead = h("tr", null, columns.map((c, i) =>
      h("th", { onclick: () => opts.onSort && opts.onSort(i) }, c.label)));
    const tbody = h("tbody", null, rows.map(r =>
      h("tr", { onclick: opts.onRow ? () => opts.onRow(r) : null, style: opts.onRow ? "cursor:pointer" : "" },
        columns.map(c => h("td", { html: c.render ? c.render(r) : esc(r[c.key]) })))));
    return h("div", { class: "tbl-wrap" }, h("table", { class: "tbl" }, [h("thead", null, thead), tbody]));
  }

  /* toast / notification feed (module 3.3 stub) */
  const notifications = [];
  function notify(msg, sev) {
    notifications.unshift({ msg, sev: sev || "info", t: new Date() });
    const badge = el("notif-count");
    if (badge) badge.textContent = notifications.length;
    if (global.refreshNotifications) global.refreshNotifications();
  }

  global.UI = { el, h, esc, statusClass, statusIcon, reqChip, sevDot, table, notify, notifications };
})(typeof window !== "undefined" ? window : globalThis);
