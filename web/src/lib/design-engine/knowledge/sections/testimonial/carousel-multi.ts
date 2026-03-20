import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const TESTIMONIAL_CAROUSEL_MULTI: SectionTemplate = {
  id: 'testimonial-carousel-multi',
  category: 'testimonial' as SectionCategory,
  variant: 'animated' as SectionVariant,
  name: 'Multi-Card Testimonial Carousel',
  description: 'Horizontal scrolling testimonial carousel with CSS-only snap scrolling. Beautiful multi-card layout showcasing customer reviews.',
  tones: ['modern', 'warm', 'minimal'] as DesignTone[],
  html: `<section data-section-id="testimonial-carousel-multi" class="testimonial-carousel-multi">
  <div class="testimonial-carousel-multi__container">
    <div class="testimonial-carousel-multi__header">
      <h2 class="testimonial-carousel-multi__title">{{SECTION_TITLE}}</h2>
      <p class="testimonial-carousel-multi__subtitle">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="testimonial-carousel-multi__carousel">
      <div class="testimonial-carousel-multi__card">
        <div class="testimonial-carousel-multi__stars">
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
        </div>
        <p class="testimonial-carousel-multi__quote">{{TESTIMONIAL_1_TEXT}}</p>
        <div class="testimonial-carousel-multi__author">
          <div class="testimonial-carousel-multi__avatar">
            <img src="{{TESTIMONIAL_1_AVATAR}}" alt="{{TESTIMONIAL_1_NAME}}" />
          </div>
          <div>
            <h4 class="testimonial-carousel-multi__author-name">{{TESTIMONIAL_1_NAME}}</h4>
            <p class="testimonial-carousel-multi__author-title">{{TESTIMONIAL_1_ROLE}}</p>
          </div>
        </div>
      </div>
      <div class="testimonial-carousel-multi__card">
        <div class="testimonial-carousel-multi__stars">
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
        </div>
        <p class="testimonial-carousel-multi__quote">{{TESTIMONIAL_2_TEXT}}</p>
        <div class="testimonial-carousel-multi__author">
          <div class="testimonial-carousel-multi__avatar">
            <img src="{{TESTIMONIAL_2_AVATAR}}" alt="{{TESTIMONIAL_2_NAME}}" />
          </div>
          <div>
            <h4 class="testimonial-carousel-multi__author-name">{{TESTIMONIAL_2_NAME}}</h4>
            <p class="testimonial-carousel-multi__author-title">{{TESTIMONIAL_2_ROLE}}</p>
          </div>
        </div>
      </div>
      <div class="testimonial-carousel-multi__card">
        <div class="testimonial-carousel-multi__stars">
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
          <span class="testimonial-carousel-multi__star">★</span>
        </div>
        <p class="testimonial-carousel-multi__quote">{{TESTIMONIAL_3_TEXT}}</p>
        <div class="testimonial-carousel-multi__author">
          <div class="testimonial-carousel-multi__avatar">
            <img src="{{TESTIMONIAL_3_AVATAR}}" alt="{{TESTIMONIAL_3_NAME}}" />
          </div>
          <div>
            <h4 class="testimonial-carousel-multi__author-name">{{TESTIMONIAL_3_NAME}}</h4>
            <p class="testimonial-carousel-multi__author-title">{{TESTIMONIAL_3_ROLE}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
  css: `
.testimonial-carousel-multi {
  width: 100%;
  padding: 60px 20px;
  background-color: var(--color-bg);
  color: var(--color-text);
  overflow: hidden;
}

.testimonial-carousel-multi__container {
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-carousel-multi__header {
  text-align: center;
  margin-bottom: 50px;
}

.testimonial-carousel-multi__title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px;
  font-family: var(--font-heading);
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.testimonial-carousel-multi__subtitle {
  font-size: 16px;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.testimonial-carousel-multi__carousel {
  display: flex;
  gap: 28px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding-bottom: 12px;
  -webkit-overflow-scrolling: touch;
}

.testimonial-carousel-multi__carousel::-webkit-scrollbar {
  height: 8px;
}

.testimonial-carousel-multi__carousel::-webkit-scrollbar-track {
  background: transparent;
}

.testimonial-carousel-multi__carousel::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.testimonial-carousel-multi__carousel::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent);
}

.testimonial-carousel-multi__card {
  flex: 0 0 calc(100% - 14px);
  scroll-snap-align: start;
  scroll-snap-stop: always;
  background-color: var(--color-surface);
  padding: 32px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s ease;
}

.testimonial-carousel-multi__card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.testimonial-carousel-multi__stars {
  display: flex;
  gap: 4px;
}

.testimonial-carousel-multi__star {
  font-size: 18px;
  color: var(--color-accent);
  line-height: 1;
}

.testimonial-carousel-multi__quote {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 400;
  font-style: italic;
}

.testimonial-carousel-multi__author {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-top: 8px;
}

.testimonial-carousel-multi__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--color-border);
}

