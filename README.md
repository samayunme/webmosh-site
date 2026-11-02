# WEBMOSH

Marketing, optimization, UK &amp; US company formation, business taxes, business website &amp; hosting, all in one place you can trust.

Static multi-page site: plain HTML, one shared stylesheet and one shared script. No build step, no framework, no dependencies. The only third-party request is Google Fonts.

---

## Hosting (cPanel / Apache)

Production runs on cPanel. Upload the repo contents to `public_html`. `.htaccess` is the real server config:

- **Extensionless URLs**: `/about` serves `about.html`, `/services/seo` serves `services/seo.html`. Links in the HTML are written without `.html` on purpose.
- Caching, compression and security headers.

`Dockerfile`, `nginx.conf` and `security-headers.conf` are kept as an alternative container setup (nginx with the same rewrite rules). They are not used on cPanel.

### Previewing locally

Because links are extensionless, double-clicking `index.html` gives you the styled homepage but internal links will 404 from disk. Use the bundled server, which mirrors the rewrite rules:

```bash
python3 serve.py                # then open http://localhost:8000
```

`python3 -m http.server` does **not** resolve `/about` to `about.html`, so use `serve.py`.

Asset paths are relative (`assets/site.css`), and pages in `services/` use `../assets/...`.

---

## Pages

```
index.html                       homepage (packages, FAQ, enquiry form)
about.html                       /about
contact.html                     /contact (enquiry form at #enquiry)
services/wordpress-development   /services/wordpress-development
services/custom-website          /services/custom-website
services/web-applications        /services/web-applications
services/us-llc                  /services/us-llc
services/uk-ltd                  /services/uk-ltd
services/marketing               /services/marketing
services/seo                     /services/seo
services/tax-return              /services/tax-return
services/bookkeeping             /services/bookkeeping
terms.html, privacy-policy.html, refund-policy.html
404.html
assets/site.css                  the whole design system
assets/site.js                   theme, menus, reveals, enquiry form
assets/globe.js, assets/cobe.js  hero globe (cobe, MIT, vendored)
robots.txt, sitemap.xml
```

### Calls to action

- Sales buttons on service pages ("Get a quote", "Get started", "Request an audit") go to `/contact#enquiry`.
- Homepage CTAs scroll to the on-page `#contact` form.
- "Let's Start" in the dock and every **Login** link open the app at `https://app.webmosh.com`.

---

## Still to do before launch

| Item | What's needed | Where |
|---|---|---|
| Enquiry form backend | Set `ENDPOINT` in `assets/site.js` (Formspree, Web3Forms or your own handler). Until then the form falls back to opening the visitor's mail client. | `assets/site.js` |
| Social share image | Upload `assets/og/webmosh-og.png` (1200x630), then add `og:image`, `og:url` and Twitter card tags to each page's `<head>`. | every page |
| Legal placeholders | Fill every `<i class="todo">` (company number, payment terms, arbitration provider and seat, governing law). Get the dispute and governing-law sections reviewed by an adviser. | `terms.html`, `privacy-policy.html`, `refund-policy.html` |
| WordPress pricing | E-commerce ($250) is priced below Premium ($299) while offering more. Confirm that is intended. | `services/wordpress-development.html` |

---

## Design notes

### The hero globe

A WebGL globe (`assets/globe.js`) drawn by [cobe](https://github.com/shuding/cobe), vendored into `assets/cobe.js` (MIT, 13KB) so the CSP can stay `'self'` only. It marks London and Delaware, recolours on theme toggle, pauses off-screen, and does not spin under `prefers-reduced-motion`.

### The brand mark

`assets/webmosh-logo.png` is the logo with the black ground keyed out and trimmed (587x480, transparent), so it works on both themes. Brand colour is `#31B5F2`. Favicons are generated from the same mark; the 180px `apple-touch-icon` sits on `#07080D` because iOS composites onto white.

### The platforms marquee

The "Platforms we work with" strip loops Payoneer, Wise, React, Next.js, PayPal, Stripe and WordPress. Marks are [Simple Icons](https://simpleicons.org) (CC0) inlined into the SVG sprite. Only list platforms you genuinely work with.

To change the line-up: add the mark as a `<symbol id="b-<slug>">` in the sprite, then add one `<li class="logoitem">` to **each of the four** `marquee__group` lists. They must stay identical or the loop visibly jumps.

### The SVG sprite

The icon sprite is duplicated in every page (a static site has no includes). If you edit a brand path, edit it identically on every page. A changed digit is invisible in review but makes files drift apart.

### Theme and accessibility

The site opens dark (the system preference is deliberately ignored), with a light toggle saved to `localStorage`. Keyboard focus states, a skip link, `prefers-reduced-motion` support, `aria-current="page"` on the current nav item, and `ProfessionalService` / `Service` JSON-LD.

---

## Adding a page

1. Copy the closest existing page (`about.html` for a root page, any `services/*.html` for a service).
2. Change `<title>`, `meta description`, `og:title`, `og:description`, `canonical` and `<main>`.
3. Mark the current nav item with `aria-current="page"`.
4. Link to it without `.html` (e.g. `services/new-thing`).
5. Add the clean URL to `sitemap.xml`.
6. If you use the Docker setup, add the file to the `COPY` line in the `Dockerfile`.

The head, sprite, dock and footer are duplicated per page. Keep them in step. CSS and JS are shared, so design changes are made once.
