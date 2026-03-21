import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const TRUST_BADGES_ICON_STRIP: SectionTemplate = {
  id: 'trust-badges-icon-strip',
  category: 'trust-badges',
  variant: 'minimal',
  name: 'Trust Badges Icon Strip',
  description: 'Horizontal strip of trust/guarantee badges: Free Shipping, Secure Payment, Money-back Guarantee, 24/7 Support. SVG-style icons.',
  tones: ['minimal', 'modern', 'warm'],

  html: `
<div data-section-id="trust-badges-icon-strip" class="trust-badges-icon-strip">
  <div class="trust-badges-icon-strip__container">
    <!-- Badge 1: Free Shipping -->
    <div class="trust-badges-icon-strip__badge">
      <div class="trust-badges-icon-strip__icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26 8H6L2 14v10c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2h16v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V14l-4-6zm-14 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm10 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="currentColor"/>
        </svg>
      </div>
      <div class="trust-badges-icon-strip__content">
        <h3 class="trust-badges-icon-strip__title">{{BADGE_1_TITLE}}</h3>
        <p class="trust-badges-icon-strip__description">{{BADGE_1_DESC}}</p>
      </div>
    </div>

    <!-- Badge 2: Secure Payment -->
    <div class="trust-badges-icon-strip__badge">
      <div class="trust-badges-icon-strip__icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L4 6v7c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-12-4zm0 20c-3.87-1.11-7-5.05-7-9V7.2l7-2.25 7 2.25V13c0 3.95-3.13 7.89-7 9zm2.45-11.5l-5 5L10 13.5l-1.41 1.41L13.45 19l6.5-6.5-1.45-1.41z" fill="currentColor"/>
        </svg>
      </div>
      <div class="trust-badges-icon-strip__content">
        <h3 class="trust-badges-icon-strip__title">{{BADGE_2_TITLE}}</h3>
        <p class="trust-badges-icon-strip__description">{{BADGE_2_DESC}}</p>
      </div>
    </div>

    <!-- Badge 3: Money-back Guarantee -->
    <div class="trust-badges-icon-strip__badge">
      <div class="trust-badges-icon-strip__icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.26 2 2 8.26 2 16s6.26 14 14 14 14-6.26 14-14S23.74 2 16 2zm0 26C9.37 28 4 22.63 4 16S9.37 4 16 4s12 5.37 12 12-5.37 12-12 12zm3.5-12c0 1.93-1.57 3.5-3.5 3.5S12.5 17.93 12.5 16 14.07 12.5 16 12.5s3.5 1.57 3.5 3.5z" fill="currentColor"/>
        </svg>
      </div>
      <div class="trust-badges-icon-strip__content">
        <h3 class="trust-badges-icon-strip__title">{{BADGE_3_TITLE}}</h3>
        <p class="trust-badges-icon-strip__description">{{BADGE_3_DESC}}</p>
      </div>
    </div>

    <!-- Badge 4: 24/7 Support -->
    <div class="trust-badges-icon-strip__badge">
      <div class="trust-badges-icon-strip__icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm0 26C9.37 28 4 22.63 4 16S9.37 4 16 4s12 5.37 12 12-5.37 12-12 12zm.5-13h-1v5h1v-5zm0-4h-1v1h1v-1z" fill="currentColor"/>
        </svg>
      </div>
      <div class="trust-badges-icon-strip__content">
        <h3 class="trust-badges-icon-strip__title">{{BADGE_4_TITLE}}</h3>
        <p class="trust-badges-icon-strip__description">{{BADGE_4_DESC}}</p>
      </div>
    </div>
  </div>
</div>
  `,

  css: `
.trust-badges-icon-strip {
  background: var(--color-bg);
  border-top: 1px solid rgba(var(--color-text-rgb), 0.08);
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.08);
  padding: 2rem 1.5rem;
}

.trust-badges-icon-strip__container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.trust-badges-icon-strip__badge {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  text-align: left;
  transition: all 0.3s ease;
}

.trust-badges-icon-strip__badge:hover {
  transform: translateY(-2px);
}

.trust-badges-icon-strip__icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-accent-rgb), 0.08);
  border-radius: 8px;
  color: var(--color-accent);
  transition: all 0.3s ease;
}

.trust-badges-icon-strip__badge:hover .trust-badges-icon-strip__icon {
  background: rgba(var(--color-accent-rgb), 0.15);
  transform: scale(1.1);
}

.trust-badges-icon-strip__icon svg {
  width: 24px;
  height: 24px;
}

.trust-badges-icon-strip__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.trust-badges-icon-strip__title {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.trust-badges-icon-strip__description {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: rgba(var(--color-text-rgb), 0.65);
  margin: 0;
  line-height: 1.4;
}

/* Mobile */
@media (max-width: 640px) {
  .trust-badges-icon-strip {
    padding: 1.5rem 1rem;
  }

  .trust-badges-icon-strip__container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .trust-badges-icon-strip__icon {
    width: 40px;
    height: 40px;
  }

  .trust-badges-icon-strip__icon svg {
    width: 20px;
    height: 20px;
  }

  .trust-badges-icon-strip__title {
    font-size: 0.9rem;
  }

  .trust-badges-icon-strip__description {
    font-size: 0.8rem;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .trust-badges-icon-strip {
    padding: 2.5rem 2rem;
  }

  .trust-badges-icon-strip__container {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .trust-badges-icon-strip {
    padding: 3rem 2rem;
  }

  .trust-badges-icon-strip__container {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }

  .trust-badges-icon-strip__icon {
    width: 56px;
    height: 56px;
  }

  .trust-badges-icon-strip__icon svg {
    width: 28px;
    height: 28px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .trust-badges-icon-strip__badge,
  .trust-badges-icon-strip__icon {
    transition: none;
  }
}
  `,

  placeholders: [
    { key: 'BADGE_1_TITLE', type: 'text', description: 'Badge 1 title', defaultValue: 'Free Shipping' },
    { key: 'BADGE_1_DESC', type: 'text', description: 'Badge 1 description', defaultValue: 'On orders over $100' },
    { key: 'BADGE_2_TITLE', type: 'text', description: 'Badge 2 title', defaultValue: 'Secure Payment' },
    { key: 'BADGE_2_DESC', type: 'text', description: 'Badge 2 description', defaultValue: 'Encrypted & protected' },
    { key: 'BADGE_3_TITLE', type: 'text', description: 'Badge 3 title', defaultValue: 'Money-back Guarantee' },
    { key: 'BADGE_3_DESC', type: 'text', description: 'Badge 3 description', defaultValue: '30 days guaranteed' },
    { key: 'BADGE_4_TITLE', type: 'text', description: 'Badge 4 title', defaultValue: '24/7 Support' },
    { key: 'BADGE_4_DESC', type: 'text', description: 'Badge 4 description', defaultValue: 'Always here to help' },
  ],

  animations: [
    { trigger: 'hover', type: 'badge-lift-up', duration: '0.3s', delay: '0s' },
    { trigger: 'load', type: 'fade-in-up', duration: '0.4s', delay: '0.1s' },
  ],
};

export { TRUST_BADGES_ICON_STRIP };
