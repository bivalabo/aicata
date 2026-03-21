import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const HERO_SPLIT_IMAGE: SectionTemplate = {
  id: 'hero-split-image',
  category: 'hero' as SectionCategory,
  variant: 'split' as SectionVariant,
  name: 'Split Image Hero',
  description: 'Asymmetric split layout with text on left (45%) and image on right (55%). Features subtle Ken Burns hover effect and generous spacing for luxury brands.',
  tones: ['luxury', 'elegant', 'natural'] as DesignTone[],
  html: `<section data-section-id="hero-split-image" class="hero-split-image">
  <div class="hero-split-image__container">
    <div class="hero-split-image__content">
      <span class="hero-split-image__label">{{LABEL}}</span>
      <h1 class="hero-split-image__heading">{{HEADING}}</h1>
      <p class="hero-split-image__description">{{DESCRIPTION}}</p>
      <a href="{{CTA_URL}}" class="hero-split-image__cta">{{CTA_TEXT}}</a>
    </div>
    <div class="hero-split-image__image-wrapper">
      <img
        src="{{IMAGE_URL}}"
        alt="{{IMAGE_ALT}}"
        class="hero-split-image__image"
      />
    </div>
  </div>
</section>`,
  css: `
.hero-split-image {
  width: 100%;
  padding: 80px 20px;
  background-color: var(--color-bg);
  color: var(--color-text);
  overflow: hidden;
}

.hero-split-image__container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
}

.hero-split-image__content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-split-image__label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-muted);
  font-family: var(--font-body);
}

.hero-split-image__heading {
  font-size: 32px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.5px;
  font-family: var(--font-heading);
  color: var(--color-text);
  margin: 0;
}

.hero-split-image__description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text);
  margin: 0;
  max-width: 480px;
  font-family: var(--font-body);
  font-weight: 300;
}

.hero-split-image__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 1px solid var(--color-text);
  padding-bottom: 4px;
  width: fit-content;
  font-family: var(--font-body);
  transition: all 0.3s ease;
}

.hero-split-image__cta:hover {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.hero-split-image__image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  height: 100%;
  min-height: 400px;
  width: 100%;
}

.hero-split-image__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.8s ease;
}

.hero-split-image__image-wrapper:hover .hero-split-image__image {
  transform: scale(1.05) translateZ(0);
}

@media (min-width: 768px) {
  .hero-split-image {
    padding: 100px 40px;
  }

  .hero-split-image__container {
    grid-template-columns: 45fr 55fr;
    gap: 60px;
  }

  .hero-split-image__heading {
    font-size: 48px;
  }

  .hero-split-image__description {
    font-size: 17px;
    line-height: 1.65;
  }

  .hero-split-image__image-wrapper {
    min-height: 500px;
  }
}

@media (min-width: 1024px) {
  .hero-split-image {
    padding: 120px 60px;
  }

  .hero-split-image__container {
    gap: 80px;
  }

  .hero-split-image__heading {
    font-size: 56px;
  }

  .hero-split-image__description {
    font-size: 18px;
  }

  .hero-split-image__image-wrapper {
    min-height: 600px;
  }
}
  `,
  placeholders: [
    {
      key: 'LABEL',
      type: 'text',
      description: 'Small label text above heading',
      defaultValue: 'Premium Collection'
    },
    {
      key: 'HEADING',
      type: 'text',
      description: 'Main heading text',
      defaultValue: 'Timeless Elegance Redefined'
    },
    {
      key: 'DESCRIPTION',
      type: 'text',
      description: 'Description paragraph',
      defaultValue: 'Discover our curated selection of meticulously crafted products that embody sophistication and understated luxury.'
    },
    {
      key: 'IMAGE_URL',
      type: 'image',
      description: 'Hero image (right side)',
      defaultValue: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=800&q=80'
    },
    {
      key: 'IMAGE_ALT',
      type: 'text',
      description: 'Image alt text',
      defaultValue: 'Product showcase'
    },
    {
      key: 'CTA_TEXT',
      type: 'text',
      description: 'Call-to-action button text',
      defaultValue: 'Explore Collection'
    },
    {
      key: 'CTA_URL',
      type: 'url',
      description: 'Call-to-action link destination',
      defaultValue: '/products'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'load',
      type: 'fadeInUp',
      duration: '0.8s',
      delay: '0s'
    },
    {
      trigger: 'hover',
      type: 'imageZoom',
      duration: '0.8s'
    }
  ] as AnimationDef[]
};

export { HERO_SPLIT_IMAGE };
