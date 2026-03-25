import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const CART_ITEMS_LINE_LIST: SectionTemplate = {
  id: 'cart-items-line-list',
  category: 'cart-items',
  variant: 'minimal',
  name: 'Cart Line Item List',
  description: 'Cart line items: product image thumbnail, title, variant, quantity +/- controls, line price, remove button. Clean table-like layout. 3 items.',
  tones: ['minimal', 'modern', 'elegant'],

  html: `
<div data-section-id="cart-items-line-list" class="cart-items-line-list">
  <div class="cart-items-line-list__header">
    <h2 class="cart-items-line-list__title">{{ITEMS_TITLE}}</h2>
    <p class="cart-items-line-list__subtitle">{{ITEMS_COUNT}}</p>
  </div>

  <div class="cart-items-line-list__items">
    <!-- Item 1 -->
    <div class="cart-items-line-list__item">
      <div class="cart-items-line-list__thumbnail">
        <img src="{{ITEM_1_IMAGE}}" alt="{{ITEM_1_TITLE}}" class="cart-items-line-list__thumbnail-img" />
      </div>

      <div class="cart-items-line-list__details">
        <h3 class="cart-items-line-list__item-title">{{ITEM_1_TITLE}}</h3>
        <p class="cart-items-line-list__item-variant">{{ITEM_1_VARIANT}}</p>
      </div>

      <div class="cart-items-line-list__quantity">
        <button class="cart-items-line-list__qty-btn" aria-label="Decrease quantity">−</button>
        <input type="number" class="cart-items-line-list__qty-input" value="{{ITEM_1_QTY}}" min="0" />
        <button class="cart-items-line-list__qty-btn" aria-label="Increase quantity">+</button>
      </div>

      <div class="cart-items-line-list__price">
        <p class="cart-items-line-list__unit-price">{{ITEM_1_UNIT_PRICE}}</p>
        <p class="cart-items-line-list__line-price">{{ITEM_1_LINE_PRICE}}</p>
      </div>

      <button class="cart-items-line-list__remove" aria-label="Remove item">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m3 3 12 12M15 3 3 15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Item 2 -->
    <div class="cart-items-line-list__item">
      <div class="cart-items-line-list__thumbnail">
        <img src="{{ITEM_2_IMAGE}}" alt="{{ITEM_2_TITLE}}" class="cart-items-line-list__thumbnail-img" />
      </div>

      <div class="cart-items-line-list__details">
        <h3 class="cart-items-line-list__item-title">{{ITEM_2_TITLE}}</h3>
        <p class="cart-items-line-list__item-variant">{{ITEM_2_VARIANT}}</p>
      </div>

      <div class="cart-items-line-list__quantity">
        <button class="cart-items-line-list__qty-btn" aria-label="Decrease quantity">−</button>
        <input type="number" class="cart-items-line-list__qty-input" value="{{ITEM_2_QTY}}" min="0" />
        <button class="cart-items-line-list__qty-btn" aria-label="Increase quantity">+</button>
      </div>

      <div class="cart-items-line-list__price">
        <p class="cart-items-line-list__unit-price">{{ITEM_2_UNIT_PRICE}}</p>
        <p class="cart-items-line-list__line-price">{{ITEM_2_LINE_PRICE}}</p>
      </div>

      <button class="cart-items-line-list__remove" aria-label="Remove item">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m3 3 12 12M15 3 3 15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Item 3 -->
    <div class="cart-items-line-list__item">
      <div class="cart-items-line-list__thumbnail">
        <img src="{{ITEM_3_IMAGE}}" alt="{{ITEM_3_TITLE}}" class="cart-items-line-list__thumbnail-img" />
      </div>

      <div class="cart-items-line-list__details">
        <h3 class="cart-items-line-list__item-title">{{ITEM_3_TITLE}}</h3>
        <p class="cart-items-line-list__item-variant">{{ITEM_3_VARIANT}}</p>
      </div>

      <div class="cart-items-line-list__quantity">
        <button class="cart-items-line-list__qty-btn" aria-label="Decrease quantity">−</button>
        <input type="number" class="cart-items-line-list__qty-input" value="{{ITEM_3_QTY}}" min="0" />
        <button class="cart-items-line-list__qty-btn" aria-label="Increase quantity">+</button>
      </div>

      <div class="cart-items-line-list__price">
        <p class="cart-items-line-list__unit-price">{{ITEM_3_UNIT_PRICE}}</p>
        <p class="cart-items-line-list__line-price">{{ITEM_3_LINE_PRICE}}</p>
      </div>

      <button class="cart-items-line-list__remove" aria-label="Remove item">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m3 3 12 12M15 3 3 15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</div>
  `,

  css: `
.cart-items-line-list {
  background: var(--color-bg);
  border-radius: 8px;
}

.cart-items-line-list__header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
  margin-bottom: 0;
}

.cart-items-line-list__title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
}

.cart-items-line-list__subtitle {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: rgba(var(--color-text-rgb), 0.6);
  margin: 0;
}

.cart-items-line-list__items {
  display: flex;
  flex-direction: column;
}

.cart-items-line-list__item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.06);
  transition: background 0.2s ease;
}

.cart-items-line-list__item:hover {
  background: rgba(var(--color-text-rgb), 0.02);
}

.cart-items-line-list__item:last-child {
  border-bottom: none;
}

.cart-items-line-list__thumbnail {
  width: 80px;
  height: 80px;
  background: rgba(var(--color-text-rgb), 0.05);
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.cart-items-line-list__thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-items-line-list__details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.cart-items-line-list__item-title {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-items-line-list__item-variant {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: rgba(var(--color-text-rgb), 0.6);
  margin: 0;
}

.cart-items-line-list__quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(var(--color-text-rgb), 0.05);
  border: 1px solid rgba(var(--color-text-rgb), 0.1);
  border-radius: 4px;
  padding: 0.25rem;
  width: 110px;
}

.cart-items-line-list__qty-btn {
  flex: 1;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.1rem;
  line-height: 1;
  transition: all 0.2s ease;
}

.cart-items-line-list__qty-btn:hover {
  background: rgba(var(--color-text-rgb), 0.05);
  color: var(--color-accent);
}

.cart-items-line-list__qty-input {
  flex: 1;
  background: transparent;
  border: none;
  text-align: center;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text);
  outline: none;
  width: 40px;
}

/* Hide number input spinners */
.cart-items-line-list__qty-input::-webkit-outer-spin-button,
.cart-items-line-list__qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cart-items-line-list__qty-input[type=number] {
  -moz-appearance: textfield;
}

.cart-items-line-list__price {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: right;
  min-width: 100px;
}

.cart-items-line-list__unit-price {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: rgba(var(--color-text-rgb), 0.6);
  text-decoration: line-through;
  margin: 0;
}

.cart-items-line-list__line-price {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.cart-items-line-list__remove {
  background: none;
  border: none;
  color: rgba(var(--color-text-rgb), 0.5);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.cart-items-line-list__remove:hover {
  color: var(--color-accent);
  background: rgba(var(--color-accent-rgb), 0.08);
  border-radius: 4px;
}

/* Mobile */
@media (max-width: 640px) {
  .cart-items-line-list__item {
    grid-template-columns: 70px 1fr auto auto;
    gap: 1rem;
  }

  .cart-items-line-list__thumbnail {
    width: 70px;
    height: 70px;
  }

  .cart-items-line-list__quantity {
    width: 90px;
    font-size: 0.9rem;
  }

  .cart-items-line-list__qty-input {
    width: 30px;
  }

  .cart-items-line-list__price {
    min-width: 70px;
  }

  .cart-items-line-list__item-title {
    font-size: 0.9rem;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .cart-items-line-list__item {
    grid-template-columns: 90px 1fr auto auto auto;
    gap: 1.75rem;
  }

  .cart-items-line-list__thumbnail {
    width: 90px;
    height: 90px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .cart-items-line-list__item,
  .cart-items-line-list__qty-btn,
  .cart-items-line-list__remove {
    transition: none;
  }
}
  `,

  placeholders: [
    { key: 'ITEMS_TITLE', type: 'text', description: 'Cart items section title', defaultValue: 'Order Summary' },
    { key: 'ITEMS_COUNT', type: 'text', description: 'Number of items in cart', defaultValue: '3 items in cart' },
    { key: 'ITEM_1_IMAGE', type: 'image', description: 'Item 1 thumbnail image', defaultValue: 'https://via.placeholder.com/80x80?text=Item+1' },
    { key: 'ITEM_1_TITLE', type: 'text', description: 'Item 1 title', defaultValue: 'Classic White T-Shirt' },
    { key: 'ITEM_1_VARIANT', type: 'text', description: 'Item 1 variant', defaultValue: 'Size: M / Color: White' },
    { key: 'ITEM_1_QTY', type: 'text', description: 'Item 1 quantity', defaultValue: '2' },
    { key: 'ITEM_1_UNIT_PRICE', type: 'text', description: 'Item 1 unit price', defaultValue: '$29.99' },
    { key: 'ITEM_1_LINE_PRICE', type: 'text', description: 'Item 1 line price', defaultValue: '$59.98' },
    { key: 'ITEM_2_IMAGE', type: 'image', description: 'Item 2 thumbnail image', defaultValue: 'https://via.placeholder.com/80x80?text=Item+2' },
    { key: 'ITEM_2_TITLE', type: 'text', description: 'Item 2 title', defaultValue: 'Slim Fit Jeans' },
    { key: 'ITEM_2_VARIANT', type: 'text', description: 'Item 2 variant', defaultValue: 'Size: 32 / Color: Navy' },
    { key: 'ITEM_2_QTY', type: 'text', description: 'Item 2 quantity', defaultValue: '1' },
    { key: 'ITEM_2_UNIT_PRICE', type: 'text', description: 'Item 2 unit price', defaultValue: '$79.99' },
    { key: 'ITEM_2_LINE_PRICE', type: 'text', description: 'Item 2 line price', defaultValue: '$79.99' },
    { key: 'ITEM_3_IMAGE', type: 'image', description: 'Item 3 thumbnail image', defaultValue: 'https://via.placeholder.com/80x80?text=Item+3' },
    { key: 'ITEM_3_TITLE', type: 'text', description: 'Item 3 title', defaultValue: 'Wool Blend Sweater' },
    { key: 'ITEM_3_VARIANT', type: 'text', description: 'Item 3 variant', defaultValue: 'Size: L / Color: Grey' },
    { key: 'ITEM_3_QTY', type: 'text', description: 'Item 3 quantity', defaultValue: '1' },
    { key: 'ITEM_3_UNIT_PRICE', type: 'text', description: 'Item 3 unit price', defaultValue: '$99.99' },
    { key: 'ITEM_3_LINE_PRICE', type: 'text', description: 'Item 3 line price', defaultValue: '$99.99' },
  ],

  animations: [
    { trigger: 'hover', type: 'item-highlight', duration: '0.2s', delay: '0s' },
    { trigger: 'load', type: 'fade-in', duration: '0.3s', delay: '0s' },
  ],
};

export { CART_ITEMS_LINE_LIST };