.testimonial-carousel-multi__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.testimonial-carousel-multi__author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 4px;
  font-family: var(--font-heading);
}

.testimonial-carousel-multi__author-title {
  font-size: 13px;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
}

@media (min-width: 768px) {
  .testimonial-carousel-multi {
    padding: 80px 40px;
  }

  .testimonial-carousel-multi__title {
    font-size: 40px;
  }

  .testimonial-carousel-multi__card {
    flex: 0 0 calc(50% - 14px);
    padding: 36px;
  }

  .testimonial-carousel-multi__quote {
    font-size: 17px;
  }
}

@media (min-width: 1024px) {
  .testimonial-carousel-multi {
    padding: 100px 60px;
  }

  .testimonial-carousel-multi__title {
    font-size: 48px;
  }

  .testimonial-carousel-multi__card {
    flex: 0 0 calc(33.333% - 19px);
    padding: 40px;
  }

  .testimonial-carousel-multi__quote {
    font-size: 18px;
    line-height: 1.8;
  }
}
  `,
  placeholders: [
    {
      key: 'SECTION_TITLE',
      type: 'text',
      description: 'Section heading',
      defaultValue: 'What Our Customers Say'
    },
    {
      key: 'SECTION_SUBTITLE',
      type: 'text',
      description: 'Section subtitle',
      defaultValue: 'Join thousands of satisfied customers worldwide'
    },
    {
      key: 'TESTIMONIAL_1_TEXT',
      type: 'text',
      description: 'First testimonial quote',
      defaultValue: 'The quality and attention to detail are unmatched. I\'ve been using their products for years and they never disappoint.'
    },
    {
      key: 'TESTIMONIAL_1_AVATAR',
      type: 'image',
      description: 'First testimonial author avatar',
      defaultValue: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80'
    },
    {
      key: 'TESTIMONIAL_1_NAME',
      type: 'text',
      description: 'First testimonial author name',
      defaultValue: 'Sarah Johnson'
    },
    {
      key: 'TESTIMONIAL_1_ROLE',
      type: 'text',
      description: 'First testimonial author role',
      defaultValue: 'Design Director'
    },
    {
      key: 'TESTIMONIAL_2_TEXT',
      type: 'text',
      description: 'Second testimonial quote',
      defaultValue: 'Exceptional craftsmanship and sustainable practices. This brand truly cares about making a positive impact.'
    },
    {
      key: 'TESTIMONIAL_2_AVATAR',
      type: 'image',
      description: 'Second testimonial author avatar',
      defaultValue: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80'
    },
    {
      key: 'TESTIMONIAL_2_NAME',
      type: 'text',
      description: 'Second testimonial author name',
      defaultValue: 'Marcus Chen'
    },
    {
      key: 'TESTIMONIAL_2_ROLE',
      type: 'text',
      description: 'Second testimonial author role',
      defaultValue: 'Creative Entrepreneur'
    },
    {
      key: 'TESTIMONIAL_3_TEXT',
      type: 'text',
      description: 'Third testimonial quote',
      defaultValue: 'Outstanding customer service and premium quality. Worth every penny. Highly recommended!'
    },
    {
      key: 'TESTIMONIAL_3_AVATAR',
      type: 'image',
      description: 'Third testimonial author avatar',
      defaultValue: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&q=80'
    },
    {
      key: 'TESTIMONIAL_3_NAME',
      type: 'text',
      description: 'Third testimonial author name',
      defaultValue: 'Emma Williams'
    },
    {
      key: 'TESTIMONIAL_3_ROLE',
      type: 'text',
      description: 'Third testimonial author role',
      defaultValue: 'Brand Strategist'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'load',
      type: 'fadeInUp',
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
      type: 'lift',
      duration: '0.3s'
    }
  ] as AnimationDef[]
};

export { TESTIMONIAL_CAROUSEL_MULTI };
