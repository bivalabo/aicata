import type { SectionTemplate } from '../../../types';

export const CTA_NEWSLETTER_MINIMAL: SectionTemplate = {
  id: 'cta-newsletter-minimal',
  category: 'newsletter',
  variant: 'minimal',
  name: 'Newsletter Minimal',
  description: 'Clean and elegant newsletter signup section with inline input and button',
  tones: ['minimal', 'elegant', 'modern'],
  html: `
    <section data-section-id="cta-newsletter-minimal" class="cta-newsletter-minimal">
      <div class="cta-newsletter-minimal__container">
        <div class="cta-newsletter-minimal__content">
          <h2 class="cta-newsletter-minimal__heading">{{NEWSLETTER_HEADING}}</h2>
          <p class="cta-newsletter-minimal__description">{{NEWSLETTER_DESCRIPTION}}</p>
        </div>

        <form class="cta-newsletter-minimal__form" aria-label="Newsletter signup">
          <div class="cta-newsletter-minimal__form-group">
            <input
              type="email"
              class="cta-newsletter-minimal__input"
              placeholder="{{EMAIL_PLACEHOLDER}}"
              required
              aria-label="Email address"
            />
            <button
              type="submit"
              class="cta-newsletter-minimal__button"
              aria-label="Subscribe to newsletter"
            >
              {{BUTTON_TEXT}}
            </button>
          </div>
        </form>

        <p class="cta-newsletter-minimal__privacy">{{PRIVACY_NOTE}}</p>
      </div>
    </section>
  `,
  css: `
    .cta-newsletter-minimal {
      background-color: var(--color-bg);
      padding: 3rem 1rem;
    }

    @media (min-width: 768px) {
      .cta-newsletter-minimal {
        padding: 4rem 2rem;
      }
    }

    @media (min-width: 1024px) {
      .cta-newsletter-minimal {
        padding: 5rem 2rem;
      }
    }

    .cta-newsletter-minimal__container {
      max-width: 600px;
      margin: 0 auto;
    }

    .cta-newsletter-minimal__content {
      text-align: center;
      margin-bottom: 2rem;
    }

    .cta-newsletter-minimal__heading {
      font-family: var(--font-heading);
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--color-text);
      margin: 0 0 1rem 0;
      line-height: 1.3;
    }

    @media (min-width: 768px) {
      .cta-newsletter-minimal__heading {
        font-size: 2.25rem;
      }
    }

    .cta-newsletter-minimal__description {
      font-family: var(--font-body);
      font-size: 1rem;
      color: var(--color-muted);
      margin: 0;
      line-height: 1.6;
    }

    .cta-newsletter-minimal__form {
      margin-bottom: 1.5rem;
    }

    .cta-newsletter-minimal__form-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    @media (min-width: 640px) {
      .cta-newsletter-minimal__form-group {
        flex-direction: row;
        gap: 0.5rem;
      }
    }

    .cta-newsletter-minimal__input {
      flex: 1;
      padding: 0.875rem 1rem;
      font-family: var(--font-body);
      font-size: 1rem;
      border: 1px solid var(--color-accent);
      border-radius: 4px;
      background-color: var(--color-bg);
      color: var(--color-text);
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    .cta-newsletter-minimal__input::placeholder {
      color: var(--color-muted);
    }

    .cta-newsletter-minimal__input:focus {
      outline: none;
      border-color: var(--color-text);
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
    }

    .cta-newsletter-minimal__button {
      padding: 0.875rem 2rem;
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 600;
      color: white;
      background-color: var(--color-accent);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
    }

    @media (min-width: 640px) {
      .cta-newsletter-minimal__button {
        padding: 0.875rem 2.5rem;
        white-space: nowrap;
      }
    }

    .cta-newsletter-minimal__button:hover {
      background-color: var(--color-text);
      transform: translateY(-2px);
    }

    .cta-newsletter-minimal__button:active {
      transform: translateY(0);
    }

    .cta-newsletter-minimal__privacy {
      font-family: var(--font-body);
      font-size: 0.875rem;
      color: var(--color-muted);
      text-align: center;
      margin: 0;
      line-height: 1.5;
    }
  `,
  placeholders: [
    {
      key: 'NEWSLETTER_HEADING',
      type: 'text',
      description: 'Main heading for newsletter signup',
      defaultValue: 'Subscribe to Our Newsletter'
    },
    {
      key: 'NEWSLETTER_DESCRIPTION',
      type: 'text',
      description: 'Short description or tagline for newsletter',
      defaultValue: 'Get the latest updates delivered to your inbox'
    },
    {
      key: 'EMAIL_PLACEHOLDER',
      type: 'text',
      description: 'Placeholder text for email input',
      defaultValue: 'Enter your email'
    },
    {
      key: 'BUTTON_TEXT',
      type: 'text',
      description: 'Text on the subscribe button',
      defaultValue: 'Subscribe'
    },
    {
      key: 'PRIVACY_NOTE',
      type: 'text',
      description: 'Privacy and consent notice',
      defaultValue: 'We respect your privacy. Unsubscribe at any time.'
    }
  ],
  animations: [
    {
      trigger: 'load',
      type: 'fadeIn',
      duration: '0.6s',
      delay: '0s'
    },
    {
      trigger: 'hover',
      type: 'slideUp',
      duration: '0.3s'
    }
  ]
};
