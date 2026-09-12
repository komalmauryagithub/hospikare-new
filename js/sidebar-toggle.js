/**
 * sidebar-toggle.js
 * Comprehensive Mobile Drawer & Desktop Collapse Toggle for HospiKare.
 * - Mobile (<= 900px): Off-canvas sliding drawer with dark overlay.
 * - Desktop (> 900px): Collapsible compact sidebar with icon tooltips.
 */
(function () {
  'use strict';

  function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const navLeft = document.querySelector('#topNavbar .nav-left');

    if (!sidebar || !navLeft) return; // Not a dashboard page

    // ── 1. Apply saved desktop collapse state ───────────────────────────────
    try {
      const savedCollapsed = localStorage.getItem('hk_sidebar_collapsed');
      if (savedCollapsed === 'true' && window.innerWidth > 900) {
        document.body.classList.add('sidebar-collapsed');
      }
    } catch (e) {}

    // ── 2. Add tooltips for collapsed sidebar items ─────────────────────────
    function updateTooltips() {
      const menuItems = sidebar.querySelectorAll('.menuItem, .navItem');
      menuItems.forEach(item => {
        const textSpan = item.querySelector('span');
        if (textSpan && textSpan.innerText.trim()) {
          item.setAttribute('title', textSpan.innerText.trim());
          item.setAttribute('data-tooltip', textSpan.innerText.trim());
        }
      });
    }
    updateTooltips();

    // ── 3. Inject hamburger toggle button ──────────────────────────────────
    let toggleBtn = document.getElementById('sidebarToggleBtn');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'sidebarToggleBtn';
      toggleBtn.className = 'sidebar-toggle-btn';
      toggleBtn.setAttribute('aria-label', 'Toggle sidebar');
      toggleBtn.setAttribute('type', 'button');
      toggleBtn.innerHTML = `
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
      `;
      navLeft.insertBefore(toggleBtn, navLeft.firstChild);
    }

    // ── 4. Inject dark overlay ──────────────────────────────────────────────
    let overlay = document.getElementById('sidebarOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sidebarOverlay';
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }

    // ── 5. Toggle helpers ───────────────────────────────────────────────────
    function openMobileSidebar() {
      sidebar.classList.add('sidebar-open');
      overlay.classList.add('sidebar-overlay-active');
      toggleBtn.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileSidebar() {
      sidebar.classList.remove('sidebar-open');
      overlay.classList.remove('sidebar-overlay-active');
      toggleBtn.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function toggleDesktopSidebar() {
      const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
      try {
        localStorage.setItem('hk_sidebar_collapsed', isCollapsed ? 'true' : 'false');
      } catch (e) {}
    }

    // ── 6. Event listeners ──────────────────────────────────────────────────
    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (window.innerWidth <= 900) {
        if (sidebar.classList.contains('sidebar-open')) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
        }
      } else {
        toggleDesktopSidebar();
      }
    });

    overlay.addEventListener('click', closeMobileSidebar);

    // Close sidebar when a menu item is clicked on mobile
    const menuItems = sidebar.querySelectorAll('.menuItem, .navItem');
    menuItems.forEach(function (item) {
      item.addEventListener('click', function () {
        if (window.innerWidth <= 900) {
          closeMobileSidebar();
        }
      });
    });

    // Handle window resize
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) {
        closeMobileSidebar();
        document.body.style.overflow = '';
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('sidebar-open')) {
        closeMobileSidebar();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarToggle);
  } else {
    initSidebarToggle();
  }
})();
