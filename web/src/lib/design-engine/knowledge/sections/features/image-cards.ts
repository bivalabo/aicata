import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const FEATURES_IMAGE_CARDS: SectionTemplate = {
  id: 'features-image-cards',
  category: 'features' as SectionCategory,
  variant: 'grid' as SectionVariant,
  name: 'Image Cards Features',
  description: 'Feature cards with background images and text overlay. Soft hover effects perfect for showcasing product benefits with visual appeal.',
  tones: ['natural', 'warm', 'elegant'] as DesignTone[],
  html: `<section data-section-id="features-image-cards" class="features-image-cards">
  <div class="features-image-cards__container">
    <div class="features-image-cards__header">
      <h2 class="features-image-cards__title">{{SECTION_TITLE}}</h2>
      <p class="features-image-cards__subtitle">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="features-image-cards__grid">
      <div class="features-image-cards__card">
        <div class="features-image-cards__image-wrapper">
          <img src="{{FEATURE_1_IMAGE}}" alt="{{FEATURE_1_TITLE}}" class="features-image-cards__image" />
        </div>
        <div class="features-image-cards__overlay">
          <h3 class="features-image-cards__card-title">{{FEATURE_1_TITLE}}</h3>
          <p class="features-image-cards__card-text">{{FEATURE_1_TEXT}}</p>
        </div>
      </div>
      <div class="features-image-cards__card">
        <div class="features-image-cards__image-wrapper">
          <img src="{{FEATURE_2_IMAGE}}" alt="{{FEATURE_2_TITLE}}" class="features-image-cards__image" />
        </div>
        <div class="features-image-cards__overlay">
          <h3 class="features-image-cards__card-title">{{FEATURE_2_TITLE}}</h3>
          <p class="features-image-cards__card-text">{{FEATURE_2_TEXT}}</p>
        </div>
      </div>
      <div class="features-image-cards__card">
        <div class="features-image-cards__image-wrapper">
          <img src="{{FEATURE_3_IMAGE}}" alt="{{FEATURE_3_TITLE}}" class="features-image-cards__image" />
        </div>
        <div class="features-image-cards__overlay">
          <h3 class="features-image-cards__card-title">{{FEATURE_3_TITLE}}</h3>
          <p class="features-image-cards__card-text">{{FEATURE_3_TEXT}}</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
  css: `
.features-image-cards {
  width: 100%;
  padding: 60px 20px;
  background-color: var(--color-bg);
  color: var(--color-text);
}

.features-image-cards__container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-image-cards__header {
  text-align: center;
  margin-bottom: 50px;
}

.features-image-cards__title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px;
  font-family: var(--font-heading);
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.features-image-cards__subtitle {
  font-size: 16px;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features-image-cards__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

.features-image-cards__card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  aspect-ratio: 4 / 3;
  cursor: pointer;
  transition: all 0.4s ease;
}

.features-image-cards__image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.features-image-cards__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.320, 1);
}

.features-image-cards__card:hover .features-image-cards__image {
  transform: scale(1.12);
}

.features-image-cards__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(60, 40, 20, 0.7) 0%, rgba(40, 60, 80, 0.8) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.features-image-cards__card:hover .features-image-cards__overlay {
  opacity: 1;
}

.features-image-cards__card-title {
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px;
  font-family: var(--font-heading);
  letter-spacing: -0.3px;
}

.features-image-cards__card-text {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
}

@media (min-width: 768px) {
  .features-image-cards {
    padding: 80px 40px;
  }

  .features-image-cards__title {
    font-size: 40px;
  }

  .features-image-cards__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 36px;
  }

  .features-image-cards__card {
    aspect-ratio: 4 / 3;
  }
}

@media (min-width: 1024px) {
  .features-image-cards {
    padding: 100px 60px;
  }

  .features-image-cards__title {
    font-size: 48px;
  }

  .features-image-cards__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
  }

  .features-image-cards__card-title {
    font-size: 24px;
  }

  .features-image-cards__card-text {
    font-size: 16px;
  }
}
  `,
  placeholders: [
    {
      key: 'SECTION_TITLE',
      type: 'text',
      description: 'Section heading',
      defaultValue: 'Why Choose Us'
    },
    {
      key: 'SECTION_SUBTITLE',
      type: 'text',
      description: 'Section subtitle',
      defaultValue: 'Discover what makes our products exceptional'
    },
    {
      key: 'FEATURE_1_IMAGE',
      type: 'image',
      description: 'First feature card image',
      defaultValue: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
    },
    {
      key: 'FEATURE_1_TITLE',
      type: 'text',
      description: 'First feature title',
      defaultValue: 'Sustainable Quality'
    },
    {
      key: 'FEATURE_1_TEXT',
      type: 'text',
      description: 'First feature description',
      defaultValue: 'Crafted from eco-friendly materials that last for years, not seasons.'
    },
    {
      key: 'FEATURE_2_IMAGE',
      type: 'image',
      description: 'Second feature card image',
      defaultValue: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
    },
    {
      key: 'FEATURE_2_TITLE',
      type: 'text',
      description: 'Second feature title',
      defaultValue: 'Artisan Crafted'
    },
    {
      key: 'FEATURE_2_TEXT',
      type: 'text',
      description: 'Second feature description',
      defaultValue: 'Each piece is handcrafted by skilled artisans with decades of experience.'
    },
    {
      key: 'FEATURE_3_IMAGE',
      type: 'image',
      description: 'Third feature card image',
      defaultValue: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'
    },
    {
      key: 'FEATURE_3_TITLE',
      type: 'text',
      description: 'Third feature title',
      defaultValue: 'Timeless Design'
    },
    {
      key: 'FEATURE_3_TEXT',
      type: 'text',
      description: 'Third feature description',
      defaultValue: 'Classic aesthetics that transcend trends and remain beautiful forever.'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'scroll',
      type: 'fadeInUp',
      duration: '0.8s'
    },
    {
      trigger: 'hover',
      type: 'imageZoom',
      duration: '0.6s'
    },
    {
      trigger: 'hover',
      type: 'fadeIn',
      duration: '0.4s'
    }
  ] as AnimationDef[]
};

export { FEATURES_IMAGE_CARDS };
