import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const NAV_SIDE_DRAWER: SectionTemplate = {
  id: 'nav-side-drawer',
  category: 'navigation',
  variant: 'drawer',
  name: 'Side Drawer Navigation',
  description: 'Mobile-first hamburger menu with slide-in side drawer. Clean header bar with logo center, hamburger left, cart right. Drawer slides from left with smooth animation, includes nested accordion sub-menus, search bar at top, account/language at bottom.',
  tones: ['modern', 'minimal', 'bold'],

  html: `
<nav data-section-id="nav-side-drawer" class="nav-side-drawer">
  <!-- Header Bar -->
  <div class="nav-side-drawer__header">
    <button class="nav-side-drawer__hamburger" aria-label="Open menu" aria-expanded="false">
      <span class="nav-side-drawer__hamburger-line"></span>
      <span class="nav-side-drawer__hamburger-line"></span>
      <span class="nav-side-drawer__hamburger-line"></span>
    </button>

    <a href="{{LOGO_LINK}}" class="nav-side-drawer__logo">
      {{LOGO_TEXT}}
    </a>

    <button class="nav-side-drawer__cart-btn" aria-label="Shopping cart">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2h2l1.5 11h11.5l1-7H6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="8" cy="17" r="1" fill="currentColor"/>
        <circle cx="15" cy="17" r="1" fill="currentColor"/>
      </svg>
      <span class="nav-side-drawer__cart-badge">{{CART_COUNT}}</span>
    </button>
  </div>

  <!-- Drawer Container -->
  <input type="checkbox" id="nav-drawer-toggle" class="nav-side-drawer__toggle" />

  <div class="nav-side-drawer__drawer">
    <!-- Drawer Header -->
    <div class="nav-side-drawer__drawer-header">
      <label for="nav-drawer-toggle" class="nav-side-drawer__close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </label>
    </div>

    <!-- Search Bar -->
    <div class="nav-side-drawer__search-wrapper">
      <input
        type="text"
        class="nav-side-drawer__search-input"
        placeholder="{{SEARCH_PLACEHOLDER}}"
        aria-label="Search"
      />
      <button class="nav-side-drawer__search-btn" aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.2"/>
          <path d="m10 10 4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Navigation Menu with Accordion -->
    <ul class="nav-side-drawer__menu">
      <li class="nav-side-drawer__menu-item">
        <label class="nav-side-drawer__menu-label">
          <input type="checkbox" class="nav-side-drawer__submenu-toggle" />
          <span class="nav-side-drawer__menu-text">{{NAV_ITEM_1}}</span>
          <svg class="nav-side-drawer__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="m6 4 4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </label>
        <ul class="nav-side-drawer__submenu">
          <li><a href="#" class="nav-side-drawer__submenu-link">{{NAV_ITEM_1_SUB_1}}</a></li>
          <li><a href="#" class="nav-side-drawer__submenu-link">{{NAV_ITEM_1_SUB_2}}</a></li>
          <li><a href="#" class="nav-side-drawer__submenu-link">{{NAV_ITEM_1_SUB_3}}</a></li>
        </ul>
      </li>

      <li class="nav-side-drawer__menu-item">
        <label class="nav-side-drawer__menu-label">
          <input type="checkbox" class="nav-side-drawer__submenu-toggle" />
          <span class="nav-side-drawer__menu-text">{{NAV_ITEM_2}}</span>
          <svg class="nav-side-drawer__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="m6 4 4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </label>
        <ul class="nav-side-drawer__submenu">
          <li><a href="#" class="nav-side-drawer__submenu-link">{{NAV_ITEM_2_SUB_1}}</a></li>
          <li><a href="#" class="nav-side-drawer__submenu-link">{{NAV_ITEM_2_SUB_2}}</a></li>
          <li><a href="#" class="nav-side-drawer__submenu-link">{{NAV_ITEM_2_SUB_3}}</a></li>
        </ul>
      </li>

      <li class="nav-side-drawer__menu-item">
        <a href="#" class="nav-side-drawer__menu-link">{{NAV_ITEM_3}}</a>
      </li>

      <li class="nav-side-drawer__menu-item">
        <a href="#" class="nav-side-drawer__menu-link">{{NAV_ITEM_4}}</a>
      </li>
    </ul>

    <!-- Drawer Footer -->
    <div class="nav-side-drawer__drawer-footer">
      <div class="nav-side-drawer__account-section">
        <a href="#" class="nav-side-drawer__footer-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="4" r="2.5" stroke="currentColor" stroke-width="1.2"/>
            <path d="M1 14c0-2 2-3 7-3s7 1 7 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          {{ACCOUNT_TEXT}}
        </a>
      </div>
      <div class="nav-side-drawer__language-section">
        <select class="nav-side-drawer__language-select" aria-label="Language">
          <option>{{LANGUAGE_1}}</option>
          <option>{{LANGUAGE_2}}</option>
          <option>{{LANGUAGE_3}}</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Overlay -->
  <label for="nav-drawer-toggle" class="nav-side-drawer__overlay"></label>
</nav>
  `,

  css: `
.nav-side-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

/* Header Bar */
.nav-side-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg);
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
  padding: 1.25rem 1.5rem;
  height: 64px;
}

.nav-side-drawer__hamburger {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  flex-shrink: 0;
}

.nav-side-drawer__hamburger-line {
  width: 18px;
  height: 1.5px;
  background: var(--color-text);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-side-drawer__toggle:checked ~ .nav-side-drawer__hamburger-line:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.nav-side-drawer__toggle:checked ~ .nav-side-drawer__hamburger-line:nth-child(2) {
  opacity: 0;
}

.nav-side-drawer__toggle:checked ~ .nav-side-drawer__hamburger-line:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* Logo */
.nav-side-drawer__logo {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex: 1;
  text-align: center;
  transition: opacity 0.2s ease;
}

.nav-side-drawer__logo:hover {
  opacity: 0.7;
}

/* Cart Button */
.nav-side-drawer__cart-btn {
  position: relative;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-side-drawer__cart-btn:hover {
  color: var(--color-accent);
}

.nav-side-drawer__cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--color-accent);
  color: var(--color-bg);
  font-size: 0.65rem;
  font-weight: 600;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hidden checkbox toggle */
.nav-side-drawer__toggle {
  display: none;
}

/* Drawer */
.nav-side-drawer__drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 320px;
  height: 100vh;
  background: var(--color-bg);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 200;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.nav-side-drawer__toggle:checked ~ .nav-side-drawer__drawer {
  transform: translateX(0);
}

/* Drawer Header */
.nav-side-drawer__drawer-header {
  display: flex;
  justify-content: flex-end;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
  flex-shrink: 0;
}

.nav-side-drawer__close {
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

.nav-side-drawer__close:hover {
  color: var(--color-accent);
}

/* Search */
.nav-side-drawer__search-wrapper {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
  flex-shrink: 0;
}

.nav-side-drawer__search-input {
  flex: 1;
  background: rgba(var(--color-text-rgb), 0.05);
  border: 1px solid rgba(var(--color-text-rgb), 0.1);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

.nav-side-drawer__search-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.nav-side-drawer__search-input::placeholder {
  color: rgba(var(--color-text-rgb), 0.5);
}

.nav-side-drawer__search-btn {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-side-drawer__search-btn:hover {
  color: var(--color-accent);
}

/* Menu */
.nav-side-drawer__menu {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.nav-side-drawer__menu-item {
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
}

.nav-side-drawer__menu-label,
.nav-side-drawer__menu-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-side-drawer__menu-link {
  text-decoration: none;
}

.nav-side-drawer__menu-link:active {
  background: rgba(var(--color-text-rgb), 0.05);
}

.nav-side-drawer__menu-label input {
  display: none;
}

.nav-side-drawer__menu-text {
  flex: 1;
  font-weight: 500;
}

.nav-side-drawer__chevron {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.nav-side-drawer__submenu-toggle:checked ~ .nav-side-drawer__chevron {
  transform: rotate(90deg);
}

/* Submenu */
.nav-side-drawer__submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(var(--color-text-rgb), 0.03);
}

.nav-side-drawer__submenu-toggle:checked ~ .nav-side-drawer__submenu {
  max-height: 500px;
}

.nav-side-drawer__submenu-link {
  display: block;
  padding: 0.75rem 1.5rem 0.75rem 3rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: rgba(var(--color-text-rgb), 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.04);
}

.nav-side-drawer__submenu-link:active {
  background: rgba(var(--color-text-rgb), 0.06);
  color: var(--color-accent);
  padding-left: 3.5rem;
}

/* Drawer Footer */
.nav-side-drawer__drawer-footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(var(--color-text-rgb), 0.08);
  flex-shrink: 0;
  background: rgba(var(--color-text-rgb), 0.02);
}

.nav-side-drawer__account-section {
  display: flex;
}

.nav-side-drawer__footer-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(var(--color-text-rgb), 0.05);
  border-radius: 4px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.nav-side-drawer__footer-link:active {
  background: rgba(var(--color-text-rgb), 0.1);
  color: var(--color-accent);
}

.nav-side-drawer__language-section {
  display: flex;
}

.nav-side-drawer__language-select {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(var(--color-text-rgb), 0.05);
  border: 1px solid rgba(var(--color-text-rgb), 0.1);
  border-radius: 4px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.nav-side-drawer__language-select:focus {
  outline: none;
  border-color: var(--color-accent);
}

/* Overlay */
.nav-side-drawer__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  opacity: 0;
  visibility: hidden;
  z-index: 150;
  cursor: pointer;
  transition: opacity 0.4s ease, visibility 0.4s ease;
}

.nav-side-drawer__toggle:checked ~ .nav-side-drawer__overlay {
  background: rgba(0, 0, 0, 0.25);
  opacity: 1;
  visibility: visible;
}

/* Tablet (768px+) - Hide drawer on larger screens */
@media (min-width: 768px) {
  .nav-side-drawer__hamburger {
    display: none;
  }

  .nav-side-drawer__drawer {
    display: none;
  }

  .nav-side-drawer__overlay {
    display: none;
  }
}
  `,

  placeholders: [
    { key: 'LOGO_TEXT', type: 'text', description: 'Brand logo text', defaultValue: 'AICATA' },
    { key: 'LOGO_LINK', type: 'url', description: 'Home page link', defaultValue: '/' },
    { key: 'NAV_ITEM_1', type: 'text', description: 'First navigation item with submenu', defaultValue: 'Women' },
    { key: 'NAV_ITEM_1_SUB_1', type: 'text', description: 'Submenu item 1', defaultValue: 'Dresses' },
    { key: 'NAV_ITEM_1_SUB_2', type: 'text', description: 'Submenu item 2', defaultValue: 'Tops' },
    { key: 'NAV_ITEM_1_SUB_3', type: 'text', description: 'Submenu item 3', defaultValue: 'Bottoms' },
    { key: 'NAV_ITEM_2', type: 'text', description: 'Second navigation item with submenu', defaultValue: 'Men' },
    { key: 'NAV_ITEM_2_SUB_1', type: 'text', description: 'Submenu item 1', defaultValue: 'Shirts' },
    { key: 'NAV_ITEM_2_SUB_2', type: 'text', description: 'Submenu item 2', defaultValue: 'Pants' },
    { key: 'NAV_ITEM_2_SUB_3', type: 'text', description: 'Submenu item 3', defaultValue: 'Outerwear' },
    { key: 'NAV_ITEM_3', type: 'text', description: 'Third navigation item', defaultValue: 'Sale' },
    { key: 'NAV_ITEM_4', type: 'text', description: 'Fourth navigation item', defaultValue: 'Contact' },
    { key: 'SEARCH_PLACEHOLDER', type: 'text', description: 'Search input placeholder', defaultValue: 'Search products...' },
    { key: 'ACCOUNT_TEXT', type: 'text', description: 'Account link text', defaultValue: 'My Account' },
    { key: 'LANGUAGE_1', type: 'text', description: 'First language option', defaultValue: 'English' },
    { key: 'LANGUAGE_2', type: 'text', description: 'Second language option', defaultValue: 'Español' },
    { key: 'LANGUAGE_3', type: 'text', description: 'Third language option', defaultValue: 'Français' },
    { key: 'CART_COUNT', type: 'text', description: 'Shopping cart item count', defaultValue: '0' },
  ],

  animations: [
    { trigger: 'hover', type: 'drawer-slide-in', duration: '0.4s', delay: '0s' },
    { trigger: 'scroll', type: 'submenu-accordion-expand', duration: '0.3s', delay: '0s' },
  ],
};

export { NAV_SIDE_DRAWER };
