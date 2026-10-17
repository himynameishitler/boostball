
/*
  BOOSTBALL — LOADING INTRO
  v3 — Purple / Blue / White

  Plays once per tab session.
  Refreshing skips the intro.
  No external libraries required.
*/

(() => {
  "use strict";

  const SESSION_KEY = "boostball-intro-v3-seen";

  // Skip if already played in this tab.
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      return;
    }
  } catch (error) {
    console.warn("Session storage unavailable:", error);
  }

  if (document.getElementById("bbAnimeIntro")) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // =========================================================
  // CREATE INTRO
  // =========================================================

  const intro = document.createElement("div");
  intro.id = "bbAnimeIntro";

  intro.innerHTML = `
    <div class="bb-scene">
      <div class="bb-logo" aria-label="Boost Ball Loading">

        <div class="bb-loading-line" id="bbLoadingLetters"></div>

        <div class="bb-main-row">
          <div class="bb-number-wrap">
            <span class="bb-digit bb-one">1</span>
            <span class="bb-digit bb-zero-one">0</span>
            <span class="bb-digit bb-zero-two">0</span>
            <span class="bb-percent">%</span>
          </div>

          <div class="bb-name-wrap">
            <div class="bb-boost" id="bbBoostLetters"></div>
            <div class="bb-ball" id="bbBallLetters"></div>
          </div>
        </div>

      </div>
    </div>
  `;

  // =========================================================
  // STYLES
  // =========================================================

  const style = document.createElement("style");

  style.textContent = `
    #bbAnimeIntro {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      overflow: hidden;
      background:
        radial-gradient(
          ellipse at center,
          #f8fbff 0%,
          #e5edff 65%,
          #d3ddfa 100%
        );
      font-family: Arial Black, Impact, Arial, sans-serif;
      isolation: isolate;
      pointer-events: all;
      transition: opacity .45s ease;
    }

    #bbAnimeIntro * {
      box-sizing: border-box;
    }

    #bbAnimeIntro .bb-scene {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transform-origin: center;
    }

    #bbAnimeIntro .bb-scene.bb-shake {
      animation: bbScreenShake .22s linear;
    }

    @keyframes bbScreenShake {
      0%   { transform: translate(0, 0); }
      15%  { transform: translate(-11px, 7px); }
      30%  { transform: translate(10px, -6px); }
      45%  { transform: translate(-8px, 5px); }
      60%  { transform: translate(6px, -4px); }
      75%  { transform: translate(-4px, 2px); }
      100% { transform: translate(0, 0); }
    }

    #bbAnimeIntro .bb-logo {
      width: min(96vw, 1450px);
      transform: rotate(-2deg);
      filter: drop-shadow(0 9px 3px #5068aa33);
    }

    #bbAnimeIntro .bb-loading-line {
      display: flex;
      justify-content: flex-start;
      gap: .005em;
      margin-left: 9%;
      margin-bottom: -1%;
      font-size: clamp(32px, 8.8vw, 145px);
      line-height: .95;
      letter-spacing: -.07em;
    }

    #bbAnimeIntro .bb-main-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1%;
    }

    #bbAnimeIntro .bb-number-wrap {
      display: flex;
      align-items: baseline;
      flex: 0 0 auto;
      white-space: nowrap;
      font-size: clamp(88px, 23vw, 380px);
      font-weight: 1000;
      line-height: .9;
      letter-spacing: -.105em;
    }

    #bbAnimeIntro .bb-name-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1;
      min-width: 0;
      transform: translateY(4%);
    }

    #bbAnimeIntro .bb-boost,
    #bbAnimeIntro .bb-ball {
      display: flex;
      white-space: nowrap;
      font-size: clamp(44px, 11vw, 175px);
      font-weight: 1000;
      line-height: .85;
      letter-spacing: -.075em;
    }

    #bbAnimeIntro .bb-ball {
      margin-left: 5%;
      font-size: clamp(48px, 12vw, 190px);
    }

    #bbAnimeIntro .bb-letter,
    #bbAnimeIntro .bb-digit,
    #bbAnimeIntro .bb-percent {
      display: inline-block;
      position: relative;
      -webkit-text-stroke:
        clamp(2px, .6vw, 9px) #fff;
      paint-order: stroke fill;
      filter: drop-shadow(3px 5px 0 #ffffff);
      opacity: 0;
      transform: translateY(-140vh) scale(1.3);
      will-change: transform, opacity;
    }

    #bbAnimeIntro .bb-letter.purple,
    #bbAnimeIntro .bb-digit.purple {
      color: #6c25b9;
    }

    #bbAnimeIntro .bb-letter.blue,
    #bbAnimeIntro .bb-digit.blue {
      color: #397cf5;
    }

    #bbAnimeIntro .bb-digit {
      color: #397cf5;
    }

    #bbAnimeIntro .bb-one {
      color: #6c25b9;
    }

    #bbAnimeIntro .bb-percent {
      color: #6c25b9;
      font-size: .29em;
      margin-left: .15em;
      letter-spacing: 0;
    }

    #bbAnimeIntro .bb-letter.bb-land,
    #bbAnimeIntro .bb-digit.bb-land,
    #bbAnimeIntro .bb-percent.bb-land {
      animation: bbLetterFall .48s
        cubic-bezier(.18,.85,.22,1.05) forwards;
    }

    @keyframes bbLetterFall {
      0% {
        opacity: 1;
        transform: translateY(-140vh) scale(1.3);
      }

      65% {
        opacity: 1;
        transform: translateY(15px) scaleY(.84) scaleX(1.08);
      }

      79% {
        transform: translateY(-18px) scaleY(1.06);
      }

      91% {
        transform: translateY(5px) scaleY(.96);
      }

      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    #bbAnimeIntro.bb-finished {
      opacity: 0;
      pointer-events: none;
    }

    @media (max-width: 600px) {
      #bbAnimeIntro .bb-logo {
        width: 98vw;
      }

      #bbAnimeIntro .bb-loading-line {
        margin-left: 4%;
      }

      #bbAnimeIntro .bb-main-row {
        gap: 0;
      }

      #bbAnimeIntro .bb-number-wrap {
        font-size: 21vw;
      }

      #bbAnimeIntro .bb-boost,
      #bbAnimeIntro .bb-ball {
        font-size: 10vw;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #bbAnimeIntro .bb-letter,
      #bbAnimeIntro .bb-digit,
      #bbAnimeIntro .bb-percent {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }

      #bbAnimeIntro .bb-scene {
        animation: none !important;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(intro);

  // =========================================================
  // GENERATE LETTERS
  // =========================================================

  function addLetters(containerId, word, startBlue = false) {
    const container = document.getElementById(containerId);

    return [...word].map((letter, index) => {
      const span = document.createElement("span");

      const blue = (index % 2 === 0) === startBlue;

      span.className =
        `bb-letter ${blue ? "blue" : "purple"}`;

      span.textContent = letter;
      container.appendChild(span);

      return span;
    });
  }

  const loadingLetters = addLetters(
    "bbLoadingLetters",
    "LOADING",
    false
  );

  const boostLetters = addLetters(
    "bbBoostLetters",
    "BOOST",
    false
  );

  const ballLetters = addLetters(
    "bbBallLetters",
    "BALL",
    true
  );

  const digits = [
    intro.querySelector(".bb-one"),
    intro.querySelector(".bb-zero-one"),
    intro.querySelector(".bb-zero-two")
  ];

  const percent = intro.querySelector(".bb-percent");
  const scene = intro.querySelector(".bb-scene");

  // =========================================================
  // IMPACT ANIMATION
  // =========================================================

  let shakeTimer = null;

  function shake() {
    if (reduceMotion) return;

    scene.classList.remove("bb-shake");

    // Restart CSS animation.
    void scene.offsetWidth;

    scene.classList.add("bb-shake");

    clearTimeout(shakeTimer);

    shakeTimer = setTimeout(() => {
      scene.classList.remove("bb-shake");
    }, 230);
  }

  function land(element, delay, impact = true) {
    setTimeout(() => {
      element.classList.add("bb-land");

      if (impact) {
        setTimeout(shake, 300);
      }
    }, delay);
  }

  // =========================================================
  // TIMELINE
  // =========================================================

  if (reduceMotion) {
    [
      ...loadingLetters,
      ...digits,
      percent,
      ...boostLetters,
      ...ballLetters
    ].forEach(element => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
  } else {
    // LOADING falls in first.
    loadingLetters.forEach((element, index) => {
      land(element, 150 + index * 95, true);
    });

    // Giant 100 slams down.
    digits.forEach((element, index) => {
      land(element, 1050 + index * 175, true);
    });

    // Percent sign.
    land(percent, 1650, true);

    // BOOST letters.
    boostLetters.forEach((element, index) => {
      land(element, 1950 + index * 105, true);
    });

    // BALL letters.
    ballLetters.forEach((element, index) => {
      land(element, 2700 + index * 130, true);
    });
  }

  // =========================================================
  // EXIT
  // =========================================================

  const introDuration = reduceMotion ? 1000 : 4800;

  setTimeout(() => {
    intro.classList.add("bb-finished");

    setTimeout(() => {
      intro.remove();
      style.remove();
    }, 500);
  }, introDuration);

  // Mark intro as played only after creating it successfully.
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch (error) {
    console.warn("Could not save intro session:", error);
  }
})();
