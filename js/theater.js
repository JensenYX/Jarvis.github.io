/* The demo theater: one stage, a grouped playlist, chapters and subtitles.
 *
 * Only the selected video is attached to the <video> element, so nothing
 * downloads for the six that are not on screen. Subtitles are drawn in a bar
 * under the stage rather than over the picture: four of the recordings have
 * Chinese captions and a HUD burned in, and English cues on top of those would
 * cover both. The track still exists, and in fullscreen, where the bar cannot
 * be seen, the browser draws it at the top of the frame instead. */

import { DEMOS, GROUPS } from "./data.js";

const UPNEXT_SECONDS = 8;
const SPEAKER_RE = /^(User|Jarvis):\s*([\s\S]*)$/;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  index: 0,
  captions: true,
  track: null,
  expectedMode: "disabled",
  upnextTimer: null,
};

let video;
let stage;

const $ = (selector, root = document) => root.querySelector(selector);

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );

export const formatTime = (seconds) => {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const assets = (demo) => ({
  src: `assets/videos/${demo.slug}.mp4`,
  poster: `assets/posters/${demo.slug}.jpg`,
  thumb: `assets/posters/${demo.slug}-thumb.jpg`,
  vtt: `assets/subs/${demo.slug}.en.vtt`,
});

const ICONS = {
  prev: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M15.4 5.4 9 12l6.4 6.6-1.4 1.4L6.2 12 14 4z" fill="currentColor"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8.6 18.6 15 12 8.6 5.4 10 4l7.8 8-7.8 8z" fill="currentColor"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
  cc: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-8.5 9.6a3 3 0 0 1-2 .7c-1.8 0-3-1.3-3-3.3S6.7 7.7 8.5 7.7c.8 0 1.5.2 2 .7l-.8 1.1a1.8 1.8 0 0 0-1.2-.4c-1 0-1.6.8-1.6 1.9s.6 1.9 1.6 1.9c.5 0 .9-.1 1.2-.4zm7 0a3 3 0 0 1-2 .7c-1.8 0-3-1.3-3-3.3s1.2-3.3 3-3.3c.8 0 1.5.2 2 .7l-.8 1.1a1.8 1.8 0 0 0-1.2-.4c-1 0-1.6.8-1.6 1.9s.6 1.9 1.6 1.9c.5 0 .9-.1 1.2-.4z" fill="currentColor"/></svg>',
};

/* -------------------------------------------------------------- playlist */

function renderPlaylist() {
  const root = $("#playlist");
  root.innerHTML = Object.entries(GROUPS)
    .map(([group, meta]) => {
      const items = DEMOS.map((demo, index) => ({ demo, index })).filter(({ demo }) => demo.group === group);
      return `
        <section class="playlist__group" data-group="${group}">
          <header class="playlist__head">
            <span class="group-dot group-dot--${group}" aria-hidden="true"></span>
            <h3>${escapeHtml(meta.name)}</h3>
            <span class="playlist__count">${items.length} ${items.length === 1 ? "session" : "sessions"}</span>
          </header>
          <p class="playlist__blurb">${escapeHtml(meta.blurb)}</p>
          <ol class="playlist__items">
            ${items
              .map(
                ({ demo, index }) => `
              <li>
                <button type="button" class="pl-item" data-index="${index}">
                  <span class="pl-item__thumb">
                    <img src="${assets(demo).thumb}" alt="" loading="lazy" decoding="async" />
                    <span class="pl-item__dur">${formatTime(demo.duration)}</span>
                    <span class="pl-item__eq" aria-hidden="true"><i></i><i></i><i></i></span>
                  </span>
                  <span class="pl-item__body">
                    <span class="pl-item__kicker">${String(index + 1).padStart(2, "0")} &middot; ${escapeHtml(demo.scenario)}</span>
                    <span class="pl-item__title">${escapeHtml(demo.title)}</span>
                    <span class="pl-item__tag">${escapeHtml(demo.tagline)}</span>
                  </span>
                </button>
              </li>`
              )
              .join("")}
          </ol>
        </section>`;
    })
    .join("");

  root.querySelectorAll(".pl-item").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      if (index === state.index) {
        video.paused ? video.play().catch(() => {}) : video.pause();
        return;
      }
      select(index, { play: true, updateHash: true });
    });
  });
}

