import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const HERO_FULLSCREEN_VISUAL: SectionTemplate = {
  id: 'hero-fullscreen-visual',
  category: 'hero' as SectionCategory,
  variant: 'fullbleed' as SectionVariant,
  name: 'Fullscreen Visual Hero',
  description: 'Full viewport height background image with dark overlay and centered text. Features subtle parallax scroll effect for a modern, immersive experience.',
  tones: ['bold', 'modern', 'luxury'] as DesignTone[],
  html: `<section data-section-id="hero-fullscreen-visual" class="hero-fullscreen-visual">
  <div class="hero-fullscreen-visual__background">
    <img
      src="{{BACKGROUND_IMAGE_URL}}"
      alt="{{BACKGROUND_IMAGE_ALT}}"
      class="hero-fullscreen-visual__background-image"
      data-parallax="true"
    />
    <div class="hero-fullscreen-visual__overlay"></div>
  </div>
  <div class="hero-fullscreen-visual__content">
    <div class="hero-fullscreen-visual__inner">
      <span class="hero-fullscreen-visual__label">{{LABEL}}</span>
      <h1 class="hero-fullscreen-visual__heading">{{HEADING}}</h1>
      <p class="hero-fullscreen-visual__description">{{DESCRIPTION}}</p>
      <a href="{{CTA_URL}}" class="hero-fullscreen-visual__cta">{{CTA_TEXT}}</a>
    </div>
  </div>
  <div class="hero-fullscreen-visual__scroll-indicator">
    <span class="hero-fullscreen-visual__scroll-text">Scroll to explore</span>
    <svg class="hero-fullscreen-visual__scroll-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 5v14M12 19l-4-4M12 19l4-4"/>
    </svg>
  </div>
</section>`,
  css: `
.hero-fullscreen-visual {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-fullscreen-visual__background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-fullscreen-visual__background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  will-change: transform;
}

.hero-fullscreen-visual__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2;
}

.hero-fullscreen-visual__content {
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.hero-fullscreen-visual__inner {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-fullscreen-visual__label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
  font-family: var(--font-body);
}

.hero-fullscreen-visual__heading {
  font-size: 40px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.5px;
  font-family: var(--font-heading);
  color: white;
  margin: 0;
}

.hero-fullscreen-visual__description {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
}

.hero-fullscreen-visual__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: white;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 14px 32px;
  width: fit-content;
  margin: 0 auto;
  font-family: var(--font-body);
  transition: all 0.4s ease;
  background-color: transparent;
}

.hero-fullscreen-visual__cta:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
  color: white;
}

.hero-fullscreen-visual__scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.6);
  animation: hero-fullscreen-visual-bounce 2s infinite;
}

.hero-fullscreen-visual__scroll-text {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-family: var(--font-body);
}

.hero-fullscreen-visual__scroll-arrow {
  width: 20px;
  height: 20px;
  stroke: rgba(255, 255, 255, 0.6);
}

@keyframes hero-fullscreen-visual-bounce {
  0%, 100% {
    opacity: 0.4;
    transform: translateX(-50%) translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) translateY(8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-fullscreen-visual__scroll-indicator,
  .hero-fullscreen-visual * {
    animation: none !important;
    transition: none !important;
  }
}

@media (min-width: 768px) {
  .hero-fullscreen-visual__heading {
    font-size: 56px;
  }

  .hero-fullscreen-visual__description {
    font-size: 18px;
  }

  .hero-fullscreen-visual__inner {
    gap: 32px;
  }

  .hero-fullscreen-visual__scroll-indicator {
    bottom: 40px;
  }
}

@media (min-width: 1024px) {
  .hero-fullscreen-visual__heading {
    font-size: 72px;
    line-height: 1.1;
  }

  .hero-fullscreen-visual__description {
    font-size: 20px;
  }

  .hero-fullscreen-visual__inner {
    gap: 40px;
  }

  .hero-fullscreen-visual__cta {
    font-size: 14px;
    padding: 16px 40px;
  }
}
  `,
  placeholders: [
    {
      key: 'LABEL',
      type: 'text',
      description: 'Small label text above heading',
      defaultValue: 'Discover'
    },
    {
      key: 'HEADING',
      type: 'text',
      description: 'Main heading text',
      defaultValue: 'Experience the Extraordinary'
    },
    {
      key: 'DESCRIPTION',
      type: 'text',
      description: 'Description text',
      defaultValue: 'Immerse yourself in a world of innovation and design excellence'
    },
    {
      key: 'BACKGROUND_IMAGE_URL',
      type: 'image',
      description: 'Full-screen background image',
      defaultValue: 'https://images.unsplash.com/photo-1519163219861-ffd35e7f5542?w=1200&q=80'
    },
    {
      key: 'BACKGROUND_IMAGE_ALT',
      type: 'text',
      description: 'Background image alt text',
      defaultValue: 'Hero background'
    },
    {
      key: 'CTA_TEXT',
      type: 'text',
      description: 'Call-to-action button text',
      defaultValue: 'Get Started'
    },
    {
      key: 'CTA_URL',
      type: 'url',
      description: 'Call-to-action link destination',
      defaultValue: '/start'
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
      duration: '0.5s'
    }
  ] as AnimationDef[]
};

export { HERO_FULLSCREEN_VISUAL };
