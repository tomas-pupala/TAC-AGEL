/* ==========================================================
   KONFIGURACE – uprav dle projektu
   ========================================================== */
var TAC_CONFIG = {
  // GTM
  gtmId: 'GTM-KW88LTQH',

  // Logo
  logoSrc:    'assets/tac/images/logo.svg',
  logoAlt:    'Logo',
  logoHeight: '40px',

  // Text v záložce "O cookies"
  aboutText: 'Cookies jsou malé textové soubory, které webové stránky ukládají do vašeho prohlížeče. Používáme je pro zajištění správného fungování webu, měření návštěvnosti a personalizaci obsahu.  záložce Detaily můžete jednotlivé kategorie povolit nebo zakázat.',

  // Popisky záložek
  tabLabelDetails: 'Detaily',
  tabLabelAbout:   'O cookies',

  // Popisky tlačítek
  btnLabelDeny:  'Odmítnout vše',
  btnLabelSave:  'Povolit výběr',
  btnLabelAllow: 'Povolit vše',

  // Popisky stavů
  labelAllowed:   'Povoleno',
  labelDenied:    'Zakázáno',
  labelMandatory: 'Vždy aktivní',

  // Vlastní TAC služby
  services: {
    analytics: {
      key:     'customanalytics',
      type:    'analytic',
      name:    'Google Analytics',
      uri:     'https://policies.google.com/privacy',
      cookies: ['_ga', '_gid', '_gat'],
    },
    ads: {
      key:     'customads',
      type:    'ads',
      name:    'Reklamní cookies',
      uri:     'https://policies.google.com/privacy',
      cookies: [],
    },
  },
};

/* ==========================================================
   GOOGLE CONSENT MODE – výchozí stav PŘED GTM
   ========================================================== */
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

gtag('consent', 'default', {
  'ad_storage':            'denied',
  'ad_user_data':          'denied',
  'ad_personalization':    'denied',
  'analytics_storage':     'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage':      'granted',
  'wait_for_update':       500,
});

/* ==========================================================
   GOOGLE TAG MANAGER
   ========================================================== */
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var f  = d.getElementsByTagName(s)[0],
      j  = d.createElement(s),
      dl = l !== 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src   = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', TAC_CONFIG.gtmId);

/* ==========================================================
   CONSENT UPDATE HELPERS
   ========================================================== */
function updateAnalyticsConsent(granted) {
  gtag('consent', 'update', {
    'analytics_storage':       granted ? 'granted' : 'denied',
    'functionality_storage':   granted ? 'granted' : 'denied',
    'personalization_storage': granted ? 'granted' : 'denied',
  });
}

function updateAdsConsent(granted) {
  gtag('consent', 'update', {
    'ad_storage':         granted ? 'granted' : 'denied',
    'ad_user_data':       granted ? 'granted' : 'denied',
    'ad_personalization': granted ? 'granted' : 'denied',
  });
}

/* ==========================================================
   TARTEAUCITRON – odebrání nativního gtag (okamžité)
   ========================================================== */
if (typeof tarteaucitron !== 'undefined' && tarteaucitron.services) {
  delete tarteaucitron.services.gtag;
}

/* ==========================================================
   TARTEAUCITRON – vlastní služby
   ========================================================== */
tarteaucitron.services[TAC_CONFIG.services.analytics.key] = {
  key:         TAC_CONFIG.services.analytics.key,
  type:        TAC_CONFIG.services.analytics.type,
  name:        TAC_CONFIG.services.analytics.name,
  uri:         TAC_CONFIG.services.analytics.uri,
  needConsent: true,
  cookies:     TAC_CONFIG.services.analytics.cookies,
  js:       function () { 'use strict'; updateAnalyticsConsent(true); },
  fallback: function () { 'use strict'; updateAnalyticsConsent(false); },
};

tarteaucitron.services[TAC_CONFIG.services.ads.key] = {
  key:         TAC_CONFIG.services.ads.key,
  type:        TAC_CONFIG.services.ads.type,
  name:        TAC_CONFIG.services.ads.name,
  uri:         TAC_CONFIG.services.ads.uri,
  needConsent: true,
  cookies:     TAC_CONFIG.services.ads.cookies,
  js:       function () { 'use strict'; updateAdsConsent(true); },
  fallback: function () { 'use strict'; updateAdsConsent(false); },
};

