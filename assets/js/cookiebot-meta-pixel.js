(() => {
  const pixelId = "4484117138583431";
  let pixelInitialized = false;
  let pageViewTracked = false;

  const hasMarketingConsent = () =>
    Boolean(window.Cookiebot && window.Cookiebot.consent && window.Cookiebot.consent.marketing);

  const loadMetaPixel = () => {
    if (!hasMarketingConsent()) return;

    if (!window.fbq) {
      const fbq = function (...args) {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, args);
        } else {
          fbq.queue.push(args);
        }
      };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      window.fbq = fbq;
      window._fbq = fbq;

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.append(script);
    }

    window.fbq("consent", "grant");
    if (!pixelInitialized) {
      window.fbq("init", pixelId);
      pixelInitialized = true;
    }
    if (!pageViewTracked) {
      window.fbq("track", "PageView");
      pageViewTracked = true;
    }
  };

  const syncConsent = () => {
    if (hasMarketingConsent()) {
      loadMetaPixel();
    } else if (window.fbq) {
      window.fbq("consent", "revoke");
    }
  };

  window.addEventListener("CookiebotOnConsentReady", syncConsent);
  window.addEventListener("CookiebotOnAccept", syncConsent);
  window.addEventListener("CookiebotOnDecline", syncConsent);

  if (window.Cookiebot && window.Cookiebot.hasResponse) {
    syncConsent();
  }
})();
