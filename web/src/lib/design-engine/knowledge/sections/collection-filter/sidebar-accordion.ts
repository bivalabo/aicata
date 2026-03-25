import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

export const COLLECTION_FILTER_SIDEBAR: SectionTemplate = {
  id: 'collection-filter-sidebar',
  name: 'Sidebar Filter Accordion',
  category: 'collection-filter' as SectionCategory,
  variant: 'sidebar' as SectionVariant,
  description: 'Left sidebar filter with CSS-only accordion sections for Category, Price Range, Color, and Size filtering',
  tones: ['minimal', 'modern', 'elegant'] as DesignTone[],

  placeholders: [] as PlaceholderDef[],

  html: `
    <aside
      data-section-id="collection-filter-sidebar"
      class="collection-filter-sidebar"
      style="
        --color-bg: #ffffff;
        --color-text: #1a1a1a;
        --color-accent: #000000;
        --color-border: #e5e5e5;
        --font-heading: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --spacing-unit: 1rem;
      "
    >
      <div class="collection-filter-sidebar__wrapper">
        <div class="collection-filter-sidebar__header">
          <h3 class="collection-filter-sidebar__title">Filters</h3>
          <button class="collection-filter-sidebar__reset">Reset All</button>
        </div>

        <!-- Category Filter -->
        <div class="collection-filter-sidebar__group">
          <input
            type="checkbox"
            id="filter-category-toggle"
            class="collection-filter-sidebar__toggle"
            checked
          />
          <label
            for="filter-category-toggle"
            class="collection-filter-sidebar__label"
          >
            <span class="collection-filter-sidebar__label-text">Category</span>
            <span class="collection-filter-sidebar__label-icon">−</span>
          </label>
          <div class="collection-filter-sidebar__content">
            <div class="collection-filter-sidebar__option">
              <input
                type="checkbox"
                id="category-all"
                class="collection-filter-sidebar__checkbox"
                checked
              />
              <label for="category-all" class="collection-filter-sidebar__option-label">
                All Products
              </label>
              <span class="collection-filter-sidebar__option-count">(234)</span>
            </div>
            <div class="collection-filter-sidebar__option">
              <input
                type="checkbox"
                id="category-men"
                class="collection-filter-sidebar__checkbox"
              />
              <label for="category-men" class="collection-filter-sidebar__option-label">
                Men's
              </label>
              <span class="collection-filter-sidebar__option-count">(89)</span>
            </div>
            <div class="collection-filter-sidebar__option">
              <input
                type="checkbox"
                id="category-women"
                class="collection-filter-sidebar__checkbox"
              />
              <label for="category-women" class="collection-filter-sidebar__option-label">
                Women's
              </label>
              <span class="collection-filter-sidebar__option-count">(112)</span>
            </div>
            <div class="collection-filter-sidebar__option">
              <input
                type="checkbox"
                id="category-accessories"
                class="collection-filter-sidebar__checkbox"
              />
              <label for="category-accessories" class="collection-filter-sidebar__option-label">
                Accessories
              </label>
              <span class="collection-filter-sidebar__option-count">(33)</span>
            </div>
          </div>
        </div>

        <!-- Price Filter -->
        <div class="collection-filter-sidebar__group">
          <input
            type="checkbox"
            id="filter-price-toggle"
            class="collection-filter-sidebar__toggle"
            checked
          />
          <label
            for="filter-price-toggle"
            class="collection-filter-sidebar__label"
          >
            <span class="collection-filter-sidebar__label-text">Price Range</span>
            <span class="collection-filter-sidebar__label-icon">−</span>
          </label>
          <div class="collection-filter-sidebar__content">
            <div class="collection-filter-sidebar__option">
              <input
                type="checkbox"
                id="price-all"
                class="collection-filter-sidebar__checkbox"
                checked
              />
              <label for="price-all" class="collection-filter-sidebar__option-label">
                All Prices
              </label>
            </div>
            <div class="collection-filter-sidebar__option">
              <input
                type="checkbox"
                id="price-under-50"
                class="collection-filter-sidebar__checkbox"
              />
              <label for="price-under-50" class="collection-filter-sidebar__option-label">
                Under $50
              </label>
              <span class="collection-filter-sidebar__option-count">(67)</span>
            </div>
            <div class="collection-filter-sidebar__option">
              <input
                type="checkbox"
                id="price-50-100"
                class="collection-filter-sidebar__checkbox"
              />
              <label for="price-50-100" class="collection-filter-sidebar__option-label">
                $50 — $100
              </label>
              <span class="collection-filter-sidebar__option-count">(89)</span>
            </div>
            <div class="collection-filter-sidebar__option">
              <input
                type="checkbox"
                id="price-100-200"
                class="collection-filter-sidebar__checkbox"
              />
              <label for="price-100-200" class="collection-filter-sidebar__option-label">
                $100 — $200
              </label>
              <span class="collection-filter-sidebar__option-count">(56)</span>
            </div>
            <div class="collection-filter-sidebar__option">
              <input
                type="checkbox"
                id="price-over-200"
                class="collection-filter-sidebar__checkbox"
              />
              <label for="price-over-200" class="collection-filter-sidebar__option-label">
                Over $200
              </label>
              <span class="collection-filter-sidebar__option-count">(22)</span>
            </div>
          </div>
        </div>

        <!-- Color Filter -->
        <div class="collection-filter-sidebar__group">
          <input
            type="checkbox"
            id="filter-color-toggle"
            class="collection-filter-sidebar__toggle"
            checked
          />
          <label
            for="filter-color-toggle"
            class="collection-filter-sidebar__label"
          >
            <span class="collection-filter-sidebar__label-text">Color</span>
            <span class="collection-filter-sidebar__label-icon">−</span>
          </label>
          <div class="collection-filter-sidebar__content">
            <div class="collection-filter-sidebar__color-options">
              <div class="collection-filter-sidebar__color-option">
                <input
                  type="checkbox"
                  id="color-black"
                  class="collection-filter-sidebar__color-checkbox"
                />
                <label for="color-black" class="collection-filter-sidebar__color-label" style="background-color: #000000;"></label>
              </div>
              <div class="collection-filter-sidebar__color-option">
                <input
                  type="checkbox"
                  id="color-white"
                  class="collection-filter-sidebar__color-checkbox"
                />
                <label for="color-white" class="collection-filter-sidebar__color-label" style="background-color: #ffffff; border: 1px solid #ddd;"></label>
              </div>
              <div class="collection-filter-sidebar__color-option">
                <input
                  type="checkbox"
                  id="color-navy"
                  class="collection-filter-sidebar__color-checkbox"
                />
                <label for="color-navy" class="collection-filter-sidebar__color-label" style="background-color: #1a3a52;"></label>
              </div>
              <div class="collection-filter-sidebar__color-option">
                <input
                  type="checkbox"
                  id="color-gray"
                  class="collection-filter-sidebar__color-checkbox"
                />
                <label for="color-gray" class="collection-filter-sidebar__color-label" style="background-color: #999999;"></label>
              </div>
              <div class="collection-filter-sidebar__color-option">
                <input
                  type="checkbox"
                  id="color-red"
                  class="collection-filter-sidebar__color-checkbox"
                />
                <label for="color-red" class="collection-filter-sidebar__color-label" style="background-color: #c41e3a;"></label>
              </div>
              <div class="collection-filter-sidebar__color-option">
                <input
                  type="checkbox"
                  id="color-brown"
                  class="collection-filter-sidebar__color-checkbox"
                />
                <label for="color-brown" class="collection-filter-sidebar__color-label" style="background-color: #8b6f47;"></label>
              </div>
            </div>
          </div>
        </div>

        <!-- Size Filter -->
        <div class="collection-filter-sidebar__group">
          <input
            type="checkbox"
            id="filter-size-toggle"
            class="collection-filter-sidebar__toggle"
            checked
          />
          <label
            for="filter-size-toggle"
            class="collection-filter-sidebar__label"
          >
            <span class="collection-filter-sidebar__label-text">Size</span>
            <span class="collection-filter-sidebar__label-icon">−</span>
          </label>
          <div class="collection-filter-sidebar__content">
            <div class="collection-filter-sidebar__size-options">
              <div class="collection-filter-sidebar__size-option">
                <input
                  type="checkbox"
                  id="size-xs"
                  class="collection-filter-sidebar__size-checkbox"
                />
                <label for="size-xs" class="collection-filter-sidebar__size-label">
                  XS
                </label>
              </div>
              <div class="collection-filter-sidebar__size-option">
                <input
                  type="checkbox"
                  id="size-s"
                  class="collection-filter-sidebar__size-checkbox"
                />
                <label for="size-s" class="collection-filter-sidebar__size-label">
                  S
                </label>
              </div>
              <div class="collection-filter-sidebar__size-option">
                <input
                  type="checkbox"
                  id="size-m"
                  class="collection-filter-sidebar__size-checkbox"
                />
                <label for="size-m" class="collection-filter-sidebar__size-label">
                  M
                </label>
              </div>
              <div class="collection-filter-sidebar__size-option">
                <input
                  type="checkbox"
                  id="size-l"
                  class="collection-filter-sidebar__size-checkbox"
                />
                <label for="size-l" class="collection-filter-sidebar__size-label">
                  L
                </label>
              </div>
              <div class="collection-filter-sidebar__size-option">
                <input
                  type="checkbox"
                  id="size-xl"
                  class="collection-filter-sidebar__size-checkbox"
                />
                <label for="size-xl" class="collection-filter-sidebar__size-label">
                  XL
                </label>
              </div>
              <div class="collection-filter-sidebar__size-option">
                <input
                  type="checkbox"
                  id="size-xxl"
                  class="collection-filter-sidebar__size-checkbox"
                />
                <label for="size-xxl" class="collection-filter-sidebar__size-label">
                  XXL
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  `,

  css: `
    .collection-filter-sidebar {
      --width: 280px;
      --padding: 1.5rem;
      --gap: 1.5rem;
      --border-color: #e5e5e5;
      --hover-bg: #f9f9f9;
      --transition: all 0.3s ease;
    }

    .collection-filter-sidebar__wrapper {
      width: var(--width);
      padding: var(--padding);
      background-color: var(--color-bg);
      border-right: 1px solid var(--border-color);
      height: 100%;
    }

    .collection-filter-sidebar__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--gap);
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .collection-filter-sidebar__title {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      color: var(--color-text);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .collection-filter-sidebar__reset {
      padding: 0;
      background: none;
      border: none;
      font-family: var(--font-body);
      font-size: 0.85rem;
      color: #999;
      cursor: pointer;
      text-decoration: underline;
      transition: var(--transition);
    }

    .collection-filter-sidebar__reset:hover {
      color: var(--color-text);
    }

    /* Accordion Structure */
    .collection-filter-sidebar__group {
      margin-bottom: var(--gap);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: var(--gap);
    }

    .collection-filter-sidebar__group:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    /* Toggle (hidden checkbox) */
    .collection-filter-sidebar__toggle {
      display: none;
    }

    /* Accordion Label */
    .collection-filter-sidebar__label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      cursor: pointer;
      user-select: none;
      transition: var(--transition);
    }

    .collection-filter-sidebar__label:hover {
      color: var(--color-accent);
    }

    .collection-filter-sidebar__label-text {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .collection-filter-sidebar__label-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      font-size: 1.2rem;
      color: #999;
      transition: transform 0.3s ease;
    }

    /* Accordion Content (hidden by default) */
    .collection-filter-sidebar__content {
      max-height: 500px;
      overflow: hidden;
      opacity: 1;
      transition: all 0.3s ease;
    }

    /* When toggle is NOT checked, hide content */
    .collection-filter-sidebar__toggle:not(:checked) ~ .collection-filter-sidebar__content {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
    }

    /* Rotate icon when collapsed */
    .collection-filter-sidebar__toggle:not(:checked) ~ .collection-filter-sidebar__label .collection-filter-sidebar__label-icon {
      transform: rotate(-90deg);
    }

    /* Filter Options */
    .collection-filter-sidebar__option {
      display: flex;
      align-items: center;
      padding: 0.6rem 0;
      gap: 0.75rem;
    }

    .collection-filter-sidebar__checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: var(--color-accent);
      flex-shrink: 0;
    }

    .collection-filter-sidebar__option-label {
      flex: 1;
      font-family: var(--font-body);
      font-size: 0.95rem;
      color: var(--color-text);
      cursor: pointer;
      user-select: none;
      transition: var(--transition);
    }

    .collection-filter-sidebar__option:hover .collection-filter-sidebar__option-label {
      color: var(--color-accent);
    }

    .collection-filter-sidebar__option-count {
      font-family: var(--font-body);
      font-size: 0.85rem;
      color: #999;
      margin-left: auto;
      flex-shrink: 0;
    }

    /* Color Options */
    .collection-filter-sidebar__color-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      padding: 0.5rem 0;
    }

    .collection-filter-sidebar__color-option {
      position: relative;
    }

    .collection-filter-sidebar__color-checkbox {
      display: none;
    }

    .collection-filter-sidebar__color-label {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      border-radius: 4px;
      cursor: pointer;
      transition: var(--transition);
      border: 2px solid transparent;
    }

    .collection-filter-sidebar__color-label:hover {
      border-color: var(--color-accent);
    }

    .collection-filter-sidebar__color-checkbox:checked + .collection-filter-sidebar__color-label {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 1px var(--color-accent);
    }

    /* Size Options */
    .collection-filter-sidebar__size-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      padding: 0.5rem 0;
    }

    .collection-filter-sidebar__size-option {
      position: relative;
    }

    .collection-filter-sidebar__size-checkbox {
      display: none;
    }

    .collection-filter-sidebar__size-label {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.75rem;
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 600;
      border: 1px solid var(--color-border, #e5e5e5);
      border-radius: 4px;
      cursor: pointer;
      transition: var(--transition);
      background-color: var(--color-bg, #fff);
    }

    .collection-filter-sidebar__size-label:hover {
      border-color: var(--color-accent);
    }

    .collection-filter-sidebar__size-checkbox:checked + .collection-filter-sidebar__size-label {
      background-color: var(--color-accent);
      color: white;
      border-color: var(--color-accent);
    }

    @media (max-width: 768px) {
      .collection-filter-sidebar__wrapper {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
      }
    }
  `,

  animations: []
};
