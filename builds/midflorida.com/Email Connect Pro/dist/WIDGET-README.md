# Embeddable Widgets — Integration Guide

> **Two production-ready widgets**: a Contact Form and an Adaptive Email Login, both embeddable on any website via iframe or script tag.

---

## 📁 File Manifest

Copy these files into your project:

### Contact Widget (Zero dependencies — vanilla JS)
| File | Purpose |
|------|---------|
| `public/contact-widget-loader.js` | Script-tag loader — add a `<script>` tag to any page |
| `public/contact-widget.html` | Standalone HTML page — embed via iframe |
| `public/embed-snippet.html` | Ready-to-paste iframe embed code for the contact widget |

### Email Login Widget (Requires React project)
| File | Purpose |
|------|---------|
| `src/pages/EmailLogin.tsx` | Embeddable inline login page at `/email-login` |
| `src/components/EmailLoginModal.tsx` | Modal version of the login (for same-page use) |
| `src/hooks/useEmailVerification.ts` | MX record verification hook (calls the edge function) |
| `src/hooks/useIframeResize.ts` | Auto-resize iframe height via postMessage |
| `src/lib/providerConfig.ts` | Email provider detection, logos, and theme colors |
| `public/email-login-snippet.html` | Ready-to-paste iframe embed code for the login widget |
| `supabase/functions/verify-email-provider/index.ts` | Edge function for MX record lookup (required for custom domain detection) |

### ⚠️ Legacy file — do NOT use
| File | Purpose |
|------|---------|
| `src/pages/Embed.tsx` | **Legacy** contact form (React). Superseded by `contact-widget-loader.js` and `contact-widget.html`. Safe to delete. |

### Required npm dependencies (for Email Login only)
```
framer-motion
lucide-react
react-router-dom
@supabase/supabase-js
```

### Edge Function — MX Verification

The Email Login widget uses a backend function (`verify-email-provider`) to detect email providers for custom domains (e.g., Google Workspace, Microsoft 365). The hook `useEmailVerification.ts` calls it via `supabase.functions.invoke("verify-email-provider", { body: { domain } })`.

**If you self-host**: Deploy the edge function at `supabase/functions/verify-email-provider/index.ts` to your Supabase project, or replace the call in `useEmailVerification.ts` with your own API endpoint that accepts `{ domain: string }` and returns `{ verified: boolean, provider: string | null }`.

### Route registration
Add to your router:
```tsx
import EmailLogin from "./pages/EmailLogin";
// ...
<Route path="/email-login" element={<EmailLogin />} />
```

---

## 🎨 Contact Widget — Configuration

### Method 1: Script Tag (`contact-widget-loader.js`)

```html
<script
  src="https://your-site.com/contact-widget-loader.js"
  data-title="Get in Touch"
  data-accent="#e11d48"
  data-dark="true"
  data-position="bottom-right"
  data-webhook="https://your-api.com/contact"
></script>
```

Optional target container:
```html
<div id="contact-widget"></div>
```

#### Data Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-title` | string | `"Contact Us"` | Form heading |
| `data-description` | string | `"Send us a message…"` | Subheading text |
| `data-accent` | hex | `"#6366f1"` | Primary/button color |
| `data-bg` | hex | `"#ffffff"` | Card background |
| `data-text` | hex | `"#111111"` | Text color |
| `data-muted` | hex | `"#6b7280"` | Muted/description color |
| `data-border` | hex | `"#e5e7eb"` | Border color |
| `data-radius` | number | `"12"` | Border radius in px |
| `data-font` | string | system stack | CSS font-family value |
| `data-logo` | URL | — | Logo image URL (max 32px tall) |
| `data-app-name` | string | — | App name shown in header |
| `data-btn-text` | string | `"Send Message"` | Submit button label |
| `data-success-title` | string | `"Message Sent!"` | Success heading |
| `data-position` | string | `"inline"` | `"inline"`, `"bottom-right"`, or `"bottom-left"` |
| `data-dark` | string | `"false"` | `"true"` for dark, `"auto"` to detect OS `prefers-color-scheme` (live-switches on change) |
| `data-webhook` | URL | — | URL to POST form data (JSON) |
| `data-powered-by` | boolean | `"true"` | `"false"` to hide footer |
| `data-powered-by-name` | string | appName or `"Us"` | Name in "Powered by" footer |
| `data-powered-by-url` | URL | — | Link in "Powered by" footer |

### Method 2: iframe (`contact-widget.html`)

```html
<iframe
  src="https://your-site.com/contact-widget.html?accent=%23e11d48&dark=true&appName=My+App"
  style="width: 100%; border: none; min-height: 400px; max-width: 480px;"
  title="Contact Form"
></iframe>
```

