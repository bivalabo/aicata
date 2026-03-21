import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const SEARCH_PREDICTIVE_OVERLAY: SectionTemplate = {
  id: 'search-predictive-overlay',
  category: 'search',
  variant: 'animated',
  name: 'Predictive Search Overlay',
  description: 'Full-screen search overlay with large input field, popular searches, trending products grid (4 items). Smooth fade-in animation.',
  tones: ['modern', 'minimal', 'elegant'],

  html: `
<div data-section-id="search-predictive-overlay" class="search-predictive-overlay">
  <input type="checkbox" id="search-overlay-toggle" class="search-predictive-overlay__toggle" />

  <!-- Overlay -->
  <label for="search-overlay-toggle" class="search-predictive-overlay__backdrop"></label>

  <!-- Modal -->
  <div class="search-predictive-overlay__modal">
    <div class="search-predictive-overlay__header">
      <div class="search-predictive-overlay__input-wrapper">
        <svg class="search-predictive-overlay__search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/>
          <path d="m12 12 6 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <input
          type="text"
          class="search-predictive-overlay__input"
          placeholder="{{SEARCH_PLACEHOLDER}}"
          aria-label="Search products"
        />
      </div>
      <label for="search-overlay-toggle" class="search-predictive-overlay__close" aria-label="Close search">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </label>
    </div>

    <div class="search-predictive-overlay__content">
      <!-- Popular Searches -->
      <div class="search-predictive-overlay__section">
        <h2 class="search-predictive-overlay__section-title">{{POPULAR_SEARCHES_TITLE}}</h2>
        <ul class="search-predictive-overlay__popular-list">
          <li><a href="#" class="search-predictive-overlay__popular-link">{{POPULAR_SEARCH_1}}</a></li>
          <li><a href="#" class="search-predictive-overlay__popular-link">{{POPULAR_SEARCH_2}}</a></li>
          <li><a href="#" class="search-predictive-overlay__popular-link">{{POPULAR_SEARCH_3}}</a></li>
          <li><a href="#" class="search-predictive-overlay__popular-link">{{POPULAR_SEARCH_4}}</a></li>
          <li><a href="#" class="search-predictive-overlay__popular-link">{{POPULAR_SEARCH_5}}</a></li>
          <li><a href="#" class="search-predictive-overlay__popular-link">{{POPULAR_SEARCH_6}}</a></li>
        </ul>
      </div>

      <!-- Trending Products -->
      <div class="search-predictive-overlay__section">
        <h2 class="search-predictive-overlay__section-title">{{TRENDING_TITLE}}</h2>
        <div class="search-predictive-overlay__products-grid">
          <article class="search-predictive-overlay__product">
            <a href="#" class="search-predictive-overlay__product-link">
              <img src="{{PRODUCT_1_IMAGE}}" alt="{{PRODUCT_1_TITLE}}" class="search-predictive-overlay__product-image" />
              <h3 class="search-predictive-overlay__product-title">{{PRODUCT_1_TITLE}}</h3>
              <p class="search-predictive-overlay__product-price">{{PRODUCT_1_PRICE}}</p>
            </a>
          </article>

          <article class="search-predictive-overlay__product">
            <a href="#" class="search-predictive-overlay__product-link">
              <img src="{{PRODUCT_2_IMAGE}}" alt="{{PRODUCT_2_TITLE}}" class="search-predictive-overlay__product-image" />
              <h3 class="search-predictive-overlay__product-title">{{PRODUCT_2_TITLE}}</h3>
              <p class="search-predictive-overlay__product-price">{{PRODUCT_2_PRICE}}</p>
            </a>
          </article>

          <article class="search-predictive-overlay__product">
            <a href="#" class="search-predictive-overlay__product-link">
              <img src="{{PRODUCT_3_IMAGE}}" alt="{{PRODUCT_3_TITLE}}" class="search-predictive-overlay__product-image" />
              <h3 class="search-predictive-overlay__product-title">{{PRODUCT_3_TITLE}}</h3>
              <p class="search-predictive-overlay__product-price">{{PRODUCT_3_PRICE}}</p>
            </a>
          </article>

          <article class="search-predictive-overlay__product">
            <a href="#" class="search-predictive-overlay__product-link">
              <img src="{{PRODUCT_4_IMAGE}}" alt="{{PRODUCT_4_TITLE}}" class="search-predictive-overlay__product-image" />
              <h3 class="search-predictive-overlay__product-title">{{PRODUCT_4_TITLE}}</h3>
              <p class="search-predictive-overlay__product-price">{{PRODUCT_4_PRICE}}</p>
            </a>
          </article>
        </div>
      </div>
    </div>
  </div>
</div>
  `,

  css: `
.search-predictive-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  pointer-events: none;
}

.search-predictive-overlay__toggle {
  display: none;
}

.search-predictive-overlay__backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  z-index: 150;
}

.search-predictive-overlay__toggle:checked ~ .search-predictive-overlay__backdrop {
  background: rgba(0, 0, 0, 0.4);
  opacity: 1;
  visibility: visible;
}

/* Modal */
.search-predictive-overlay__modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-height: 100vh;
  background: var(--color-bg);
  z-index: 200;
  display: flex;
  flex-direction: column;
  transform: translateY(-100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.search-predictive-overlay__toggle:checked ~ .search-predictive-overlay__modal {
  transform: translateY(0);
  pointer-events: auto;
}

/* Header */
.search-predictive-overlay__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
  flex-shrink: 0;
}

.search-predictive-overlay__input-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  background: rgba(var(--color-text-rgb), 0.05);
  border: 1px solid rgba(var(--color-text-rgb), 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.search-predictive-overlay__input-wrapper:focus-within {
  border-color: var(--color-accent);
  background: rgba(var(--color-text-rgb), 0.02);
}

.search-predictive-overlay__search-icon {
  flex-shrink: 0;
  color: rgba(var(--color-text-rgb), 0.5);
  transition: color 0.2s ease;
}

.search-predictive-overlay__input-wrapper:focus-within .search-predictive-overlay__search-icon {
  color: var(--color-accent);
}

.search-predictive-overlay__input {
  flex: 1;
  background: transparent;
  border: none;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
  outline: none;
}

.search-predictive-overlay__input::placeholder {
  color: rgba(var(--color-text-rgb), 0.5);
}

.search-predictive-overlay__close {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.search-predictive-overlay__close:hover {
  color: var(--color-accent);
}

/* Content */
.search-predictive-overlay__content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.search-predictive-overlay__section {
  margin-bottom: 3rem;
}

.search-predictive-overlay__section:last-child {
  margin-bottom: 0;
}

.search-predictive-overlay__section-title {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text);
  margin: 0 0 1.5rem 0;
}

/* Popular Searches */
.search-predictive-overlay__popular-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.search-predictive-overlay__popular-link {
  display: inline-block;
  padding: 0.75rem 1rem;
  background: rgba(var(--color-text-rgb), 0.05);
  border: 1px solid rgba(var(--color-text-rgb), 0.1);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.2s ease;
  text-align: center;
}

.search-predictive-overlay__popular-link:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg);
}

/* Products Grid */
.search-predictive-overlay__products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2rem;
}

.search-predictive-overlay__product {
  display: flex;
  flex-direction: column;
}

.search-predictive-overlay__product-link {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.2s ease;
}

.search-predictive-overlay__product-link:hover {
  opacity: 0.8;
}

.search-predictive-overlay__product-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: rgba(var(--color-text-rgb), 0.05);
  transition: all 0.3s ease;
}

.search-predictive-overlay__product-link:hover .search-predictive-overlay__product-image {
  transform: scale(1.05);
}

.search-predictive-overlay__product-title {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.search-predictive-overlay__product-price {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-accent);
  margin: 0;
}

/* Mobile */
@media (max-width: 640px) {
  .search-predictive-overlay__header {
    padding: 1rem 1rem;
    gap: 0.75rem;
  }

  .search-predictive-overlay__content {
    padding: 1.5rem 1rem;
  }

  .search-predictive-overlay__popular-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .search-predictive-overlay__products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .search-predictive-overlay__header {
    padding: 2rem;
  }

  .search-predictive-overlay__content {
    padding: 2.5rem 2rem;
  }

  .search-predictive-overlay__products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .search-predictive-overlay__modal,
  .search-predictive-overlay__backdrop,
  .search-predictive-overlay__product-image {
    transition: none;
  }
}
  `,

  placeholders: [
    { key: 'SEARCH_PLACEHOLDER', type: 'text', description: 'Search input placeholder', defaultValue: 'Search products...' },
    { key: 'POPULAR_SEARCHES_TITLE', type: 'text', description: 'Popular searches section title', defaultValue: 'Popular Searches' },
    { key: 'POPULAR_SEARCH_1', type: 'text', description: 'Popular search 1', defaultValue: 'Summer Dresses' },
    { key: 'POPULAR_SEARCH_2', type: 'text', description: 'Popular search 2', defaultValue: 'Bestsellers' },
    { key: 'POPULAR_SEARCH_3', type: 'text', description: 'Popular search 3', defaultValue: 'New Arrivals' },
    { key: 'POPULAR_SEARCH_4', type: 'text', description: 'Popular search 4', defaultValue: 'On Sale' },
    { key: 'POPULAR_SEARCH_5', type: 'text', description: 'Popular search 5', defaultValue: 'Winter Collection' },
    { key: 'POPULAR_SEARCH_6', type: 'text', description: 'Popular search 6', defaultValue: 'Accessories' },
    { key: 'TRENDING_TITLE', type: 'text', description: 'Trending products section title', defaultValue: 'Trending Now' },
    { key: 'PRODUCT_1_IMAGE', type: 'image', description: 'Product 1 image', defaultValue: 'https://via.placeholder.com/200x200?text=Product+1' },
    { key: 'PRODUCT_1_TITLE', type: 'text', description: 'Product 1 title', defaultValue: 'White T-Shirt' },
    { key: 'PRODUCT_1_PRICE', type: 'text', description: 'Product 1 price', defaultValue: '$29.99' },
    { key: 'PRODUCT_2_IMAGE', type: 'image', description: 'Product 2 image', defaultValue: 'https://via.placeholder.com/200x200?text=Product+2' },
    { key: 'PRODUCT_2_TITLE', type: 'text', description: 'Product 2 title', defaultValue: 'Black Jeans' },
    { key: 'PRODUCT_2_PRICE', type: 'text', description: 'Product 2 price', defaultValue: '$59.99' },
    { key: 'PRODUCT_3_IMAGE', type: 'image', description: 'Product 3 image', defaultValue: 'https://via.placeholder.com/200x200?text=Product+3' },
    { key: 'PRODUCT_3_TITLE', type: 'text', description: 'Product 3 title', defaultValue: 'Wool Sweater' },
    { key: 'PRODUCT_3_PRICE', type: 'text', description: 'Product 3 price', defaultValue: '$79.99' },
    { key: 'PRODUCT_4_IMAGE', type: 'image', description: 'Product 4 image', defaultValue: 'https://via.placeholder.com/200x200?text=Product+4' },
    { key: 'PRODUCT_4_TITLE', type: 'text', description: 'Product 4 title', defaultValue: 'Leather Jacket' },
    { key: 'PRODUCT_4_PRICE', type: 'text', description: 'Product 4 price', defaultValue: '$149.99' },
  ],

  animations: [
    { trigger: 'load', type: 'modal-slide-down', duration: '0.4s', delay: '0s' },
    { trigger: 'hover', type: 'product-scale-up', duration: '0.3s', delay: '0s' },
  ],
};

export { SEARCH_PREDICTIVE_OVERLAY };
