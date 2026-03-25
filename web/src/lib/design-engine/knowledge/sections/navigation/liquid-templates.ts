// ============================================================
// Navigation Section Liquid Templates
//
// Shopify linklists ベースのナビゲーション Liquid テンプレート
// 各セクションの html (プレースホルダーベース) の代わりに
// デプロイ時に使用する Liquid コードを定義
// ============================================================

/**
 * Elegant Dropdown Navigation — Liquid Template
 *
 * Uses: linklists[section.settings.menu].links
 * Supports: 2-level dropdown, logo, search, cart
 */
export const LIQUID_NAV_ELEGANT_DROPDOWN = `
{%- liquid
  assign menu = linklists[section.settings.menu]
-%}

<nav class="nav-elegant-dropdown" role="navigation" aria-label="{{ section.settings.menu | default: 'Main menu' }}">
  <div class="nav-elegant-dropdown__container">
    <!-- Logo -->
    <div class="nav-elegant-dropdown__logo">
      <a href="{{ routes.root_url }}" class="nav-elegant-dropdown__logo-link">
        {%- if section.settings.logo != blank -%}
          {%- assign logo_alt = section.settings.logo.alt | default: shop.name -%}
          {{ section.settings.logo | image_url: width: 200 | image_tag: alt: logo_alt, class: 'nav-elegant-dropdown__logo-img', loading: 'lazy' }}
        {%- else -%}
          {{ shop.name }}
        {%- endif -%}
      </a>
    </div>

    <!-- Desktop Navigation -->
    <ul class="nav-elegant-dropdown__menu">
      {%- for link in menu.links -%}
        <li class="nav-elegant-dropdown__item{% if link.links != blank %} nav-elegant-dropdown__item--has-submenu{% endif %}">
          {%- if link.links != blank -%}
            <button class="nav-elegant-dropdown__link nav-elegant-dropdown__link--submenu"
                    aria-expanded="false" aria-haspopup="true">
              {{ link.title }}
              <svg class="nav-elegant-dropdown__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <ul class="nav-elegant-dropdown__submenu" role="menu">
              {%- for child_link in link.links -%}
                <li role="menuitem">
                  <a href="{{ child_link.url }}" class="nav-elegant-dropdown__submenu-link"
                     {% if child_link.current %} aria-current="page"{% endif %}>
                    {{ child_link.title }}
                  </a>
                </li>
              {%- endfor -%}
            </ul>
          {%- else -%}
            <a href="{{ link.url }}" class="nav-elegant-dropdown__link"
               {% if link.current %} aria-current="page"{% endif %}>
              {{ link.title }}
            </a>
          {%- endif -%}
        </li>
      {%- endfor -%}
    </ul>

    <!-- Right Actions -->
    <div class="nav-elegant-dropdown__actions">
      <a href="{{ routes.search_url }}" class="nav-elegant-dropdown__action-btn nav-elegant-dropdown__search-btn" aria-label="{{ 'general.search.title' | t }}">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" stroke-width="1.5"/><path d="m12 12 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </a>
      <a href="{{ routes.cart_url }}" class="nav-elegant-dropdown__action-btn nav-elegant-dropdown__cart-btn" aria-label="{{ 'cart.general.title' | t }}">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1.5 3h2l2.5 10.5h10l2-8H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="15" r="1.5" fill="currentColor"/><circle cx="13.5" cy="15" r="1.5" fill="currentColor"/></svg>
        <span class="nav-elegant-dropdown__cart-count" data-cart-count>{{ cart.item_count }}</span>
      </a>
      <button class="nav-elegant-dropdown__hamburger" aria-label="{{ 'general.navigation.menu' | t }}" aria-expanded="false" aria-controls="nav-drawer">
        <span class="nav-elegant-dropdown__hamburger-line"></span>
        <span class="nav-elegant-dropdown__hamburger-line"></span>
        <span class="nav-elegant-dropdown__hamburger-line"></span>
      </button>
    </div>
  </div>

  <!-- Mobile Drawer -->
  <div id="nav-drawer" class="nav-elegant-dropdown__drawer" role="dialog" aria-modal="true" aria-label="{{ 'general.navigation.menu' | t }}">
    <div class="nav-elegant-dropdown__drawer-header">
      <button class="nav-elegant-dropdown__drawer-close" aria-label="{{ 'general.accessibility.close' | t }}">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="m2 2 16 16M18 2 2 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
    <ul class="nav-elegant-dropdown__drawer-menu">
      {%- for link in menu.links -%}
        <li>
          {%- if link.links != blank -%}
            <button class="nav-elegant-dropdown__drawer-link nav-elegant-dropdown__drawer-toggle" aria-expanded="false">
              {{ link.title }}
            </button>
            <ul class="nav-elegant-dropdown__drawer-submenu">
              {%- for child_link in link.links -%}
                <li>
                  <a href="{{ child_link.url }}" class="nav-elegant-dropdown__drawer-sublink"
                     {% if child_link.current %} aria-current="page"{% endif %}>
                    {{ child_link.title }}
                  </a>
                </li>
              {%- endfor -%}
            </ul>
          {%- else -%}
            <a href="{{ link.url }}" class="nav-elegant-dropdown__drawer-link"
               {% if link.current %} aria-current="page"{% endif %}>
              {{ link.title }}
            </a>
          {%- endif -%}
        </li>
      {%- endfor -%}
    </ul>
  </div>
  <div class="nav-elegant-dropdown__overlay"></div>
</nav>
`;

