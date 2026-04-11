# BottleMath (MVP)

Static website with wine-focused calculators designed for SEO traffic and ad monetization.

## Included calculators

- En primeur landed cost estimator (UK-focused)
- Multi-country wine import duty estimator
- Duty-free allowance estimator
- Wedding wine quantity and budget estimator
- Wine calories and UK alcohol units estimator
- Serving temperature and chill timer estimator
- Decanting time estimator
- Corkage break-even estimator
- Restaurant wine markup estimator
- By-the-glass profit estimator
- Cellar storage cost estimator
- Cellar ROI and resale net estimator
- Blend ratio estimator
- Brix/SG to potential ABV estimator
- Chaptalization sugar addition estimator
- Sulfite addition estimator
- Dilution and fortification estimator

## Project structure

- `index.html` homepage
- `about.html` site overview and editorial standards
- `contact.html` public contact details
- `terms.html` terms of use
- `affiliate-disclosure.html` monetization disclosure
- `thank-you.html` redirect target for future forms and lead flows
- `privacy.html` privacy and cookie policy
- `styles.css` shared visual styles
- `calculators/` individual calculator pages
- `guides/` supporting editorial pages for SEO and ad approval depth
- `scripts/` JavaScript calculator logic and consent handling
- `ads.txt` seller authorization template
- `robots.txt` crawler instructions
- `sitemap.xml` sitemap template (replace placeholder domain)
- `netlify.toml` static deploy settings for Netlify
- `vercel.json` static deploy settings for Vercel
- `MONETIZATION-LAUNCH.md` account-side launch checklist

## Run locally

Use any static server from the project root:

```bash
ruby -run -e httpd . -p 8080
```

Then open `http://localhost:8080`.

## Temporary deployment URLs

For the exact step-by-step launch sequence, use `NETLIFY-LAUNCH.md`.

### Netlify

1. Push this folder to a Git repository.
2. In Netlify, import the repository.
3. Keep publish directory as `.`.
4. Deploy. Your temporary URL will look like:
   - `https://<project-name>.netlify.app`
5. The contact form in `contact.html` is already configured for Netlify Forms and redirects to `thank-you.html`.
6. After the first deploy, confirm the form appears in the Netlify Forms dashboard.

### Vercel

1. Push this folder to a Git repository.
2. In Vercel, import the repository.
3. Framework preset: `Other` (static).
4. Deploy. Your temporary URL will look like:
   - `https://<project-name>.vercel.app`
5. If you deploy on Vercel, replace the Netlify form in `contact.html` with another form backend.

## Stamp launch settings

Once you have a real domain or temporary deploy URL, update the site in one pass:

```bash
ruby scripts/configure-site.rb \
  --origin=https://your-site.example \
  --analytics-domain=your-site.example \
  --adsense-client=ca-pub-xxxxxxxxxxxxxxxx \
  --cookiebot-id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  --google-site-verification=your_google_token \
  --bing-site-verification=your_bing_token \
  --contact-email=contact@your-site.example
```

You can provide only the flags you want to change.
If you provide `--adsense-client`, the script also updates `ads.txt`.
If you provide `--cookiebot-id`, the script switches consent mode to `external`.

## Analytics and ads setup

Consent logic is handled by `scripts/site.js` and only loads optional scripts after acceptance.

To enable Plausible analytics and AdSense:

1. Add your domain to Plausible.
2. Add your AdSense client ID.
3. Optionally add a certified CMP ID and search verification tokens.
4. In each HTML page, set:

```html
<meta name="wch-analytics-domain" content="yourdomain.com">
<meta name="wch-adsense-client" content="ca-pub-xxxxxxxxxxxxxxxx">
<meta name="wch-cookiebot-id" content="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
<meta name="wch-consent-mode" content="external">
<meta name="google-site-verification" content="your_google_token">
<meta name="msvalidate.01" content="your_bing_token">
```

If you set a real Cookiebot ID, `scripts/site.js` automatically loads Cookiebot and the local bridge script. Other CMPs can still use the existing `window.wchSetConsent({ analytics: true|false, ads: true|false })` hook.

### Cookiebot stub

If you choose Cookiebot, the simplest path is to set `wch-cookiebot-id` and let `scripts/site.js` load the vendor script automatically. The Cookiebot helper maps Cookiebot consent categories to the site's analytics and ad consent flags and opens the CMP dialog from the existing cookie settings links.

## Before production launch

- Replace `https://example.com` links in `sitemap.xml` and `robots.txt`.
- Replace the placeholder inbox in `contact.html` with a monitored public email address.
- Replace the placeholder publisher ID in `ads.txt`, or run the config script with `--adsense-client`.
- Review tax/duty assumptions in calculators before each launch cycle.
- Add Google Search Console and submit your live sitemap.
- Install a certified CMP before serving personalized Google ads in Europe.
- Publish supporting guides and link them internally from relevant calculators.
