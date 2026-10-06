/* Explanatory figures: the module tabs and their small visuals, the gate
 * policy plot, the game-night timeline of Figure 1 and the evidence-expiry
 * animation of Jarvis-Omni. Everything is plain SVG built from data.js or
 * from the numbers printed in the report's figures. */

import { SESSION } from "./data.js";
import { playDemoAt, formatTime } from "./theater.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );

/** Catmull-Rom through the points, written as cubic Bezier segments. */
function smoothPath(points) {
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Restart a CSS-driven animation by toggling a class across a frame. */
function replay(element, className = "is-animated") {
  if (!element) return;
  element.classList.remove(className);
  void element.getBoundingClientRect();
  requestAnimationFrame(() => element.classList.add(className));
}

function onFirstView(element, callback, threshold = 0.35) {
  if (!element) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    callback();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        callback();
      }
    },
    { threshold }
  );
  observer.observe(element);
}

/* ------------------------------------------------------------- gate plot */

// Schematic curves of the report's Figure 3a, in (audio unit, probability).
const GATE_CURVES = {
  listen: [[0.5, 0.97], [1.5, 0.96], [2.5, 0.93], [3.5, 0.9], [4.5, 0.86], [5.3, 0.15], [6.5, 0.05], [7.5, 0.04]],
  direct: [[0.5, 0.02], [1.5, 0.03], [2.5, 0.05], [3.5, 0.07], [4.5, 0.08], [5.3, 0.06], [6.5, 0.05], [7.5, 0.05]],
  delegate: [[0.5, 0.01], [1.5, 0.01], [2.5, 0.02], [3.5, 0.03], [4.5, 0.06], [5.3, 0.79], [6.5, 0.9], [7.5, 0.91]],
};

function drawGatePlot() {
  const svg = document.getElementById("gate-plot");
  if (!svg) return;
  const x = (u) => 50 + u * 56.25;
  const y = (p) => 222 - p * 190;
  const band = (from, to, cls, label) =>
    `<rect class="gp-band ${cls}" x="${x(from)}" y="${y(1)}" width="${x(to) - x(from)}" height="${y(0) - y(1)}" />
     <text class="gp-band-label ${cls}" x="${(x(from) + x(to)) / 2}" y="${y(1) - 9}" text-anchor="middle">${label}</text>`;
  const ticks = Array.from({ length: 8 }, (_, i) => i + 1)
    .map((u) => `<line class="gp-tick" x1="${x(u)}" x2="${x(u)}" y1="${y(0)}" y2="${y(0) + 4}" />`)
    .join("");
  const curve = (name) =>
    `<path class="gp-curve gp-curve--${name}" pathLength="1" d="${smoothPath(GATE_CURVES[name].map(([u, p]) => [x(u), y(p)]))}" />`;
  svg.innerHTML = `
    ${band(0, 1.5, "gp-band--silence", "silence")}
    ${band(1.5, 5.0, "gp-band--speaking", "user speaking")}
    ${band(5.0, 8, "gp-band--done", "request complete")}
    <line class="gp-axis" x1="${x(0)}" x2="${x(8)}" y1="${y(0)}" y2="${y(0)}" />
    <line class="gp-axis" x1="${x(0)}" x2="${x(0)}" y1="${y(0)}" y2="${y(1)}" />
    ${ticks}
    <text class="gp-tick-label" x="${x(0) - 7}" y="${y(1) + 4}" text-anchor="end">1</text>
    <text class="gp-tick-label" x="${x(0) - 7}" y="${y(0.5) + 4}" text-anchor="end">0.5</text>
    <text class="gp-tick-label" x="${x(0) - 7}" y="${y(0) + 4}" text-anchor="end">0</text>
    <text class="gp-tick-label" x="${x(8)}" y="${y(0) + 18}" text-anchor="end">one-second audio units</text>
    <line class="gp-threshold" x1="${x(0)}" x2="${x(8)}" y1="${y(0.8)}" y2="${y(0.8)}" />
    <text class="gp-threshold-label" x="${x(1.6)}" y="${y(0.8) - 6}">acting threshold 0.8</text>
    ${curve("listen")}${curve("direct")}${curve("delegate")}
    <text class="gp-curve-label gp-curve-label--listen" x="${x(0.6)}" y="${y(0.97) + 16}">&#960;(LISTEN)</text>
    <text class="gp-curve-label gp-curve-label--direct" x="${x(1.7)}" y="${y(0.04) - 8}">&#960;(DIRECT)</text>
    <text class="gp-curve-label gp-curve-label--delegate" x="${x(6.0)}" y="${y(0.92) - 8}">&#960;(DELEGATE)</text>
    <g class="gp-fire">
      <circle cx="${x(5.33)}" cy="${y(0.81)}" r="9" class="gp-fire__halo" />
      <circle cx="${x(5.33)}" cy="${y(0.81)}" r="4.2" class="gp-fire__dot" />
      <text x="${x(5.55)}" y="${y(0.6)}" class="gp-fire__label">DELEGATE fires</text>
      <text x="${x(5.55)}" y="${y(0.6) + 15}" class="gp-fire__sub">0.16 s after the request ends</text>
      <text x="${x(5.55)}" y="${y(0.6) + 29}" class="gp-fire__sub">(median on dev)</text>
    </g>
    <text class="gp-quote" x="${(x(0) + x(8)) / 2}" y="${y(0) + 42}" text-anchor="middle">&#8220;Check Shanghai's weather for tonight.&#8221;</text>`;
}