#### URL Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | `"Contact Us"` | Form heading |
| `description` | string | `"Send us a message…"` | Subheading |
| `accent` | hex (URL-encoded) | `#6366f1` | Primary color |
| `bg` | hex | `#ffffff` / dark: `#1f2937` | Background |
| `text` | hex | `#111111` / dark: `#f9fafb` | Text color |
| `muted` | hex | `#6b7280` / dark: `#9ca3af` | Muted color |
| `border` | hex | `#e5e7eb` / dark: `#374151` | Border color |
| `radius` | number | `12` | Border radius (px) |
| `font` | string | system stack | Font family |
| `logo` | URL | — | Logo URL |
| `appName` | string | — | App name |
| `btnText` | string | `"Send Message"` | Button label |
| `successTitle` | string | `"Message Sent!"` | Success heading |
| `dark` | string | `false` | `true` for dark, `auto` to detect OS preference (live-switches) |
| `webhook` | URL | — | POST endpoint |
| `poweredBy` | boolean | `true` | Show footer |
| `poweredByName` | string | — | Footer name |
| `poweredByUrl` | URL | — | Footer link |

---

## 🔐 Email Login Widget — Configuration

### Embed via iframe

```html
<iframe
  src="https://your-site.com/email-login"
  style="width: 100%; border: none; min-height: 480px; max-width: 480px; margin: 0 auto; display: block;"
  title="Email Login"
></iframe>
```

### Features
- **Adaptive branding** — UI morphs colors/logo based on detected email provider (Gmail, Outlook, Yahoo, iCloud, etc.)
- **MX record verification** — validates custom domain providers via edge function
- **Three views** — Login, Signup, Forgot Password with animated transitions
- **Provider blocking** — blocks unrecognized/disposable email providers
- **Browser autofill** — proper `autocomplete` attributes for password managers

### Supported Providers (built-in)
Gmail, Outlook/Hotmail, Yahoo, iCloud, AOL, ProtonMail, Zoho, FastMail, Tuta, AT&T, Comcast, Verizon, Spectrum, Cox, and custom domains via MX lookup (Google Workspace, Microsoft 365).

---

## 📡 Events & Callbacks

### Contact Widget Events

#### CustomEvent (same-page script tag)
```javascript
window.addEventListener("contactWidgetSubmit", function(e) {
  console.log(e.detail);
  // { name: "John", email: "john@example.com", message: "Hello!", timestamp: "2025-..." }
});
```

#### postMessage (iframe)
```javascript
window.addEventListener("message", function(e) {
  if (e.data?.type === "CONTACT_WIDGET_SUBMIT") {
    console.log(e.data.data);
    // { name, email, message, timestamp }
  }
  if (e.data?.type === "IFRAME_HEIGHT") {
    document.getElementById("my-iframe").style.height = e.data.height + "px";
  }
});
```

### Email Login Widget Events

#### postMessage (iframe)
```javascript
window.addEventListener("message", function(e) {
  if (e.data?.type === "EMAIL_LOGIN_SUBMIT") {
    console.log(e.data.data);
    // { type: "login"|"signup"|"forgot", email, provider, timestamp }
  }
  if (e.data?.type === "IFRAME_HEIGHT") {
    document.getElementById("login-iframe").style.height = e.data.height + "px";
  }
});
```

#### CustomEvent (same-page)
```javascript
window.addEventListener("emailLoginSubmit", function(e) {
  console.log(e.detail);
  // { type: "login"|"signup"|"forgot", email, provider, timestamp }
});
```

---

## 🔒 Webhook — POST Payload

When `data-webhook` or `webhook` URL parameter is set, the contact widget POSTs:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to learn more.",
  "timestamp": "2025-03-04T12:00:00.000Z"
}
```

**Headers:** `Content-Type: application/json`
**Timeout:** 10 seconds
**Error handling:** Shows inline error alert with retry capability

### Compatible webhook services
- **Formspree** — `https://formspree.io/f/YOUR_ID`
- **Make.com** — custom webhook URL
- **Zapier** — webhook trigger URL
- **n8n** — webhook node URL
- **Custom API** — any endpoint accepting JSON POST

---

## 🛡️ Security Features

| Feature | Details |
|---------|---------|
| **Honeypot** | Hidden field catches bots; silently ignores submissions |
| **Input validation** | Name (100 chars), email (255 chars, regex), message (1000 chars) |
| **HTML escaping** | All user input is escaped before rendering |
| **Focus trapping** | Floating panel traps Tab/Shift+Tab within the widget |
| **Keyboard nav** | Escape closes floating panel, returns focus to trigger |
| **ARIA** | `role="dialog"`, `aria-label`, `aria-live="polite"` on success |

---

## 🎯 Quick Start Examples

### Minimal contact widget (bottom-right floating)
```html
<script src="/contact-widget-loader.js" data-position="bottom-right"></script>
```

### Branded dark contact widget with webhook
```html
<script
  src="/contact-widget-loader.js"
  data-accent="#e11d48"
  data-dark="true"
  data-position="bottom-right"
  data-logo="https://mysite.com/logo.svg"
  data-app-name="Acme Inc"
  data-webhook="https://formspree.io/f/abc123"
></script>
```

### Inline contact form (in a div)
```html
<div id="contact-widget"></div>
<script src="/contact-widget-loader.js" data-title="Send Feedback" data-accent="#059669"></script>
```

### Email login in a page
```html
<iframe src="/email-login" style="width:100%;border:none;min-height:480px;max-width:480px;margin:0 auto;display:block;" title="Login"></iframe>
```
