import type { SectionTemplate } from '../../../types';

export const PRODUCT_GALLERY_GRID_LAYOUT: SectionTemplate = {
  id: 'product-gallery-grid-layout',
  category: 'product-gallery',
  variant: 'grid',
  name: 'Masonry Grid Gallery',
  description: 'Two-column masonry-style product image grid with alternating aspect ratios. Inspired by contemporary minimalist retail (COS/Everlane aesthetic).',
  tones: ['modern', 'minimal', 'cool'],
  html: `
    <section data-section-id="product-gallery-grid-layout" class="product-gallery-grid-layout">
      <div class="product-gallery-grid-layout__container">

        <div class="product-gallery-grid-layout__grid">
          <!-- Image 1 - Full height -->
          <figure class="product-gallery-grid-layout__figure product-gallery-grid-layout__figure--tall">
            <div class="product-gallery-grid-layout__image-wrapper">
              <img
                src="{{GALLERY_IMAGE_1}}"
                alt="{{GALLERY_ALT_1}}"
                class="product-gallery-grid-layout__image"
                loading="lazy"
              />
            </div>
            <figcaption class="product-gallery-grid-layout__caption">{{GALLERY_CAPTION_1}}</figcaption>
          </figure>

          <!-- Image 2 - Short -->
          <figure class="product-gallery-grid-layout__figure product-gallery-grid-layout__figure--short">
            <div class="product-gallery-grid-layout__image-wrapper">
              <img
                src="{{GALLERY_IMAGE_2}}"
                alt="{{GALLERY_ALT_2}}"
                class="product-gallery-grid-layout__image"
                loading="lazy"
              />
            </div>
            <figcaption class="product-gallery-grid-layout__caption">{{GALLERY_CAPTION_2}}</figcaption>
          </figure>

          <!-- Image 3 - Short -->
          <figure class="product-gallery-grid-layout__figure product-gallery-grid-layout__figure--short">
            <div class="product-gallery-grid-layout__image-wrapper">
              <img
                src="{{GALLERY_IMAGE_3}}"
                alt="{{GALLERY_ALT_3}}"
                class="product-gallery-grid-layout__image"
                loading="lazy"
              />
            </div>
            <figcaption class="product-gallery-grid-layout__caption">{{GALLERY_CAPTION_3}}</figcaption>
          </figure>

          <!-- Image 4 - Full height -->
          <figure class="product-gallery-grid-layout__figure product-gallery-grid-layout__figure--tall">
            <div class="product-gallery-grid-layout__image-wrapper">
              <img
                src="{{GALLERY_IMAGE_4}}"
                alt="{{GALLERY_ALT_4}}"
                class="product-gallery-grid-layout__image"
                loading="lazy"
              />
            </div>
            <figcaption class="product-gallery-grid-layout__caption">{{GALLERY_CAPTION_4}}</figcaption>
          </figure>

          <!-- Image 5 - Wide/Spanning -->
          <figure class="product-gallery-grid-layout__figure product-gallery-grid-layout__figure--wide">
            <div class="product-gallery-grid-layout__image-wrapper">
              <img
                src="{{GALLERY_IMAGE_5}}"
                alt="{{GALLERY_ALT_5}}"
                class="product-gallery-grid-layout__image"
                loading="lazy"
              />
            </div>
            <figcaption class="product-gallery-grid-layout__caption">{{GALLERY_CAPTION_5}}</figcaption>
          </figure>

          <!-- Image 6 - Standard -->
          <figure class="product-gallery-grid-layout__figure">
            <div class="product-gallery-grid-layout__image-wrapper">
              <img
                src="{{GALLERY_IMAGE_6}}"
                alt="{{GALLERY_ALT_6}}"
                class="product-gallery-grid-layout__image"
                loading="lazy"
              />
            </div>
            <figcaption class="product-gallery-grid-layout__caption">{{GALLERY_CAPTION_6}}</figcaption>
          </figure>
        </div>

      </div>
    </section>
  `,
  css: `
    .product-gallery-grid-layout {
      background-color: var(--color-bg);
      color: var(--color-text);
      padding: 40px 20px;
    }

    .product-gallery-grid-layout__container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .product-gallery-grid-layout__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      grid-auto-rows: auto;
    }

    .product-gallery-grid-layout__figure {
      margin: 0;
      overflow: hidden;
      background: var(--color-muted);
    }

    .product-gallery-grid-layout__image-wrapper {
      position: relative;
      overflow: hidden;
      background: var(--color-muted);
      aspect-ratio: 1;
    }

    .product-gallery-grid-layout__figure--tall .product-gallery-grid-layout__image-wrapper {
      aspect-ratio: 3 / 4;
    }

    .product-gallery-grid-layout__figure--short .product-gallery-grid-layout__image-wrapper {
      aspect-ratio: 4 / 3;
    }

    .product-gallery-grid-layout__figure--wide .product-gallery-grid-layout__image-wrapper {
      aspect-ratio: 16 / 9;
    }

    .product-gallery-grid-layout__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-gallery-grid-layout__figure:hover .product-gallery-grid-layout__image {
      transform: scale(1.05);
    }

    .product-gallery-grid-layout__caption {
      font-family: var(--font-body);
      font-size: 12px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: var(--color-muted);
      padding: 12px 0;
      margin: 0;
      text-align: center;
    }

    @media (min-width: 768px) {
      .product-gallery-grid-layout {
        padding: 60px 40px;
      }

      .product-gallery-grid-layout__grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        grid-auto-rows: auto;
      }

      .product-gallery-grid-layout__figure--wide {
        grid-column: 1 / -1;
      }

      .product-gallery-grid-layout__figure--tall {
        grid-row: span 2;
      }

      .product-gallery-grid-layout__figure--short {
        grid-row: span 1;
      }
    }

    @media (min-width: 1024px) {
      .product-gallery-grid-layout {
        padding: 80px 60px;
      }

      .product-gallery-grid-layout__grid {
        gap: 32px;
      }

      .product-gallery-grid-layout__caption {
        font-size: 13px;
        padding: 16px 0;
      }
    }
  `,
  placeholders: [
    {
      key: 'GALLERY_IMAGE_1',
      type: 'image',
      description: 'Gallery image 1',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=600&fit=crop'
    },
    {
      key: 'GALLERY_IMAGE_2',
      type: 'image',
      description: 'Gallery image 2',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop'
    },
    {
      key: 'GALLERY_IMAGE_3',
      type: 'image',
      description: 'Gallery image 3',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop'
    },
    {
      key: 'GALLERY_IMAGE_4',
      type: 'image',
      description: 'Gallery image 4',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=600&fit=crop'
    },
    {
      key: 'GALLERY_IMAGE_5',
      type: 'image',
      description: 'Gallery image 5 (wide)',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=400&fit=crop'
    },
    {
      key: 'GALLERY_IMAGE_6',
      type: 'image',
      description: 'Gallery image 6',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop'
    },
    {
      key: 'GALLERY_ALT_1',
      type: 'text',
      description: 'Alt text for image 1',
      defaultValue: 'Product detail shot'
    },
    {
      key: 'GALLERY_ALT_2',
      type: 'text',
      description: 'Alt text for image 2',
      defaultValue: 'Product in context'
    },
    {
      key: 'GALLERY_ALT_3',
      type: 'text',
      description: 'Alt text for image 3',
      defaultValue: 'Product lifestyle'
    },
    {
      key: 'GALLERY_ALT_4',
      type: 'text',
      description: 'Alt text for image 4',
      defaultValue: 'Product close-up'
    },
    {
      key: 'GALLERY_ALT_5',
      type: 'text',
      description: 'Alt text for image 5',
      defaultValue: 'Product environment'
    },
    {
      key: 'GALLERY_ALT_6',
      type: 'text',
      description: 'Alt text for image 6',
      defaultValue: 'Product texture'
    },
    {
      key: 'GALLERY_CAPTION_1',
      type: 'text',
      description: 'Caption for image 1',
      defaultValue: 'Front View'
    },
    {
      key: 'GALLERY_CAPTION_2',
      type: 'text',
      description: 'Caption for image 2',
      defaultValue: 'Detail'
    },
    {
      key: 'GALLERY_CAPTION_3',
      type: 'text',
      description: 'Caption for image 3',
      defaultValue: 'Styled'
    },
    {
      key: 'GALLERY_CAPTION_4',
      type: 'text',
      description: 'Caption for image 4',
      defaultValue: 'Back View'
    },
    {
      key: 'GALLERY_CAPTION_5',
      type: 'text',
      description: 'Caption for image 5',
      defaultValue: 'Full Scene'
    },
    {
      key: 'GALLERY_CAPTION_6',
      type: 'text',
      description: 'Caption for image 6',
      defaultValue: 'Texture'
    }
  ],
  animations: [
    {
      trigger: 'scroll',
      type: 'fade-in',
      duration: '0.6s',
      delay: '0.1s'
    },
    {
      trigger: 'hover',
      type: 'scale',
      duration: '0.6s'
    }
  ]
};