function syncPlaylist() {
  document.querySelectorAll(".pl-item").forEach((button) => {
    const active = Number(button.dataset.index) === state.index;
    if (active) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
    button.classList.toggle("is-active", active);
    button.classList.toggle("is-playing", active && !video.paused);
  });
}

/* ------------------------------------------------------------------ info */

function renderInfo(demo) {
  const group = GROUPS[demo.group];
  const language = demo.subs ? `${demo.language} &middot; English subtitles` : escapeHtml(demo.language);
  const chapters = demo.chapters
    .map(
      ([t, label], i) => `
      <li>
        <button type="button" class="chapter" data-t="${t}" data-i="${i}">
          <span class="chapter__time">${formatTime(t)}</span>
          <span class="chapter__label">${escapeHtml(label)}</span>
          <span class="chapter__bar" aria-hidden="true"><span></span></span>
        </button>
      </li>`
    )
    .join("");

  $("#stage-info").innerHTML = `
    <div class="stage-info__top">
      <div class="stage-info__badges">
        <span class="badge badge--${demo.group}">${escapeHtml(group.name)}</span>
        <span class="badge">${escapeHtml(demo.scenario)}</span>
        <span class="badge">${language}</span>
        <span class="badge badge--mono">${formatTime(demo.duration)}</span>
      </div>
      <div class="stage-info__nav">
        <span class="stage-info__count">${state.index + 1} / ${DEMOS.length}</span>
        <button type="button" class="nav-btn" data-step="-1" aria-label="Previous demo" ${state.index === 0 ? "disabled" : ""}>${ICONS.prev}</button>
        <button type="button" class="nav-btn" data-step="1" aria-label="Next demo" ${state.index === DEMOS.length - 1 ? "disabled" : ""}>${ICONS.next}</button>
      </div>
    </div>
    <div class="stage-info__grid">
      <div class="stage-info__text">
        <h3 class="stage-info__title">${escapeHtml(demo.title)}</h3>
        <p class="stage-info__summary">${escapeHtml(demo.summary)}</p>
        <h4 class="stage-info__label">What to watch for</h4>
        <ul class="watchlist">${demo.watch.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      </div>
      <div class="stage-info__chapters">
        <h4 class="stage-info__label">Chapters</h4>
        <ol class="chapters">${chapters}</ol>
      </div>
    </div>`;

  $("#stage-info")
    .querySelectorAll(".chapter")
    .forEach((button) => button.addEventListener("click", () => seekTo(Number(button.dataset.t))));
  $("#stage-info")
    .querySelectorAll(".nav-btn")
    .forEach((button) =>
      button.addEventListener("click", () => {
        const next = state.index + Number(button.dataset.step);
        if (next >= 0 && next < DEMOS.length) select(next, { play: true, updateHash: true });
      })
    );
}

function syncChapters() {
  const demo = DEMOS[state.index];
  const now = video.currentTime || 0;
  const total = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : demo.duration;
  let active = 0;
  demo.chapters.forEach(([t], i) => {
    if (now >= t - 0.05) active = i;
  });
  document.querySelectorAll("#stage-info .chapter").forEach((button) => {
    const i = Number(button.dataset.i);
    const start = demo.chapters[i][0];
    const end = i + 1 < demo.chapters.length ? demo.chapters[i + 1][0] : total;
    const isActive = i === active && (now > 0 || !video.paused);
    button.classList.toggle("is-active", isActive);
    button.classList.toggle("is-past", i < active);
    const fill = isActive ? Math.min(1, Math.max(0, (now - start) / Math.max(end - start, 0.1))) : i < active ? 1 : 0;
    button.querySelector(".chapter__bar span").style.transform = `scaleX(${fill})`;
  });
}

function seekTo(t, block = "nearest") {
  clearUpNext();
  const go = () => {
    video.currentTime = t;
    video.play().catch(() => {});
  };
  if (video.readyState >= 1) go();
  else video.addEventListener("loadedmetadata", go, { once: true });
  stage.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block });
}

/* ------------------------------------------------------------- subtitles */

function isFullscreen() {
  const element = document.fullscreenElement || document.webkitFullscreenElement;
  return Boolean(element && (element === video || element.contains(video))) || Boolean(video.webkitDisplayingFullscreen);
}

function setMode(mode) {
  if (!state.track) return;
  state.expectedMode = mode;
  state.track.mode = mode;
}

