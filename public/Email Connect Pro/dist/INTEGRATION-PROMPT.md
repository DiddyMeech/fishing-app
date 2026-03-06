# AI Agent Prompt — Integrate Contact & Email Login Widgets

Use this prompt in any AI coding agent (Cline, Antigravity, Cursor, Copilot, etc.) to integrate the embeddable widgets into your existing website. Copy the entire block below.

---

## Prompt

```
I have two embeddable widgets I need to integrate into this project. Before writing any code, READ these files IN ORDER to understand how they work:

**STEP 1 — Read the widget source files:**
1. `public/WIDGET-README.md` — Full documentation with every data attribute, URL parameter, and event
2. `public/contact-widget-loader.js` — Contact form script-tag loader (vanilla JS, zero dependencies)
3. `public/contact-widget.html` — Standalone contact widget (iframe-embeddable)
4. `public/embed-snippet.html` — Ready-to-paste iframe embed snippet for the contact widget
5. `public/email-login-snippet.html` — Ready-to-paste iframe embed snippet for the email login widget
6. `src/pages/EmailLogin.tsx` — Embeddable email login page (React)
7. `src/lib/providerConfig.ts` — Email provider detection and theming config
8. `src/hooks/useEmailVerification.ts` — MX record verification hook (calls the edge function below)
9. `src/hooks/useIframeResize.ts` — Iframe auto-resize hook
10. `src/components/EmailLoginModal.tsx` — Modal version of the login widget
11. `supabase/functions/verify-email-provider/index.ts` — Edge function for MX record lookup (required for custom domain email detection)

**⚠️ IGNORE these legacy files — do NOT integrate them:**
- `src/pages/Embed.tsx` — Old React contact form, superseded by the vanilla JS widget

**STEP 2 — Read MY site's design system to extract colors:**
- Read my main CSS file (e.g. `src/index.css`, `styles/globals.css`, or `app/globals.css`) to find CSS custom properties like `--primary`, `--background`, `--foreground`, `--accent`, `--muted`, `--border`, `--radius`
- Read my Tailwind config (`tailwind.config.ts` or `tailwind.config.js`) to find theme colors
- Read my layout/header/nav components to understand the visual style and font stack
- If I use a component library (shadcn, MUI, Chakra), check its theme config
- Check if my site has dark mode — if so, extract BOTH light and dark color sets

**STEP 3 — Convert my colors from HSL to hex:**
Use this mapping to translate my design tokens into widget attributes:

| My CSS Variable       | Widget Attribute     | Format     |
|-----------------------|----------------------|------------|
| `--primary`           | `data-accent`        | hex        |
| `--background`        | `data-bg`            | hex        |
| `--foreground`        | `data-text`          | hex        |
| `--muted-foreground`  | `data-muted`         | hex        |
| `--border`            | `data-border`        | hex        |
| `--radius`            | `data-radius`        | number only|
| `font-family`         | `data-font`          | CSS string |

Conversion example: `hsl(222, 47%, 11%)` → `#0f172a`

**STEP 4 — Integrate the widgets:**

1. **Contact Widget** — Add the script-tag loader to my contact page (or footer/layout):
   ```html
   <script
     src="/contact-widget-loader.js"
     data-accent="#CONVERTED_PRIMARY"
     data-bg="#CONVERTED_BG"
     data-text="#CONVERTED_TEXT"
     data-muted="#CONVERTED_MUTED"
     data-border="#CONVERTED_BORDER"
     data-radius="MY_RADIUS"
     data-font="MY_FONT_STACK"
     data-dark="auto"
     data-position="bottom-right"
     data-app-name="MY_APP_NAME"
   ></script>
   ```
   - Use `data-dark="auto"` to auto-detect OS dark mode and live-switch themes
   - Use `data-position="inline"` to embed in a `<div id="contact-widget">` instead of floating
   - If I have a webhook endpoint (Formspree, Make, Zapier, n8n, custom API), set `data-webhook`

