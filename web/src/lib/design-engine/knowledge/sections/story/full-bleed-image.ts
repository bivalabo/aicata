import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const STORY_FULL_BLEED_IMAGE: SectionTemplate = {
  id: 'story-full-bleed-image',
  category: 'story' as SectionCategory,
  variant: 'fullbleed' as SectionVariant,
  name: 'Full Bleed Image Story',
  description: 'Full-width image with text overlay and parallax-ready design. Perfect for telling brand stories with nature and artisan aesthetic.',
  tones: ['natural', 'warm', 'elegant'] as DesignTone[],
  html: `<section data-section-id="story-full-bleed-image" class="story-full-bleed-image">
  <div class="story-full-bleed-image__image-wrapper">
    <img
      src="{{BACKGROUND_IMAGE}}"
      alt="{{BACKGROUND_ALT}}"
      class="story-full-bleed-image__image"
      data-parallax="true"
    />
  </div>
  <div class="story-full-bleed-image__overlay"></div>
  <div class="story-full-bleed-image__content">
    <div class="story-full-bleed-image__container">
      <span class="story-full-bleed-image__label">{{LABEL}}</span>
      <h2 class="story-full-bleed-image__heading">{{HEADING}}</h2>
      <p class="story-full-bleed-image__text">{{MAIN_TEXT}}</p>
      <a href="{{CTA_URL}}" class="story-full-bleed-image__cta">{{CTA_TEXT}}</a>
    </div>
  </div>
</section>`,
  css: `
.story-full-bleed-image {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  overflow: hidden;
  color: #ffffff;
}

.story-full-bleed-image__image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.story-full-bleed-image__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.story-full-bleed-image__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(80, 50, 30, 0.5) 100%);
  z-index: 1;
}

.story-full-bleed-image__content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.story-full-bleed-image__container {
  max-width: 600px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.story-full-bleed-image__label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
  font-family: var(--font-body);
}

.story-full-bleed-image__heading {
  font-size: 40px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.5px;
  font-family: var(--font-heading);
  color: #ffffff;
  margin: 0;
}

.story-full-bleed-image__text {
  font-size: 17px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  max-width: 100%;
}

.story-full-bleed-image__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #ffffff;
  text-decoration: none;
  border: 2px solid #ffffff;
  padding: 12px 32px;
  border-radius: 4px;
  width: fit-content;
  margin-top: 8px;
  font-family: var(--font-body);
  transition: all 0.3s ease;
  cursor: pointer;
}

.story-full-bleed-image__cta:hover {
  background-color: #ffffff;
  color: #2d2d2d;
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  .story-full-bleed-image {
    height: 70vh;
    min-height: 500px;
  }

  .story-full-bleed-image__heading {
    font-size: 52px;
  }

  .story-full-bleed-image__text {
    font-size: 18px;
  }

  .story-full-bleed-image__container {
    max-width: 700px;
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .story-full-bleed-image {
    height: 100vh;
    min-height: 600px;
  }

  .story-full-bleed-image__heading {
    font-size: 64px;
  }

  .story-full-bleed-image__text {
    font-size: 19px;
  }

  .story-full-bleed-image__container {
    max-width: 800px;
    gap: 28px;
  }

  .story-full-bleed-image__cta {
    padding: 14px 40px;
    font-size: 15px;
  }
}
  `,
  placeholders: [
    {
      key: 'LABEL',
      type: 'text',
      description: 'Small label above heading',
      defaultValue: 'Our Story'
    },
    {
      key: 'HEADING',
      type: 'text',
      description: 'Main heading',
      defaultValue: 'Crafted with Purpose'
    },
    {
      key: 'MAIN_TEXT',
      type: 'text',
      description: 'Main body text',
      defaultValue: 'Every product tells a story of dedication, tradition, and respect for nature. We believe in creating beautiful things that last, reducing waste, and supporting communities.'
    },
    {
      key: 'BACKGROUND_IMAGE',
      type: 'image',
      description: 'Full-bleed background image',
      defaultValue: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'
    },
    {
      key: 'BACKGROUND_ALT',
      type: 'text',
      description: 'Background image alt text',
      defaultValue: 'Artisan craftsmanship'
    },
    {
      key: 'CTA_TEXT',
      type: 'text',
      description: 'Call-to-action button text',
      defaultValue: 'Learn More'
    },
    {
      key: 'CTA_URL',
      type: 'url',
      description: 'Call-to-action destination',
      defaultValue: '/about'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'load',
      type: 'fadeIn',
      duration: '1s',
      delay: '0s'
    },
    {
      trigger: 'scroll',
      type: 'parallax',
      duration: '0s'
    },
    {
      trigger: 'scroll',
      type: 'fadeInUp',
      duration: '0.8s'
    }
  ] as AnimationDef[]
};

export { STORY_FULL_BLEED_IMAGE };
