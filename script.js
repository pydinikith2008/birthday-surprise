"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);

  // THE PASSWORD for the first (winter) scene. Change it here any time.
  const PASSWORD = "2326";

  // SCENES (order matters!)
  // 0 gate (password), 1 intro, 2 letter, 3 scrapbook, 4 timeline,
  // 5 counters, 6 finale, 7 final surprise
  const scenes = [
    $("#gate-scene"),
    $("#intro"),
    $("#letter-scene"),
    $("#scrapbook-scene"),
    $("#timeline-scene"),
    $("#counter-scene"),
    $("#finale-scene"),
    $("#particle-surprise-scene")
  ];

  const GATE = 0;
  const INTRO = 1;
  const LETTER = 2;
  const SCRAPBOOK = 3;
  const TIMELINE = 4;
  const COUNTER = 5;
  const FINALE = 6;
  const SURPRISE = 7;

  if (scenes.some((scene) => !scene)) {
    console.error("A required scene is missing from index.html.");
    return;
  }

  // LETTER
  const letterStage = $(".letter-stage");
  const typedMessage = $("#typed-message");
  const typingCursor = $("#typing-cursor");
  const openLetterButton = $("#open-letter-btn");
  const continueLetterButton = $("#continue-letter-btn");

  const letterText =
    "I hope you always remember how special you are. " +
    "You bring little moments of happiness into the world just by being yourself.\n\n" +
    "If I could wish one beautiful thing for you, it would be that your days are filled " +
    "with kindness, your dreams keep growing, and you always have reasons to smile.\n\n" +
    "Tonight, beneath this golden moon, I hope you feel celebrated, appreciated, " +
    "and surrounded by all the love you deserve.";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let currentScene = 0;
  let letterOpened = false;
  let typingTimer = null;
  let typingToken = 0;
  const photoUrls = [];

  // MUSIC
  const music = $("#background-music");
  const musicToggle = $("#music-toggle");
  const musicIcon = $("#music-icon");
  const musicLabel = $("#music-label");

  // SURPRISE STATE
  let surpriseToken = 0;
  let surpriseTimers = [];
  let surpriseFrame = null;
  let surpriseResizeHandler = null;

  // --------------------------------------------------
  // BACKGROUND DECORATIONS
  // --------------------------------------------------

  function createStars() {
    const container = $("#stars");
    if (!container) return;
    container.replaceChildren();

    for (let i = 0; i < 130; i++) {
      const star = document.createElement("span");
      star.className = "star" + (Math.random() > 0.84 ? " large" : "");
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--duration", `${2 + Math.random() * 4}s`);
      star.style.setProperty("--delay", `${Math.random() * -5}s`);
      container.appendChild(star);
    }
  }

  function createHearts() {
    const container = $("#floating-hearts");
    if (!container) return;
    container.replaceChildren();
    const symbols = ["♡", "♥", "ღ", "✧"];

    for (let i = 0; i < 38; i++) {
      const heart = document.createElement("span");
      heart.className = "heart-particle";
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.top = `${60 + Math.random() * 50}%`;
      heart.style.setProperty("--size", `${12 + Math.random() * 21}px`);
      heart.style.setProperty("--duration", `${10 + Math.random() * 11}s`);
      heart.style.setProperty("--delay", `${Math.random() * -22}s`);
      heart.style.setProperty("--drift", `${-50 + Math.random() * 100}px`);
      container.appendChild(heart);
    }
  }

  function createMagicParticles(container, count) {
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      particle.className = "magic-particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${45 + Math.random() * 50}%`;
      particle.style.setProperty("--size", `${2 + Math.random() * 4}px`);
      particle.style.setProperty("--duration", `${2.5 + Math.random() * 3}s`);
      particle.style.setProperty("--delay", `${Math.random() * -5}s`);
      container.appendChild(particle);
    }
  }

  function createBirthdayHearts(finale) {
    if (!finale) return;
    finale.querySelectorAll(".birthday-heart").forEach((heart) => heart.remove());

    for (let i = 0; i < 26; i++) {
      const heart = document.createElement("span");
      heart.className = "birthday-heart";
      heart.textContent = Math.random() > 0.5 ? "♡" : "♥";
      heart.style.left = `${Math.random() * 94 + 3}%`;
      heart.style.setProperty("--heart-size", `${14 + Math.random() * 22}px`);
      heart.style.setProperty("--heart-duration", `${4 + Math.random() * 3}s`);
      heart.style.animationDelay = `${Math.random() * 2}s`;
      finale.appendChild(heart);
    }
  }

  function createFinaleSparkles() {
    const container = $("#finale-sparkles");
    if (!container) return;

    container.replaceChildren();
    createMagicParticles(container, 70);

    const symbols = ["✧", "♡", "✦", "⋆", "♥"];

    for (let i = 0; i < 44; i++) {
      const sparkle = document.createElement("span");
      sparkle.className = "finale-sparkle";
      sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.setProperty("--size", `${12 + Math.random() * 18}px`);
      sparkle.style.setProperty("--duration", `${3 + Math.random() * 4}s`);
      sparkle.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(sparkle);
    }
  }

  // winter lock screen: rose-gold stars, pink bokeh and romantic snowfall
  function createGateDecor() {
    const stars = $("#gate-stars");
    const snow = $("#gate-snow");
    const bokeh = $("#gate-bokeh");

    if (stars) {
      stars.replaceChildren();
      for (let i = 0; i < 80; i++) {
        const star = document.createElement("span");
        star.className = "gate-star";
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 70}%`;
        star.style.setProperty("--s", `${1.5 + Math.random() * 2.5}px`);
        star.style.setProperty("--duration", `${2 + Math.random() * 4}s`);
        star.style.setProperty("--delay", `${Math.random() * -5}s`);
        stars.appendChild(star);
      }
    }

    if (bokeh) {
      bokeh.replaceChildren();
      for (let i = 0; i < 14; i++) {
        const dot = document.createElement("span");
        const size = 36 + Math.random() * 110;
        dot.className = "bokeh";
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.top = `${20 + Math.random() * 75}%`;
        dot.style.setProperty("--duration", `${10 + Math.random() * 10}s`);
        dot.style.setProperty("--delay", `${Math.random() * -14}s`);
        dot.style.setProperty("--drift", `${-40 + Math.random() * 80}px`);
        bokeh.appendChild(dot);
      }
    }

    if (snow) {
      snow.replaceChildren();
      for (let i = 0; i < 120; i++) {
        const flake = document.createElement("span");
        const roll = Math.random();
        const near = Math.random() > 0.72;          // bigger, softer, faster flakes in front
        const size = near ? 8 + Math.random() * 9 : 2 + Math.random() * 5;
        let cls = "snowflake";

        if (roll > 0.9) { cls += " glyph love"; flake.textContent = "♡"; }
        else if (roll > 0.74) { cls += " glyph"; flake.textContent = "❄"; }

        flake.className = cls;
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.setProperty("--s", `${cls.includes("glyph") ? size + 6 : size}px`);
        flake.style.setProperty("--o", `${near ? 0.8 + Math.random() * 0.2 : 0.45 + Math.random() * 0.4}`);
        flake.style.setProperty("--b", `${near && !cls.includes("glyph") ? 1.4 : 0}px`);
        flake.style.setProperty("--duration", `${near ? 7 + Math.random() * 5 : 11 + Math.random() * 10}s`);
        flake.style.setProperty("--delay", `${Math.random() * -20}s`);
        flake.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
        flake.style.setProperty("--sway", `${(Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 30)}px`);
        snow.appendChild(flake);
      }
    }
  }

  // live clock + "together for" shown on the winter scene
  // (safe to keep: it does nothing when those elements are not in the page)
  function startGateClock() {
    const clock = $("#gate-clock");
    const live = $("#gate-since-live");
    if (!clock) return;

    const start = live ? new Date(live.dataset.start).getTime() : NaN;
    const fmt = new Intl.DateTimeFormat(undefined, {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
      hour: "numeric", minute: "2-digit", second: "2-digit"
    });

    const tick = () => {
      if (currentScene !== GATE) return;
      clock.textContent = fmt.format(new Date());
      if (live && !isNaN(start)) {
        const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
        const d = Math.floor(s / 86400);
        const hh = String(Math.floor((s % 86400) / 3600)).padStart(2, "0");
        const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        live.textContent = ` · ${d} days ${hh}:${mm}:${ss}`;
      }
    };

    tick();
    setInterval(tick, 1000);
  }

  // tiny hearts floating upward when the lock opens
  function spawnGateHearts() {
    const box = $("#gate-hearts");
    if (!box) return;

    const symbols = ["♡", "♥", "❤", "✧"];

    for (let i = 0; i < 38; i++) {
      const heart = document.createElement("span");
      heart.className = "gate-heart";
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      heart.style.setProperty("--x", `${15 + Math.random() * 70}%`);
      heart.style.setProperty("--s", `${14 + Math.random() * 22}px`);
      heart.style.setProperty("--d", `${2.4 + Math.random() * 1.8}s`);
      heart.style.setProperty("--dl", `${Math.random() * 1.4}s`);
      heart.style.setProperty("--dx", `${-90 + Math.random() * 180}px`);
      heart.style.setProperty("--r", `${-25 + Math.random() * 50}deg`);
      box.appendChild(heart);
      setTimeout(() => heart.remove(), 6000);
    }
  }

  // romantic extras for the final scene (bokeh + petals + rising hearts)
  function createSurpriseDecor() {
    const bokeh = $("#surprise-bokeh");
    const petals = $("#surprise-petals");
    const hearts = $("#surprise-hearts");

    if (bokeh) {
      bokeh.replaceChildren();
      for (let i = 0; i < 18; i++) {
        const dot = document.createElement("span");
        const size = 40 + Math.random() * 130;
        dot.className = "bokeh";
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.top = `${Math.random() * 100}%`;
        dot.style.setProperty("--duration", `${10 + Math.random() * 10}s`);
        dot.style.setProperty("--delay", `${Math.random() * -14}s`);
        dot.style.setProperty("--drift", `${-40 + Math.random() * 80}px`);
        bokeh.appendChild(dot);
      }
    }

    if (petals) {
      petals.replaceChildren();
      for (let i = 0; i < 22; i++) {
        const petal = document.createElement("span");
        petal.className = "petal";
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.setProperty("--w", `${9 + Math.random() * 9}px`);
        petal.style.setProperty("--duration", `${9 + Math.random() * 8}s`);
        petal.style.setProperty("--delay", `${Math.random() * -16}s`);
        petal.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
        petals.appendChild(petal);
      }
    }

    if (hearts) {
      hearts.replaceChildren();
      const symbols = ["♡", "♥", "❤", "✧"];
      for (let i = 0; i < 30; i++) {
        const heart = document.createElement("span");
        heart.className = "s-heart";
        heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.setProperty("--size", `${14 + Math.random() * 24}px`);
        heart.style.setProperty("--duration", `${9 + Math.random() * 9}s`);
        heart.style.setProperty("--delay", `${Math.random() * -16}s`);
        heart.style.setProperty("--drift", `${-60 + Math.random() * 120}px`);
        hearts.appendChild(heart);
      }
    }
  }

  // --------------------------------------------------
  // LIVE COUNTERS (years, months, days, hours, minutes, seconds, milliseconds)
  // --------------------------------------------------

  function initCounters() {
    const cards = document.querySelectorAll(".counter-card");
    if (!cards.length) return;

    const units = [
      ["years", "Years"],
      ["months", "Months"],
      ["days", "Days"],
      ["hours", "Hours"],
      ["minutes", "Minutes"],
      ["seconds", "Seconds"],
      ["ms", "Millis"]
    ];

    const sparkleSymbols = ["✦", "✧", "♡", "⋆"];
    const items = [];

    cards.forEach((card) => {
      const start = new Date(card.dataset.start);
      const grid = card.querySelector(".counter-grid");
      const sparkleBox = card.querySelector(".counter-sparkles");
      if (!grid || Number.isNaN(start.getTime())) return;

      grid.replaceChildren();
      const nums = {};

      units.forEach(([key, label]) => {
        const cell = document.createElement("div");
        cell.className = "counter-unit" + (key === "ms" ? " counter-ms" : "");

        const num = document.createElement("span");
        num.className = "counter-num";
        num.textContent = "0";

        const text = document.createElement("span");
        text.className = "counter-label";
        text.textContent = label;

        cell.append(num, text);
        grid.appendChild(cell);
        nums[key] = num;
      });

      if (sparkleBox) {
        sparkleBox.replaceChildren();
        for (let i = 0; i < 14; i++) {
          const sparkle = document.createElement("span");
          sparkle.className = "counter-sparkle";
          sparkle.textContent = sparkleSymbols[Math.floor(Math.random() * sparkleSymbols.length)];
          sparkle.style.left = `${Math.random() * 96}%`;
          sparkle.style.top = `${Math.random() * 90}%`;
          sparkle.style.setProperty("--s", `${9 + Math.random() * 12}px`);
          sparkle.style.setProperty("--d", `${3 + Math.random() * 4}s`);
          sparkle.style.setProperty("--dl", `${Math.random() * -6}s`);
          sparkleBox.appendChild(sparkle);
        }
      }

      items.push({ start, nums, last: {} });
    });

    // exact calendar difference between two dates
    function diff(start, now) {
      if (now < start) {
        return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 };
      }

      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();
      let hours = now.getHours() - start.getHours();
      let minutes = now.getMinutes() - start.getMinutes();
      let seconds = now.getSeconds() - start.getSeconds();
      let ms = now.getMilliseconds() - start.getMilliseconds();

      if (ms < 0) { ms += 1000; seconds--; }
      if (seconds < 0) { seconds += 60; minutes--; }
      if (minutes < 0) { minutes += 60; hours--; }
      if (hours < 0) { hours += 24; days--; }
      if (days < 0) {
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        months--;
      }
      if (months < 0) { months += 12; years--; }

      return { years, months, days, hours, minutes, seconds, ms };
    }

    const pad2 = (n) => String(n).padStart(2, "0");
    const pad3 = (n) => String(n).padStart(3, "0");

    function format(key, value) {
      if (key === "years") return String(value);
      if (key === "ms") return pad3(value);
      return pad2(value);
    }

    let lastRun = 0;

    function tick(time) {
      requestAnimationFrame(tick);

      // only runs while the counter scene is on screen
      const counterScene = $("#counter-scene");
      if (!counterScene || counterScene.hidden) return;

      // calmer update (once a second) for people who prefer reduced motion
      if (reducedMotion && time - lastRun < 1000) return;
      lastRun = time;

      const now = new Date();

      items.forEach((item) => {
        const values = diff(item.start, now);

        Object.keys(values).forEach((key) => {
          const text = format(key, values[key]);
          if (item.last[key] === text) return;
          item.last[key] = text;

          const el = item.nums[key];
          el.textContent = text;

          // little pop on every new second
          if (key === "seconds" && !reducedMotion && el.animate) {
            el.animate(
              [
                { transform: "scale(1.16)", textShadow: "0 0 26px #ffffff" },
                { transform: "scale(1)" }
              ],
              { duration: 380, easing: "ease-out" }
            );
          }
        });
      });
    }

    requestAnimationFrame(tick);
  }

  // --------------------------------------------------
  // LETTER ANIMATION
  // --------------------------------------------------

  function typeLetter() {
    clearTimeout(typingTimer);

    const token = ++typingToken;
    let position = 0;

    typedMessage.textContent = "";
    typingCursor.hidden = false;
    continueLetterButton.hidden = true;

    if (reducedMotion) {
      typedMessage.textContent = letterText;
      typingCursor.hidden = true;
      continueLetterButton.hidden = false;
      return;
    }

    function typeNextCharacter() {
      if (token !== typingToken) return;

      if (position >= letterText.length) {
        typingCursor.hidden = true;
        continueLetterButton.hidden = false;
        return;
      }

      const character = letterText[position++];
      typedMessage.textContent += character;

      let delay = 27;
      if (character === "\n") delay = 220;
      else if (".,!?:;".includes(character)) delay = 190;

      typingTimer = setTimeout(typeNextCharacter, delay);
    }

    typeNextCharacter();
  }

  function openLetter() {
    if (letterOpened) return;
    letterOpened = true;

    letterStage.classList.add("opened");
    openLetterButton.hidden = true;

    createMagicParticles($("#magic-particles"), 40);

    typingTimer = setTimeout(typeLetter, reducedMotion ? 0 : 800);
  }

  // --------------------------------------------------
  // FINAL SURPRISE: DENSE PINK MATRIX RAIN + PARTICLE COUNTDOWN WORDS + CLEAR PARTICLE HEART
  // --------------------------------------------------

  function stopParticleSurprise() {
    surpriseToken++;
    surpriseTimers.forEach((timer) => clearTimeout(timer));
    surpriseTimers = [];

    if (surpriseFrame !== null) {
      cancelAnimationFrame(surpriseFrame);
      surpriseFrame = null;
    }

    if (surpriseResizeHandler) {
      window.removeEventListener("resize", surpriseResizeHandler);
      surpriseResizeHandler = null;
    }
  }

  function startParticleSurprise() {
    const scene = $("#particle-surprise-scene");
    const matrixCanvas = $("#surprise-matrix-canvas");
    const heartCanvas = $("#surprise-heart-canvas");
    const replayButton = $("#surprise-replay-btn");
    const homeButton = $("#surprise-home-btn");

    if (!scene || !matrixCanvas || !heartCanvas) return;

    stopParticleSurprise();
    const token = surpriseToken;

    const matrix = matrixCanvas.getContext("2d");
    const ctx = heartCanvas.getContext("2d");
    if (!matrix || !ctx) return;

    // show only the surprise scene
    scenes.forEach((item, index) => {
      item.hidden = index !== SURPRISE;
      item.classList.remove("active");
    });
    scene.hidden = false;
    scene.classList.add("active");
    currentScene = SURPRISE;
    scene.classList.remove("surprise-revealed", "heart-clear");
    replayButton.hidden = true;
    homeButton.hidden = true;

    createSurpriseDecor();

    // ----- state -----
    let width = 1, height = 1, columns = 1;
    const fontSize = 11;                       // small characters = dense rain like the video
    const characters = "0101010101<3".split("");
    let drops = [];
    let speeds = [];
    let particles = [];
    let heartMode = false;
    let particlesOn = false;   // particles appear when the first number starts
    let currentLabel = "3";
    let haloAlpha = 0;         // soft dark glow behind the particles
    let haloTarget = 0;
    let lastRain = 0;

    function schedule(callback, delay) {
      const timer = setTimeout(() => {
        if (token === surpriseToken && !scene.hidden) callback();
      }, delay);
      surpriseTimers.push(timer);
    }

    function resize() {
      const rect = scene.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      [matrixCanvas, heartCanvas].forEach((canvas) => {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      });
      matrix.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      columns = Math.ceil(width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -height / fontSize);
      speeds = Array.from({ length: columns }, () => 0.55 + Math.random() * 0.9);
    }

    // ----- heart points -----

    function rawHeartPoints() {
      const pts = [];

      function heartAt(t) {
        return {
          x: 16 * Math.pow(Math.sin(t), 3),
          y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
        };
      }

      // a crisp bright outline...
      for (let i = 0; i < 1500; i++) {
        const p = heartAt(Math.random() * Math.PI * 2);
        pts.push({ x: p.x * 11 + (Math.random() - 0.5) * 0.5, y: p.y * 11 + (Math.random() - 0.5) * 0.5, edge: true });
      }

      // ...and a softer, evenly spread fill inside it (random points kept only if inside the heart)
      const poly = [];
      for (let i = 0; i < 240; i++) poly.push(heartAt((i / 240) * Math.PI * 2));

      function inside(x, y) {
        let hit = false;
        for (let i = 0, k = poly.length - 1; i < poly.length; k = i++) {
          const a = poly[i], b = poly[k];
          if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
        }
        return hit;
      }

      let filled = 0;
      while (filled < 1500) {
        const x = (Math.random() * 2 - 1) * 16;
        const y = -13 + Math.random() * 30;
        if (inside(x, y)) {
          pts.push({ x: x * 11, y: y * 11, edge: false });
          filled++;
        }
      }

      return pts;
    }

    function rawTextPoints(text) {
      const off = document.createElement("canvas");
      off.width = 900;
      off.height = 400;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return rawHeartPoints();

      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      const fs = text.length === 1 ? 300 : text.length <= 3 ? 210 : 150;
      o.font = `900 ${fs}px Arial, Helvetica, sans-serif`;
      o.fillText(text, 450, 210);

      const data = o.getImageData(0, 0, 900, 400).data;
      const pts = [];
      const gap = 4;
      for (let y = 0; y < 400; y += gap) {
        for (let x = 0; x < 900; x += gap) {
          if (data[(y * 900 + x) * 4 + 3] > 128) pts.push({ x, y });
        }
      }
      return pts.length ? pts : rawHeartPoints();
    }

    function fitPoints(points, maxScale) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      points.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      const pw = maxX - minX || 1;
      const ph = maxY - minY || 1;
      const scale = Math.min((width * 0.72) / pw, (height * 0.45) / ph, maxScale);
      const cx = width / 2;
      const cy = height / 2 - 20;

      return points.map((p) => ({
        x: cx + (p.x - (minX + maxX) / 2) * scale + (Math.random() - 0.5) * 2,
        y: cy + (p.y - (minY + maxY) / 2) * scale + (Math.random() - 0.5) * 2,
        edge: Boolean(p.edge)
      }));
    }

    function setTargets(label) {
      currentLabel = label;
      heartMode = label === "HEART";

      const fitted = heartMode
        ? fitPoints(rawHeartPoints(), 1.7)
        : fitPoints(rawTextPoints(label), 1.6);

      particles.forEach((particle) => {
        const pt = fitted[Math.floor(Math.random() * fitted.length)];
        particle.tx = pt.x;
        particle.ty = pt.y;

        if (heartMode) {
          particle.edge = pt.edge;
          particle.color = pt.edge ? (Math.random() > 0.35 ? "#ffd9ea" : "#ffffff") : "#ff4f9d";
          particle.size = pt.edge ? 1.5 + Math.random() * 0.7 : 1.1 + Math.random() * 0.6;
          particle.speed = 0.06 + Math.random() * 0.07;
        } else {
          particle.edge = false;
          particle.color = Math.random() > 0.3 ? "#ffe3f0" : "#ffffff";
          particle.size = particle.baseSize;
          particle.speed = 0.06 + Math.random() * 0.07;
        }
      });
    }

    function scatterTargets() {
      heartMode = false;
      haloTarget = 0;
      particles.forEach((p) => {
        p.tx = Math.random() * width;
        p.ty = Math.random() * height;
        p.speed = 0.12 + Math.random() * 0.1;
      });
    }

    // ----- init particles (they form the numbers, the words and the heart) -----

    resize();
    const count = width < 700 ? 1800 : 2600;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      tx: width / 2,
      ty: height / 2,
      size: 0,
      baseSize: 0,
      edge: false,
      speed: 0.06 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
      color: "#ff4f9d"
    }));

    particles.forEach((particle) => {
      particle.baseSize = Math.random() * 1.8 + 1.1;
      particle.size = particle.baseSize;
    });

    // ----- drawing -----

    function drawMatrix() {
      // long fading trails, background stays visible
      matrix.globalCompositeOperation = "destination-out";
      matrix.fillStyle = "rgba(0, 0, 0, 0.075)";
      matrix.fillRect(0, 0, width, height);
      matrix.globalCompositeOperation = "source-over";

      matrix.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        const r = Math.random();

        if (r > 0.9) matrix.fillStyle = "rgba(255, 235, 245, 0.95)";      // bright sparkle
        else if (r > 0.45) matrix.fillStyle = "rgba(255, 64, 142, 0.95)"; // hot pink
        else matrix.fillStyle = "rgba(255, 140, 190, 0.85)";               // soft pink

        const row = Math.floor(drops[i]);
        matrix.fillText(char, i * fontSize, row * fontSize);

        drops[i] += speeds[i];
        if (drops[i] * fontSize > height && Math.random() > 0.96) {
          drops[i] = Math.random() * -12;
        }
      }
    }

    function draw() {
      if (token !== surpriseToken || scene.hidden) return;

      const now = performance.now();

      if (now - lastRain >= 40) {
        lastRain = now;
        drawMatrix();
      }

      ctx.clearRect(0, 0, width, height);

      if (particlesOn) {
        const cx = width / 2;
        const cy = height / 2 - 20;

        // soft dark glow behind the particles so they stay clear over the rain
        haloAlpha += (haloTarget - haloAlpha) * 0.06;
        if (haloAlpha > 0.01) {
          const radius = Math.min(width, height) * (heartMode ? 0.66 : 0.5);
          const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          glow.addColorStop(0, `rgba(20, 2, 30, ${haloAlpha})`);
          glow.addColorStop(1, "rgba(20, 2, 30, 0)");
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, width, height);
        }

        const pulse = heartMode ? 1 + Math.sin(now / 420) * 0.014 : 1;
        const drift = heartMode ? 0.35 : 2.2;

        particles.forEach((particle) => {
          let tx = particle.tx;
          let ty = particle.ty;
          if (heartMode) {
            tx = cx + (tx - cx) * pulse;
            ty = cy + (ty - cy) * pulse;
          }

          particle.x += (tx - particle.x) * particle.speed;
          particle.y += (ty - particle.y) * particle.speed;

          ctx.globalAlpha = heartMode
            ? (particle.edge ? 1 : 0.85)
            : 0.7 + Math.sin(now / 420 + particle.phase) * 0.3;
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = heartMode ? (particle.edge ? 7 : 3) : 12;
          ctx.shadowColor = heartMode ? "#ff2d95" : "#ffb3d6";
          ctx.beginPath();
          ctx.arc(
            particle.x + Math.sin(now / 630 + particle.phase) * drift,
            particle.y + Math.cos(now / 790 + particle.phase) * drift,
            particle.size, 0, Math.PI * 2
          );
          ctx.fill();
        });

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      surpriseFrame = requestAnimationFrame(draw);
    }

    surpriseFrame = requestAnimationFrame(draw);

    // ----- timeline (slower, so every number is clearly visible) -----
    // rain first, then 3 -> 2 -> 1 -> You -> Are -> My -> Love -> heart

    const plan = [
      ["3", 3400],
      ["2", 3400],
      ["1", 3400],
      ["You", 2800],
      ["Are", 2800],
      ["My", 2800],
      ["Love", 3000]
    ];

    const SCATTER = 500; // quick scatter before the next one forms

    let t = 1800; // a moment of just the rain at the start
    plan.forEach(([label, duration]) => {
      const start = t;
      schedule(() => {
        particlesOn = true;
        haloTarget = 0.5;
        setTargets(label);
      }, start);
      schedule(scatterTargets, start + duration - SCATTER);
      t += duration;
    });

    const heartAt = t;
    schedule(() => {
      haloTarget = 0.8;
      scene.classList.add("heart-clear");
      setTargets("HEART");
    }, heartAt);

    schedule(() => scene.classList.add("surprise-revealed"), heartAt + 1500);
    schedule(() => {
      replayButton.hidden = false;
      homeButton.hidden = false;
    }, heartAt + 3200);

    surpriseResizeHandler = () => {
      if (token !== surpriseToken) return;
      resize();
      setTargets(currentLabel);
    };
    window.addEventListener("resize", surpriseResizeHandler);
  }

  // --------------------------------------------------
  // SCENE NAVIGATION
  // --------------------------------------------------

  // romantic heart transition: a heart blooms until it fills the screen,
  // then opens like a heart-shaped window onto the next scene
  let transitioning = false;

  function burstTransitionSparkles() {
    const box = $(".rt-sparkles");
    if (!box) return;

    box.replaceChildren();
    const symbols = ["♥", "♡", "♥", "✦", "✧", "❀"];
    const colors = ["#ffc6dc", "#ffffff", "#ffd9a8", "#ff9cc5", "#ffe3f0"];

    for (let i = 0; i < 42; i++) {
      const bit = document.createElement("span");
      bit.className = "rt-bit";
      bit.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      bit.style.setProperty("--x", `${Math.random() * 96}%`);
      bit.style.setProperty("--y", `${35 + Math.random() * 60}%`);
      bit.style.setProperty("--s", `${14 + Math.random() * 24}px`);
      bit.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
      bit.style.setProperty("--d", `${1.3 + Math.random() * 1.1}s`);
      bit.style.setProperty("--dl", `${Math.random() * 0.5}s`);
      bit.style.setProperty("--dx", `${-60 + Math.random() * 120}px`);
      bit.style.setProperty("--r", `${-30 + Math.random() * 60}deg`);
      box.appendChild(bit);
    }
  }

  function runTransition(swap) {
    if (transitioning) return;

    const overlay = $("#scene-transition");
    if (!overlay || reducedMotion) {
      swap();
      window.scrollTo(0, 0);
      return;
    }

    transitioning = true;
    overlay.classList.remove("opening");
    overlay.classList.add("active", "closing");

    // the heart fills the screen (0.95s), then the scene changes behind it
    setTimeout(() => {
      swap();
      window.scrollTo(0, 0);

      overlay.classList.remove("closing");
      overlay.classList.add("opening");
      burstTransitionSparkles();

      // the heart-shaped window opens onto the next scene
      setTimeout(() => {
        overlay.classList.remove("active", "opening");
        transitioning = false;
      }, 1350);
    }, 1000);
  }

  function showSceneNow(index) {
    if (index < 0 || index >= scenes.length || index === currentScene) return;

    const previous = scenes[currentScene];
    const next = scenes[index];
    if (!previous || !next) return;

    if (currentScene === SURPRISE && index !== SURPRISE) stopParticleSurprise();

    previous.hidden = true;
    previous.classList.remove("active");

    next.hidden = false;
    next.classList.remove("active");
    void next.offsetWidth;
    next.classList.add("active");

    currentScene = index;

    if (index === FINALE) {
      createFinaleSparkles();
      createBirthdayHearts($("#finale-scene"));
    }
  }

  function showScene(index) {
    if (index === currentScene) return;
    runTransition(() => showSceneNow(index));
  }

  // --------------------------------------------------
  // WINTER LOCK SCREEN (password 2326)
  // --------------------------------------------------

  let unlocking = false;

  function unlockGate() {
    const gate = scenes[GATE];
    const flash = $("#unlock-flash");
    const input = $("#gate-input");
    const error = $("#gate-error");

    unlocking = true;
    if (error) error.textContent = "";
    if (input) input.blur();
    document.querySelectorAll(".key").forEach((key) => { key.disabled = true; });

    // snow glows, golden doorway opens, hearts float up
    gate.classList.add("unlocked");
    spawnGateHearts();
    music?.play().catch(() => {});

    // golden light fills the screen...
    setTimeout(() => flash?.classList.add("on"), 1900);

    // ...the winter scene dissolves into your first scene
    setTimeout(() => {
      showSceneNow(INTRO);
      flash?.classList.remove("on");
    }, 2600);

    setTimeout(() => {
      gate.classList.remove("unlocked");
      unlocking = false;
      if (gateInput) gateInput.value = "";
      updateDots();
      document.querySelectorAll(".key").forEach((key) => { key.disabled = false; });
    }, 4200);
  }

  // ----- cute keypad -----
  const gateInput = $("#gate-input");
  const gateDots = document.querySelectorAll("#gate-dots i");
  const gateForm = $("#gate-form");
  let autoCheck = null;

  function updateDots() {
    const length = gateInput ? gateInput.value.length : 0;
    gateDots.forEach((dot, index) => dot.classList.toggle("filled", index < length));
  }

  function wrongCode() {
    const error = $("#gate-error");
    const card = $(".gate-card");

    if (error) error.textContent = "Hmm, that's not it… try again ♡";
    if (card) {
      card.classList.remove("shake");
      void card.offsetWidth;
      card.classList.add("shake");
    }

    setTimeout(() => {
      if (gateInput) gateInput.value = "";
      updateDots();
    }, 450);
  }

  function checkCode() {
    clearTimeout(autoCheck);
    if (unlocking || !gateInput) return;

    if (gateInput.value === PASSWORD) {
      updateDots();
      unlockGate();
    } else if (gateInput.value.length > 0) {
      wrongCode();
    }
  }

  function pressKey(key) {
    if (unlocking || !gateInput) return;

    const error = $("#gate-error");
    if (error) error.textContent = "";

    if (key === "back") {
      gateInput.value = gateInput.value.slice(0, -1);
    } else if (/^\d$/.test(key) && gateInput.value.length < PASSWORD.length) {
      gateInput.value += key;
    }

    updateDots();

    if (gateInput.value.length === PASSWORD.length) {
      clearTimeout(autoCheck);
      autoCheck = setTimeout(checkCode, 260);
    }
  }

  document.querySelectorAll(".key[data-key]").forEach((button) => {
    button.addEventListener("click", () => pressKey(button.dataset.key));
  });

  gateForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    checkCode();
  });

  // she can also type on a computer keyboard
  document.addEventListener("keydown", (event) => {
    if (currentScene !== GATE || unlocking) return;

    if (/^\d$/.test(event.key)) {
      pressKey(event.key);
      const button = document.querySelector(`.key[data-key="${event.key}"]`);
      if (button) {
        button.classList.add("pressed");
        setTimeout(() => button.classList.remove("pressed"), 140);
      }
    } else if (event.key === "Backspace") {
      pressKey("back");
    } else if (event.key === "Enter") {
      event.preventDefault();
      checkCode();
    }
  });

  function restartNow() {
    clearTimeout(typingTimer);
    typingToken++;
    stopParticleSurprise();

    scenes.forEach((scene, index) => {
      scene.hidden = index !== INTRO;
      scene.classList.remove("active");
    });
    scenes[INTRO].classList.add("active");

    currentScene = INTRO;
    letterOpened = false;

    letterStage.classList.remove("opened");
    typedMessage.textContent = "";
    typingCursor.hidden = false;
    openLetterButton.hidden = false;
    continueLetterButton.hidden = true;

    scenes[SURPRISE].classList.remove("surprise-revealed", "heart-clear");
    $("#surprise-replay-btn").hidden = true;
    $("#surprise-home-btn").hidden = true;

    window.scrollTo(0, 0);
  }

  function restartEverything() {
    runTransition(restartNow);
  }

  // --------------------------------------------------
  // BUTTONS
  // --------------------------------------------------

  // (music also starts when she unlocks the winter scene)
  $("#begin-btn")?.addEventListener("click", () => {
    showScene(LETTER);
    music?.play().catch(() => {});
  });

  openLetterButton?.addEventListener("click", openLetter);
  continueLetterButton?.addEventListener("click", () => showScene(SCRAPBOOK));
  $("#to-timeline-btn")?.addEventListener("click", () => showScene(TIMELINE));
  $("#to-counter-btn")?.addEventListener("click", () => showScene(COUNTER));
  $("#to-finale-btn")?.addEventListener("click", () => showScene(FINALE));

  $("#reveal-surprise-btn")?.addEventListener("click", () => {
    runTransition(startParticleSurprise);
  });
  $("#surprise-replay-btn")?.addEventListener("click", startParticleSurprise);

  $("#replay-btn")?.addEventListener("click", restartEverything);
  $("#surprise-home-btn")?.addEventListener("click", restartEverything);

  // --------------------------------------------------
  // SCRAPBOOK PHOTO PREVIEWS (old photo picker; does nothing if those inputs are gone)
  // --------------------------------------------------

  for (let i = 1; i <= 3; i++) {
    const input = $(`#photo${i}`);
    const preview = $(`#preview${i}`);
    if (!input || !preview) continue;

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please choose an image file.");
        input.value = "";
        return;
      }

      if (file.size > 12 * 1024 * 1024) {
        alert("Please choose an image smaller than 12 MB.");
        input.value = "";
        return;
      }

      if (photoUrls[i]) URL.revokeObjectURL(photoUrls[i]);

      const url = URL.createObjectURL(file);
      photoUrls[i] = url;
      preview.src = url;
      preview.hidden = false;

      const placeholder = input.closest("label")?.querySelector(".photo-placeholder");
      if (placeholder) placeholder.hidden = true;
    });
  }

  // --------------------------------------------------
  // ROMANTIC SCRAPBOOK: tap a love note, it turns and reveals the photo
  // --------------------------------------------------

  function burstMemoryHearts(card) {
    const box = card.querySelector(".mc-burst");
    if (!box) return;

    const symbols = ["♥", "♡", "♥", "✦", "✧", "♥"];
    const colors = ["#ff8fbf", "#ffc2dc", "#ffffff", "#ffd9a8", "#ff6fa5"];

    for (let i = 0; i < 18; i++) {
      const bit = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * 120;

      bit.className = "mc-pop";
      bit.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      bit.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      bit.style.setProperty("--dy", `${Math.sin(angle) * distance - 40}px`);
      bit.style.setProperty("--r", `${-40 + Math.random() * 80}deg`);
      bit.style.setProperty("--s", `${12 + Math.random() * 18}px`);
      bit.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
      bit.style.setProperty("--dl", `${0.25 + Math.random() * 0.35}s`);
      box.appendChild(bit);
      setTimeout(() => bit.remove(), 2800);
    }
  }

  document.querySelectorAll(".memory-card").forEach((card) => {
    const img = card.querySelector(".mc-photo img");
    const markMissing = () => card.classList.add("no-photo");

    if (img) {
      img.addEventListener("error", markMissing);
      if (img.complete && img.naturalWidth === 0) markMissing();
    }

    card.addEventListener("click", () => {
      const open = card.classList.toggle("flipped");
      card.setAttribute("aria-pressed", String(open));
      if (open) burstMemoryHearts(card);
    });
  });

  // --------------------------------------------------
  // MUSIC CONTROL
  // --------------------------------------------------

  function updateMusicUI(playing) {
    if (musicIcon) musicIcon.textContent = playing ? "♫" : "♪";
    if (musicLabel) musicLabel.textContent = playing ? "Pause music" : "Play music";
    if (musicToggle) musicToggle.setAttribute("aria-pressed", String(playing));
  }

  musicToggle?.addEventListener("click", async () => {
    if (!music) return;

    if (music.paused) {
      try {
        await music.play();
        updateMusicUI(true);
      } catch (error) {
        console.error("Music could not play:", error);
        alert("Check that music.mp3 is in your project folder.");
      }
    } else {
      music.pause();
      updateMusicUI(false);
    }
  });

  music?.addEventListener("play", () => updateMusicUI(true));
  music?.addEventListener("pause", () => updateMusicUI(false));

  // --------------------------------------------------
  // INITIALISE
  // --------------------------------------------------

  createGateDecor();
  startGateClock();
  createStars();
  createHearts();
  createMagicParticles($("#magic-particles"), 65);
  initCounters();
  updateMusicUI(Boolean(music && !music.paused));

  window.addEventListener("pagehide", () => {
    clearTimeout(typingTimer);
    stopParticleSurprise();
    photoUrls.forEach((url) => url && URL.revokeObjectURL(url));
  });
});