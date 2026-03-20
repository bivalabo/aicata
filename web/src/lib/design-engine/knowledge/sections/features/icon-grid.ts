import type { SectionTemplate } from '../../../types';

export const FEATURES_ICON_GRID: SectionTemplate = {
  id: 'features-icon-grid',
  category: 'features',
  variant: 'grid',
  name: 'Features Icon Grid',
  description: 'Three-column grid showcasing brand features with icon placeholders, titles, and descriptions. Includes subtle hover lift effect for enhanced interactivity.',
  tones: ['modern', 'minimal', 'elegant'],
  html: `
    <section data-section-id="features-icon-grid" class="features-icon-grid">
      <div class="features-icon-grid__container">
        <h2 class="features-icon-grid__heading">{{SECTION_HEADING}}</h2>

        <div class="features-icon-grid__grid">
          <div class="features-icon-grid__card">
            <div class="features-icon-grid__icon-wrapper">
              <svg
                class="features-icon-grid__icon"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="2" />
                <text
                  x="50"
                  y="55"
                  text-anchor="middle"
                  font-size="24"
                  font-weight="bold"
                  fill="currentColor"
                  opacity="0.3"
                >
                  1
                </text>
              </svg>
              <img
                src="{{FEATURE_1_ICON}}"
                alt="{{FEATURE_1_TITLE}}"
                class="features-icon-grid__custom-icon"
              />
            </div>
            <h3 class="features-icon-grid__title">{{FEATURE_1_TITLE}}</h3>
            <p class="features-icon-grid__description">{{FEATURE_1_DESCRIPTION}}</p>
          </div>

          <div class="features-icon-grid__card">
            <div class="features-icon-grid__icon-wrapper">
              <svg
                class="features-icon-grid__icon"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="2" />
                <text
                  x="50"
                  y="55"
                  text-anchor="middle"
                  font-size="24"
                  font-weight="bold"
                  fill="currentColor"
                  opacity="0.3"
                >
                  2
                </text>
              </svg>
              <img
                src="{{FEATURE_2_ICON}}"
                alt="{{FEATURE_2_TITLE}}"
                class="features-icon-grid__custom-icon"
              />
            </div>
            <h3 class="features-icon-grid__title">{{FEATURE_2_TITLE}}</h3>
            <p class="features-icon-grid__description">{{FEATURE_2_DESCRIPTION}}</p>
          </div>

          <div class="features-icon-grid__card">
            <div class="features-icon-grid__icon-wrapper">
              <svg
                class="features-icon-grid__icon"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="2" />
                <text
                  x="50"
                  y="55"
                  text-anchor="middle"
                  font-size="24"
                  font-weight="bold"
                  fill="currentColor"
                  opacity="0.3"
                >
                  3
                </text>
              </svg>
              <img
                src="{{FEATURE_3_ICON}}"
                alt="{{FEATURE_3_TITLE}}"
                class="features-icon-grid__custom-icon"
              />
            </div>
            <h3 class="features-icon-grid__title">{{FEATURE_3_TITLE}}</h3>
            <p class="features-icon-grid__description">{{FEATURE_3_DESCRIPTION}}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  css: `
    .features-icon-grid {
      background-color: var(--color-bg);
      color: var(--color-text);
      padding: 60px 20px;
    }

    .features-icon-grid__container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .features-icon-grid__heading {
      font-family: var(--font-heading);
      font-size: 28px;
      font-weight: 400;
      text-align: center;
      margin: 0 0 48px 0;
      letter-spacing: 0.8px;
      color: var(--color-text);
    }

    .features-icon-grid__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .features-icon-grid__card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .features-icon-grid__card:hover {
      transform: translateY(-8px);
    }

    .features-icon-grid__icon-wrapper {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 24px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .features-icon-grid__icon {
      width: 100%;
      height: 100%;
      color: var(--color-text);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .features-icon-grid__custom-icon {
      position: absolute;
      width: 50px;
      height: 50px;
      object-fit: contain;
      opacity: 0;
      transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .features-icon-grid__card:hover .features-icon-grid__icon {
      opacity: 0.15;
    }

    .features-icon-grid__card:hover .features-icon-grid__custom-icon {
      opacity: 1;
    }

    .features-icon-grid__title {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 12px 0;
      letter-spacing: 0.4px;
      color: var(--color-text);
      line-height: 1.4;
    }

    .features-icon-grid__description {
      font-family: var(--font-body);
      font-size: 13px;
      line-height: 1.7;
      color: var(--color-muted);
      margin: 0;
      max-width: 280px;
    }

    @media (min-width: 768px) {
      .features-icon-grid {
        padding: 80px 40px;
      }

      .features-icon-grid__heading {
        font-size: 32px;
        margin-bottom: 56px;
      }

      .features-icon-grid__grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 48px;
      }

      .features-icon-grid__card {
        padding: 32px 24px;
      }

      .features-icon-grid__icon-wrapper {
        width: 90px;
        height: 90px;
        margin-bottom: 28px;
      }

      .features-icon-grid__title {
        font-size: 17px;
      }

      .features-icon-grid__description {
        font-size: 14px;
      }
    }

    @media (min-width: 1024px) {
      .features-icon-grid {
        padding: 100px 60px;
      }

      .features-icon-grid__heading {
        font-size: 36px;
        margin-bottom: 64px;
        letter-spacing: 1px;
      }

      .features-icon-grid__grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 56px;
      }

      .features-icon-grid__card {
        padding: 40px 28px;
      }

      .features-icon-grid__icon-wrapper {
        width: 100px;
        height: 100px;
        margin-bottom: 32px;
      }

      .features-icon-grid__icon {
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .features-icon-grid__card:hover .features-icon-grid__icon {
        transform: scale(0.9) rotate(-5deg);
        opacity: 0.1;
      }

      .features-icon-grid__title {
        font-size: 18px;
        margin-bottom: 16px;
      }

      .features-icon-grid__description {
        font-size: 15px;
      }
    }
  `,
  placeholders: [
    {
      key: 'SECTION_HEADING',
      type: 'text',
      description: 'Main section heading',
      defaultValue: 'Why Choose Aicata'
    },
    {
      key: 'FEATURE_1_ICON',
      type: 'image',
      description: 'Icon or image for feature 1 (transparent background recommended)',
      defaultValue: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/%3E%3C/svg%3E'
    },
    {
      key: 'FEATURE_1_TITLE',
      type: 'text',
      description: 'Title for feature 1',
      defaultValue: 'Natural Ingredients'
    },
    {
      key: 'FEATURE_1_DESCRIPTION',
      type: 'text',
      description: 'Description for feature 1',
      defaultValue: 'Carefully sourced botanical extracts and pure, effective ingredients. No harsh chemicals or harmful additives.'
    },
    {
      key: 'FEATURE_2_ICON',
      type: 'image',
      description: 'Icon or image for feature 2 (transparent background recommended)',
      defaultValue: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/%3E%3C/svg%3E'
    },
    {
      key: 'FEATURE_2_TITLE',
      type: 'text',
      description: 'Title for feature 2',
      defaultValue: 'Cruelty-Free & Vegan'
    },
    {
      key: 'FEATURE_2_DESCRIPTION',
      type: 'text',
      description: 'Description for feature 2',
      defaultValue: 'Committed to ethical practices. All products are cruelty-free and formulated without animal-derived ingredients.'
    },
    {
      key: 'FEATURE_3_ICON',
      type: 'image',
      description: 'Icon or image for feature 3 (transparent background recommended)',
      defaultValue: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="currentColor" d="M12 2c-5.33 4.55-8 6.75-8 11 0 4.42 3.48 8 8 8s8-3.58 8-8c0-4.25-2.67-6.45-8-11zm0 18c-3.35 0-6-2.57-6-6 0-2.43 1.78-4.47 6-8.72 4.22 4.25 6 6.29 6 8.72 0 3.43-2.65 6-6 6z"/%3E%3C/svg%3E'
    },
    {
      key: 'FEATURE_3_TITLE',
      type: 'text',
      description: 'Title for feature 3',
      defaultValue: 'Sustainably Sourced'
    },
    {
      key: 'FEATURE_3_DESCRIPTION',
      type: 'text',
      description: 'Description for feature 3',
      defaultValue: 'Environmentally conscious sourcing and eco-friendly packaging. Supporting sustainable farming practices worldwide.'
    }
  ],
  animations: [
    {
      trigger: 'scroll',
      type: 'fade-in-up',
      duration: '0.8s',
      delay: '0.1s'
    },
    {
      trigger: 'hover',
      type: 'lift',
      duration: '0.4s'
    },
    {
      trigger: 'scroll',
      type: 'scale-in',
      duration: '0.6s',
      delay: '0.2s'
    }
  ]
};
