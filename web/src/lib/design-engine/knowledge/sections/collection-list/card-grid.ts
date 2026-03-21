import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

export const COLLECTION_LIST_CARD_GRID: SectionTemplate = {
  id: 'collection-list-card-grid',
  name: 'Collection Grid Display',
  category: 'collection-list' as SectionCategory,
  variant: 'grid' as SectionVariant,
  description: 'Collection listing grid with 6 collections featuring large images, collection names, and item count overlays with hover zoom effect',
  tones: ['elegant', 'modern', 'minimal'] as DesignTone[],

  placeholders: [
    {
      key: 'COLLECTION_IMAGE_1',
      description: 'Collection 1 background image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1552062407-c551eeda4bbb?w=600&h=600&fit=crop'
    },
    {
      key: 'COLLECTION_NAME_1',
      description: 'Collection 1 name',
      type: 'text',
      defaultValue: 'Spring Essentials'
    },
    {
      key: 'COLLECTION_COUNT_1',
      description: 'Collection 1 item count',
      type: 'text',
      defaultValue: '45'
    },
    {
      key: 'COLLECTION_URL_1',
      description: 'Collection 1 URL',
      type: 'url',
      defaultValue: '/collections/spring-essentials'
    },
    {
      key: 'COLLECTION_IMAGE_2',
      description: 'Collection 2 background image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop'
    },
    {
      key: 'COLLECTION_NAME_2',
      description: 'Collection 2 name',
      type: 'text',
      defaultValue: 'Summer Vibes'
    },
    {
      key: 'COLLECTION_COUNT_2',
      description: 'Collection 2 item count',
      type: 'text',
      defaultValue: '38'
    },
    {
      key: 'COLLECTION_URL_2',
      description: 'Collection 2 URL',
      type: 'url',
      defaultValue: '/collections/summer-vibes'
    },
    {
      key: 'COLLECTION_IMAGE_3',
      description: 'Collection 3 background image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop'
    },
    {
      key: 'COLLECTION_NAME_3',
      description: 'Collection 3 name',
      type: 'text',
      defaultValue: 'Cozy Layers'
    },
    {
      key: 'COLLECTION_COUNT_3',
      description: 'Collection 3 item count',
      type: 'text',
      defaultValue: '52'
    },
    {
      key: 'COLLECTION_URL_3',
      description: 'Collection 3 URL',
      type: 'url',
      defaultValue: '/collections/cozy-layers'
    },
    {
      key: 'COLLECTION_IMAGE_4',
      description: 'Collection 4 background image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop'
    },
    {
      key: 'COLLECTION_NAME_4',
      description: 'Collection 4 name',
      type: 'text',
      defaultValue: 'Minimalist Basics'
    },
    {
      key: 'COLLECTION_COUNT_4',
      description: 'Collection 4 item count',
      type: 'text',
      defaultValue: '67'
    },
    {
      key: 'COLLECTION_URL_4',
      description: 'Collection 4 URL',
      type: 'url',
      defaultValue: '/collections/minimalist-basics'
    },
    {
      key: 'COLLECTION_IMAGE_5',
      description: 'Collection 5 background image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1595429676521-cd4628902d4a?w=600&h=600&fit=crop'
    },
    {
      key: 'COLLECTION_NAME_5',
      description: 'Collection 5 name',
      type: 'text',
      defaultValue: 'Premium Accessories'
    },
    {
      key: 'COLLECTION_COUNT_5',
      description: 'Collection 5 item count',
      type: 'text',
      defaultValue: '31'
    },
    {
      key: 'COLLECTION_URL_5',
      description: 'Collection 5 URL',
      type: 'url',
      defaultValue: '/collections/premium-accessories'
    },
    {
      key: 'COLLECTION_IMAGE_6',
      description: 'Collection 6 background image URL',
      type: 'image',
      defaultValue: 'https://images.unsplash.com/photo-1574180045827-681f8a0a15b3?w=600&h=600&fit=crop'
    },
    {
      key: 'COLLECTION_NAME_6',
      description: 'Collection 6 name',
      type: 'text',
      defaultValue: 'Luxury Edit'
    },
    {
      key: 'COLLECTION_COUNT_6',
      description: 'Collection 6 item count',
      type: 'text',
      defaultValue: '28'
    },
    {
      key: 'COLLECTION_URL_6',
      description: 'Collection 6 URL',
      type: 'url',
      defaultValue: '/collections/luxury-edit'
    }
  ] as PlaceholderDef[],

  html: `
    <section
      data-section-id="collection-list-card-grid"
      class="collection-list-card-grid"
      style="
        --color-bg: #ffffff;
        --color-text: #ffffff;
        --color-accent: #000000;
        --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --spacing-unit: 1rem;
      "
    >
      <div class="collection-list-card-grid__wrapper">
        <!-- Collection Card 1 -->
        <a href="{{COLLECTION_URL_1}}" class="collection-list-card-grid__card">
          <div
            class="collection-list-card-grid__image"
            style="background-image: url('{{COLLECTION_IMAGE_1}}')"
          ></div>
          <div class="collection-list-card-grid__overlay"></div>
          <div class="collection-list-card-grid__content">
            <h3 class="collection-list-card-grid__name">
              {{COLLECTION_NAME_1}}
            </h3>
            <p class="collection-list-card-grid__count">
              {{COLLECTION_COUNT_1}} Items
            </p>
          </div>
        </a>

        <!-- Collection Card 2 -->
        <a href="{{COLLECTION_URL_2}}" class="collection-list-card-grid__card">
          <div
            class="collection-list-card-grid__image"
            style="background-image: url('{{COLLECTION_IMAGE_2}}')"
          ></div>
          <div class="collection-list-card-grid__overlay"></div>
          <div class="collection-list-card-grid__content">
            <h3 class="collection-list-card-grid__name">
              {{COLLECTION_NAME_2}}
            </h3>
            <p class="collection-list-card-grid__count">
              {{COLLECTION_COUNT_2}} Items
            </p>
          </div>
        </a>

        <!-- Collection Card 3 -->
        <a href="{{COLLECTION_URL_3}}" class="collection-list-card-grid__card">
          <div
            class="collection-list-card-grid__image"
            style="background-image: url('{{COLLECTION_IMAGE_3}}')"
          ></div>
          <div class="collection-list-card-grid__overlay"></div>
          <div class="collection-list-card-grid__content">
            <h3 class="collection-list-card-grid__name">
              {{COLLECTION_NAME_3}}
            </h3>
            <p class="collection-list-card-grid__count">
              {{COLLECTION_COUNT_3}} Items
            </p>
          </div>
        </a>

        <!-- Collection Card 4 -->
        <a href="{{COLLECTION_URL_4}}" class="collection-list-card-grid__card">
          <div
            class="collection-list-card-grid__image"
            style="background-image: url('{{COLLECTION_IMAGE_4}}')"
          ></div>
          <div class="collection-list-card-grid__overlay"></div>
          <div class="collection-list-card-grid__content">
            <h3 class="collection-list-card-grid__name">
              {{COLLECTION_NAME_4}}
            </h3>
            <p class="collection-list-card-grid__count">
              {{COLLECTION_COUNT_4}} Items
            </p>
          </div>
        </a>

        <!-- Collection Card 5 -->
        <a href="{{COLLECTION_URL_5}}" class="collection-list-card-grid__card">
          <div
            class="collection-list-card-grid__image"
            style="background-image: url('{{COLLECTION_IMAGE_5}}')"
          ></div>
          <div class="collection-list-card-grid__overlay"></div>
          <div class="collection-list-card-grid__content">
            <h3 class="collection-list-card-grid__name">
              {{COLLECTION_NAME_5}}
            </h3>
            <p class="collection-list-card-grid__count">
              {{COLLECTION_COUNT_5}} Items
            </p>
          </div>
        </a>

        <!-- Collection Card 6 -->
        <a href="{{COLLECTION_URL_6}}" class="collection-list-card-grid__card">
          <div
            class="collection-list-card-grid__image"
            style="background-image: url('{{COLLECTION_IMAGE_6}}')"
          ></div>
          <div class="collection-list-card-grid__overlay"></div>
          <div class="collection-list-card-grid__content">
            <h3 class="collection-list-card-grid__name">
              {{COLLECTION_NAME_6}}
            </h3>
            <p class="collection-list-card-grid__count">
              {{COLLECTION_COUNT_6}} Items
            </p>
          </div>
        </a>
      </div>
    </section>
  `,

  css: `
    .collection-list-card-grid {
      --grid-cols-mobile: 1;
      --grid-cols-tablet: 2;
      --grid-cols-desktop: 3;
      --gap: 2rem;
      --padding: clamp(1.5rem, 5vw, 3rem);
      --card-border-radius: 8px;
      --overlay-opacity: 0.3;
    }

    .collection-list-card-grid__wrapper {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--padding);
      background-color: var(--color-bg);
      display: grid;
      grid-template-columns: repeat(var(--grid-cols-mobile), 1fr);
      gap: var(--gap);
    }

    @media (min-width: 768px) {
      .collection-list-card-grid__wrapper {
        grid-template-columns: repeat(var(--grid-cols-tablet), 1fr);
      }
    }

    @media (min-width: 1024px) {
      .collection-list-card-grid__wrapper {
        grid-template-columns: repeat(var(--grid-cols-desktop), 1fr);
      }
    }

    /* Collection Card */
    .collection-list-card-grid__card {
      position: relative;
      overflow: hidden;
      aspect-ratio: 1;
      border-radius: var(--card-border-radius);
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.5s cubic-bezier(0.23, 1, 0.320, 1);
    }

    .collection-list-card-grid__card:hover {
      transform: scale(1.05);
    }

    .collection-list-card-grid__image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      z-index: 1;
      transition: transform 0.5s cubic-bezier(0.23, 1, 0.320, 1);
    }

    .collection-list-card-grid__card:hover .collection-list-card-grid__image {
      transform: scale(1.08);
    }

    .collection-list-card-grid__overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        135deg,
        rgba(0, 0, 0, var(--overlay-opacity)) 0%,
        rgba(0, 0, 0, 0.5) 100%
      );
      z-index: 2;
      transition: all 0.4s ease;
    }

    .collection-list-card-grid__card:hover .collection-list-card-grid__overlay {
      background: linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.4) 0%,
        rgba(0, 0, 0, 0.6) 100%
      );
    }

    .collection-list-card-grid__content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      z-index: 3;
    }

    .collection-list-card-grid__name {
      font-family: var(--font-heading);
      font-size: clamp(1.25rem, 4vw, 1.75rem);
      font-weight: 700;
      margin: 0 0 0.75rem 0;
      color: var(--color-text);
      letter-spacing: -0.01em;
      line-height: 1.2;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
      animation: collectionNameEnter 0.6s ease-out;
    }

    .collection-list-card-grid__card:hover .collection-list-card-grid__name {
      opacity: 1;
      transform: translateY(0);
    }

    .collection-list-card-grid__count {
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0;
      color: var(--color-text);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
      transition-delay: 0.05s;
      animation: collectionCountEnter 0.6s ease-out;
    }

    .collection-list-card-grid__card:hover .collection-list-card-grid__count {
      opacity: 1;
      transform: translateY(0);
    }

    @keyframes collectionNameEnter {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes collectionCountEnter {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 767px) {
      .collection-list-card-grid__card:hover {
        transform: scale(1.02);
      }

      .collection-list-card-grid__card:hover .collection-list-card-grid__image {
        transform: scale(1.04);
      }

      .collection-list-card-grid__content {
        padding: 1.5rem;
      }

      .collection-list-card-grid__name {
        opacity: 1;
        transform: translateY(0);
      }

      .collection-list-card-grid__count {
        opacity: 0.9;
        transform: translateY(0);
      }
    }
  `,

  animations: [
    {
      trigger: 'load',
      type: 'fade-in',
      duration: '0.6s',
      delay: '0s'
    },
    {
      trigger: 'load',
      type: 'fade-in',
      duration: '0.6s',
      delay: '0.05s'
    }
  ] as AnimationDef[]
};
