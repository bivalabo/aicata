import type { SectionTemplate } from '../../../types';

export const PRODUCT_DESCRIPTION_TABBED: SectionTemplate = {
  id: 'product-description-tabbed',
  category: 'product-description',
  variant: 'tabs',
  name: 'Tabbed Product Details',
  description: 'Tabbed content section for product details: Description, Ingredients, How to Use, and Shipping. Pure CSS tab switching using radio buttons.',
  tones: ['minimal', 'elegant', 'modern'],
  html: `
    <section data-section-id="product-description-tabbed" class="product-description-tabbed">
      <div class="product-description-tabbed__container">

        <div class="product-description-tabbed__tabs">
          <!-- Tab Inputs (hidden) -->
          <input
            type="radio"
            name="product-tab"
            id="tab-description"
            class="product-description-tabbed__input"
            checked
          />
          <input
            type="radio"
            name="product-tab"
            id="tab-ingredients"
            class="product-description-tabbed__input"
          />
          <input
            type="radio"
            name="product-tab"
            id="tab-how-to-use"
            class="product-description-tabbed__input"
          />
          <input
            type="radio"
            name="product-tab"
            id="tab-shipping"
            class="product-description-tabbed__input"
          />

          <!-- Tab Labels -->
          <div class="product-description-tabbed__tabs-header">
            <label for="tab-description" class="product-description-tabbed__tab-label">
              Description
            </label>
            <label for="tab-ingredients" class="product-description-tabbed__tab-label">
              Ingredients
            </label>
            <label for="tab-how-to-use" class="product-description-tabbed__tab-label">
              How to Use
            </label>
            <label for="tab-shipping" class="product-description-tabbed__tab-label">
              Shipping & Care
            </label>
          </div>

          <!-- Tab Contents -->
          <div class="product-description-tabbed__panels">

            <!-- Description Tab -->
            <div class="product-description-tabbed__panel" id="panel-description">
              <div class="product-description-tabbed__panel-content">
                {{DESCRIPTION_MAIN}}
              </div>
            </div>

            <!-- Ingredients Tab -->
            <div class="product-description-tabbed__panel" id="panel-ingredients">
              <div class="product-description-tabbed__panel-content">
                {{INGREDIENTS_LIST}}
              </div>
            </div>

            <!-- How to Use Tab -->
            <div class="product-description-tabbed__panel" id="panel-how-to-use">
              <div class="product-description-tabbed__panel-content">
                {{HOW_TO_USE_INSTRUCTIONS}}
              </div>
            </div>

            <!-- Shipping & Care Tab -->
            <div class="product-description-tabbed__panel" id="panel-shipping">
              <div class="product-description-tabbed__panel-content">
                {{SHIPPING_CARE_INFO}}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  `,
  css: `
    .product-description-tabbed {
      background-color: var(--color-bg);
      color: var(--color-text);
      padding: 60px 20px;
      border-top: 1px solid var(--color-muted);
      border-bottom: 1px solid var(--color-muted);
    }

    .product-description-tabbed__container {
      max-width: 900px;
      margin: 0 auto;
    }

    .product-description-tabbed__tabs {
      position: relative;
    }

    /* Hide radio inputs */
    .product-description-tabbed__input {
      display: none;
    }

    /* Tab Header */
    .product-description-tabbed__tabs-header {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      border-bottom: 1px solid var(--color-muted);
      margin-bottom: 40px;
    }

    .product-description-tabbed__tab-label {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--color-muted);
      padding: 16px 20px;
      cursor: pointer;
      position: relative;
      transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }

    .product-description-tabbed__tab-label:hover {
      color: var(--color-text);
    }

    /* Active tab styling */
    #tab-description:checked ~ .product-description-tabbed__tabs-header label[for="tab-description"],
    #tab-ingredients:checked ~ .product-description-tabbed__tabs-header label[for="tab-ingredients"],
    #tab-how-to-use:checked ~ .product-description-tabbed__tabs-header label[for="tab-how-to-use"],
    #tab-shipping:checked ~ .product-description-tabbed__tabs-header label[for="tab-shipping"] {
      color: var(--color-text);
      border-bottom-color: var(--color-text);
    }

    /* Panels Container */
    .product-description-tabbed__panels {
      position: relative;
      min-height: 200px;
    }

    .product-description-tabbed__panel {
      display: none;
      animation: fadeInPanel 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes fadeInPanel {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Show active panel */
    #tab-description:checked ~ .product-description-tabbed__panels #panel-description,
    #tab-ingredients:checked ~ .product-description-tabbed__panels #panel-ingredients,
    #tab-how-to-use:checked ~ .product-description-tabbed__panels #panel-how-to-use,
    #tab-shipping:checked ~ .product-description-tabbed__panels #panel-shipping {
      display: block;
    }

    .product-description-tabbed__panel-content {
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.8;
      color: var(--color-text);
      letter-spacing: 0.3px;
    }

    .product-description-tabbed__panel-content p {
      margin: 0 0 16px 0;
    }

    .product-description-tabbed__panel-content p:last-child {
      margin-bottom: 0;
    }

    .product-description-tabbed__panel-content ul,
    .product-description-tabbed__panel-content ol {
      margin: 0 0 16px 0;
      padding-left: 24px;
    }

    .product-description-tabbed__panel-content li {
      margin: 8px 0;
      color: var(--color-text);
    }

    .product-description-tabbed__panel-content strong {
      font-weight: 600;
      color: var(--color-text);
    }

    .product-description-tabbed__panel-content em {
      font-style: italic;
      color: var(--color-muted);
    }

    @media (min-width: 768px) {
      .product-description-tabbed {
        padding: 80px 40px;
      }

      .product-description-tabbed__tabs-header {
        gap: 24px;
      }

      .product-description-tabbed__tab-label {
        font-size: 15px;
        padding: 20px 24px;
      }

      .product-description-tabbed__panel-content {
        font-size: 15px;
      }
    }

    @media (min-width: 1024px) {
      .product-description-tabbed {
        padding: 100px 60px;
      }

      .product-description-tabbed__tab-label {
        font-size: 16px;
        padding: 24px 32px;
      }

      .product-description-tabbed__panel-content {
        font-size: 16px;
      }
    }
  `,
  placeholders: [
    {
      key: 'DESCRIPTION_MAIN',
      type: 'text',
      description: 'Main product description',
      defaultValue: '<p>This luxurious hand cream is formulated with premium botanical ingredients to provide deep hydration and nourishment. The lightweight texture absorbs quickly without leaving a greasy residue.</p><p>Perfect for daily use, it creates a protective barrier on the skin while delivering long-lasting moisture. Our proprietary blend includes shea butter, jojoba oil, and natural antioxidants.</p>'
    },
    {
      key: 'INGREDIENTS_LIST',
      type: 'text',
      description: 'Ingredients list',
      defaultValue: '<p><strong>Key Ingredients:</strong></p><ul><li>Shea Butter – Deep moisturizing and nourishing</li><li>Jojoba Oil – Natural emollient with antioxidants</li><li>Aloe Vera – Soothing and hydrating</li><li>Vitamin E – Protects against oxidative stress</li><li>Chamomile Extract – Calms and soothes skin</li><li>Glycerin – Humectant for moisture retention</li></ul><p><strong>Free from:</strong> Parabens, sulfates, synthetic fragrances, and animal-derived ingredients.</p>'
    },
    {
      key: 'HOW_TO_USE_INSTRUCTIONS',
      type: 'text',
      description: 'How to use instructions',
      defaultValue: '<ol><li>Cleanse and dry your hands thoroughly</li><li>Take a small amount (about a pea-sized dollop) and warm between your palms</li><li>Apply generously to hands and massage into the skin</li><li>Pay special attention to cuticles and between fingers</li><li>Use regularly, especially before bed for overnight treatment</li><li>For best results, use 2-3 times daily</li></ol><p><strong>Tip:</strong> Apply to damp hands to lock in moisture. Safe for sensitive skin.</p>'
    },
    {
      key: 'SHIPPING_CARE_INFO',
      type: 'text',
      description: 'Shipping and care information',
      defaultValue: '<p><strong>Shipping:</strong></p><ul><li>Free shipping on orders over ¥10,000</li><li>Standard delivery: 2-4 business days</li><li>Express delivery available</li><li>Ships from Japan</li></ul><p><strong>Storage:</strong></p><ul><li>Store in a cool, dry place away from direct sunlight</li><li>Keep container tightly closed when not in use</li><li>Shelf life: 24 months from date of manufacture</li></ul><p><strong>Return Policy:</strong></p><p>Unopened products can be returned within 30 days of purchase for a full refund.</p>'
    }
  ],
  animations: [
    {
      trigger: 'scroll',
      type: 'fade-in',
      duration: '0.6s',
      delay: '0.2s'
    },
    {
      trigger: 'load',
      type: 'fade-in-up',
      duration: '0.6s'
    }
  ]
};
