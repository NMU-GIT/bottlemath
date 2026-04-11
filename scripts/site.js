(function () {
  const CONSENT_KEY = 'wch_consent_v1';
  const PLACEHOLDER_ORIGIN = 'https://example.com';
  let analyticsLoaded = false;
  let adsLoaded = false;
  let cmpLoaded = false;

  function getMetaContent(name) {
    const element = document.querySelector('meta[name="' + name + '"]');
    return element && element.content ? element.content.trim() : '';
  }

  function getConsentMode() {
    const configured = window.WCH_CONSENT_MODE || getMetaContent('wch-consent-mode') || 'local';
    return String(configured).toLowerCase();
  }

  function getLiveOrigin() {
    const protocol = window.location.protocol;
    return protocol === 'http:' || protocol === 'https:' ? window.location.origin : '';
  }

  function resolvePagePath(page) {
    const isNested = window.location.pathname.indexOf('/calculators/') !== -1;
    return isNested ? '../' + page : './' + page;
  }

  function replacePlaceholderOrigin(value, origin) {
    if (!origin) {
      return value;
    }

    if (typeof value === 'string') {
      return value.split(PLACEHOLDER_ORIGIN).join(origin);
    }

    if (Array.isArray(value)) {
      return value.map(function (entry) {
        return replacePlaceholderOrigin(entry, origin);
      });
    }

    if (value && typeof value === 'object') {
      const copy = {};
      Object.keys(value).forEach(function (key) {
        copy[key] = replacePlaceholderOrigin(value[key], origin);
      });
      return copy;
    }

    return value;
  }

  function syncStructuredDataUrls() {
    const origin = getLiveOrigin();
    if (!origin) {
      return;
    }

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(function (script) {
      const raw = script.textContent ? script.textContent.trim() : '';
      if (!raw || raw.indexOf(PLACEHOLDER_ORIGIN) === -1) {
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        const updated = replacePlaceholderOrigin(parsed, origin);
        script.textContent = JSON.stringify(updated, null, 2);
      } catch (_error) {
        return;
      }
    });
  }

  function syncCanonicalLink() {
    const origin = getLiveOrigin();
    if (!origin) {
      return;
    }

    const canonicalHref = origin + window.location.pathname;
    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalHref;
  }

  function loadExternalScript(src, attributes, onload) {
    const existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      if (typeof onload === 'function') {
        onload();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    if (attributes) {
      Object.keys(attributes).forEach(function (key) {
        script.setAttribute(key, attributes[key]);
      });
    }

    if (typeof onload === 'function') {
      script.addEventListener('load', onload, { once: true });
    }

    document.head.appendChild(script);
  }

  function bootstrapConsentManager() {
    const mode = getConsentMode();
    const cookiebotId = getMetaContent('wch-cookiebot-id');

    if (cmpLoaded || mode !== 'external' || !cookiebotId) {
      return;
    }

    cmpLoaded = true;

    loadExternalScript(
      'https://consent.cookiebot.com/uc.js',
      {
        id: 'Cookiebot',
        'data-cbid': cookiebotId,
        'data-blockingmode': 'auto'
      },
      function () {
        loadExternalScript(resolvePagePath('scripts/cmp-cookiebot.js'));
      }
    );
  }

  function normalizeConsent(input) {
    return {
      analytics: Boolean(input && input.analytics),
      ads: Boolean(input && input.ads),
      updatedAt: new Date().toISOString()
    };
  }

  function saveConsent(consent) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (_error) {
      return;
    }
  }

  function readConsent() {
    let raw = null;

    try {
      raw = localStorage.getItem(CONSENT_KEY);
    } catch (_error) {
      return null;
    }

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        analytics: Boolean(parsed.analytics),
        ads: Boolean(parsed.ads)
      };
    } catch (_error) {
      return null;
    }
  }

  function readPendingConsent() {
    if (!window.WCH_PENDING_CONSENT) {
      return null;
    }

    return {
      analytics: Boolean(window.WCH_PENDING_CONSENT.analytics),
      ads: Boolean(window.WCH_PENDING_CONSENT.ads)
    };
  }

  function updateAdPlaceholders(consent) {
    const client = getMetaContent('wch-adsense-client');
    const slots = document.querySelectorAll('.ad-box');

    slots.forEach(function (slot) {
      const wrapper = slot.closest('.ad-slot');

      if (!slot.dataset.defaultText) {
        slot.dataset.defaultText = slot.textContent;
      }

      if (wrapper) {
        wrapper.hidden = false;
      }

      if (!consent || !consent.ads) {
        slot.textContent = 'Ads disabled until consent is accepted.';
        return;
      }

      if (client) {
        if (wrapper) {
          wrapper.hidden = true;
        }
        slot.textContent = slot.dataset.defaultText;
      } else {
        slot.textContent = 'Ad slot ready. Add your ad network client ID to activate.';
      }
    });
  }

  function applyConsent(consent) {
    updateAdPlaceholders(consent);

    if (consent && consent.analytics && !analyticsLoaded) {
      const plausibleDomain = getMetaContent('wch-analytics-domain');
      if (plausibleDomain) {
        loadExternalScript('https://plausible.io/js/script.js', {
          'data-domain': plausibleDomain
        });
        analyticsLoaded = true;
      }
    }

    if (consent && consent.ads && !adsLoaded) {
      const adClient = getMetaContent('wch-adsense-client');
      if (adClient) {
        loadExternalScript(
          'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
            encodeURIComponent(adClient),
          {
            crossorigin: 'anonymous'
          }
        );
        adsLoaded = true;
      }
    }
  }

  function storeAndApplyConsent(input) {
    const consent = normalizeConsent(input);
    saveConsent(consent);
    applyConsent(consent);
    hideBanner();
    return consent;
  }

  function showBanner() {
    if (getConsentMode() !== 'local') {
      return;
    }

    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.classList.remove('hidden');
    }
  }

  function hideBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.classList.add('hidden');
    }
  }

  function createBanner() {
    if (getConsentMode() !== 'local' || document.getElementById('cookieBanner')) {
      return;
    }

    const privacyPath = resolvePagePath('privacy.html');
    const banner = document.createElement('section');
    banner.id = 'cookieBanner';
    banner.className = 'cookie-banner hidden';
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML =
      '<div class="cookie-inner">' +
      '<p>We use optional analytics and ad scripts only with consent. See the <a href="' +
      privacyPath +
      '">privacy policy</a>.</p>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="btn-small" id="cookieReject">Reject</button>' +
      '<button type="button" class="btn-small primary" id="cookieAccept">Accept</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(banner);

    const acceptButton = document.getElementById('cookieAccept');
    const rejectButton = document.getElementById('cookieReject');

    if (acceptButton) {
      acceptButton.addEventListener('click', function () {
        storeAndApplyConsent({ analytics: true, ads: true });
      });
    }

    if (rejectButton) {
      rejectButton.addEventListener('click', function () {
        storeAndApplyConsent({ analytics: false, ads: false });
      });
    }
  }

  function openConsentControls() {
    if (getConsentMode() !== 'local' && typeof window.WCH_OPEN_CMP === 'function') {
      window.WCH_OPEN_CMP();
      return;
    }

    showBanner();
  }

  function bindCookieSettingsLinks() {
    const links = document.querySelectorAll('[data-cookie-settings]');
    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        openConsentControls();
      });
    });
  }

  function exposeConsentApi() {
    window.wchSetConsent = function (consent) {
      return storeAndApplyConsent(consent || {});
    };

    window.wchOpenConsent = function () {
      openConsentControls();
    };
  }

  function init() {
    syncStructuredDataUrls();
    syncCanonicalLink();
    exposeConsentApi();
    bootstrapConsentManager();
    createBanner();
    bindCookieSettingsLinks();

    const pendingConsent = readPendingConsent();
    if (pendingConsent) {
      applyConsent(pendingConsent);
      hideBanner();
      return;
    }

    const consent = readConsent();
    if (!consent) {
      updateAdPlaceholders(null);
      showBanner();
      return;
    }

    applyConsent(consent);
    hideBanner();
  }

  init();
})();
