import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const CART_SUMMARY_ORDER_TOTAL: SectionTemplate = {
  id: 'cart-summary-order-total',
  category: 'cart-summary',
  variant: 'sticky',
  name: 'Order Total Summary',
  description: 'Order summary sidebar: subtotal, shipping estimate, tax, total, discount code input, checkout button. Trust badges below. Sticky on desktop.',
  tones: ['minimal', 'modern', 'elegant'],

  html: `
<div data-section-id="cart-summary-order-total" class="cart-summary-order-total">
  <div class="cart-summary-order-total__inner">
    <h2 class="cart-summary-order-total__title">{{SUMMARY_TITLE}}</h2>

    <!-- Line Items -->
    <div class="cart-summary-order-total__lines">
      <div class="cart-summary-order-total__line">
        <span class="cart-summary-order-total__label">{{SUBTOTAL_LABEL}}</span>
        <span class="cart-summary-order-total__value">{{SUBTOTAL_AMOUNT}}</span>
      </div>

      <div class="cart-summary-order-total__line">
        <span class="cart-summary-order-total__label">{{SHIPPING_LABEL}}</span>
        <span class="cart-summary-order-total__value cart-summary-order-total__value--accent">{{SHIPPING_AMOUNT}}</span>
      </div>

      <div class="cart-summary-order-total__line">
        <span class="cart-summary-order-total__label">{{TAX_LABEL}}</span>
        <span class="cart-summary-order-total__value">{{TAX_AMOUNT}}</span>
      </div>

      <div class="cart-summary-order-total__divider"></div>

      <div class="cart-summary-order-total__line cart-summary-order-total__line--total">
        <span class="cart-summary-order-total__label cart-summary-order-total__label--total">{{TOTAL_LABEL}}</span>
        <span class="cart-summary-order-total__value cart-summary-order-total__value--total">{{TOTAL_AMOUNT}}</span>
      </div>
    </div>

    <!-- Discount Code -->
    <div class="cart-summary-order-total__discount">
      <input
        type="text"
        class="cart-summary-order-total__discount-input"
        placeholder="{{DISCOUNT_PLACEHOLDER}}"
        aria-label="Discount code"
      />
      <button class="cart-summary-order-total__discount-btn" aria-label="Apply discount code">
        {{APPLY_BUTTON_TEXT}}
      </button>
    </div>

    <!-- Checkout Button -->
    <button class="cart-summary-order-total__checkout-btn">
      {{CHECKOUT_BUTTON_TEXT}}
    </button>

    <!-- Continue Shopping Link -->
    <a href="{{CONTINUE_SHOPPING_URL}}" class="cart-summary-order-total__continue-link">
      {{CONTINUE_SHOPPING_TEXT}}
    </a>

    <!-- Trust Badges -->
    <div class="cart-summary-order-total__badges">
      <div class="cart-summary-order-total__badge">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26H21.77L16.54 12.45L18.63 18.71L12 14.52L5.37 18.71L7.46 12.45L2.23 8.26H8.91L12 2Z" fill="currentColor"/>
        </svg>
        <span>{{BADGE_1_TEXT}}</span>
      </div>

      <div class="cart-summary-order-total__badge">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 20c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9zm3.536-13.536L11 12.464 8.464 9.928 7.05 11.343 11 15.293l4.95-4.95-1.414-1.414z" fill="currentColor"/>
        </svg>
        <span>{{BADGE_2_TEXT}}</span>
      </div>

      <div class="cart-summary-order-total__badge">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8h-1V6c0-.553-.447-1-1-1H8c-.553 0-1 .447-1 1v2H6c-1.654 0-3 1.346-3 3v10c0 1.654 1.346 3 3 3h12c1.654 0 3-1.346 3-3V11c0-1.654-1.346-3-3-3zm-5 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zM9 6h6v2H9V6z" fill="currentColor"/>
        </svg>
        <span>{{BADGE_3_TEXT}}</span>
      </div>
    </div>
  </div>
</div>
  `,

  css: `
.cart-summary-order-total {
  background: rgba(var(--color-text-rgb), 0.01);
  border: 1px solid rgba(var(--color-text-rgb), 0.08);
  border-radius: 8px;
  position: sticky;
  top: 80px;
  height: fit-content;
}

.cart-summary-order-total__inner {
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-summary-order-total__title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Summary Lines */
.cart-summary-order-total__lines {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.cart-summary-order-total__line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.06);
  font-family: var(--font-body);
  font-size: 0.9rem;
}

.cart-summary-order-total__line--total {
  border-bottom: none;
  padding: 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  background: rgba(var(--color-accent-rgb), 0.04);
  padding: 1rem;
  margin: 0 -1.5rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  margin-top: 0.5rem;
}

.cart-summary-order-total__label {
  color: rgba(var(--color-text-rgb), 0.7);
  font-weight: 500;
}

.cart-summary-order-total__label--total {
  color: var(--color-text);
  font-weight: 600;
}

.cart-summary-order-total__value {
  color: var(--color-text);
  font-weight: 500;
}

.cart-summary-order-total__value--accent {
  color: var(--color-accent);
  font-weight: 600;
}

.cart-summary-order-total__value--total {
  color: var(--color-text);
  font-weight: 600;
  font-size: 1.2rem;
}

.cart-summary-order-total__divider {
  height: 1px;
  background: rgba(var(--color-text-rgb), 0.08);
  margin: 0.5rem 0;
}

/* Discount Code */
.cart-summary-order-total__discount {
  display: flex;
  gap: 0.5rem;
  background: rgba(var(--color-text-rgb), 0.05);
  border: 1px solid rgba(var(--color-text-rgb), 0.1);
  border-radius: 6px;
  padding: 0.25rem;
}

.cart-summary-order-total__discount-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-text);
  outline: none;
}

.cart-summary-order-total__discount-input::placeholder {
  color: rgba(var(--color-text-rgb), 0.5);
}

.cart-summary-order-total__discount-btn {
  background: none;
  border: none;
  padding: 0.75rem 1.25rem;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent);
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cart-summary-order-total__discount-btn:hover {
  color: var(--color-text);
}

/* Checkout Button */
.cart-summary-order-total__checkout-btn {
  background: var(--color-accent);
  color: var(--color-bg);
  border: none;
  border-radius: 6px;
  padding: 1rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(var(--color-accent-rgb), 0.2);
}

.cart-summary-order-total__checkout-btn:hover {
  background: rgba(var(--color-accent-rgb), 0.9);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(var(--color-accent-rgb), 0.3);
}

.cart-summary-order-total__checkout-btn:active {
  transform: translateY(0);
}

/* Continue Shopping Link */
.cart-summary-order-total__continue-link {
  display: inline-block;
  text-align: center;
  padding: 0.75rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--color-accent);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.cart-summary-order-total__continue-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1px;
  background: var(--color-accent);
  transform: translateX(-50%);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-summary-order-total__continue-link:hover {
  opacity: 0.8;
}

.cart-summary-order-total__continue-link:hover::after {
  width: 100%;
}

/* Trust Badges */
.cart-summary-order-total__badges {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(var(--color-text-rgb), 0.08);
}

.cart-summary-order-total__badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: rgba(var(--color-text-rgb), 0.7);
}

.cart-summary-order-total__badge svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--color-accent);
}

/* Mobile */
@media (max-width: 767px) {
  .cart-summary-order-total {
    position: static;
    border: none;
    background: var(--color-bg);
    margin-top: 2rem;
    border-top: 1px solid rgba(var(--color-text-rgb), 0.08);
  }

  .cart-summary-order-total__inner {
    padding: 1.5rem 1.5rem;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .cart-summary-order-total__inner {
    padding: 2rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .cart-summary-order-total {
    top: 100px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .cart-summary-order-total__checkout-btn,
  .cart-summary-order-total__continue-link,
  .cart-summary-order-total__continue-link::after {
    transition: none;
  }
}
  `,

  placeholders: [
    { key: 'SUMMARY_TITLE', type: 'text', description: 'Order summary title', defaultValue: 'Order Summary' },
    { key: 'SUBTOTAL_LABEL', type: 'text', description: 'Subtotal label', defaultValue: 'Subtotal' },
    { key: 'SUBTOTAL_AMOUNT', type: 'text', description: 'Subtotal amount', defaultValue: '$239.96' },
    { key: 'SHIPPING_LABEL', type: 'text', description: 'Shipping label', defaultValue: 'Shipping' },
    { key: 'SHIPPING_AMOUNT', type: 'text', description: 'Shipping amount', defaultValue: 'FREE' },
    { key: 'TAX_LABEL', type: 'text', description: 'Tax label', defaultValue: 'Estimated Tax' },
    { key: 'TAX_AMOUNT', type: 'text', description: 'Tax amount', defaultValue: '$19.20' },
    { key: 'TOTAL_LABEL', type: 'text', description: 'Total label', defaultValue: 'Total' },
    { key: 'TOTAL_AMOUNT', type: 'text', description: 'Total amount', defaultValue: '$259.16' },
    { key: 'DISCOUNT_PLACEHOLDER', type: 'text', description: 'Discount code input placeholder', defaultValue: 'Enter code' },
    { key: 'APPLY_BUTTON_TEXT', type: 'text', description: 'Apply discount button text', defaultValue: 'Apply' },
    { key: 'CHECKOUT_BUTTON_TEXT', type: 'text', description: 'Checkout button text', defaultValue: 'Proceed to Checkout' },
    { key: 'CONTINUE_SHOPPING_URL', type: 'url', description: 'Continue shopping URL', defaultValue: '/collections' },
    { key: 'CONTINUE_SHOPPING_TEXT', type: 'text', description: 'Continue shopping link text', defaultValue: 'Continue Shopping' },
    { key: 'BADGE_1_TEXT', type: 'text', description: 'Badge 1 text', defaultValue: '5-Star Reviews' },
    { key: 'BADGE_2_TEXT', type: 'text', description: 'Badge 2 text', defaultValue: 'Quality Guaranteed' },
    { key: 'BADGE_3_TEXT', type: 'text', description: 'Badge 3 text', defaultValue: 'Secure Checkout' },
  ],

  animations: [
    { trigger: 'load', type: 'fade-in', duration: '0.3s', delay: '0s' },
    { trigger: 'hover', type: 'button-scale-up', duration: '0.3s', delay: '0s' },
  ],
};

export { CART_SUMMARY_ORDER_TOTAL };