function applyCaptionMode() {
  if (!state.track) return;
  if (!state.captions) setMode("disabled");
  else setMode(isFullscreen() ? "showing" : "hidden");
}

function attachTrack(demo) {
  video.querySelectorAll("track").forEach((el) => el.remove());
  state.track = null;
  if (!demo.subs) return;
  const el = document.createElement("track");
  el.kind = "subtitles";
  el.srclang = "en";
  el.label = "English";
  el.src = assets(demo).vtt;
  video.appendChild(el);
  state.track = el.track;
  state.track.addEventListener("cuechange", renderCue);
  applyCaptionMode();
}

function renderCaptionBar() {
  const demo = DEMOS[state.index];
  const bar = $("#captionbar");
  if (!demo.subs) {
    bar.dataset.state = "none";
    bar.innerHTML = `<p class="captionbar__note">${escapeHtml(demo.subsNote || "")}</p>`;
    return;
  }
  bar.dataset.state = state.captions ? "on" : "off";
  bar.innerHTML = `
    <div class="captionbar__line" aria-live="off">
      <span class="captionbar__who"></span>
      <span class="captionbar__text"></span>
    </div>
    <button type="button" class="captionbar__toggle" aria-pressed="${state.captions}" title="English subtitles">
      ${ICONS.cc}<span>${state.captions ? "Subtitles on" : "Subtitles off"}</span>
    </button>`;
  bar.querySelector(".captionbar__toggle").addEventListener("click", () => {
    state.captions = !state.captions;
    applyCaptionMode();
    renderCaptionBar();
    renderCue();
  });
  renderCue();
}

function renderCue() {
  const bar = $("#captionbar");
  const who = bar.querySelector(".captionbar__who");
  const text = bar.querySelector(".captionbar__text");
  if (!who || !text) return;
  if (!state.captions) {
    who.textContent = "";
    who.removeAttribute("data-who");
    text.textContent = "English subtitles are off.";
    bar.classList.remove("has-cue");
    return;
  }
  const cues = state.track && state.track.activeCues;
  const cue = cues && cues.length ? cues[cues.length - 1] : null;
  if (!cue) {
    bar.classList.remove("has-cue");
    if (!bar.classList.contains("was-cued")) {
      who.textContent = "";
      who.removeAttribute("data-who");
      text.textContent = "English subtitles appear here as the conversation plays.";
    }
    return;
  }
  const match = SPEAKER_RE.exec(cue.text);
  const speaker = match ? match[1] : "";
  who.textContent = speaker;
  if (speaker) who.dataset.who = speaker;
  else who.removeAttribute("data-who");
  text.textContent = match ? match[2] : cue.text;
  bar.classList.add("has-cue", "was-cued");
}

/* --------------------------------------------------------------- up next */

function clearUpNext() {
  if (state.upnextTimer) cancelAnimationFrame(state.upnextTimer);
  state.upnextTimer = null;
  const overlay = $("#upnext");
  overlay.hidden = true;
  overlay.innerHTML = "";
}

