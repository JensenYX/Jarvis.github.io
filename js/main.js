/* Page-wide behaviour: the sticky section nav, reveal-on-scroll and the
 * count-up numbers. Each interactive block lives in its own module and is
 * mounted from here, so a failure in one block cannot blank the page. */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ nav */

function setupNav() {
  const nav = document.getElementById("topnav");
  const hero = document.getElementById("top");
  if (!nav || !hero) return;

  new IntersectionObserver(
    ([entry]) => nav.classList.toggle("is-shown", !entry.isIntersecting),
    { rootMargin: "-56px 0px 0px 0px" }
  ).observe(hero);

  const strip = nav.querySelector(".topnav__links");
  const links = Array.from(nav.querySelectorAll(".topnav__links a"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  let shown = null;

  // The section whose top is closest above the nav line is the current one.
  const update = () => {
    const line = 90;
    let current = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top - line <= 0) current = section;
    }
    for (const link of links) {
      if (current && link.getAttribute("href") === `#${current.id}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
    // On a phone the links scroll sideways; keep the current one in sight.
    const active = strip.querySelector('[aria-current="true"]');
    if (active && active !== shown && strip.scrollWidth > strip.clientWidth) {
      const offset = active.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft;
      strip.scrollTo({ left: offset - (strip.clientWidth - active.offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
    }
    shown = active;
    const theater = document.getElementById("demos");
    if (theater) {
      const rect = theater.getBoundingClientRect();
      nav.classList.toggle("is-dark", rect.top <= 54 && rect.bottom > 54);
    }
  };
  let queued = false;
  window.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
  update();
}

/* --------------------------------------------------------------- reveal */

export function observeReveals(root = document) {
  const items = root.querySelectorAll(".reveal:not(.is-visible)");
  if (!items.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  items.forEach((item) => observer.observe(item));
}

/* ------------------------------------------------------------- count-up */

function formatNumber(value, decimals) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function observeCounters(root = document) {
  const counters = root.querySelectorAll("[data-count]");
  const run = (el) => {
    const target = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    if (reduceMotion) {
      el.textContent = formatNumber(target, decimals);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatNumber(target * eased, decimals);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        run(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------------- setup */

async function mount(name, loader) {
  try {
    const module = await loader();
    await module.mount();
  } catch (error) {
    console.error(`[jarvis] ${name} failed to mount`, error);
  }
}

async function init() {
  setupNav();
  await Promise.all([
    mount("hero", () => import("./hero.js")),
    mount("theater", () => import("./theater.js")),
    mount("figures", () => import("./figures.js")),
    mount("charts", () => import("./charts.js")),
  ]);
  observeReveals();
  observeCounters();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
