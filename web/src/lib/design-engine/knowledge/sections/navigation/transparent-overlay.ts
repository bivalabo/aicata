import type { SectionTemplate, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const NAV_TRANSPARENT_OVERLAY: SectionTemplate = {
  id: 'nav-transparent-overlay',
  category: 'navigation',
  variant: 'fullbleed',
  name: 'Transparent Overlay Navigation',
  description: 'Navigation that overlays hero content with transparent background, transitioning to solid on scroll. Dramatic, modern aesthetic with high contrast.',
  tones: ['bold', 'modern', 'cool'],

  html: `
<nav data-section-id="nav-transparent-overlay" class="nav-transparent-overlay">
  <div class="nav-transparent-overlay__container">
    <!-- Logo -->
    <div class="nav-transparent-overlay__logo">
      <a href="{{LOGO_LINK}}" class="nav-transparent-overlay__logo-link">
        {{LOGO_TEXT}}
      </a>
    </div>

    <!-- Desktop Navigation -->
    <ul class="nav-transparent-overlay__menu">
      <li class="nav-transparent-overlay__item">
        <a href="{{LINK_1_URL}}" class="nav-transparent-overlay__link">{{LINK_1_TEXT}}</a>
      </li>
      <li class="nav-transparent-overlay__item">
        <a href="{{LINK_2_URL}}" class="nav-transparent-overlay__link">{{LINK_2_TEXT}}</a>
      </li>
      <li class="nav-transparent-overlay__item">
        <a href="{{LINK_3_URL}}" class="nav-transparent-overlay__link">{{LINK_3_TEXT}}</a>
      </li>
    </ul>

    <!-- Right Actions -->
    <div class="nav-transparent-overlay__actions">
      <button class="nav-transparent-overlay__search-btn" aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.2"/>
          <path d="m10 10 4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="nav-transparent-overlay__hamburger" aria-label="Menu" aria-expanded="false">
        <span class="nav-transparent-overlay__hamburger-line"></span>
        <span class="nav-transparent-overlay__hamburger-line"></span>
      </button>
    </div>
  </div>

  <!-- Mobile Drawer -->
  <div class="nav-transparent-overlay__drawer">
    <div class="nav-transparent-overlay__drawer-header">
      <button class="nav-transparent-overlay__drawer-close" aria-label="Close menu">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m2 2 14 14M16 2 2 16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <ul class="nav-transparent-overlay__drawer-menu">
      <li><a href="{{LINK_1_URL}}" class="nav-transparent-overlay__drawer-link">{{LINK_1_TEXT}}</a></li>
      <li><a href="{{LINK_2_URL}}" class="nav-transparent-overlay__drawer-link">{{LINK_2_TEXT}}</a></li>
      <li><a href="{{LINK_3_URL}}" class="nav-transparent-overlay__drawer-link">{{LINK_3_TEXT}}</a></li>
    </ul>
  </div>

  <!-- Drawer Overlay -->
  <div class="nav-transparent-overlay__overlay"></div>
</nav>
  `,

  css: `
.nav-transparent-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(var(--color-bg-rgb), 0);
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

.nav-transparent-overlay.is-scrolled {
  background: rgba(var(--color-bg-rgb), 0.98);
  border-bottom-color: rgba(var(--color-text-rgb), 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.nav-transparent-overlay__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.75rem 1.5rem;
  transition: padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-transparent-overlay.is-scrolled .nav-transparent-overlay__container {
  padding: 1.25rem 1.5rem;
}

/* Logo */
.nav-transparent-overlay__logo {
  flex-shrink: 0;
}

.nav-transparent-overlay__logo-link {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.95);
  transition: color 0.3s ease, opacity 0.3s ease;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-transparent-overlay.is-scrolled .nav-transparent-overlay__logo-link {
  color: var(--color-text);
  text-shadow: none;
  font-size: 1.05rem;
}

.nav-transparent-overlay__logo-link:hover {
  opacity: 0.8;
}

/* Desktop Menu */
.nav-transparent-overlay__menu {
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2.5rem;
  flex: 1;
  justify-content: center;
}

.nav-transparent-overlay__item {
  display: flex;
}

.nav-transparent-overlay__link {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.03em;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  text-transform: capitalize;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-transparent-overlay.is-scrolled .nav-transparent-overlay__link {
  color: var(--color-text);
  text-shadow: none;
}

.nav-transparent-overlay__link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.8);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-transparent-overlay.is-scrolled .nav-transparent-overlay__link::before {
  background: var(--color-accent);
}

.nav-transparent-overlay__link:hover {
  color: rgba(255, 255, 255, 1);
}

.nav-transparent-overlay.is-scrolled .nav-transparent-overlay__link:hover {
  color: var(--color-accent);
}

.nav-transparent-overlay__link:hover::before {
  width: 100%;
}

/* Actions */
.nav-transparent-overlay__actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.nav-transparent-overlay__search-btn {
  display: none;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.nav-transparent-overlay.is-scrolled .nav-transparent-overlay__search-btn {
  color: var(--color-text);
}

.nav-transparent-overlay__search-btn:hover {
  color: rgba(255, 255, 255, 1);
}

.nav-transparent-overlay.is-scrolled .nav-transparent-overlay__search-btn:hover {
  color: var(--color-accent);
}

.nav-transparent-overlay__hamburger {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.nav-transparent-overlay__hamburger-line {
  width: 20px;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-transparent-overlay.is-scrolled .nav-transparent-overlay__hamburger-line {
  background: var(--color-text);
}

.nav-transparent-overlay__hamburger[aria-expanded="true"] .nav-transparent-overlay__hamburger-line:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.nav-transparent-overlay__hamburger[aria-expanded="true"] .nav-transparent-overlay__hamburger-line:nth-child(2) {
  transform: translateY(-6px) rotate(-45deg);
}

/* Drawer */
.nav-transparent-overlay__drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 320px;
  height: 100vh;
  background: var(--color-bg);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 200;
  overflow-y: auto;
}

.nav-transparent-overlay__drawer.is-open {
  transform: translateX(0);
}

.nav-transparent-overlay__drawer-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.1);
}

.nav-transparent-overlay__drawer-close {
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

.nav-transparent-overlay__drawer-close:hover {
  color: var(--color-accent);
}

.nav-transparent-overlay__drawer-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-transparent-overlay__drawer-link {
  display: block;
  padding: 1.25rem 1.5rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 400;
  text-decoration: none;
  color: var(--color-text);
  text-transform: capitalize;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.06);
}

.nav-transparent-overlay__drawer-link:hover {
  background: rgba(var(--color-text-rgb), 0.05);
  color: var(--color-accent);
  padding-left: 2rem;
}

.nav-transparent-overlay__overlay {
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

.nav-transparent-overlay__overlay.is-visible {
  background: rgba(0, 0, 0, 0.25);
  opacity: 1;
  visibility: visible;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .nav-transparent-overlay__container {
    padding: 1.5rem 2rem;
  }

  .nav-transparent-overlay.is-scrolled .nav-transparent-overlay__container {
    padding: 1.15rem 2rem;
  }

  .nav-transparent-overlay__menu {
    display: flex;
  }

  .nav-transparent-overlay__search-btn {
    display: flex;
  }

  .nav-transparent-overlay__hamburger {
    display: none;
  }

  .nav-transparent-overlay__drawer {
    display: none !important;
  }

  .nav-transparent-overlay__overlay {
    display: none !important;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .nav-transparent-overlay__container {
    padding: 2rem 2rem;
  }

  .nav-transparent-overlay.is-scrolled .nav-transparent-overlay__container {
    padding: 1.35rem 2rem;
  }

  .nav-transparent-overlay__logo-link {
    font-size: 1.25rem;
  }

  .nav-transparent-overlay.is-scrolled .nav-transparent-overlay__logo-link {
    font-size: 1.1rem;
  }

  .nav-transparent-overlay__link {
    font-size: 0.95rem;
  }

  .nav-transparent-overlay__menu {
    gap: 3rem;
  }
}
  `,

  placeholders: [
    { key: 'LOGO_TEXT', type: 'text', description: 'Brand logo text', defaultValue: 'AICATA' },
    { key: 'LOGO_LINK', type: 'url', description: 'Home page link', defaultValue: '/' },
    { key: 'LINK_1_TEXT', type: 'text', description: 'First navigation link label', defaultValue: 'Work' },
    { key: 'LINK_1_URL', type: 'url', description: 'First navigation link URL', defaultValue: '/work' },
    { key: 'LINK_2_TEXT', type: 'text', description: 'Second navigation link label', defaultValue: 'Studio' },
    { key: 'LINK_2_URL', type: 'url', description: 'Second navigation link URL', defaultValue: '/studio' },
    { key: 'LINK_3_TEXT', type: 'text', description: 'Third navigation link label', defaultValue: 'Contact' },
    { key: 'LINK_3_URL', type: 'url', description: 'Third navigation link URL', defaultValue: '/contact' },
  ],

  animations: [
    { trigger: 'scroll', type: 'nav-background-fade-in', duration: '0.4s', delay: '0s' },
    { trigger: 'scroll', type: 'text-color-transition', duration: '0.4s', delay: '0s' },
    { trigger: 'hover', type: 'link-underline-expand', duration: '0.3s', delay: '0s' },
  ],
};

export { NAV_TRANSPARENT_OVERLAY };