/**
 * Minimal Sticky Navigation — Liquid Template
 */
export const LIQUID_NAV_MINIMAL_STICKY = `
{%- liquid
  assign menu = linklists[section.settings.menu]
-%}

<nav class="nav-minimal-sticky{% if section.settings.sticky %} nav-minimal-sticky--fixed{% endif %}"
     role="navigation" aria-label="{{ section.settings.menu | default: 'Main menu' }}">
  <div class="nav-minimal-sticky__container">
    <div class="nav-minimal-sticky__logo">
      <a href="{{ routes.root_url }}" class="nav-minimal-sticky__logo-link">
        {%- if section.settings.logo != blank -%}
          {{ section.settings.logo | image_url: width: 160 | image_tag: alt: shop.name, class: 'nav-minimal-sticky__logo-img', loading: 'lazy' }}
        {%- else -%}
          {{ shop.name }}
        {%- endif -%}
      </a>
    </div>

    <ul class="nav-minimal-sticky__menu">
      {%- for link in menu.links -%}
        <li class="nav-minimal-sticky__item">
          <a href="{{ link.url }}" class="nav-minimal-sticky__link"
             {% if link.current %} aria-current="page"{% endif %}>
            {{ link.title }}
          </a>
        </li>
      {%- endfor -%}
    </ul>

    <div class="nav-minimal-sticky__actions">
      <a href="{{ routes.search_url }}" class="nav-minimal-sticky__action-btn" aria-label="{{ 'general.search.title' | t }}">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" stroke-width="1.5"/><path d="m12 12 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </a>
      <a href="{{ routes.cart_url }}" class="nav-minimal-sticky__action-btn" aria-label="{{ 'cart.general.title' | t }}">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1.5 3h2l2.5 10.5h10l2-8H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="15" r="1.5" fill="currentColor"/><circle cx="13.5" cy="15" r="1.5" fill="currentColor"/></svg>
        <span class="nav-minimal-sticky__cart-count" data-cart-count>{{ cart.item_count }}</span>
      </a>
      <button class="nav-minimal-sticky__hamburger" aria-label="{{ 'general.navigation.menu' | t }}" aria-expanded="false">
        <span class="nav-minimal-sticky__hamburger-line"></span>
        <span class="nav-minimal-sticky__hamburger-line"></span>
      </button>
    </div>
  </div>
</nav>
`;

/**
 * Mega Menu Navigation — Liquid Template
 * Supports 3-level deep menus with image panels
 */
