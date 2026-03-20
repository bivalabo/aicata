import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

export const COLLECTION_BANNER_MINIMAL_TEXT: SectionTemplate = {
  id: 'collection-banner-minimal-text',
  name: 'Minimal Collection Header',
  category: 'collection-banner' as SectionCategory,
  variant: 'minimal' as SectionVariant,
  description: 'Minimal text-only collection header with large title, subtitle, and subtle bottom border',
  tones: ['minimal', 'modern', 'cool'] as DesignTone[],

  placeholders: [
    {
      key: 'COLLECTION_TITLE',
      description: 'Main collection title',
      type: 'text',
      defaultValue: 'New Arrivals'
    },
    {
      key: 'COLLECTION_SUBTITLE',
      description: 'Collection subtitle',
      type: 'text',
      defaultValue: 'Explore the latest pieces in our collection'
    }
  ] as PlaceholderDef[],

  html: `
    <section
      data-section-id="collection-banner-minimal-text"
      class="collection-banner-minimal-text"
      style="
        --color-bg: #ffffff;
        --color-text: #1a1a1a;
        --color-accent: #000000;
        --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --spacing-unit: 1rem;
      "
    >
      <div class="collection-banner-minimal-text__wrapper">
        <h1 class="collection-banner-minimal-text__title">
          {{COLLECTION_TITLE}}
        </h1>

        <p class="collection-banner-minimal-text__subtitle">
          {{COLLECTION_SUBTITLE}}
        </p>

        <div class="collection-banner-minimal-text__border"></div>
      </div>
    </section>
  `,

  css: `
    .collection-banner-minimal-text {
      --title-font-size: clamp(2rem, 5vw, 3.5rem);
      --subtitle-font-size: clamp(1rem, 2vw, 1.25rem);
      --padding-vertical: clamp(2rem, 6vh, 4rem);
      --padding-horizontal: clamp(1.5rem, 5vw, 3rem);
      --border-width: 1px;
      --border-color: #e5e5e5;
    }

    .collection-banner-minimal-text__wrapper {
      background-color: var(--color-bg);
      padding: var(--padding-vertical) var(--padding-horizontal);
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
    }

    .collection-banner-minimal-text__title {
      font-family: var(--font-heading);
      font-size: var(--title-font-size);
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 0.75rem 0;
      letter-spacing: -0.015em;
      line-height: 1.1;
      opacity: 0;
      animation: slideInDown 0.6s ease-out 0.1s forwards;
    }

    .collection-banner-minimal-text__subtitle {
      font-family: var(--font-body);
      font-size: var(--subtitle-font-size);
      font-weight: 400;
      color: #666;
      margin: 0 0 2rem 0;
      line-height: 1.6;
      opacity: 0;
      animation: slideInDown 0.6s ease-out 0.2s forwards;
    }

    .collection-banner-minimal-text__border {
      width: 60px;
      height: var(--border-width);
      background-color: var(--color-accent);
      margin-top: 1rem;
      opacity: 0;
      animation: slideInLeft 0.6s ease-out 0.3s forwards;
    }

    @media (min-width: 768px) {
      .collection-banner-minimal-text__wrapper {
        padding: var(--padding-vertical) var(--padding-horizontal);
      }
    }

    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,

  animations: []
};
