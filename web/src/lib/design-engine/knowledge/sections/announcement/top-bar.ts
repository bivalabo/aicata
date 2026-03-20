import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const ANNOUNCEMENT_TOP_BAR: SectionTemplate = {
  id: 'announcement-top-bar',
  category: 'announcement',
  variant: 'minimal',
  name: 'Announcement Top Bar',
  description: 'Slim announcement bar at top of page with text + optional link. Dismissible (CSS checkbox).',
  tones: ['modern', 'bold', 'minimal'],

  html: `
<div data-section-id="announcement-top-bar" class="announcement-top-bar">
  <input type="checkbox" id="announcement-dismiss" class="announcement-top-bar__dismiss-toggle" />

  <div class="announcement-top-bar__content">
    <p class="announcement-top-bar__text">
      {{ANNOUNCEMENT_TEXT}}
      <a href="{{ANNOUNCEMENT_LINK_URL}}" class="announcement-top-bar__link">{{ANNOUNCEMENT_LINK_TEXT}}</a>
    </p>
  </div>

  <label for="announcement-dismiss" class="announcement-top-bar__close" aria-label="Close announcement">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="m4 4 10 10M14 4 4 14" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
  </label>
</div>
  `,

  css: `
.announcement-top-bar {
  background: var(--color-accent);
  color: var(--color-bg);
  padding: 0.75rem 1.5rem;
  text-align: center;
  position: relative;
  z-index: 95;
  transition: all 0.3s ease;
  max-height: 100px;
  overflow: hidden;
}

.announcement-top-bar__dismiss-toggle {
  display: none;
}

.announcement-top-bar__dismiss-toggle:checked ~ .announcement-top-bar__content,
.announcement-top-bar__dismiss-toggle:checked ~ .announcement-top-bar__close {
  display: none;
}

.announcement-top-bar__dismiss-toggle:checked {
  ~ .announcement-top-bar {
    max-height: 0;
    padding: 0;
    border: none;
  }
}

.announcement-top-bar__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.announcement-top-bar__text {
  margin: 0;
  padding: 0;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.02em;
}

.announcement-top-bar__link {
  color: var(--color-bg);
  text-decoration: none;
  font-weight: 600;
  position: relative;
  transition: opacity 0.2s ease;
  display: inline;
}

.announcement-top-bar__link::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-bg);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.announcement-top-bar__link:hover {
  opacity: 0.9;
}

.announcement-top-bar__link:hover::after {
  opacity: 1;
}

.announcement-top-bar__close {
  position: absolute;
  top: 50%;
  right: 1.5rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.announcement-top-bar__close:hover {
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 640px) {
  .announcement-top-bar {
    padding: 0.6rem 1rem;
  }

  .announcement-top-bar__text {
    font-size: 0.85rem;
  }

  .announcement-top-bar__close {
    right: 1rem;
  }
}

@media (min-width: 1024px) {
  .announcement-top-bar {
    padding: 0.9rem 2rem;
  }

  .announcement-top-bar__text {
    font-size: 0.95rem;
  }

  .announcement-top-bar__close {
    right: 2rem;
  }
}
  `,

  placeholders: [
    { key: 'ANNOUNCEMENT_TEXT', type: 'text', description: 'Main announcement text', defaultValue: 'Free shipping on orders over $100.' },
    { key: 'ANNOUNCEMENT_LINK_TEXT', type: 'text', description: 'Link text', defaultValue: 'Shop Now' },
    { key: 'ANNOUNCEMENT_LINK_URL', type: 'url', description: 'Link URL', defaultValue: '/shop' },
  ],

  animations: [
    { trigger: 'load', type: 'fade-in-down', duration: '0.4s', delay: '0s' },
    { trigger: 'hover', type: 'link-underline-expand', duration: '0.2s', delay: '0s' },
  ],
};

export { ANNOUNCEMENT_TOP_BAR };
