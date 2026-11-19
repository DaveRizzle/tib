(function () {
  'use strict';

  var NOTICE_VERSION = '2026-11-19-v1';
  var COOKIE_NAME = 'tib_consent_v1';
  var productionHost = location.hostname === 'theinfinitebody.com' || location.hostname === 'www.theinfinitebody.com';
  var localHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var localTestId = localHost && new URLSearchParams(location.search).get('ga4_test_id');
  if (!/^G-[A-Z0-9]+$/.test(localTestId || '')) localTestId = '';
  var MEASUREMENT_ID = productionHost ? 'G-GMZT51K1VM' : localTestId;
  var CONSENT_DAYS = 180;
  var state = null;
  var previousFocus = null;

  window.dataLayer = [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function gpcEnabled() {
    return navigator.globalPrivacyControl === true;
  }

  function readCookie() {
    var prefix = COOKIE_NAME + '=';
    var item = document.cookie.split('; ').find(function (part) { return part.indexOf(prefix) === 0; });
    if (!item) return null;
    try { return JSON.parse(decodeURIComponent(item.slice(prefix.length))); } catch (error) { return null; }
  }

  function writeCookie(analytics) {
    var now = Date.now();
    var expires = new Date(now + CONSENT_DAYS * 86400000);
    var value = {
      essential: true,
      analytics: analytics === true,
      noticeVersion: NOTICE_VERSION,
      decidedAt: new Date(now).toISOString(),
      expiresAt: expires.toISOString()
    };
    try {
      document.cookie = COOKIE_NAME + '=' + encodeURIComponent(JSON.stringify(value)) + '; Max-Age=' + (CONSENT_DAYS * 86400) + '; Path=/; SameSite=Lax';
      return readCookie() ? value : null;
    } catch (error) {
      return null;
    }
  }

  function removeCookie(name, domain) {
    document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + (domain ? '; Domain=' + domain : '');
  }

  function clearAnalyticsCookies() {
    document.cookie.split(';').forEach(function (part) {
      var name = part.trim().split('=')[0];
      if (name === '_ga' || name === '_gid' || name.indexOf('_ga_') === 0) {
        removeCookie(name);
        removeCookie(name, location.hostname);
        if (location.hostname.indexOf('www.') === 0) removeCookie(name, '.' + location.hostname.slice(4));
      }
    });
  }

  function denyAnalytics() {
    if (!window.__tibAnalyticsLoaded) return;
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function validSavedChoice(saved) {
    return saved && saved.noticeVersion === NOTICE_VERSION && saved.expiresAt && Date.parse(saved.expiresAt) > Date.now();
  }

  function analyticsAllowed() {
    return !gpcEnabled() && !!state && state.analytics === true;
  }

  function loadAnalytics(recordDecision) {
    if ((!productionHost && !localTestId) || window.__tibAnalyticsLoaded || !analyticsAllowed()) return;
    window.__tibAnalyticsLoaded = true;
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { send_page_view: true });
    if (recordDecision === true) {
      window.gtag('event', 'consent_choice', {
        choice: 'analytics',
        notice_version: NOTICE_VERSION
      });
    }
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  function sendBookingClick() {
    if (analyticsAllowed() && (productionHost || localTestId)) {
      window.gtag('event', 'booking_click', { booking_provider: 'google_calendar', transport_type: 'beacon' });
    }
  }

  function createUI() {
    var banner = document.createElement('aside');
    banner.className = 'tib-consent-banner';
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.hidden = true;
    banner.innerHTML = '<strong>Privacy choices</strong><p>We use optional analytics to understand how the marketing site is used. Booking and coaching features work with analytics off. <a href="/privacy-policy/">Read the privacy notice</a>.</p><div class="tib-consent-actions"><button type="button" class="tib-consent-button tib-consent-button--primary tib-consent-button--decision" data-tib-consent="essential">Essential only</button><button type="button" class="tib-consent-button tib-consent-button--primary tib-consent-button--decision" data-tib-consent="analytics">Allow analytics</button><button type="button" class="tib-consent-button" data-tib-consent="settings">Cookie settings</button></div>';
    document.body.appendChild(banner);

    var dialog = document.createElement('div');
    dialog.className = 'tib-consent-dialog';
    dialog.hidden = true;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'tib-consent-title');
    dialog.setAttribute('aria-describedby', 'tib-consent-description');
    dialog.innerHTML = '<div class="tib-consent-dialog__panel" role="document"><h2 id="tib-consent-title">Cookie settings</h2><p id="tib-consent-description">Choose whether to allow optional analytics. Essential storage keeps this choice and is always enabled.</p><label class="tib-consent-choice"><input type="checkbox" id="tib-consent-analytics"><span><strong>Analytics</strong><small>Allows aggregate visits and booking-link clicks on the public marketing site. Advertising and remarketing remain off.</small></span></label><div class="tib-consent-actions"><button type="button" class="tib-consent-button tib-consent-button--primary" data-tib-save="1">Save choices</button><button type="button" class="tib-consent-button" data-tib-close="1">Cancel</button></div></div>';
    document.body.appendChild(dialog);

    var allowButton = banner.querySelector('[data-tib-consent="analytics"]');
    if (gpcEnabled()) {
      allowButton.disabled = true;
      allowButton.setAttribute('aria-disabled', 'true');
      allowButton.title = 'Disabled because Global Privacy Control is enabled';
    }

    function closeDialog() {
      dialog.hidden = true;
      if (previousFocus && previousFocus.focus) previousFocus.focus();
    }
    function choose(analytics) {
      analytics = analytics === true && !gpcEnabled();
      state = writeCookie(analytics);
      banner.hidden = true;
      closeDialog();
      if (analytics && state) loadAnalytics(true);
      else { denyAnalytics(); clearAnalyticsCookies(); }
    }
    function openDialog() {
      previousFocus = document.activeElement;
      dialog.querySelector('#tib-consent-analytics').checked = analyticsAllowed();
      var analyticsCheckbox = dialog.querySelector('#tib-consent-analytics');
      analyticsCheckbox.disabled = gpcEnabled();
      analyticsCheckbox.setAttribute('aria-describedby', 'tib-consent-gpc-note');
      var existingNote = dialog.querySelector('#tib-consent-gpc-note');
      if (existingNote) existingNote.remove();
      if (gpcEnabled()) {
        var note = document.createElement('small');
        note.id = 'tib-consent-gpc-note';
        note.textContent = 'Global Privacy Control is enabled, so optional analytics cannot be enabled here.';
        note.style.display = 'block';
        note.style.marginTop = '8px';
        note.style.color = '#5f646c';
        analyticsCheckbox.closest('.tib-consent-choice').appendChild(note);
      }
      dialog.hidden = false;
      analyticsCheckbox.focus();
    }
    banner.addEventListener('click', function (event) {
      var action = event.target.getAttribute('data-tib-consent');
      if (action === 'essential') choose(false);
      if (action === 'analytics') choose(true);
      if (action === 'settings') openDialog();
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog || event.target.hasAttribute('data-tib-close')) closeDialog();
      if (event.target.hasAttribute('data-tib-save')) choose(dialog.querySelector('#tib-consent-analytics').checked && !gpcEnabled());
    });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeDialog(); return; }
      if (event.key !== 'Tab') return;
      var focusable = Array.prototype.slice.call(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    document.querySelectorAll('.tib-consent-settings').forEach(function (link) { link.addEventListener('click', function (event) { event.preventDefault(); openDialog(); }); });
    document.querySelectorAll('footer').forEach(function (footer) {
      if (!footer.querySelector('.tib-consent-settings')) {
        var link = document.createElement('a');
        link.className = 'tib-consent-settings';
        link.href = '#tib-cookie-settings';
        link.textContent = 'Cookie settings';
        footer.appendChild(link);
        link.addEventListener('click', function (event) { event.preventDefault(); openDialog(); });
      }
    });
    return { banner: banner };
  }

  function init() {
    var saved = readCookie();
    if (gpcEnabled()) {
      state = writeCookie(false);
      denyAnalytics();
      clearAnalyticsCookies();
    } else if (validSavedChoice(saved)) {
      state = saved;
      if (state.analytics) loadAnalytics(false);
    }
    var ui = createUI();
    if (!state || gpcEnabled()) ui.banner.hidden = false;
    document.querySelectorAll('a[href="https://calendar.app.google/ZyW4qWin1iDgaxhX6"]').forEach(function (link) { link.addEventListener('click', sendBookingClick); });
  }

  window.TIBConsent = { analyticsAllowed: analyticsAllowed, bookingClick: sendBookingClick, openSettings: function () { var link = document.querySelector('.tib-consent-settings'); if (link) link.click(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
