import type { SectionTemplate } from '../../../types';

export const PRODUCT_REVIEWS_STAR_RATING: SectionTemplate = {
  id: 'product-reviews-star-rating',
  category: 'product-reviews',
  variant: 'minimal',
  name: 'Star Rating Review Section',
  description: 'Customer review section with average rating display (CSS star visualization), review count, individual review cards with ratings, reviewer name, date, and text.',
  tones: ['minimal', 'modern', 'warm'],
  html: `
    <section data-section-id="product-reviews-star-rating" class="product-reviews-star-rating">
      <div class="product-reviews-star-rating__container">

        <h2 class="product-reviews-star-rating__heading">Customer Reviews</h2>

        <!-- Overall Rating Summary -->
        <div class="product-reviews-star-rating__summary">
          <div class="product-reviews-star-rating__overall-rating">
            <div class="product-reviews-star-rating__rating-display">
              <span class="product-reviews-star-rating__rating-number">{{AVERAGE_RATING}}</span>
              <div class="product-reviews-star-rating__stars-large">
                <span class="product-reviews-star-rating__star">★</span>
                <span class="product-reviews-star-rating__star">★</span>
                <span class="product-reviews-star-rating__star">★</span>
                <span class="product-reviews-star-rating__star">★</span>
                <span class="product-reviews-star-rating__star product-reviews-star-rating__star--half">★</span>
              </div>
            </div>
            <p class="product-reviews-star-rating__review-count">Based on {{TOTAL_REVIEWS}} reviews</p>
          </div>

          <!-- Rating Breakdown -->
          <div class="product-reviews-star-rating__breakdown">
            <div class="product-reviews-star-rating__breakdown-item">
              <span class="product-reviews-star-rating__breakdown-label">5 ★</span>
              <div class="product-reviews-star-rating__breakdown-bar">
                <div class="product-reviews-star-rating__breakdown-fill" style="width: {{FIVE_STAR_PERCENT}}%"></div>
              </div>
              <span class="product-reviews-star-rating__breakdown-count">{{FIVE_STAR_COUNT}}</span>
            </div>
            <div class="product-reviews-star-rating__breakdown-item">
              <span class="product-reviews-star-rating__breakdown-label">4 ★</span>
              <div class="product-reviews-star-rating__breakdown-bar">
                <div class="product-reviews-star-rating__breakdown-fill" style="width: {{FOUR_STAR_PERCENT}}%"></div>
              </div>
              <span class="product-reviews-star-rating__breakdown-count">{{FOUR_STAR_COUNT}}</span>
            </div>
            <div class="product-reviews-star-rating__breakdown-item">
              <span class="product-reviews-star-rating__breakdown-label">3 ★</span>
              <div class="product-reviews-star-rating__breakdown-bar">
                <div class="product-reviews-star-rating__breakdown-fill" style="width: {{THREE_STAR_PERCENT}}%"></div>
              </div>
              <span class="product-reviews-star-rating__breakdown-count">{{THREE_STAR_COUNT}}</span>
            </div>
            <div class="product-reviews-star-rating__breakdown-item">
              <span class="product-reviews-star-rating__breakdown-label">2 ★</span>
              <div class="product-reviews-star-rating__breakdown-bar">
                <div class="product-reviews-star-rating__breakdown-fill" style="width: {{TWO_STAR_PERCENT}}%"></div>
              </div>
              <span class="product-reviews-star-rating__breakdown-count">{{TWO_STAR_COUNT}}</span>
            </div>
            <div class="product-reviews-star-rating__breakdown-item">
              <span class="product-reviews-star-rating__breakdown-label">1 ★</span>
              <div class="product-reviews-star-rating__breakdown-bar">
                <div class="product-reviews-star-rating__breakdown-fill" style="width: {{ONE_STAR_PERCENT}}%"></div>
              </div>
              <span class="product-reviews-star-rating__breakdown-count">{{ONE_STAR_COUNT}}</span>
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <button class="product-reviews-star-rating__write-review-btn">
          Write a Review
        </button>

        <!-- Reviews List -->
        <div class="product-reviews-star-rating__reviews">

          <!-- Review Card 1 -->
          <article class="product-reviews-star-rating__review-card">
            <div class="product-reviews-star-rating__review-header">
              <div class="product-reviews-star-rating__review-meta">
                <h3 class="product-reviews-star-rating__review-title">{{REVIEW_1_TITLE}}</h3>
                <p class="product-reviews-star-rating__review-author">by {{REVIEW_1_AUTHOR}}</p>
              </div>
              <span class="product-reviews-star-rating__review-date">{{REVIEW_1_DATE}}</span>
            </div>
            <div class="product-reviews-star-rating__review-rating">
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
            </div>
            <p class="product-reviews-star-rating__review-text">{{REVIEW_1_TEXT}}</p>
            <div class="product-reviews-star-rating__review-footer">
              <button class="product-reviews-star-rating__helpful-btn">
                <span class="product-reviews-star-rating__helpful-icon">👍</span>
                Helpful ({{REVIEW_1_HELPFUL}})
              </button>
            </div>
          </article>

          <!-- Review Card 2 -->
          <article class="product-reviews-star-rating__review-card">
            <div class="product-reviews-star-rating__review-header">
              <div class="product-reviews-star-rating__review-meta">
                <h3 class="product-reviews-star-rating__review-title">{{REVIEW_2_TITLE}}</h3>
                <p class="product-reviews-star-rating__review-author">by {{REVIEW_2_AUTHOR}}</p>
              </div>
              <span class="product-reviews-star-rating__review-date">{{REVIEW_2_DATE}}</span>
            </div>
            <div class="product-reviews-star-rating__review-rating">
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star product-reviews-star-rating__star--empty">★</span>
            </div>
            <p class="product-reviews-star-rating__review-text">{{REVIEW_2_TEXT}}</p>
            <div class="product-reviews-star-rating__review-footer">
              <button class="product-reviews-star-rating__helpful-btn">
                <span class="product-reviews-star-rating__helpful-icon">👍</span>
                Helpful ({{REVIEW_2_HELPFUL}})
              </button>
            </div>
          </article>

          <!-- Review Card 3 -->
          <article class="product-reviews-star-rating__review-card">
            <div class="product-reviews-star-rating__review-header">
              <div class="product-reviews-star-rating__review-meta">
                <h3 class="product-reviews-star-rating__review-title">{{REVIEW_3_TITLE}}</h3>
                <p class="product-reviews-star-rating__review-author">by {{REVIEW_3_AUTHOR}}</p>
              </div>
              <span class="product-reviews-star-rating__review-date">{{REVIEW_3_DATE}}</span>
            </div>
            <div class="product-reviews-star-rating__review-rating">
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
              <span class="product-reviews-star-rating__star">★</span>
            </div>
            <p class="product-reviews-star-rating__review-text">{{REVIEW_3_TEXT}}</p>
            <div class="product-reviews-star-rating__review-footer">
              <button class="product-reviews-star-rating__helpful-btn">
                <span class="product-reviews-star-rating__helpful-icon">👍</span>
                Helpful ({{REVIEW_3_HELPFUL}})
              </button>
            </div>
          </article>

        </div>

        <!-- Load More Button -->
        <div class="product-reviews-star-rating__load-more">
          <button class="product-reviews-star-rating__load-more-btn">
            Load More Reviews
          </button>
        </div>

      </div>
    </section>
  `,
  css: `
    .product-reviews-star-rating {
      background-color: var(--color-bg);
      color: var(--color-text);
      padding: 60px 20px;
      border-top: 1px solid var(--color-muted);
    }

    .product-reviews-star-rating__container {
      max-width: 900px;
      margin: 0 auto;
    }

    .product-reviews-star-rating__heading {
      font-family: var(--font-heading);
      font-size: 28px;
      font-weight: 400;
      margin: 0 0 48px 0;
      letter-spacing: 0.6px;
      color: var(--color-text);
    }

    /* Summary Section */
    .product-reviews-star-rating__summary {
      display: flex;
      flex-direction: column;
      gap: 40px;
      margin-bottom: 40px;
      padding-bottom: 40px;
      border-bottom: 1px solid var(--color-muted);
    }

    .product-reviews-star-rating__overall-rating {
      text-align: center;
    }

    .product-reviews-star-rating__rating-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 12px;
    }

    .product-reviews-star-rating__rating-number {
      font-family: var(--font-heading);
      font-size: 48px;
      font-weight: 400;
      color: var(--color-text);
    }

    .product-reviews-star-rating__stars-large {
      display: flex;
      gap: 4px;
      font-size: 24px;
      color: var(--color-accent);
    }

    .product-reviews-star-rating__star {
      line-height: 1;
    }

    .product-reviews-star-rating__star--half {
      opacity: 0.5;
    }

    .product-reviews-star-rating__star--empty {
      color: var(--color-muted);
    }

    .product-reviews-star-rating__review-count {
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--color-muted);
      margin: 0;
      letter-spacing: 0.3px;
    }

    /* Rating Breakdown */
    .product-reviews-star-rating__breakdown {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .product-reviews-star-rating__breakdown-item {
      display: grid;
      grid-template-columns: 40px 1fr 40px;
      gap: 16px;
      align-items: center;
    }

    .product-reviews-star-rating__breakdown-label {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-text);
      text-align: right;
      letter-spacing: 0.3px;
    }

    .product-reviews-star-rating__breakdown-bar {
      height: 6px;
      background: var(--color-muted);
      border-radius: 3px;
      overflow: hidden;
    }

    .product-reviews-star-rating__breakdown-fill {
      height: 100%;
      background: var(--color-accent);
      transition: width 0.6s ease;
    }

    .product-reviews-star-rating__breakdown-count {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-muted);
      letter-spacing: 0.3px;
    }

    /* Write Review Button */
    .product-reviews-star-rating__write-review-btn {
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      background: var(--color-text);
      color: var(--color-bg);
      border: none;
      padding: 12px 28px;
      cursor: pointer;
      margin-bottom: 48px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-reviews-star-rating__write-review-btn:hover {
      background: var(--color-accent);
      transform: translateY(-2px);
    }

    /* Reviews List */
    .product-reviews-star-rating__reviews {
      display: flex;
      flex-direction: column;
      gap: 32px;
      margin-bottom: 48px;
    }

    .product-reviews-star-rating__review-card {
      padding: 24px 0;
      border-bottom: 1px solid var(--color-muted);
    }

    .product-reviews-star-rating__review-card:last-child {
      border-bottom: none;
    }

    .product-reviews-star-rating__review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 12px;
    }

    .product-reviews-star-rating__review-meta {
      flex: 1;
    }

    .product-reviews-star-rating__review-title {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 4px 0;
      letter-spacing: 0.3px;
      color: var(--color-text);
    }

    .product-reviews-star-rating__review-author {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-muted);
      margin: 0;
      letter-spacing: 0.3px;
    }

    .product-reviews-star-rating__review-date {
      font-family: var(--font-body);
      font-size: 12px;
      color: var(--color-muted);
      white-space: nowrap;
      letter-spacing: 0.3px;
    }

    .product-reviews-star-rating__review-rating {
      display: flex;
      gap: 2px;
      font-size: 14px;
      color: var(--color-accent);
      margin-bottom: 12px;
    }

    .product-reviews-star-rating__review-text {
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.6;
      color: var(--color-text);
      margin: 0 0 16px 0;
      letter-spacing: 0.3px;
    }

    .product-reviews-star-rating__review-footer {
      display: flex;
      gap: 12px;
    }

    .product-reviews-star-rating__helpful-btn {
      font-family: var(--font-body);
      font-size: 12px;
      color: var(--color-muted);
      background: transparent;
      border: 1px solid var(--color-muted);
      padding: 6px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.3s ease;
      letter-spacing: 0.3px;
    }

    .product-reviews-star-rating__helpful-btn:hover {
      border-color: var(--color-text);
      color: var(--color-text);
    }

    .product-reviews-star-rating__helpful-icon {
      font-size: 14px;
    }

    /* Load More */
    .product-reviews-star-rating__load-more {
      text-align: center;
    }

    .product-reviews-star-rating__load-more-btn {
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      background: transparent;
      color: var(--color-text);
      border: 1px solid var(--color-text);
      padding: 12px 36px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-reviews-star-rating__load-more-btn:hover {
      background: var(--color-text);
      color: var(--color-bg);
    }

    @media (min-width: 768px) {
      .product-reviews-star-rating {
        padding: 80px 40px;
      }

      .product-reviews-star-rating__heading {
        font-size: 32px;
      }

      .product-reviews-star-rating__summary {
        flex-direction: row;
        gap: 60px;
        align-items: flex-start;
      }

      .product-reviews-star-rating__overall-rating {
        flex: 0 0 200px;
        text-align: left;
      }

      .product-reviews-star-rating__rating-display {
        justify-content: flex-start;
      }

      .product-reviews-star-rating__breakdown {
        flex: 1;
      }

      .product-reviews-star-rating__review-header {
        margin-bottom: 16px;
      }

      .product-reviews-star-rating__review-text {
        font-size: 15px;
      }
    }

    @media (min-width: 1024px) {
      .product-reviews-star-rating {
        padding: 100px 60px;
      }

      .product-reviews-star-rating__heading {
        font-size: 36px;
        margin-bottom: 56px;
      }

      .product-reviews-star-rating__review-card {
        padding: 32px 0;
      }
    }
  `,
  placeholders: [
    {
      key: 'AVERAGE_RATING',
      type: 'text',
      description: 'Average rating number (e.g., 4.8)',
      defaultValue: '4.8'
    },
    {
      key: 'TOTAL_REVIEWS',
      type: 'text',
      description: 'Total number of reviews',
      defaultValue: '342'
    },
    {
      key: 'FIVE_STAR_PERCENT',
      type: 'text',
      description: 'Percentage of 5-star reviews',
      defaultValue: '75'
    },
    {
      key: 'FIVE_STAR_COUNT',
      type: 'text',
      description: 'Count of 5-star reviews',
      defaultValue: '257'
    },
    {
      key: 'FOUR_STAR_PERCENT',
      type: 'text',
      description: 'Percentage of 4-star reviews',
      defaultValue: '18'
    },
    {
      key: 'FOUR_STAR_COUNT',
      type: 'text',
      description: 'Count of 4-star reviews',
      defaultValue: '62'
    },
    {
      key: 'THREE_STAR_PERCENT',
      type: 'text',
      description: 'Percentage of 3-star reviews',
      defaultValue: '5'
    },
    {
      key: 'THREE_STAR_COUNT',
      type: 'text',
      description: 'Count of 3-star reviews',
      defaultValue: '18'
    },
    {
      key: 'TWO_STAR_PERCENT',
      type: 'text',
      description: 'Percentage of 2-star reviews',
      defaultValue: '1'
    },
    {
      key: 'TWO_STAR_COUNT',
      type: 'text',
      description: 'Count of 2-star reviews',
      defaultValue: '3'
    },
    {
      key: 'ONE_STAR_PERCENT',
      type: 'text',
      description: 'Percentage of 1-star reviews',
      defaultValue: '1'
    },
    {
      key: 'ONE_STAR_COUNT',
      type: 'text',
      description: 'Count of 1-star reviews',
      defaultValue: '2'
    },
    {
      key: 'REVIEW_1_TITLE',
      type: 'text',
      description: 'Title of review 1',
      defaultValue: 'Absolutely Life-Changing'
    },
    {
      key: 'REVIEW_1_AUTHOR',
      type: 'text',
      description: 'Author of review 1',
      defaultValue: 'Sarah M.'
    },
    {
      key: 'REVIEW_1_DATE',
      type: 'text',
      description: 'Date of review 1',
      defaultValue: '2 weeks ago'
    },
    {
      key: 'REVIEW_1_TEXT',
      type: 'text',
      description: 'Text of review 1',
      defaultValue: 'This hand cream has completely transformed my skin. I have very dry hands and nothing else has worked. The texture is so luxurious and it absorbs perfectly without any residue. Highly recommend!'
    },
    {
      key: 'REVIEW_1_HELPFUL',
      type: 'text',
      description: 'Helpful count for review 1',
      defaultValue: '24'
    },
    {
      key: 'REVIEW_2_TITLE',
      type: 'text',
      description: 'Title of review 2',
      defaultValue: 'Great Product, Could Be Better'
    },
    {
      key: 'REVIEW_2_AUTHOR',
      type: 'text',
      description: 'Author of review 2',
      defaultValue: 'James K.'
    },
    {
      key: 'REVIEW_2_DATE',
      type: 'text',
      description: 'Date of review 2',
      defaultValue: '1 month ago'
    },
    {
      key: 'REVIEW_2_TEXT',
      type: 'text',
      description: 'Text of review 2',
      defaultValue: 'Very good hand cream with a wonderful scent. Works well for daily use. The only reason I gave 4 stars is that the jar is a bit small for the price point, but the quality is definitely there.'
    },
    {
      key: 'REVIEW_2_HELPFUL',
      type: 'text',
      description: 'Helpful count for review 2',
      defaultValue: '12'
    },
    {
      key: 'REVIEW_3_TITLE',
      type: 'text',
      description: 'Title of review 3',
      defaultValue: 'My New Favorite'
    },
    {
      key: 'REVIEW_3_AUTHOR',
      type: 'text',
      description: 'Author of review 3',
      defaultValue: 'Emily T.'
    },
    {
      key: 'REVIEW_3_DATE',
      type: 'text',
      description: 'Date of review 3',
      defaultValue: '3 weeks ago'
    },
    {
      key: 'REVIEW_3_TEXT',
      type: 'text',
      description: 'Text of review 3',
      defaultValue: 'I have sensitive skin and this is the only hand cream that doesn\'t irritate my hands. The natural ingredients are perfect, and I love that there are no synthetic fragrances. Worth every penny!'
    },
    {
      key: 'REVIEW_3_HELPFUL',
      type: 'text',
      description: 'Helpful count for review 3',
      defaultValue: '18'
    }
  ],
  animations: [
    {
      trigger: 'scroll',
      type: 'fade-in',
      duration: '0.6s',
      delay: '0.1s'
    },
    {
      trigger: 'load',
      type: 'fade-in-up',
      duration: '0.6s'
    }
  ]
};
