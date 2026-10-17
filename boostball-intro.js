
/* BOOSTBALL — MONOCHROME INTRO */
(() => {
  if (document.getElementById("bbAnimeIntro")) return;

  const reduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const layer = document.createElement("div");
  layer.id = "bbAnimeIntro";
  layer.setAttribute(
    "aria-label",
    "Boost Ball loading animation"
  );

  layer.innerHTML = `
    <div class="bb-wash"></div>
    <div class="bb-swoosh bb-swoosh-a"></div>
    <div class="bb-swoosh bb-swoosh-b"></div>
    <div class="bb-type-field" aria-hidden="true"></div>

    <div class="bb-title">
      <div class="bb-overline">WELCOME TO THE ARENA</div>
      <div class="bb-word bb-boost">BOOST</div>
      <div class="bb-word bb-ball">BALL</div>
      <div class="bb-loading">L O A D I N G</div>
      <div class="bb-number">
        <span id="bbCount">000</span>
        <span class="bb-percent">%</span>
      </div>
      <div class="bb-bottom">READY TO ROLL?</div>
    </div>

    <div class="bb-final-flash"></div>
  `;

  const style = document.createElement("style");

  style.textContent = `
    #bbAnimeIntro {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      overflow: hidden;
      display: grid;
      place-items: center;
      background: #e6e6e6;
      color: #111;
      font-family: Arial, Helvetica, sans-serif;
      isolation: isolate;
      pointer-events: auto;
      opacity: 1;
      transition: opacity .45s ease;
    }

    #bbAnimeIntro * {
      box-sizing: border-box;
    }

    #bbAnimeIntro .bb-wash {
      position: absolute;
      inset: -15%;
      background: radial-gradient(
        ellipse at 50% 45%,
        #fff 0%,
        #ededed 45%,
        #a8a8a8 100%
      );
      animation: bbWash 3.8s ease both;
    }

    #bbAnimeIntro .bb-swoosh {
      position: absolute;
      width: 150vw;
      height: 25vh;
      left: -25vw;
      top: 30%;
      background: #333;
      opacity: .14;
      transform: rotate(-17deg) translateX(-140vw);
      animation: bbSweep 1.3s ease-in-out both;
    }

    #bbAnimeIntro .bb-swoosh-b {
      background: #999;
      top: 65%;
      height: 13vh;
      animation-delay: .3s;
    }

    #bbAnimeIntro .bb-type-field {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    #bbAnimeIntro .bb-fly {
      position: absolute;
      left: 50%;
      top: 50%;
      font-size: clamp(160px, 36vw, 560px);
      font-weight: 1000;
      line-height: .8;
      letter-spacing: -.12em;
      color: #777;
      -webkit-text-stroke: 5px white;
      paint-order: stroke fill;
      text-shadow: 8px 9px 0 #111;
      white-space: nowrap;
      opacity: 0;
      transform: translate(-50%, -50%) scale(3);
      animation:
        bbFly var(--dur)
        cubic-bezier(.22,.7,.22,1)
        var(--delay) both;
    }

    #bbAnimeIntro .bb-fly.alt {
      color: #111;
      text-shadow: 8px 9px 0 #888;
    }

    #bbAnimeIntro .bb-title {
      position: relative;
      z-index: 2;
      width: min(94vw, 760px);
      text-align: center;
      opacity: 0;
      transform: scale(1.4);
      animation:
        bbTitleEnter .7s
        cubic-bezier(.12,.85,.18,1.1)
        2.45s forwards;
    }

    #bbAnimeIntro .bb-overline {
      font-size: clamp(10px, 1.8vw, 16px);
      letter-spacing: .4em;
      color: #555;
      font-weight: 900;
      margin-bottom: 5px;
    }

    #bbAnimeIntro .bb-word {
      font-weight: 1000;
      font-size: clamp(72px, 15.5vw, 170px);
      line-height: .76;
      letter-spacing: -.09em;
      color: #777;
      -webkit-text-stroke: 3px white;
      paint-order: stroke fill;
      text-shadow:
        5px 5px 0 #111,
        9px 9px 0 #aaa;
      white-space: nowrap;
    }

    #bbAnimeIntro .bb-boost {
      transform: translateX(-3%);
    }

    #bbAnimeIntro .bb-ball {
      color: #111;
      transform: translateX(5%);
      position: relative;
      text-shadow:
        5px 5px 0 #777,
        9px 9px 0 white;
    }

    #bbAnimeIntro .bb-loading {
      display: inline-block;
      margin-top: 22px;
      font-weight: 1000;
      letter-spacing: .4em;
      font-size: clamp(12px, 2.3vw, 21px);
      color: #111;
      background: #fff;
      padding: 3px 12px;
    }

    #bbAnimeIntro .bb-number {
      font-weight: 1000;
      line-height: 1;
      font-size: clamp(100px, 22vw, 240px);
      letter-spacing: -.1em;
      font-variant-numeric: tabular-nums;
      color: #111;
      -webkit-text-stroke:
        clamp(2px, .5vw, 6px) #fff;
      paint-order: stroke fill;
      filter: drop-shadow(6px 7px 0 #888);
      transform: scale(.55) rotate(-6deg);
      opacity: 0;
      animation:
        bbNumberPop .55s
        cubic-bezier(.16,1.3,.28,1)
        3.05s forwards;
    }

    #bbAnimeIntro .bb-percent {
      font-size: .32em;
      vertical-align: top;
      letter-spacing: 0;
      margin-left: .12em;
      color: #777;
    }

    #bbAnimeIntro .bb-bottom {
      font-weight: 900;
      letter-spacing: .36em;
      font-size: clamp(10px, 1.8vw, 14px);
      color: #555;
      opacity: 0;
      animation: bbBottom .35s 4.1s forwards;
    }

    #bbAnimeIntro .bb-final-flash {
      position: absolute;
      inset: 0;
      background: #fff;
      opacity: 0;
      pointer-events: none;
      animation: bbFinalFlash .35s 2.38s both;
    }

    #bbAnimeIntro.bb-out {
      opacity: 0;
      pointer-events: none;
    }

    @keyframes bbFly {
      0% {
        opacity: 0;
        transform: translate(
          calc(-50% + var(--sx)),
          calc(-50% + var(--sy))
        ) scale(3.2) rotate(var(--rot));
      }

      15% { opacity: 1; }

      58% {
        opacity: 1;
        transform:
          translate(-50%, -50%)
          scale(1.05) rotate(0deg);
      }

      74% {
        opacity: 1;
        transform:
          translate(-50%, -50%)
          scale(.95) rotate(3deg);
      }

      100% {
        opacity: 0;
        transform: translate(
          calc(-50% + var(--ex)),
          calc(-50% + var(--ey))
        ) scale(2.2) rotate(-9deg);
      }
    }

    @keyframes bbTitleEnter {
      0% {
        opacity: 0;
        transform: scale(1.6) rotate(-5deg);
        filter: blur(10px);
      }

      65% {
        opacity: 1;
        transform: scale(.96) rotate(1deg);
        filter: blur(0);
      }

      100% {
        opacity: 1;
        transform: scale(1) rotate(0);
      }
    }

    @keyframes bbNumberPop {
      0% {
        opacity: 0;
        transform: scale(.4) rotate(-12deg);
      }

      65% {
        opacity: 1;
        transform: scale(1.13) rotate(3deg);
      }

      100% {
        opacity: 1;
        transform: scale(1) rotate(-2deg);
      }
    }

    @keyframes bbFinalFlash {
      0%, 100% { opacity: 0; }
      48% { opacity: .8; }
    }

    @keyframes bbSweep {
      0% {
        opacity: 0;
        transform:
          translateX(-130vw) rotate(-17deg);
      }

      50% { opacity: .3; }

      100% {
        opacity: 0;
        transform:
          translateX(130vw) rotate(-17deg);
      }
    }

    @keyframes bbWash {
      from { transform: scale(1.3); }
      to { transform: scale(1); }
    }

    @keyframes bbBottom {
      to { opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      #bbAnimeIntro * {
        animation-duration: .01ms !important;
        animation-delay: 0ms !important;
      }

      #bbAnimeIntro .bb-title,
      #bbAnimeIntro .bb-number,
      #bbAnimeIntro .bb-bottom {
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(layer);

  const field = layer.querySelector(".bb-type-field");

  const pieces = [
    ["B", "-90vw", "-50vh", "85vw", "-25vh", "-18deg"],
    ["O", "100vw", "-65vh", "-90vw", "40vh", "15deg"],
    ["O", "-85vw", "60vh", "100vw", "-30vh", "-25deg"],
    ["S", "100vw", "55vh", "-95vw", "-30vh", "20deg"],
    ["T", "-100vw", "-60vh", "95vw", "40vh", "-12deg"],
    ["B", "90vw", "-45vh", "-80vw", "60vh", "16deg"],
    ["A", "-90vw", "50vh", "90vw", "-40vh", "-15deg"],
    ["L", "85vw", "50vh", "-95vw", "-30vh", "19deg"],
    ["L", "-85vw", "-60vh", "85vw", "30vh", "-19deg"]
  ];

  if (!reduce) {
    pieces.forEach(([letter, sx, sy, ex, ey, rot], i) => {
      const node = document.createElement("span");

      node.className =
        "bb-fly" + (i % 3 === 1 ? " alt" : "");

      node.textContent = letter;

      node.style.setProperty("--sx", sx);
      node.style.setProperty("--sy", sy);
      node.style.setProperty("--ex", ex);
      node.style.setProperty("--ey", ey);
      node.style.setProperty("--rot", rot);
      node.style.setProperty("--delay", `${.15 + i * .205}s`);
      node.style.setProperty("--dur", ".9s");

      field.appendChild(node);
    });
  }

  const count = layer.querySelector("#bbCount");

  const start = performance.now() + (reduce ? 0 : 3200);
  const duration = reduce ? 200 : 1250;

  function tick(now) {
    const t = Math.max(
      0,
      Math.min(1, (now - start) / duration)
    );

    const value = Math.round(
      100 * (1 - Math.pow(1 - t, 3))
    );

    count.textContent =
      String(value).padStart(3, "0");

    if (t < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);

  const total = reduce ? 1100 : 5100;

  setTimeout(() => {
    layer.classList.add("bb-out");

    setTimeout(() => {
      layer.remove();
      style.remove();
    }, 500);
  }, total);
})();
