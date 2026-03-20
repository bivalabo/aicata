import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const STORY_TIMELINE_VERTICAL: SectionTemplate = {
  id: 'story-timeline-vertical',
  category: 'story' as SectionCategory,
  variant: 'centered' as SectionVariant,
  name: 'Vertical Timeline Story',
  description: 'Vertical timeline for brand history or company milestones with alternating left-right layout. Perfect for heritage and growth narratives.',
  tones: ['elegant', 'traditional', 'modern'] as DesignTone[],
  html: `<section data-section-id="story-timeline-vertical" class="story-timeline-vertical">
  <div class="story-timeline-vertical__container">
    <div class="story-timeline-vertical__header">
      <h2 class="story-timeline-vertical__title">{{SECTION_TITLE}}</h2>
      <p class="story-timeline-vertical__subtitle">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="story-timeline-vertical__timeline">
      <div class="story-timeline-vertical__item story-timeline-vertical__item--left">
        <div class="story-timeline-vertical__card">
          <h3 class="story-timeline-vertical__year">{{YEAR_1}}</h3>
          <h4 class="story-timeline-vertical__milestone">{{MILESTONE_1}}</h4>
          <p class="story-timeline-vertical__description">{{DESCRIPTION_1}}</p>
        </div>
        <div class="story-timeline-vertical__marker"></div>
      </div>
      <div class="story-timeline-vertical__item story-timeline-vertical__item--right">
        <div class="story-timeline-vertical__marker"></div>
        <div class="story-timeline-vertical__card">
          <h3 class="story-timeline-vertical__year">{{YEAR_2}}</h3>
          <h4 class="story-timeline-vertical__milestone">{{MILESTONE_2}}</h4>
          <p class="story-timeline-vertical__description">{{DESCRIPTION_2}}</p>
        </div>
      </div>
      <div class="story-timeline-vertical__item story-timeline-vertical__item--left">
        <div class="story-timeline-vertical__card">
          <h3 class="story-timeline-vertical__year">{{YEAR_3}}</h3>
          <h4 class="story-timeline-vertical__milestone">{{MILESTONE_3}}</h4>
          <p class="story-timeline-vertical__description">{{DESCRIPTION_3}}</p>
        </div>
        <div class="story-timeline-vertical__marker"></div>
      </div>
      <div class="story-timeline-vertical__item story-timeline-vertical__item--right">
        <div class="story-timeline-vertical__marker"></div>
        <div class="story-timeline-vertical__card">
          <h3 class="story-timeline-vertical__year">{{YEAR_4}}</h3>
          <h4 class="story-timeline-vertical__milestone">{{MILESTONE_4}}</h4>
          <p class="story-timeline-vertical__description">{{DESCRIPTION_4}}</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
  css: `
.story-timeline-vertical {
  width: 100%;
  padding: 60px 20px;
  background-color: var(--color-bg);
  color: var(--color-text);
}

.story-timeline-vertical__container {
  max-width: 900px;
  margin: 0 auto;
}

.story-timeline-vertical__header {
  text-align: center;
  margin-bottom: 60px;
}

.story-timeline-vertical__title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px;
  font-family: var(--font-heading);
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.story-timeline-vertical__subtitle {
  font-size: 16px;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.story-timeline-vertical__timeline {
  position: relative;
  padding: 0;
}

.story-timeline-vertical__timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--color-accent), var(--color-accent) 50%, transparent 100%);
  transform: translateX(-1px);
}

.story-timeline-vertical__item {
  display: grid;
  grid-template-columns: 1fr 60px;
  gap: 20px;
  margin-bottom: 50px;
  align-items: center;
  position: relative;
}

.story-timeline-vertical__item--left {
  text-align: right;
}

.story-timeline-vertical__item--left .story-timeline-vertical__marker {
  order: 2;
}

.story-timeline-vertical__item--left .story-timeline-vertical__card {
  order: 1;
}

.story-timeline-vertical__item--right {
  grid-template-columns: 60px 1fr;
  text-align: left;
}

.story-timeline-vertical__item--right .story-timeline-vertical__marker {
  order: 1;
}

.story-timeline-vertical__item--right .story-timeline-vertical__card {
  order: 2;
}

.story-timeline-vertical__marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--color-accent);
  border: 3px solid var(--color-bg);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 3px var(--color-accent);
  opacity: 0.3;
  transition: all 0.3s ease;
  z-index: 1;
}

.story-timeline-vertical__item:hover .story-timeline-vertical__marker {
  width: 24px;
  height: 24px;
  opacity: 1;
  box-shadow: 0 0 0 3px var(--color-accent), 0 0 20px rgba(var(--color-accent-rgb), 0.3);
}

