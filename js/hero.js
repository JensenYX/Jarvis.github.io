/* The hero scene: a voice orb that listens and speaks, and the Task Ledger it
 * hands work to. The loop replays four turns of the report's game-night
 * session. Each request flies to the ledger as a typed operation and lands on
 * the task it names, and an answer counts as delivered only once its receipt
 * comes back from playback. */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const STATUS = { running: "Running", completed: "Completed", delivered: "Delivered", cancelled: "Cancelled" };

const START = {
  rows: {
    game: { meta: "v1 \u00b7 building", status: "running", p: 0.35 },
    weather: { meta: "v1 \u00b7 tonight", status: "running", p: 0.5 },
    snacks: { meta: "v1 \u00b7 usual $40", status: "delivered", p: 1 },
    sign: { meta: "v1 \u00b7 drafting", status: "running", p: 0.2 },
  },
  memory: "usual snacks \u00b7 $40",
  said: ["User", "\u201cWait, make it two-player.\u201d"],
};

// With reduced motion the scene shows the loop's last frame and stays there.
const END = {
  rows: {
    game: { meta: "v2 \u00b7 two players", status: "running", p: 0.7 },
    weather: { meta: "v1 \u00b7 tonight", status: "delivered", p: 1 },
    snacks: { meta: "v2 \u00b7 $60 tonight", status: "running", p: 0.45 },
    sign: { meta: "v1 \u00b7 drafting", status: "cancelled", p: 0.2 },
  },
  memory: "usual snacks \u00b7 $40 \u00b7 kept",
  said: ["User", "\u201cCancel just the welcome sign.\u201d"],
};

let scene;
let said;
let memory;
let visible = true;

const row = (task) => scene.querySelector(`.srow[data-task="${task}"]`);

/** Resolves after `ms` of time during which the scene was on screen. */
function wait(ms) {
  return new Promise((resolve) => {
    let left = ms;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      if (visible && !document.hidden) left -= now - last;
      last = now;
      if (left <= 0) resolve();
      else setTimeout(tick, Math.min(left, 100));
    };
    setTimeout(tick, Math.min(left, 100));
  });
}

function setRow(task, { meta, status, p }, duration = 0.6) {
  const el = row(task);
  if (meta !== undefined) el.querySelector(".srow__meta").textContent = meta;
  if (status !== undefined) {
    el.dataset.status = status;
    el.querySelector(".srow__state").textContent = STATUS[status];
  }
  if (p !== undefined) {
    el.style.setProperty("--d", `${duration}s`);
    el.style.setProperty("--p", String(p));
  }
}

function setSaid(who, text) {
  said.dataset.who = who;
  said.querySelector("b").textContent = who;
  said.querySelector("span").textContent = text;
}

function apply(state) {
  for (const [task, change] of Object.entries(state.rows)) setRow(task, change, 0);
  memory.querySelector("b").textContent = state.memory;
  setSaid(...state.said);
}

function flash(el, kind) {
  if (kind) el.dataset.flash = kind;
  el.classList.remove("is-flash");
  void el.offsetWidth;
  el.classList.add("is-flash");
}

/** Fade the elements out, change them, and fade them back in. */
async function swap(elements, change) {
  elements.forEach((el) => el.classList.add("is-swap"));
  await wait(200);
  change();
  elements.forEach((el) => el.classList.remove("is-swap"));
}

const say = (who, text) => swap([said], () => setSaid(who, text));

function update(task, change, kind) {
  const el = row(task);
  if (kind) flash(el, kind);
  return swap([el.querySelector(".srow__meta"), el.querySelector(".srow__state")], () => setRow(task, change, 0.3));
}

/** A point on an element in scene coordinates: its centre, or near its left end. */
function at(el, where = "center") {
  const box = scene.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const x = where === "start" ? r.left + 44 : r.left + r.width / 2;
  return { x: x - box.left, y: r.top + r.height / 2 - box.top };
}

/** Where a token of size w x h leaves `el` on its way to `to`: just outside
 * the side that faces the target, so it never covers the element's text. */
function exit(el, to, w, h) {
  const box = scene.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const c = at(el);
  const dx = to.x - c.x;
  const dy = to.y - c.y;
  if (Math.abs(dx) * r.height >= Math.abs(dy) * r.width) {
    const x = dx > 0 ? r.right - box.left + w / 2 - 10 : r.left - box.left - w / 2 + 10;
    return { x, y: c.y };
  }
  const y = dy > 0 ? r.bottom - box.top + h / 2 - 4 : r.top - box.top - h / 2 + 4;
  return { x: c.x, y };
}

