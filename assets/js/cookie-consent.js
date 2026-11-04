(() => {
  const consentKey = "cici-meta-pixel-consent-v1";
  const pixelId = "4484117138583431";
  let pixelInitialized = false;

  const panel = document.createElement("section");
  panel.className = "cookie-consent";
  panel.id = "cookie-consent";
  panel.setAttribute("aria-labelledby", "cookie-consent-title");
  panel.setAttribute("aria-live", "polite");

  const title = document.createElement("h2");
  title.id = "cookie-consent-title";
  title.textContent = "Your privacy, your choice.";

  const description = document.createElement("p");
  description.textContent = "Meta Pixel measures page visits and marketing performance. If you accept, it may collect information about how you use this site and share it with Meta. It stays off unless you opt in, and you can change your choice later in Cookie settings.";

  const privacyNotice = document.createElement("p");
  privacyNotice.className = "cookie-consent__contact";
  const privacyLink = document.createElement("a");
  privacyLink.href = new URL("../../privacy/", document.currentScript.src).href;
  privacyLink.textContent = "Read our privacy notice";
  privacyNotice.append(privacyLink);

  const choiceStatus = document.createElement("p");
  choiceStatus.className = "cookie-consent__choice";
  choiceStatus.setAttribute("aria-live", "polite");

  const contact = document.createElement("p");
  contact.className = "cookie-consent__contact";
  contact.append("Questions? ");
  const contactLink = document.createElement("a");
  contactLink.href = "mailto:cici.studios.berlin@gmail.com?subject=Privacy%20question";
  contactLink.textContent = "Contact CiCi Studios";
  contact.append(contactLink, ".");

  const actions = document.createElement("div");
  actions.className = "cookie-consent__actions";

  const rejectButton = document.createElement("button");
  rejectButton.className = "cookie-consent__button cookie-consent__button--secondary";
  rejectButton.type = "button";
  rejectButton.textContent = "Reject optional cookies";

  const acceptButton = document.createElement("button");
  acceptButton.className = "cookie-consent__button cookie-consent__button--primary";
  acceptButton.type = "button";
  acceptButton.textContent = "Accept optional cookies";

  actions.append(rejectButton, acceptButton);
  panel.append(title, description, privacyNotice, choiceStatus, contact, actions);

  const settingsButton = document.createElement("button");
  settingsButton.className = "cookie-settings";
  settingsButton.type = "button";
  const settingsLabel = document.createElement("span");
  settingsLabel.className = "cookie-settings__label";
  settingsLabel.textContent = "Cookie settings";
  settingsButton.append(settingsLabel);
  settingsButton.setAttribute("aria-controls", panel.id);
  settingsButton.hidden = true;

  document.body.append(panel, settingsButton);

  const getConsent = () => {
    try {
      const savedConsent = window.localStorage.getItem(consentKey);
      return savedConsent === "accepted" || savedConsent === "rejected" ? savedConsent : null;
    } catch (error) {
      console.error("Could not read the saved cookie preference.", error);
      return null;
    }
  };

  const saveConsent = (consent) => {
    try {
      window.localStorage.setItem(consentKey, consent);
    } catch (error) {
      console.error("Could not save the cookie preference; it may be requested again on another page.", error);
    }
  };

  const updateChoiceStatus = (consent) => {
    if (consent === "accepted") {
      choiceStatus.textContent = "Your current choice: optional cookies accepted.";
      choiceStatus.hidden = false;
      rejectButton.textContent = "Change to reject optional cookies";
      acceptButton.textContent = "Keep accepting optional cookies";
    } else if (consent === "rejected") {
      choiceStatus.textContent = "Your current choice: optional cookies rejected. Meta Pixel is off.";
      choiceStatus.hidden = false;
      rejectButton.textContent = "Keep rejecting optional cookies";
      acceptButton.textContent = "Change to accept optional cookies";
    } else {
      choiceStatus.textContent = "";
      choiceStatus.hidden = true;
      rejectButton.textContent = "Reject optional cookies";
      acceptButton.textContent = "Accept optional cookies";
    }
  };

  const loadMetaPixel = () => {
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
    window.fbq("track", "PageView");
  };

  const closePanel = (consent) => {
    saveConsent(consent);
    updateChoiceStatus(consent);
    panel.hidden = true;
    settingsButton.hidden = false;

    if (consent === "accepted") {
      loadMetaPixel();
    } else if (window.fbq) {
      window.fbq("consent", "revoke");
    }
  };

  rejectButton.addEventListener("click", () => closePanel("rejected"));
  acceptButton.addEventListener("click", () => closePanel("accepted"));
  settingsButton.addEventListener("click", () => {
    updateChoiceStatus(getConsent());
    panel.hidden = false;
    settingsButton.hidden = true;
    rejectButton.focus();
  });

  const savedConsent = getConsent();
  updateChoiceStatus(savedConsent);
  if (!savedConsent) {
    panel.hidden = false;
  } else {
    panel.hidden = true;
    settingsButton.hidden = false;
    if (savedConsent === "accepted") loadMetaPixel();
  }
})();