.story-timeline-vertical__card {
  background-color: var(--color-surface);
  padding: 28px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.story-timeline-vertical__item--left .story-timeline-vertical__card {
  border-left: none;
  border-right: 3px solid var(--color-accent);
}

.story-timeline-vertical__item--right .story-timeline-vertical__card {
  border-left: 3px solid var(--color-accent);
}

.story-timeline-vertical__card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
}

.story-timeline-vertical__year {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-accent);
  margin: 0 0 8px;
  font-family: var(--font-body);
}

.story-timeline-vertical__milestone {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--color-text);
  font-family: var(--font-heading);
}

.story-timeline-vertical__description {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
}

@media (max-width: 767px) {
  .story-timeline-vertical__timeline::before {
    left: 20px;
  }

  .story-timeline-vertical__item {
    grid-template-columns: 60px 1fr;
    text-align: left;
  }

  .story-timeline-vertical__item--left {
    text-align: left;
  }

  .story-timeline-vertical__item--left .story-timeline-vertical__marker {
    order: unset;
  }

  .story-timeline-vertical__item--left .story-timeline-vertical__card {
    order: unset;
    border-left: 3px solid var(--color-accent);
    border-right: none;
  }

  .story-timeline-vertical__item--right {
    grid-template-columns: 60px 1fr;
  }

  .story-timeline-vertical__marker {
    left: 20px;
  }
}

@media (min-width: 768px) {
  .story-timeline-vertical {
    padding: 80px 40px;
  }

  .story-timeline-vertical__title {
    font-size: 40px;
  }

  .story-timeline-vertical__item {
    margin-bottom: 60px;
  }

  .story-timeline-vertical__card {
    padding: 32px;
  }

  .story-timeline-vertical__milestone {
    font-size: 22px;
  }

  .story-timeline-vertical__description {
    font-size: 16px;
  }
}

@media (min-width: 1024px) {
  .story-timeline-vertical {
    padding: 100px 60px;
  }

  .story-timeline-vertical__title {
    font-size: 48px;
  }

  .story-timeline-vertical__item {
    margin-bottom: 70px;
  }

  .story-timeline-vertical__card {
    padding: 36px;
  }

  .story-timeline-vertical__milestone {
    font-size: 24px;
  }

  .story-timeline-vertical__description {
    font-size: 17px;
    line-height: 1.7;
  }
}
  `,
  placeholders: [
    {
      key: 'SECTION_TITLE',
      type: 'text',
      description: 'Timeline section heading',
      defaultValue: 'Our Journey'
    },
    {
      key: 'SECTION_SUBTITLE',
      type: 'text',
      description: 'Timeline section subtitle',
      defaultValue: 'Follow the milestones that shaped our brand'
    },
    {
      key: 'YEAR_1',
      type: 'text',
      description: 'First timeline entry year',
      defaultValue: '2010'
    },
    {
      key: 'MILESTONE_1',
      type: 'text',
      description: 'First milestone title',
      defaultValue: 'Founded with Vision'
    },
    {
      key: 'DESCRIPTION_1',
      type: 'text',
      description: 'First milestone description',
      defaultValue: 'We started with a simple idea: create timeless products that stand the test of time.'
    },
    {
      key: 'YEAR_2',
      type: 'text',
      description: 'Second timeline entry year',
      defaultValue: '2014'
    },
    {
      key: 'MILESTONE_2',
      type: 'text',
      description: 'Second milestone title',
      defaultValue: 'Global Recognition'
    },
    {
      key: 'DESCRIPTION_2',
      type: 'text',
      description: 'Second milestone description',
      defaultValue: 'Our dedication to quality earned us recognition from industry leaders worldwide.'
    },
    {
      key: 'YEAR_3',
      type: 'text',
      description: 'Third timeline entry year',
      defaultValue: '2018'
    },
    {
      key: 'MILESTONE_3',
      type: 'text',
      description: 'Third milestone title',
      defaultValue: 'Sustainability Initiative'
    },
    {
      key: 'DESCRIPTION_3',
      type: 'text',
      description: 'Third milestone description',
      defaultValue: 'We committed to carbon-neutral operations and sustainable sourcing across all production.'
    },
    {
      key: 'YEAR_4',
      type: 'text',
      description: 'Fourth timeline entry year',
      defaultValue: '2024'
    },
    {
      key: 'MILESTONE_4',
      type: 'text',
      description: 'Fourth milestone title',
      defaultValue: 'Industry Leading'
    },
    {
      key: 'DESCRIPTION_4',
      type: 'text',
      description: 'Fourth milestone description',
      defaultValue: 'Today, we serve millions of customers with our premium collections across 50+ countries.'
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

export { STORY_TIMELINE_VERTICAL };
