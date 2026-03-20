import type { SectionTemplate } from '../../../types';

export const PRODUCT_INFO_CLASSIC_VERTICAL: SectionTemplate = {
  id: 'product-info-classic-vertical',
  category: 'product-info',
  variant: 'sticky',
  name: 'Classic Product Info Block',
  description: 'Classic vertical product information layout with title, pricing (including sale price), variant selector, quantity input, and Add to Cart button. Sticky on scroll for easy purchasing.',
  tones: ['luxury', 'elegant', 'minimal'],
  html: `
    <section data-section-id="product-info-classic-vertical" class="product-info-classic-vertical">
      <div class="product-info-classic-vertical__container">

        <div class="product-info-classic-vertical__sticky-wrapper">
          <div class="product-info-classic-vertical__content">

            <!-- Product Title -->
            <h1 class="product-info-classic-vertical__title">{{PRODUCT_TITLE}}</h1>

            <!-- Rating & Reviews Link -->
            <div class="product-info-classic-vertical__rating">
              <div class="product-info-classic-vertical__stars">
                <span class="product-info-classic-vertical__star">★</span>
                <span class="product-info-classic-vertical__star">★</span>
                <span class="product-info-classic-vertical__star">★</span>
                <span class="product-info-classic-vertical__star">★</span>
                <span class="product-info-classic-vertical__star product-info-classic-vertical__star--half">★</span>
              </div>
              <a href="#reviews" class="product-info-classic-vertical__review-link">({{REVIEW_COUNT}} reviews)</a>
            </div>

            <!-- Pricing -->
            <div class="product-info-classic-vertical__pricing">
              {{#COMPARE_PRICE}}
              <span class="product-info-classic-vertical__compare-price">{{COMPARE_PRICE}}</span>
              {{/COMPARE_PRICE}}
              <span class="product-info-classic-vertical__price">{{PRICE}}</span>
            </div>

            <!-- Short Description -->
            <p class="product-info-classic-vertical__description">{{DESCRIPTION_SHORT}}</p>

            <!-- Variant Selector -->
            <div class="product-info-classic-vertical__variants">
              <div class="product-info-classic-vertical__variant-group">
                <label class="product-info-classic-vertical__variant-label">{{VARIANT_LABEL}}</label>
                <div class="product-info-classic-vertical__variant-options">
                  {{VARIANT_OPTIONS}}
                </div>
              </div>
            </div>

            <!-- Quantity Selector -->
            <div class="product-info-classic-vertical__quantity-wrapper">
              <label for="quantity" class="product-info-classic-vertical__quantity-label">Quantity</label>
              <div class="product-info-classic-vertical__quantity-selector">
                <button class="product-info-classic-vertical__quantity-btn" aria-label="Decrease quantity">−</button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value="1"
                  class="product-info-classic-vertical__quantity-input"
                />
                <button class="product-info-classic-vertical__quantity-btn" aria-label="Increase quantity">+</button>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <button class="product-info-classic-vertical__add-to-cart">
              {{ADD_TO_CART_TEXT}}
            </button>

            <!-- Buy Now / Additional CTA -->
            <button class="product-info-classic-vertical__buy-now">
              Buy it now
            </button>

            <!-- Trust Badges -->
            <div class="product-info-classic-vertical__trust-badges">
              <div class="product-info-classic-vertical__badge">
                <span class="product-info-classic-vertical__badge-icon">✓</span>
                <span class="product-info-classic-vertical__badge-text">Free shipping over ¥10,000</span>
              </div>
              <div class="product-info-classic-vertical__badge">
                <span class="product-info-classic-vertical__badge-icon">↻</span>
                <span class="product-info-classic-vertical__badge-text">30-day returns</span>
              </div>
              <div class="product-info-classic-vertical__badge">
                <span class="product-info-classic-vertical__badge-icon">🔒</span>
                <span class="product-info-classic-vertical__badge-text">Secure checkout</span>
              </div>
            </div>

            <!-- Share -->
            <div class="product-info-classic-vertical__share">
              <span class="product-info-classic-vertical__share-label">Share:</span>
              <a href="#" class="product-info-classic-vertical__share-link" aria-label="Share on Facebook">f</a>
              <a href="#" class="product-info-classic-vertical__share-link" aria-label="Share on Twitter">𝕏</a>
              <a href="#" class="product-info-classic-vertical__share-link" aria-label="Share on Pinterest">P</a>
            </div>

          </div>
        </div>

      </div>
    </section>
  `,
  css: `
    .product-info-classic-vertical {
      background-color: var(--color-bg);
      color: var(--color-text);
      padding: 40px 20px;
    }

    .product-info-classic-vertical__container {
      max-width: 500px;
      margin: 0 auto;
    }

    .product-info-classic-vertical__sticky-wrapper {
      position: relative;
    }

    .product-info-classic-vertical__content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .product-info-classic-vertical__title {
      font-family: var(--font-heading);
      font-size: 28px;
      font-weight: 400;
      line-height: 1.2;
      margin: 0;
      letter-spacing: 0.6px;
      color: var(--color-text);
    }

    .product-info-classic-vertical__rating {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .product-info-classic-vertical__stars {
      display: flex;
      gap: 4px;
      font-size: 14px;
      color: var(--color-accent);
    }

    .product-info-classic-vertical__star {
      line-height: 1;
    }

    .product-info-classic-vertical__star--half {
      opacity: 0.5;
    }

    .product-info-classic-vertical__review-link {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-muted);
      text-decoration: none;
      letter-spacing: 0.3px;
      transition: color 0.3s ease;
    }

    .product-info-classic-vertical__review-link:hover {
      color: var(--color-text);
      text-decoration: underline;
    }

    .product-info-classic-vertical__pricing {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }

    .product-info-classic-vertical__compare-price {
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--color-muted);
      text-decoration: line-through;
      letter-spacing: 0.3px;
    }

    .product-info-classic-vertical__price {
      font-family: var(--font-heading);
      font-size: 24px;
      font-weight: 500;
      color: var(--color-text);
      letter-spacing: 0.4px;
    }

    .product-info-classic-vertical__description {
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.7;
      color: var(--color-muted);
      margin: 0;
      letter-spacing: 0.3px;
    }

    .product-info-classic-vertical__variants {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .product-info-classic-vertical__variant-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .product-info-classic-vertical__variant-label {
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--color-text);
      letter-spacing: 0.8px;
    }

    .product-info-classic-vertical__variant-options {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .product-info-classic-vertical__quantity-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .product-info-classic-vertical__quantity-label {
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--color-text);
      letter-spacing: 0.8px;
    }

    .product-info-classic-vertical__quantity-selector {
      display: flex;
      border: 1px solid var(--color-muted);
      background: var(--color-bg);
      border-radius: 2px;
    }

    .product-info-classic-vertical__quantity-btn {
      flex: 0 0 40px;
      height: 40px;
      border: none;
      background: transparent;
      font-size: 18px;
      color: var(--color-text);
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .product-info-classic-vertical__quantity-btn:hover {
      background-color: var(--color-muted);
    }

    .product-info-classic-vertical__quantity-input {
      flex: 1;
      border: none;
      background: transparent;
      text-align: center;
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--color-text);
    }

    .product-info-classic-vertical__quantity-input:focus {
      outline: none;
    }

    .product-info-classic-vertical__add-to-cart {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: var(--color-text);
      color: var(--color-bg);
      border: none;
      padding: 16px 32px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-info-classic-vertical__add-to-cart:hover {
      background: var(--color-accent);
      transform: translateY(-2px);
    }

    .product-info-classic-vertical__buy-now {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: transparent;
      color: var(--color-text);
      border: 1px solid var(--color-text);
      padding: 16px 32px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-info-classic-vertical__buy-now:hover {
      background: var(--color-text);
      color: var(--color-bg);
    }

    .product-info-classic-vertical__trust-badges {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px 0;
      border-top: 1px solid var(--color-muted);
      border-bottom: 1px solid var(--color-muted);
    }

    .product-info-classic-vertical__badge {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-muted);
      letter-spacing: 0.3px;
    }

    .product-info-classic-vertical__badge-icon {
      font-size: 16px;
      color: var(--color-text);
    }

    .product-info-classic-vertical__share {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .product-info-classic-vertical__share-label {
      font-family: var(--font-body);
      font-size: 13px;
      text-transform: uppercase;
      color: var(--color-muted);
      letter-spacing: 0.6px;
    }

    .product-info-classic-vertical__share-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--color-muted);
      font-family: var(--font-heading);
      font-size: 14px;
      color: var(--color-text);
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .product-info-classic-vertical__share-link:hover {
      border-color: var(--color-text);
      background: var(--color-text);
      color: var(--color-bg);
    }

    @media (min-width: 768px) {
      .product-info-classic-vertical {
        padding: 60px 40px;
      }

      .product-info-classic-vertical__container {
        max-width: 550px;
      }

      .product-info-classic-vertical__sticky-wrapper {
        position: sticky;
        top: 100px;
      }

      .product-info-classic-vertical__title {
        font-size: 32px;
      }

      .product-info-classic-vertical__price {
        font-size: 28px;
      }

      .product-info-classic-vertical__content {
        gap: 28px;
      }
    }

    @media (min-width: 1024px) {
      .product-info-classic-vertical {
        padding: 80px 60px;
      }

      .product-info-classic-vertical__container {
        max-width: 600px;
      }

      .product-info-classic-vertical__title {
        font-size: 36px;
      }

      .product-info-classic-vertical__sticky-wrapper {
        top: 120px;
      }
    }
  `,
  placeholders: [
    {
      key: 'PRODUCT_TITLE',
      type: 'text',
      description: 'Product name/title',
      defaultValue: 'Premium Hand Cream'
    },
    {
      key: 'PRICE',
      type: 'text',
      description: 'Current product price',
      defaultValue: '¥8,800'
    },
    {
      key: 'COMPARE_PRICE',
      type: 'text',
      description: 'Original price (for sale)',
      defaultValue: '¥12,000'
    },
    {
      key: 'REVIEW_COUNT',
      type: 'text',
      description: 'Number of reviews',
      defaultValue: '127'
    },
    {
      key: 'VARIANT_LABEL',
      type: 'text',
      description: 'Variant selector label (e.g., Size, Color)',
      defaultValue: 'Size'
    },
    {
      key: 'VARIANT_OPTIONS',
      type: 'text',
      description: 'Variant options (size/color buttons)',
      defaultValue: '<button class="product-info-classic-vertical__variant-btn">50ml</button><button class="product-info-classic-vertical__variant-btn">100ml</button><button class="product-info-classic-vertical__variant-btn">200ml</button>'
    },
    {
      key: 'DESCRIPTION_SHORT',
      type: 'text',
      description: 'Short product description',
      defaultValue: 'Luxurious hand cream infused with organic ingredients. Deeply moisturizes and nourishes dry hands. Long-lasting fragrance.'
    },
    {
      key: 'ADD_TO_CART_TEXT',
      type: 'text',
      description: 'Add to cart button text',
      defaultValue: 'Add to Cart'
    }
  ],
  animations: [
    {
      trigger: 'load',
      type: 'fade-in-up',
      duration: '0.6s',
      delay: '0.2s'
    },
    {
      trigger: 'scroll',
      type: 'sticky-entrance',
      duration: '0.4s'
    }
  ]
};
