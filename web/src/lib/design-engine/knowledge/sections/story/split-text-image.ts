import type { SectionTemplate } from '../../../types';

export const STORY_SPLIT_TEXT_IMAGE: SectionTemplate = {
  id: 'story-split-text-image',
  category: 'story',
  variant: 'split',
  name: 'Story Split Text & Image',
  description: 'Alternating editorial-style layout with poetic text content and accompanying imagery. Features generous padding and subtle scroll animations for a luxurious brand storytelling experience.',
  tones: ['luxury', 'natural', 'elegant', 'warm'],
  html: `
    <section data-section-id="story-split-text-image" class="story-split-text-image">
      <div class="story-split-text-image__container">
        <div class="story-split-text-image__layout">
          <div class="story-split-text-image__text-section">
            <div class="story-split-text-image__content">
              <h2 class="story-split-text-image__heading">{{SECTION_HEADING}}</h2>
              <p class="story-split-text-image__body">
                {{SECTION_BODY}}
              </p>
              <a href="{{MORE_LINK_URL}}" class="story-split-text-image__link">
                {{MORE_LINK_TEXT}}
              </a>
            </div>
          </div>

          <div class="story-split-text-image__image-section">
            <div class="story-split-text-image__image-wrapper">
              <img
                src="{{SECTION_IMAGE}}"
                alt="{{SECTION_HEADING}}"
                class="story-split-text-image__image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  css: `
    .story-split-text-image {
      background-color: var(--color-bg);
      color: var(--color-text);
      padding: 80px 20px;
    }

    .story-split-text-image__container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .story-split-text-image__layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 48px;
      align-items: center;
    }

    .story-split-text-image__text-section {
      order: 1;
    }

    .story-split-text-image__image-section {
      order: 2;
    }

    .story-split-text-image__content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .story-split-text-image__heading {
      font-family: var(--font-heading);
      font-size: 32px;
      font-weight: 400;
      margin: 0;
      letter-spacing: 0.8px;
      line-height: 1.3;
      color: var(--color-text);
    }

    .story-split-text-image__body {
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.9;
      margin: 0;
      color: var(--color-text);
      letter-spacing: 0.2px;
    }

    .story-split-text-image__image-wrapper {
      overflow: hidden;
      aspect-ratio: 4 / 3;
      background: var(--color-muted);
    }

    .story-split-text-image__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .story-split-text-image__image-wrapper:hover .story-split-text-image__image {
      transform: scale(1.04);
    }

    .story-split-text-image__link {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 400;
      color: var(--color-text);
      text-decoration: none;
      letter-spacing: 0.6px;
      border-bottom: 1px solid var(--color-text);
      padding-bottom: 3px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-block;
      margin-top: 8px;
    }

    .story-split-text-image__link:hover {
      color: var(--color-accent);
      border-bottom-color: var(--color-accent);
      padding-bottom: 5px;
    }

    @media (min-width: 768px) {
      .story-split-text-image {
        padding: 100px 40px;
      }

      .story-split-text-image__layout {
        grid-template-columns: 1fr 1fr;
        gap: 60px;
      }

      .story-split-text-image__heading {
        font-size: 36px;
      }

      .story-split-text-image__body {
        font-size: 16px;
      }
    }

    @media (min-width: 1024px) {
      .story-split-text-image {
        padding: 120px 60px;
      }

      .story-split-text-image__layout {
        grid-template-columns: 1fr 1.2fr;
        gap: 80px;
      }

      .story-split-text-image__heading {
        font-size: 42px;
        line-height: 1.25;
      }

      .story-split-text-image__body {
        font-size: 17px;
        line-height: 2;
      }

      .story-split-text-image__content {
        gap: 32px;
      }
    }

    @media (min-width: 1200px) {
      .story-split-text-image__layout {
        grid-template-columns: 0.9fr 1.2fr;
        gap: 100px;
      }
    }
  `,
  placeholders: [
    {
      key: 'SECTION_HEADING',
      type: 'text',
      description: 'Main heading for the story section',
      defaultValue: 'Our Philosophy'
    },
    {
      key: 'SECTION_BODY',
      type: 'text',
      description: 'Poetic body text describing brand philosophy or story',
      defaultValue: 'We believe beauty is born from nature\'s wisdom combined with thoughtful innovation. Each product is crafted with reverence for the natural world, drawing inspiration from centuries-old botanical traditions while embracing modern skincare science. Our commitment extends beyond efficacy—it\'s about creating moments of mindfulness and self-care in your daily ritual.'
    },
    {
      key: 'SECTION_IMAGE',
      type: 'image',
      description: 'Image accompanying the story',
      defaultValue: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=600&fit=crop'
    },
    {
      key: 'MORE_LINK_TEXT',
      type: 'text',
      description: 'Text for the "read more" link',
      defaultValue: 'もっと見る'
    },
    {
      key: 'MORE_LINK_URL',
      type: 'url',
      description: 'URL for the "read more" link',
      defaultValue: '#'
    }
  ],
  animations: [
    {
      trigger: 'scroll',
      type: 'fade-in-up',
      duration: '0.9s',
      delay: '0.1s'
    },
    {
      trigger: 'scroll',
      type: 'parallax',
      duration: '1.2s',
      delay: '0s'
    },
    {
      trigger: 'scroll',
      type: 'fade-in-left',
      duration: '0.8s',
      delay: '0.2s'
    }
  ]
};
