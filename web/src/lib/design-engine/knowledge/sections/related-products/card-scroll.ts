import type { SectionTemplate } from '../../../types';

export const RELATED_PRODUCTS_CARD_SCROLL: SectionTemplate = {
  id: 'related-products-card-scroll',
  category: 'related-products',
  variant: 'carousel',
  name: 'Related Products Horizontal Scroll',
  description: 'Horizontal scrolling carousel of related products with CSS scroll-snap. Each card displays image, title, and price. Modern, minimal aesthetic.',
  tones: ['minimal', 'modern', 'elegant'],
  html: `
    <section data-section-id="related-products-card-scroll" class="related-products-card-scroll">
      <div class="related-products-card-scroll__wrapper">

        <div class="related-products-card-scroll__header">
          <h2 class="related-products-card-scroll__heading">You May Also Like</h2>
          <a href="#" class="related-products-card-scroll__view-all">View All →</a>
        </div>

        <div class="related-products-card-scroll__carousel">
          <div class="related-products-card-scroll__scroll-container">

            <!-- Product Card 1 -->
            <article class="related-products-card-scroll__card">
              <div class="related-products-card-scroll__image-wrapper">
                <img
                  src="{{RELATED_PRODUCT_1_IMAGE}}"
                  alt="{{RELATED_PRODUCT_1_NAME}}"
                  class="related-products-card-scroll__image"
                  loading="lazy"
                />
                <div class="related-products-card-scroll__overlay">
                  <button class="related-products-card-scroll__quick-view">Quick View</button>
                </div>
              </div>
              <div class="related-products-card-scroll__content">
                <h3 class="related-products-card-scroll__product-name">{{RELATED_PRODUCT_1_NAME}}</h3>
                <p class="related-products-card-scroll__product-price">{{RELATED_PRODUCT_1_PRICE}}</p>
                <div class="related-products-card-scroll__rating">
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__rating-count">({{RELATED_PRODUCT_1_REVIEWS}})</span>
                </div>
              </div>
            </article>

            <!-- Product Card 2 -->
            <article class="related-products-card-scroll__card">
              <div class="related-products-card-scroll__image-wrapper">
                <img
                  src="{{RELATED_PRODUCT_2_IMAGE}}"
                  alt="{{RELATED_PRODUCT_2_NAME}}"
                  class="related-products-card-scroll__image"
                  loading="lazy"
                />
                <div class="related-products-card-scroll__overlay">
                  <button class="related-products-card-scroll__quick-view">Quick View</button>
                </div>
              </div>
              <div class="related-products-card-scroll__content">
                <h3 class="related-products-card-scroll__product-name">{{RELATED_PRODUCT_2_NAME}}</h3>
                <p class="related-products-card-scroll__product-price">{{RELATED_PRODUCT_2_PRICE}}</p>
                <div class="related-products-card-scroll__rating">
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star product-reviews-star-rating__star--half">★</span>
                  <span class="related-products-card-scroll__rating-count">({{RELATED_PRODUCT_2_REVIEWS}})</span>
                </div>
              </div>
            </article>

            <!-- Product Card 3 -->
            <article class="related-products-card-scroll__card">
              <div class="related-products-card-scroll__image-wrapper">
                <img
                  src="{{RELATED_PRODUCT_3_IMAGE}}"
                  alt="{{RELATED_PRODUCT_3_NAME}}"
                  class="related-products-card-scroll__image"
                  loading="lazy"
                />
                <div class="related-products-card-scroll__overlay">
                  <button class="related-products-card-scroll__quick-view">Quick View</button>
                </div>
              </div>
              <div class="related-products-card-scroll__content">
                <h3 class="related-products-card-scroll__product-name">{{RELATED_PRODUCT_3_NAME}}</h3>
                <p class="related-products-card-scroll__product-price">{{RELATED_PRODUCT_3_PRICE}}</p>
                <div class="related-products-card-scroll__rating">
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__rating-count">({{RELATED_PRODUCT_3_REVIEWS}})</span>
                </div>
              </div>
            </article>

            <!-- Product Card 4 -->
            <article class="related-products-card-scroll__card">
              <div class="related-products-card-scroll__image-wrapper">
                <img
                  src="{{RELATED_PRODUCT_4_IMAGE}}"
                  alt="{{RELATED_PRODUCT_4_NAME}}"
                  class="related-products-card-scroll__image"
                  loading="lazy"
                />
                <div class="related-products-card-scroll__overlay">
                  <button class="related-products-card-scroll__quick-view">Quick View</button>
                </div>
              </div>
              <div class="related-products-card-scroll__content">
                <h3 class="related-products-card-scroll__product-name">{{RELATED_PRODUCT_4_NAME}}</h3>
                <p class="related-products-card-scroll__product-price">{{RELATED_PRODUCT_4_PRICE}}</p>
                <div class="related-products-card-scroll__rating">
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__star">★</span>
                  <span class="related-products-card-scroll__rating-count">({{RELATED_PRODUCT_4_REVIEWS}})</span>
                </div>
              </div>
            </article>

          </div>
        </div>

        <!-- Scroll Indicator -->
        <p class="related-products-card-scroll__scroll-hint">← Scroll →</p>

      </div>
    </section>
  `,
  css: `
    .related-products-card-scroll {
      background-color: var(--color-bg);
      color: var(--color-text);
      padding: 60px 20px;
    }

    .related-products-card-scroll__wrapper {
      max-width: 1400px;
      margin: 0 auto;
    }

    .related-products-card-scroll__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--color-muted);
    }

    .related-products-card-scroll__heading {
      font-family: var(--font-heading);
      font-size: 24px;
      font-weight: 400;
      margin: 0;
      letter-spacing: 0.6px;
      color: var(--color-text);
    }

    .related-products-card-scroll__view-all {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-text);
      text-decoration: none;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      position: relative;
    }

    .related-products-card-scroll__view-all:hover {
      padding-right: 8px;
    }

    .related-products-card-scroll__carousel {
      position: relative;
      overflow: hidden;
    }

    .related-products-card-scroll__scroll-container {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(280px, 1fr);
      gap: 24px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      padding: 0;
      /* Hide scrollbar */
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .related-products-card-scroll__scroll-container::-webkit-scrollbar {
      display: none;
    }

    .related-products-card-scroll__card {
      scroll-snap-align: start;
      scroll-snap-stop: always;
      display: flex;
      flex-direction: column;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .related-products-card-scroll__card:hover {
      transform: translateY(-4px);
    }

    .related-products-card-scroll__image-wrapper {
      position: relative;
      overflow: hidden;
      background: var(--color-muted);
      aspect-ratio: 1;
      margin-bottom: 16px;
    }

    .related-products-card-scroll__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .related-products-card-scroll__card:hover .related-products-card-scroll__image {
      transform: scale(1.08);
    }

    .related-products-card-scroll__overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.4s ease;
    }

    .related-products-card-scroll__card:hover .related-products-card-scroll__overlay {
      background: rgba(0, 0, 0, 0.3);
    }

    .related-products-card-scroll__quick-view {
      font-family: var(--font-heading);
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      background: #ffffff;
      color: var(--color-text);
      border: none;
      padding: 10px 24px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.4s ease, transform 0.4s ease;
      transform: translateY(12px);
    }

    .related-products-card-scroll__card:hover .related-products-card-scroll__quick-view {
      opacity: 1;
      transform: translateY(0);
    }

    .related-products-card-scroll__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .related-products-card-scroll__product-name {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 500;
      margin: 0;
      color: var(--color-text);
      letter-spacing: 0.3px;
      line-height: 1.4;
    }

    .related-products-card-scroll__product-price {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 500;
      margin: 0;
      color: var(--color-text);
      letter-spacing: 0.3px;
    }

    .related-products-card-scroll__rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    .related-products-card-scroll__star {
      color: var(--color-accent);
      line-height: 1;
    }

    .related-products-card-scroll__rating-count {
      font-family: var(--font-body);
      font-size: 11px;
      color: var(--color-muted);
      margin-left: 4px;
      letter-spacing: 0.2px;
    }

    .related-products-card-scroll__scroll-hint {
      text-align: center;
      font-family: var(--font-body);
      font-size: 12px;
      color: var(--color-muted);
      margin: 24px 0 0 0;
      letter-spacing: 0.5px;
      animation: pulse-scroll 2s ease-in-out infinite;
    }

    @keyframes pulse-scroll {
      0%, 100% {
        opacity: 0.6;
      }
      50% {
        opacity: 1;
      }
    }

    @media (min-width: 768px) {
      .related-products-card-scroll {
        padding: 80px 40px;
      }

      .related-products-card-scroll__heading {
        font-size: 28px;
      }

      .related-products-card-scroll__header {
        margin-bottom: 48px;
      }

      .related-products-card-scroll__scroll-container {
        grid-auto-columns: minmax(320px, 1fr);
        gap: 32px;
      }

      .related-products-card-scroll__card {
        max-width: 100%;
      }

      .related-products-card-scroll__product-name {
        font-size: 15px;
      }

      .related-products-card-scroll__product-price {
        font-size: 17px;
      }
    }

    @media (min-width: 1024px) {
      .related-products-card-scroll {
        padding: 100px 60px;
      }

      .related-products-card-scroll__heading {
        font-size: 32px;
      }

      .related-products-card-scroll__scroll-container {
        grid-auto-columns: minmax(360px, 1fr);
        gap: 40px;
      }

      .related-products-card-scroll__product-name {
        font-size: 16px;
      }

      .related-products-card-scroll__product-price {
        font-size: 18px;
      }

      .related-products-card-scroll__scroll-hint {
        display: none;
      }
    }
  `,
  placeholders: [
    {
      key: 'RELATED_PRODUCT_1_IMAGE',
      type: 'image',
      description: 'Related product 1 image',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop'
    },
    {
      key: 'RELATED_PRODUCT_1_NAME',
      type: 'text',
      description: 'Related product 1 name',
      defaultValue: 'Facial Serum'
    },
    {
      key: 'RELATED_PRODUCT_1_PRICE',
      type: 'text',
      description: 'Related product 1 price',
      defaultValue: '¥7,700'
    },
    {
      key: 'RELATED_PRODUCT_1_REVIEWS',
      type: 'text',
      description: 'Related product 1 review count',
      defaultValue: '89'
    },
    {
      key: 'RELATED_PRODUCT_2_IMAGE',
      type: 'image',
      description: 'Related product 2 image',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop'
    },
    {
      key: 'RELATED_PRODUCT_2_NAME',
      type: 'text',
      description: 'Related product 2 name',
      defaultValue: 'Moisturizing Lotion'
    },
    {
      key: 'RELATED_PRODUCT_2_PRICE',
      type: 'text',
      description: 'Related product 2 price',
      defaultValue: '¥6,600'
    },
    {
      key: 'RELATED_PRODUCT_2_REVIEWS',
      type: 'text',
      description: 'Related product 2 review count',
      defaultValue: '156'
    },
    {
      key: 'RELATED_PRODUCT_3_IMAGE',
      type: 'image',
      description: 'Related product 3 image',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop'
    },
    {
      key: 'RELATED_PRODUCT_3_NAME',
      type: 'text',
      description: 'Related product 3 name',
      defaultValue: 'Eye Cream Deluxe'
    },
    {
      key: 'RELATED_PRODUCT_3_PRICE',
      type: 'text',
      description: 'Related product 3 price',
      defaultValue: '¥9,900'
    },
    {
      key: 'RELATED_PRODUCT_3_REVIEWS',
      type: 'text',
      description: 'Related product 3 review count',
      defaultValue: '124'
    },
    {
      key: 'RELATED_PRODUCT_4_IMAGE',
      type: 'image',
      description: 'Related product 4 image',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop'
    },
    {
      key: 'RELATED_PRODUCT_4_NAME',
      type: 'text',
      description: 'Related product 4 name',
      defaultValue: 'Body Butter'
    },
    {
      key: 'RELATED_PRODUCT_4_PRICE',
      type: 'text',
      description: 'Related product 4 price',
      defaultValue: '¥5,500'
    },
    {
      key: 'RELATED_PRODUCT_4_REVIEWS',
      type: 'text',
      description: 'Related product 4 review count',
      defaultValue: '213'
    }
  ],
  animations: [
    {
      trigger: 'scroll',
      type: 'fade-in',
      duration: '0.6s',
      delay: '0.2s'
    },
    {
      trigger: 'hover',
      type: 'lift-up',
      duration: '0.4s'
    }
  ]
};
