/**
 * ui-interactions.js
 * Global enterprise UI interactions for HospiKare.
 * Handles Theme Toggling (Light/Dark Mode), Count-Up animations, Detail Drawer controls,
 * and Full-screen toggling without touching any backend APIs.
 */

(function () {
  'use strict';

  // ── 1. THEME ENGINE ──
  function getSavedTheme() {
    const saved = localStorage.getItem('hk_theme');
    if (saved) return saved;
    return 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('hk_theme', theme);
    updateThemeIcon(theme);
    window.dispatchEvent(new CustomEvent('hk-theme-change', { detail: { theme: theme } }));
  }

  function updateThemeIcon(theme) {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;
    const icon = themeBtn.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
        themeBtn.setAttribute('title', 'Switch to Light Mode');
      } else {
        icon.className = 'fa-solid fa-moon';
        themeBtn.setAttribute('title', 'Switch to Dark Mode');
      }
    }
  }

  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  // ── 2. COUNT-UP ANIMATION FOR METRIC CARDS ──
  function animateValue(obj, start, end, duration) {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = Math.floor(progress * (end - start) + start);
      
      // Preserve rupee or percentage formatting if original text had it
      const prefix = obj.dataset.prefix || '';
      const suffix = obj.dataset.suffix || '';
      obj.innerText = prefix + val.toLocaleString() + suffix;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerText = prefix + end.toLocaleString() + suffix;
      }
    };
    window.requestAnimationFrame(step);
  }

  function initCountUp() {
    const targets = document.querySelectorAll('h1[id], .stat-number, .metric-value');
    targets.forEach(el => {
      const txt = el.innerText.trim();
      const numMatch = txt.match(/\d+[\d,]*/);
      if (numMatch) {
        const rawNum = parseInt(numMatch[0].replace(/,/g, ''), 10);
        if (!isNaN(rawNum) && rawNum > 0 && !el.dataset.animated) {
          el.dataset.animated = 'true';
          if (txt.startsWith('₹')) el.dataset.prefix = '₹';
          if (txt.endsWith('%')) el.dataset.suffix = '%';
          animateValue(el, 0, rawNum, 1000);
        }
      }
    });
  }

  // Observe DOM changes to trigger count-up on dynamic loads
  const domObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        setTimeout(initCountUp, 100);
      }
    });
  });

  // ── 3. FULL-SCREEN TOGGLE ──
  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  // ── 4. DETAIL DRAWER CONTROLS ──
  function openDetailDrawer(title, contentHtml) {
    let drawer = document.getElementById('detailDrawer');
    let overlay = document.getElementById('drawerOverlay');

    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'detailDrawer';
      drawer.className = 'detail-drawer';
      drawer.innerHTML = `
        <div class="drawer-header">
          <h3 id="drawerTitle">Record Details</h3>
          <button class="drawer-close-btn" id="closeDrawerBtn" aria-label="Close Drawer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="drawer-body" id="drawerBody"></div>
      `;
      document.body.appendChild(drawer);

      overlay = document.createElement('div');
      overlay.id = 'drawerOverlay';
      overlay.className = 'drawer-overlay';
      document.body.appendChild(overlay);

      document.getElementById('closeDrawerBtn').addEventListener('click', closeDetailDrawer);
      overlay.addEventListener('click', closeDetailDrawer);
    }

    if (title) document.getElementById('drawerTitle').innerText = title;
    if (contentHtml) document.getElementById('drawerBody').innerHTML = contentHtml;

    drawer.classList.add('drawer-open');
    overlay.classList.add('overlay-active');
  }

  function closeDetailDrawer() {
    const drawer = document.getElementById('detailDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer) drawer.classList.remove('drawer-open');
    if (overlay) overlay.classList.remove('overlay-active');
  }

  // ── 5. TOAST NOTIFICATION ENGINE ──
  function showToast(message, type = 'info', title = '', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';
    if (type === 'warning') iconClass = 'fa-solid fa-circle-exclamation';

    const finalTitle = title || (type.charAt(0).toUpperCase() + type.slice(1));

    toast.innerHTML = `
      <div class="toast-icon"><i class="${iconClass}"></i></div>
      <div class="toast-content">
        <div class="toast-title">${finalTitle}</div>
        <div class="toast-desc">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px) scale(0.95)';
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', dismiss);
    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  // ── 6. DYNAMIC EMPTY STATE BUILDER ──
  function createEmptyState(iconClass = 'fa-solid fa-folder-open', title = 'No Records Found', message = 'There are no active records in this section yet.', actionText = '', actionCallback = null) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `
      <div class="empty-state-icon"><i class="${iconClass}"></i></div>
      <h3>${title}</h3>
      <p>${message}</p>
      ${actionText ? `<button class="btn btn-primary btn-sm empty-state-action"><i class="fa-solid fa-plus mr-1"></i> ${actionText}</button>` : ''}
    `;

    if (actionText && actionCallback) {
      const btn = div.querySelector('.empty-state-action');
      if (btn) btn.addEventListener('click', actionCallback);
    }
    return div;
  }

  // Expose global helpers
  window.HospiKareUI = {
    toggleTheme: toggleTheme,
    applyTheme: applyTheme,
    animateValue: animateValue,
    initCountUp: initCountUp,
    toggleFullScreen: toggleFullScreen,
    openDetailDrawer: openDetailDrawer,
    closeDetailDrawer: closeDetailDrawer,
    showToast: showToast,
    createEmptyState: createEmptyState
  };

  window.toggleTheme = toggleTheme;
  window.toggleFullScreen = toggleFullScreen;

  // ── 7. INITIALIZATION ──
  function initUI() {
    // 1. Initialize Theme
    const currentTheme = getSavedTheme();
    applyTheme(currentTheme);

    // 2. Attach Header Theme Toggle Listener
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn && !themeBtn.dataset.themeBound) {
      themeBtn.dataset.themeBound = 'true';
      themeBtn.addEventListener('click', toggleTheme);
    }

    // 3. Attach Full-Screen Listener
    const fullScreenBtn = document.getElementById('fullScreenBtn');
    if (fullScreenBtn && !fullScreenBtn.dataset.fsBound) {
      fullScreenBtn.dataset.fsBound = 'true';
      fullScreenBtn.addEventListener('click', toggleFullScreen);
    }

    // 4. Run Count-up
    setTimeout(initCountUp, 300);

    // 5. Start observing mainContent for dynamic updates
    const mainContent = document.getElementById('mainContent') || document.body;
    domObserver.observe(mainContent, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
})();

