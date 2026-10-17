
(() => {
  // BOOSTBALL — ANIME-STYLE INTRO
  // Visual-only intro. Does not affect game physics.

  const intro = document.createElement("div");
  intro.id = "bbAnimeIntro";

  intro.innerHTML = `
    <div class="bbIntroFlash"></div>
    <div class="bbIntroLines"></div>

    <div class="bbIntroContent">
      <div class="bbIntroSubtitle">WELCOME TO THE ARENA</div>
      <div class="bbIntroLetters"></div>

      <div class="bbIntroCounter">
        <span id="bbIntroNumber">000</span>
        <small>%</small>
      </div>

      <div class="bbIntroBar">
        <div id="bbIntroProgress"></div>
      </div>

      <div class="bbIntroLoading">INITIALISING BOOSTBALL...</div>
    </div>
  `;

  const css = document.createElement("style");
  css.textContent = `
    #bbAnimeIntro {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: radial-gradient(
        ellipse at center,
        #291458 0%,
        #090b1d 65%,
        #02040d 100%
      );
      display: grid;
      place-items: center;
      overflow: hidden;
      color: white;
      font-family: Arial, sans-serif;
      pointer-events: all;
      transition: opacity .6s ease;
    }

    #bbAnimeIntro * {
      box-sizing: border-box;
    }

    .bbIntroContent {
      position: relative;
      z-index: 3;
      width: 100%;
      text-align: center;
      padding: 20px;
    }

    .bbIntroSubtitle {
      font-size: clamp(10px, 1.5vw, 15px);
      letter-spacing: 6px;
      font-weight: 900;
      color: #bba6ff;
      margin-bottom: 25px;
      opacity: 0;
      animation: bbFadeIn .5s .2s forwards;
    }

    .bbIntroLetters {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: clamp(0px, .3vw, 5px);
      white-space: nowrap;
      perspective: 900px;
    }

    .bbIntroLetter {
      display: inline-block;
      font-size: clamp(30px, 8vw, 105px);
      font-weight: 1000;
      letter-spacing: -4px;
      color: #fff;
      text-shadow:
        0 4px 0 #7255db,
        0 10px 25px #7854db99;
      opacity: 0;
      transform: translateY(-150vh) scale(1.6);
      animation: bbLetterSlam .34s cubic-bezier(.12,.8,.3,1.3) forwards;
    }

    .bbIntroLetter.accent {
      color: #ac92ff;
      text-shadow:
        0 4px 0 #4c35a5,
        0 10px 30px #9b76ff99;
    }

    @keyframes bbLetterSlam {
      0% {
        opacity: 1;
        transform: translateY(-150vh) scale(1.6);
      }
      75% {
        transform: translateY(12px) scale(.93);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .bbIntroCounter {
      margin-top: 38px;
      font-size: clamp(60px, 13vw, 170px);
      font-weight: 1000;
      font-style: italic;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      color: #ffffff;
      text-shadow: 0 0 45px #926cff99;
    }

    .bbIntroCounter small {
      font-size: .28em;
      color: #a88cff;
    }

    .bbIntroBar {
      width: min(460px, 75vw);
      height: 8px;
      background: #ffffff22;
      margin: 28px auto 15px;
      border-radius: 100px;
      overflow: hidden;
      border: 1px solid #ffffff44;
    }

    #bbIntroProgress {
      width: 0%;
      height: 100%;
      background: linear-gradient(
        90deg,
        #4969ff,
        #b28cff,
        #ffffff
      );
      box-shadow: 0 0 20px #a88cff;
    }

    .bbIntroLoading {
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 3px;
      color: #aeb8d7;
    }

    .bbIntroLines {
      position: absolute;
      inset: -100%;
      background: repeating-linear-gradient(
        115deg,
        transparent 0px,
        transparent 36px,
        #9770ff12 37px,
        transparent 42px
      );
      animation: bbLines 1.5s linear infinite;
    }

    @keyframes bbLines {
      to { transform: translateX(120px); }
    }

    .bbIntroFlash {
      position: absolute;
      inset: 0;
      background: white;
      opacity: 0;
      pointer-events: none;
      z-index: 5;
    }

    .bbIntroFlash.active {
      animation: bbFlash .3s ease-out;
    }

    @keyframes bbFlash {
      0% { opacity: .65; }
      100% { opacity: 0; }
    }

    @keyframes bbFadeIn {
      to { opacity: 1; }
    }

    #bbAnimeIntro.bbIntroExit {
      opacity: 0;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      #bbAnimeIntro *,
      #bbAnimeIntro *::before,
      #bbAnimeIntro *::after {
        animation-duration: .01ms !important;
      }
    }
  `;

  document.head.appendChild(css);
  document.body.appendChild(intro);

  const letters = intro.querySelector(".bbIntroLetters");
  const number = intro.querySelector("#bbIntroNumber");
  const progress = intro.querySelector("#bbIntroProgress");
  const flash = intro.querySelector(".bbIntroFlash");

  const word = "BOOSTBALL";

  [...word].forEach((character, index) => {
    const span = document.createElement("span");

    span.className = "bbIntroLetter";
    if (index >= 5) span.classList.add("accent");

    span.textContent = character;
    span.style.animationDelay = `${0.3 + index * 0.13}s`;

    letters.appendChild(span);
  });

  // Impact flashes timed to the letter drops.
  [0.65, 1.17, 1.69].forEach(seconds => {
    setTimeout(() => {
      flash.classList.remove("active");
      void flash.offsetWidth;
      flash.classList.add("active");
    }, seconds * 1000);
  });

  // Wind-up counter: starts after the letters arrive.
  const startTime = performance.now() + 1650;
  const duration = 1450;

  function animateCounter(now) {
    const elapsed = Math.max(0, now - startTime);
    const t = Math.min(elapsed / duration, 1);

    // Slow beginning, rapid wind-up, then snap to 100.
    const eased = t < .7
      ? 0.7 * Math.pow(t / .7, 2.3)
      : .7 + .3 * (1 - Math.pow((1 - t) / .3, 3));

    const value = Math.min(100, Math.floor(eased * 100));

    number.textContent = String(value).padStart(3, "0");
    progress.style.width = `${value}%`;

    if (t < 1) {
      requestAnimationFrame(animateCounter);
    } else {
      number.textContent = "100";
      progress.style.width = "100%";
    }
  }

  requestAnimationFrame(animateCounter);

  // Exit after the sequence finishes.
  setTimeout(() => {
    intro.classList.add("bbIntroExit");

    setTimeout(() => {
      intro.remove();
      css.remove();
    }, 650);
  }, 3700);
})();
