import type { SectionTemplate } from '../../../types';

export const FOOTER_ELEGANT_COLUMNS: SectionTemplate = {
  id: 'footer-elegant-columns',
  category: 'footer',
  variant: 'grid',
  name: 'Elegant Footer Columns',
  description: 'Four-column responsive footer with brand info, navigation links, and social media',
  tones: ['luxury', 'elegant', 'minimal'],
  html: `
    <footer data-section-id="footer-elegant-columns" class="footer-elegant-columns">
      <div class="footer-elegant-columns__container">
        <div class="footer-elegant-columns__content">
          <!-- Column 1: Brand -->
          <div class="footer-elegant-columns__column footer-elegant-columns__column--brand">
            <h3 class="footer-elegant-columns__brand-name">{{BRAND_NAME}}</h3>
            <p class="footer-elegant-columns__brand-description">{{BRAND_DESCRIPTION}}</p>
          </div>

          <!-- Column 2: Shop -->
          <div class="footer-elegant-columns__column">
            <h4 class="footer-elegant-columns__column-title">{{SHOP_TITLE}}</h4>
            <ul class="footer-elegant-columns__list">
              <li><a href="{{SHOP_LINK_1_URL}}" class="footer-elegant-columns__link">{{SHOP_LINK_1_TEXT}}</a></li>
              <li><a href="{{SHOP_LINK_2_URL}}" class="footer-elegant-columns__link">{{SHOP_LINK_2_TEXT}}</a></li>
              <li><a href="{{SHOP_LINK_3_URL}}" class="footer-elegant-columns__link">{{SHOP_LINK_3_TEXT}}</a></li>
              <li><a href="{{SHOP_LINK_4_URL}}" class="footer-elegant-columns__link">{{SHOP_LINK_4_TEXT}}</a></li>
            </ul>
          </div>

          <!-- Column 3: Information -->
          <div class="footer-elegant-columns__column">
            <h4 class="footer-elegant-columns__column-title">{{INFO_TITLE}}</h4>
            <ul class="footer-elegant-columns__list">
              <li><a href="{{INFO_LINK_1_URL}}" class="footer-elegant-columns__link">{{INFO_LINK_1_TEXT}}</a></li>
              <li><a href="{{INFO_LINK_2_URL}}" class="footer-elegant-columns__link">{{INFO_LINK_2_TEXT}}</a></li>
              <li><a href="{{INFO_LINK_3_URL}}" class="footer-elegant-columns__link">{{INFO_LINK_3_TEXT}}</a></li>
              <li><a href="{{INFO_LINK_4_URL}}" class="footer-elegant-columns__link">{{INFO_LINK_4_TEXT}}</a></li>
            </ul>
          </div>

          <!-- Column 4: Social Media -->
          <div class="footer-elegant-columns__column">
            <h4 class="footer-elegant-columns__column-title">{{SOCIAL_TITLE}}</h4>
            <ul class="footer-elegant-columns__social-list">
              <li>
                <a href="{{SOCIAL_LINK_1_URL}}" class="footer-elegant-columns__social-link" aria-label="{{SOCIAL_LINK_1_LABEL}}">
                  <svg class="footer-elegant-columns__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </a>
              </li>
              <li>
                <a href="{{SOCIAL_LINK_2_URL}}" class="footer-elegant-columns__social-link" aria-label="{{SOCIAL_LINK_2_LABEL}}">
                  <svg class="footer-elegant-columns__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </a>
              </li>
              <li>
                <a href="{{SOCIAL_LINK_3_URL}}" class="footer-elegant-columns__social-link" aria-label="{{SOCIAL_LINK_3_LABEL}}">
                  <svg class="footer-elegant-columns__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </a>
              </li>
              <li>
                <a href="{{SOCIAL_LINK_4_URL}}" class="footer-elegant-columns__social-link" aria-label="{{SOCIAL_LINK_4_LABEL}}">
                  <svg class="footer-elegant-columns__social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="footer-elegant-columns__bottom">
          <div class="footer-elegant-columns__copyright">
            <p class="footer-elegant-columns__copyright-text">{{COPYRIGHT_TEXT}}</p>
          </div>

          <div class="footer-elegant-columns__payment-icons">
            <img src="{{PAYMENT_ICONS_IMAGE}}" alt="Payment methods" class="footer-elegant-columns__payment-image" />
          </div>

          <div class="footer-elegant-columns__legal-links">
            <a href="{{LEGAL_LINK_1_URL}}" class="footer-elegant-columns__legal-link">{{LEGAL_LINK_1_TEXT}}</a>
            <span class="footer-elegant-columns__legal-separator">/</span>
            <a href="{{LEGAL_LINK_2_URL}}" class="footer-elegant-columns__legal-link">{{LEGAL_LINK_2_TEXT}}</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  css: `
    .footer-elegant-columns {
      background-color: var(--color-bg);
      border-top: 1px solid var(--color-muted);
      padding: 3rem 1rem 2rem;
      margin-top: 4rem;
    }

    @media (min-width: 768px) {
      .footer-elegant-columns {
        padding: 4rem 2rem 3rem;
      }
    }

    @media (min-width: 1024px) {
      .footer-elegant-columns {
        padding: 5rem 2rem 3rem;
      }
    }

    .footer-elegant-columns__container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .footer-elegant-columns__content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-bottom: 2.5rem;
    }

    @media (min-width: 640px) {
      .footer-elegant-columns__content {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
    }

    @media (min-width: 1024px) {
      .footer-elegant-columns__content {
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 2.5rem;
      }
    }

    .footer-elegant-columns__column {
      display: flex;
      flex-direction: column;
    }

    .footer-elegant-columns__column--brand {
      grid-column: 1 / -1;
    }

    @media (min-width: 1024px) {
      .footer-elegant-columns__column--brand {
        grid-column: 1;
      }
    }

    .footer-elegant-columns__brand-name {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text);
      margin: 0 0 0.75rem 0;
      letter-spacing: -0.5px;
    }

    .footer-elegant-columns__brand-description {
      font-family: var(--font-body);
      font-size: 0.95rem;
      color: var(--color-muted);
      margin: 0;
      line-height: 1.6;
    }

    .footer-elegant-columns__column-title {
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text);
      margin: 0 0 1rem 0;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .footer-elegant-columns__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .footer-elegant-columns__link {
      font-family: var(--font-body);
      font-size: 0.95rem;
      color: var(--color-muted);
      text-decoration: none;
      transition: color 0.3s ease;
      display: inline-block;
    }

    .footer-elegant-columns__link:hover {
      color: var(--color-text);
    }

    .footer-elegant-columns__social-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .footer-elegant-columns__social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      border: 1px solid var(--color-muted);
      color: var(--color-muted);
      transition: all 0.3s ease;
    }

    .footer-elegant-columns__social-link:hover {
      color: var(--color-text);
      border-color: var(--color-text);
      transform: translateY(-3px);
    }

    .footer-elegant-columns__social-icon {
      width: 1.2rem;
      height: 1.2rem;
    }

    .footer-elegant-columns__bottom {
      border-top: 1px solid var(--color-muted);
      padding-top: 2rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      align-items: center;
    }

    @media (min-width: 768px) {
      .footer-elegant-columns__bottom {
        grid-template-columns: 1fr auto 1fr;
        gap: 2rem;
      }
    }

    .footer-elegant-columns__copyright {
      text-align: center;
    }

    @media (min-width: 768px) {
      .footer-elegant-columns__copyright {
        text-align: left;
      }
    }

    .footer-elegant-columns__copyright-text {
      font-family: var(--font-body);
      font-size: 0.875rem;
      color: var(--color-muted);
      margin: 0;
      line-height: 1.6;
    }

    .footer-elegant-columns__payment-icons {
      text-align: center;
    }

    .footer-elegant-columns__payment-image {
      max-height: 2rem;
      width: auto;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }

    .footer-elegant-columns__payment-image:hover {
      opacity: 1;
    }

    .footer-elegant-columns__legal-links {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    @media (min-width: 768px) {
      .footer-elegant-columns__legal-links {
        justify-content: flex-end;
      }
    }

    .footer-elegant-columns__legal-link {
      font-family: var(--font-body);
      font-size: 0.875rem;
      color: var(--color-muted);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-elegant-columns__legal-link:hover {
      color: var(--color-text);
      text-decoration: underline;
    }

    .footer-elegant-columns__legal-separator {
      color: var(--color-muted);
      margin: 0 0.25rem;
    }
  `,
  placeholders: [
    {
      key: 'BRAND_NAME',
      type: 'text',
      description: 'Brand or company name',
      defaultValue: 'Aicata'
    },
    {
      key: 'BRAND_DESCRIPTION',
      type: 'text',
      description: 'Short brand description',
      defaultValue: 'Crafting elegant digital experiences with precision and care.'
    },
    {
      key: 'SHOP_TITLE',
      type: 'text',
      description: 'Shop section title (typically "ショップ" in Japanese)',
      defaultValue: 'ショップ'
    },
    {
      key: 'SHOP_LINK_1_TEXT',
      type: 'text',
      description: 'First shop link text',
      defaultValue: 'New Arrivals'
    },
    {
      key: 'SHOP_LINK_1_URL',
      type: 'url',
      description: 'First shop link URL'
    },
    {
      key: 'SHOP_LINK_2_TEXT',
      type: 'text',
      description: 'Second shop link text',
      defaultValue: 'Collections'
    },
    {
      key: 'SHOP_LINK_2_URL',
      type: 'url',
      description: 'Second shop link URL'
    },
    {
      key: 'SHOP_LINK_3_TEXT',
      type: 'text',
      description: 'Third shop link text',
      defaultValue: 'Best Sellers'
    },
    {
      key: 'SHOP_LINK_3_URL',
      type: 'url',
      description: 'Third shop link URL'
    },
    {
      key: 'SHOP_LINK_4_TEXT',
      type: 'text',
      description: 'Fourth shop link text',
      defaultValue: 'Sale'
    },
    {
      key: 'SHOP_LINK_4_URL',
      type: 'url',
      description: 'Fourth shop link URL'
    },
    {
      key: 'INFO_TITLE',
      type: 'text',
      description: 'Information section title (typically "情報" in Japanese)',
      defaultValue: '情報'
    },
    {
      key: 'INFO_LINK_1_TEXT',
      type: 'text',
      description: 'First info link text',
      defaultValue: 'About Us'
    },
    {
      key: 'INFO_LINK_1_URL',
      type: 'url',
      description: 'First info link URL'
    },
    {
      key: 'INFO_LINK_2_TEXT',
      type: 'text',
      description: 'Second info link text',
      defaultValue: 'Contact'
    },
    {
      key: 'INFO_LINK_2_URL',
      type: 'url',
      description: 'Second info link URL'
    },
    {
      key: 'INFO_LINK_3_TEXT',
      type: 'text',
      description: 'Third info link text',
      defaultValue: 'FAQ'
    },
    {
      key: 'INFO_LINK_3_URL',
      type: 'url',
      description: 'Third info link URL'
    },
    {
      key: 'INFO_LINK_4_TEXT',
      type: 'text',
      description: 'Fourth info link text',
      defaultValue: 'Shipping Info'
    },
    {
      key: 'INFO_LINK_4_URL',
      type: 'url',
      description: 'Fourth info link URL'
    },
    {
      key: 'SOCIAL_TITLE',
      type: 'text',
      description: 'Social media section title (typically "フォロー" in Japanese)',
      defaultValue: 'フォロー'
    },
    {
      key: 'SOCIAL_LINK_1_URL',
      type: 'url',
      description: 'First social media link URL'
    },
    {
      key: 'SOCIAL_LINK_1_LABEL',
      type: 'text',
      description: 'First social media accessibility label',
      defaultValue: 'Follow on Twitter'
    },
    {
      key: 'SOCIAL_LINK_2_URL',
      type: 'url',
      description: 'Second social media link URL'
    },
    {
      key: 'SOCIAL_LINK_2_LABEL',
      type: 'text',
      description: 'Second social media accessibility label',
      defaultValue: 'Follow on Instagram'
    },
    {
      key: 'SOCIAL_LINK_3_URL',
      type: 'url',
      description: 'Third social media link URL'
    },
    {
      key: 'SOCIAL_LINK_3_LABEL',
      type: 'text',
      description: 'Third social media accessibility label',
      defaultValue: 'Follow on Facebook'
    },
    {
      key: 'SOCIAL_LINK_4_URL',
      type: 'url',
      description: 'Fourth social media link URL'
    },
    {
      key: 'SOCIAL_LINK_4_LABEL',
      type: 'text',
      description: 'Fourth social media accessibility label',
      defaultValue: 'Follow on LinkedIn'
    },
    {
      key: 'COPYRIGHT_TEXT',
      type: 'text',
      description: 'Copyright notice text',
      defaultValue: '© 2024 Aicata. All rights reserved.'
    },
    {
      key: 'PAYMENT_ICONS_IMAGE',
      type: 'image',
      description: 'Payment methods icons image',
      defaultValue: '/images/payment-icons.png'
    },
    {
      key: 'LEGAL_LINK_1_TEXT',
      type: 'text',
      description: 'First legal link text (typically "利用規約" - Terms)',
      defaultValue: '利用規約'
    },
    {
      key: 'LEGAL_LINK_1_URL',
      type: 'url',
      description: 'First legal link URL'
    },
    {
      key: 'LEGAL_LINK_2_TEXT',
      type: 'text',
      description: 'Second legal link text (typically "プライバシーポリシー" - Privacy)',
      defaultValue: 'プライバシーポリシー'
    },
    {
      key: 'LEGAL_LINK_2_URL',
      type: 'url',
      description: 'Second legal link URL'
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
      type: 'lift',
      duration: '0.3s'
    }
  ]
};