function showUpNext() {
  const overlay = $("#upnext");
  const nextIndex = state.index + 1 < DEMOS.length ? state.index + 1 : null;
  if (nextIndex === null) {
    overlay.innerHTML = `
      <div class="upnext__card">
        <p class="upnext__label">That was all seven</p>
        <p class="upnext__title">Thanks for watching.</p>
        <div class="upnext__actions">
          <button type="button" class="upnext__primary" data-act="replay">${ICONS.play}<span>Watch again</span></button>
          <button type="button" class="upnext__ghost" data-act="first">Back to the first demo</button>
        </div>
      </div>`;
    overlay.hidden = false;
    overlay.querySelector('[data-act="replay"]').addEventListener("click", () => seekTo(0));
    overlay.querySelector('[data-act="first"]').addEventListener("click", () =>
      select(0, { play: true, updateHash: true })
    );
    return;
  }
  const next = DEMOS[nextIndex];
  const ring = 2 * Math.PI * 17;
  overlay.innerHTML = `
    <div class="upnext__card">
      <p class="upnext__label">Up next &middot; ${String(nextIndex + 1).padStart(2, "0")} / ${DEMOS.length}</p>
      <div class="upnext__body">
        <img src="${assets(next).thumb}" alt="" />
        <div>
          <p class="upnext__title">${escapeHtml(next.title)}</p>
          <p class="upnext__tag">${escapeHtml(next.tagline)}</p>
        </div>
      </div>
      <div class="upnext__actions">
        <button type="button" class="upnext__primary" data-act="play">
          <svg class="upnext__ring" viewBox="0 0 40 40" width="26" height="26" aria-hidden="true">
            <circle cx="20" cy="20" r="17" class="upnext__ring-bg"></circle>
            <circle cx="20" cy="20" r="17" class="upnext__ring-fg" stroke-dasharray="${ring}" stroke-dashoffset="${ring}"></circle>
            <path d="M16 13v14l11-7z" fill="currentColor"></path>
          </svg>
          <span>Play now</span>
        </button>
        <button type="button" class="upnext__ghost" data-act="cancel">Cancel</button>
      </div>
    </div>`;
  overlay.hidden = false;
  const fg = overlay.querySelector(".upnext__ring-fg");
  const started = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - started) / (UPNEXT_SECONDS * 1000));
    fg.setAttribute("stroke-dashoffset", String(ring * (1 - t)));
    if (t >= 1) {
      select(nextIndex, { play: true, updateHash: true });
      return;
    }
    state.upnextTimer = requestAnimationFrame(tick);
  };
  state.upnextTimer = requestAnimationFrame(tick);
  overlay.querySelector('[data-act="play"]').addEventListener("click", () =>
    select(nextIndex, { play: true, updateHash: true })
  );
  overlay.querySelector('[data-act="cancel"]').addEventListener("click", clearUpNext);
}

/* ---------------------------------------------------------------- select */

function select(index, { play = false, updateHash = false } = {}) {
  clearUpNext();
  const demo = DEMOS[index];
  state.index = index;
  video.pause();
  $("#captionbar").classList.remove("was-cued");
  const files = assets(demo);
  video.poster = files.poster;
  video.src = files.src;
  attachTrack(demo);
  renderInfo(demo);
  renderCaptionBar();
  syncPlaylist();
  syncChapters();
  stage.dataset.group = demo.group;
  if (updateHash) history.replaceState(null, "", `#demo-${demo.slug}`);
  if (play) video.play().catch(() => {});
}

/** Called by other blocks, such as the session timeline, to open a moment. */
export function playDemoAt(slug, t) {
  const index = DEMOS.findIndex((demo) => demo.slug === slug);
  if (index < 0) return;
  if (index !== state.index) select(index, { updateHash: true });
  seekTo(t, "center");
}

function indexFromHash() {
  const match = window.location.hash.match(/^#demo-([a-z0-9-]+)$/);
  if (!match) return -1;
  return DEMOS.findIndex((demo) => demo.slug === match[1]);
}

export function mount() {
  video = document.getElementById("stage-video");
  stage = document.getElementById("stage");
  if (!video || !stage) return;

  renderPlaylist();
  const fromHash = indexFromHash();
  select(fromHash >= 0 ? fromHash : 0);
  if (fromHash >= 0) {
    requestAnimationFrame(() => document.getElementById("demos").scrollIntoView({ block: "start" }));
  }

  video.addEventListener("play", () => {
    clearUpNext();
    syncPlaylist();
  });
  video.addEventListener("pause", syncPlaylist);
  video.addEventListener("ended", () => {
    syncPlaylist();
    showUpNext();
  });
  video.addEventListener("timeupdate", syncChapters);
  video.addEventListener("seeked", syncChapters);
  video.addEventListener("loadedmetadata", syncChapters);

  // The browser's own caption menu flips the track too; follow the user's choice.
  video.textTracks.addEventListener("change", () => {
    if (!state.track || state.track.mode === state.expectedMode) return;
    state.captions = state.track.mode !== "disabled";
    applyCaptionMode();
    renderCaptionBar();
  });
  const onFullscreen = () => applyCaptionMode();
  document.addEventListener("fullscreenchange", onFullscreen);
  document.addEventListener("webkitfullscreenchange", onFullscreen);
  video.addEventListener("webkitbeginfullscreen", () => state.captions && setMode("showing"));
  video.addEventListener("webkitendfullscreen", onFullscreen);

  window.addEventListener("hashchange", () => {
    const index = indexFromHash();
    if (index >= 0 && index !== state.index) select(index);
  });
}
