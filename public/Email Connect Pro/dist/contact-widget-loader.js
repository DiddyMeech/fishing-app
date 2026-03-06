/**
 * Contact Widget Loader — v3 with webhook, spam protection, a11y & animations
 *
 * USAGE:
 *   <script src="https://YOUR-EMBED-APP.netlify.app/contact-widget-loader.js"></script>
 *
 * Optional target container:
 *   <div id="contact-widget"></div>
 *
 * DATA ATTRIBUTES (all optional):
 *   data-title        — Heading text              (default: "Contact Us")
 *   data-description  — Subheading text            (default: "Send us a message…")
 *   data-accent       — Primary/button color hex   (default: "#6366f1")
 *   data-bg           — Card background hex        (default: "#ffffff")
 *   data-text         — Text color hex             (default: "#111111")
 *   data-muted        — Muted/description color    (default: "#6b7280")
 *   data-border       — Border color hex           (default: "#e5e7eb")
 *   data-radius       — Border radius in px        (default: "12")
 *   data-font         — Font family CSS value      (default: system stack)
 *   data-logo         — Logo image URL (shown in header, max 32px tall)
 *   data-app-name     — App name shown next to logo
 *   data-btn-text     — Submit button label        (default: "Send Message")
 *   data-success-title— Success heading            (default: "Message Sent!")
 *   data-position     — "inline" | "bottom-right" | "bottom-left"
 *   data-dark         — "true" to use dark defaults (overridden by explicit colors)
 *   data-webhook      — URL to POST form data to   (optional)
 *   data-powered-by   — "false" to hide footer     (default: "true")
 *   data-powered-by-name — Name in footer          (default: appName or "Us")
 *   data-powered-by-url  — Link in footer          (optional)
 */
