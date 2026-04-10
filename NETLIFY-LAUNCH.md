# Netlify Launch Checklist

This checklist is the shortest path from local files to a live Netlify site that can be submitted to search engines and ad platforms.

## 1. Push the site to a Git repository

- Put this project in a Git repository if it is not already.
- Push it to GitHub, GitLab, or Bitbucket.

## 2. Create the Netlify site

- In Netlify, choose `Add new site` and import the repository.
- Keep the publish directory as `.`.
- Deploy the site.

Expected result:
- You get a temporary site URL in the format `https://<project-name>.netlify.app`.

## 3. Stamp the temporary live URL into the project

From the project root, run:

```bash
ruby scripts/configure-site.rb \
  --origin=https://<project-name>.netlify.app \
  --analytics-domain=<project-name>.netlify.app \
  --contact-email=contact@yourdomain.com
```

If you already have AdSense:

```bash
ruby scripts/configure-site.rb \
  --origin=https://<project-name>.netlify.app \
  --analytics-domain=<project-name>.netlify.app \
  --contact-email=contact@yourdomain.com \
  --adsense-client=ca-pub-xxxxxxxxxxxxxxxx
```

Expected result:
- `robots.txt`, `sitemap.xml`, JSON-LD placeholders, and contact email placeholders are updated from setup values to live values.

## 4. Redeploy after stamping

- Commit the stamped changes.
- Push again so Netlify redeploys the site.

Do not skip this step. Search engines and ad reviewers should see the real live URL and public contact details in the deployed files.

## 5. Enable and verify Netlify Forms

- In Netlify, open `Forms`.
- Enable automatic form detection if it is not already enabled.
- Confirm the `site-contact` form appears after the redeploy.
- Submit a test form from the live site and confirm it lands in the Netlify Forms dashboard.

Relevant files:
- `contact.html`
- `thank-you.html`

## 6. Finish publisher identity

Before ad submission, replace remaining business placeholders with real values:

- Use a real monitored inbox on `contact.html`.
- Add your analytics domain if you are using Plausible.
- Add your AdSense client ID when available.
- Replace the placeholder publisher ID in `ads.txt` if you are using AdSense.

Relevant files:
- `contact.html`
- `ads.txt`
- `scripts/configure-site.rb`

## 7. Add a certified CMP before Google ads

For ad monetization in Europe, do not rely on the local consent banner long term.

Required direction:
- Install a certified CMP.
- If using Cookiebot, load the vendor script first, then `scripts/cmp-cookiebot.js`, then `scripts/site.js`.

Relevant files:
- `scripts/cmp-cookiebot.js`
- `scripts/site.js`
- `privacy.html`

## 8. Connect site ownership and indexing

- Add the live Netlify URL as a property in Google Search Console.
- Submit `/sitemap.xml`.
- Add the same site to Bing Webmaster Tools and submit the sitemap there too.

Do this only after the site is deployed with the correct live URL.

## 9. Delay AdSense application until the basics are clean

Apply when all of the following are true:

- The site is live on the stamped URL.
- Privacy, Terms, About, Contact, and Affiliate Disclosure pages are present.
- `ads.txt` is set with the real publisher ID if you already have one.
- The contact form works.
- The site has a real contact inbox.
- The CMP path is decided.

## 10. Replace the temporary Netlify URL with a real domain later

When you buy a custom domain:

- Connect it in Netlify.
- Wait for HTTPS to be active.
- Run the same config script again with the new origin and analytics domain.
- Redeploy.
- Update Search Console and Bing if needed.

## First message to send back here

Once Netlify gives you the temporary URL, send exactly that URL.

I can then patch the project for the live origin in one pass and tell you whether anything launch-critical is still missing.
