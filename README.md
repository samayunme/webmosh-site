# WEBMOSH

Marketing, optimization, UK &amp; US company formation, business taxes, business website &amp; hosting — all in one place you can trust.

Single-page marketing site. One self-contained `index.html`: no build step, no framework, no dependencies. The only external request the page makes is to Google Fonts.

---

## Deploy on Coolify

1. **New Resource → Public/Private Repository**, pick this repo, branch `main`.
2. **Build Pack: `Dockerfile`** (the `Dockerfile` in the repo root is all it needs).
3. **Port: `80`**.
4. Add your domain under **Domains**, e.g. `https://webmosh.com`, and let Coolify issue the Let's Encrypt certificate.
5. Deploy. Every push to `main` redeploys if you leave auto-deploy on.

The container is `nginx:1.27-alpine` serving the static files, with gzip, long-lived caching for assets, `no-cache` on the HTML so a deploy is visible immediately, and a set of security headers (`nginx.conf`).

> Coolify's **Static** build pack also works if you prefer it — set the base directory to `/` and the publish directory to `/`. The Dockerfile route is here because it pins the nginx config, the caching rules and the headers, so local and production behave identically.

### Run it locally

```bash
# with Docker, exactly as it runs in production
docker build -t webmosh . && docker run --rm -p 8080:80 webmosh
# → http://localhost:8080

# or just open the file, since it has no build step
open index.html
```

---

## Before it goes live

These are placeholders in `index.html` — search for each string and replace it:

| What | Current placeholder | Where |
|---|---|---|
| Email | `hello@webmosh.com` | contact section, footer, form handler, JSON-LD |
| WhatsApp | `+00 0000 000000` and `https://wa.me/` | contact section, footer |
| Office hours | `Mon–Fri, 09:00–18:00 GMT` | contact section |
| Uptime claim | `99.9%` | commitments band |
| Domain | `https://webmosh.com` | `robots.txt`, `sitemap.xml` |

**The contact form has no backend yet.** It validates in the browser, then hands the enquiry to the visitor's mail client via `mailto:`. To make it a real form, point it at a handler — Formspree, Coolify-hosted service, or your own endpoint — and replace the `window.location.href = "mailto:…"` block in the script at the bottom of `index.html`.

## What's in the page

Utility bar · sticky masthead · hero with engagement-summary card · credentials strip · six vendor-gap problems · six service cards · stats band · five-step process · comparison table · FAQ · CTA band · contact form · footer.

Corporate visual system: IBM Plex Sans and IBM Plex Mono, navy `#0A1E3D` with a `#0F52D9` accent on cool grey surfaces, and an inline SVG icon sprite (no icon-font dependency).

Light and dark themes with a toggle (preference saved to `localStorage`), keyboard focus states, a skip link, `prefers-reduced-motion` support, and `ProfessionalService` JSON-LD for search engines.

## Structure

```
index.html     the entire site — markup, CSS tokens, and the reveal/theme/form script
Dockerfile     nginx:alpine image Coolify builds
nginx.conf     caching, gzip, single-page fallback
security-headers.conf  CSP and hardening headers, included by every location
robots.txt     update the sitemap URL when the domain is final
sitemap.xml    update the domain when it is final
```
