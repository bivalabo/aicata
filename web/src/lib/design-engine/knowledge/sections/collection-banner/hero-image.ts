import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

export const COLLECTION_BANNER_HERO_IMAGE: SectionTemplate = {
  id: 'collection-banner-hero-image',
  name: 'Collection Hero Banner',
  category: 'collection-banner' as SectionCategory,
  variant: 'fullbleed' as SectionVariant,
  description: 'Full-width collection hero banner with background image, dark gradient overlay, title, description, and product count',
  tones: ['luxury', 'elegant', 'bold'] as DesignTone[],

  placeholders: [
    {
      key: 'BANNER_IMAGE',
      description: 'Hero banner background image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1920&h=600&fit=crop'
    },
    {
      key: 'COLLECTION_TITLE',
      description: 'Main collection title',
      type: 'text',
      defaultValue: 'Summer Collection'
    },
    {
      key: 'COLLECTION_DESCRIPTION',
      description: 'Collection subtitle/description',
      type: 'text',
      defaultValue: 'Discover our latest handpicked selection'
    },
    {
      key: 'PRODUCT_COUNT',
      description: 'Number of products in collection',
      type: 'text',
      defaultValue: '128'
    }
  ] as PlaceholderDef[],

  html: `
    <section
      data-section-id="collection-banner-hero-image"
      class="collection-banner-hero-image"
      style="
        --color-bg: #ffffff;
        --color-text: #ffffff;
        --color-accent: #000000;
        --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --spacing-unit: 1rem;
      "
    >
      <div class="collection-banner-hero-image__wrapper">
        <div
          class="collection-banner-hero-image__image"
          style="background-image: url('{{BANNER_IMAGE}}')"
        ></div>

        <div class="collection-banner-hero-image__overlay"></div>

        <div class="collection-banner-hero-image__content">
          <div class="collection-banner-hero-image__inner">
            <h1 class="collection-banner-hero-image__title">
              {{COLLECTION_TITLE}}
            </h1>

            <p class="collection-banner-hero-image__description">
              {{COLLECTION_DESCRIPTION}}
            </p>

            <div class="collection-banner-hero-image__meta">
              <span class="collection-banner-hero-image__count">
                {{PRODUCT_COUNT}} Products
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,

  css: `
    .collection-banner-hero-image {
      --overlay-opacity: 0.5;
      --title-font-size: clamp(2rem, 6vw, 4rem);
      --title-line-height: 1.2;
      --desc-font-size: clamp(1rem, 2vw, 1.5rem);
      --padding-mobile: 2rem 1.5rem;
      --padding-desktop: 6rem 3rem;
    }

    .collection-banner-hero-image__wrapper {
      position: relative;
      overflow: hidden;
      height: clamp(400px, 60vh, 700px);
    }

    .collection-banner-hero-image__image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      z-index: 1;
    }

    .collection-banner-hero-image__overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, var(--overlay-opacity)) 100%
      );
      z-index: 2;
    }

    .collection-banner-hero-image__content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
    }

    .collection-banner-hero-image__inner {
      padding: var(--padding-mobile);
      text-align: center;
      max-width: 800px;
      color: var(--color-text);
      animation: fadeInUp 0.8s ease-out;
    }

    .collection-banner-hero-image__title {
      font-family: var(--font-heading);
      font-size: var(--title-font-size);
      font-weight: 700;
      line-height: var(--title-line-height);
      margin: 0 0 1rem 0;
      letter-spacing: -0.02em;
    }

    .collection-banner-hero-image__description {
      font-family: var(--font-body);
      font-size: var(--desc-font-size);
      font-weight: 300;
      margin: 0 0 2rem 0;
      opacity: 0.95;
      line-height: 1.6;
    }

    .collection-banner-hero-image__meta {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .collection-banner-hero-image__count {
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      opacity: 0.85;
    }

    @media (min-width: 768px) {
      .collection-banner-hero-image__inner {
        padding: var(--padding-desktop);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  animations: [
    {
      trigger: 'load',
      type: 'fade-in',
      duration: '0.8s',
      delay: '0s'
    }
  ] as AnimationDef[]
};
