import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const PRODUCTS_MASONRY_GRID: SectionTemplate = {
  id: 'products-masonry-grid',
  category: 'products' as SectionCategory,
  variant: 'grid' as SectionVariant,
  name: 'Masonry Grid Products',
  description: 'Pinterest-style masonry layout using CSS columns. Perfect for showcasing products with varying sizes and modern aesthetic appeal.',
  tones: ['modern', 'minimal', 'bold'] as DesignTone[],
  html: `<section data-section-id="products-masonry-grid" class="products-masonry-grid">
  <div class="products-masonry-grid__container">
    <div class="products-masonry-grid__header">
      <h2 class="products-masonry-grid__title">{{SECTION_TITLE}}</h2>
      <p class="products-masonry-grid__subtitle">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="products-masonry-grid__grid">
      <div class="products-masonry-grid__item">
        <div class="products-masonry-grid__card">
          <img src="{{PRODUCT_1_IMAGE}}" alt="{{PRODUCT_1_NAME}}" class="products-masonry-grid__image" />
          <div class="products-masonry-grid__overlay">
            <h3 class="products-masonry-grid__product-name">{{PRODUCT_1_NAME}}</h3>
            <p class="products-masonry-grid__product-price">{{PRODUCT_1_PRICE}}</p>
            <a href="{{PRODUCT_1_URL}}" class="products-masonry-grid__product-link">View</a>
          </div>
        </div>
      </div>
      <div class="products-masonry-grid__item">
        <div class="products-masonry-grid__card">
          <img src="{{PRODUCT_2_IMAGE}}" alt="{{PRODUCT_2_NAME}}" class="products-masonry-grid__image" />
          <div class="products-masonry-grid__overlay">
            <h3 class="products-masonry-grid__product-name">{{PRODUCT_2_NAME}}</h3>
            <p class="products-masonry-grid__product-price">{{PRODUCT_2_PRICE}}</p>
            <a href="{{PRODUCT_2_URL}}" class="products-masonry-grid__product-link">View</a>
          </div>
        </div>
      </div>
      <div class="products-masonry-grid__item">
        <div class="products-masonry-grid__card">
          <img src="{{PRODUCT_3_IMAGE}}" alt="{{PRODUCT_3_NAME}}" class="products-masonry-grid__image" />
          <div class="products-masonry-grid__overlay">
            <h3 class="products-masonry-grid__product-name">{{PRODUCT_3_NAME}}</h3>
            <p class="products-masonry-grid__product-price">{{PRODUCT_3_PRICE}}</p>
            <a href="{{PRODUCT_3_URL}}" class="products-masonry-grid__product-link">View</a>
          </div>
        </div>
      </div>
      <div class="products-masonry-grid__item">
        <div class="products-masonry-grid__card">
          <img src="{{PRODUCT_4_IMAGE}}" alt="{{PRODUCT_4_NAME}}" class="products-masonry-grid__image" />
          <div class="products-masonry-grid__overlay">
            <h3 class="products-masonry-grid__product-name">{{PRODUCT_4_NAME}}</h3>
            <p class="products-masonry-grid__product-price">{{PRODUCT_4_PRICE}}</p>
            <a href="{{PRODUCT_4_URL}}" class="products-masonry-grid__product-link">View</a>
          </div>
        </div>
      </div>
      <div class="products-masonry-grid__item">
        <div class="products-masonry-grid__card">
          <img src="{{PRODUCT_5_IMAGE}}" alt="{{PRODUCT_5_NAME}}" class="products-masonry-grid__image" />
          <div class="products-masonry-grid__overlay">
            <h3 class="products-masonry-grid__product-name">{{PRODUCT_5_NAME}}</h3>
            <p class="products-masonry-grid__product-price">{{PRODUCT_5_PRICE}}</p>
            <a href="{{PRODUCT_5_URL}}" class="products-masonry-grid__product-link">View</a>
          </div>
        </div>
      </div>
      <div class="products-masonry-grid__item">
        <div class="products-masonry-grid__card">
          <img src="{{PRODUCT_6_IMAGE}}" alt="{{PRODUCT_6_NAME}}" class="products-masonry-grid__image" />
          <div class="products-masonry-grid__overlay">
            <h3 class="products-masonry-grid__product-name">{{PRODUCT_6_NAME}}</h3>
            <p class="products-masonry-grid__product-price">{{PRODUCT_6_PRICE}}</p>
            <a href="{{PRODUCT_6_URL}}" class="products-masonry-grid__product-link">View</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
  css: `
.products-masonry-grid {
  width: 100%;
  padding: 60px 20px;
  background-color: var(--color-bg);
  color: var(--color-text);
}

.products-masonry-grid__container {
  max-width: 1400px;
  margin: 0 auto;
}

.products-masonry-grid__header {
  text-align: center;
  margin-bottom: 50px;
}

.products-masonry-grid__title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px;
  font-family: var(--font-heading);
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.products-masonry-grid__subtitle {
  font-size: 16px;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.products-masonry-grid__grid {
  column-count: 1;
  column-gap: 24px;
}

.products-masonry-grid__item {
  break-inside: avoid;
  margin-bottom: 24px;
  display: flex;
}

.products-masonry-grid__card {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--color-surface);
  transition: all 0.3s ease;
  cursor: pointer;
}

.products-masonry-grid__image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.6s ease;
}

.products-masonry-grid__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.products-masonry-grid__card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
}

.products-masonry-grid__card:hover .products-masonry-grid__image {
  transform: scale(1.08);
}

.products-masonry-grid__card:hover .products-masonry-grid__overlay {
  opacity: 1;
}

