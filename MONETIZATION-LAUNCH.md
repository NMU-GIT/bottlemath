# Monetization Launch Checklist

Use this after the site is live on `bottlemath.com`.

## What this repo can already do

- Load AdSense only after ad consent is granted
- Hide placeholder ad boxes once AdSense is configured
- Switch from local consent banner to Cookiebot if you add a real Cookiebot ID
- Store Google and Bing verification tokens in page meta tags
- Update all of the above with one command

## One command to stamp the site

```bash
ruby scripts/configure-site.rb \
  --origin=https://bottlemath.com \
  --analytics-domain=bottlemath.com \
  --adsense-client=ca-pub-xxxxxxxxxxxxxxxx \
  --cookiebot-id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  --google-site-verification=your_google_token \
  --bing-site-verification=your_bing_token \
  --contact-email=contact@bottlemath.com
```

Notes:

- `--cookiebot-id` switches consent mode to `external`
- `--adsense-client` also updates `ads.txt`
- if you use DNS verification for Search Console, you can skip the Google meta token

## Manual dashboard steps that still require your accounts

1. Create or connect the site in Google AdSense
2. Complete tax and payment details in AdSense
3. Create a certified CMP account, such as Cookiebot, and get the site ID
4. Verify the domain in Google Search Console
5. Verify the site in Bing Webmaster Tools
6. Submit `https://bottlemath.com/sitemap.xml`

## Recommended order

1. Search Console domain verification
2. Sitemap submission
3. Cookiebot setup
4. AdSense site connection and review
5. Turn on Auto ads after approval
