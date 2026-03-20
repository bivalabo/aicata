import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const HERO_ORGANIC_FLOWING: SectionTemplate = {
  id: 'hero-organic-flowing',
  category: 'hero' as SectionCategory,
  variant: 'fullbleed' as SectionVariant,
  name: 'Organic Flowing Hero',
  description: 'Soft, flowing hero with organic shapes created using CSS clip-path and border-radius. Perfect for natural, artisan, and wellness brands with earth tones.',
  tones: ['natural', 'warm', 'elegant'] as DesignTone[],
  html: `<section data-section-id="hero-organic-flowing" class="hero-organic-flowing">
  <div class="hero-organic-flowing__background">
    <div class="hero-organic-flowing__shape hero-organic-flowing__shape--1"></div>
    <div class="hero-organic-flowing__shape hero-organic-flowing__shape--2"></div>
    <div class="hero-organic-flowing__shape hero-organic-flowing__shape--3"></div>
  </div>
  <div class="hero-organic-flowing__container">
    <div class="hero-organic-flowing__content">
      <span class="hero-organic-flowing__label">{{LABEL}}</span>
      <h1 class="hero-organic-flowing__heading">{{HEADING}}</h1>
      <p class="hero-organic-flowing__description">{{DESCRIPTION}}</p>
      <a href="{{CTA_URL}}" class="hero-organic-flowing__cta">{{CTA_TEXT}}</a>
    </div>
    <div class="hero-organic-flowing__image-wrapper">
      <img
        src="{{IMAGE_URL}}"
        alt="{{IMAGE_ALT}}"
        class="hero-organic-flowing__image"
      />
    </div>
  </div>
</section>`,
  css: `
.hero-organic-flowing {
  position: relative;
  width: 100%;
  padding: 60px 20px 80px;
  background-color: var(--color-bg);
  color: var(--color-text);
  overflow: hidden;
}

.hero-organic-flowing__background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.3;
}

.hero-organic-flowing__shape {
  position: absolute;
  background: linear-gradient(135deg, var(--color-accent), transparent);
}

.hero-organic-flowing__shape--1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -80px;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  animation: float 6s ease-in-out infinite;
}

.hero-organic-flowing__shape--2 {
  width: 250px;
  height: 250px;
  bottom: -50px;
  left: -60px;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  animation: float 8s ease-in-out infinite;
  animation-delay: 1s;
}

.hero-organic-flowing__shape--3 {
  width: 200px;
  height: 200px;
  bottom: 100px;
  right: 10%;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  animation: float 7s ease-in-out infinite;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(3deg);
  }
}

.hero-organic-flowing__container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
}

.hero-organic-flowing__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
}

.hero-organic-flowing__label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-muted);
  font-family: var(--font-body);
}

.hero-organic-flowing__heading {
  font-size: 36px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.5px;
  font-family: var(--font-heading);
  color: var(--color-text);
  margin: 0;
}

.hero-organic-flowing__description {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
}

.hero-organic-flowing__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-accent);
  text-decoration: none;
  border-bottom: 2px solid var(--color-accent);
  padding-bottom: 4px;
  width: fit-content;
  font-family: var(--font-body);
  transition: all 0.3s ease;
}

.hero-organic-flowing__cta:hover {
  transform: translateX(4px);
  color: var(--color-text);
  border-bottom-color: var(--color-text);
}

.hero-organic-flowing__image-wrapper {
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 350px;
  width: 100%;
}

.hero-organic-flowing__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 20% 80% 70% 30% / 40% 50% 60% 50%;
  transition: transform 0.8s ease;
}

.hero-organic-flowing__image-wrapper:hover .hero-organic-flowing__image {
  transform: scale(1.08);
}

@media (min-width: 768px) {
  .hero-organic-flowing {
    padding: 80px 40px 100px;
  }

  .hero-organic-flowing__container {
    grid-template-columns: 1fr 1fr;
    gap: 60px;
  }

  .hero-organic-flowing__heading {
    font-size: 48px;
  }

  .hero-organic-flowing__description {
    font-size: 17px;
  }

  .hero-organic-flowing__image-wrapper {
    min-height: 450px;
  }
}

@media (min-width: 1024px) {
  .hero-organic-flowing {
    padding: 120px 60px 140px;
  }

  .hero-organic-flowing__container {
    gap: 80px;
  }

  .hero-organic-flowing__heading {
    font-size: 56px;
  }

  .hero-organic-flowing__description {
    font-size: 18px;
    line-height: 1.8;
  }

  .hero-organic-flowing__image-wrapper {
    min-height: 550px;
  }
}
  `,
  placeholders: [
    {
      key: 'LABEL',
      type: 'text',
      description: 'Small label text above heading',
      defaultValue: 'Natural Collection'
    },
    {
      key: 'HEADING',
      type: 'text',
      description: 'Main hero heading',
      defaultValue: 'Sustainably Crafted'
    },
    {
      key: 'DESCRIPTION',
      type: 'text',
      description: 'Description paragraph',
      defaultValue: 'Experience the beauty of nature with our eco-conscious collection. Each piece tells a story of craftsmanship and care for our planet.'
    },
    {
      key: 'IMAGE_URL',
      type: 'image',
      description: 'Hero image with organic styling',
      defaultValue: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
    },
    {
      key: 'IMAGE_ALT',
      type: 'text',
      description: 'Image alt text',
      defaultValue: 'Natural product showcase'
    },
    {
      key: 'CTA_TEXT',
      type: 'text',
      description: 'Call-to-action button text',
      defaultValue: 'Explore Now'
    },
    {
      key: 'CTA_URL',
      type: 'url',
      description: 'Call-to-action link destination',
      defaultValue: '/shop'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'load',
      type: 'fadeInUp',
      duration: '0.9s',
      delay: '0.1s'
    },
    {
      trigger: 'scroll',
      type: 'slideInLeft',
      duration: '0.8s'
    },
    {
      trigger: 'hover',
      type: 'imageZoom',
      duration: '0.8s'
    }
  ] as AnimationDef[]
};

export { HERO_ORGANIC_FLOWING };
