import type { SectionTemplate } from '../../../types';

export const PRODUCT_GALLERY_THUMBNAIL_SLIDER: SectionTemplate = {
  id: 'product-gallery-thumbnail-slider',
  category: 'product-gallery',
  variant: 'carousel',
  name: 'Thumbnail Slider Gallery',
  description: 'Large product image display with thumbnail strip below for navigation. CSS-only interactions with zoom on hover. Suitable for luxury e-commerce.',
  tones: ['luxury', 'elegant', 'minimal'],
  html: `
    <section data-section-id="product-gallery-thumbnail-slider" class="product-gallery-thumbnail-slider">
      <div class="product-gallery-thumbnail-slider__container">

        <div class="product-gallery-thumbnail-slider__main-wrapper">
          <div class="product-gallery-thumbnail-slider__main-image-container">
            <img
              src="{{MAIN_IMAGE_1}}"
              alt="{{IMAGE_ALT_1}}"
              class="product-gallery-thumbnail-slider__main-image"
              data-index="0"
            />
            <img
              src="{{MAIN_IMAGE_2}}"
              alt="{{IMAGE_ALT_2}}"
              class="product-gallery-thumbnail-slider__main-image"
              data-index="1"
              style="display: none;"
            />
            <img
              src="{{MAIN_IMAGE_3}}"
              alt="{{IMAGE_ALT_3}}"
              class="product-gallery-thumbnail-slider__main-image"
              data-index="2"
              style="display: none;"
            />
            <img
              src="{{MAIN_IMAGE_4}}"
              alt="{{IMAGE_ALT_4}}"
              class="product-gallery-thumbnail-slider__main-image"
              data-index="3"
              style="display: none;"
            />
            <div class="product-gallery-thumbnail-slider__zoom-indicator" aria-label="Zoom in to see more detail">
              <span class="product-gallery-thumbnail-slider__zoom-text">Hover to zoom</span>
            </div>
          </div>
        </div>

        <div class="product-gallery-thumbnail-slider__thumbnails">
          <button
            class="product-gallery-thumbnail-slider__thumbnail product-gallery-thumbnail-slider__thumbnail--active"
            data-index="0"
            aria-label="View image 1"
          >
            <img src="{{MAIN_IMAGE_1}}" alt="{{IMAGE_ALT_1}}" />
          </button>
          <button
            class="product-gallery-thumbnail-slider__thumbnail"
            data-index="1"
            aria-label="View image 2"
          >
            <img src="{{MAIN_IMAGE_2}}" alt="{{IMAGE_ALT_2}}" />
          </button>
          <button
            class="product-gallery-thumbnail-slider__thumbnail"
            data-index="2"
            aria-label="View image 3"
          >
            <img src="{{MAIN_IMAGE_3}}" alt="{{IMAGE_ALT_3}}" />
          </button>
          <button
            class="product-gallery-thumbnail-slider__thumbnail"
            data-index="3"
            aria-label="View image 4"
          >
            <img src="{{MAIN_IMAGE_4}}" alt="{{IMAGE_ALT_4}}" />
          </button>
        </div>

      </div>
    </section>
  `,
  css: `
    .product-gallery-thumbnail-slider {
      background-color: var(--color-bg);
      padding: 40px 20px;
    }

    .product-gallery-thumbnail-slider__container {
      max-width: 600px;
      margin: 0 auto;
    }

    .product-gallery-thumbnail-slider__main-wrapper {
      margin-bottom: 24px;
    }

    .product-gallery-thumbnail-slider__main-image-container {
      position: relative;
      overflow: hidden;
      background: var(--color-muted);
      aspect-ratio: 1;
      cursor: zoom-in;
    }

    .product-gallery-thumbnail-slider__main-image-container:hover .product-gallery-thumbnail-slider__zoom-indicator {
      opacity: 1;
    }

    .product-gallery-thumbnail-slider__main-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-gallery-thumbnail-slider__main-image-container:hover .product-gallery-thumbnail-slider__main-image {
      transform: scale(1.15);
    }

    .product-gallery-thumbnail-slider__zoom-indicator {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: #ffffff;
      padding: 8px 16px;
      font-family: var(--font-body);
      font-size: 12px;
      letter-spacing: 0.6px;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .product-gallery-thumbnail-slider__thumbnails {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .product-gallery-thumbnail-slider__thumbnail {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      border: 2px solid transparent;
      background: var(--color-muted);
      padding: 0;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .product-gallery-thumbnail-slider__thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-gallery-thumbnail-slider__thumbnail:hover {
      border-color: var(--color-text);
      opacity: 0.8;
    }

    .product-gallery-thumbnail-slider__thumbnail--active {
      border-color: var(--color-text);
    }

    @media (min-width: 768px) {
      .product-gallery-thumbnail-slider {
        padding: 60px 40px;
      }

      .product-gallery-thumbnail-slider__container {
        max-width: 700px;
      }

      .product-gallery-thumbnail-slider__main-image-container {
        margin-bottom: 32px;
      }

      .product-gallery-thumbnail-slider__thumbnails {
        gap: 16px;
      }

      .product-gallery-thumbnail-slider__thumbnail {
        min-height: 120px;
      }
    }

    @media (min-width: 1024px) {
      .product-gallery-thumbnail-slider {
        padding: 80px 60px;
      }

      .product-gallery-thumbnail-slider__container {
        max-width: 800px;
      }

      .product-gallery-thumbnail-slider__main-image-container {
        margin-bottom: 40px;
      }

      .product-gallery-thumbnail-slider__thumbnails {
        gap: 20px;
      }

      .product-gallery-thumbnail-slider__thumbnail {
        min-height: 140px;
      }
    }
  `,
  placeholders: [
    {
      key: 'MAIN_IMAGE_1',
      type: 'image',
      description: 'Main product image 1',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=800&fit=crop'
    },
    {
      key: 'MAIN_IMAGE_2',
      type: 'image',
      description: 'Main product image 2',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=800&fit=crop'
    },
    {
      key: 'MAIN_IMAGE_3',
      type: 'image',
      description: 'Main product image 3',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=800&fit=crop'
    },
    {
      key: 'MAIN_IMAGE_4',
      type: 'image',
      description: 'Main product image 4',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=800&fit=crop'
    },
    {
      key: 'IMAGE_ALT_1',
      type: 'text',
      description: 'Alt text for image 1',
      defaultValue: 'Product front view'
    },
    {
      key: 'IMAGE_ALT_2',
      type: 'text',
      description: 'Alt text for image 2',
      defaultValue: 'Product detail view'
    },
    {
      key: 'IMAGE_ALT_3',
      type: 'text',
      description: 'Alt text for image 3',
      defaultValue: 'Product lifestyle view'
    },
    {
      key: 'IMAGE_ALT_4',
      type: 'text',
      description: 'Alt text for image 4',
      defaultValue: 'Product back view'
    }
  ],
  animations: [
    {
      trigger: 'load',
      type: 'fade-in',
      duration: '0.6s'
    },
    {
      trigger: 'hover',
      type: 'zoom',
      duration: '0.8s'
    }
  ]
};
