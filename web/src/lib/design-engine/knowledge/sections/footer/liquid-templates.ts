// ============================================================
// Footer Section Liquid Templates
//
// Shopify linklists ベースのフッター Liquid テンプレート
// ============================================================

/**
 * Elegant Columns Footer — Liquid Template
 *
 * Multi-column footer with newsletter, social links, and multiple menus
 */
export const LIQUID_FOOTER_ELEGANT_COLUMNS = `
{%- liquid
  assign footer_menu = linklists[section.settings.footer_menu]
  assign secondary_menu = linklists[section.settings.secondary_menu]
-%}

<footer class="footer-elegant-columns" role="contentinfo">
  <div class="footer-elegant-columns__container">
    <div class="footer-elegant-columns__grid">
      <!-- Brand Column -->
      <div class="footer-elegant-columns__brand">
        <a href="{{ routes.root_url }}" class="footer-elegant-columns__logo">
          {%- if section.settings.logo != blank -%}
            {{ section.settings.logo | image_url: width: 160 | image_tag: alt: shop.name, loading: 'lazy' }}
          {%- else -%}
            {{ shop.name }}
          {%- endif -%}
        </a>
        {%- if section.settings.description != blank -%}
          <p class="footer-elegant-columns__description">{{ section.settings.description }}</p>
        {%- endif -%}

        <!-- Social Links -->
        <div class="footer-elegant-columns__social">
          {%- if shop.social_links -%}
            {%- for link in shop.social_links -%}
              <a href="{{ link.url }}" class="footer-elegant-columns__social-link" aria-label="{{ link.title }}" target="_blank" rel="noopener">
                {{ link.title }}
              </a>
            {%- endfor -%}
          {%- endif -%}
        </div>
      </div>

      <!-- Menu Columns -->
      {%- for link in footer_menu.links -%}
        <div class="footer-elegant-columns__column">
          <h3 class="footer-elegant-columns__heading">{{ link.title }}</h3>
          {%- if link.links != blank -%}
            <ul class="footer-elegant-columns__list">
              {%- for child_link in link.links -%}
                <li>
                  <a href="{{ child_link.url }}" class="footer-elegant-columns__link">
                    {{ child_link.title }}
                  </a>
                </li>
              {%- endfor -%}
            </ul>
          {%- else -%}
            <a href="{{ link.url }}" class="footer-elegant-columns__link">
              {{ link.title }}
            </a>
          {%- endif -%}
        </div>
      {%- endfor -%}

      <!-- Newsletter Column -->
      {%- if section.settings.show_newsletter -%}
        <div class="footer-elegant-columns__column footer-elegant-columns__column--newsletter">
          <h3 class="footer-elegant-columns__heading">{{ section.settings.newsletter_heading | default: 'Newsletter' }}</h3>
          {%- if section.settings.newsletter_text != blank -%}
            <p class="footer-elegant-columns__newsletter-text">{{ section.settings.newsletter_text }}</p>
          {%- endif -%}
          {%- form 'customer', id: 'FooterNewsletter' -%}
            <div class="footer-elegant-columns__newsletter-form">
              <input type="email" name="contact[email]" placeholder="{{ 'general.newsletter.email_placeholder' | t }}"
                     class="footer-elegant-columns__newsletter-input" required aria-label="Email">
              <button type="submit" class="footer-elegant-columns__newsletter-btn">
                {{ section.settings.newsletter_btn_text | default: 'Subscribe' }}
              </button>
            </div>
          {%- endform -%}
        </div>
      {%- endif -%}
    </div>

    <!-- Bottom Bar -->
    <div class="footer-elegant-columns__bottom">
      <div class="footer-elegant-columns__copyright">
        &copy; {{ 'now' | date: '%Y' }} {{ shop.name }}. {{ section.settings.copyright_text | default: 'All rights reserved.' }}
      </div>

      {%- if secondary_menu.links.size > 0 -%}
        <nav class="footer-elegant-columns__bottom-nav" aria-label="Footer secondary">
          {%- for link in secondary_menu.links -%}
            <a href="{{ link.url }}" class="footer-elegant-columns__bottom-link">{{ link.title }}</a>
          {%- endfor -%}
        </nav>
      {%- endif -%}

      {%- if section.settings.show_payment_icons -%}
        <div class="footer-elegant-columns__payment">
          {%- for type in shop.enabled_payment_types -%}
            {{ type | payment_type_svg_tag: class: 'footer-elegant-columns__payment-icon' }}
          {%- endfor -%}
        </div>
      {%- endif -%}
    </div>
  </div>
</footer>
`;

