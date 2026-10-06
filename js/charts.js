/* Result charts: the paired harness comparison, the two leaderboards and the
 * three mechanism cards. Bars are HTML elements whose width comes from a
 * --w custom property, so CSS animates both the first reveal and every
 * change of metric. All numbers come from RESULTS in data.js. */

import { RESULTS } from "./data.js";
import { playDemoAt } from "./theater.js";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );

const fixed = (value, decimals) =>
  value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/* ------------------------------------------------------- paired harnesses */

function setupPaired() {
  const chart = document.getElementById("paired-chart");
  const note = document.getElementById("paired-note");
  const tabs = Array.from(document.querySelectorAll("#paired-tabs [role='tab']"));
  if (!chart || !note || !tabs.length) return;
  const { models, metrics } = RESULTS.paired;

  chart.innerHTML = `
    ${models
      .map(
        (model, i) => `
      <div class="pc-row" data-row="${i}">
        <div class="pc-model">${escapeHtml(model)}</div>
        <div class="pc-bars">
          <div class="pc-bar pc-bar--qaa"><i></i><span><em>QAA</em> <b></b></span></div>
          <div class="pc-bar pc-bar--jarvis"><i></i><span><em>Jarvis</em> <b></b></span></div>
        </div>
        <div class="pc-delta"></div>
      </div>`
      )
      .join("")}
    <div class="pc-axis"><span></span><span></span></div>`;

  const show = (key) => {
    const metric = metrics[key];
    const span = metric.max - metric.min;
    const pct = (value) => `${Math.max(0, ((value - metric.min) / span) * 100).toFixed(2)}%`;
    chart.querySelectorAll(".pc-row").forEach((row) => {
      const i = Number(row.dataset.row);
      const qaa = metric.qaa[i];
      const jarvis = metric.jarvis[i];
      const [qBar, jBar] = row.querySelectorAll(".pc-bar");
      qBar.style.setProperty("--w", pct(qaa));
      jBar.style.setProperty("--w", pct(jarvis));
      qBar.querySelector("b").textContent = fixed(qaa, metric.decimals);
      jBar.querySelector("b").textContent = fixed(jarvis, metric.decimals);
      row.querySelector(".pc-delta").textContent = `+${fixed(jarvis - qaa, metric.decimals)}`;
    });
    const [lo, hi] = metric.axis;
    const axis = chart.querySelectorAll(".pc-axis span");
    axis[0].textContent = lo;
    axis[1].textContent = hi;
    note.textContent = metric.note;
    for (const tab of tabs) {
      const on = tab.dataset.metric === key;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => show(tab.dataset.metric));
    tab.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = tabs[(index + step + tabs.length) % tabs.length];
      next.focus();
      show(next.dataset.metric);
    });
  });
  show("tau");
}

/* ----------------------------------------------------------- leaderboards */

function renderBoard(id, rows, decimals) {
  const list = document.getElementById(id);
  if (!list) return;
  const max = Math.max(...rows.map((row) => row.value));
  list.innerHTML = rows
    .map(
      (row, i) => `
      <li class="lb-row${row.ours ? " is-ours" : ""}${row.proprietary ? " is-muted" : ""}" style="--w: ${((row.value / max) * 100).toFixed(2)}%; --i: ${i}">
        <span class="lb-name" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}${row.ours ? ' <em class="lb-ours">ours</em>' : ""}</span>
        <span class="lb-track"><i></i></span>
        <b class="lb-val">${fixed(row.value, decimals)}</b>
      </li>`
    )
    .join("");
}

/* -------------------------------------------------------------- mechanisms */

function renderRace() {
  const root = document.getElementById("race-chart");
  if (!root) return;
  root.innerHTML = RESULTS.race
    .map((row) => {
      const errors = [
        row.staleAudio && `${row.staleAudio} stale audio`,
        row.staleTool && `${row.staleTool} stale tool effects`,
        row.falseDelivery && `${row.falseDelivery} false deliveries`,
      ].filter(Boolean);
      return `
        <div class="race__row${row.ours ? " is-ours" : ""}">
          <div class="race__top">
            <span class="race__name">${escapeHtml(row.name)}</span>
            <b class="race__val">${row.ok}<small> / 240</small></b>
          </div>
          <div class="race__track" style="--w: ${((row.ok / 240) * 100).toFixed(2)}%"><i></i></div>
          <div class="race__errs">${
            errors.length
              ? errors.map((text) => `<span class="err-chip">${escapeHtml(text)}</span>`).join("")
              : '<span class="ok-chip">no stale audio, no stale tool effect, no false delivery</span>'
          }</div>
        </div>`;
    })
    .join("");
}

function renderControllers() {
  const root = document.getElementById("ctrl-chart");
  if (!root) return;
  const rows = RESULTS.controllers;
  const metrics = [
    { title: "Median decision request", hint: "lower is better", max: 3.14, value: (r) => r.median, label: (r) => `${r.median.toFixed(2)} s` },
    { title: "Correct and confident within 1 s", hint: "of 576 calls", max: 576, value: (r) => r.inTime, label: (r) => `${((r.inTime / 576) * 100).toFixed(1)}%` },
    { title: "Obsolete work stopped in time", hint: "of 224 replays", max: 224, value: (r) => r.stopped, label: (r) => `${r.stopped}` },
    { title: "Replays with stale audio", hint: "lower is better", max: 256, value: (r) => r.stale, label: (r) => `${r.stale}` },
  ];
  root.innerHTML = `
    <ul class="ctrl__legend">${rows
      .map((r, i) => `<li><i class="ctrl__swatch ctrl__swatch--${i}"></i>${escapeHtml(r.name)}</li>`)
      .join("")}</ul>
    ${metrics
      .map(
        (m) => `
      <div class="ctrl__metric">
        <p class="ctrl__title">${escapeHtml(m.title)} <span>${escapeHtml(m.hint)}</span></p>
        ${rows
          .map(
            (r, i) => `
          <div class="ctrl__bar ctrl__bar--${i}" style="--w: ${Math.max(0.6, (m.value(r) / m.max) * 82).toFixed(2)}%">
            <i></i><b>${m.label(r)}</b>
          </div>`
          )
          .join("")}
      </div>`
      )
      .join("")}`;
}

function renderMemory() {
  const root = document.getElementById("memory-chart");
  if (!root) return;
  root.innerHTML = `
    ${RESULTS.memory
      .map(
        (row) => `
      <div class="mem-row${row.ours ? " is-ours" : ""}">
        <div class="mem-row__top">
          <span>${escapeHtml(row.name)}</span>
          <b>${row.score.toFixed(2)}</b>
        </div>
        <div class="mem-row__track" style="--w: ${(((row.score - 1) / 4) * 100).toFixed(2)}%"><i></i></div>
        <p class="mem-row__sub">${row.good} / 80 answers score 4 or more &middot; ${row.tokens.toLocaleString("en-US")} evidence tokens</p>
      </div>`
      )
      .join("")}
    <div class="mem-axis"><span>1</span><span>3</span><span>5</span></div>
    <p class="mech__foot">QAA compresses the conversation into short notes and passes 55 tokens of evidence, which loses the details the questions ask about; Jarvis keeps what both speakers said.</p>`;
}

export function mount() {
  setupPaired();
  renderBoard("board-fdb3", RESULTS.fdb3Leaderboard, 1);
  renderBoard("board-tau", RESULTS.tauLeaderboard, 1);
  renderRace();
  renderControllers();
  renderMemory();

  document.querySelectorAll("a[data-demo]").forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      playDemoAt(link.dataset.demo, 0);
    })
  );
}