2. **Email Login Widget** — Two options:
   - **Option A (iframe):** Use the snippet from `public/email-login-snippet.html` — paste it wherever I want a login form. Replace the URL with my deployed domain.
   - **Option B (React route):** Add `/email-login` to my React router:
     ```tsx
     import EmailLogin from "./pages/EmailLogin";
     <Route path="/email-login" element={<EmailLogin />} />
     ```
   - The login widget self-themes based on the email provider — no color config needed
   - Make sure the page background is transparent or matches my site

3. **No-Supabase Setup (Common Providers Only)** — If your project does NOT use Supabase, skip the edge function and replace `src/hooks/useEmailVerification.ts` with this client-side-only version:

   ```ts
   import { useState, useEffect, useRef } from "react";
   import { isKnownDomain } from "@/lib/providerConfig";

   export type VerificationStatus = "idle" | "known" | "blocked";

   interface VerificationResult {
     status: VerificationStatus;
     mxProvider: string | null;
     mxTheme: null;
   }

   export function useEmailVerification(email: string): VerificationResult {
     const [status, setStatus] = useState<VerificationStatus>("idle");
     const debounceRef = useRef<ReturnType<typeof setTimeout>>();

     useEffect(() => {
       const atIndex = email.indexOf("@");
       if (atIndex === -1 || atIndex === email.length - 1) {
         setStatus("idle");
         return;
       }
       const domain = email.slice(atIndex + 1).toLowerCase().trim();
       if (!domain || !domain.includes(".")) {
         setStatus("idle");
         return;
       }
       if (isKnownDomain(email)) {
         setStatus("known");
         return;
       }
       // Unknown domain — block after short debounce
       if (debounceRef.current) clearTimeout(debounceRef.current);
       debounceRef.current = setTimeout(() => setStatus("blocked"), 400);
       return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
     }, [email]);

     return { status, mxProvider: null, mxTheme: null };
   }
   ```

   **What works without Supabase:** All provider logos/colors, animated transitions, login/signup/forgot views, browser autofill, iframe resize, all events.
   **What won't work:** Custom domain detection (e.g., john@theircompany.com → Google Workspace). Those emails will show the blocked message instead.

4. **MX Verification Backend (Optional — only if you need custom domain support):**
   - If using Supabase: deploy `supabase/functions/verify-email-provider/index.ts` to your project
   - If using a different backend: create an endpoint that accepts `POST { domain: string }` and returns `{ verified: boolean, provider: string | null }`. Update the Supabase call in `useEmailVerification.ts` to point to your endpoint.

5. **BlockedMessage Component** — The widget includes a fallback UI for unrecognized email providers. It renders provider chips so users know what's supported. Use it in all three views (login, signup, forgot password) between the email input and submit button:

   ```tsx
   const BlockedMessage = ({ isBlocked }: { isBlocked: boolean }) => (
     <AnimatePresence>
       {isBlocked && (
         <motion.div
           className="rounded-xl p-4 text-center space-y-2"
           style={{ backgroundColor: "hsl(0 50% 97%)", border: "1px solid hsl(0 40% 88%)" }}
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: "auto" }}
           exit={{ opacity: 0, height: 0 }}
         >
           <p className="text-xs font-semibold" style={{ color: "hsl(0 60% 40%)" }}>
             This email provider is not recognized
           </p>
           <p className="text-[11px] leading-relaxed" style={{ color: "hsl(0 30% 50%)" }}>
             We currently support major providers only. Please sign in with one of the following:
           </p>
           <div className="flex flex-wrap justify-center gap-1.5 pt-1">
             {["Gmail", "Outlook", "Yahoo", "iCloud", "ProtonMail", "AOL", "Zoho", "FastMail", "Tuta"].map((name) => (
               <span
                 key={name}
                 className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium"
                 style={{ backgroundColor: "hsl(0 30% 93%)", color: "hsl(0 40% 40%)" }}
               >
                 {name}
               </span>
             ))}
           </div>
           <p className="text-[10px] pt-1" style={{ color: "hsl(0 20% 60%)" }}>
             US ISP emails (AT&T, Comcast, Verizon, etc.) are also supported.
           </p>
         </motion.div>
       )}
     </AnimatePresence>
   );
   ```

   Usage: `<BlockedMessage isBlocked={isBlocked} />`

