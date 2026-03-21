import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

export const COLLECTION_GRID_FILTERABLE: SectionTemplate = {
  id: 'collection-grid-filterable',
  name: 'Filterable Product Grid',
  category: 'collection-grid' as SectionCategory,
  variant: 'grid' as SectionVariant,
  description: 'Product grid with top filter bar including sort dropdown and active filter tags. 3-4 column responsive grid with product cards featuring image, title, price, and quick-view hover overlay.',
  tones: ['minimal', 'modern', 'elegant'] as DesignTone[],

  placeholders: [
    {
      key: 'PRODUCT_IMAGE_1',
      description: 'Product 1 image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_TITLE_1',
      description: 'Product 1 title',
      type: 'text',
      defaultValue: 'Classic White Sneaker'
    },
    {
      key: 'PRODUCT_PRICE_1',
      description: 'Product 1 price',
      type: 'text',
      defaultValue: '$89.00'
    },
    {
      key: 'PRODUCT_URL_1',
      description: 'Product 1 URL',
      type: 'url',
      defaultValue: '/products/classic-white-sneaker'
    },
    {
      key: 'PRODUCT_IMAGE_2',
      description: 'Product 2 image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_TITLE_2',
      description: 'Product 2 title',
      type: 'text',
      defaultValue: 'Minimalist Watch'
    },
    {
      key: 'PRODUCT_PRICE_2',
      description: 'Product 2 price',
      type: 'text',
      defaultValue: '$145.00'
    },
    {
      key: 'PRODUCT_URL_2',
      description: 'Product 2 URL',
      type: 'url',
      defaultValue: '/products/minimalist-watch'
    },
    {
      key: 'PRODUCT_IMAGE_3',
      description: 'Product 3 image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_TITLE_3',
      description: 'Product 3 title',
      type: 'text',
      defaultValue: 'Leather Crossbody Bag'
    },
    {
      key: 'PRODUCT_PRICE_3',
      description: 'Product 3 price',
      type: 'text',
      defaultValue: '$199.00'
    },
    {
      key: 'PRODUCT_URL_3',
      description: 'Product 3 URL',
      type: 'url',
      defaultValue: '/products/leather-crossbody-bag'
    },
    {
      key: 'PRODUCT_IMAGE_4',
      description: 'Product 4 image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_TITLE_4',
      description: 'Product 4 title',
      type: 'text',
      defaultValue: 'Designer Sunglasses'
    },
    {
      key: 'PRODUCT_PRICE_4',
      description: 'Product 4 price',
      type: 'text',
      defaultValue: '$225.00'
    },
    {
      key: 'PRODUCT_URL_4',
      description: 'Product 4 URL',
      type: 'url',
      defaultValue: '/products/designer-sunglasses'
    },
    {
      key: 'PRODUCT_IMAGE_5',
      description: 'Product 5 image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1595427773223-ef52624120d2?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_TITLE_5',
      description: 'Product 5 title',
      type: 'text',
      defaultValue: 'Cotton Crew Neck Tee'
    },
    {
      key: 'PRODUCT_PRICE_5',
      description: 'Product 5 price',
      type: 'text',
      defaultValue: '$45.00'
    },
    {
      key: 'PRODUCT_URL_5',
      description: 'Product 5 URL',
      type: 'url',
      defaultValue: '/products/cotton-crew-neck-tee'
    },
    {
      key: 'PRODUCT_IMAGE_6',
      description: 'Product 6 image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1539533057440-7274bba4eba5?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_TITLE_6',
      description: 'Product 6 title',
      type: 'text',
      defaultValue: 'Premium Headphones'
    },
    {
      key: 'PRODUCT_PRICE_6',
      description: 'Product 6 price',
      type: 'text',
      defaultValue: '$299.00'
    },
    {
      key: 'PRODUCT_URL_6',
      description: 'Product 6 URL',
      type: 'url',
      defaultValue: '/products/premium-headphones'
    },
    {
      key: 'PRODUCT_IMAGE_7',
      description: 'Product 7 image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_TITLE_7',
      description: 'Product 7 title',
      type: 'text',
      defaultValue: 'Wool Blend Cardigan'
    },
    {
      key: 'PRODUCT_PRICE_7',
      description: 'Product 7 price',
      type: 'text',
      defaultValue: '$125.00'
    },
    {
      key: 'PRODUCT_URL_7',
      description: 'Product 7 URL',
      type: 'url',
      defaultValue: '/products/wool-blend-cardigan'
    },
    {
      key: 'PRODUCT_IMAGE_8',
      description: 'Product 8 image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop'
    },
    {
      key: 'PRODUCT_TITLE_8',
      description: 'Product 8 title',
      type: 'text',
      defaultValue: 'Leather Loafers'
    },
    {
      key: 'PRODUCT_PRICE_8',
      description: 'Product 8 price',
      type: 'text',
      defaultValue: '$165.00'
    },
    {
      key: 'PRODUCT_URL_8',
      description: 'Product 8 URL',
      type: 'url',
      defaultValue: '/products/leather-loafers'
    }
  ] as PlaceholderDef[],

  html: `
    <section
      data-section-id="collection-grid-filterable"
      class="collection-grid-filterable"
      style="
        --color-bg: #ffffff;
        --color-text: #1a1a1a;
        --color-accent: #000000;
        --color-border: #e5e5e5;
        --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --spacing-unit: 1rem;
      "
    >
      <div class="collection-grid-filterable__wrapper">
        <!-- Filter Bar -->
        <div class="collection-grid-filterable__filter-bar">
          <div class="collection-grid-filterable__sort">
            <select class="collection-grid-filterable__sort-select">
              <option>Sort by: Featured</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Best Selling</option>
            </select>
          </div>

          <div class="collection-grid-filterable__active-filters">
            <span class="collection-grid-filterable__filter-tag">
              Category: All
              <button class="collection-grid-filterable__filter-remove">×</button>
            </span>
            <span class="collection-grid-filterable__filter-tag">
              Size: All
              <button class="collection-grid-filterable__filter-remove">×</button>
            </span>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="collection-grid-filterable__grid">
          <!-- Product Card 1 -->
          <a href="{{PRODUCT_URL_1}}" class="collection-grid-filterable__card">
            <div class="collection-grid-filterable__card-image-wrapper">
              <img
                src="{{PRODUCT_IMAGE_1}}"
                alt="{{PRODUCT_TITLE_1}}"
                class="collection-grid-filterable__card-image"
                loading="lazy"
              />
              <div class="collection-grid-filterable__card-overlay">
                <button class="collection-grid-filterable__quick-view">
                  Quick View
                </button>
              </div>
            </div>
            <div class="collection-grid-filterable__card-content">
              <h3 class="collection-grid-filterable__card-title">
                {{PRODUCT_TITLE_1}}
              </h3>
              <p class="collection-grid-filterable__card-price">
                {{PRODUCT_PRICE_1}}
              </p>
            </div>
          </a>

          <!-- Product Card 2 -->
          <a href="{{PRODUCT_URL_2}}" class="collection-grid-filterable__card">
            <div class="collection-grid-filterable__card-image-wrapper">
              <img
                src="{{PRODUCT_IMAGE_2}}"
                alt="{{PRODUCT_TITLE_2}}"
                class="collection-grid-filterable__card-image"
                loading="lazy"
              />
              <div class="collection-grid-filterable__card-overlay">
                <button class="collection-grid-filterable__quick-view">
                  Quick View
                </button>
              </div>
            </div>
            <div class="collection-grid-filterable__card-content">
              <h3 class="collection-grid-filterable__card-title">
                {{PRODUCT_TITLE_2}}
              </h3>
              <p class="collection-grid-filterable__card-price">
                {{PRODUCT_PRICE_2}}
              </p>
            </div>
          </a>

          <!-- Product Card 3 -->
          <a href="{{PRODUCT_URL_3}}" class="collection-grid-filterable__card">
            <div class="collection-grid-filterable__card-image-wrapper">
              <img
                src="{{PRODUCT_IMAGE_3}}"
                alt="{{PRODUCT_TITLE_3}}"
                class="collection-grid-filterable__card-image"
                loading="lazy"
              />
              <div class="collection-grid-filterable__card-overlay">
                <button class="collection-grid-filterable__quick-view">
                  Quick View
                </button>
              </div>
            </div>
            <div class="collection-grid-filterable__card-content">
              <h3 class="collection-grid-filterable__card-title">
                {{PRODUCT_TITLE_3}}
              </h3>
              <p class="collection-grid-filterable__card-price">
                {{PRODUCT_PRICE_3}}
              </p>
            </div>
          </a>

          <!-- Product Card 4 -->
          <a href="{{PRODUCT_URL_4}}" class="collection-grid-filterable__card">
            <div class="collection-grid-filterable__card-image-wrapper">
              <img
                src="{{PRODUCT_IMAGE_4}}"
                alt="{{PRODUCT_TITLE_4}}"
                class="collection-grid-filterable__card-image"
                loading="lazy"
              />
              <div class="collection-grid-filterable__card-overlay">
                <button class="collection-grid-filterable__quick-view">
                  Quick View
                </button>
              </div>
            </div>
            <div class="collection-grid-filterable__card-content">
              <h3 class="collection-grid-filterable__card-title">
                {{PRODUCT_TITLE_4}}
              </h3>
              <p class="collection-grid-filterable__card-price">
                {{PRODUCT_PRICE_4}}
              </p>
            </div>
          </a>

          <!-- Product Card 5 -->
          <a href="{{PRODUCT_URL_5}}" class="collection-grid-filterable__card">
            <div class="collection-grid-filterable__card-image-wrapper">
              <img
                src="{{PRODUCT_IMAGE_5}}"
                alt="{{PRODUCT_TITLE_5}}"
                class="collection-grid-filterable__card-image"
                loading="lazy"
              />
              <div class="collection-grid-filterable__card-overlay">
                <button class="collection-grid-filterable__quick-view">
                  Quick View
                </button>
              </div>
            </div>
            <div class="collection-grid-filterable__card-content">
              <h3 class="collection-grid-filterable__card-title">
                {{PRODUCT_TITLE_5}}
              </h3>
              <p class="collection-grid-filterable__card-price">
                {{PRODUCT_PRICE_5}}
              </p>
            </div>
          </a>

          <!-- Product Card 6 -->
          <a href="{{PRODUCT_URL_6}}" class="collection-grid-filterable__card">
            <div class="collection-grid-filterable__card-image-wrapper">
              <img
                src="{{PRODUCT_IMAGE_6}}"
                alt="{{PRODUCT_TITLE_6}}"
                class="collection-grid-filterable__card-image"
                loading="lazy"
              />
              <div class="collection-grid-filterable__card-overlay">
                <button class="collection-grid-filterable__quick-view">
                  Quick View
                </button>
              </div>
            </div>
            <div class="collection-grid-filterable__card-content">
              <h3 class="collection-grid-filterable__card-title">
                {{PRODUCT_TITLE_6}}
              </h3>
              <p class="collection-grid-filterable__card-price">
                {{PRODUCT_PRICE_6}}
              </p>
            </div>
          </a>

          <!-- Product Card 7 -->
          <a href="{{PRODUCT_URL_7}}" class="collection-grid-filterable__card">
            <div class="collection-grid-filterable__card-image-wrapper">
              <img
                src="{{PRODUCT_IMAGE_7}}"
                alt="{{PRODUCT_TITLE_7}}"
                class="collection-grid-filterable__card-image"
                loading="lazy"
              />
              <div class="collection-grid-filterable__card-overlay">
                <button class="collection-grid-filterable__quick-view">
                  Quick View
                </button>
              </div>
            </div>
            <div class="collection-grid-filterable__card-content">
              <h3 class="collection-grid-filterable__card-title">
                {{PRODUCT_TITLE_7}}
              </h3>
              <p class="collection-grid-filterable__card-price">
                {{PRODUCT_PRICE_7}}
              </p>
            </div>
          </a>

          <!-- Product Card 8 -->
          <a href="{{PRODUCT_URL_8}}" class="collection-grid-filterable__card">
            <div class="collection-grid-filterable__card-image-wrapper">
              <img
                src="{{PRODUCT_IMAGE_8}}"
                alt="{{PRODUCT_TITLE_8}}"
                class="collection-grid-filterable__card-image"
                loading="lazy"
              />
              <div class="collection-grid-filterable__card-overlay">
                <button class="collection-grid-filterable__quick-view">
                  Quick View
                </button>
              </div>
            </div>
            <div class="collection-grid-filterable__card-content">
              <h3 class="collection-grid-filterable__card-title">
                {{PRODUCT_TITLE_8}}
              </h3>
              <p class="collection-grid-filterable__card-price">
                {{PRODUCT_PRICE_8}}
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  `,

  css: `
    .collection-grid-filterable {
      --grid-cols-mobile: 2;
      --grid-cols-tablet: 3;
      --grid-cols-desktop: 4;
      --gap: 1.5rem;
      --padding: clamp(1.5rem, 5vw, 3rem);
      --card-border-radius: 6px;
      --filter-bg: #f9f9f9;
    }

    .collection-grid-filterable__wrapper {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--padding);
      background-color: var(--color-bg);
    }

    /* Filter Bar */
    .collection-grid-filterable__filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--color-border);
      flex-wrap: wrap;
    }

    .collection-grid-filterable__sort {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .collection-grid-filterable__sort-select {
      font-family: var(--font-body);
      font-size: 0.95rem;
      padding: 0.65rem 2rem 0.65rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background-color: white;
      color: var(--color-text);
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23000' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.5rem center;
      padding-right: 2rem;
      transition: all 0.2s ease;
    }

    .collection-grid-filterable__sort-select:hover {
      border-color: var(--color-accent);
    }

    .collection-grid-filterable__active-filters {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .collection-grid-filterable__filter-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background-color: var(--filter-bg);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 0.9rem;
      color: var(--color-text);
    }

    .collection-grid-filterable__filter-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      padding: 0;
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      transition: color 0.2s ease;
    }

    .collection-grid-filterable__filter-remove:hover {
      color: var(--color-accent);
    }

    /* Product Grid */
    .collection-grid-filterable__grid {
      display: grid;
      grid-template-columns: repeat(var(--grid-cols-mobile), 1fr);
      gap: var(--gap);
    }

    @media (min-width: 768px) {
      .collection-grid-filterable__grid {
        grid-template-columns: repeat(var(--grid-cols-tablet), 1fr);
      }
    }

    @media (min-width: 1024px) {
      .collection-grid-filterable__grid {
        grid-template-columns: repeat(var(--grid-cols-desktop), 1fr);
      }
    }

    /* Product Card */
    .collection-grid-filterable__card {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      transition: transform 0.3s ease;
    }

    .collection-grid-filterable__card:hover {
      transform: translateY(-4px);
    }

    .collection-grid-filterable__card-image-wrapper {
      position: relative;
      overflow: hidden;
      aspect-ratio: 1;
      border-radius: var(--card-border-radius);
      background-color: #f5f5f5;
      margin-bottom: 1rem;
    }

    .collection-grid-filterable__card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .collection-grid-filterable__card:hover .collection-grid-filterable__card-image {
      transform: scale(1.05);
    }

    .collection-grid-filterable__card-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .collection-grid-filterable__card:hover .collection-grid-filterable__card-overlay {
      opacity: 1;
    }

    .collection-grid-filterable__quick-view {
      padding: 0.75rem 1.5rem;
      background-color: var(--color-bg);
      color: var(--color-text);
      border: 1px solid var(--color-accent);
      border-radius: 4px;
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .collection-grid-filterable__quick-view:hover {
      background-color: var(--color-accent);
      color: var(--color-bg);
    }

    .collection-grid-filterable__card-content {
      flex: 1;
    }

    .collection-grid-filterable__card-title {
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: var(--color-text);
      line-height: 1.4;
    }

    .collection-grid-filterable__card-price {
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 700;
      margin: 0;
      color: var(--color-accent);
    }

    @media (max-width: 767px) {
      .collection-grid-filterable__filter-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `,

  animations: []
};
