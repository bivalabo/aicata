import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const FEATURES_STATS_COUNTER: SectionTemplate = {
  id: 'features-stats-counter',
  category: 'features' as SectionCategory,
  variant: 'grid' as SectionVariant,
  name: 'Stats Counter Section',
  description: 'Big number statistics showcase section. Displays impressive metrics with counter animations, perfect for highlighting business achievements.',
  tones: ['bold', 'modern', 'cool'] as DesignTone[],
  html: `<section data-section-id="features-stats-counter" class="features-stats-counter">
  <div class="features-stats-counter__container">
    <div class="features-stats-counter__header">
      <h2 class="features-stats-counter__title">{{SECTION_TITLE}}</h2>
      <p class="features-stats-counter__subtitle">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="features-stats-counter__grid">
      <div class="features-stats-counter__stat">
        <div class="features-stats-counter__number" data-target="{{STAT_1_VALUE}}">0</div>
        <p class="features-stats-counter__label">{{STAT_1_LABEL}}</p>
      </div>
      <div class="features-stats-counter__stat">
        <div class="features-stats-counter__number" data-target="{{STAT_2_VALUE}}">0</div>
        <p class="features-stats-counter__label">{{STAT_2_LABEL}}</p>
      </div>
      <div class="features-stats-counter__stat">
        <div class="features-stats-counter__number" data-target="{{STAT_3_VALUE}}">0</div>
        <p class="features-stats-counter__label">{{STAT_3_LABEL}}</p>
      </div>
      <div class="features-stats-counter__stat">
        <div class="features-stats-counter__number" data-target="{{STAT_4_VALUE}}">0</div>
        <p class="features-stats-counter__label">{{STAT_4_LABEL}}</p>
      </div>
    </div>
  </div>
</section>`,
  css: `
.features-stats-counter {
  width: 100%;
  padding: 60px 20px;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%);
  color: var(--color-text);
}

.features-stats-counter__container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-stats-counter__header {
  text-align: center;
  margin-bottom: 50px;
}

.features-stats-counter__title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px;
  font-family: var(--font-heading);
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.features-stats-counter__subtitle {
  font-size: 16px;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features-stats-counter__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}

.features-stats-counter__stat {
  text-align: center;
  padding: 40px 20px;
  background-color: rgba(var(--color-bg-rgb), 0.5);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.features-stats-counter__stat::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(var(--color-accent-rgb), 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.features-stats-counter__stat:hover {
  border-color: var(--color-accent);
  transform: translateY(-8px);
  background-color: rgba(var(--color-accent-rgb), 0.05);
}

.features-stats-counter__stat:hover::before {
  opacity: 1;
}

.features-stats-counter__number {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-accent);
  margin: 0 0 16px;
  font-family: var(--font-heading);
  letter-spacing: -1px;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.features-stats-counter__stat:hover .features-stats-counter__number {
  color: var(--color-text);
}

.features-stats-counter__label {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.features-stats-counter__stat:hover .features-stats-counter__label {
  color: var(--color-text);
}

@media (min-width: 768px) {
  .features-stats-counter {
    padding: 80px 40px;
  }

  .features-stats-counter__title {
    font-size: 40px;
  }

  .features-stats-counter__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }

  .features-stats-counter__stat {
    padding: 48px 32px;
  }

  .features-stats-counter__number {
    font-size: 56px;
  }
}

@media (min-width: 1024px) {
  .features-stats-counter {
    padding: 100px 60px;
  }

  .features-stats-counter__title {
    font-size: 48px;
  }

  .features-stats-counter__grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
  }

  .features-stats-counter__stat {
    padding: 56px 40px;
  }

  .features-stats-counter__number {
    font-size: 64px;
  }
}
  `,
  placeholders: [
    {
      key: 'SECTION_TITLE',
      type: 'text',
      description: 'Section heading',
      defaultValue: 'By The Numbers'
    },
    {
      key: 'SECTION_SUBTITLE',
      type: 'text',
      description: 'Section subtitle',
      defaultValue: 'Our impact and achievements across the globe'
    },
    {
      key: 'STAT_1_VALUE',
      type: 'text',
      description: 'First statistic numeric value (use plain number)',
      defaultValue: '10000'
    },
    {
      key: 'STAT_1_LABEL',
      type: 'text',
      description: 'First statistic label',
      defaultValue: 'Happy Customers'
    },
    {
      key: 'STAT_2_VALUE',
      type: 'text',
      description: 'Second statistic numeric value',
      defaultValue: '50'
    },
    {
      key: 'STAT_2_LABEL',
      type: 'text',
      description: 'Second statistic label',
      defaultValue: 'Countries Served'
    },
    {
      key: 'STAT_3_VALUE',
      type: 'text',
      description: 'Third statistic numeric value',
      defaultValue: '99'
    },
    {
      key: 'STAT_3_LABEL',
      type: 'text',
      description: 'Third statistic label',
      defaultValue: 'Percent Satisfaction'
    },
    {
      key: 'STAT_4_VALUE',
      type: 'text',
      description: 'Fourth statistic numeric value',
      defaultValue: '15'
    },
    {
      key: 'STAT_4_LABEL',
      type: 'text',
      description: 'Fourth statistic label',
      defaultValue: 'Years Of Excellence'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'scroll',
      type: 'fadeInUp',
      duration: '0.8s'
    },
    {
      trigger: 'scroll',
      type: 'countUp',
      duration: '2s'
    },
    {
      trigger: 'hover',
      type: 'lift',
      duration: '0.3s'
    }
  ] as AnimationDef[]
};

export { FEATURES_STATS_COUNTER };