6. **Event Handling** — Wire up widget events to my backend:
   - **Contact form** (script-tag on same page):
     ```javascript
     window.addEventListener("contactWidgetSubmit", (e) => {
       console.log(e.detail); // { name, email, message, timestamp }
     });
     ```
   - **Contact form** (iframe cross-origin):
     ```javascript
     window.addEventListener("message", (e) => {
       if (e.data?.type === "CONTACT_WIDGET_SUBMIT") console.log(e.data.data);
       if (e.data?.type === "IFRAME_HEIGHT") myIframe.style.height = e.data.height + "px";
     });
     ```
   - **Email login** (iframe cross-origin):
     ```javascript
     window.addEventListener("message", (e) => {
       if (e.data?.type === "EMAIL_LOGIN_SUBMIT") console.log(e.data.data);
       // { type: "login"|"signup"|"forgot", email, provider, timestamp }
     });
     ```
   - **Email login** (same-page React):
     ```javascript
     window.addEventListener("emailLoginSubmit", (e) => {
       console.log(e.detail); // { type: "login"|"signup"|"forgot", email, provider, timestamp }
     });
     ```

**STEP 5 — Verify connectivity:**

After integration, confirm the following work correctly:
- [ ] Widget loads without console errors
- [ ] Colors match the host site's design system
- [ ] Contact form submits and fires events (check `contactWidgetSubmit` or `message` events)
- [ ] Email login detects providers correctly (type `test@gmail.com` — should show Google branding)
- [ ] Unrecognized domains show the BlockedMessage with provider chips (Gmail, Outlook, Yahoo, iCloud, ProtonMail, AOL, Zoho, FastMail, Tuta)
- [ ] Iframe auto-resizes (no scrollbars inside the iframe)
- [ ] Dark mode works if `data-dark="auto"` is set
- [ ] Webhook receives POST data (if configured)
- [ ] Cross-origin postMessage events fire correctly (if using iframe)

**STEP 6 — Common issues & fixes:**

| Issue | Fix |
|-------|-----|
| Widget doesn't load | Check script `src` path — must be accessible from the page |
| Colors don't match | Re-extract HSL values and convert to hex; check both light/dark sets |
| Iframe has scrollbars | Add the `message` event listener for `IFRAME_HEIGHT` and set iframe height dynamically |
| Login shows "blocked" for valid emails | Deploy the MX verification edge function, or use the no-Supabase hook (only supports known domains) |
| Contact form doesn't submit | Check `data-webhook` URL; ensure the endpoint accepts JSON POST with CORS headers |
| Dark mode doesn't switch | Use `data-dark="auto"` (not `"true"`) to follow OS preference changes |
| Fonts don't match | Set `data-font` to your exact CSS font-family string including fallbacks |

**RULES:**
- Do NOT modify the widget source files (except `useEmailVerification.ts` if skipping Supabase). Only configure via data attributes, URL params, and event listeners.
- Do NOT integrate `src/pages/Embed.tsx` — it's legacy.
- Do NOT hardcode colors — always extract from my existing design system.
- If my site has dark mode toggling, use `data-dark="auto"` so the contact widget follows the OS preference.
- After integration, run the verification checklist in STEP 5.
```

---

## Tips for best results

- **Point your agent to your CSS first** — The #1 thing is matching your color scheme. Tell it: "Read my CSS variables and convert them to hex for the widget data attributes."
- **Be specific about placement** — Tell it exactly where: "Add the contact widget to my footer" or "Put the login iframe on `/login`"
- **Webhook setup** — If you use Formspree/Make/Zapier, give it the URL: "Set data-webhook to https://formspree.io/f/abc123"
- **Logo** — If you have one, add: "Set data-logo to /logo.svg and data-app-name to My Company"
- **Edge function** — If you're on Supabase, just deploy the function. If not, the agent needs to create a simple MX-lookup API endpoint.
- **Connectivity verification** — After setup, ask your agent to run through the checklist in STEP 5 to confirm everything works end-to-end.
