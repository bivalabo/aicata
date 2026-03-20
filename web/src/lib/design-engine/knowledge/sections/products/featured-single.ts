import type { SectionTemplate } from '../../../types';

export const PRODUCTS_FEATURED_SINGLE: SectionTemplate = {
  id: 'products-featured-single',
  category: 'products',
  variant: 'split',
  name: 'Featured Single Product',
  description: 'Elegant split-layout showcase featuring a large product image (60%) alongside detailed product information (40%) with ingredients list and call-to-action button.',
  tones: ['luxury', 'elegant', 'natural'],
  html: `
    <section data-section-id="products-featured-single" class="products-featured-single">
      <div class="products-featured-single__container">
        <div class="products-featured-single__layout">
          <div class="products-featured-single__image-section">
            <div class="products-featured-single__image-wrapper">
              <img
                src="{{PRODUCT_IMAGE}}"
                alt="{{PRODUCT_NAME}}"
                class="products-featured-single__image"
              />
            </div>
          </div>

          <div class="products-featured-single__info-section">
            <div class="products-featured-single__content">
              <h2 class="products-featured-single__heading">{{PRODUCT_NAME}}</h2>

              <p class="products-featured-single__subtitle">{{PRODUCT_SUBTITLE}}</p>

              <p class="products-featured-single__description">
                {{PRODUCT_DESCRIPTION}}
              </p>

              <div class="products-featured-single__features">
                <h3 class="products-featured-single__features-heading">主要成分</h3>
                <ul class="products-featured-single__features-list">
                  <li class="products-featured-single__feature-item">{{INGREDIENT_1}}</li>
                  <li class="products-featured-single__feature-item">{{INGREDIENT_2}}</li>
                  <li class="products-featured-single__feature-item">{{INGREDIENT_3}}</li>
                  <li class="products-featured-single__feature-item">{{INGREDIENT_4}}</li>
                </ul>
              </div>

              <div class="products-featured-single__spec">
                <div class="products-featured-single__spec-item">
                  <span class="products-featured-single__spec-label">容量</span>
                  <span class="products-featured-single__spec-value">{{CAPACITY}}</span>
                </div>
                <div class="products-featured-single__spec-item">
                  <span class="products-featured-single__spec-label">価格</span>
                  <span class="products-featured-single__spec-value">{{PRICE}}</span>
                </div>
              </div>

              <button class="products-featured-single__cta">
                {{CTA_TEXT}}
              </button>

              <a href="{{MORE_INFO_URL}}" class="products-featured-single__link">
                詳細を見る
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  css: `
    .products-featured-single {
      background-color: var(--color-bg);
      color: var(--color-text);
      padding: 60px 20px;
    }

    .products-featured-single__container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .products-featured-single__layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
      align-items: center;
    }

    .products-featured-single__image-section {
      order: 1;
    }

    .products-featured-single__info-section {
      order: 2;
    }

    .products-featured-single__image-wrapper {
      overflow: hidden;
      background: var(--color-muted);
      aspect-ratio: 1;
    }

    .products-featured-single__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .products-featured-single__image-wrapper:hover .products-featured-single__image {
      transform: scale(1.04);
    }

    .products-featured-single__content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .products-featured-single__heading {
      font-family: var(--font-heading);
      font-size: 32px;
      font-weight: 400;
      margin: 0;
      letter-spacing: 0.8px;
      line-height: 1.3;
      color: var(--color-text);
    }

    .products-featured-single__subtitle {
      font-family: var(--font-accent);
      font-size: 14px;
      font-weight: 400;
      margin: 0;
      color: var(--color-muted);
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .products-featured-single__description {
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.8;
      color: var(--color-text);
      margin: 0;
    }

    .products-featured-single__features {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 28px 0;
      border-top: 1px solid var(--color-muted);
      border-bottom: 1px solid var(--color-muted);
    }

    .products-featured-single__features-heading {
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 500;
      margin: 0;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: var(--color-text);
    }

    .products-featured-single__features-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .products-featured-single__feature-item {
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.6;
      color: var(--color-text);
      padding-left: 20px;
      position: relative;
    }

    .products-featured-single__feature-item::before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--color-accent);
      font-weight: bold;
    }

    .products-featured-single__spec {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .products-featured-single__spec-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .products-featured-single__spec-label {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 400;
      color: var(--color-muted);
      letter-spacing: 0.3px;
    }

    .products-featured-single__spec-value {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 500;
      color: var(--color-text);
      letter-spacing: 0.4px;
    }

    .products-featured-single__cta {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      background: var(--color-text);
      color: var(--color-bg);
      border: none;
      padding: 14px 40px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      align-self: flex-start;
      margin-top: 8px;
    }

    .products-featured-single__cta:hover {
      background: var(--color-accent);
      transform: translateY(-2px);
    }

    .products-featured-single__link {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 400;
      color: var(--color-text);
      text-decoration: none;
      letter-spacing: 0.6px;
      border-bottom: 1px solid var(--color-text);
      padding-bottom: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-block;
    }

    .products-featured-single__link:hover {
      color: var(--color-accent);
      border-bottom-color: var(--color-accent);
    }

    @media (min-width: 768px) {
      .products-featured-single {
        padding: 80px 40px;
      }

      .products-featured-single__layout {
        grid-template-columns: 1fr 1fr;
        gap: 60px;
      }

      .products-featured-single__heading {
        font-size: 40px;
      }
    }

    @media (min-width: 1024px) {
      .products-featured-single {
        padding: 120px 60px;
      }

      .products-featured-single__layout {
        grid-template-columns: 1.5fr 1fr;
        gap: 80px;
      }

      .products-featured-single__image-section {
        order: 1;
      }

      .products-featured-single__info-section {
        order: 2;
      }

      .products-featured-single__heading {
        font-size: 44px;
        line-height: 1.2;
      }

      .products-featured-single__description {
        font-size: 16px;
      }

      .products-featured-single__cta {
        padding: 16px 48px;
        font-size: 14px;
      }
    }
  `,
  placeholders: [
    {
      key: 'PRODUCT_NAME',
      type: 'text',
      description: 'Product name heading',
      defaultValue: 'Signature Moisturizer'
    },
    {
      key: 'PRODUCT_SUBTITLE',
      type: 'text',
      description: 'Subtle subtitle or product category',
      defaultValue: 'Premium Skincare'
    },
    {
      key: 'PRODUCT_IMAGE',
      type: 'image',
      description: 'Large product image',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=800&fit=crop'
    },
    {
      key: 'PRODUCT_DESCRIPTION',
      type: 'text',
      description: 'Detailed product description',
      defaultValue: 'Crafted with a blend of natural botanicals and advanced skincare science, this signature moisturizer delivers profound hydration while maintaining the skin\'s natural balance. Each application awakens the senses with subtle, sophisticated notes.'
    },
    {
      key: 'INGREDIENT_1',
      type: 'text',
      description: 'First ingredient',
      defaultValue: 'Japanese Rose Hip Oil'
    },
    {
      key: 'INGREDIENT_2',
      type: 'text',
      description: 'Second ingredient',
      defaultValue: 'Hyaluronic Acid Complex'
    },
    {
      key: 'INGREDIENT_3',
      type: 'text',
      description: 'Third ingredient',
      defaultValue: 'Green Tea Extract'
    },
    {
      key: 'INGREDIENT_4',
      type: 'text',
      description: 'Fourth ingredient',
      defaultValue: 'Vitamin E Acetate'
    },
    {
      key: 'CAPACITY',
      type: 'text',
      description: 'Product capacity/size',
      defaultValue: '50ml'
    },
    {
      key: 'PRICE',
      type: 'text',
      description: 'Product price',
      defaultValue: '¥12,800'
    },
    {
      key: 'CTA_TEXT',
      type: 'text',
      description: 'Call-to-action button text',
      defaultValue: 'カートに追加'
    },
    {
      key: 'MORE_INFO_URL',
      type: 'url',
      description: 'Link to detailed product page',
      defaultValue: '#'
    }
  ],
  animations: [
    {
      trigger: 'scroll',
      type: 'fade-in-up',
      duration: '0.8s',
      delay: '0.2s'
    },
    {
      trigger: 'scroll',
      type: 'parallax',
      duration: '1s'
    },
    {
      trigger: 'hover',
      type: 'scale-image',
      duration: '0.6s'
    }
  ]
};