/** Fly an operation tag, or a bare dot when there is no label, from an
 * element to a point along an arc. */
function fly(fromEl, to, label, kind, duration = 1000) {
  const token = document.createElement("span");
  if (label) {
    token.className = `scene__token optag optag--${kind}`;
    token.textContent = label;
  } else {
    token.className = "scene__echo";
  }
  scene.appendChild(token);
  const w = token.offsetWidth;
  const h = token.offsetHeight;
  const from = exit(fromEl, to, w, h);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const bend = Math.min(48, length * 0.2);
  // Bow to the left of the direction of travel: up on the way to the ledger,
  // down on the way back.
  const c = { x: (from.x + to.x) / 2 + (dy / length) * bend, y: (from.y + to.y) / 2 - (dx / length) * bend };
  const frames = [];
  for (let i = 0; i <= 16; i += 1) {
    const t = i / 16;
    const u = 1 - t;
    const x = u * u * from.x + 2 * u * t * c.x + t * t * to.x;
    const y = u * u * from.y + 2 * u * t * c.y + t * t * to.y;
    const fade = Math.min(1, t / 0.12, (1 - t) / 0.14);
    frames.push({
      offset: t,
      opacity: fade,
      transform: `translate(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px) scale(${(0.7 + 0.3 * fade).toFixed(3)})`,
    });
  }
  const animation = token.animate(frames, { duration, easing: "cubic-bezier(0.45, 0, 0.25, 1)" });
  return animation.finished.then(
    () => token.remove(),
    () => token.remove()
  );
}

async function play() {
  const game = row("game");
  const weather = row("weather");
  const snacks = row("snacks");
  const sign = row("sign");
  const orb = scene.querySelector(".orb");
  const remembered = memory.querySelector("b");
  await wait(500);
  for (;;) {
    // A refinement while the game is still being built.
    await say("User", "\u201cWait, make it two-player.\u201d");
    await wait(700);
    await fly(said, at(game, "start"), "REFINE game v1", "refine");
    await update("game", { meta: "v2 \u00b7 two players", p: 0.06 }, "refine");
    await wait(350);
    setRow("game", { p: 0.72 }, 10);
    await wait(900);

    // One sentence, two destinations: tonight's budget goes to the task, the
    // usual one stays in memory.
    await say("User", "\u201cSixty tonight, forty as usual.\u201d");
    await wait(700);
    const toSnacks = fly(said, at(snacks, "start"), "REFINE snacks v1", "refine");
    await wait(260);
    const toMemory = fly(said, at(memory, "start"), "SAVE usual budget", "save", 1050);
    await toSnacks;
    await update("snacks", { meta: "v2 \u00b7 $60 tonight", status: "running", p: 0.05 }, "refine");
    await toMemory;
    flash(memory);
    await swap([remembered], () => (remembered.textContent = "usual snacks \u00b7 $40 \u00b7 kept"));
    setRow("snacks", { p: 0.5 }, 7);
    await wait(700);

    // Done is not delivered: the weather counts only once it has been heard.
    setRow("weather", { p: 1 }, 0.7);
    await wait(700);
    await update("weather", { status: "completed" });
    await wait(250);
    await fly(weather, at(orb), null, null, 850);
    scene.classList.add("is-speaking");
    await say("Jarvis", "\u201cShanghai tonight: clear, 24\u00b0.\u201d");
    await wait(2300);
    scene.classList.remove("is-speaking");
    await fly(orb.querySelector(".orb__body"), at(weather, "start"), "\u2713 heard in full", "heard", 950);
    await update("weather", { status: "delivered" }, "deliver");
    await wait(900);

    // A cancellation that touches nothing else.
    await say("User", "\u201cCancel just the welcome sign.\u201d");
    await wait(700);
    await fly(said, at(sign, "start"), "CANCEL sign v1", "cancel");
    await update("sign", { status: "cancelled" }, "cancel");
    await wait(3200);

    scene.classList.add("is-resetting");
    await wait(450);
    apply(START);
    await wait(150);
    scene.classList.remove("is-resetting");
    await wait(600);
  }
}

export function mount() {
  scene = document.getElementById("scene");
  if (!scene) return;
  said = document.getElementById("scene-said");
  memory = document.getElementById("scene-memory");
  if (reduceMotion || !("animate" in Element.prototype)) {
    apply(END);
    return;
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    scene.classList.toggle("is-paused", !visible);
  }).observe(scene);
  play().catch((error) => console.error("[jarvis] hero scene stopped", error));
}
