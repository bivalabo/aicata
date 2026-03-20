import type { SectionTemplate, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const NAV_ELEGANT_DROPDOWN: SectionTemplate = {
  id: 'nav-elegant-dropdown',
  category: 'navigation',
  variant: 'animated',
  name: 'Elegant Dropdown Navigation',
  description: 'Sophisticated navigation with animated dropdown menus, logo lockup, and mobile hamburger drawer. Inspired by luxury retail design.',
  tones: ['luxury', 'elegant', 'minimal'],

  html: `
<nav data-section-id="nav-elegant-dropdown" class="nav-elegant-dropdown">
  <div class="nav-elegant-dropdown__container">
    <!-- Logo -->
    <div class="nav-elegant-dropdown__logo">
      <a href="{{LOGO_LINK}}" class="nav-elegant-dropdown__logo-link">
        {{LOGO_TEXT}}
      </a>
    </div>

    <!-- Desktop Navigation -->
    <ul class="nav-elegant-dropdown__menu">
      <li class="nav-elegant-dropdown__item">
        <a href="{{LINK_1_URL}}" class="nav-elegant-dropdown__link">
          {{LINK_1_TEXT}}
        </a>
      </li>
      <li class="nav-elegant-dropdown__item nav-elegant-dropdown__item--has-submenu">
        <button class="nav-elegant-dropdown__link nav-elegant-dropdown__link--submenu" aria-expanded="false" aria-haspopup="true">
          {{LINK_2_TEXT}}
          <svg class="nav-elegant-dropdown__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <ul class="nav-elegant-dropdown__submenu">
          <li><a href="{{SUBMENU_2_1_URL}}" class="nav-elegant-dropdown__submenu-link">{{SUBMENU_2_1_TEXT}}</a></li>
          <li><a href="{{SUBMENU_2_2_URL}}" class="nav-elegant-dropdown__submenu-link">{{SUBMENU_2_2_TEXT}}</a></li>
          <li><a href="{{SUBMENU_2_3_URL}}" class="nav-elegant-dropdown__submenu-link">{{SUBMENU_2_3_TEXT}}</a></li>
        </ul>
      </li>
      <li class="nav-elegant-dropdown__item">
        <a href="{{LINK_3_URL}}" class="nav-elegant-dropdown__link">
          {{LINK_3_TEXT}}
        </a>
      </li>
      <li class="nav-elegant-dropdown__item">
        <a href="{{LINK_4_URL}}" class="nav-elegant-dropdown__link">
          {{LINK_4_TEXT}}
        </a>
      </li>
    </ul>

    <!-- Right Actions -->
    <div class="nav-elegant-dropdown__actions">
      <button class="nav-elegant-dropdown__action-btn nav-elegant-dropdown__search-btn" aria-label="Search">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="m12 12 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="nav-elegant-dropdown__action-btn nav-elegant-dropdown__cart-btn" aria-label="Shopping cart">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.5 3h2l2.5 10.5h10l2-8H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="6" cy="15" r="1.5" fill="currentColor"/>
          <circle cx="13.5" cy="15" r="1.5" fill="currentColor"/>
        </svg>
      </button>
      <button class="nav-elegant-dropdown__hamburger" aria-label="Menu" aria-expanded="false">
        <span class="nav-elegant-dropdown__hamburger-line"></span>
        <span class="nav-elegant-dropdown__hamburger-line"></span>
        <span class="nav-elegant-dropdown__hamburger-line"></span>
      </button>
    </div>
  </div>

  <!-- Mobile Drawer -->
  <div class="nav-elegant-dropdown__drawer">
    <div class="nav-elegant-dropdown__drawer-header">
      <button class="nav-elegant-dropdown__drawer-close" aria-label="Close menu">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m2 2 16 16M18 2 2 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <ul class="nav-elegant-dropdown__drawer-menu">
      <li><a href="{{LINK_1_URL}}" class="nav-elegant-dropdown__drawer-link">{{LINK_1_TEXT}}</a></li>
      <li>
        <button class="nav-elegant-dropdown__drawer-link nav-elegant-dropdown__drawer-toggle" aria-expanded="false">
          {{LINK_2_TEXT}}
        </button>
        <ul class="nav-elegant-dropdown__drawer-submenu">
          <li><a href="{{SUBMENU_2_1_URL}}" class="nav-elegant-dropdown__drawer-sublink">{{SUBMENU_2_1_TEXT}}</a></li>
          <li><a href="{{SUBMENU_2_2_URL}}" class="nav-elegant-dropdown__drawer-sublink">{{SUBMENU_2_2_TEXT}}</a></li>
          <li><a href="{{SUBMENU_2_3_URL}}" class="nav-elegant-dropdown__drawer-sublink">{{SUBMENU_2_3_TEXT}}</a></li>
        </ul>
      </li>
      <li><a href="{{LINK_3_URL}}" class="nav-elegant-dropdown__drawer-link">{{LINK_3_TEXT}}</a></li>
      <li><a href="{{LINK_4_URL}}" class="nav-elegant-dropdown__drawer-link">{{LINK_4_TEXT}}</a></li>
    </ul>
  </div>

  <!-- Drawer Overlay -->
  <div class="nav-elegant-dropdown__overlay"></div>
</nav>
  `,

  css: `
.nav-elegant-dropdown {
  position: relative;
  z-index: 100;
  background: var(--color-bg);
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.1);
}

.nav-elegant-dropdown__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem;
}

/* Logo */
.nav-elegant-dropdown__logo {
  flex-shrink: 0;
}

.nav-elegant-dropdown__logo-link {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  text-decoration: none;
  color: var(--color-text);
  transition: opacity 0.3s ease;
}

.nav-elegant-dropdown__logo-link:hover {
  opacity: 0.7;
}

/* Desktop Menu */
.nav-elegant-dropdown__menu {
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 3rem;
  flex: 1;
  justify-content: center;
}

.nav-elegant-dropdown__item {
  position: relative;
}

.nav-elegant-dropdown__link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-decoration: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.2s ease;
}

.nav-elegant-dropdown__link:hover {
  color: var(--color-accent);
}

.nav-elegant-dropdown__chevron {
  transition: transform 0.3s ease;
  opacity: 0.6;
}

.nav-elegant-dropdown__item--has-submenu > .nav-elegant-dropdown__link[aria-expanded="true"] .nav-elegant-dropdown__chevron {
  transform: rotate(180deg);
}

/* Dropdown Submenu */
.nav-elegant-dropdown__submenu {
  position: absolute;
  top: calc(100% + 0.75rem);
  left: 0;
  list-style: none;
  margin: 0;
  padding: 1rem 0;
  background: var(--color-bg);
  border: 1px solid rgba(var(--color-text-rgb), 0.1);
  border-radius: 0.25rem;
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.nav-elegant-dropdown__item--has-submenu:hover .nav-elegant-dropdown__submenu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.nav-elegant-dropdown__submenu-link {
  display: block;
  padding: 0.75rem 1.5rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 400;
  text-decoration: none;
  color: var(--color-text);
  transition: color 0.2s ease, background 0.2s ease;
}

.nav-elegant-dropdown__submenu-link:hover {
  background: rgba(var(--color-text-rgb), 0.05);
  color: var(--color-accent);
}

/* Actions */
.nav-elegant-dropdown__actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.nav-elegant-dropdown__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.nav-elegant-dropdown__action-btn:hover {
  color: var(--color-accent);
}

.nav-elegant-dropdown__search-btn,
.nav-elegant-dropdown__cart-btn {
  display: none;
}

.nav-elegant-dropdown__hamburger {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.nav-elegant-dropdown__hamburger-line {
  width: 20px;
  height: 1.5px;
  background: var(--color-text);
  transition: all 0.3s ease;
}

.nav-elegant-dropdown__hamburger[aria-expanded="true"] .nav-elegant-dropdown__hamburger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.nav-elegant-dropdown__hamburger[aria-expanded="true"] .nav-elegant-dropdown__hamburger-line:nth-child(2) {
  opacity: 0;
}

.nav-elegant-dropdown__hamburger[aria-expanded="true"] .nav-elegant-dropdown__hamburger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Drawer */
.nav-elegant-dropdown__drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 320px;
  height: 100vh;
  background: var(--color-bg);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 200;
  overflow-y: auto;
}

.nav-elegant-dropdown__drawer.is-open {
  transform: translateX(0);
}

.nav-elegant-dropdown__drawer-header {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.1);
}

.nav-elegant-dropdown__drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.nav-elegant-dropdown__drawer-close:hover {
  color: var(--color-accent);
}

.nav-elegant-dropdown__drawer-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-elegant-dropdown__drawer-link {
  display: block;
  width: 100%;
  text-align: left;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 400;
  text-decoration: none;
  color: var(--color-text);
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.05);
}

.nav-elegant-dropdown__drawer-link:hover {
  background: rgba(var(--color-text-rgb), 0.05);
  color: var(--color-accent);
}

.nav-elegant-dropdown__drawer-submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.nav-elegant-dropdown__drawer-toggle[aria-expanded="true"] ~ .nav-elegant-dropdown__drawer-submenu {
  max-height: 500px;
}

.nav-elegant-dropdown__drawer-sublink {
  display: block;
  padding: 0.75rem 1.5rem 0.75rem 3rem;
  background: rgba(var(--color-text-rgb), 0.02);
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 400;
  text-decoration: none;
  color: var(--color-text);
  transition: color 0.2s ease;
}

.nav-elegant-dropdown__drawer-sublink:hover {
  color: var(--color-accent);
}

.nav-elegant-dropdown__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.4s ease, visibility 0.4s ease;
  z-index: 150;
}

.nav-elegant-dropdown__overlay.is-visible {
  background: rgba(0, 0, 0, 0.2);
  opacity: 1;
  visibility: visible;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .nav-elegant-dropdown__container {
    padding: 1.25rem 2rem;
  }

  .nav-elegant-dropdown__menu {
    display: flex;
  }

  .nav-elegant-dropdown__search-btn,
  .nav-elegant-dropdown__cart-btn {
    display: flex;
  }

  .nav-elegant-dropdown__hamburger {
    display: none;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .nav-elegant-dropdown__container {
    padding: 1.75rem 2rem;
  }

  .nav-elegant-dropdown__logo-link {
    font-size: 1.35rem;
  }

  .nav-elegant-dropdown__link {
    font-size: 0.95rem;
  }
}
  `,

  placeholders: [
    { key: 'LOGO_TEXT', type: 'text', description: 'Brand logo text', defaultValue: 'AICATA' },
    { key: 'LOGO_LINK', type: 'url', description: 'Home page link', defaultValue: '/' },
    { key: 'LINK_1_TEXT', type: 'text', description: 'First navigation link label', defaultValue: 'Shop' },
    { key: 'LINK_1_URL', type: 'url', description: 'First navigation link URL', defaultValue: '/shop' },
    { key: 'LINK_2_TEXT', type: 'text', description: 'Second navigation link label (has submenu)', defaultValue: 'Collections' },
    { key: 'SUBMENU_2_1_TEXT', type: 'text', description: 'First submenu item', defaultValue: 'New Arrivals' },
    { key: 'SUBMENU_2_1_URL', type: 'url', description: 'First submenu link', defaultValue: '/collections/new' },
    { key: 'SUBMENU_2_2_TEXT', type: 'text', description: 'Second submenu item', defaultValue: 'Best Sellers' },
    { key: 'SUBMENU_2_2_URL', type: 'url', description: 'Second submenu link', defaultValue: '/collections/bestsellers' },
    { key: 'SUBMENU_2_3_TEXT', type: 'text', description: 'Third submenu item', defaultValue: 'Sale' },
    { key: 'SUBMENU_2_3_URL', type: 'url', description: 'Third submenu link', defaultValue: '/collections/sale' },
    { key: 'LINK_3_TEXT', type: 'text', description: 'Third navigation link label', defaultValue: 'About' },
    { key: 'LINK_3_URL', type: 'url', description: 'Third navigation link URL', defaultValue: '/about' },
    { key: 'LINK_4_TEXT', type: 'text', description: 'Fourth navigation link label', defaultValue: 'Contact' },
    { key: 'LINK_4_URL', type: 'url', description: 'Fourth navigation link URL', defaultValue: '/contact' },
  ],

  animations: [
    { trigger: 'hover', type: 'submenu-fade-slide', duration: '0.3s' },
    { trigger: 'load', type: 'drawer-slide-in', duration: '0.4s' },
    { trigger: 'scroll', type: 'hamburger-animate', duration: '0.3s' },
  ],
};

export { NAV_ELEGANT_DROPDOWN };
