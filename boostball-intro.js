
/*
  BOOSTBALL — MONOCHROME TITLE OPENING
  Plays once per tab session.
  Refreshing the same tab skips it.
*/

(() => {
  const SESSION_KEY = "boostball-intro-played-v2";

  try {
    if (sessionStorage.getItem(SESSION_KEY) === "yes") {
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "yes");
  } catch (error) {
    console.warn("Intro session storage unavailable:", error);
  }

  if (document.getElementById("bbAnimeIntro")) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const intro = document.createElement("div");
  intro.id = "bbAnimeIntro";

  intro.innerHTML = `
    <div class="bb-paper"></div>

    <div class="bb-fragments" aria-hidden="true"></div>

    <div class="bb-composition">
      <div class="bb-heading">
        <div class="bb-small-title">
          THE CAR-SOCCER EXPERIENCE
        </div>

        <div class="bb-heading-row">
          <span class="bb-title-grey">BOOST</span>
          <span class="bb-title-black">BALL</span>
        </div>

        <div class="bb-heading-row bb-heading-second">
          <span class="bb-title-black">LOADING</span>
          <span class="bb-symbol">★</span>
        </div>
      </div>

      <div class="bb-big-number">
        <span id="bbAnimeCount">000</span>
        <span class="bb-pct">%</span>
      </div>

      <div class="bb-tiny-decoration">
        <span>BOOST</span>
        <span>★</span>
        <span>BALL</span>
      </div>

      <div class="bb-ready">READY TO ROLL!</div>
    </div>

    <div class="bb-white-impact"></div>
  `;

  const style = document.createElement("style");

  style.textContent = `
    #bbAnimeIntro {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: #f7f7f7;
      color: #171717;
      overflow: hidden;
      font-family: Arial Black, Arial, sans-serif;
      pointer-events: auto;
      isolation: isolate;
    }

    #bbAnimeIntro * {
      box-sizing: border-box;
    }

    #bbAnimeIntro .bb-paper {
      position: absolute;
      inset: -10%;
      background:
        radial-gradient(
          ellipse at center,
          #ffffff 30%,
          #f0f0f0 75%,
          #d5d5d5 100%
        );
    }

    /*
      OVERSIZED LETTER CUTS
      These fill the frame before the title appears.
    */

    #bbAnimeIntro .bb-fragments {
      position: absolute;
      inset: 0;
      overflow: hidden;
      z-index: 2;
    }

    #bbAnimeIntro .bb-fragment {
      position: absolute;
      display: block;
      font-family: Arial Black, Arial, sans-serif;
      font-size: clamp(300px, 75vw, 1150px);
      font-weight: 1000;
      line-height: .75;
      letter-spacing: -.13em;
      white-space: nowrap;
      color: #858585;
      -webkit-text-stroke: 3px #fff;
      paint-order: stroke fill;
      opacity: 0;
      will-change: transform, opacity;
      animation:
        bbFragmentCut .34s steps(1, end) both;
      animation-delay: var(--at);
    }

    #bbAnimeIntro .bb-fragment.dark {
      color: #111;
    }

    #bbAnimeIntro .bb-fragment.light {
      color: #b7b7b7;
    }

    @keyframes bbFragmentCut {
      0% {
        opacity: 0;
        transform:
          translate(var(--from-x), var(--from-y))
          rotate(var(--angle))
          scale(1.55);
      }

      12% {
        opacity: 1;
        transform:
          translate(var(--to-x), var(--to-y))
          rotate(var(--angle))
          scale(1);
      }

      80% {
        opacity: 1;
        transform:
          translate(var(--to-x), var(--to-y))
          rotate(var(--angle))
          scale(1);
      }

      100% {
        opacity: 0;
        transform:
          translate(var(--to-x), var(--to-y))
          rotate(var(--angle))
          scale(1);
      }
    }

    /*
      COMPACT, LAYERED TITLE
    */

    #bbAnimeIntro .bb-composition {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 3;
      padding: 5vw;
      transform: translateY(-2vh);
    }

    #bbAnimeIntro .bb-heading {
      position: relative;
      width: min(92vw, 780px);
      opacity: 0;
      transform: scale(1.9) rotate(-4deg);
      animation:
        bbTitleSnap .4s
        cubic-bezier(.15,.85,.2,1)
        2.18s forwards;
    }

    #bbAnimeIntro .bb-small-title {
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: clamp(9px, 1.6vw, 15px);
      font-weight: 900;
      letter-spacing: .15em;
      color: #777;
      margin-bottom: 5px;
    }

    #bbAnimeIntro .bb-heading-row {
      display: flex;
      justify-content: center;
      align-items: baseline;
      gap: .04em;
      font-size: clamp(54px, 13vw, 145px);
      font-weight: 1000;
      letter-spacing: -.105em;
      line-height: .88;
      white-space: nowrap;
    }

    #bbAnimeIntro .bb-heading-second {
      font-size: clamp(43px, 10vw, 112px);
      margin-top: -.02em;
      transform: translateX(5%);
    }

    #bbAnimeIntro .bb-title-grey {
      color: #8e8e8e;
    }

    #bbAnimeIntro .bb-title-black {
      color: #161616;
    }

    #bbAnimeIntro .bb-symbol {
      color: #a1a1a1;
      font-size: .5em;
      margin-left: .1em;
      transform: rotate(-15deg);
    }

    /*
      THICK WHITE OUTLINES
    */

    #bbAnimeIntro .bb-title-grey,
    #bbAnimeIntro .bb-title-black,
    #bbAnimeIntro .bb-symbol {
      -webkit-text-stroke:
        clamp(2px, .65vw, 7px) #fff;
      paint-order: stroke fill;
      filter: drop-shadow(2px 3px 0 #bbb);
    }

    @keyframes bbTitleSnap {
      0% {
        opacity: 0;
        transform: scale(1.9) rotate(-4deg);
      }

      65% {
        opacity: 1;
        transform: scale(.92) rotate(1deg);
      }

      100% {
        opacity: 1;
        transform: scale(1) rotate(0);
      }
    }

    /*
      THE BIG 100% REVEAL
    */

    #bbAnimeIntro .bb-big-number {
      position: relative;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      margin-top: -.02em;
      font-size: clamp(125px, 28vw, 320px);
      font-weight: 1000;
      letter-spacing: -.14em;
      line-height: .95;
      color: #858585;
      -webkit-text-stroke:
        clamp(5px, 1.1vw, 13px) white;
      paint-order: stroke fill;
      filter: drop-shadow(5px 6px 0 #242424);
      opacity: 0;
      transform: scale(2.5) rotate(-8deg);
      animation:
        bbHundredImpact .45s
        cubic-bezier(.13,.85,.2,1.2)
        2.9s forwards;
    }

    #bbAnimeIntro #bbAnimeCount {
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
    }

    #bbAnimeIntro .bb-pct {
      font-size: .26em;
      letter-spacing: -.05em;
      color: #111;
      margin-left: .12em;
      margin-top: .25em;
    }

    @keyframes bbHundredImpact {
      0% {
        opacity: 0;
        transform: scale(2.5) rotate(-8deg);
      }

      65% {
        opacity: 1;
        transform: scale(.9) rotate(2deg);
      }

      100% {
        opacity: 1;
        transform: scale(1) rotate(0);
      }
    }

    #bbAnimeIntro .bb-tiny-decoration {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      font-size: clamp(10px, 2vw, 17px);
      font-weight: 900;
      letter-spacing: .25em;
      color: #777;
      opacity: 0;
      animation: bbAppear .1s 3.35s forwards;
    }

    #bbAnimeIntro .bb-tiny-decoration span:nth-child(2) {
      color: #111;
      font-size: 1.5em;
    }

    #bbAnimeIntro .bb-ready {
      margin-top: 12px;
      font-size: clamp(10px, 1.8vw, 16px);
      font-weight: 900;
      letter-spacing: .35em;
      opacity: 0;
      animation: bbAppear .15s 4.1s forwards;
    }

    @keyframes bbAppear {
      to { opacity: 1; }
    }

    /*
      FINAL WHITE FLASH
    */

    #bbAnimeIntro .bb-white-impact {
      position: absolute;
      inset: 0;
      background: #fff;
      z-index: 5;
      opacity: 0;
      pointer-events: none;
      animation: bbImpact .25s 2.15s both;
    }

    @keyframes bbImpact {
      0%, 100% { opacity: 0; }
      40% { opacity: .95; }
    }

    #bbAnimeIntro.bb-exit {
      animation: bbExit .35s forwards;
    }

    @keyframes bbExit {
      to {
        opacity: 0;
        visibility: hidden;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #bbAnimeIntro .bb-fragments,
      #bbAnimeIntro .bb-white-impact {
        display: none;
      }

      #bbAnimeIntro .bb-heading,
      #bbAnimeIntro .bb-big-number,
      #bbAnimeIntro .bb-tiny-decoration,
      #bbAnimeIntro .bb-ready {
        animation: none;
        opacity: 1;
        transform: none;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(intro);

  const fragments = intro.querySelector(".bb-fragments");

  // Each item represents one oversized typographic cut.
  const cuts = [
    ["B", "dark", "-38vw", "-32vh", "-15vw", "-12vh", "-12deg"],
    ["O", "light", "25vw", "-25vh", "1vw", "-18vh", "8deg"],
    ["O", "", "-30vw", "10vh", "-12vw", "-5vh", "-9deg"],
    ["S", "dark", "30vw", "18vh", "0vw", "-8vh", "12deg"],
    ["T", "light", "-35vw", "-28vh", "-8vw", "-14vh", "-15deg"],
    ["B", "", "20vw", "-25vh", "-4vw", "-15vh", "6deg"],
    ["A", "dark", "-30vw", "15vh", "-12vw", "-12vh", "-8deg"],
    ["L", "light", "28vw", "12vh", "3vw", "-14vh", "9deg"],
    ["L", "dark", "-35vw", "-30vh", "-12vw", "-18vh", "-11deg"]
  ];

  if (!reducedMotion) {
    cuts.forEach((cut, i) => {
      const [letter, tone, fx, fy, tx, ty, angle] = cut;

      const span = document.createElement("span");
      span.className = `bb-fragment ${tone}`;
      span.textContent = letter;

      span.style.left = "35%";
      span.style.top = "20%";

      span.style.setProperty("--from-x", fx);
      span.style.setProperty("--from-y", fy);
      span.style.setProperty("--to-x", tx);
      span.style.setProperty("--to-y", ty);
      span.style.setProperty("--angle", angle);
      span.style.setProperty("--at", `${.12 + i * .225}s`);

      fragments.appendChild(span);
    });
  }

  /*
    COUNTER
    The title's number appears first,
    then rapidly winds up to 100.
  */

  const counter = intro.querySelector("#bbAnimeCount");

  function animateCount() {
    const start = performance.now();
    const duration = 1050;

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);

      // Accelerating wind-up, then sharp finish.
      const value = Math.floor(
        100 * (t * t * (3 - 2 * t))
      );

      counter.textContent =
        String(value).padStart(3, "0");

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        counter.textContent = "100";
      }
    }

    requestAnimationFrame(frame);
  }

  if (reducedMotion) {
    counter.textContent = "100";
  } else {
    setTimeout(animateCount, 3150);
  }

  // Reveal the existing login or main menu.
  setTimeout(() => {
    intro.classList.add("bb-exit");

    setTimeout(() => {
      intro.remove();
      style.remove();
    }, 400);
  }, reducedMotion ? 1000 : 4900);
})();
