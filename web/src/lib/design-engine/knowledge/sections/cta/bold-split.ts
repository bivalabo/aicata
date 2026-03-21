import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const CTA_BOLD_SPLIT: SectionTemplate = {
  id: 'cta-bold-split',
  category: 'cta' as SectionCategory,
  variant: 'split' as SectionVariant,
  name: 'Bold Split CTA',
  description: 'Bold split call-to-action with dark/colored background, large typography, and strong action buttons. Perfect for tech and modern brands.',
  tones: ['bold', 'modern', 'cool'] as DesignTone[],
  html: `<section data-section-id="cta-bold-split" class="cta-bold-split">
  <div class="cta-bold-split__background">
    <div class="cta-bold-split__shape cta-bold-split__shape--1"></div>
    <div class="cta-bold-split__shape cta-bold-split__shape--2"></div>
  </div>
  <div class="cta-bold-split__container">
    <div class="cta-bold-split__content">
      <span class="cta-bold-split__label">{{LABEL}}</span>
      <h2 class="cta-bold-split__heading">{{HEADING}}</h2>
      <p class="cta-bold-split__subheading">{{SUBHEADING}}</p>
      <ul class="cta-bold-split__features">
        <li class="cta-bold-split__feature-item">{{FEATURE_1}}</li>
        <li class="cta-bold-split__feature-item">{{FEATURE_2}}</li>
        <li class="cta-bold-split__feature-item">{{FEATURE_3}}</li>
      </ul>
    </div>
    <div class="cta-bold-split__actions">
      <a href="{{PRIMARY_CTA_URL}}" class="cta-bold-split__button cta-bold-split__button--primary">{{PRIMARY_CTA_TEXT}}</a>
      <a href="{{SECONDARY_CTA_URL}}" class="cta-bold-split__button cta-bold-split__button--secondary">{{SECONDARY_CTA_TEXT}}</a>
    </div>
  </div>
</section>`,
  css: `
.cta-bold-split {
  position: relative;
  width: 100%;
  padding: 60px 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  overflow: hidden;
}

.cta-bold-split__background {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  opacity: 0.1;
  z-index: 0;
}

.cta-bold-split__shape {
  position: absolute;
  border-radius: 50%;
}

.cta-bold-split__shape--1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  background: radial-gradient(circle, var(--color-accent), transparent);
}

.cta-bold-split__shape--2 {
  width: 300px;
  height: 300px;
  bottom: -80px;
  right: 20%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
}

.cta-bold-split__container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
}

.cta-bold-split__content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cta-bold-split__label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-accent);
  font-family: var(--font-body);
}

.cta-bold-split__heading {
  font-size: 40px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -1px;
  font-family: var(--font-heading);
  color: #ffffff;
  margin: 0;
}

.cta-bold-split__subheading {
  font-size: 18px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  max-width: 500px;
}

.cta-bold-split__features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cta-bold-split__feature-item {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--font-body);
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 12px;
}

.cta-bold-split__feature-item::before {
  content: '✓';
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: var(--color-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #ffffff;
  font-weight: 700;
  flex-shrink: 0;
}

.cta-bold-split__actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cta-bold-split__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 40px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  cursor: pointer;
  width: 100%;
}

.cta-bold-split__button--primary {
  background-color: var(--color-accent);
  color: #ffffff;
  border-color: var(--color-accent);
}

.cta-bold-split__button--primary:hover {
  background-color: transparent;
  color: var(--color-accent);
  box-shadow: 0 0 20px rgba(var(--color-accent-rgb), 0.3);
  transform: translateY(-3px);
}

.cta-bold-split__button--secondary {
  background-color: transparent;
  color: #ffffff;
  border-color: #ffffff;
}

.cta-bold-split__button--secondary:hover {
  background-color: #ffffff;
  color: #1a1a2e;
  transform: translateY(-3px);
}

@media (min-width: 768px) {
  .cta-bold-split {
    padding: 80px 40px;
  }

  .cta-bold-split__container {
    grid-template-columns: 1.2fr 1fr;
    gap: 60px;
  }

  .cta-bold-split__heading {
    font-size: 52px;
  }

  .cta-bold-split__subheading {
    font-size: 19px;
  }

  .cta-bold-split__actions {
    flex-direction: row;
  }

  .cta-bold-split__button {
    width: auto;
  }
}

@media (min-width: 1024px) {
  .cta-bold-split {
    padding: 120px 60px;
  }

  .cta-bold-split__container {
    grid-template-columns: 1.3fr 1fr;
    gap: 80px;
  }

  .cta-bold-split__heading {
    font-size: 64px;
  }

  .cta-bold-split__subheading {
    font-size: 20px;
    line-height: 1.7;
  }

  .cta-bold-split__content {
    gap: 32px;
  }

  .cta-bold-split__button {
    padding: 18px 48px;
    font-size: 16px;
  }
}
  `,
  placeholders: [
    {
      key: 'LABEL',
      type: 'text',
      description: 'Small accent label',
      defaultValue: 'Ready to Transform'
    },
    {
      key: 'HEADING',
      type: 'text',
      description: 'Main CTA heading',
      defaultValue: 'Take Action Today'
    },
    {
      key: 'SUBHEADING',
      type: 'text',
      description: 'Subheading or description',
      defaultValue: 'Join thousands of innovators leveraging our platform to achieve remarkable results. Start your journey in minutes.'
    },
    {
      key: 'FEATURE_1',
      type: 'text',
      description: 'First feature highlight',
      defaultValue: 'No credit card required'
    },
    {
      key: 'FEATURE_2',
      type: 'text',
      description: 'Second feature highlight',
      defaultValue: '24/7 customer support'
    },
    {
      key: 'FEATURE_3',
      type: 'text',
      description: 'Third feature highlight',
      defaultValue: 'Free 30-day trial'
    },
    {
      key: 'PRIMARY_CTA_TEXT',
      type: 'text',
      description: 'Primary button text',
      defaultValue: 'Get Started Now'
    },
    {
      key: 'PRIMARY_CTA_URL',
      type: 'url',
      description: 'Primary button link',
      defaultValue: '/signup'
    },
    {
      key: 'SECONDARY_CTA_TEXT',
      type: 'text',
      description: 'Secondary button text',
      defaultValue: 'Schedule Demo'
    },
    {
      key: 'SECONDARY_CTA_URL',
      type: 'url',
      description: 'Secondary button link',
      defaultValue: '/demo'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'load',
      type: 'fadeInLeft',
      duration: '0.8s',
      delay: '0s'
    },
    {
      trigger: 'scroll',
      type: 'slideInRight',
      duration: '0.8s'
    },
    {
      trigger: 'hover',
      type: 'lift',
      duration: '0.3s'
    }
  ] as AnimationDef[]
};

export { CTA_BOLD_SPLIT };
