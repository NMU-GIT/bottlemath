(function () {
  function mapConsent() {
    if (!window.Cookiebot || !window.Cookiebot.consent) {
      return null;
    }

    return {
      analytics: Boolean(window.Cookiebot.consent.statistics),
      ads: Boolean(window.Cookiebot.consent.marketing)
    };
  }

  function pushConsentState() {
    var consent = mapConsent();
    if (!consent) {
      return;
    }

    if (typeof window.wchSetConsent === 'function') {
      window.wchSetConsent(consent);
      return;
    }

    window.WCH_PENDING_CONSENT = consent;
  }

  function openDialog() {
    if (window.Cookiebot && typeof window.Cookiebot.renew === 'function') {
      window.Cookiebot.renew();
      return;
    }

    if (window.Cookiebot && typeof window.Cookiebot.show === 'function') {
      window.Cookiebot.show();
    }
  }

  window.WCH_CONSENT_MODE = 'external';
  window.WCH_OPEN_CMP = openDialog;

  window.addEventListener('CookiebotOnConsentReady', pushConsentState);
  window.addEventListener('CookiebotOnAccept', pushConsentState);
  window.addEventListener('CookiebotOnDecline', pushConsentState);
})();
