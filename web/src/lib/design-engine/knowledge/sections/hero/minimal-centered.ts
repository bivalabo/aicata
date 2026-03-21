import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const HERO_MINIMAL_CENTERED: SectionTemplate = {
  id: 'hero-minimal-centered',
  category: 'hero' as SectionCategory,
  variant: 'centered' as SectionVariant,
  name: 'Minimal Centered Hero',
  description: 'Clean, minimal layout with centered text on a light background. Features elegant serif headings with generous whitespace and a subtle animated underline on the CTA.',
  tones: ['minimal', 'elegant', 'modern'] as DesignTone[],
  html: `<section data-section-id="hero-minimal-centered" class="hero-minimal-centered">
  <div class="hero-minimal-centered__wrapper">
    <div class="hero-minimal-centered__content">
      <h1 class="hero-minimal-centered__heading">{{HEADING}}</h1>
      <p class="hero-minimal-centered__description">{{DESCRIPTION}}</p>
      <a href="{{CTA_URL}}" class="hero-minimal-centered__cta">
        <span class="hero-minimal-centered__cta-text">{{CTA_TEXT}}</span>
        <span class="hero-minimal-centered__cta-underline"></span>
      </a>
    </div>
  </div>
</section>`,
  css: `
.hero-minimal-centered {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  color: var(--color-text);
  padding: 60px 20px;
  overflow: hidden;
}

.hero-minimal-centered__wrapper {
  width: 100%;
  max-width: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-minimal-centered__content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
}

.hero-minimal-centered__heading {
  font-size: 36px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.3px;
  font-family: var(--font-heading);
  color: var(--color-text);
  margin: 0;
  word-spacing: 0.1em;
}

.hero-minimal-centered__description {
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  letter-spacing: 0.3px;
}

.hero-minimal-centered__cta {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  width: fit-content;
  margin: 0 auto;
  cursor: pointer;
  transition: all 0.4s ease;
}

.hero-minimal-centered__cta-text {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--color-text);
  font-family: var(--font-body);
  transition: color 0.4s ease;
}

.hero-minimal-centered__cta-underline {
  display: block;
  height: 1px;
  width: 0;
  background-color: var(--color-accent, var(--color-text));
  transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.hero-minimal-centered__cta:hover .hero-minimal-centered__cta-text {
  color: var(--color-accent, var(--color-text));
}

.hero-minimal-centered__cta:hover .hero-minimal-centered__cta-underline {
  width: 100%;
}

@media (min-width: 640px) {
  .hero-minimal-centered {
    padding: 80px 40px;
    min-height: 90vh;
  }

  .hero-minimal-centered__heading {
    font-size: 48px;
    line-height: 1.2;
  }

  .hero-minimal-centered__description {
    font-size: 18px;
    line-height: 1.75;
  }

  .hero-minimal-centered__content {
    gap: 40px;
  }
}

@media (min-width: 768px) {
  .hero-minimal-centered {
    padding: 100px 40px;
    min-height: 85vh;
  }

  .hero-minimal-centered__heading {
    font-size: 56px;
    line-height: 1.15;
  }

  .hero-minimal-centered__description {
    font-size: 20px;
    line-height: 1.8;
  }

  .hero-minimal-centered__content {
    gap: 48px;
  }
}

@media (min-width: 1024px) {
  .hero-minimal-centered {
    padding: 120px 60px;
    min-height: 80vh;
  }

  .hero-minimal-centered__heading {
    font-size: 64px;
    line-height: 1.12;
  }

  .hero-minimal-centered__description {
    font-size: 22px;
    line-height: 1.85;
  }

  .hero-minimal-centered__content {
    gap: 56px;
  }

  .hero-minimal-centered__cta-text {
    font-size: 15px;
  }
}

@media (min-width: 1440px) {
  .hero-minimal-centered__heading {
    font-size: 72px;
    line-height: 1.1;
  }

  .hero-minimal-centered__description {
    font-size: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-minimal-centered__cta,
  .hero-minimal-centered__cta-text,
  .hero-minimal-centered__cta-underline {
    transition: none;
  }
}
  `,
  placeholders: [
    {
      key: 'HEADING',
      type: 'text',
      description: 'Main heading text',
      defaultValue: 'Simplicity is the Ultimate Sophistication'
    },
    {
      key: 'DESCRIPTION',
      type: 'text',
      description: 'Description text below heading',
      defaultValue: 'A carefully considered approach to design that prioritizes clarity, purpose, and the beauty of essential elements.'
    },
    {
      key: 'CTA_TEXT',
      type: 'text',
      description: 'Call-to-action button text',
      defaultValue: 'Begin'
    },
    {
      key: 'CTA_URL',
      type: 'url',
      description: 'Call-to-action link destination',
      defaultValue: '/'
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
      trigger: 'hover',
      type: 'underlineExpand',
      duration: '0.6s'
    }
  ] as AnimationDef[]
};

export { HERO_MINIMAL_CENTERED };
