import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const BREADCRUMB_SIMPLE_PATH: SectionTemplate = {
  id: 'breadcrumb-simple-path',
  category: 'breadcrumb',
  variant: 'minimal',
  name: 'Simple Breadcrumb Path',
  description: 'Simple breadcrumb: Home > Category > Subcategory > Current page. Subtle, small text.',
  tones: ['minimal', 'modern', 'elegant'],

  html: `
<nav data-section-id="breadcrumb-simple-path" class="breadcrumb-simple-path" aria-label="Breadcrumb">
  <ol class="breadcrumb-simple-path__list">
    <li class="breadcrumb-simple-path__item">
      <a href="{{HOME_URL}}" class="breadcrumb-simple-path__link">{{HOME_TEXT}}</a>
      <span class="breadcrumb-simple-path__separator" aria-hidden="true">/</span>
    </li>
    <li class="breadcrumb-simple-path__item">
      <a href="{{CATEGORY_URL}}" class="breadcrumb-simple-path__link">{{CATEGORY_TEXT}}</a>
      <span class="breadcrumb-simple-path__separator" aria-hidden="true">/</span>
    </li>
    <li class="breadcrumb-simple-path__item">
      <a href="{{SUBCATEGORY_URL}}" class="breadcrumb-simple-path__link">{{SUBCATEGORY_TEXT}}</a>
      <span class="breadcrumb-simple-path__separator" aria-hidden="true">/</span>
    </li>
    <li class="breadcrumb-simple-path__item breadcrumb-simple-path__item--current" aria-current="page">
      {{CURRENT_PAGE_TEXT}}
    </li>
  </ol>
</nav>
  `,

  css: `
.breadcrumb-simple-path {
  background: transparent;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(var(--color-text-rgb), 0.06);
}

.breadcrumb-simple-path__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  max-width: 1400px;
  margin: 0 auto;
}

.breadcrumb-simple-path__item {
  display: flex;
  align-items: center;
  gap: 0;
}

.breadcrumb-simple-path__link {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: rgba(var(--color-text-rgb), 0.65);
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.25rem 0.5rem;
  position: relative;
}

.breadcrumb-simple-path__link::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0.5rem;
  right: 0.5rem;
  height: 1px;
  background: rgba(var(--color-text-rgb), 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.breadcrumb-simple-path__link:hover {
  color: var(--color-accent);
}

.breadcrumb-simple-path__link:hover::after {
  opacity: 1;
}

.breadcrumb-simple-path__separator {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: rgba(var(--color-text-rgb), 0.4);
  margin: 0 0.25rem;
  padding: 0 0.25rem;
}

.breadcrumb-simple-path__item--current {
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
}

.breadcrumb-simple-path__item--current::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-accent);
  opacity: 0;
}

/* Mobile */
@media (max-width: 640px) {
  .breadcrumb-simple-path {
    padding: 0.75rem 1rem;
  }

  .breadcrumb-simple-path__link {
    font-size: 0.8rem;
    padding: 0.2rem 0.35rem;
  }

  .breadcrumb-simple-path__separator {
    font-size: 0.8rem;
    margin: 0 0.15rem;
    padding: 0 0.15rem;
  }

  .breadcrumb-simple-path__item--current {
    font-size: 0.8rem;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .breadcrumb-simple-path {
    padding: 1.25rem 2rem;
  }

  .breadcrumb-simple-path__link {
    font-size: 0.875rem;
  }

  .breadcrumb-simple-path__separator {
    font-size: 0.875rem;
  }

  .breadcrumb-simple-path__item--current {
    font-size: 0.875rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .breadcrumb-simple-path {
    padding: 1.5rem 2rem;
  }

  .breadcrumb-simple-path__link {
    font-size: 0.9rem;
  }

  .breadcrumb-simple-path__separator {
    font-size: 0.9rem;
  }

  .breadcrumb-simple-path__item--current {
    font-size: 0.9rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .breadcrumb-simple-path__link,
  .breadcrumb-simple-path__link::after {
    transition: none;
  }
}
  `,

  placeholders: [
    { key: 'HOME_TEXT', type: 'text', description: 'Home link text', defaultValue: 'Home' },
    { key: 'HOME_URL', type: 'url', description: 'Home link URL', defaultValue: '/' },
    { key: 'CATEGORY_TEXT', type: 'text', description: 'Category link text', defaultValue: 'Women' },
    { key: 'CATEGORY_URL', type: 'url', description: 'Category link URL', defaultValue: '/collections/women' },
    { key: 'SUBCATEGORY_TEXT', type: 'text', description: 'Subcategory link text', defaultValue: 'Dresses' },
    { key: 'SUBCATEGORY_URL', type: 'url', description: 'Subcategory link URL', defaultValue: '/collections/women/dresses' },
    { key: 'CURRENT_PAGE_TEXT', type: 'text', description: 'Current page text', defaultValue: 'Summer Dresses' },
  ],

  animations: [
    { trigger: 'load', type: 'fade-in', duration: '0.3s', delay: '0s' },
    { trigger: 'hover', type: 'link-underline-expand', duration: '0.2s', delay: '0s' },
  ],
};

export { BREADCRUMB_SIMPLE_PATH };