.products-masonry-grid__product-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #ffffff;
  font-family: var(--font-heading);
}

.products-masonry-grid__product-price {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px;
  font-family: var(--font-body);
}

.products-masonry-grid__product-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-accent);
  text-decoration: none;
  border-bottom: 1px solid var(--color-accent);
  padding-bottom: 2px;
  width: fit-content;
  transition: all 0.3s ease;
}

.products-masonry-grid__product-link:hover {
  color: #ffffff;
  border-bottom-color: #ffffff;
}

@media (min-width: 768px) {
  .products-masonry-grid {
    padding: 80px 40px;
  }

  .products-masonry-grid__title {
    font-size: 40px;
  }

  .products-masonry-grid__grid {
    column-count: 2;
    column-gap: 32px;
  }

  .products-masonry-grid__item {
    margin-bottom: 32px;
  }
}

@media (min-width: 1024px) {
  .products-masonry-grid {
    padding: 100px 60px;
  }

  .products-masonry-grid__title {
    font-size: 48px;
  }

  .products-masonry-grid__grid {
    column-count: 3;
    column-gap: 40px;
  }

  .products-masonry-grid__item {
    margin-bottom: 40px;
  }
}
  `,
  placeholders: [
    {
      key: 'SECTION_TITLE',
      type: 'text',
      description: 'Section heading',
      defaultValue: 'Featured Collection'
    },
    {
      key: 'SECTION_SUBTITLE',
      type: 'text',
      description: 'Section subtitle or description',
      defaultValue: 'Discover our handpicked selection of premium products'
    },
    {
      key: 'PRODUCT_1_IMAGE',
      type: 'image',
      description: 'Product 1 image',
      defaultValue: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
    },
    {
      key: 'PRODUCT_1_NAME',
      type: 'text',
      description: 'Product 1 name',
      defaultValue: 'Elegant Minimalist Watch'
    },
    {
      key: 'PRODUCT_1_PRICE',
      type: 'text',
      description: 'Product 1 price',
      defaultValue: '$299'
    },
    {
      key: 'PRODUCT_1_URL',
      type: 'url',
      description: 'Product 1 link',
      defaultValue: '/products/watch-1'
    },
    {
      key: 'PRODUCT_2_IMAGE',
      type: 'image',
      description: 'Product 2 image',
      defaultValue: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
    },
    {
      key: 'PRODUCT_2_NAME',
      type: 'text',
      description: 'Product 2 name',
      defaultValue: 'Premium Sunglasses'
    },
    {
      key: 'PRODUCT_2_PRICE',
      type: 'text',
      description: 'Product 2 price',
      defaultValue: '$199'
    },
    {
      key: 'PRODUCT_2_URL',
      type: 'url',
      description: 'Product 2 link',
      defaultValue: '/products/glasses-1'
    },
    {
      key: 'PRODUCT_3_IMAGE',
      type: 'image',
      description: 'Product 3 image',
      defaultValue: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80'
    },
    {
      key: 'PRODUCT_3_NAME',
      type: 'text',
      description: 'Product 3 name',
      defaultValue: 'Designer Accessories'
    },
    {
      key: 'PRODUCT_3_PRICE',
      type: 'text',
      description: 'Product 3 price',
      defaultValue: '$149'
    },
    {
      key: 'PRODUCT_3_URL',
      type: 'url',
      description: 'Product 3 link',
      defaultValue: '/products/accessories-1'
    },
    {
      key: 'PRODUCT_4_IMAGE',
      type: 'image',
      description: 'Product 4 image',
      defaultValue: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80'
    },
    {
      key: 'PRODUCT_4_NAME',
      type: 'text',
      description: 'Product 4 name',
      defaultValue: 'Luxury Leather Bag'
    },
    {
      key: 'PRODUCT_4_PRICE',
      type: 'text',
      description: 'Product 4 price',
      defaultValue: '$399'
    },
    {
      key: 'PRODUCT_4_URL',
      type: 'url',
      description: 'Product 4 link',
      defaultValue: '/products/bag-1'
    },
    {
      key: 'PRODUCT_5_IMAGE',
      type: 'image',
      description: 'Product 5 image',
      defaultValue: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
    },
    {
      key: 'PRODUCT_5_NAME',
      type: 'text',
      description: 'Product 5 name',
      defaultValue: 'Classic Shoes'
    },
    {
      key: 'PRODUCT_5_PRICE',
      type: 'text',
      description: 'Product 5 price',
      defaultValue: '$279'
    },
    {
      key: 'PRODUCT_5_URL',
      type: 'url',
      description: 'Product 5 link',
      defaultValue: '/products/shoes-1'
    },
    {
      key: 'PRODUCT_6_IMAGE',
      type: 'image',
      description: 'Product 6 image',
      defaultValue: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80'
    },
    {
      key: 'PRODUCT_6_NAME',
      type: 'text',
      description: 'Product 6 name',
      defaultValue: 'Fashion Scarf'
    },
    {
      key: 'PRODUCT_6_PRICE',
      type: 'text',
      description: 'Product 6 price',
      defaultValue: '$119'
    },
    {
      key: 'PRODUCT_6_URL',
      type: 'url',
      description: 'Product 6 link',
      defaultValue: '/products/scarf-1'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'load',
      type: 'fadeIn',
      duration: '0.6s',
      delay: '0s'
    },
    {
      trigger: 'scroll',
      type: 'fadeInUp',
      duration: '0.8s'
    },
    {
      trigger: 'hover',
      type: 'imageZoom',
      duration: '0.6s'
    }
  ] as AnimationDef[]
};

export { PRODUCTS_MASONRY_GRID };
