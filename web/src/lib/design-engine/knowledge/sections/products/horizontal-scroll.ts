import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const PRODUCTS_HORIZONTAL_SCROLL: SectionTemplate = {
  id: 'products-horizontal-scroll',
  category: 'products' as SectionCategory,
  variant: 'animated' as SectionVariant,
  name: 'Horizontal Scroll Products',
  description: 'Horizontal scrolling product showcase with CSS scroll-snap for smooth, touch-friendly browsing. Modern and interactive.',
  tones: ['modern', 'minimal', 'cool'] as DesignTone[],
  html: `<section data-section-id="products-horizontal-scroll" class="products-horizontal-scroll">
  <div class="products-horizontal-scroll__container">
    <div class="products-horizontal-scroll__header">
      <h2 class="products-horizontal-scroll__title">{{SECTION_TITLE}}</h2>
      <div class="products-horizontal-scroll__controls">
        <button class="products-horizontal-scroll__control-btn products-horizontal-scroll__control-btn--prev" aria-label="Previous">←</button>
        <button class="products-horizontal-scroll__control-btn products-horizontal-scroll__control-btn--next" aria-label="Next">→</button>
      </div>
    </div>
    <div class="products-horizontal-scroll__scroll-wrapper">
      <div class="products-horizontal-scroll__scroll-content">
        <div class="products-horizontal-scroll__item">
          <div class="products-horizontal-scroll__card">
            <img src="{{PRODUCT_1_IMAGE}}" alt="{{PRODUCT_1_NAME}}" class="products-horizontal-scroll__image" />
            <div class="products-horizontal-scroll__info">
              <h3 class="products-horizontal-scroll__name">{{PRODUCT_1_NAME}}</h3>
              <p class="products-horizontal-scroll__price">{{PRODUCT_1_PRICE}}</p>
              <a href="{{PRODUCT_1_URL}}" class="products-horizontal-scroll__btn">Shop</a>
            </div>
          </div>
        </div>
        <div class="products-horizontal-scroll__item">
          <div class="products-horizontal-scroll__card">
            <img src="{{PRODUCT_2_IMAGE}}" alt="{{PRODUCT_2_NAME}}" class="products-horizontal-scroll__image" />
            <div class="products-horizontal-scroll__info">
              <h3 class="products-horizontal-scroll__name">{{PRODUCT_2_NAME}}</h3>
              <p class="products-horizontal-scroll__price">{{PRODUCT_2_PRICE}}</p>
              <a href="{{PRODUCT_2_URL}}" class="products-horizontal-scroll__btn">Shop</a>
            </div>
          </div>
        </div>
        <div class="products-horizontal-scroll__item">
          <div class="products-horizontal-scroll__card">
            <img src="{{PRODUCT_3_IMAGE}}" alt="{{PRODUCT_3_NAME}}" class="products-horizontal-scroll__image" />
            <div class="products-horizontal-scroll__info">
              <h3 class="products-horizontal-scroll__name">{{PRODUCT_3_NAME}}</h3>
              <p class="products-horizontal-scroll__price">{{PRODUCT_3_PRICE}}</p>
              <a href="{{PRODUCT_3_URL}}" class="products-horizontal-scroll__btn">Shop</a>
            </div>
          </div>
        </div>
        <div class="products-horizontal-scroll__item">
          <div class="products-horizontal-scroll__card">
            <img src="{{PRODUCT_4_IMAGE}}" alt="{{PRODUCT_4_NAME}}" class="products-horizontal-scroll__image" />
            <div class="products-horizontal-scroll__info">
              <h3 class="products-horizontal-scroll__name">{{PRODUCT_4_NAME}}</h3>
              <p class="products-horizontal-scroll__price">{{PRODUCT_4_PRICE}}</p>
              <a href="{{PRODUCT_4_URL}}" class="products-horizontal-scroll__btn">Shop</a>
            </div>
          </div>
        </div>
        <div class="products-horizontal-scroll__item">
          <div class="products-horizontal-scroll__card">
            <img src="{{PRODUCT_5_IMAGE}}" alt="{{PRODUCT_5_NAME}}" class="products-horizontal-scroll__image" />
            <div class="products-horizontal-scroll__info">
              <h3 class="products-horizontal-scroll__name">{{PRODUCT_5_NAME}}</h3>
              <p class="products-horizontal-scroll__price">{{PRODUCT_5_PRICE}}</p>
              <a href="{{PRODUCT_5_URL}}" class="products-horizontal-scroll__btn">Shop</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
  css: `
.products-horizontal-scroll {
  width: 100%;
  padding: 60px 20px;
  background-color: var(--color-bg);
  color: var(--color-text);
  overflow: hidden;
}

.products-horizontal-scroll__container {
  max-width: 1400px;
  margin: 0 auto;
}

.products-horizontal-scroll__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
}

.products-horizontal-scroll__title {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  font-family: var(--font-heading);
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.products-horizontal-scroll__controls {
  display: flex;
  gap: 12px;
}

.products-horizontal-scroll__control-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text);
  border-radius: 4px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.products-horizontal-scroll__control-btn:hover {
  background-color: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.products-horizontal-scroll__scroll-wrapper {
  overflow: hidden;
  position: relative;
}

.products-horizontal-scroll__scroll-content {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

.products-horizontal-scroll__scroll-content::-webkit-scrollbar {
  height: 6px;
}

.products-horizontal-scroll__scroll-content::-webkit-scrollbar-track {
  background: transparent;
}

.products-horizontal-scroll__scroll-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.products-horizontal-scroll__scroll-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-muted);
}

