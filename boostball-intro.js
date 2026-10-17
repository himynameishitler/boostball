
/*
 BOOSTBALL ANIME INTRO v4
 Camera sweeps + letter impacts + final title slam
 Fast monochrome 000-100 counter
 Purple/blue reveal at 100
 Once per tab session
*/

(() => {
  "use strict";

  const SESSION_KEY = "boostball-intro-v4";
  const reduced = matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  try {
    if (sessionStorage.getItem(SESSION_KEY) === "played") {
      return;
    }
  } catch (e) {
    console.warn("Intro storage unavailable", e);
  }

  if (document.getElementById("bbAnimeIntro")) return;

  const root = document.createElement("div");
  root.id = "bbAnimeIntro";

  root.innerHTML = `
    <div class="bb-camera" id="bbCamera">
      <div class="bb-backdrop"></div>
      <div class="bb-flying-letters" id="bbFlying"></div>

      <div class="bb-title" id="bbFinalTitle">
        <div class="bb-loading" id="bbLoading"></div>

        <div class="bb-title-main">
          <div class="bb-count" id="bbCount">
            <span id="bbDigit1">0</span><span id="bbDigit2">0</span><span id="bbDigit3">0</span>
            <small>%</small>
          </div>

          <div class="bb-title-name">
            <div class="bb-boost" id="bbBoost"></div>
            <div class="bb-ball" id="bbBall"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="bb-impact-flash" id="bbFlash"></div>
  `;

  const css = document.createElement("style");

  css.textContent = `
    #bbAnimeIntro {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      overflow: hidden;
      background: #edf2ff;
      font-family: Impact, "Arial Black", Arial, sans-serif;
      isolation: isolate;
      pointer-events: all;
      transition: opacity .4s ease;
    }

    #bbAnimeIntro * {
      box-sizing: border-box;
    }

    #bbAnimeIntro .bb-camera {
      position: absolute;
      inset: 0;
      transform-origin: center;
      will-change: transform;
    }

    #bbAnimeIntro .bb-backdrop {
      position: absolute;
      inset: -30%;
      background:
        radial-gradient(
          ellipse at center,
          #fff 0%,
          #f0f4ff 55%,
          #d7e2ff 100%
        );
    }

    /* CAMERA SWEEPS */

    #bbAnimeIntro .bb-camera.sweep-left {
      animation: bbSweepLeft .42s ease-out both;
    }

    #bbAnimeIntro .bb-camera.sweep-right {
      animation: bbSweepRight .42s ease-out both;
    }

    #bbAnimeIntro .bb-camera.sweep-tilt {
      animation: bbSweepTilt .42s ease-out both;
    }

    @keyframes bbSweepLeft {
      from {
        transform: translate(15vw, -8vh)
          rotate(8deg) scale(1.35);
      }
      to {
        transform: translate(-5vw, 3vh)
          rotate(-4deg) scale(1.12);
      }
    }

    @keyframes bbSweepRight {
      from {
        transform: translate(-15vw, 9vh)
          rotate(-9deg) scale(1.4);
      }
      to {
        transform: translate(5vw, -3vh)
          rotate(4deg) scale(1.12);
      }
    }

    @keyframes bbSweepTilt {
      from {
        transform: translate(6vw, 12vh)
          rotate(12deg) scale(1.45);
      }
      to {
        transform: translate(-4vw, -3vh)
          rotate(-5deg) scale(1.1);
      }
    }

    /* CAMERA IMPACT */

    #bbAnimeIntro .bb-camera.impact {
      animation: bbCameraImpact .23s linear both;
    }

    @keyframes bbCameraImpact {
      0% { transform: translate(0,0) rotate(0); }
      18% { transform: translate(-7px,4px) rotate(-.4deg); }
      35% { transform: translate(6px,-4px) rotate(.35deg); }
      55% { transform: translate(-4px,2px); }
      75% { transform: translate(2px,-1px); }
      100% { transform: translate(0,0) rotate(0); }
    }

    /* INDIVIDUAL GIANT LETTERS */

    #bbAnimeIntro .bb-flying-letters {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    #bbAnimeIntro .bb-fly {
      position: absolute;
      left: 50%;
      top: 50%;
      font-size: clamp(220px, 48vw, 740px);
      font-weight: 1000;
      line-height: .8;
      letter-spacing: -.1em;
      color: #6426b9;
      -webkit-text-stroke: 5px white;
      paint-order: stroke fill;
      filter: drop-shadow(7px 9px 0 #344a88);
      opacity: 0;
      transform:
        translate(-50%, -190vh)
        rotate(-18deg) scale(1.7);
      pointer-events: none;
    }

    #bbAnimeIntro .bb-fly.blue {
      color: #387ef4;
      filter: drop-shadow(7px 9px 0 #6d32b9);
    }

    #bbAnimeIntro .bb-fly.land {
      animation: bbFlyLand .42s
        cubic-bezier(.13,.85,.2,1.1) forwards;
    }

    #bbAnimeIntro .bb-fly.leave {
      animation: bbFlyLeave .2s ease-in forwards;
    }

    @keyframes bbFlyLand {
      0% {
        opacity: 1;
        transform:
          translate(-50%, -190vh)
          rotate(-18deg) scale(1.7);
      }
      70% {
        opacity: 1;
        transform:
          translate(-50%, -46%)
          rotate(5deg) scale(1.08);
      }
      84% {
        transform:
          translate(-50%, -54%)
          rotate(-2deg) scale(.96);
      }
      100% {
        opacity: 1;
        transform:
          translate(-50%, -50%)
          rotate(0) scale(1);
      }
    }

    @keyframes bbFlyLeave {
      from {
        opacity: 1;
        transform: translate(-50%,-50%) scale(1);
      }
      to {
        opacity: 0;
        transform:
          translate(-85%,-30%)
          rotate(-14deg) scale(1.7);
      }
    }

    /* FINAL COMPOSITION */

    #bbAnimeIntro .bb-title {
      position: absolute;
      left: 50%;
      top: 50%;
      width: min(96vw, 1450px);
      transform:
        translate(-50%, -180vh)
        rotate(-7deg) scale(1.3);
      opacity: 0;
      will-change: transform;
    }

    #bbAnimeIntro .bb-title.drop {
      animation: bbTitleDrop .65s
        cubic-bezier(.16,.82,.23,1.04) forwards;
    }

    @keyframes bbTitleDrop {
      0% {
        opacity: 1;
        transform:
          translate(-50%, -180vh)
          rotate(-7deg) scale(1.3);
      }
      67% {
        transform:
          translate(-50%, -43%)
          rotate(2deg) scale(1.05,.89);
      }
      80% {
        transform:
          translate(-50%, -55%)
          rotate(-1deg) scale(.98,1.05);
      }
      100% {
        opacity: 1;
        transform:
          translate(-50%, -50%)
          rotate(-2deg) scale(1);
      }
    }

    #bbAnimeIntro .bb-loading {
      display: flex;
      justify-content: flex-start;
      margin-left: 8%;
      margin-bottom: -1%;
      font-size: clamp(38px, 8.3vw, 135px);
      line-height: .95;
    }

    #bbAnimeIntro .bb-title-main {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1%;
    }

    #bbAnimeIntro .bb-count {
      display: flex;
      align-items: baseline;
      flex: 0 0 auto;
      font-size: clamp(85px, 22vw, 340px);
      font-weight: 1000;
      line-height: .88;
      letter-spacing: -.11em;
      color: #444;
      font-variant-numeric: tabular-nums;
      transform-origin: center;
    }

    #bbAnimeIntro .bb-count span {
      display: inline-block;
      -webkit-text-stroke:
        clamp(2px,.6vw,9px) white;
      paint-order: stroke fill;
    }

    #bbAnimeIntro .bb-count span:nth-child(2),
    #bbAnimeIntro .bb-count span:nth-child(3) {
      color: #888;
    }

    #bbAnimeIntro .bb-count small {
      font-size: .27em;
      letter-spacing: 0;
      margin-left: .1em;
      color: #555;
      -webkit-text-stroke: 3px white;
      paint-order: stroke fill;
    }

    #bbAnimeIntro .bb-count.complete {
      animation: bbHundredPop .38s
        cubic-bezier(.14,1.4,.25,1) both;
    }

    #bbAnimeIntro .bb-count.complete span:first-child,
    #bbAnimeIntro .bb-count.complete small {
      color: #6926be;
    }

    #bbAnimeIntro .bb-count.complete span:nth-child(2),
    #bbAnimeIntro .bb-count.complete span:nth-child(3) {
      color: #387ff7;
    }

    @keyframes bbHundredPop {
      0% { transform: scale(1); }
      45% { transform: scale(1.13) rotate(-2deg); }
      75% { transform: scale(.97) rotate(1deg); }
      100% { transform: scale(1); }
    }

    #bbAnimeIntro .bb-title-name {
      display: flex;
      flex: 1;
      min-width: 0;
      flex-direction: column;
      align-items: flex-start;
    }

    #bbAnimeIntro .bb-boost,
    #bbAnimeIntro .bb-ball {
      display: flex;
      white-space: nowrap;
      font-size: clamp(42px, 10.4vw, 165px);
      font-weight: 1000;
      line-height: .86;
    }

    #bbAnimeIntro .bb-ball {
      margin-left: 5%;
      font-size: clamp(46px, 11.2vw, 178px);
    }

    #bbAnimeIntro .bb-letter {
      display: inline-block;
      -webkit-text-stroke:
        clamp(2px,.6vw,9px) white;
      paint-order: stroke fill;
      filter: drop-shadow(2px 4px 0 #ffffff);
    }

    #bbAnimeIntro .bb-letter.purple {
      color: #6926be;
    }

    #bbAnimeIntro .bb-letter.blue {
      color: #387ff7;
    }

    /* IMPACT FLASH */

    #bbAnimeIntro .bb-impact-flash {
      position: absolute;
      inset: 0;
      background: white;
      opacity: 0;
      pointer-events: none;
      z-index: 10;
    }

    #bbAnimeIntro .bb-impact-flash.hit {
      animation: bbFlash .16s ease-out;
    }

    @keyframes bbFlash {
      0% { opacity: .26; }
      100% { opacity: 0; }
    }

    #bbAnimeIntro.exit {
      opacity: 0;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      #bbAnimeIntro .bb-camera,
      #bbAnimeIntro .bb-title,
      #bbAnimeIntro .bb-count {
        animation: none !important;
      }

      #bbAnimeIntro .bb-title {
        opacity: 1;
        transform: translate(-50%,-50%);
      }

      #bbAnimeIntro .bb-flying-letters {
        display: none;
      }
    }
  `;

  document.head.appendChild(css);
  document.body.appendChild(root);

  const $ = selector => root.querySelector(selector);
  const camera = $("#bbCamera");
  const flying = $("#bbFlying");
  const flash = $("#bbFlash");
  const title = $("#bbFinalTitle");
  const count = $("#bbCount");

  const timers = [];
  let counterFrame = 0;

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function restartAnimation(element, name) {
    element.classList.remove(name);
    void element.offsetWidth;
    element.classList.add(name);
  }

  function addWord(id, word, firstBlue = false) {
    const parent = $(id);

    [...word].forEach((letter, i) => {
      const span = document.createElement("span");
      const blue = (i % 2 === 0) === firstBlue;

      span.className =
        `bb-letter ${blue ? "blue" : "purple"}`;
      span.textContent = letter;
      parent.appendChild(span);
    });
  }

  addWord("#bbLoading", "LOADING");
  addWord("#bbBoost", "BOOST");
  addWord("#bbBall", "BALL", true);

  function impact(strength = 1) {
    if (reduced) return;

    // Camera shake, followed by a white impact flash.
    camera.classList.remove(
      "sweep-left", "sweep-right", "sweep-tilt"
    );

    restartAnimation(camera, "impact");

    if (strength > .5) {
      restartAnimation(flash, "hit");
    }
  }

  function cameraSweep(index) {
    if (reduced) return;

    const sweeps = [
      "sweep-left",
      "sweep-right",
      "sweep-tilt"
    ];

    camera.classList.remove(
      "impact", ...sweeps
    );

    restartAnimation(
      camera,
      sweeps[index % sweeps.length]
    );
  }

  function flyLetter(letter, index, start) {
    later(() => {
      flying.textContent = "";

      const span = document.createElement("span");
      span.className =
        `bb-fly ${index % 2 ? "blue" : ""}`;
      span.textContent = letter;

      flying.appendChild(span);

      cameraSweep(index);
      restartAnimation(span, "land");

      // The impact happens as the letter reaches the frame.
      later(() => impact(.7), 275);

      later(() => {
        span.classList.remove("land");
        restartAnimation(span, "leave");
      }, 455);
    }, start);
  }

  function setCounter(value) {
    const digits = String(value).padStart(3, "0");

    $("#bbDigit1").textContent = digits[0];
    $("#bbDigit2").textContent = digits[1];
    $("#bbDigit3").textContent = digits[2];
  }

  function windCounter() {
    const start = performance.now();
    const duration = 570; // Very fast wind-up.

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);

      // Rapid acceleration, then a sharp final snap.
      const eased = t < .8
        ? .82 * Math.pow(t / .8, 1.45)
        : .82 + .18 *
          (1 - Math.pow((1 - t) / .2, 2));

      const value = Math.min(
        99,
        Math.floor(eased * 100)
      );

      setCounter(value);

      if (t < 1) {
        counterFrame = requestAnimationFrame(frame);
      } else {
        setCounter(100);
        count.classList.add("complete");
        impact(1);
      }
    }

    counterFrame = requestAnimationFrame(frame);
  }

  function finish() {
    root.classList.add("exit");

    later(() => {
      cancelAnimationFrame(counterFrame);
      timers.forEach(clearTimeout);
      root.remove();
      css.remove();
    }, 450);
  }

  // =====================================================
  // TIMELINE
  // =====================================================

  if (reduced) {
    setCounter(100);
    count.classList.add("complete");
    later(finish, 900);
  } else {
    // Close-up letters with camera sweeps.
    const sequence = [
      "B", "O", "O", "S", "T",
      "B", "A", "L", "L"
    ];

    sequence.forEach((letter, i) => {
      flyLetter(letter, i, 120 + i * 290);
    });

    // Camera returns to centre for the full-title impact.
    later(() => {
      flying.textContent = "";
      camera.className = "bb-camera";
      title.classList.add("drop");

      // Full composition lands.
      later(() => impact(1), 425);
    }, 2850);

    // Counter starts monochrome and winds rapidly.
    later(windCounter, 3670);

    // Hold the completed logo briefly.
    later(finish, 5050);
  }

  try {
    sessionStorage.setItem(SESSION_KEY, "played");
  } catch (e) {
    console.warn("Unable to save intro session", e);
  }
})();
