
/*
  BOOSTBALL INTRO v6
  Anime-style typography opening

  - Vertical letter impacts
  - Camera pans and subtle screen shake
  - Centred final title drop
  - Fast 0 -> 100 counter, no leading zeros
  - Monochrome counter turns purple/blue at 100
  - Once per tab session
*/

(() => {
  "use strict";

  const SESSION_KEY = "boostball-intro-v6-played";

  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
  } catch (error) {
    console.warn("Intro session storage unavailable:", error);
  }

  if (document.getElementById("bbAnimeIntro")) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const root = document.createElement("div");
  root.id = "bbAnimeIntro";
  root.setAttribute("aria-label", "Boostball loading intro");

  root.innerHTML = `
    <div class="bb-stage">
      <div class="bb-camera" id="bbIntroCamera">
        <div class="bb-closeups" id="bbIntroCloseups"></div>
      </div>

      <div class="bb-logo-position">
        <div class="bb-final-logo" id="bbIntroLogo">
          <div class="bb-loading-title">LOADING</div>

          <div class="bb-logo-main">
            <div class="bb-counter" id="bbIntroCounter">
              <span id="bbIntroNumber">0</span><small>%</small>
            </div>

            <div class="bb-game-name">
              <div class="bb-boost-title">BOOST</div>
              <div class="bb-ball-title">BALL</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bb-impact-overlay" id="bbIntroImpact"></div>
  `;

  const css = document.createElement("style");

  css.textContent = `
    #bbAnimeIntro {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      overflow: hidden;
      background: radial-gradient(
        ellipse at center,
        #ffffff 0%,
        #f1f5ff 65%,
        #dce5ff 100%
      );
      font-family: Impact, "Arial Black", Arial, sans-serif;
      isolation: isolate;
      pointer-events: auto;
      opacity: 1;
      transition: opacity .4s ease;
    }

    #bbAnimeIntro * {
      box-sizing: border-box;
    }

    #bbAnimeIntro .bb-stage {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    /* CAMERA AND CLOSE-UP LETTERS */

    #bbAnimeIntro .bb-camera {
      position: absolute;
      inset: 0;
      transform-origin: center;
      will-change: transform;
    }

    #bbAnimeIntro .bb-closeups {
      position: absolute;
      inset: 0;
    }

    #bbAnimeIntro .bb-close-letter {
      position: absolute;
      left: 50%;
      top: 50%;
      font-size: clamp(300px, 82vw, 1250px);
      font-weight: 1000;
      line-height: .8;
      white-space: nowrap;
      color: #6926be;
      -webkit-text-stroke: clamp(4px, .8vw, 10px) #fff;
      paint-order: stroke fill;
      filter: drop-shadow(8px 10px 0 #397ff7);
      opacity: 0;
      transform:
        translate(-50%, -150vh)
        rotate(var(--letter-rotation, 0deg));
      transform-origin: center;
      will-change: transform, opacity;
    }

    #bbAnimeIntro .bb-close-letter.blue {
      color: #397ff7;
      filter: drop-shadow(8px 10px 0 #6926be);
    }

    #bbAnimeIntro .bb-close-letter.land {
      animation: bbLetterImpact .36s
        cubic-bezier(.65, 0, .95, .4) forwards;
    }

    @keyframes bbLetterImpact {
      0% {
        opacity: 1;
        transform:
          translate(
            calc(-50% + var(--letter-x)),
            -150vh
          )
          rotate(var(--letter-rotation))
          scale(1.14);
      }

      67% {
        opacity: 1;
        transform:
          translate(
            calc(-50% + var(--letter-x)),
            calc(-50% + var(--letter-y))
          )
          rotate(var(--letter-rotation))
          scale(1.08, .84);
      }

      82% {
        transform:
          translate(
            calc(-50% + var(--letter-x)),
            calc(-50% + var(--letter-y) - 12px)
          )
          rotate(var(--letter-rotation))
          scale(.98, 1.05);
      }

      100% {
        opacity: 1;
        transform:
          translate(
            calc(-50% + var(--letter-x)),
            calc(-50% + var(--letter-y))
          )
          rotate(var(--letter-rotation))
          scale(1);
      }
    }

    #bbAnimeIntro .bb-close-letter.leave {
      opacity: 0;
      transition: opacity .1s ease;
    }

    /* CAMERA PAN */

    #bbAnimeIntro .bb-camera.pan-left {
      animation: bbPanLeft .48s ease-out both;
    }

    #bbAnimeIntro .bb-camera.pan-right {
      animation: bbPanRight .48s ease-out both;
    }

    #bbAnimeIntro .bb-camera.pan-up {
      animation: bbPanUp .48s ease-out both;
    }

    @keyframes bbPanLeft {
      from {
        transform: translate(12vw, -4vh)
          rotate(5deg) scale(1.22);
      }
      to {
        transform: translate(-4vw, 2vh)
          rotate(-2deg) scale(1.06);
      }
    }

    @keyframes bbPanRight {
      from {
        transform: translate(-12vw, 5vh)
          rotate(-5deg) scale(1.22);
      }
      to {
        transform: translate(4vw, -2vh)
          rotate(2deg) scale(1.06);
      }
    }

    @keyframes bbPanUp {
      from {
        transform: translate(3vw, 10vh)
          rotate(5deg) scale(1.25);
      }
      to {
        transform: translate(-2vw, -3vh)
          rotate(-2deg) scale(1.06);
      }
    }

    /* SHAKE THE VIEWPORT, NOT THE LOGO POSITION */

    #bbAnimeIntro .bb-stage.shake {
      animation: bbStageShake .2s linear;
    }

    @keyframes bbStageShake {
      0% { transform: translate(0, 0); }
      18% { transform: translate(-6px, 4px); }
      35% { transform: translate(5px, -3px); }
      55% { transform: translate(-3px, 2px); }
      75% { transform: translate(2px, -1px); }
      100% { transform: translate(0, 0); }
    }

    /* FINAL LOGO CENTRING */

    #bbAnimeIntro .bb-logo-position {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      pointer-events: none;
    }

    #bbAnimeIntro .bb-final-logo {
      width: min(94vw, 1160px);
      opacity: 0;
      transform: translateY(-150vh) scale(1.12);
      transform-origin: center;
      will-change: transform, opacity;
    }

    #bbAnimeIntro .bb-final-logo.drop {
      animation: bbLogoDrop .68s
        cubic-bezier(.15,.8,.2,1.05) forwards;
    }

    @keyframes bbLogoDrop {
      0% {
        opacity: 1;
        transform: translateY(-150vh) scale(1.12);
      }

      68% {
        transform: translateY(12px) scale(1.03, .91);
      }

      82% {
        transform: translateY(-10px) scale(.98, 1.04);
      }

      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* LOADING TITLE */

    #bbAnimeIntro .bb-loading-title {
      margin-left: 6%;
      margin-bottom: -.01em;
      font-size: clamp(34px, 7.5vw, 105px);
      line-height: .9;
      letter-spacing: -.035em;
      font-weight: 1000;
      color: #6926be;
      -webkit-text-stroke: clamp(2px,.5vw,6px) #fff;
      paint-order: stroke fill;
      filter: drop-shadow(2px 4px 0 #397ff7);
    }

    /* 100% + BOOST BALL */

    #bbAnimeIntro .bb-logo-main {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5%;
      width: 100%;
    }

    #bbAnimeIntro .bb-counter {
      display: flex;
      align-items: baseline;
      justify-content: flex-end;
      flex: 0 0 49%;
      min-width: 0;
      font-size: clamp(76px, 19vw, 260px);
      font-weight: 1000;
      line-height: .92;
      letter-spacing: -.09em;
      font-variant-numeric: tabular-nums;
      color: #222;
      transform-origin: center;
      white-space: nowrap;
    }

    #bbAnimeIntro #bbIntroNumber {
      display: inline-block;
      color: #555;
      -webkit-text-stroke: clamp(2px,.55vw,7px) white;
      paint-order: stroke fill;
    }

    #bbAnimeIntro .bb-counter small {
      font-size: .29em;
      letter-spacing: 0;
      margin-left: .1em;
      color: #222;
      -webkit-text-stroke: 3px white;
      paint-order: stroke fill;
    }

    #bbAnimeIntro .bb-counter.complete {
      animation: bbHundredPop .38s
        cubic-bezier(.14,1.3,.25,1) both;
    }

    #bbAnimeIntro .bb-counter.complete #bbIntroNumber {
      color: #397ff7;
    }

    #bbAnimeIntro .bb-counter.complete small {
      color: #6926be;
    }

    @keyframes bbHundredPop {
      0% { transform: scale(1); }
      45% { transform: scale(1.12) rotate(-1deg); }
      75% { transform: scale(.97) rotate(.5deg); }
      100% { transform: scale(1); }
    }

    #bbAnimeIntro .bb-game-name {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      flex: 0 0 49%;
      min-width: 0;
      font-weight: 1000;
      line-height: .85;
      white-space: nowrap;
    }

    #bbAnimeIntro .bb-boost-title,
    #bbAnimeIntro .bb-ball-title {
      font-size: clamp(43px, 9.5vw, 135px);
      letter-spacing: -.055em;
      -webkit-text-stroke: clamp(2px,.5vw,6px) #fff;
      paint-order: stroke fill;
    }

    #bbAnimeIntro .bb-boost-title {
      color: #6926be;
      filter: drop-shadow(2px 4px 0 #397ff7);
    }

    #bbAnimeIntro .bb-ball-title {
      color: #397ff7;
      margin-left: 6%;
      filter: drop-shadow(2px 4px 0 #6926be);
    }

    /* FLASH */

    #bbAnimeIntro .bb-impact-overlay {
      position: absolute;
      inset: 0;
      background: white;
      opacity: 0;
      pointer-events: none;
      z-index: 10;
    }

    #bbAnimeIntro .bb-impact-overlay.hit {
      animation: bbImpactFlash .15s ease-out;
    }

    @keyframes bbImpactFlash {
      from { opacity: .2; }
      to { opacity: 0; }
    }

    #bbAnimeIntro.exit {
      opacity: 0;
      pointer-events: none;
    }

    /* SMALL SCREENS */

    @media (max-width: 650px) {
      #bbAnimeIntro .bb-final-logo {
        width: 98vw;
      }

      #bbAnimeIntro .bb-counter {
        font-size: 20vw;
      }

      #bbAnimeIntro .bb-boost-title,
      #bbAnimeIntro .bb-ball-title {
        font-size: 10vw;
      }

      #bbAnimeIntro .bb-loading-title {
        font-size: 8vw;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #bbAnimeIntro .bb-closeups {
        display: none;
      }

      #bbAnimeIntro .bb-final-logo {
        opacity: 1;
        transform: none;
      }

      #bbAnimeIntro .bb-stage,
      #bbAnimeIntro .bb-camera,
      #bbAnimeIntro .bb-counter {
        animation: none !important;
      }
    }
  `;

  document.head.appendChild(css);
  document.body.appendChild(root);

  const $ = selector => root.querySelector(selector);

  const stage = $(".bb-stage");
  const camera = $("#bbIntroCamera");
  const closeups = $("#bbIntroCloseups");
  const logo = $("#bbIntroLogo");
  const counter = $("#bbIntroCounter");
  const flash = $("#bbIntroImpact");

  const timers = [];
  let counterFrame = 0;
  let finished = false;

  function later(callback, delay) {
    const id = setTimeout(callback, delay);
    timers.push(id);
    return id;
  }

  function restartAnimation(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function impact(strong = false) {
    if (reducedMotion) return;

    restartAnimation(stage, "shake");

    if (strong) {
      restartAnimation(flash, "hit");
    }
  }

  function panCamera(index) {
    if (reducedMotion) return;

    const classes = ["pan-left", "pan-right", "pan-up"];

    camera.classList.remove(...classes);
    void camera.offsetWidth;
    camera.classList.add(classes[index % classes.length]);
  }

  /*
    Letter shots:
    Each character falls vertically.
    The camera pans between close-ups.
  */

  const shots = [
    { char: "L", x: "-13vw", y: "-8vh", angle: "-6deg" },
    { char: "O", x: "8vw", y: "-6vh", angle: "5deg" },
    { char: "A", x: "-10vw", y: "-4vh", angle: "-4deg" },
    { char: "D", x: "7vw", y: "-8vh", angle: "6deg" },
    { char: "I", x: "-7vw", y: "-4vh", angle: "-3deg" },
    { char: "N", x: "7vw", y: "-6vh", angle: "4deg" },
    { char: "G", x: "-10vw", y: "-5vh", angle: "-5deg" }
  ];

  function showLetter(shot, index) {
    closeups.textContent = "";

    const span = document.createElement("span");

    span.className =
      "bb-close-letter" + (index % 2 ? " blue" : "");

    span.textContent = shot.char;
    span.style.setProperty("--letter-x", shot.x);
    span.style.setProperty("--letter-y", shot.y);
    span.style.setProperty("--letter-rotation", shot.angle);

    closeups.appendChild(span);

    panCamera(index);
    restartAnimation(span, "land");

    // The character lands around 67% of 360ms.
    later(() => impact(index % 3 === 0), 240);

    later(() => {
      span.classList.add("leave");
    }, 390);
  }

  function setCount(value) {
    $("#bbIntroNumber").textContent =
      String(Math.max(0, Math.min(100, value)));
  }

  function countUp() {
    const start = performance.now();
    const duration = 450;

    function frame(now) {
      if (finished) return;

      const progress = Math.min(
        1,
        (now - start) / duration
      );

      // Fast count, no leading zeros.
      const value = Math.min(
        99,
        Math.floor(progress * 100)
      );

      setCount(value);

      if (progress < 1) {
        counterFrame = requestAnimationFrame(frame);
      } else {
        setCount(100);
        counter.classList.add("complete");
        impact(true);
      }
    }

    counterFrame = requestAnimationFrame(frame);
  }

  function finish() {
    if (finished) return;
    finished = true;

    root.classList.add("exit");

    later(() => {
      cancelAnimationFrame(counterFrame);
      timers.forEach(clearTimeout);
      root.remove();
      css.remove();
    }, 450);
  }

  // =====================================================
  // ANIMATION TIMELINE
  // =====================================================

  if (reducedMotion) {
    setCount(100);
    counter.classList.add("complete");
    later(finish, 1000);
  } else {
    // Close-up lettering sequence.
    shots.forEach((shot, index) => {
      later(
        () => showLetter(shot, index),
        100 + index * 380
      );
    });

    // Reset the camera and centre the final composition.
    later(() => {
      closeups.textContent = "";
      camera.className = "bb-camera";
      logo.classList.add("drop");

      // Heavy final landing.
      later(() => impact(true), 460);
    }, 2920);

    // Counter races from 0 to 100.
    later(countUp, 3740);

    // Hold the completed purple/blue title.
    later(finish, 4900);
  }

  // Only mark as played after successful setup.
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch (error) {
    console.warn("Could not save intro session:", error);
  }
})();