.products-horizontal-scroll__item {
  flex: 0 0 calc(100% - 16px);
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.products-horizontal-scroll__card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--color-surface);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.products-horizontal-scroll__image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.products-horizontal-scroll__card:hover .products-horizontal-scroll__image {
  transform: scale(1.05);
}

.products-horizontal-scroll__info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.products-horizontal-scroll__name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
  font-family: var(--font-heading);
}

.products-horizontal-scroll__price {
  font-size: 14px;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
}

.products-horizontal-scroll__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-bg);
  background-color: var(--color-text);
  text-decoration: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
}

.products-horizontal-scroll__btn:hover {
  background-color: var(--color-accent);
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  .products-horizontal-scroll {
    padding: 80px 40px;
  }

  .products-horizontal-scroll__title {
    font-size: 40px;
  }

  .products-horizontal-scroll__item {
    flex: 0 0 calc(50% - 12px);
  }

  .products-horizontal-scroll__image {
    height: 350px;
  }
}

@media (min-width: 1024px) {
  .products-horizontal-scroll {
    padding: 100px 60px;
  }

  .products-horizontal-scroll__title {
    font-size: 48px;
  }

  .products-horizontal-scroll__item {
    flex: 0 0 calc(33.333% - 16px);
  }

  .products-horizontal-scroll__image {
    height: 400px;
  }
}
  `,
  placeholders: [
    {
      key: 'SECTION_TITLE',
      type: 'text',
      description: 'Section heading',
      defaultValue: 'Latest Releases'
    },
    {
      key: 'PRODUCT_1_IMAGE',
      type: 'image',
      description: 'Product 1 image',
      defaultValue: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'
    },
    {
      key: 'PRODUCT_1_NAME',
      type: 'text',
      description: 'Product 1 name',
      defaultValue: 'Urban Backpack'
    },
    {
      key: 'PRODUCT_1_PRICE',
      type: 'text',
      description: 'Product 1 price',
      defaultValue: '$129'
    },
    {
      key: 'PRODUCT_1_URL',
      type: 'url',
      description: 'Product 1 link',
      defaultValue: '/products/backpack-1'
    },
    {
      key: 'PRODUCT_2_IMAGE',
      type: 'image',
      description: 'Product 2 image',
      defaultValue: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80'
    },
    {
      key: 'PRODUCT_2_NAME',
      type: 'text',
      description: 'Product 2 name',
      defaultValue: 'Canvas Tote'
    },
    {
      key: 'PRODUCT_2_PRICE',
      type: 'text',
      description: 'Product 2 price',
      defaultValue: '$89'
    },
    {
      key: 'PRODUCT_2_URL',
      type: 'url',
      description: 'Product 2 link',
      defaultValue: '/products/tote-1'
    },
    {
      key: 'PRODUCT_3_IMAGE',
      type: 'image',
      description: 'Product 3 image',
      defaultValue: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'
    },
    {
      key: 'PRODUCT_3_NAME',
      type: 'text',
      description: 'Product 3 name',
      defaultValue: 'Crossbody Bag'
    },
    {
      key: 'PRODUCT_3_PRICE',
      type: 'text',
      description: 'Product 3 price',
      defaultValue: '$99'
    },
    {
      key: 'PRODUCT_3_URL',
      type: 'url',
      description: 'Product 3 link',
      defaultValue: '/products/crossbody-1'
    },
    {
      key: 'PRODUCT_4_IMAGE',
      type: 'image',
      description: 'Product 4 image',
      defaultValue: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80'
    },
    {
      key: 'PRODUCT_4_NAME',
      type: 'text',
      description: 'Product 4 name',
      defaultValue: 'Leather Briefcase'
    },
    {
      key: 'PRODUCT_4_PRICE',
      type: 'text',
      description: 'Product 4 price',
      defaultValue: '$249'
    },
    {
      key: 'PRODUCT_4_URL',
      type: 'url',
      description: 'Product 4 link',
      defaultValue: '/products/briefcase-1'
    },
    {
      key: 'PRODUCT_5_IMAGE',
      type: 'image',
      description: 'Product 5 image',
      defaultValue: 'https://images.unsplash.com/photo-1532453629131-2a02e8f10c3f?w=600&q=80'
    },
    {
      key: 'PRODUCT_5_NAME',
      type: 'text',
      description: 'Product 5 name',
      defaultValue: 'Minimalist Wallet'
    },
    {
      key: 'PRODUCT_5_PRICE',
      type: 'text',
      description: 'Product 5 price',
      defaultValue: '$59'
    },
    {
      key: 'PRODUCT_5_URL',
      type: 'url',
      description: 'Product 5 link',
      defaultValue: '/products/wallet-1'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'load',
      type: 'fadeInRight',
      duration: '0.8s',
      delay: '0.1s'
    },
    {
      trigger: 'scroll',
      type: 'slideInLeft',
      duration: '0.8s'
    },
    {
      trigger: 'hover',
      type: 'imageZoom',
      duration: '0.5s'
    }
  ] as AnimationDef[]
};

export { PRODUCTS_HORIZONTAL_SCROLL };
