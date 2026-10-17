
/*
 BOOSTBALL INTRO v5
 Close-up typography -> camera movement -> full title drop
 Fast grayscale counter -> purple/blue 100 reveal
 Plays once per tab session
*/

(() => {
  "use strict";

  const KEY = "boostball-intro-v5-seen";

  try {
    if (sessionStorage.getItem(KEY) === "1") return;
  } catch (e) {}

  if (document.getElementById("bbAnimeIntro")) return;

  const reduced = matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const root = document.createElement("div");
  root.id = "bbAnimeIntro";

  root.innerHTML = `
    <div class="bb-world" id="bbWorld">
      <div class="bb-closeups" id="bbCloseups"></div>

      <div class="bb-full-logo" id="bbFullLogo">
        <div class="bb-top">LOADING</div>

        <div class="bb-logo-body">
          <div class="bb-number" id="bbNumber">
            <span id="bbN1">0</span><span id="bbN2">0</span><span id="bbN3">0</span>
            <small>%</small>
          </div>

          <div class="bb-words">
            <div class="bb-boost">BOOST</div>
            <div class="bb-ball">BALL</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bb-flash" id="bbFlash"></div>
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
        #fff 0%,
        #f0f4ff 70%,
        #dce5ff 100%
      );
      font-family: Impact, "Arial Black", Arial, sans-serif;
      pointer-events: all;
      isolation: isolate;
      transition: opacity .4s ease;
    }

    #bbAnimeIntro * {
      box-sizing: border-box;
    }

    #bbAnimeIntro .bb-world {
      position: absolute;
      inset: 0;
      transform-origin: center;
      will-change: transform;
    }

    /* CLOSE-UP LETTER SEQUENCE */

    #bbAnimeIntro .bb-closeups {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    #bbAnimeIntro .bb-close-letter {
      position: absolute;
      left: 50%;
      top: 50%;
      font-size: clamp(360px, 92vw, 1450px);
      font-weight: 1000;
      line-height: .75;
      letter-spacing: -.12em;
      color: #6926be;
      -webkit-text-stroke: 7px white;
      paint-order: stroke fill;
      filter: drop-shadow(8px 12px 0 #397ff7);
      opacity: 0;
      white-space: nowrap;
      transform-origin: center;
      will-change: transform, opacity;
    }

    #bbAnimeIntro .bb-close-letter.blue {
      color: #397ff7;
      filter: drop-shadow(8px 12px 0 #6926be);
    }

    #bbAnimeIntro .bb-close-letter.enter {
      animation: bbCloseEnter .4s
        cubic-bezier(.12,.85,.18,1.1) forwards;
    }

    @keyframes bbCloseEnter {
      0% {
        opacity: 1;
        transform:
          translate(
            calc(-50% + var(--start-x)),
            calc(-50% + var(--start-y))
          )
          rotate(var(--angle))
          scale(1.65);
      }

      72% {
        opacity: 1;
        transform:
          translate(
            calc(-50% + var(--end-x)),
            calc(-50% + var(--end-y))
          )
          rotate(var(--angle))
          scale(.95);
      }

      85% {
        transform:
          translate(
            calc(-50% + var(--end-x)),
            calc(-50% + var(--end-y))
          )
          rotate(var(--angle))
          scale(1.04);
      }

      100% {
        opacity: 1;
        transform:
          translate(
            calc(-50% + var(--end-x)),
            calc(-50% + var(--end-y))
          )
          rotate(var(--angle))
          scale(1);
      }
    }

    #bbAnimeIntro .bb-close-letter.leave {
      opacity: 0;
      transition: opacity .12s;
    }

    /* CAMERA MOVEMENT */

    #bbAnimeIntro .bb-world.camera-left {
      animation: bbCameraLeft .5s ease-out both;
    }

    #bbAnimeIntro .bb-world.camera-right {
      animation: bbCameraRight .5s ease-out both;
    }

    #bbAnimeIntro .bb-world.camera-up {
      animation: bbCameraUp .5s ease-out both;
    }

    @keyframes bbCameraLeft {
      from {
        transform: translate(16vw, -5vh)
          rotate(7deg) scale(1.4);
      }
      to {
        transform: translate(-7vw, 2vh)
          rotate(-4deg) scale(1.12);
      }
    }

    @keyframes bbCameraRight {
      from {
        transform: translate(-16vw, 7vh)
          rotate(-8deg) scale(1.4);
      }
      to {
        transform: translate(7vw, -2vh)
          rotate(4deg) scale(1.12);
      }
    }

    @keyframes bbCameraUp {
      from {
        transform: translate(5vw, 14vh)
          rotate(9deg) scale(1.45);
      }
      to {
        transform: translate(-3vw, -5vh)
          rotate(-3deg) scale(1.1);
      }
    }

    #bbAnimeIntro .bb-world.shake {
      animation: bbShake .18s linear both;
    }

    @keyframes bbShake {
      0% { transform: translate(0,0); }
      20% { transform: translate(-5px,3px); }
      40% { transform: translate(4px,-3px); }
      60% { transform: translate(-3px,2px); }
      80% { transform: translate(2px,-1px); }
      100% { transform: translate(0,0); }
    }

    /* FINAL TITLE COMPOSITION */

    #bbAnimeIntro .bb-full-logo {
      position: absolute;
      left: 50%;
      top: 50%;
      width: min(96vw, 1500px);
      opacity: 0;
      transform:
        translate(-50%, -180vh)
        rotate(-8deg) scale(1.35);
      filter: drop-shadow(0 7px 2px #5671a633);
    }

    #bbAnimeIntro .bb-full-logo.drop {
      animation: bbFullDrop .72s
        cubic-bezier(.14,.82,.2,1.05) forwards;
    }

    @keyframes bbFullDrop {
      0% {
        opacity: 1;
        transform:
          translate(-50%, -180vh)
          rotate(-8deg) scale(1.35);
      }
      68% {
        transform:
          translate(-50%, -43%)
          rotate(2deg) scale(1.04,.9);
      }
      82% {
        transform:
          translate(-50%, -55%)
          rotate(-1deg) scale(.98,1.04);
      }
      100% {
        opacity: 1;
        transform:
          translate(-50%, -50%)
          rotate(-2deg) scale(1);
      }
    }

    #bbAnimeIntro .bb-top {
      font-size: clamp(40px, 9vw, 145px);
      font-weight: 1000;
      letter-spacing: -.07em;
      line-height: .95;
      margin-left: 8%;
      margin-bottom: -1%;
      color: #6926be;
      -webkit-text-stroke: 5px white;
      paint-order: stroke fill;
    }

    #bbAnimeIntro .bb-logo-body {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1%;
    }

    #bbAnimeIntro .bb-number {
      display: flex;
      align-items: baseline;
      flex: 0 0 auto;
      font-size: clamp(85px, 22vw, 350px);
      font-weight: 1000;
      line-height: .9;
      letter-spacing: -.11em;
      font-variant-numeric: tabular-nums;
      color: #222;
      transform-origin: center;
    }

    #bbAnimeIntro .bb-number span {
      display: inline-block;
      -webkit-text-stroke: 6px white;
      paint-order: stroke fill;
    }

    #bbAnimeIntro .bb-number span:nth-child(2),
    #bbAnimeIntro .bb-number span:nth-child(3) {
      color: #888;
    }

    #bbAnimeIntro .bb-number small {
      font-size: .27em;
      letter-spacing: 0;
      margin-left: .08em;
      color: #444;
      -webkit-text-stroke: 3px white;
      paint-order: stroke fill;
    }

    #bbAnimeIntro .bb-number.complete {
      animation: bbPop .35s
        cubic-bezier(.15,1.4,.2,1) both;
    }

    #bbAnimeIntro .bb-number.complete span:first-child,
    #bbAnimeIntro .bb-number.complete small {
      color: #6926be;
    }

    #bbAnimeIntro .bb-number.complete span:nth-child(2),
    #bbAnimeIntro .bb-number.complete span:nth-child(3) {
      color: #397ff7;
    }

    @keyframes bbPop {
      0% { transform: scale(1); }
      50% { transform: scale(1.12) rotate(-2deg); }
      75% { transform: scale(.97) rotate(1deg); }
      100% { transform: scale(1); }
    }

    #bbAnimeIntro .bb-words {
      display: flex;
      flex: 1;
      min-width: 0;
      flex-direction: column;
      align-items: flex-start;
      font-weight: 1000;
      line-height: .85;
    }

    #bbAnimeIntro .bb-boost,
    #bbAnimeIntro .bb-ball {
      white-space: nowrap;
      font-size: clamp(42px, 10.5vw, 170px);
      letter-spacing: -.08em;
      -webkit-text-stroke: 5px white;
      paint-order: stroke fill;
    }

    #bbAnimeIntro .bb-boost {
      color: #6926be;
    }

    #bbAnimeIntro .bb-ball {
      color: #397ff7;
      margin-left: 5%;
      font-size: clamp(45px, 11.2vw, 185px);
    }

    /* FLASH AND EXIT */

    #bbAnimeIntro .bb-flash {
      position: absolute;
      inset: 0;
      background: white;
      opacity: 0;
      pointer-events: none;
      z-index: 10;
    }

    #bbAnimeIntro .bb-flash.hit {
      animation: bbFlash .14s ease-out;
    }

    @keyframes bbFlash {
      from { opacity: .22; }
      to { opacity: 0; }
    }

    #bbAnimeIntro.exit {
      opacity: 0;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      #bbAnimeIntro .bb-closeups {
        display: none;
      }
      #bbAnimeIntro .bb-full-logo {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
      #bbAnimeIntro .bb-world,
      #bbAnimeIntro .bb-number {
        animation: none !important;
      }
    }
  `;

  document.head.appendChild(css);
  document.body.appendChild(root);

  const $ = selector => root.querySelector(selector);
  const world = $("#bbWorld");
  const closeups = $("#bbCloseups");
  const logo = $("#bbFullLogo");
  const number = $("#bbNumber");
  const flash = $("#bbFlash");

  const timers = [];
  let frameId = 0;

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function animateClass(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function shake() {
    if (reduced) return;

    world.className = "bb-world";
    animateClass(world, "shake");
    animateClass(flash, "hit");
  }

  function cameraMove(index) {
    if (reduced) return;

    const movements = [
      "camera-left",
      "camera-right",
      "camera-up"
    ];

    world.className = "bb-world";
    animateClass(world, movements[index % 3]);
  }

  /*
   Close-up sequence:
   The camera moves across enormous characters.
   Each one lands, shakes the screen,
   then gives way to the next shot.
  */

  const shots = [
    ["L", "-35vw", "-65vh", "-15vw", "-8vh", "-12deg"],
    ["O", "35vw", "-70vh", "8vw", "-8vh", "9deg"],
    ["A", "-40vw", "-60vh", "-10vw", "-5vh", "-8deg"],
    ["D", "40vw", "-65vh", "8vw", "-8vh", "12deg"],
    ["I", "-35vw", "-65vh", "-12vw", "-8vh", "-10deg"],
    ["N", "35vw", "-65vh", "8vw", "-8vh", "8deg"],
    ["G", "-40vw", "-65vh", "-10vw", "-8vh", "-12deg"]
  ];

  function showShot(shot, index, time) {
    later(() => {
      closeups.textContent = "";

      const [letter, sx, sy, ex, ey, angle] = shot;
      const span = document.createElement("span");

      span.className =
        "bb-close-letter" +
        (index % 2 ? " blue" : "");

      span.textContent = letter;

      span.style.setProperty("--start-x", sx);
      span.style.setProperty("--start-y", sy);
      span.style.setProperty("--end-x", ex);
      span.style.setProperty("--end-y", ey);
      span.style.setProperty("--angle", angle);

      closeups.appendChild(span);

      cameraMove(index);
      animateClass(span, "enter");

      later(shake, 275);
      later(() => span.classList.add("leave"), 440);
    }, time);
  }

  function setCount(value) {
    const digits = String(value).padStart(3, "0");

    $("#bbN1").textContent = digits[0];
    $("#bbN2").textContent = digits[1];
    $("#bbN3").textContent = digits[2];
  }

  function countUp() {
    const start = performance.now();
    const duration = 420;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const value = Math.min(99, Math.floor(t * 100));

      setCount(value);

      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setCount(100);
        number.classList.add("complete");
        shake();
      }
    }

    frameId = requestAnimationFrame(tick);
  }

  function finish() {
    root.classList.add("exit");

    later(() => {
      cancelAnimationFrame(frameId);
      timers.forEach(clearTimeout);
      root.remove();
      css.remove();
    }, 450);
  }

  if (reduced) {
    setCount(100);
    number.classList.add("complete");
    later(finish, 950);
  } else {
    shots.forEach((shot, index) => {
      showShot(shot, index, 100 + index * 370);
    });

    // Final full-title drop.
    later(() => {
      closeups.textContent = "";
      world.className = "bb-world";
      logo.classList.add("drop");
      later(shake, 475);
    }, 2870);

    // Very fast grayscale counter.
    later(countUp, 3760);

    // Hold the completed purple/blue title.
    later(finish, 4900);
  }

  try {
    sessionStorage.setItem(KEY, "1");
  } catch (e) {}
})();
