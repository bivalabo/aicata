import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const NAV_MEGA_MENU: SectionTemplate = {
  id: 'nav-mega-menu',
  category: 'navigation',
  variant: 'animated',
  name: 'Mega Menu Navigation',
  description: 'Full-width mega dropdown menu with category columns, featured image, and links. On hover, shows a full-width dropdown panel with 4 columns of links + 1 featured product/collection image.',
  tones: ['modern', 'elegant', 'minimal'],

  html: `
<nav data-section-id="nav-mega-menu" class="nav-mega-menu">
  <div class="nav-mega-menu__container">
    <!-- Logo -->
    <div class="nav-mega-menu__logo">
      <a href="{{LOGO_LINK}}" class="nav-mega-menu__logo-link">
        {{LOGO_TEXT}}
      </a>
    </div>

    <!-- Desktop Navigation -->
    <ul class="nav-mega-menu__menu">
      <li class="nav-mega-menu__item nav-mega-menu__item--with-dropdown">
        <a href="{{NAV_ITEM_1_URL}}" class="nav-mega-menu__link">{{NAV_ITEM_1}}</a>
        <div class="nav-mega-menu__dropdown">
          <div class="nav-mega-menu__dropdown-content">
            <!-- Column 1 -->
            <div class="nav-mega-menu__column">
              <h3 class="nav-mega-menu__column-title">{{MEGA_CATEGORY_1}}</h3>
              <ul class="nav-mega-menu__column-list">
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_1_LINK_1}}</a></li>
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_1_LINK_2}}</a></li>
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_1_LINK_3}}</a></li>
              </ul>
            </div>
            <!-- Column 2 -->
            <div class="nav-mega-menu__column">
              <h3 class="nav-mega-menu__column-title">{{MEGA_CATEGORY_2}}</h3>
              <ul class="nav-mega-menu__column-list">
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_2_LINK_1}}</a></li>
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_2_LINK_2}}</a></li>
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_2_LINK_3}}</a></li>
              </ul>
            </div>
            <!-- Column 3 -->
            <div class="nav-mega-menu__column">
              <h3 class="nav-mega-menu__column-title">{{MEGA_CATEGORY_3}}</h3>
              <ul class="nav-mega-menu__column-list">
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_3_LINK_1}}</a></li>
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_3_LINK_2}}</a></li>
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_3_LINK_3}}</a></li>
              </ul>
            </div>
            <!-- Column 4 -->
            <div class="nav-mega-menu__column">
              <h3 class="nav-mega-menu__column-title">{{MEGA_CATEGORY_4}}</h3>
              <ul class="nav-mega-menu__column-list">
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_4_LINK_1}}</a></li>
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_4_LINK_2}}</a></li>
                <li><a href="#" class="nav-mega-menu__dropdown-link">{{MEGA_CATEGORY_4_LINK_3}}</a></li>
              </ul>
            </div>
            <!-- Featured Image -->
            <div class="nav-mega-menu__featured">
              <img src="{{FEATURED_IMAGE}}" alt="{{FEATURED_TITLE}}" class="nav-mega-menu__featured-image" />
              <p class="nav-mega-menu__featured-title">{{FEATURED_TITLE}}</p>
            </div>
          </div>
        </div>
      </li>
      <li class="nav-mega-menu__item">
        <a href="{{NAV_ITEM_2_URL}}" class="nav-mega-menu__link">{{NAV_ITEM_2}}</a>
      </li>
      <li class="nav-mega-menu__item">
        <a href="{{NAV_ITEM_3_URL}}" class="nav-mega-menu__link">{{NAV_ITEM_3}}</a>
      </li>
      <li class="nav-mega-menu__item">
        <a href="{{NAV_ITEM_4_URL}}" class="nav-mega-menu__link">{{NAV_ITEM_4}}</a>
      </li>
      <li class="nav-mega-menu__item">
        <a href="{{NAV_ITEM_5_URL}}" class="nav-mega-menu__link">{{NAV_ITEM_5}}</a>
      </li>
    </ul>

    <!-- Right Actions -->
    <div class="nav-mega-menu__actions">
      <button class="nav-mega-menu__search-btn" aria-label="Search">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="m11 11 5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="nav-mega-menu__account-btn" aria-label="Account">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="5.5" r="3" stroke="currentColor" stroke-width="1.2"/>
          <path d="M2 16c0-2.5 2.5-4 7-4s7 1.5 7 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="nav-mega-menu__cart-btn" aria-label="Shopping cart">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2h1l1.5 10h10.5l1-6H5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="7" cy="15" r="1" fill="currentColor"/>
          <circle cx="13" cy="15" r="1" fill="currentColor"/>
        </svg>
        <span class="nav-mega-menu__cart-badge">{{CART_COUNT}}</span>
      </button>
    </div>
  </div>
</nav>
  `,

  css: `
.nav-mega-menu {
  background: var(--color-bg);
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-mega-menu__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
}

/* Logo */
.nav-mega-menu__logo {
  flex-shrink: 0;
}

.nav-mega-menu__logo-link {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-decoration: none;
  color: var(--color-text);
  transition: opacity 0.2s ease;
  text-transform: uppercase;
}

.nav-mega-menu__logo-link:hover {
  opacity: 0.7;
}

/* Desktop Menu */
.nav-mega-menu__menu {
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-mega-menu__item {
  display: flex;
  position: relative;
}

.nav-mega-menu__link {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  color: var(--color-text);
  text-transform: capitalize;
  padding: 0.5rem 0.75rem;
  transition: color 0.2s ease;
  position: relative;
}

.nav-mega-menu__link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--color-accent);
  transform: translateX(-50%);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-mega-menu__link:hover {
  color: var(--color-accent);
}

.nav-mega-menu__item--with-dropdown .nav-mega-menu__link:hover::after {
  width: 100%;
}

/* Dropdown */
.nav-mega-menu__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background: var(--color-bg);
  border-top: 1px solid rgba(var(--color-text-rgb), 0.08);
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-1rem);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  padding: 0;
}

.nav-mega-menu__item--with-dropdown:hover .nav-mega-menu__dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  pointer-events: auto;
}

.nav-mega-menu__dropdown-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}

.nav-mega-menu__column {
  display: flex;
  flex-direction: column;
}

.nav-mega-menu__column-title {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.nav-mega-menu__column-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-mega-menu__dropdown-link {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: rgba(var(--color-text-rgb), 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.25rem 0;
}

.nav-mega-menu__dropdown-link:hover {
  color: var(--color-accent);
  padding-left: 0.5rem;
}

.nav-mega-menu__featured {
  grid-column: 5;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
}

.nav-mega-menu__featured-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.nav-mega-menu__featured-title {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text);
  margin: 0;
  font-weight: 500;
}

/* Actions */
.nav-mega-menu__actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.nav-mega-menu__search-btn,
.nav-mega-menu__account-btn,
.nav-mega-menu__cart-btn {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.nav-mega-menu__search-btn:hover,
.nav-mega-menu__account-btn:hover,
.nav-mega-menu__cart-btn:hover {
  color: var(--color-accent);
}

.nav-mega-menu__cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
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

/* Mobile */
@media (max-width: 767px) {
  .nav-mega-menu__menu {
    display: none;
  }

  .nav-mega-menu__dropdown {
    display: none;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .nav-mega-menu__container {
    padding: 1.25rem 2rem;
  }

  .nav-mega-menu__menu {
    display: flex;
  }

  .nav-mega-menu__dropdown-content {
    padding: 2rem 2rem;
    gap: 2.5rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .nav-mega-menu__container {
    padding: 1.5rem 2rem;
  }

  .nav-mega-menu__menu {
    gap: 2.5rem;
  }

  .nav-mega-menu__link {
    font-size: 0.95rem;
  }

  .nav-mega-menu__logo-link {
    font-size: 1.25rem;
  }
}
  `,

  placeholders: [
    { key: 'LOGO_TEXT', type: 'text', description: 'Brand logo text', defaultValue: 'AICATA' },
    { key: 'LOGO_LINK', type: 'url', description: 'Home page link', defaultValue: '/' },
    { key: 'NAV_ITEM_1', type: 'text', description: 'First navigation item with mega menu', defaultValue: 'Collections' },
    { key: 'NAV_ITEM_1_URL', type: 'url', description: 'First navigation URL', defaultValue: '/collections' },
    { key: 'NAV_ITEM_2', type: 'text', description: 'Second navigation item', defaultValue: 'New Arrivals' },
    { key: 'NAV_ITEM_2_URL', type: 'url', description: 'Second navigation URL', defaultValue: '/new' },
    { key: 'NAV_ITEM_3', type: 'text', description: 'Third navigation item', defaultValue: 'Sale' },
    { key: 'NAV_ITEM_3_URL', type: 'url', description: 'Third navigation URL', defaultValue: '/sale' },
    { key: 'NAV_ITEM_4', type: 'text', description: 'Fourth navigation item', defaultValue: 'About' },
    { key: 'NAV_ITEM_4_URL', type: 'url', description: 'Fourth navigation URL', defaultValue: '/about' },
    { key: 'NAV_ITEM_5', type: 'text', description: 'Fifth navigation item', defaultValue: 'Contact' },
    { key: 'NAV_ITEM_5_URL', type: 'url', description: 'Fifth navigation URL', defaultValue: '/contact' },
    { key: 'MEGA_CATEGORY_1', type: 'text', description: 'First mega menu category', defaultValue: 'Women' },
    { key: 'MEGA_CATEGORY_1_LINK_1', type: 'text', description: 'Sub-link 1', defaultValue: 'Dresses' },
    { key: 'MEGA_CATEGORY_1_LINK_2', type: 'text', description: 'Sub-link 2', defaultValue: 'Tops' },
    { key: 'MEGA_CATEGORY_1_LINK_3', type: 'text', description: 'Sub-link 3', defaultValue: 'Bottoms' },
    { key: 'MEGA_CATEGORY_2', type: 'text', description: 'Second mega menu category', defaultValue: 'Men' },
    { key: 'MEGA_CATEGORY_2_LINK_1', type: 'text', description: 'Sub-link 1', defaultValue: 'Shirts' },
    { key: 'MEGA_CATEGORY_2_LINK_2', type: 'text', description: 'Sub-link 2', defaultValue: 'Pants' },
    { key: 'MEGA_CATEGORY_2_LINK_3', type: 'text', description: 'Sub-link 3', defaultValue: 'Outerwear' },
    { key: 'MEGA_CATEGORY_3', type: 'text', description: 'Third mega menu category', defaultValue: 'Accessories' },
    { key: 'MEGA_CATEGORY_3_LINK_1', type: 'text', description: 'Sub-link 1', defaultValue: 'Bags' },
    { key: 'MEGA_CATEGORY_3_LINK_2', type: 'text', description: 'Sub-link 2', defaultValue: 'Jewelry' },
    { key: 'MEGA_CATEGORY_3_LINK_3', type: 'text', description: 'Sub-link 3', defaultValue: 'Shoes' },
    { key: 'MEGA_CATEGORY_4', type: 'text', description: 'Fourth mega menu category', defaultValue: 'Sale' },
    { key: 'MEGA_CATEGORY_4_LINK_1', type: 'text', description: 'Sub-link 1', defaultValue: 'Up to 50% Off' },
    { key: 'MEGA_CATEGORY_4_LINK_2', type: 'text', description: 'Sub-link 2', defaultValue: 'Clearance' },
    { key: 'MEGA_CATEGORY_4_LINK_3', type: 'text', description: 'Sub-link 3', defaultValue: 'Last Chance' },
    { key: 'FEATURED_IMAGE', type: 'image', description: 'Featured product/collection image', defaultValue: 'https://via.placeholder.com/200x240?text=Featured' },
    { key: 'FEATURED_TITLE', type: 'text', description: 'Featured product/collection title', defaultValue: 'New Spring Collection' },
    { key: 'CART_COUNT', type: 'text', description: 'Shopping cart item count', defaultValue: '0' },
  ],

  animations: [
    { trigger: 'hover', type: 'dropdown-fade-in', duration: '0.3s', delay: '0s' },
    { trigger: 'hover', type: 'link-underline-expand', duration: '0.3s', delay: '0s' },
  ],
};

export { NAV_MEGA_MENU };