export const LIQUID_NAV_MEGA_MENU = `
{%- liquid
  assign menu = linklists[section.settings.menu]
-%}

<nav class="nav-mega-menu" role="navigation" aria-label="{{ section.settings.menu | default: 'Main menu' }}">
  <div class="nav-mega-menu__container">
    <div class="nav-mega-menu__logo">
      <a href="{{ routes.root_url }}" class="nav-mega-menu__logo-link">
        {%- if section.settings.logo != blank -%}
          {{ section.settings.logo | image_url: width: 200 | image_tag: alt: shop.name, class: 'nav-mega-menu__logo-img', loading: 'lazy' }}
        {%- else -%}
          {{ shop.name }}
        {%- endif -%}
      </a>
    </div>

    <ul class="nav-mega-menu__menu">
      {%- for link in menu.links -%}
        <li class="nav-mega-menu__item{% if link.links != blank %} nav-mega-menu__item--has-mega{% endif %}">
          {%- if link.links != blank -%}
            <button class="nav-mega-menu__link" aria-expanded="false" aria-haspopup="true">
              {{ link.title }}
              <svg class="nav-mega-menu__chevron" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 3l4 4 4-4" stroke="currentColor" stroke-width="1.2"/></svg>
            </button>
            <div class="nav-mega-menu__panel">
              <div class="nav-mega-menu__panel-inner">
                {%- for child_link in link.links -%}
                  <div class="nav-mega-menu__column">
                    <h3 class="nav-mega-menu__column-title">{{ child_link.title }}</h3>
                    {%- if child_link.links != blank -%}
                      <ul class="nav-mega-menu__column-list">
                        {%- for grandchild_link in child_link.links -%}
                          <li>
                            <a href="{{ grandchild_link.url }}" class="nav-mega-menu__column-link"
                               {% if grandchild_link.current %} aria-current="page"{% endif %}>
                              {{ grandchild_link.title }}
                            </a>
                          </li>
                        {%- endfor -%}
                      </ul>
                    {%- else -%}
                      <a href="{{ child_link.url }}" class="nav-mega-menu__column-link nav-mega-menu__column-link--main">
                        {{ 'general.navigation.view_all' | t }}
                      </a>
                    {%- endif -%}
                  </div>
                {%- endfor -%}
              </div>
            </div>
          {%- else -%}
            <a href="{{ link.url }}" class="nav-mega-menu__link"
               {% if link.current %} aria-current="page"{% endif %}>
              {{ link.title }}
            </a>
          {%- endif -%}
        </li>
      {%- endfor -%}
    </ul>

    <div class="nav-mega-menu__actions">
      <a href="{{ routes.search_url }}" class="nav-mega-menu__action-btn" aria-label="{{ 'general.search.title' | t }}">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" stroke-width="1.5"/><path d="m12 12 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </a>
      <a href="{{ routes.cart_url }}" class="nav-mega-menu__action-btn" aria-label="{{ 'cart.general.title' | t }}">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1.5 3h2l2.5 10.5h10l2-8H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="15" r="1.5" fill="currentColor"/><circle cx="13.5" cy="15" r="1.5" fill="currentColor"/></svg>
        <span class="nav-mega-menu__cart-count" data-cart-count>{{ cart.item_count }}</span>
      </a>
      <button class="nav-mega-menu__hamburger" aria-label="{{ 'general.navigation.menu' | t }}" aria-expanded="false">
        <span class="nav-mega-menu__hamburger-line"></span>
        <span class="nav-mega-menu__hamburger-line"></span>
        <span class="nav-mega-menu__hamburger-line"></span>
      </button>
    </div>
  </div>
</nav>
`;

/**
 * Transparent Overlay Navigation — Liquid Template
 */
export const LIQUID_NAV_TRANSPARENT_OVERLAY = `
{%- liquid
  assign menu = linklists[section.settings.menu]
-%}

<nav class="nav-transparent-overlay" role="navigation" aria-label="{{ section.settings.menu | default: 'Main menu' }}">
  <div class="nav-transparent-overlay__container">
    <div class="nav-transparent-overlay__logo">
      <a href="{{ routes.root_url }}" class="nav-transparent-overlay__logo-link">
        {%- if section.settings.logo != blank -%}
          {{ section.settings.logo | image_url: width: 200 | image_tag: alt: shop.name, class: 'nav-transparent-overlay__logo-img', loading: 'lazy' }}
        {%- else -%}
          {{ shop.name }}
        {%- endif -%}
      </a>
    </div>

    <ul class="nav-transparent-overlay__menu">
      {%- for link in menu.links -%}
        <li class="nav-transparent-overlay__item">
          <a href="{{ link.url }}" class="nav-transparent-overlay__link"
             {% if link.current %} aria-current="page"{% endif %}>
            {{ link.title }}
          </a>
        </li>
      {%- endfor -%}
    </ul>

    <div class="nav-transparent-overlay__actions">
      <a href="{{ routes.cart_url }}" class="nav-transparent-overlay__action-btn" aria-label="{{ 'cart.general.title' | t }}">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1.5 3h2l2.5 10.5h10l2-8H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="15" r="1.5" fill="currentColor"/><circle cx="13.5" cy="15" r="1.5" fill="currentColor"/></svg>
        <span class="nav-transparent-overlay__cart-count" data-cart-count>{{ cart.item_count }}</span>
      </a>
      <button class="nav-transparent-overlay__hamburger" aria-label="{{ 'general.navigation.menu' | t }}" aria-expanded="false">
        <span class="nav-transparent-overlay__hamburger-line"></span>
        <span class="nav-transparent-overlay__hamburger-line"></span>
      </button>
    </div>
  </div>
</nav>
`;