/* ----------------------------------------------------------- module tabs */

function setupModules() {
  const root = document.getElementById("modules");
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panelOf = (tab) => document.getElementById(tab.getAttribute("aria-controls"));

  const animate = (panel) => {
    replay(panel);
    const plot = panel.querySelector(".gate-plot");
    if (plot) replay(plot, "is-drawn");
  };

  const activate = (tab, focus = false) => {
    for (const other of tabs) {
      const on = other === tab;
      other.setAttribute("aria-selected", String(on));
      other.tabIndex = on ? 0 : -1;
      const panel = panelOf(other);
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    }
    if (focus) tab.focus();
    animate(panelOf(tab));
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      let next = null;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      else if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === "Home") next = tabs[0];
      else if (event.key === "End") next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      activate(next, true);
    });
  });

  // Links elsewhere on the page (the failure cards) can open a tab directly.
  document.querySelectorAll("[data-open-module]").forEach((link) =>
    link.addEventListener("click", () => {
      const tab = document.getElementById(`tab-${link.dataset.openModule}`);
      if (tab) activate(tab);
    })
  );

  onFirstView(root, () => animate(panelOf(tabs.find((tab) => tab.getAttribute("aria-selected") === "true"))));
}

/* -------------------------------------------------------- session timeline */

function drawSession() {
  const svg = document.getElementById("session-svg");
  const list = document.getElementById("utterances");
  if (!svg || !list) return;
  const [t0, t1] = SESSION.span;
  const left = 132;
  const right = 1140;
  const x = (t) => left + ((t - t0) / (t1 - t0)) * (right - left);
  const laneY = (lane) => 72 + lane * 36;
  const axisY = 290;

  const related = SESSION.utterances.map((u) =>
    SESSION.bars
      .map((bar, index) => ({ bar, index }))
      .filter(({ bar }) => Math.abs(bar.from - u.at) < 0.05 || (bar.cancelled && Math.abs(bar.to - u.at) < 0.05))
      .map(({ index }) => index)
  );

  const lanes = SESSION.lanes
    .map(
      (name, lane) => `
      <text class="s-lane-label" x="${left - 14}" y="${laneY(lane) + 4}" text-anchor="end">${escapeHtml(name)}</text>
      <line class="s-lane" x1="${left}" x2="${right}" y1="${laneY(lane)}" y2="${laneY(lane)}" />`
    )
    .join("");

  const markers = SESSION.utterances
    .map(
      (u, i) => `
      <g class="s-marker" data-u="${i}" tabindex="-1">
        <line class="s-marker__line" x1="${x(u.at)}" x2="${x(u.at)}" y1="40" y2="${axisY - 10}" />
        <circle class="s-marker__dot" cx="${x(u.at)}" cy="26" r="11" />
        <text class="s-marker__n" x="${x(u.at)}" y="30" text-anchor="middle">${i + 1}</text>
      </g>`
    )
    .join("");

  const bars = SESSION.bars
    .map((bar, index) => {
      const y = laneY(bar.lane);
      const x0 = x(bar.from);
      const x1 = x(bar.to);
      const width = x1 - x0;
      const label = width > bar.label.length * 6.1 + 10 ? bar.label : bar.label.split(" ")[0];
      const badge = bar.cancelled
        ? `<circle class="s-badge s-badge--gone" cx="${x1}" cy="${y}" r="8" /><text class="s-badge__t" x="${x1}" y="${y + 3.6}" text-anchor="middle">&#215;</text>`
        : bar.done
          ? `<circle class="s-badge s-badge--done" cx="${x1}" cy="${y}" r="8" /><text class="s-badge__t" x="${x1}" y="${y + 3.6}" text-anchor="middle">&#10003;</text>`
          : "";
      const ask =
        bar.ask !== undefined
          ? `<circle class="s-badge s-badge--ask" cx="${x(bar.ask)}" cy="${y - 15}" r="7.5" /><text class="s-badge__t" x="${x(bar.ask)}" y="${y - 11.5}" text-anchor="middle">?</text>`
          : "";
      const delay = Math.round(((bar.from - t0) / (t1 - t0)) * 1100);
      return `
        <g class="s-bar${bar.cancelled ? " s-bar--gone" : ""}" data-bar="${index}" style="transition-delay: ${delay}ms">
          <rect x="${x0}" y="${y - 10}" width="${width}" height="20" rx="5" />
          <text class="s-bar__label" x="${x0 + width / 2}" y="${y + 4}" text-anchor="middle">${escapeHtml(label)}</text>
          ${ask}${badge}
        </g>`;
    })
    .join("");

  const notes = SESSION.notes
    .map(
      (note) => `<text class="s-note s-note--${note.kind}" x="${x(note.at)}" y="${laneY(note.lane) + 4}" text-anchor="${note.anchor}">${note.kind === "memory" ? "&#9679; " : ""}${escapeHtml(note.text)}</text>`
    )
    .join("");

  const ticks = SESSION.ticks
    .map(
      (t) => `
      <line class="s-tick" x1="${x(t)}" x2="${x(t)}" y1="${axisY}" y2="${axisY + 5}" />
      <text class="s-tick-label" x="${x(t)}" y="${axisY + 19}" text-anchor="middle">${t} s</text>`
    )
    .join("");

  svg.innerHTML = `
    <text class="s-user" x="${left - 14}" y="30" text-anchor="end">User</text>
    ${lanes}
    ${markers}
    ${bars}
    ${notes}
    <line class="s-axis" x1="${left}" x2="${right}" y1="${axisY}" y2="${axisY}" />
    ${ticks}`;

  const optag = ([kind, text]) => `<span class="optag optag--${kind}">${escapeHtml(text)}</span>`;
  list.innerHTML = SESSION.utterances
    .map(
      (u, i) => `
      <li class="utt" data-u="${i}">
        <span class="utt__n">${i + 1}</span>
        <div class="utt__body">
          <p class="utt__text">&ldquo;${escapeHtml(u.text)}&rdquo;</p>
          <div class="utt__ops">${u.ops.map(optag).join("")}</div>
        </div>
        <button type="button" class="utt__play" data-seek="${u.seek}" aria-label="Play utterance ${i + 1} in the Game night demo, at ${formatTime(u.seek)}">
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>${formatTime(u.seek)}
        </button>
      </li>`
    )
    .join("");

  const figure = svg.closest(".session");
  const scroller = svg.closest(".session__scroll");
  const setHot = (index) => {
    figure.classList.toggle("has-hot", index !== null);
    svg.querySelectorAll(".s-marker").forEach((el) => el.classList.toggle("is-hot", Number(el.dataset.u) === index));
    list.querySelectorAll(".utt").forEach((el) => el.classList.toggle("is-hot", Number(el.dataset.u) === index));
    const hotBars = index === null ? [] : related[index];
    svg.querySelectorAll(".s-bar").forEach((el) => el.classList.toggle("is-hot", hotBars.includes(Number(el.dataset.bar))));
    // When the timeline scrolls sideways, bring the utterance's marker into view.
    if (index !== null && scroller && scroller.scrollWidth > scroller.clientWidth + 1) {
      const scale = svg.getBoundingClientRect().width / 1160;
      scroller.scrollTo({
        left: x(SESSION.utterances[index].at) * scale - scroller.clientWidth / 2,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  };

  list.querySelectorAll(".utt").forEach((item) => {
    const index = Number(item.dataset.u);
    item.addEventListener("mouseenter", () => setHot(index));
    item.addEventListener("mouseleave", () => setHot(null));
    item.addEventListener("focusin", () => setHot(index));
    item.addEventListener("focusout", () => setHot(null));
  });
  svg.querySelectorAll(".s-marker").forEach((marker) => {
    const index = Number(marker.dataset.u);
    marker.addEventListener("mouseenter", () => setHot(index));
    marker.addEventListener("mouseleave", () => setHot(null));
    marker.addEventListener("click", () => {
      const item = list.querySelector(`.utt[data-u="${index}"]`);
      item.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setHot(index);
    });
  });
  list.querySelectorAll(".utt__play").forEach((button) =>
    button.addEventListener("click", () => playDemoAt("audio-daily-en", Number(button.dataset.seek)))
  );

  onFirstView(
    figure,
    () => {
      figure.classList.add("is-drawn");
      // The stagger is for the first reveal only; hover dimming must be instant.
      window.setTimeout(() => svg.querySelectorAll(".s-bar").forEach((el) => (el.style.transitionDelay = "")), 1900);
    },
    0.25
  );
}

/* ------------------------------------------------- belief state (Omni) */

// The scene of the report's Figure 7, in seconds.
const BELIEF = {
  death: 5.2,
  claims: [
    { from: 0.5, to: 10, row: 0, kind: "claim", text: "own health high  \u00b7  valid while the HUD is unchanged" },
    { from: 1.0, to: 5.2, row: 1, kind: "claim", text: "teammate alive" },
    { from: 2.0, to: 4.0, row: 2, kind: "old", text: "enemy seen at B" },
    { from: 5.25, to: 10, row: 2, kind: "new", text: "teammate dead" },
  ],
  log: [
    [0.5, "Own health is read off the HUD, valid while the HUD is unchanged."],
    [1.0, "\u201cTeammate alive\u201d enters the Belief State."],
    [2.0, "\u201cEnemy seen at B\u201d, valid until 4.0 s."],
    [3.0, "The user asks: \u201cShould I push now?\u201d"],
    [4.6, "A plan is ready: push together. It rests on \u201cteammate alive\u201d."],
    [5.2, "The teammate dies, which invalidates \u201cteammate alive\u201d."],
    [5.65, "Checked again before playback, the plan rests on an expired claim and is dropped."],
    [5.7, "Planned again from the new state: \u201cHold, wait for backup.\u201d It plays in full."],
    [9.2, "\u201cWhy did you say hold?\u201d is answered from the snapshot of 5.7 s, marked as past evidence."],
  ],
};

function setupBelief() {
  const svg = document.getElementById("belief-svg");
  const log = document.getElementById("belief-log");
  const scrub = document.getElementById("belief-scrub");
  const readout = document.getElementById("belief-time");
  const playButton = document.getElementById("belief-play");
  if (!svg || !log || !scrub || !readout || !playButton) return;

  const X = (t) => 140 + t * 93;
  const rowY = [104, 132, 160];
  const el = (tag, attrs = {}, text) => {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const add = (parent, tag, attrs, text) => parent.appendChild(el(tag, attrs, text));
  const badge = (parent, x, y, kind, glyph) => {
    const g = add(parent, "g", { class: `bl-badge bl-badge--${kind}` });
    add(g, "circle", { cx: x, cy: y, r: 8 });
    add(g, "text", { x, y: y + 3.6, "text-anchor": "middle" }, glyph);
    return g;
  };

  svg.innerHTML = "";
  const defs = add(svg, "defs");
  const arrowHead = add(defs, "marker", {
    id: "bl-arrowhead",
    viewBox: "0 0 10 10",
    refX: 8.6,
    refY: 5,
    markerWidth: 6.5,
    markerHeight: 6.5,
    orient: "auto-start-reverse",
  });
  add(arrowHead, "path", { d: "M0 0 10 5 0 10z", fill: "#64748b" });
  const past = add(svg, "rect", { class: "bl-past", x: X(0), y: 36, width: 0, height: 300 });
  for (const [label, y] of [["Screen", 64], ["Belief State", 136], ["Dialogue", 252]]) {
    add(svg, "text", { class: "bl-row-label", x: 120, y, "text-anchor": "end" }, label);
  }

  const frames = [];
  for (let i = 0; i < 20; i += 1) {
    const t = i * 0.5;
    frames.push({ t, node: add(svg, "rect", { class: "bl-frame", x: X(t) + 4, y: 44, width: 35, height: 32, rx: 4 }) });
  }
  // The playhead runs under the claims and bubbles so it never crosses their text; its dot is added last.
  const headLine = add(add(svg, "g", { class: "bl-head" }), "line", { x1: X(0), x2: X(0), y1: 36, y2: 344 });

  const death = add(svg, "g", { class: "bl-death" });
  add(death, "line", { x1: X(BELIEF.death), x2: X(BELIEF.death), y1: 36, y2: 84, class: "bl-death__solid" });
  add(death, "line", { x1: X(BELIEF.death), x2: X(BELIEF.death), y1: 84, y2: 336, class: "bl-death__dashed" });
  add(death, "text", { x: X(BELIEF.death), y: 28, "text-anchor": "middle", class: "bl-death__label" }, "teammate dies");

  // A label is clipped to its bar, so the text is uncovered as the bar grows.
  const claims = BELIEF.claims.map((claim, i) => {
    const clip = add(defs, "clipPath", { id: `bl-clip-${i}` });
    const clipRect = add(clip, "rect", { x: X(claim.from), y: rowY[claim.row], width: 0, height: 22 });
    const g = add(svg, "g", { class: `bl-claim bl-claim--${claim.kind}` });
    const rect = add(g, "rect", { x: X(claim.from), y: rowY[claim.row], width: 0, height: 22, rx: 5 });
    const label = add(
      g,
      "text",
      { x: X(claim.from) + 8, y: rowY[claim.row] + 15, "clip-path": `url(#bl-clip-${i})` },
      claim.text
    );
    return { ...claim, g, rect, clipRect, label };
  });
  const aliveX = badge(svg, X(5.2), rowY[1] + 11, "bad", "\u00d7");
  const expires = add(svg, "text", { class: "bl-expires", x: X(4.0) + 7, y: rowY[2] + 15 }, "expires");

  // Which claim each spoken plan rests on.
  const planLink = add(svg, "line", { class: "bl-link", x1: X(5.1), x2: X(5.1), y1: rowY[1] + 22, y2: 258 });
  const holdLink = add(svg, "line", { class: "bl-link bl-link--ok", x1: X(6.05), x2: X(6.05), y1: rowY[2] + 22, y2: 258 });

  const bubble = (x, text, kind, anchorEnd = false) => {
    const g = add(svg, "g", { class: `bl-bubble bl-bubble--${kind}` });
    const rect = add(g, "rect", { x, y: 198, height: 28, rx: 9, width: 10 });
    const label = add(g, "text", { x: x + 10, y: 216 }, text);
    return { g, rect, label, x, anchorEnd };
  };
  const q1 = bubble(X(3.0), "\u201cShould I push now?\u201d", "ask");
  const hold = bubble(X(5.75), "\u201cHold, wait for backup.\u201d", "ok");
  const q2 = bubble(X(9.95), "\u201cWhy did you say hold?\u201d", "ask", true);

  const arrow1 = add(svg, "path", { class: "bl-arrow", d: `M${X(4.6)} 228V255`, "marker-end": "url(#bl-arrowhead)" });
  const arrow2 = add(svg, "path", { class: "bl-arrow", d: `M${X(9.2)} 228V255`, "marker-end": "url(#bl-arrowhead)" });

  const plan = add(svg, "g", { class: "bl-plan" });
  const planRect = add(plan, "rect", { x: X(4.6), y: 258, width: 0, height: 18, rx: 4 });
  add(plan, "text", { x: X(4.6) - 8, y: 271, "text-anchor": "end", class: "bl-plan__label" }, "plan: push together");
  const planX = badge(svg, X(5.65), 267, "bad", "\u00d7");
  const planNote = add(svg, "g", { class: "bl-note bl-note--bad" });
  add(planNote, "text", { x: X(5.58), y: 300 }, "claim expired");
  add(planNote, "text", { x: X(5.58), y: 314 }, "before playback");

  const holdBar = add(svg, "g", { class: "bl-holdbar" });
  const holdRect = add(holdBar, "rect", { x: X(5.7), y: 258, width: 0, height: 18, rx: 4 });
  const holdTick = badge(svg, X(6.45), 267, "ok", "\u2713");

  const snapshot = add(svg, "g", { class: "bl-snapshot" });
  const snapRect = add(snapshot, "rect", { x: X(9.95) - 268, y: 258, width: 268, height: 40, rx: 8 });
  add(snapshot, "text", { x: X(9.95) - 256, y: 274 }, "answered from the snapshot of 5.7 s,");
  add(snapshot, "text", { x: X(9.95) - 256, y: 289 }, "marked as past evidence");

  add(svg, "line", { class: "bl-axis", x1: X(0), x2: X(10), y1: 344, y2: 344 });
  for (const t of [0, 2, 4, 6, 8, 10]) {
    add(svg, "line", { class: "bl-axis", x1: X(t), x2: X(t), y1: 344, y2: 349 });
    add(svg, "text", { class: "bl-tick", x: X(t), y: 363, "text-anchor": "middle" }, `${t} s`);
  }

  const headDot = add(add(svg, "g", { class: "bl-head" }), "circle", { cx: X(0), cy: 344, r: 5 });

  log.innerHTML = BELIEF.log
    .map(
      ([t, text], i) => `
      <li data-i="${i}">
        <button type="button" data-t="${t}"><span class="belief__log-t">${t.toFixed(Math.abs(t * 10 - Math.round(t * 10)) < 1e-9 ? 1 : 2)} s</span><span>${escapeHtml(text)}</span></button>
      </li>`
    )
    .join("");
  const logItems = Array.from(log.querySelectorAll("li"));

  // Bubble widths depend on the web font, so measure once it has loaded.
  const sizeBubbles = () => {
    for (const b of [q1, hold, q2]) {
      const width = b.label.getComputedTextLength() + 20;
      b.rect.setAttribute("width", width.toFixed(1));
      const x = b.anchorEnd ? b.x - width : b.x;
      b.rect.setAttribute("x", x.toFixed(1));
      b.label.setAttribute("x", (x + 10).toFixed(1));
    }
  };
  sizeBubbles();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeBubbles);

  const show = (node, on) => node.classList.toggle("is-on", on);
  const grow = (rect, from, to, t) => rect.setAttribute("width", (Math.max(0, Math.min(t, to) - from) * 93).toFixed(1));

  // On a narrow screen the figure scrolls sideways. Keep the playhead in sight
  // until the reader scrolls the figure by hand.
  const scroller = svg.closest(".belief__scroll");
  let follow = !reduceMotion;
  const keepInView = (time) => {
    if (!follow || !scroller || scroller.scrollWidth <= scroller.clientWidth + 1) return;
    const scale = svg.getBoundingClientRect().width / 1100;
    scroller.scrollLeft = Math.max(0, X(Math.min(time, 10)) * scale - scroller.clientWidth * 0.45);
  };
  if (scroller) {
    for (const type of ["pointerdown", "touchstart", "wheel"]) {
      scroller.addEventListener(type, () => (follow = false), { passive: true });
    }
  }

  const render = (t) => {
    past.setAttribute("width", (X(Math.min(t, 10)) - X(0)).toFixed(1));
    headLine.setAttribute("x1", X(Math.min(t, 10)));
    headLine.setAttribute("x2", X(Math.min(t, 10)));
    headDot.setAttribute("cx", X(Math.min(t, 10)));
    for (const frame of frames) frame.node.classList.toggle("is-seen", frame.t <= t);
    show(death, t >= BELIEF.death);
    for (const claim of claims) {
      show(claim.g, t >= claim.from);
      grow(claim.rect, claim.from, claim.to, t);
      claim.clipRect.setAttribute("width", claim.rect.getAttribute("width"));
      claim.label.classList.toggle("is-on", t >= claim.from + 0.12);
    }
    claims[1].g.classList.toggle("is-dead", t >= 5.2);
    show(aliveX, t >= 5.2);
    show(expires, t >= 4.0);
    claims[2].g.classList.toggle("is-dead", t >= 4.0);

    show(q1.g, t >= 3.0);
    show(arrow1, t >= 4.6);
    show(plan, t >= 4.6);
    grow(planRect, 4.6, 5.65, t);
    plan.classList.toggle("is-dead", t >= 5.65);
    show(planLink, t >= 4.6 && t < 6.2);
    planLink.classList.toggle("is-bad", t >= 5.2);
    show(planX, t >= 5.65);
    show(planNote, t >= 5.65);

    show(hold.g, t >= 5.75);
    show(holdBar, t >= 5.7);
    grow(holdRect, 5.7, 6.45, t);
    show(holdTick, t >= 6.45);
    show(holdLink, t >= 5.7);

    show(q2.g, t >= 8.7);
    show(arrow2, t >= 9.2);
    show(snapshot, t >= 9.35);

    let current = -1;
    BELIEF.log.forEach(([time], i) => {
      if (t >= time) current = i;
    });
    logItems.forEach((item, i) => {
      item.classList.toggle("is-past", i <= current);
      item.classList.toggle("is-current", i === current);
    });
    scrub.value = String(Math.min(t, 10));
    readout.textContent = `${Math.min(t, 10).toFixed(1)} s`;
    keepInView(t);
  };

  const figure = svg.closest(".belief");
  let t = 0;
  let playing = !reduceMotion;
  let visible = false;
  let last = null;
  let frameId = null;
  const END = 10.6;
  const HOLD = 2.6;

  const setPlaying = (on) => {
    playing = on;
    figure.classList.toggle("is-paused", !on);
    playButton.setAttribute("aria-label", on ? "Pause the animation" : "Play the animation");
    if (on) loop();
  };
  const loop = () => {
    if (frameId || !playing || !visible) return;
    last = null;
    const step = (now) => {
      frameId = null;
      if (!playing || !visible) return;
      if (last !== null) t += (now - last) / 1000;
      last = now;
      if (t > END + HOLD) t = 0;
      render(t);
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
  };

  playButton.addEventListener("click", () => {
    if (!playing && t >= END) t = 0;
    follow = true;
    setPlaying(!playing);
  });
  scrub.addEventListener("input", () => {
    setPlaying(false);
    follow = true;
    t = Number(scrub.value);
    render(t);
  });
  log.querySelectorAll("button").forEach((button) =>
    button.addEventListener("click", () => {
      setPlaying(false);
      follow = true;
      t = Number(button.dataset.t) + 0.01;
      render(t);
    })
  );

  if (reduceMotion) {
    t = 10;
    render(t);
    setPlaying(false);
    return;
  }
  render(0);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) loop();
    },
    { threshold: 0.3 }
  ).observe(figure);
  setPlaying(true);
}

/* ----------------------------------------------------------------- mount */

export function mount() {
  drawGatePlot();
  setupModules();
  drawSession();
  setupBelief();
  onFirstView(document.querySelector(".arch"), () => document.querySelector(".arch").classList.add("is-live"), 0.2);
}
