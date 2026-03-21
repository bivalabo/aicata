import type { SectionTemplate } from '../../../types';

export const TESTIMONIAL_QUOTE_SINGLE: SectionTemplate = {
  id: 'testimonial-quote-single',
  category: 'testimonial',
  variant: 'centered',
  name: 'Testimonial Quote Single',
  description: 'Large centered testimonial with decorative quotation mark, customer name, and optional star rating',
  tones: ['elegant', 'warm', 'luxury'],
  html: `
    <section data-section-id="testimonial-quote-single" class="testimonial-quote-single">
      <div class="testimonial-quote-single__container">
        <div class="testimonial-quote-single__quote-mark" aria-hidden="true">
          {{QUOTE_MARK}}
        </div>

        <blockquote class="testimonial-quote-single__quote">
          <p class="testimonial-quote-single__text">{{TESTIMONIAL_TEXT}}</p>
        </blockquote>

        <div class="testimonial-quote-single__rating">
          <div class="testimonial-quote-single__stars">
            <span class="testimonial-quote-single__star {{STAR_CLASS_1}}"></span>
            <span class="testimonial-quote-single__star {{STAR_CLASS_2}}"></span>
            <span class="testimonial-quote-single__star {{STAR_CLASS_3}}"></span>
            <span class="testimonial-quote-single__star {{STAR_CLASS_4}}"></span>
            <span class="testimonial-quote-single__star {{STAR_CLASS_5}}"></span>
          </div>
        </div>

        <div class="testimonial-quote-single__attribution">
          <p class="testimonial-quote-single__customer-name">{{CUSTOMER_NAME}}</p>
          <p class="testimonial-quote-single__customer-title">{{CUSTOMER_TITLE}}</p>
        </div>

        {{CUSTOMER_IMAGE_HTML}}
      </div>
    </section>
  `,
  css: `
    .testimonial-quote-single {
      background-color: var(--color-bg);
      padding: 3rem 1rem;
    }

    @media (min-width: 768px) {
      .testimonial-quote-single {
        padding: 4rem 2rem;
      }
    }

    @media (min-width: 1024px) {
      .testimonial-quote-single {
        padding: 5rem 2rem;
      }
    }

    .testimonial-quote-single__container {
      max-width: 700px;
      margin: 0 auto;
      text-align: center;
    }

    .testimonial-quote-single__quote-mark {
      font-family: var(--font-heading);
      font-size: 4rem;
      color: var(--color-accent);
      opacity: 0.3;
      margin-bottom: 1rem;
      line-height: 1;
    }

    @media (min-width: 768px) {
      .testimonial-quote-single__quote-mark {
        font-size: 5rem;
        margin-bottom: 1.5rem;
      }
    }

    .testimonial-quote-single__quote {
      margin: 0 0 2rem 0;
    }

    .testimonial-quote-single__text {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 1.5rem;
      font-style: italic;
      font-weight: 400;
      color: var(--color-text);
      margin: 0;
      line-height: 1.8;
      letter-spacing: 0.3px;
    }

    @media (min-width: 768px) {
      .testimonial-quote-single__text {
        font-size: 1.875rem;
        line-height: 1.9;
      }
    }

    @media (min-width: 1024px) {
      .testimonial-quote-single__text {
        font-size: 2.125rem;
        line-height: 2;
      }
    }

    .testimonial-quote-single__rating {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .testimonial-quote-single__stars {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .testimonial-quote-single__star {
      display: inline-block;
      width: 1.25rem;
      height: 1.25rem;
      position: relative;
    }

    .testimonial-quote-single__star::before {
      content: '★';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: var(--color-muted);
    }

    .testimonial-quote-single__star--filled::before {
      color: var(--color-accent);
    }

    .testimonial-quote-single__star--half::before {
      background: linear-gradient(90deg, var(--color-accent) 50%, var(--color-muted) 50%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .testimonial-quote-single__attribution {
      margin-bottom: 0;
    }

    .testimonial-quote-single__customer-name {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.3px;
    }

    @media (min-width: 768px) {
      .testimonial-quote-single__customer-name {
        font-size: 1.5rem;
      }
    }

    .testimonial-quote-single__customer-title {
      font-family: var(--font-body);
      font-size: 0.95rem;
      color: var(--color-muted);
      font-weight: 400;
      margin: 0;
      letter-spacing: 0.5px;
    }

    .testimonial-quote-single__customer-image {
      margin-top: 1.5rem;
      display: flex;
      justify-content: center;
    }

    .testimonial-quote-single__image {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--color-accent);
    }

    @media (min-width: 768px) {
      .testimonial-quote-single__image {
        width: 80px;
        height: 80px;
      }
    }
  `,
  placeholders: [
    {
      key: 'QUOTE_MARK',
      type: 'text',
      description: 'Opening quotation mark character',
      defaultValue: '"'
    },
    {
      key: 'TESTIMONIAL_TEXT',
      type: 'text',
      description: 'Main testimonial quote text',
      defaultValue: 'This experience has completely transformed how I approach my work. The attention to detail and quality of service is unparalleled.'
    },
    {
      key: 'STAR_CLASS_1',
      type: 'text',
      description: 'CSS class for first star (--filled, --half, or empty)',
      defaultValue: 'testimonial-quote-single__star--filled'
    },
    {
      key: 'STAR_CLASS_2',
      type: 'text',
      description: 'CSS class for second star (--filled, --half, or empty)',
      defaultValue: 'testimonial-quote-single__star--filled'
    },
    {
      key: 'STAR_CLASS_3',
      type: 'text',
      description: 'CSS class for third star (--filled, --half, or empty)',
      defaultValue: 'testimonial-quote-single__star--filled'
    },
    {
      key: 'STAR_CLASS_4',
      type: 'text',
      description: 'CSS class for fourth star (--filled, --half, or empty)',
      defaultValue: 'testimonial-quote-single__star--filled'
    },
    {
      key: 'STAR_CLASS_5',
      type: 'text',
      description: 'CSS class for fifth star (--filled, --half, or empty)',
      defaultValue: 'testimonial-quote-single__star--filled'
    },
    {
      key: 'CUSTOMER_NAME',
      type: 'text',
      description: 'Name of the customer providing testimonial',
      defaultValue: 'Sarah Anderson'
    },
    {
      key: 'CUSTOMER_TITLE',
      type: 'text',
      description: 'Title or company of the customer',
      defaultValue: 'Creative Director, Design Studio'
    },
    {
      key: 'CUSTOMER_IMAGE_HTML',
      type: 'text',
      description: 'HTML for optional customer image (wrapped in customer-image div)',
      defaultValue: ''
    }
  ],
  animations: [
    {
      trigger: 'load',
      type: 'fadeIn',
      duration: '0.8s',
      delay: '0s'
    },
    {
      trigger: 'scroll',
      type: 'scaleUp',
      duration: '0.6s',
      delay: '0.2s'
    }
  ]
};
