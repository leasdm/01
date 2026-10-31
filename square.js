
/*
 * FomoToolkit – Produktbezogenes Kauf-Popup
 *
 * Mit data-product="bundle20" oder
 * data-product="evolution" auf der Verkaufsseite.
 *
 * Ohne data-product weiterhin alle Käufe,
 * beispielsweise in der GitHub-Vorschau.
 */

(function () {
  "use strict";

  if (window.__squarePopupActive) return;
  window.__squarePopupActive = true;

  const scriptTag = document.currentScript;

  const productKey = scriptTag
    ? (
        scriptTag.getAttribute(
          "data-product"
        ) || ""
      ).trim().toLowerCase()
    : "";

  const API_URL =
    "https://fomotoolkit-kaufdaten.essertmatthias.workers.dev/";

  const FEED_URL =
    API_URL +
    (
      productKey
        ? "?product=" +
          encodeURIComponent(productKey)
        : ""
    );

  const FIRST_DELAY = 1000;
  const SHOW_DURATION = 8000;
  const NEXT_DELAY = 5000;
  const REFRESH_INTERVAL = 30000;
  const ANIMATION_DURATION = 400;
  const MAX_PURCHASES = 10;

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

  function escapeSvg(value) {
    return String(value).replace(
      /[&<>"']/g,
      char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;"
      })[char]
    );
  }

  function mapUrl(city) {
    const label = escapeSvg(
      String(city || "").slice(0, 24)
    );

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 180 180">

        <rect
          width="180"
          height="180"
          fill="#f1f1ec"/>

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

        <g
          stroke="#fff"
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

        <g
          stroke="#e8c66e"
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

        <g
          stroke="#fff"
          stroke-width="3"
          fill="none">
          <path
            d="M0 105L180 147
               M17 0L110 180
               M0 173L180 14"/>
        </g>

        <rect
          x="8"
          y="76"
          width="164"
          height="29"
          rx="4"
          fill="#ffffff"
          fill-opacity="0.88"/>

        <text
          x="90"
          y="96"
          fill="#525252"
          text-anchor="middle"
          font-family="Arial,sans-serif"
          font-size="14">${label}</text>
      </svg>
    `;

    return (
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(svg)
    );
  }

  function flagForCountry(country) {
    const value = String(
      country || ""
    ).toLowerCase().trim();

    if (
      ["germany", "deutschland", "de"]
        .includes(value)
    ) return "🇩🇪";

    if (
      ["austria", "österreich", "at"]
        .includes(value)
    ) return "🇦🇹";

    if (
      ["switzerland", "schweiz", "ch"]
        .includes(value)
    ) return "🇨🇭";

    return "";
  }

  function timeAgo(dateString) {
    const elapsed =
      Date.now() - Date.parse(dateString);

    if (!Number.isFinite(elapsed)) {
      return "vor kurzem";
    }

    const hours = Math.floor(
      Math.max(0, elapsed) / 3600000
    );

    if (hours < 1) {
      return "gerade eben";
    }

    if (hours < 24) {
      return (
        "vor " + hours + " " +
        (
          hours === 1
            ? "Stunde"
            : "Stunden"
        )
      );
    }

    if (hours < 48) return "vor einem Tag";
    if (hours < 72) return "vor zwei Tagen";

    return "vor kurzem";
  }

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

    @media (hover: hover) {
      #social-proof-popup.fomo-visible:hover {
        bottom: 22px;
      }
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
      transition: transform .3s ease;
      transform: translateY(0);
    }

    #social-proof-popup.fomo-visible.fomo-engaged
    .fomo-card {
      transform: translateY(-10px);
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

      #social-proof-popup .fomo-card {
        gap: 8px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #social-proof-popup,
      #social-proof-popup .fomo-card {
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
          alt="Schematische Kartenillustration">

        <div class="fomo-text">

          <div class="fomo-top">
            <span class="fomo-name"></span>
            <span class="fomo-city"></span>
            <span class="fomo-flag"></span>
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
            <span class="fomo-trust">
              Kaufmeldung
            </span>
          </div>

        </div>

        <button
          class="fomo-close"
          type="button"
          aria-label="Schließen">×</button>

      </div>
    `;

    document.body.appendChild(popup);

    const nameEl =
      popup.querySelector(".fomo-name");

    const cityEl =
      popup.querySelector(".fomo-city");

    const flagEl =
      popup.querySelector(".fomo-flag");

    const productEl =
      popup.querySelector(".fomo-product");

    const timeEl =
      popup.querySelector(".fomo-time");

    const mapEl =
      popup.querySelector(".fomo-map");

    const closeEl =
      popup.querySelector(".fomo-close");

    let items = [];
    let index = 0;
    let active = null;

    let visible = false;
    let dismissed = false;
    let hovered = false;
    let pressed = false;

    let remaining = SHOW_DURATION;
    let startedAt = 0;

    let hideTimer = null;
    let nextTimer = null;
    let animationTimer = null;

    let loading = false;

    function updateTime() {
      if (active) {
        timeEl.textContent =
          timeAgo(active.purchasedAt);
      }
    }

    function render(item) {
      active = item;

      nameEl.textContent = item.name;

      cityEl.textContent = item.city
        ? "(" + item.city + ")"
        : "";

      flagEl.textContent =
        flagForCountry(item.country);

      productEl.textContent = item.product;

      mapEl.src = mapUrl(item.city);

      updateTime();
    }

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
      if (
        dismissed ||
        visible ||
        !items.length
      ) return;

      render(
        items[index % items.length]
      );

      index++;

      visible = true;
      hovered = false;
      pressed = false;
      remaining = SHOW_DURATION;

      clearTimeout(animationTimer);

      popup.classList.remove(
        "fomo-engaged"
      );

      popup.style.display = "block";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!visible || dismissed) return;

          popup.classList.add(
            "fomo-visible"
          );

          resume();
        });
      });
    }

    function schedule(delay) {
      if (
        dismissed ||
        !items.length ||
        nextTimer !== null
      ) return;

      nextTimer = setTimeout(() => {
        nextTimer = null;
        show();
      }, delay);
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

      popup.classList.remove(
        "fomo-visible",
        "fomo-engaged"
      );

      animationTimer = setTimeout(() => {
        if (!visible) {
          popup.style.display = "none";
        }
      }, ANIMATION_DURATION);

      schedule(NEXT_DELAY);
    }

    popup.addEventListener(
      "pointerenter",
      event => {
        if (event.pointerType === "touch") {
          return;
        }

        hovered = true;
        pause();
      }
    );

    popup.addEventListener(
      "pointerleave",
      event => {
        if (event.pointerType === "touch") {
          return;
        }

        hovered = false;
        resume();
      }
    );

    function engage(event) {
      if (
        dismissed ||
        !visible ||
        event.target.closest(".fomo-close")
      ) return;

      pressed = true;
      pause();

      if (
        event.type === "touchstart" ||
        event.pointerType === "touch" ||
        event.pointerType === "pen"
      ) {
        popup.classList.add(
          "fomo-engaged"
        );
      }
    }

    popup.addEventListener(
      "touchstart",
      engage,
      { passive: true }
    );

    popup.addEventListener(
      "pointerdown",
      engage
    );

    popup.querySelector(".fomo-card")
      .addEventListener("click", event => {

        if (
          event.target.closest(".fomo-close")
        ) return;

        if (
          window.matchMedia(
            "(hover: none), (pointer: coarse)"
          ).matches
        ) {
          popup.classList.add(
            "fomo-engaged"
          );
        }
      });

    function release() {
      pressed = false;
      resume();
    }

    popup.addEventListener(
      "touchend",
      release,
      { passive: true }
    );

    popup.addEventListener(
      "touchcancel",
      release,
      { passive: true }
    );

    document.addEventListener(
      "pointerup",
      release
    );

    document.addEventListener(
      "pointercancel",
      release
    );

    window.addEventListener(
      "blur",
      release
    );

    closeEl.addEventListener("click", () => {
      dismissed = true;
      visible = false;

      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
      clearTimeout(animationTimer);

      clearInterval(pollTimer);
      clearInterval(clockTimer);

      popup.remove();
    });

    async function refresh() {
      if (dismissed || loading) return;

      loading = true;

      try {
        const response = await fetch(
          FEED_URL,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            "HTTP " + response.status
          );
        }

        const data = await response.json();

        if (
          data.success !== true ||
          !Array.isArray(data.items)
        ) {
          throw new Error("Invalid feed");
        }

        const updated = data.items

          .filter(item =>
            item &&
            typeof item.name === "string" &&
            item.name.trim() &&
            typeof item.product === "string" &&
            item.product.trim() &&
            Number.isFinite(
              Date.parse(item.purchasedAt)
            )
          )

          .map(item => ({
            name: item.name.slice(0, 45),

            city: String(
              item.city || ""
            ).slice(0, 70),

            country: String(
              item.country || ""
            ).slice(0, 40),

            product: item.product.slice(0, 100),

            purchasedAt: item.purchasedAt
          }))

          .sort((a, b) =>
            Date.parse(b.purchasedAt) -
            Date.parse(a.purchasedAt)
          )

          .slice(0, MAX_PURCHASES);

        const oldNewest = items.length
          ? (
              items[0].name + "|" +
              items[0].product + "|" +
              items[0].purchasedAt
            )
          : "";

        const newNewest = updated.length
          ? (
              updated[0].name + "|" +
              updated[0].product + "|" +
              updated[0].purchasedAt
            )
          : "";

        items = updated;

        if (newNewest !== oldNewest) {
          index = 0;
        }

        if (
          items.length &&
          !visible &&
          nextTimer === null
        ) {
          schedule(FIRST_DELAY);
        }

      } catch (error) {
        console.warn(
          "FomoToolkit: Kaufdaten konnten nicht geladen werden.",
          error
        );

      } finally {
        loading = false;
      }
    }

    const pollTimer = setInterval(
      refresh,
      REFRESH_INTERVAL
    );

    const clockTimer = setInterval(
      updateTime,
      60000
    );

    refresh();
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
