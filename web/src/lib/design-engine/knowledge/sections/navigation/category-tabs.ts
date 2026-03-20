import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const NAV_CATEGORY_TABS: SectionTemplate = {
  id: 'nav-category-tabs',
  category: 'navigation',
  variant: 'tabs',
  name: 'Category Tabs Navigation',
  description: 'Secondary navigation with horizontal scrollable category tabs below main header. Pill-style active indicator with smooth transition. Used for collection/category browsing.',
  tones: ['modern', 'playful', 'minimal'],

  html: `
<nav data-section-id="nav-category-tabs" class="nav-category-tabs">
  <div class="nav-category-tabs__container">
    <button class="nav-category-tabs__scroll-btn nav-category-tabs__scroll-btn--left" aria-label="Scroll left">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m10 12-4-4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div class="nav-category-tabs__scroll-wrapper">
      <ul class="nav-category-tabs__tabs">
        <li class="nav-category-tabs__tab-item nav-category-tabs__tab-item--active">
          <a href="#" class="nav-category-tabs__tab-link nav-category-tabs__tab-link--active">
            {{TAB_1_TEXT}}
          </a>
        </li>
        <li class="nav-category-tabs__tab-item">
          <a href="#" class="nav-category-tabs__tab-link">
            {{TAB_2_TEXT}}
          </a>
        </li>
        <li class="nav-category-tabs__tab-item">
          <a href="#" class="nav-category-tabs__tab-link">
            {{TAB_3_TEXT}}
          </a>
        </li>
        <li class="nav-category-tabs__tab-item">
          <a href="#" class="nav-category-tabs__tab-link">
            {{TAB_4_TEXT}}
          </a>
        </li>
        <li class="nav-category-tabs__tab-item">
          <a href="#" class="nav-category-tabs__tab-link">
            {{TAB_5_TEXT}}
          </a>
        </li>
        <li class="nav-category-tabs__tab-item">
          <a href="#" class="nav-category-tabs__tab-link">
            {{TAB_6_TEXT}}
          </a>
        </li>
        <li class="nav-category-tabs__tab-item">
          <a href="#" class="nav-category-tabs__tab-link">
            {{TAB_7_TEXT}}
          </a>
        </li>
        <li class="nav-category-tabs__tab-item">
          <a href="#" class="nav-category-tabs__tab-link">
            {{TAB_8_TEXT}}
          </a>
        </li>
      </ul>
    </div>

    <button class="nav-category-tabs__scroll-btn nav-category-tabs__scroll-btn--right" aria-label="Scroll right">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m6 4 4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</nav>
  `,

  css: `
.nav-category-tabs {
  background: var(--color-bg);
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
  position: sticky;
  top: 64px;
  z-index: 90;
}

.nav-category-tabs__container {
  display: flex;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  gap: 0;
}

/* Scroll Buttons */
.nav-category-tabs__scroll-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.75rem;
  transition: color 0.2s ease;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.nav-category-tabs__scroll-btn:hover {
  color: var(--color-accent);
}

/* Scroll Wrapper */
.nav-category-tabs__scroll-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  /* Hide scrollbar */
  scrollbar-width: none;
}

.nav-category-tabs__scroll-wrapper::-webkit-scrollbar {
  display: none;
}

/* Tabs List */
.nav-category-tabs__tabs {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
  min-width: min-content;
  padding: 0 1.5rem;
}

.nav-category-tabs__tab-item {
  flex-shrink: 0;
}

.nav-category-tabs__tab-link {
  display: inline-block;
  padding: 1rem 1.5rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  color: rgba(var(--color-text-rgb), 0.6);
  text-transform: capitalize;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 20px;
}

.nav-category-tabs__tab-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1.5rem;
  right: 1.5rem;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-category-tabs__tab-link:hover {
  color: var(--color-text);
}

.nav-category-tabs__tab-link:hover::before {
  transform: scaleX(1);
}

/* Active State */
.nav-category-tabs__tab-link--active {
  color: var(--color-text);
  background: rgba(var(--color-accent-rgb), 0.08);
}

.nav-category-tabs__tab-link--active::before {
  transform: scaleX(1);
}

/* Mobile - Stack tabs vertically or hide scroll buttons */
@media (max-width: 640px) {
  .nav-category-tabs__tabs {
    padding: 0 1rem;
    gap: 0.25rem;
  }

  .nav-category-tabs__tab-link {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }

  .nav-category-tabs__scroll-btn {
    display: flex;
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .nav-category-tabs__tabs {
    padding: 0 1.25rem;
  }

  .nav-category-tabs__tab-link {
    padding: 0.9rem 1.25rem;
    font-size: 0.88rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .nav-category-tabs__scroll-wrapper {
    overflow-x: auto;
  }

  .nav-category-tabs__tabs {
    gap: 0.75rem;
    padding: 0 2rem;
  }

  .nav-category-tabs__tab-link {
    padding: 1rem 1.75rem;
    font-size: 0.95rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .nav-category-tabs__tab-link,
  .nav-category-tabs__tab-link::before,
  .nav-category-tabs__scroll-wrapper {
    transition: none;
  }
}
  `,

  placeholders: [
    { key: 'TAB_1_TEXT', type: 'text', description: 'First tab label', defaultValue: 'All' },
    { key: 'TAB_2_TEXT', type: 'text', description: 'Second tab label', defaultValue: 'New Arrivals' },
    { key: 'TAB_3_TEXT', type: 'text', description: 'Third tab label', defaultValue: 'Best Sellers' },
    { key: 'TAB_4_TEXT', type: 'text', description: 'Fourth tab label', defaultValue: 'Trending' },
    { key: 'TAB_5_TEXT', type: 'text', description: 'Fifth tab label', defaultValue: 'Limited Edition' },
    { key: 'TAB_6_TEXT', type: 'text', description: 'Sixth tab label', defaultValue: 'Sustainable' },
    { key: 'TAB_7_TEXT', type: 'text', description: 'Seventh tab label', defaultValue: 'On Sale' },
    { key: 'TAB_8_TEXT', type: 'text', description: 'Eighth tab label', defaultValue: 'Exclusive' },
  ],

  animations: [
    { trigger: 'hover', type: 'tab-underline-expand', duration: '0.3s', delay: '0s' },
    { trigger: 'scroll', type: 'tabs-smooth-scroll', duration: '0.4s', delay: '0s' },
  ],
};

export { NAV_CATEGORY_TABS };
