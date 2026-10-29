// i-am-not-an-iphone: an "I'm not an iPhone" checkbox. The check reads the user agent
// in the visitor's browser. Nothing is sent to a server.
(function () {
  'use strict';

  var BUSY_MS = 1200;

  // True when the browser reports an iPhone, using three signals:
  // 1. the user agent names an iPhone
  // 2. the platform is "iPhone" (iOS Safari)
  // 3. desktop-site mode: iOS sends a Mac user agent, but a touch Mac with a
  //    phone-sized screen is an iPhone. iPads have larger screens.
  function isIphone(env) {
    if (/iPhone/.test(env.userAgent || '') || env.platform === 'iPhone') return true;
    var phoneSized = Math.min(env.screenWidth, env.screenHeight) <= 500;
    return env.platform === 'MacIntel' && env.maxTouchPoints > 1 && phoneSized;
  }

  var STYLE = `
    :host { display: inline-block; max-width: 100%; direction: ltr; font-family: system-ui, "Segoe UI", Arial, sans-serif; }
    .card {
      position: relative;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 302px;
      max-width: 100%;
      height: 76px;
      padding: 0 14px 0 12px;
      background: #fff;
      border: 1px solid #c9ced6;
      border-radius: 8px;
      transition: border-color .2s ease, background-color .2s ease;
    }
    .box {
      position: relative;
      flex: 0 0 26px;
      width: 26px;
      height: 26px;
      padding: 0;
      background: #fff;
      border: 2px solid #6b7280;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color .2s ease, border-color .2s ease, transform .15s ease;
    }
    .box:hover:not([aria-disabled="true"]) { border-color: #0f766e; }
    .box:active:not([aria-disabled="true"]) { transform: scale(.92); }
    .box[aria-disabled="true"] { cursor: default; }
    .box:focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
    .spin, .tick { position: absolute; top: 50%; left: 50%; }
    .spin {
      display: none;
      width: 14px;
      height: 14px;
      margin: -7px 0 0 -7px;
      border: 2px solid #d1d5db;
      border-top-color: #0f766e;
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }
    .tick {
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      fill: none;
      stroke: #fff;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0;
      transition: opacity .2s ease;
    }
    .tick path { stroke-dasharray: 24; stroke-dashoffset: 24; transition: stroke-dashoffset .3s ease .1s; }
    .text { flex: 1; direction: rtl; text-align: left; font-size: 16px; line-height: 1.35; color: #1f2937; transition: color .2s ease; }
    .icon { flex: 0 0 24px; width: 24px; height: 24px; fill: none; stroke: #9ca3af; stroke-width: 1.8; stroke-linecap: round; }

    .card[data-state="busy"] .box { border-color: #0f766e; }
    .card[data-state="busy"] .spin { display: block; }
    .card[data-state="pass"] { border-color: #0f766e; }
    .card[data-state="pass"] .box { background: #0f766e; border-color: #0f766e; }
    .card[data-state="pass"] .tick { opacity: 1; }
    .card[data-state="pass"] .tick path { stroke-dashoffset: 0; }
    .card[data-state="pass"] .text { color: #0f766e; }
    .card[data-state="fail"] { border-color: #b91c1c; animation: shake .4s ease; }
    .card[data-state="fail"] .box { border-color: #b91c1c; }
    .card[data-state="fail"] .text { color: #b91c1c; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      50% { transform: translateX(6px); }
      75% { transform: translateX(-3px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .card, .box, .spin, .tick, .tick path, .text { animation: none !important; transition: none !important; }
    }
  `;

  var MARKUP = `
    <div class="card" data-state="idle">
      <button type="button" class="box" role="checkbox" aria-checked="false" aria-describedby="text">
        <span class="spin" aria-hidden="true"></span>
        <svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
      </button>
      <span class="text" id="text" aria-live="polite">אני לא אייפון</span>
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="7" y="2" width="10" height="20" rx="2.5"/>
        <path d="M11 18.5h2"/>
        <path d="M3.5 3.5l17 17"/>
      </svg>
    </div>
  `;

  function mount(host) {
    if (host.shadowRoot) return;

    var shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>' + STYLE + '</style>' + MARKUP;

    var card = shadow.querySelector('.card');
    var box = shadow.querySelector('.box');
    var text = shadow.querySelector('.text');

    box.addEventListener('click', function () {
      if (card.getAttribute('data-state') !== 'idle') return;

      card.setAttribute('data-state', 'busy');
      box.setAttribute('aria-checked', 'true');
      box.setAttribute('aria-disabled', 'true');
      text.textContent = 'בודק...';

      setTimeout(function () {
        var iphone = isIphone({
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          maxTouchPoints: navigator.maxTouchPoints,
          screenWidth: screen.width,
          screenHeight: screen.height
        });
        card.setAttribute('data-state', iphone ? 'fail' : 'pass');
        text.textContent = iphone
          ? 'האימות נכשל: נראה שמדובר באייפון'
          : 'האימות עבר: לא מדובר באייפון';
      }, BUSY_MS);
    });
  }

  function mountAll() {
    var hosts = document.querySelectorAll('[data-not-an-iphone]');
    for (var i = 0; i < hosts.length; i++) mount(hosts[i]);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isIphone: isIphone };
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountAll);
    } else {
      mountAll();
    }
  }
})();
