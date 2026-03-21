import type { SectionTemplate, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const NAV_MINIMAL_STICKY: SectionTemplate = {
  id: 'nav-minimal-sticky',
  category: 'navigation',
  variant: 'minimal',
  name: 'Minimal Sticky Header',
  description: 'Ultra-minimal sticky navigation that compresses on scroll. Clean, modern aesthetic with typography-driven design.',
  tones: ['minimal', 'modern', 'cool'],

  html: `
<nav data-section-id="nav-minimal-sticky" class="nav-minimal-sticky">
  <div class="nav-minimal-sticky__container">
    <!-- Logo -->
    <div class="nav-minimal-sticky__logo">
      <a href="{{LOGO_LINK}}" class="nav-minimal-sticky__logo-link">
        {{LOGO_TEXT}}
      </a>
    </div>

    <!-- Desktop Navigation -->
    <ul class="nav-minimal-sticky__menu">
      <li class="nav-minimal-sticky__item">
        <a href="{{LINK_1_URL}}" class="nav-minimal-sticky__link">{{LINK_1_TEXT}}</a>
      </li>
      <li class="nav-minimal-sticky__item">
        <a href="{{LINK_2_URL}}" class="nav-minimal-sticky__link">{{LINK_2_TEXT}}</a>
      </li>
      <li class="nav-minimal-sticky__item">
        <a href="{{LINK_3_URL}}" class="nav-minimal-sticky__link">{{LINK_3_TEXT}}</a>
      </li>
    </ul>

    <!-- Right Actions -->
    <div class="nav-minimal-sticky__actions">
      <a href="{{CTA_URL}}" class="nav-minimal-sticky__cta">{{CTA_TEXT}}</a>
      <button class="nav-minimal-sticky__hamburger" aria-label="Menu" aria-expanded="false">
        <span class="nav-minimal-sticky__hamburger-line"></span>
        <span class="nav-minimal-sticky__hamburger-line"></span>
      </button>
    </div>
  </div>

  <!-- Mobile Drawer -->
  <div class="nav-minimal-sticky__drawer">
    <ul class="nav-minimal-sticky__drawer-menu">
      <li><a href="{{LINK_1_URL}}" class="nav-minimal-sticky__drawer-link">{{LINK_1_TEXT}}</a></li>
      <li><a href="{{LINK_2_URL}}" class="nav-minimal-sticky__drawer-link">{{LINK_2_TEXT}}</a></li>
      <li><a href="{{LINK_3_URL}}" class="nav-minimal-sticky__drawer-link">{{LINK_3_TEXT}}</a></li>
      <li class="nav-minimal-sticky__drawer-cta"><a href="{{CTA_URL}}" class="nav-minimal-sticky__drawer-cta-link">{{CTA_TEXT}}</a></li>
    </ul>
  </div>

  <!-- Drawer Overlay -->
  <div class="nav-minimal-sticky__overlay"></div>
</nav>
  `,

  css: `
.nav-minimal-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg);
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-minimal-sticky.is-scrolled {
  padding: 0.75rem 0;
  border-bottom-color: rgba(var(--color-text-rgb), 0.15);
}

.nav-minimal-sticky__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-minimal-sticky.is-scrolled .nav-minimal-sticky__container {
  padding: 0.875rem 1.5rem;
}

/* Logo */
.nav-minimal-sticky__logo {
  flex-shrink: 0;
}

.nav-minimal-sticky__logo-link {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-text);
  transition: opacity 0.3s ease;
}

.nav-minimal-sticky.is-scrolled .nav-minimal-sticky__logo-link {
  font-size: 0.95rem;
}

.nav-minimal-sticky__logo-link:hover {
  opacity: 0.6;
}

/* Desktop Menu */
.nav-minimal-sticky__menu {
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-minimal-sticky__item {
  display: flex;
}

.nav-minimal-sticky__link {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-decoration: none;
  color: var(--color-text);
  text-transform: uppercase;
  transition: color 0.2s ease;
  position: relative;
}

.nav-minimal-sticky__link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.nav-minimal-sticky__link:hover {
  color: var(--color-accent);
}

.nav-minimal-sticky__link:hover::after {
  width: 100%;
}

/* Actions */
.nav-minimal-sticky__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.nav-minimal-sticky__cta {
  display: none;
  padding: 0.6rem 1.2rem;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;
  color: var(--color-bg);
  background: var(--color-text);
  transition: all 0.3s ease;
  border-radius: 0;
}

.nav-minimal-sticky__cta:hover {
  background: var(--color-accent);
  transform: translateY(-1px);
}

.nav-minimal-sticky__hamburger {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.nav-minimal-sticky__hamburger-line {
  width: 18px;
  height: 1px;
  background: var(--color-text);
  transition: all 0.3s ease;
}

.nav-minimal-sticky__hamburger[aria-expanded="true"] .nav-minimal-sticky__hamburger-line:nth-child(1) {
  transform: rotate(45deg) translateY(6px);
}

.nav-minimal-sticky__hamburger[aria-expanded="true"] .nav-minimal-sticky__hamburger-line:nth-child(2) {
  transform: rotate(-45deg) translateY(-6px);
}

/* Drawer */
.nav-minimal-sticky__drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 300px;
  height: 100vh;
  background: var(--color-bg);
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.08);
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 200;
  overflow-y: auto;
  padding-top: 4rem;
}

.nav-minimal-sticky__drawer.is-open {
  transform: translateX(0);
}

.nav-minimal-sticky__drawer-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-minimal-sticky__drawer-link {
  display: block;
  padding: 1rem 1.5rem;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-decoration: none;
  color: var(--color-text);
  text-transform: uppercase;
  transition: color 0.2s ease, background 0.2s ease;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
}

.nav-minimal-sticky__drawer-link:hover {
  background: rgba(var(--color-text-rgb), 0.05);
  color: var(--color-accent);
}

.nav-minimal-sticky__drawer-cta {
  padding: 1.5rem 1.5rem;
  border: none;
}

.nav-minimal-sticky__drawer-cta-link {
  display: block;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;
  color: var(--color-bg);
  background: var(--color-text);
  text-align: center;
  transition: all 0.3s ease;
}

.nav-minimal-sticky__drawer-cta-link:hover {
  background: var(--color-accent);
}

.nav-minimal-sticky__overlay {
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

.nav-minimal-sticky__overlay.is-visible {
  background: rgba(0, 0, 0, 0.15);
  opacity: 1;
  visibility: visible;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .nav-minimal-sticky__container {
    padding: 1rem 2rem;
  }

  .nav-minimal-sticky.is-scrolled .nav-minimal-sticky__container {
    padding: 0.75rem 2rem;
  }

  .nav-minimal-sticky__menu {
    display: flex;
  }

  .nav-minimal-sticky__cta {
    display: block;
  }

  .nav-minimal-sticky__hamburger {
    display: none;
  }

  .nav-minimal-sticky__drawer {
    display: none !important;
  }

  .nav-minimal-sticky__overlay {
    display: none !important;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .nav-minimal-sticky__container {
    padding: 1.25rem 2rem;
  }

  .nav-minimal-sticky.is-scrolled .nav-minimal-sticky__container {
    padding: 0.875rem 2rem;
  }

  .nav-minimal-sticky__logo-link {
    font-size: 1.15rem;
  }

  .nav-minimal-sticky.is-scrolled .nav-minimal-sticky__logo-link {
    font-size: 1rem;
  }

  .nav-minimal-sticky__menu {
    gap: 2.5rem;
  }
}
  `,

  placeholders: [
    { key: 'LOGO_TEXT', type: 'text', description: 'Brand logo text', defaultValue: 'AICATA' },
    { key: 'LOGO_LINK', type: 'url', description: 'Home page link', defaultValue: '/' },
    { key: 'LINK_1_TEXT', type: 'text', description: 'First navigation link label', defaultValue: 'Shop' },
    { key: 'LINK_1_URL', type: 'url', description: 'First navigation link URL', defaultValue: '/shop' },
    { key: 'LINK_2_TEXT', type: 'text', description: 'Second navigation link label', defaultValue: 'About' },
    { key: 'LINK_2_URL', type: 'url', description: 'Second navigation link URL', defaultValue: '/about' },
    { key: 'LINK_3_TEXT', type: 'text', description: 'Third navigation link label', defaultValue: 'Journal' },
    { key: 'LINK_3_URL', type: 'url', description: 'Third navigation link URL', defaultValue: '/journal' },
    { key: 'CTA_TEXT', type: 'text', description: 'Call-to-action button text', defaultValue: 'Contact' },
    { key: 'CTA_URL', type: 'url', description: 'Call-to-action button link', defaultValue: '/contact' },
  ],

  animations: [
    { trigger: 'scroll', type: 'header-compress', duration: '0.3s', delay: '0s' },
    { trigger: 'hover', type: 'link-underline', duration: '0.3s' },
    { trigger: 'load', type: 'drawer-slide-out', duration: '0.4s' },
  ],
};

export { NAV_MINIMAL_STICKY };
