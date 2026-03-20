import type { SectionTemplate } from '../../../types';

export const PRODUCTS_CARD_GRID: SectionTemplate = {
  id: 'products-card-grid',
  category: 'products',
  variant: 'grid',
  name: 'Product Card Grid',
  description: 'Three-column grid of product cards with image, name, description, price, and add-to-cart button. Responsive to single column on mobile.',
  tones: ['luxury', 'elegant', 'modern', 'minimal'],
  html: `
    <section data-section-id="products-card-grid" class="products-card-grid">
      <div class="products-card-grid__container">
        <h2 class="products-card-grid__heading">{{SECTION_HEADING}}</h2>

        <div class="products-card-grid__grid">
          <article class="products-card-grid__card">
            <div class="products-card-grid__image-wrapper">
              <img
                src="{{PRODUCT_1_IMAGE}}"
                alt="{{PRODUCT_1_NAME}}"
                class="products-card-grid__image"
              />
            </div>
            <div class="products-card-grid__content">
              <h3 class="products-card-grid__product-name">{{PRODUCT_1_NAME}}</h3>
              <p class="products-card-grid__description">{{PRODUCT_1_DESCRIPTION}}</p>
              <div class="products-card-grid__footer">
                <span class="products-card-grid__price">{{PRODUCT_1_PRICE}}</span>
                <button class="products-card-grid__button">カートに追加</button>
              </div>
            </div>
          </article>

          <article class="products-card-grid__card">
            <div class="products-card-grid__image-wrapper">
              <img
                src="{{PRODUCT_2_IMAGE}}"
                alt="{{PRODUCT_2_NAME}}"
                class="products-card-grid__image"
              />
            </div>
            <div class="products-card-grid__content">
              <h3 class="products-card-grid__product-name">{{PRODUCT_2_NAME}}</h3>
              <p class="products-card-grid__description">{{PRODUCT_2_DESCRIPTION}}</p>
              <div class="products-card-grid__footer">
                <span class="products-card-grid__price">{{PRODUCT_2_PRICE}}</span>
                <button class="products-card-grid__button">カートに追加</button>
              </div>
            </div>
          </article>

          <article class="products-card-grid__card">
            <div class="products-card-grid__image-wrapper">
              <img
                src="{{PRODUCT_3_IMAGE}}"
                alt="{{PRODUCT_3_NAME}}"
                class="products-card-grid__image"
              />
            </div>
            <div class="products-card-grid__content">
              <h3 class="products-card-grid__product-name">{{PRODUCT_3_NAME}}</h3>
              <p class="products-card-grid__description">{{PRODUCT_3_DESCRIPTION}}</p>
              <div class="products-card-grid__footer">
                <span class="products-card-grid__price">{{PRODUCT_3_PRICE}}</span>
                <button class="products-card-grid__button">カートに追加</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  css: `
    .products-card-grid {
      background-color: var(--color-bg);
      color: var(--color-text);
      padding: 60px 20px;
    }

    .products-card-grid__container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .products-card-grid__heading {
      font-family: var(--font-heading);
      font-size: 28px;
      font-weight: 400;
      text-align: center;
      margin: 0 0 48px 0;
      letter-spacing: 0.8px;
      color: var(--color-text);
    }

    .products-card-grid__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
    }

    .products-card-grid__card {
      background: var(--color-bg);
      border: 1px solid var(--color-muted);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      cursor: pointer;
    }

    .products-card-grid__card:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
      border-color: var(--color-text);
    }

    .products-card-grid__image-wrapper {
      overflow: hidden;
      background: var(--color-muted);
      aspect-ratio: 1;
    }

    .products-card-grid__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .products-card-grid__card:hover .products-card-grid__image {
      transform: scale(1.06);
    }

    .products-card-grid__content {
      padding: 24px 20px;
    }

    .products-card-grid__product-name {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 8px 0;
      color: var(--color-text);
      letter-spacing: 0.4px;
    }

    .products-card-grid__description {
      font-family: var(--font-body);
      font-size: 13px;
      line-height: 1.6;
      color: var(--color-muted);
      margin: 0 0 16px 0;
      min-height: 40px;
    }

    .products-card-grid__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .products-card-grid__price {
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text);
      letter-spacing: 0.3px;
    }

    .products-card-grid__button {
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: var(--color-text);
      color: var(--color-bg);
      border: none;
      padding: 10px 20px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
    }

    .products-card-grid__button:hover {
      background: var(--color-accent);
      transform: translateY(-2px);
    }

    @media (min-width: 768px) {
      .products-card-grid {
        padding: 80px 40px;
      }

      .products-card-grid__heading {
        font-size: 32px;
        margin-bottom: 56px;
      }

      .products-card-grid__grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 40px;
      }

      .products-card-grid__content {
        padding: 28px 24px;
      }
    }

    @media (min-width: 1024px) {
      .products-card-grid {
        padding: 100px 60px;
      }

      .products-card-grid__heading {
        font-size: 36px;
        margin-bottom: 64px;
      }

      .products-card-grid__grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 48px;
      }

      .products-card-grid__content {
        padding: 32px 28px;
      }

      .products-card-grid__description {
        font-size: 14px;
      }
    }
  `,
  placeholders: [
    {
      key: 'SECTION_HEADING',
      type: 'text',
      description: 'Main section heading',
      defaultValue: 'Our Collection'
    },
    {
      key: 'PRODUCT_1_IMAGE',
      type: 'image',
      description: 'Image for product 1',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_1_NAME',
      type: 'text',
      description: 'Name of product 1',
      defaultValue: 'Essential Cream'
    },
    {
      key: 'PRODUCT_1_DESCRIPTION',
      type: 'text',
      description: 'Short description of product 1',
      defaultValue: 'Luxurious moisturizing formula'
    },
    {
      key: 'PRODUCT_1_PRICE',
      type: 'text',
      description: 'Price of product 1',
      defaultValue: '¥8,800'
    },
    {
      key: 'PRODUCT_2_IMAGE',
      type: 'image',
      description: 'Image for product 2',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_2_NAME',
      type: 'text',
      description: 'Name of product 2',
      defaultValue: 'Cleansing Gel'
    },
    {
      key: 'PRODUCT_2_DESCRIPTION',
      type: 'text',
      description: 'Short description of product 2',
      defaultValue: 'Gentle purifying treatment'
    },
    {
      key: 'PRODUCT_2_PRICE',
      type: 'text',
      description: 'Price of product 2',
      defaultValue: '¥6,600'
    },
    {
      key: 'PRODUCT_3_IMAGE',
      type: 'image',
      description: 'Image for product 3',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_3_NAME',
      type: 'text',
      description: 'Name of product 3',
      defaultValue: 'Serum Essence'
    },
    {
      key: 'PRODUCT_3_DESCRIPTION',
      type: 'text',
      description: 'Short description of product 3',
      defaultValue: 'Concentrated active treatment'
    },
    {
      key: 'PRODUCT_3_PRICE',
      type: 'text',
      description: 'Price of product 3',
      defaultValue: '¥7,700'
    }
  ],
  animations: [
    {
      trigger: 'scroll',
      type: 'fade-in-up',
      duration: '0.8s',
      delay: '0.1s'
    },
    {
      trigger: 'hover',
      type: 'scale-image',
      duration: '0.5s'
    }
  ]
};