(tarteaucitron.job = tarteaucitron.job || []).push(TAC_CONFIG.services.analytics.key);
(tarteaucitron.job = tarteaucitron.job || []).push(TAC_CONFIG.services.ads.key);

/* ==========================================================
   TARTEAUCITRON – event listenery
   ========================================================== */
window.addEventListener('tac.root_available', function () {
  // Odeber nativní gtag
  if (typeof tarteaucitron !== 'undefined') {
    if (tarteaucitron.services && tarteaucitron.services.gtag) {
      delete tarteaucitron.services.gtag;
    }
    if (tarteaucitron.job) {
      tarteaucitron.job = tarteaucitron.job.filter(function (job) {
        return job !== 'gtag';
      });
    }
    var line = document.getElementById('gtagLine');
    if (line) line.remove();
  }

  // Obnovit stav z cookies
  updateAnalyticsConsent(tarteaucitron.state[TAC_CONFIG.services.analytics.key] === true);
  updateAdsConsent(tarteaucitron.state[TAC_CONFIG.services.ads.key] === true);
});

window.addEventListener('tac.accept_all', function () {
  updateAnalyticsConsent(true);
  updateAdsConsent(true);
});

window.addEventListener('tac.deny_all', function () {
  updateAnalyticsConsent(false);
  updateAdsConsent(false);
});