(function () {
  /* ── Read config from script tag ── */
  var scripts = document.getElementsByTagName("script");
  var s = scripts[scripts.length - 1];
  var attr = function (k, d) { return s.getAttribute("data-" + k) || d; };

  var darkAttr = attr("dark", "false");
  var isDark = darkAttr === "true" || (darkAttr === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);

  var darkColors = { bg: "#1f2937", text: "#f9fafb", muted: "#9ca3af", border: "#374151", inputBg: "#111827", inputBorder: "#4b5563" };
  var lightColors = { bg: "#ffffff", text: "#111111", muted: "#6b7280", border: "#e5e7eb", inputBg: "#ffffff", inputBorder: "#d1d5db" };
  var palette = isDark ? darkColors : lightColors;

  var cfg = {
    title:        attr("title", "Contact Us"),
    description:  attr("description", "Send us a message and we\u2019ll respond shortly."),
    accent:       attr("accent", "#6366f1"),
    bg:           attr("bg", palette.bg),
    text:         attr("text", palette.text),
    muted:        attr("muted", palette.muted),
    border:       attr("border", palette.border),
    inputBg:      palette.inputBg,
    inputBorder:  palette.inputBorder,
    radius:       attr("radius", "12"),
    font:         attr("font", "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"),
    logo:         attr("logo", ""),
    appName:      attr("app-name", ""),
    btnText:      attr("btn-text", "Send Message"),
    successTitle: attr("success-title", "Message Sent!"),
    position:     attr("position", "inline"),
    webhook:      attr("webhook", ""),
    poweredBy:    attr("powered-by", "true") !== "false",
    poweredByName: attr("powered-by-name", ""),
    poweredByUrl: attr("powered-by-url", ""),
  };

  /* ── Helpers ── */
  function esc(str) { var d = document.createElement("div"); d.appendChild(document.createTextNode(str)); return d.innerHTML; }
  function rgba(hex, a) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return "rgba(" + parseInt(hex.slice(0,2),16) + "," + parseInt(hex.slice(2,4),16) + "," + parseInt(hex.slice(4,6),16) + "," + a + ")";
  }

  var r = cfg.radius + "px";
  var halfR = Math.max(4, Math.round(cfg.radius * 0.67)) + "px";

  /* ── Inject styles ── */
  var style = document.createElement("style");
  document.head.appendChild(style);

  function updateStyles() {
    style.textContent = [
      ".cw-root *,.cw-root *::before,.cw-root *::after{box-sizing:border-box;margin:0;padding:0;}",
      ".cw-root{font-family:" + cfg.font + ";line-height:1.5;color:" + cfg.text + ";}",

      ".cw-fab{position:fixed;bottom:1.25rem;z-index:99999;width:56px;height:56px;border-radius:50%;border:none;background:" + cfg.accent + ";color:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;transition:transform .2s;}",
      ".cw-fab:hover{transform:scale(1.08);}",
      cfg.position === "bottom-left" ? ".cw-fab{left:1.25rem;}" : ".cw-fab{right:1.25rem;}",

      ".cw-panel{position:fixed;bottom:5rem;z-index:99999;width:380px;max-width:calc(100vw - 2rem);max-height:calc(100vh - 7rem);overflow-y:auto;border-radius:" + r + ";background:" + cfg.bg + ";border:1px solid " + cfg.border + ";box-shadow:0 8px 30px rgba(0,0,0,0.12);opacity:0;transform:translateY(12px) scale(0.96);transition:opacity .2s,transform .2s,background .3s,border-color .3s;pointer-events:none;}",
      ".cw-panel.cw-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}",
      cfg.position === "bottom-left" ? ".cw-panel{left:1.25rem;}" : ".cw-panel{right:1.25rem;}",

      ".cw-card{background:" + cfg.bg + ";border:1px solid " + cfg.border + ";border-radius:" + r + ";box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;max-width:420px;margin:0 auto;transition:background .3s,border-color .3s;}",
      ".cw-panel .cw-card{border:none;box-shadow:none;border-radius:0;}",

      ".cw-brand{display:flex;align-items:center;gap:.5rem;margin-bottom:.25rem;}",
      ".cw-brand img{height:32px;width:auto;object-fit:contain;}",
      ".cw-brand span{font-size:1rem;font-weight:600;color:" + cfg.text + ";}",

      ".cw-header{padding:1.25rem 1.5rem .25rem;}",
      ".cw-header h2{font-size:1.125rem;font-weight:600;color:" + cfg.text + ";}",
      ".cw-header p{font-size:.875rem;color:" + cfg.muted + ";margin-top:.25rem;}",
      ".cw-body{padding:1rem 1.5rem 1.5rem;}",

      ".cw-field{margin-bottom:1rem;}",
      ".cw-field label{display:block;font-size:.875rem;font-weight:500;color:" + cfg.text + ";margin-bottom:.375rem;}",
      ".cw-field input,.cw-field textarea{width:100%;padding:.5rem .75rem;border:1px solid " + cfg.inputBorder + ";border-radius:" + halfR + ";font-size:.875rem;font-family:inherit;outline:none;transition:border-color .15s,background .3s,color .3s;background:" + cfg.inputBg + ";color:" + cfg.text + ";}",
      ".cw-field input:focus,.cw-field textarea:focus{border-color:" + cfg.accent + ";box-shadow:0 0 0 2px " + rgba(cfg.accent, 0.15) + ";}",
      ".cw-field textarea{resize:vertical;min-height:80px;}",
      ".cw-field .cw-err-border{border-color:#ef4444!important;}",
      ".cw-field .cw-err{font-size:.75rem;color:#ef4444;margin-top:.25rem;}",
      ".cw-field input::placeholder,.cw-field textarea::placeholder{color:" + cfg.muted + ";}",

      ".cw-hp{position:absolute!important;left:-9999px!important;top:-9999px!important;opacity:0!important;height:0!important;width:0!important;overflow:hidden!important;pointer-events:none!important;tab-index:-1!important;}",

      ".cw-btn{width:100%;padding:.625rem;background:" + cfg.accent + ";color:#fff;border:none;border-radius:" + halfR + ";font-size:.875rem;font-weight:500;cursor:pointer;transition:opacity .15s;}",
      ".cw-btn:hover{opacity:.9;}",
      ".cw-btn:disabled{opacity:.6;cursor:not-allowed;}",

      "@keyframes cw-fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}",
      "@keyframes cw-spin{to{transform:rotate(360deg);}}",
      ".cw-animate-in{animation:cw-fadeIn .3s ease-out both;}",
      ".cw-spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:cw-spin .6s linear infinite;vertical-align:middle;margin-right:.5rem;}",

      ".cw-success{text-align:center;padding:2rem 1.5rem;}",
      ".cw-success svg{width:48px;height:48px;margin:0 auto 1rem;color:" + cfg.accent + ";}",
      ".cw-success h2{font-size:1.25rem;font-weight:600;color:" + cfg.text + ";}",
      ".cw-success p{font-size:.875rem;color:" + cfg.muted + ";margin-top:.5rem;}",
      ".cw-success button{margin-top:1rem;padding:.5rem 1.25rem;background:transparent;border:1px solid " + cfg.border + ";border-radius:" + halfR + ";font-size:.875rem;cursor:pointer;color:" + cfg.text + ";transition:background .15s,color .3s,border-color .3s;}",
      ".cw-success button:hover{background:" + rgba(cfg.text, 0.05) + ";}",

      ".cw-alert{padding:.75rem 1rem;border-radius:" + halfR + ";font-size:.8125rem;margin-bottom:1rem;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;}",

      ".cw-powered{text-align:center;padding:.5rem 1rem .75rem;font-size:.6875rem;color:" + cfg.muted + ";}",
      ".cw-powered a{color:" + cfg.accent + ";text-decoration:none;font-weight:500;}",
      ".cw-powered a:hover{text-decoration:underline;}",

      "@media(max-width:480px){.cw-panel{left:.5rem;right:.5rem;width:auto;bottom:4.5rem;}}"
    ].join("\n");
  }
  updateStyles();

  /* ── Auto-switch on OS theme change (only when data-dark="auto") ── */
  if (darkAttr === "auto" && window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      var np = e.matches ? darkColors : lightColors;
      cfg.bg = attr("bg", np.bg); cfg.text = attr("text", np.text); cfg.muted = attr("muted", np.muted);
      cfg.border = attr("border", np.border); cfg.inputBg = np.inputBg; cfg.inputBorder = np.inputBorder;
      updateStyles(); render();
    });
  }

  /* ── State ── */
  var state = { name: "", email: "", message: "", errors: {}, submitted: false, loading: false, webhookError: "" };
  var isOpen = false;

  /* ── DOM ── */
  var root = document.createElement("div");
  root.className = "cw-root";
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", "Contact form");
  var isFloating = cfg.position === "bottom-right" || cfg.position === "bottom-left";
  var fab, panel;

  if (isFloating) {
    fab = document.createElement("button");
    fab.className = "cw-fab";
    fab.setAttribute("aria-label", "Open contact form");
    fab.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    fab.addEventListener("click", function () { isOpen = !isOpen; togglePanel(); });
    root.appendChild(fab);
    panel = document.createElement("div");
    panel.className = "cw-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", cfg.title);
    root.appendChild(panel);
  }

  var target = isFloating ? panel : root;
  var mount = document.getElementById("contact-widget") || document.body;
  mount.appendChild(root);

  function togglePanel() {
    if (panel) {
      panel.classList.toggle("cw-open", isOpen);
      if (isOpen) {
        // Short delay so DOM is rendered before focusing
        setTimeout(function () {
          var firstInput = panel.querySelector("input:not([tabindex='-1']),textarea,button");
          if (firstInput) firstInput.focus();
        }, 50);
      }
    }
  }

  /* ── Keyboard: Escape to close + focus trapping ── */
  if (isFloating) {
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") {
        isOpen = false;
        togglePanel();
        fab.focus();
        return;
      }
      // Focus trap: keep Tab within the panel
      if (e.key === "Tab" && panel) {
        var focusable = panel.querySelectorAll('input:not([tabindex="-1"]),textarea,button,[tabindex="0"],a[href]');
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  /* ── Brand HTML ── */
  function brandHtml() {
    if (!cfg.logo && !cfg.appName) return "";
    var h = '<div class="cw-brand">';
    if (cfg.logo) h += '<img src="' + esc(cfg.logo) + '" alt="' + esc(cfg.appName || "Logo") + '" />';
    if (cfg.appName) h += '<span>' + esc(cfg.appName) + '</span>';
    return h + '</div>';
  }

  function poweredByHtml() {
    if (!cfg.poweredBy) return "";
    var name = cfg.poweredByName || cfg.appName || "Us";
    var h = '<div class="cw-powered">Powered by ';
    if (cfg.poweredByUrl) {
      h += '<a href="' + esc(cfg.poweredByUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(name) + '</a>';
    } else {
      h += esc(name);
    }
    return h + '</div>';
  }

  /* ── Webhook POST ── */
  function postWebhook(detail, callback) {
    if (!cfg.webhook) { callback(null); return; }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", cfg.webhook, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.timeout = 10000;
    xhr.onload = function () {
      callback(xhr.status >= 200 && xhr.status < 300 ? null : "Server returned " + xhr.status);
    };
    xhr.onerror = function () { callback("Network error — please try again."); };
    xhr.ontimeout = function () { callback("Request timed out — please try again."); };
    xhr.send(JSON.stringify(detail));
  }

  /* ── Render ── */
  function render() {
    var checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    var footer = poweredByHtml();

    if (state.submitted) {
      target.innerHTML =
        '<div class="cw-card"><div class="cw-success cw-animate-in" aria-live="polite">' + checkSvg +
        '<h2>' + esc(cfg.successTitle) + '</h2>' +
        '<p>Thanks, ' + esc(state.name.trim()) + '. We\u2019ll get back to you at ' + esc(state.email.trim()) + '.</p>' +
        '<button id="cw-reset">Send another</button></div>' + footer + '</div>';
      document.getElementById("cw-reset").addEventListener("click", function () {
        state = { name: "", email: "", message: "", errors: {}, submitted: false, loading: false, webhookError: "" };
        render();
      });
      return;
    }

    var en = state.errors.name || "", ee = state.errors.email || "", em = state.errors.message || "";
    var alertHtml = state.webhookError ? '<div class="cw-alert" role="alert">' + esc(state.webhookError) + '</div>' : '';
    var btnContent = state.loading ? '<span class="cw-spinner"></span>Sending\u2026' : esc(cfg.btnText);

    target.innerHTML =
      '<div class="cw-card cw-animate-in">' +
      '<div class="cw-header">' + brandHtml() + '<h2>' + esc(cfg.title) + '</h2><p>' + esc(cfg.description) + '</p></div>' +
      '<div class="cw-body"><form id="cw-form" novalidate>' +
      alertHtml +
      /* Honeypot field — invisible to humans */
      '<div class="cw-hp" aria-hidden="true"><label for="cw-website">Website</label><input id="cw-website" name="website" type="text" tabindex="-1" autocomplete="off" /></div>' +
      '<div class="cw-field"><label for="cw-n">Name</label><input id="cw-n" placeholder="Your name" autocomplete="name" class="' + (en ? "cw-err-border" : "") + '" value="' + esc(state.name) + '"/>' + (en ? '<div class="cw-err">' + en + '</div>' : '') + '</div>' +
      '<div class="cw-field"><label for="cw-e">Email</label><input id="cw-e" type="email" placeholder="you@example.com" autocomplete="email" class="' + (ee ? "cw-err-border" : "") + '" value="' + esc(state.email) + '"/>' + (ee ? '<div class="cw-err">' + ee + '</div>' : '') + '</div>' +
      '<div class="cw-field"><label for="cw-m">Message</label><textarea id="cw-m" placeholder="How can we help?" rows="4" class="' + (em ? "cw-err-border" : "") + '">' + esc(state.message) + '</textarea>' + (em ? '<div class="cw-err">' + em + '</div>' : '') + '</div>' +
      '<button type="submit" class="cw-btn"' + (state.loading ? ' disabled' : '') + '>' + btnContent + '</button>' +
      '</form></div>' + footer + '</div>';

    document.getElementById("cw-n").addEventListener("input", function (e) { state.name = e.target.value; });
    document.getElementById("cw-e").addEventListener("input", function (e) { state.email = e.target.value; });
    document.getElementById("cw-m").addEventListener("input", function (e) { state.message = e.target.value; });
    document.getElementById("cw-form").addEventListener("submit", function (e) {
      e.preventDefault();
      /* Honeypot check */
      var hp = document.getElementById("cw-website");
      if (hp && hp.value) return; /* bot detected — silently ignore */
      if (state.loading) return;

      if (validate()) {
        var detail = { name: state.name.trim(), email: state.email.trim(), message: state.message.trim(), timestamp: new Date().toISOString() };
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent("contactWidgetSubmit", { detail: detail }));

        if (cfg.webhook) {
          state.loading = true;
          state.webhookError = "";
          render();
          postWebhook(detail, function (err) {
            state.loading = false;
            if (err) {
              state.webhookError = err;
            } else {
              state.submitted = true;
            }
            render();
          });
        } else {
          state.submitted = true;
          render();
        }
      } else {
        render();
      }
    });
  }

  function validate() {
    var e = {};
    var n = state.name.trim(), em = state.email.trim(), m = state.message.trim();
    if (!n) e.name = "Name is required"; else if (n.length > 100) e.name = "Under 100 characters";
    if (!em) e.email = "Email is required"; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) e.email = "Invalid email"; else if (em.length > 255) e.email = "Under 255 characters";
    if (!m) e.message = "Message is required"; else if (m.length > 1000) e.message = "Under 1000 characters";
    state.errors = e;
    return Object.keys(e).length === 0;
  }

  render();
})();