/**
 * Category Tabs Navigation — Liquid Template
 * Horizontal scrollable tab bar for collection filtering
 */
export const LIQUID_NAV_CATEGORY_TABS = `
{%- liquid
  assign menu = linklists[section.settings.menu]
-%}

<nav class="nav-category-tabs" role="navigation" aria-label="{{ section.settings.menu | default: 'Categories' }}">
  <div class="nav-category-tabs__container">
    <ul class="nav-category-tabs__list" role="tablist">
      {%- for link in menu.links -%}
        <li class="nav-category-tabs__item" role="presentation">
          <a href="{{ link.url }}"
             class="nav-category-tabs__tab{% if link.active %} nav-category-tabs__tab--active{% endif %}"
             role="tab"
             {% if link.current %} aria-current="page" aria-selected="true"{% endif %}>
            {{ link.title }}
          </a>
        </li>
      {%- endfor -%}
    </ul>
  </div>
</nav>
`;

/**
 * Side Drawer Navigation — Liquid Template
 */
export const LIQUID_NAV_SIDE_DRAWER = `
{%- liquid
  assign menu = linklists[section.settings.menu]
-%}

<nav class="nav-side-drawer" role="navigation" aria-label="{{ section.settings.menu | default: 'Main menu' }}">
  <button class="nav-side-drawer__trigger" aria-label="{{ 'general.navigation.menu' | t }}" aria-expanded="false" aria-controls="side-drawer-panel">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
  </button>

  <div id="side-drawer-panel" class="nav-side-drawer__panel" role="dialog" aria-modal="true">
    <div class="nav-side-drawer__header">
      <a href="{{ routes.root_url }}" class="nav-side-drawer__logo">
        {{ shop.name }}
      </a>
      <button class="nav-side-drawer__close" aria-label="{{ 'general.accessibility.close' | t }}">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="m2 2 16 16M18 2 2 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>

    <ul class="nav-side-drawer__menu">
      {%- for link in menu.links -%}
        <li class="nav-side-drawer__item">
          {%- if link.links != blank -%}
            <button class="nav-side-drawer__link nav-side-drawer__link--parent" aria-expanded="false">
              {{ link.title }}
              <svg class="nav-side-drawer__arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>
            </button>
            <ul class="nav-side-drawer__submenu">
              {%- for child_link in link.links -%}
                <li>
                  <a href="{{ child_link.url }}" class="nav-side-drawer__sublink"
                     {% if child_link.current %} aria-current="page"{% endif %}>
                    {{ child_link.title }}
                  </a>
                </li>
              {%- endfor -%}
            </ul>
          {%- else -%}
            <a href="{{ link.url }}" class="nav-side-drawer__link"
               {% if link.current %} aria-current="page"{% endif %}>
              {{ link.title }}
            </a>
          {%- endif -%}
        </li>
      {%- endfor -%}
    </ul>

    <div class="nav-side-drawer__footer">
      <a href="{{ routes.account_url }}" class="nav-side-drawer__footer-link">{{ 'customer.account.title' | t }}</a>
      <a href="{{ routes.cart_url }}" class="nav-side-drawer__footer-link">{{ 'cart.general.title' | t }} ({{ cart.item_count }})</a>
    </div>
  </div>
  <div class="nav-side-drawer__overlay"></div>
</nav>
`;

/**
 * Navigation section schema settings (shared across all nav sections)
 * These get merged into the {% schema %} block
 */
export const NAV_SCHEMA_SETTINGS = [
  {
    type: "link_list",
    id: "menu",
    label: "メニュー",
    default: "main-menu",
    info: "Shopifyの「メニュー」設定で作成したメニューを選択",
  },
  {
    type: "image_picker",
    id: "logo",
    label: "ロゴ画像",
    info: "空の場合はショップ名をテキスト表示",
  },
  {
    type: "checkbox",
    id: "sticky",
    label: "スクロール時に固定",
    default: true,
  },
  {
    type: "checkbox",
    id: "show_search",
    label: "検索アイコンを表示",
    default: true,
  },
  {
    type: "checkbox",
    id: "show_cart",
    label: "カートアイコンを表示",
    default: true,
  },
];