/* ==========================================================
   TAC BOOTSTRAP CONVERT
   ========================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     HELPERS
     ---------------------------------------------------------- */
  function waitForTarteaucitron(callback) {
    if (typeof tarteaucitron !== 'undefined' && tarteaucitron.job) {
      callback();
    } else {
      setTimeout(function () { waitForTarteaucitron(callback); }, 100);
    }
  }

  function runAll() {
    initHeaderLogo();
    initFooterButtons();
    initTabs();
    convertMandatorySwitches();
    convertToSwitchesAndCheckboxes();
    hideEmptyCategories();
  }

  /* ----------------------------------------------------------
     ČÁST 0a: Logo v headeru
     ---------------------------------------------------------- */
  function initHeaderLogo() {
    var header = document.querySelector('#tarteaucitronServices .tarteaucitronMainLine');
    if (!header) return;
    if (header.querySelector('.tac-header-top')) return;

    var title = header.querySelector('.tarteaucitronH1');
    if (!title) return;

    var topRow = document.createElement('div');
    topRow.className = 'tac-header-top';

    var logo = document.createElement('img');
    logo.src          = TAC_CONFIG.logoSrc;
    logo.alt          = TAC_CONFIG.logoAlt;
    logo.style.height = TAC_CONFIG.logoHeight;
    logo.className    = 'tac-header-logo';

    header.insertBefore(topRow, title);
    topRow.appendChild(title);
    topRow.appendChild(logo);

    [
      '#tarteaucitronInfo',
      '#tarteaucitronScrollbarAdjust',
      '.tarteaucitronMainLine .tarteaucitronName',
      '.tarteaucitronMainLine .tarteaucitronAsk',
    ].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) el.style.setProperty('display', 'none', 'important');
    });
  }

  /* ----------------------------------------------------------
     ČÁST 0b: Tlačítka ve footeru
     ---------------------------------------------------------- */
  function initFooterButtons() {
    var footer = document.getElementById('tarteaucitronSave');
    if (!footer) return;
    if (footer.querySelector('.tac-footer-buttons')) return;

    var tacAllowAll = document.getElementById('tarteaucitronAllAllowed');
    var tacDenyAll  = document.getElementById('tarteaucitronAllDenied');
    var tacSave     = document.getElementById('tarteaucitronSaveButton');
    var tacClose    = document.getElementById('tarteaucitronClosePanel');

    if (tacSave) tacSave.style.display = 'none';

    function closePanel() {
      if (tacClose) {
        tacClose.click();
      } else if (typeof tarteaucitron !== 'undefined' && tarteaucitron.userInterface && tarteaucitron.userInterface.closePanel) {
        tarteaucitron.userInterface.closePanel();
      }
    }

    var wrapper = document.createElement('div');
    wrapper.className = 'tac-footer-buttons';

    var btnDeny = document.createElement('button');
    btnDeny.type        = 'button';
    btnDeny.className   = 'tac-btn tac-btn-deny';
    btnDeny.textContent = TAC_CONFIG.btnLabelDeny;
    btnDeny.addEventListener('click', function () {
      if (tacDenyAll) tacDenyAll.click();
      closePanel();
    });

    var btnAllow = document.createElement('button');
    btnAllow.type        = 'button';
    btnAllow.className   = 'tac-btn tac-btn-allow';
    btnAllow.textContent = TAC_CONFIG.btnLabelAllow;
    btnAllow.addEventListener('click', function () {
      if (tacAllowAll) tacAllowAll.click();
      closePanel();
    });

    var btnSave = document.createElement('button');
    btnSave.type        = 'button';
    btnSave.className   = 'tac-btn tac-btn-save';
    btnSave.textContent = TAC_CONFIG.btnLabelSave;
    btnSave.addEventListener('click', function () {
      if (tacSave) {
        tacSave.style.display = '';
        tacSave.click();
        tacSave.style.display = 'none';
      }
      closePanel();
    });

    wrapper.appendChild(btnDeny);
    wrapper.appendChild(btnSave);
    wrapper.appendChild(btnAllow);

    footer.insertBefore(wrapper, footer.firstChild);
  }

  /* ----------------------------------------------------------
     ČÁST 0c: Taby – Detaily / O cookies
     ---------------------------------------------------------- */
  function initTabs() {
    var services = document.getElementById('tarteaucitronServices');
    if (!services) return;
    if (services.querySelector('.tac-tabs-wrapper')) return;

    var border = services.querySelector('.tarteaucitronBorder');
    if (!border) return;

    var tabsWrapper = document.createElement('div');
    tabsWrapper.className = 'tac-tabs-wrapper';

    var nav = document.createElement('div');
    nav.className = 'tac-nav-tabs';
    nav.setAttribute('role', 'tablist');

    var btnDetails = document.createElement('button');
    btnDetails.className = 'tac-tab-btn tac-tab-btn--active';
    btnDetails.type = 'button';
    btnDetails.setAttribute('role', 'tab');
    btnDetails.setAttribute('aria-selected', 'true');
    btnDetails.setAttribute('data-tac-tab', 'details');
    btnDetails.textContent = TAC_CONFIG.tabLabelDetails;

    var btnAbout = document.createElement('button');
    btnAbout.className = 'tac-tab-btn';
    btnAbout.type = 'button';
    btnAbout.setAttribute('role', 'tab');
    btnAbout.setAttribute('aria-selected', 'false');
    btnAbout.setAttribute('data-tac-tab', 'about');
    btnAbout.textContent = TAC_CONFIG.tabLabelAbout;

    nav.appendChild(btnDetails);
    nav.appendChild(btnAbout);
    tabsWrapper.appendChild(nav);

    var aboutPanel = document.createElement('div');
    aboutPanel.className = 'tac-about-panel';
    aboutPanel.setAttribute('role', 'tabpanel');
    aboutPanel.style.display = 'none';
    aboutPanel.innerHTML = '<p class="tac-about-text">' + TAC_CONFIG.aboutText + '</p>';

    services.insertBefore(tabsWrapper, border);
    services.insertBefore(aboutPanel, border);

    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-tac-tab]');
      if (!btn) return;

      var tab = btn.getAttribute('data-tac-tab');

      nav.querySelectorAll('.tac-tab-btn').forEach(function (b) {
        b.classList.remove('tac-tab-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('tac-tab-btn--active');
      btn.setAttribute('aria-selected', 'true');

      if (tab === 'details') {
        border.style.display      = '';
        aboutPanel.style.display  = 'none';
      } else {
        border.style.display      = 'none';
        aboutPanel.style.display  = '';
      }
    });
  }

  /* ----------------------------------------------------------
     ČÁST 1a: Mandatory cookies – disabled switch
     ---------------------------------------------------------- */
  function convertMandatorySwitches() {
    var mandatoryContainers = document.querySelectorAll(
      '#tarteaucitronServices_mandatory .tarteaucitronAsk'
    );

    mandatoryContainers.forEach(function (container) {
      if (container.dataset.tacMandatory === '1') return;
      container.dataset.tacMandatory = '1';

      var wrap = document.createElement('div');
      wrap.className = 'tac-switch-wrap tac-switch-wrap--disabled';

      var track = document.createElement('span');
      track.className = 'tac-switch-track tac-switch-track--on';
      track.setAttribute('aria-hidden', 'true');

      var thumb = document.createElement('span');
      thumb.className = 'tac-switch-thumb';
      track.appendChild(thumb);

      var label = document.createElement('span');
      label.className   = 'tac-switch-label';
      label.textContent = TAC_CONFIG.labelMandatory;

      wrap.appendChild(track);
      wrap.appendChild(label);

      container.querySelectorAll('button').forEach(function (btn) {
        btn.style.display = 'none';
      });

      container.insertBefore(wrap, container.firstChild);
      container.style.display    = 'flex';
      container.style.alignItems = 'center';
      container.style.gap        = '10px';
    });
  }

  /* ----------------------------------------------------------
     ČÁST 1b: Toggle switch – služby
     ---------------------------------------------------------- */
  function createToggleSwitch(allowBtn, denyBtn, serviceId) {
    var isAllowed = allowBtn.getAttribute('aria-pressed') === 'true';

    var wrap = document.createElement('div');
    wrap.className = 'tac-switch-wrap';

    var track = document.createElement('span');
    track.className = 'tac-switch-track' + (isAllowed ? ' tac-switch-track--on' : '');
    track.setAttribute('role', 'switch');
    track.setAttribute('aria-checked', isAllowed ? 'true' : 'false');
    track.setAttribute('tabindex', '0');
    track.setAttribute('id', 'tac-switch-' + serviceId);

    var thumb = document.createElement('span');
    thumb.className = 'tac-switch-thumb';
    track.appendChild(thumb);

    var label = document.createElement('span');
    label.className   = 'tac-switch-label';
    label.textContent = isAllowed ? TAC_CONFIG.labelAllowed : TAC_CONFIG.labelDenied;

    function toggle(newState) {
      track.classList.toggle('tac-switch-track--on', newState);
      track.setAttribute('aria-checked', newState ? 'true' : 'false');
      label.textContent = newState ? TAC_CONFIG.labelAllowed : TAC_CONFIG.labelDenied;
      if (newState) { allowBtn.click(); } else { denyBtn.click(); }
    }

    track.addEventListener('click', function () {
      toggle(track.getAttribute('aria-checked') !== 'true');
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle(track.getAttribute('aria-checked') !== 'true');
      }
    });

    wrap.appendChild(track);
    wrap.appendChild(label);
    return wrap;
  }

  /* ----------------------------------------------------------
     ČÁST 1c: Checkbox – kategorie
     ---------------------------------------------------------- */
  function createCategoryCheckbox(allowBtn, denyBtn, serviceId) {
    var isAllowed = allowBtn.getAttribute('aria-pressed') === 'true';

    var wrap = document.createElement('div');
    wrap.className = 'tac-checkbox-wrap';

    var box = document.createElement('span');
    box.className = 'tac-checkbox' + (isAllowed ? ' tac-checkbox--checked' : '');
    box.setAttribute('role', 'checkbox');
    box.setAttribute('aria-checked', isAllowed ? 'true' : 'false');
    box.setAttribute('tabindex', '0');
    box.setAttribute('id', 'tac-checkbox-' + serviceId);

    function toggle(newState) {
      box.classList.toggle('tac-checkbox--checked', newState);
      box.setAttribute('aria-checked', newState ? 'true' : 'false');
      if (newState) { allowBtn.click(); } else { denyBtn.click(); }
    }

    box.addEventListener('click', function () {
      toggle(box.getAttribute('aria-checked') !== 'true');
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle(box.getAttribute('aria-checked') !== 'true');
      }
    });

    wrap.appendChild(box);
    return wrap;
  }

  function convertToSwitchesAndCheckboxes() {
    var askContainers = document.querySelectorAll('.tarteaucitronAsk');

    askContainers.forEach(function (container) {
      if (container.closest('#tarteaucitronServices_mandatory')) return;

      var allowBtn = container.querySelector('.tarteaucitronAllow');
      var denyBtn  = container.querySelector('.tarteaucitronDeny');

      if (allowBtn && denyBtn && !container.querySelector('.tac-switch-wrap, .tac-checkbox-wrap')) {
        var serviceId = (allowBtn.id || '')
          .replace('Allowed', '')
          .replace('tarteaucitron-accept-group-', '');

        var isCategory = !!(container.id && container.id.startsWith('tarteaucitron-group-'));

        var element = isCategory
          ? createCategoryCheckbox(allowBtn, denyBtn, serviceId)
          : createToggleSwitch(allowBtn, denyBtn, serviceId);

        allowBtn.style.display = 'none';
        denyBtn.style.display  = 'none';

        container.insertBefore(element, container.firstChild);
        container.style.display    = 'flex';
        container.style.alignItems = 'center';
        container.style.gap        = '10px';
      }
    });
  }

  /* ----------------------------------------------------------
     ČÁST 2: Skrytí prázdných kategorií
     ---------------------------------------------------------- */
  function hideEmptyCategories() {
    var categories = document.querySelectorAll('[id^="tarteaucitronServicesTitle_"]');

    categories.forEach(function (category) {
      var counter = category.querySelector('[id^="tarteaucitronCounter-"]');
      if (!counter) return;

      var count      = counter.textContent.trim();
      var categoryId = category.id.replace('tarteaucitronServicesTitle_', '');

      if (count === '(0)') {
        category.style.display = 'none';
        console.log('[TAC] Skryta prázdná kategorie:', categoryId);
      } else {
        category.style.display = 'block';
        console.log('[TAC] Zobrazena kategorie:', categoryId, count);
      }
    });
  }

  /* ----------------------------------------------------------
     ČÁST 3: Kliknutí na název kategorie => toggle služeb
     ---------------------------------------------------------- */
  function updateCategoryExpandedState(line) {
    if (!line) return;
    var manageButton = line.querySelector('.tarteaucitron-toggle-group');
    if (!manageButton) return;
    var isExpanded = manageButton.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      line.classList.add('category-expanded');
    } else {
      line.classList.remove('category-expanded');
    }
  }

  function enableCategoryTitleClick() {
    var categoryH3s = document.querySelectorAll('.tarteaucitronLine .tarteaucitronH3');

    categoryH3s.forEach(function (h3) {
      var line = h3.closest('.tarteaucitronLine');
      if (!line) return;

      var manageButton = line.querySelector('.tarteaucitron-toggle-group');
      if (!manageButton) return;

      updateCategoryExpandedState(line);

      h3.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        var currentLine = this.closest('.tarteaucitronLine');
        var btn = currentLine.querySelector('.tarteaucitron-toggle-group');
        if (btn) {
          btn.click();
          setTimeout(function () { updateCategoryExpandedState(currentLine); }, 50);
        }
        return false;
      };

      var nameDiv = h3.closest('.tarteaucitronName');
      if (nameDiv) {
        nameDiv.onclick = function (e) {
          if (
            e.target.tagName === 'A'      ||
            e.target.tagName === 'BUTTON' ||
            e.target.tagName === 'INPUT'  ||
            e.target.tagName === 'LABEL'  ||
            e.target.closest('.tarteaucitronAsk')    ||
            e.target.closest('.tac-switch-wrap')     ||
            e.target.closest('.tac-checkbox-wrap')   ||
            e.target.closest('a')                    ||
            e.target.closest('button')
          ) return;

          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          var currentLine = this.closest('.tarteaucitronLine');
          var btn = currentLine.querySelector('.tarteaucitron-toggle-group');
          if (btn) {
            btn.click();
            setTimeout(function () { updateCategoryExpandedState(currentLine); }, 50);
          }
          return false;
        };
      }
    });
  }

  /* ----------------------------------------------------------
     ČÁST 4: Animační delay pro položky služeb
     ---------------------------------------------------------- */
  function addServiceAnimationDelays() {
    var serviceContainers = document.querySelectorAll('ul[id^="tarteaucitronServices_"]');
    serviceContainers.forEach(function (container) {
      var services = container.querySelectorAll('li');
      services.forEach(function (service, index) {
        service.style.setProperty('--service-index', index);
      });
    });
  }

  /* ----------------------------------------------------------
     ČÁST 5: MutationObserver
     ---------------------------------------------------------- */
  function initMutationObservers() {
    var bodyObserver = new MutationObserver(function (mutations) {
      var shouldConvert = false;

      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length) shouldConvert = true;

        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-pressed') {
          var target = mutation.target;
          if (target.classList && target.classList.contains('tarteaucitronAllow')) {
            var container = target.closest('.tarteaucitronAsk');
            if (container) {
              var isPressed = target.getAttribute('aria-pressed') === 'true';

              var track = container.querySelector('.tac-switch-track');
              if (track) {
                track.classList.toggle('tac-switch-track--on', isPressed);
                track.setAttribute('aria-checked', isPressed ? 'true' : 'false');
              }

              var box = container.querySelector('.tac-checkbox');
              if (box) {
                box.classList.toggle('tac-checkbox--checked', isPressed);
                box.setAttribute('aria-checked', isPressed ? 'true' : 'false');
              }
            }
          }
        }
      });

      if (shouldConvert) {
        setTimeout(convertMandatorySwitches, 50);
        setTimeout(convertToSwitchesAndCheckboxes, 50);
        setTimeout(hideEmptyCategories, 100);
      }
    });

    bodyObserver.observe(document.body, {
      childList:       true,
      subtree:         true,
      attributes:      true,
      attributeFilter: ['aria-pressed', 'class', 'style'],
    });

    var tacPanel = document.querySelector('#tarteaucitron');
    if (tacPanel) {
      var tacObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
            var button = mutation.target;
            var line   = button.closest('.tarteaucitronLine');
            if (line) updateCategoryExpandedState(line);
          }

          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(function (node) {
              if (
                node.nodeType === 1 &&
                node.classList &&
                (node.classList.contains('tarteaucitronLine') ||
                  (node.querySelector && node.querySelector('.tarteaucitronLine')))
              ) {
                setTimeout(function () {
                  enableCategoryTitleClick();
                  addServiceAnimationDelays();
                }, 200);
              }
            });
          }
        });
      });

      tacObserver.observe(tacPanel, {
        childList:       true,
        subtree:         true,
        attributes:      true,
        attributeFilter: ['aria-expanded'],
      });
    }
  }

  /* ----------------------------------------------------------
     START
     ---------------------------------------------------------- */
  waitForTarteaucitron(function () {

    setTimeout(function () {
      runAll();
      initMutationObservers();

      if (tarteaucitron.userInterface && tarteaucitron.userInterface.openPanel && !tarteaucitron.userInterface.__tacConvertHooked) {
        tarteaucitron.userInterface.__tacConvertHooked = true;
        var orig1 = tarteaucitron.userInterface.openPanel;
        tarteaucitron.userInterface.openPanel = function () {
          orig1.apply(this, arguments);
          setTimeout(runAll, 300);
        };
      }
    }, 500);

    setTimeout(function () {
      enableCategoryTitleClick();
      addServiceAnimationDelays();

      if (tarteaucitron.userInterface && tarteaucitron.userInterface.openPanel && !tarteaucitron.userInterface.__tacCategoryHooked) {
        tarteaucitron.userInterface.__tacCategoryHooked = true;
        var orig2 = tarteaucitron.userInterface.openPanel;
        tarteaucitron.userInterface.openPanel = function () {
          orig2.apply(this, arguments);
          setTimeout(function () {
            enableCategoryTitleClick();
            addServiceAnimationDelays();
          }, 500);
        };
      }
    }, 1500);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        runAll();
        enableCategoryTitleClick();
        addServiceAnimationDelays();
      }, 1000);
    });
  } else {
    setTimeout(function () {
      runAll();
      enableCategoryTitleClick();
      addServiceAnimationDelays();
    }, 1000);
  }

})();