/**
 * Minimal Centered Footer — Liquid Template
 */
export const LIQUID_FOOTER_MINIMAL_CENTERED = `
{%- liquid
  assign footer_menu = linklists[section.settings.footer_menu]
-%}

<footer class="footer-minimal-centered" role="contentinfo">
  <div class="footer-minimal-centered__container">
    <!-- Logo -->
    <div class="footer-minimal-centered__logo">
      <a href="{{ routes.root_url }}">
        {%- if section.settings.logo != blank -%}
          {{ section.settings.logo | image_url: width: 120 | image_tag: alt: shop.name, loading: 'lazy' }}
        {%- else -%}
          {{ shop.name }}
        {%- endif -%}
      </a>
    </div>

    <!-- Navigation -->
    {%- if footer_menu.links.size > 0 -%}
      <nav class="footer-minimal-centered__nav" aria-label="Footer navigation">
        {%- for link in footer_menu.links -%}
          <a href="{{ link.url }}" class="footer-minimal-centered__link">{{ link.title }}</a>
        {%- endfor -%}
      </nav>
    {%- endif -%}

    <!-- Social Links -->
    {%- if section.settings.show_social -%}
      <div class="footer-minimal-centered__social">
        {%- if shop.social_links -%}
          {%- for link in shop.social_links -%}
            <a href="{{ link.url }}" class="footer-minimal-centered__social-link" aria-label="{{ link.title }}" target="_blank" rel="noopener">
              {{ link.title }}
            </a>
          {%- endfor -%}
        {%- endif -%}
      </div>
    {%- endif -%}

    <!-- Copyright -->
    <div class="footer-minimal-centered__copyright">
      &copy; {{ 'now' | date: '%Y' }} {{ shop.name }}. {{ section.settings.copyright_text | default: 'All rights reserved.' }}
    </div>

    {%- if section.settings.show_payment_icons -%}
      <div class="footer-minimal-centered__payment">
        {%- for type in shop.enabled_payment_types -%}
          {{ type | payment_type_svg_tag: class: 'footer-minimal-centered__payment-icon' }}
        {%- endfor -%}
      </div>
    {%- endif -%}
  </div>
</footer>
`;

/**
 * Footer section schema settings (shared across all footer sections)
 */
export const FOOTER_SCHEMA_SETTINGS = [
  {
    type: "link_list",
    id: "footer_menu",
    label: "フッターメニュー",
    default: "footer",
    info: "Shopifyの「メニュー」設定で作成したフッターメニューを選択",
  },
  {
    type: "link_list",
    id: "secondary_menu",
    label: "セカンダリメニュー",
    info: "プライバシーポリシー・利用規約等のリンク（任意）",
  },
  {
    type: "image_picker",
    id: "logo",
    label: "フッターロゴ",
    info: "空の場合はショップ名をテキスト表示",
  },
  {
    type: "textarea",
    id: "description",
    label: "ブランド説明文",
    info: "フッターに表示する短い説明文",
  },
  {
    type: "checkbox",
    id: "show_newsletter",
    label: "ニュースレター登録を表示",
    default: true,
  },
  {
    type: "text",
    id: "newsletter_heading",
    label: "ニュースレター見出し",
    default: "ニュースレター",
  },
  {
    type: "textarea",
    id: "newsletter_text",
    label: "ニュースレター説明文",
    default: "最新情報やお得な情報をお届けします。",
  },
  {
    type: "text",
    id: "newsletter_btn_text",
    label: "登録ボタンテキスト",
    default: "登録する",
  },
  {
    type: "text",
    id: "copyright_text",
    label: "著作権テキスト",
    default: "All rights reserved.",
  },
  {
    type: "checkbox",
    id: "show_social",
    label: "ソーシャルリンクを表示",
    default: true,
  },
  {
    type: "checkbox",
    id: "show_payment_icons",
    label: "決済アイコンを表示",
    default: true,
  },
];
