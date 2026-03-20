import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const FOOTER_MINIMAL_CENTERED: SectionTemplate = {
  id: 'footer-minimal-centered',
  category: 'footer' as SectionCategory,
  variant: 'centered' as SectionVariant,
  name: 'Minimal Centered Footer',
  description: 'Minimal centered footer with social icons, clean single-column layout. Perfect for modern, minimal brand aesthetics.',
  tones: ['minimal', 'modern', 'cool'] as DesignTone[],
  html: `<footer data-section-id="footer-minimal-centered" class="footer-minimal-centered">
  <div class="footer-minimal-centered__container">
    <div class="footer-minimal-centered__content">
      <h3 class="footer-minimal-centered__brand">{{BRAND_NAME}}</h3>
      <p class="footer-minimal-centered__tagline">{{BRAND_TAGLINE}}</p>
    </div>

    <nav class="footer-minimal-centered__nav">
      <ul class="footer-minimal-centered__nav-list">
        <li><a href="{{LINK_1_URL}}" class="footer-minimal-centered__nav-link">{{LINK_1_TEXT}}</a></li>
        <li><a href="{{LINK_2_URL}}" class="footer-minimal-centered__nav-link">{{LINK_2_TEXT}}</a></li>
        <li><a href="{{LINK_3_URL}}" class="footer-minimal-centered__nav-link">{{LINK_3_TEXT}}</a></li>
        <li><a href="{{LINK_4_URL}}" class="footer-minimal-centered__nav-link">{{LINK_4_TEXT}}</a></li>
      </ul>
    </nav>

    <div class="footer-minimal-centered__social">
      <a href="{{SOCIAL_1_URL}}" class="footer-minimal-centered__social-link" title="{{SOCIAL_1_LABEL}}">{{SOCIAL_1_ICON}}</a>
      <a href="{{SOCIAL_2_URL}}" class="footer-minimal-centered__social-link" title="{{SOCIAL_2_LABEL}}">{{SOCIAL_2_ICON}}</a>
      <a href="{{SOCIAL_3_URL}}" class="footer-minimal-centered__social-link" title="{{SOCIAL_3_LABEL}}">{{SOCIAL_3_ICON}}</a>
      <a href="{{SOCIAL_4_URL}}" class="footer-minimal-centered__social-link" title="{{SOCIAL_4_LABEL}}">{{SOCIAL_4_ICON}}</a>
    </div>

    <div class="footer-minimal-centered__bottom">
      <p class="footer-minimal-centered__copyright">{{COPYRIGHT_TEXT}}</p>
      <div class="footer-minimal-centered__legal">
        <a href="{{PRIVACY_URL}}" class="footer-minimal-centered__legal-link">Privacy Policy</a>
        <span class="footer-minimal-centered__legal-separator">•</span>
        <a href="{{TERMS_URL}}" class="footer-minimal-centered__legal-link">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>`,
  css: `
.footer-minimal-centered {
  width: 100%;
  padding: 60px 20px 40px;
  background-color: var(--color-bg);
  color: var(--color-text);
  border-top: 1px solid var(--color-border);
}

.footer-minimal-centered__container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  text-align: center;
}

.footer-minimal-centered__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-minimal-centered__brand {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  font-family: var(--font-heading);
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.footer-minimal-centered__tagline {
  font-size: 14px;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  max-width: 500px;
  line-height: 1.6;
}

.footer-minimal-centered__nav {
  width: 100%;
}

.footer-minimal-centered__nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
}

.footer-minimal-centered__nav-link {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-muted);
  text-decoration: none;
  font-family: var(--font-body);
  transition: all 0.3s ease;
  position: relative;
}

.footer-minimal-centered__nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--color-accent);
  transition: width 0.3s ease;
}

.footer-minimal-centered__nav-link:hover {
  color: var(--color-text);
}

.footer-minimal-centered__nav-link:hover::after {
  width: 100%;
}

.footer-minimal-centered__social {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
}

.footer-minimal-centered__social-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  text-decoration: none;
  font-size: 18px;
  transition: all 0.3s ease;
}

.footer-minimal-centered__social-link:hover {
  background-color: var(--color-accent);
  color: #ffffff;
  border-color: var(--color-accent);
  transform: translateY(-3px);
}

.footer-minimal-centered__bottom {
  width: 100%;
  padding-top: 32px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.footer-minimal-centered__copyright {
  font-size: 13px;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
}

.footer-minimal-centered__legal {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.footer-minimal-centered__legal-link {
  font-size: 12px;
  color: var(--color-muted);
  text-decoration: none;
  font-family: var(--font-body);
  transition: color 0.3s ease;
}

.footer-minimal-centered__legal-link:hover {
  color: var(--color-text);
}

.footer-minimal-centered__legal-separator {
  color: var(--color-border);
}

@media (min-width: 768px) {
  .footer-minimal-centered {
    padding: 80px 40px 50px;
  }

  .footer-minimal-centered__container {
    gap: 48px;
  }

  .footer-minimal-centered__brand {
    font-size: 28px;
  }

  .footer-minimal-centered__nav-list {
    gap: 40px;
  }

  .footer-minimal-centered__social {
    gap: 24px;
  }

  .footer-minimal-centered__social-link {
    width: 44px;
    height: 44px;
  }
}

@media (min-width: 1024px) {
  .footer-minimal-centered {
    padding: 100px 60px 60px;
  }

  .footer-minimal-centered__container {
    gap: 56px;
  }

  .footer-minimal-centered__brand {
    font-size: 32px;
  }

  .footer-minimal-centered__tagline {
    font-size: 15px;
  }

  .footer-minimal-centered__nav-list {
    gap: 48px;
  }

  .footer-minimal-centered__nav-link {
    font-size: 14px;
  }

  .footer-minimal-centered__social {
    gap: 28px;
  }

  .footer-minimal-centered__social-link {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .footer-minimal-centered__copyright {
    font-size: 14px;
  }

  .footer-minimal-centered__legal-link {
    font-size: 13px;
  }
}
  `,
  placeholders: [
    {
      key: 'BRAND_NAME',
      type: 'text',
      description: 'Brand or company name',
      defaultValue: 'Brand Studio'
    },
    {
      key: 'BRAND_TAGLINE',
      type: 'text',
      description: 'Brand tagline or motto',
      defaultValue: 'Crafting timeless designs for modern brands'
    },
    {
      key: 'LINK_1_TEXT',
      type: 'text',
      description: 'First navigation link text',
      defaultValue: 'About'
    },
    {
      key: 'LINK_1_URL',
      type: 'url',
      description: 'First navigation link URL',
      defaultValue: '/about'
    },
    {
      key: 'LINK_2_TEXT',
      type: 'text',
      description: 'Second navigation link text',
      defaultValue: 'Products'
    },
    {
      key: 'LINK_2_URL',
      type: 'url',
      description: 'Second navigation link URL',
      defaultValue: '/products'
    },
    {
      key: 'LINK_3_TEXT',
      type: 'text',
      description: 'Third navigation link text',
      defaultValue: 'Contact'
    },
    {
      key: 'LINK_3_URL',
      type: 'url',
      description: 'Third navigation link URL',
      defaultValue: '/contact'
    },
    {
      key: 'LINK_4_TEXT',
      type: 'text',
      description: 'Fourth navigation link text',
      defaultValue: 'Journal'
    },
    {
      key: 'LINK_4_URL',
      type: 'url',
      description: 'Fourth navigation link URL',
      defaultValue: '/blog'
    },
    {
      key: 'SOCIAL_1_ICON',
      type: 'text',
      description: 'First social icon (emoji or text)',
      defaultValue: 'f'
    },
    {
      key: 'SOCIAL_1_LABEL',
      type: 'text',
      description: 'First social platform label',
      defaultValue: 'Facebook'
    },
    {
      key: 'SOCIAL_1_URL',
      type: 'url',
      description: 'First social link',
      defaultValue: 'https://facebook.com'
    },
    {
      key: 'SOCIAL_2_ICON',
      type: 'text',
      description: 'Second social icon (emoji or text)',
      defaultValue: 'in'
    },
    {
      key: 'SOCIAL_2_LABEL',
      type: 'text',
      description: 'Second social platform label',
      defaultValue: 'LinkedIn'
    },
    {
      key: 'SOCIAL_2_URL',
      type: 'url',
      description: 'Second social link',
      defaultValue: 'https://linkedin.com'
    },
    {
      key: 'SOCIAL_3_ICON',
      type: 'text',
      description: 'Third social icon (emoji or text)',
      defaultValue: '🐦'
    },
    {
      key: 'SOCIAL_3_LABEL',
      type: 'text',
      description: 'Third social platform label',
      defaultValue: 'Twitter'
    },
    {
      key: 'SOCIAL_3_URL',
      type: 'url',
      description: 'Third social link',
      defaultValue: 'https://twitter.com'
    },
    {
      key: 'SOCIAL_4_ICON',
      type: 'text',
      description: 'Fourth social icon (emoji or text)',
      defaultValue: '📷'
    },
    {
      key: 'SOCIAL_4_LABEL',
      type: 'text',
      description: 'Fourth social platform label',
      defaultValue: 'Instagram'
    },
    {
      key: 'SOCIAL_4_URL',
      type: 'url',
      description: 'Fourth social link',
      defaultValue: 'https://instagram.com'
    },
    {
      key: 'COPYRIGHT_TEXT',
      type: 'text',
      description: 'Copyright notice',
      defaultValue: '© 2024 Brand Studio. All rights reserved.'
    },
    {
      key: 'PRIVACY_URL',
      type: 'url',
      description: 'Privacy policy URL',
      defaultValue: '/privacy'
    },
    {
      key: 'TERMS_URL',
      type: 'url',
      description: 'Terms of service URL',
      defaultValue: '/terms'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'load',
      type: 'fadeIn',
      duration: '0.6s',
      delay: '0s'
    },
    {
      trigger: 'scroll',
      type: 'fadeInUp',
      duration: '0.8s'
    },
    {
      trigger: 'hover',
      type: 'lift',
      duration: '0.3s'
    }
  ] as AnimationDef[]
};

export { FOOTER_MINIMAL_CENTERED };
