
/*
 * Private Gestaltungsvorschau eines Kauf-Popups.
 * Erstes Popup: 1 Sekunde
 * Anzeigedauer: 8 Sekunden
 * Abstand: 5 Sekunden
 * Hover / gedrückte Maustaste pausieren die Ausblendung.
 */

(function () {
  "use strict";

  if (window.__squarePopupActive) return;
  window.__squarePopupActive = true;

  const FIRST_DELAY = 1000;
  const SHOW_DURATION = 8000;
  const NEXT_DELAY = 5000;
  const ANIMATION_DURATION = 400;

  const purchase = {
    name: "Anna",
    city: "Mannheim",
    flag: "🇩🇪",
    product: "Online-Kurs (Bundle)",
    time: "vor 5 Stunden",
    attribution: "ProveSource"
  };

  // Stilisiertes Kartenbild.
  const mapSvg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 180 180">
      <rect width="180" height="180" fill="#f1f1ec"/>

      <path
        d="M0 2L45 0 28 40 0 50Z
           M130 0H180V50L156 41Z
           M0 115L42 90 68 135 24 180H0Z
           M150 92L180 67V180H110Z"
        fill="#d6ebcc"/>

      <path
        d="M22 -10C45 28 48 43 66 70S90 121 136 190"
        fill="none"
        stroke="#c4deeb"
        stroke-width="12"/>

      <g stroke="#fff"
         fill="none"
         stroke-width="9"
         stroke-linecap="round">
        <path
          d="M0 21L180 45
             M0 68L180 112
             M0 149L180 72
             M45 0L92 180
             M140 0L31 180"/>
      </g>

      <g stroke="#e8c66e"
         fill="none"
         stroke-width="4"
         stroke-linecap="round">
        <path
          d="M0 21L180 45
             M0 68L180 112
             M0 149L180 72
             M45 0L92 180
             M140 0L31 180"/>
      </g>

      <g stroke="#fff"
         stroke-width="3"
         fill="none">
        <path
          d="M0 105L180 147
             M17 0L110 180
             M0 173L180 14"/>
      </g>

      <g fill="#525252"
         font-family="Arial,sans-serif"
         font-size="17">
        <text x="17" y="30">Worms</text>
        <text x="37" y="95" font-size="20">Mannheim</text>
        <text x="40" y="154">Heidelberg</text>
      </g>

      <rect x="133" y="158"
            width="30" height="18"
            rx="3" fill="#2879ca"/>

      <text x="148" y="172"
            fill="white"
            text-anchor="middle"
            font-family="Arial"
            font-size="14">6</text>
    </svg>
  `;

  // Häkchen mit 16 × 16 Pixeln.
  const checkSvg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 24 24"
         width="16"
         height="16"
         aria-hidden="true"
         focusable="false">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="#666666"/>

      <path
        d="M6.8 12.1L10.3 15.6L17.5 8.4"
        fill="none"
        stroke="#ffffff"
        stroke-width="2.3"
        stroke-linecap="round"
        stroke-linejoin="round"/>
    </svg>
  `;

  const style = document.createElement("style");

  style.textContent = `
    #social-proof-popup {
      position: fixed;
      left: 12px;
      bottom: 12px;
      z-index: 2147483000;
      width: 350px;
      max-width: calc(100vw - 24px);
      display: none;
      opacity: 0;
      transform: translateY(110%);
      transition:
        opacity .4s ease,
        transform .4s ease,
        bottom .3s ease;
      color: #111;
      font: 13px/17px Lato, Arial, sans-serif;
      box-sizing: border-box;
    }

    #social-proof-popup.fomo-visible {
      opacity: 1;
      transform: translateY(0);
    }

    #social-proof-popup.fomo-visible:hover {
      bottom: 22px;
    }

    #social-proof-popup .fomo-card {
      display: flex;
      align-items: center;
      gap: 9px;
      position: relative;
      padding: 8px 28px 8px 8px;
      min-height: 85px;
      box-sizing: border-box;
      background: #fff;
      border: 1px solid #e7e7e7;
      border-radius: 10px;
      box-shadow: 0 5px 23px rgba(0,0,0,.17);
    }

    #social-proof-popup .fomo-map {
      width: 68px;
      height: 68px;
      min-width: 68px;
      border-radius: 8px;
      object-fit: cover;
      display: block;
    }

    #social-proof-popup .fomo-text {
      min-width: 0;
      flex: 1;
    }

    #social-proof-popup .fomo-top {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 5px;
      color: #7825f3;
      font-size: 15px;
      line-height: 18px;
      margin-bottom: 3px;
    }

    #social-proof-popup .fomo-name {
      font-weight: 700;
    }

    #social-proof-popup .fomo-city {
      font-weight: 400;
      color: #a068ed;
    }

    #social-proof-popup .fomo-flag {
      font-size: 18px;
      line-height: 1;
      margin-left: 3px;
    }

    #social-proof-popup .fomo-caption,
    #social-proof-popup .fomo-product {
      color: #101010;
      font-size: 13px;
      line-height: 17px;
      font-weight: 400;
    }

    #social-proof-popup .fomo-product {
      margin-bottom: 3px;
    }

    #social-proof-popup .fomo-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 5px;
      color: #868686;
      font-size: 11px;
      line-height: 24px;
    }

    #social-proof-popup .fomo-check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex: 0 0 16px;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      line-height: 0;
    }

    #social-proof-popup .fomo-check svg {
      display: block !important;
      width: 16px !important;
      height: 16px !important;
      min-width: 16px !important;
      max-width: 16px !important;
      fill: none;
    }

    /* Abstand zwischen Häkchen und ProveSource: 1,25 px */
    #social-proof-popup .fomo-trust {
      margin-left: -3.75px;
    }

    #social-proof-popup .fomo-close {
      position: absolute;
      top: 7px;
      right: 6px;
      border: 0;
      background: transparent;
      color: #9c9c9c;
      font: bold 21px/17px Arial, sans-serif;
      cursor: pointer;
      padding: 0 3px;
    }

    #social-proof-popup .fomo-close:hover {
      color: #555;
    }

    @media (max-width: 480px) {
      #social-proof-popup {
        left: 8px;
        bottom: 8px;
        width: calc(100% - 16px);
        max-width: none;
      }

      #social-proof-popup.fomo-visible:hover {
        bottom: 8px;
      }

      #social-proof-popup .fomo-card {
        gap: 8px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #social-proof-popup {
        transition: none;
      }
    }
  `;

  document.head.appendChild(style);

  function init() {
    const popup = document.createElement("aside");

    popup.id = "social-proof-popup";
    popup.setAttribute("role", "status");
    popup.setAttribute("aria-live", "polite");

    popup.innerHTML = `
      <div class="fomo-card">
        <img
          class="fomo-map"
          alt="Kartenillustration Mannheim">

        <div class="fomo-text">
          <div class="fomo-top">
            <span class="fomo-name"></span>
            <span class="fomo-city"></span>
            <span class="fomo-flag"
                  aria-label="Deutschland"></span>
          </div>

          <div class="fomo-caption">
            hat folgendes gekauft:
          </div>

          <div class="fomo-product"></div>

          <div class="fomo-meta">
            <span class="fomo-time"></span>
            <span class="fomo-check">
              ${checkSvg}
            </span>
            <span class="fomo-trust"></span>
          </div>
        </div>

        <button
          class="fomo-close"
          type="button"
          aria-label="Schließen">×</button>
      </div>
    `;

    popup.querySelector(".fomo-map").src =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(mapSvg);

    popup.querySelector(".fomo-name").textContent =
      purchase.name;

    popup.querySelector(".fomo-city").textContent =
      "(" + purchase.city + ")";

    popup.querySelector(".fomo-flag").textContent =
      purchase.flag;

    popup.querySelector(".fomo-product").textContent =
      purchase.product;

    popup.querySelector(".fomo-time").textContent =
      purchase.time;

    popup.querySelector(".fomo-trust").textContent =
      purchase.attribution;

    document.body.appendChild(popup);

    let visible = false;
    let dismissed = false;
    let hovered = false;
    let pressed = false;

    let remaining = SHOW_DURATION;
    let startedAt = 0;

    let hideTimer = null;
    let nextTimer = null;
    let animationTimer = null;

    function pause() {
      if (hideTimer === null) return;

      clearTimeout(hideTimer);
      hideTimer = null;

      remaining = Math.max(
        0,
        remaining -
        (performance.now() - startedAt)
      );
    }

    function resume() {
      if (
        !visible ||
        dismissed ||
        hovered ||
        pressed ||
        hideTimer !== null
      ) return;

      startedAt = performance.now();

      hideTimer = setTimeout(() => {
        hideTimer = null;
        remaining = 0;
        hide();
      }, remaining);
    }

    function show() {
      if (dismissed || visible) return;

      visible = true;
      hovered = false;
      pressed = false;
      remaining = SHOW_DURATION;

      clearTimeout(animationTimer);

      popup.style.display = "block";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!visible) return;

          popup.classList.add("fomo-visible");
          resume();
        });
      });
    }

    function hide() {
      if (
        !visible ||
        dismissed ||
        hovered ||
        pressed
      ) return;

      visible = false;

      clearTimeout(hideTimer);
      hideTimer = null;

      popup.classList.remove("fomo-visible");

      animationTimer = setTimeout(() => {
        if (!visible) {
          popup.style.display = "none";
        }
      }, ANIMATION_DURATION);

      nextTimer = setTimeout(show, NEXT_DELAY);
    }

    popup.addEventListener(
      "pointerenter",
      event => {
        if (event.pointerType === "touch") return;

        hovered = true;
        pause();
      }
    );

    popup.addEventListener(
      "pointerleave",
      event => {
        if (event.pointerType === "touch") return;

        hovered = false;
        resume();
      }
    );

    popup.addEventListener("pointerdown", () => {
      pressed = true;
      pause();
    });

    function release() {
      pressed = false;
      resume();
    }

    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);

    popup.querySelector(".fomo-close")
      .addEventListener("click", () => {
        dismissed = true;
        visible = false;

        clearTimeout(hideTimer);
        clearTimeout(nextTimer);
        clearTimeout(animationTimer);

        popup.remove();
      });

    nextTimer = setTimeout(show, FIRST_DELAY);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
