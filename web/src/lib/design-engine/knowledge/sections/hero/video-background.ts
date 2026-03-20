import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const HERO_VIDEO_BACKGROUND: SectionTemplate = {
  id: 'hero-video-background',
  category: 'hero' as SectionCategory,
  variant: 'fullbleed' as SectionVariant,
  name: 'Video Background Hero',
  description: 'Fullbleed hero section with video background, gradient overlay, and bold typography overlay. Ideal for tech and modern brands wanting dramatic visual impact.',
  tones: ['bold', 'modern', 'cool'] as DesignTone[],
  html: `<section data-section-id="hero-video-background" class="hero-video-background">
  <div class="hero-video-background__video-wrapper">
    <video
      class="hero-video-background__video"
      autoplay
      muted
      loop
      playsinline
      poster="{{VIDEO_POSTER}}"
    >
      <source src="{{VIDEO_URL}}" type="video/mp4" />
    </video>
    <div class="hero-video-background__overlay"></div>
  </div>
  <div class="hero-video-background__content">
    <div class="hero-video-background__container">
      <span class="hero-video-background__label">{{LABEL}}</span>
      <h1 class="hero-video-background__heading">{{HEADING}}</h1>
      <p class="hero-video-background__description">{{DESCRIPTION}}</p>
      <div class="hero-video-background__cta-group">
        <a href="{{PRIMARY_CTA_URL}}" class="hero-video-background__cta hero-video-background__cta--primary">{{PRIMARY_CTA_TEXT}}</a>
        <a href="{{SECONDARY_CTA_URL}}" class="hero-video-background__cta hero-video-background__cta--secondary">{{SECONDARY_CTA_TEXT}}</a>
      </div>
    </div>
  </div>
</section>`,
  css: `
.hero-video-background {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 500px;
  color: var(--color-text);
  overflow: hidden;
}

.hero-video-background__video-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero-video-background__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-video-background__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 20, 40, 0.6) 100%);
}

.hero-video-background__content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.hero-video-background__container {
  max-width: 700px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-video-background__label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-accent);
  font-family: var(--font-body);
}

.hero-video-background__heading {
  font-size: 42px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -1px;
  font-family: var(--font-heading);
  color: #ffffff;
  margin: 0;
}

.hero-video-background__description {
  font-size: 18px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
}

.hero-video-background__cta-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
  align-items: center;
}

.hero-video-background__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 40px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  cursor: pointer;
}

.hero-video-background__cta--primary {
  background-color: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}

.hero-video-background__cta--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.hero-video-background__cta--secondary {
  background-color: transparent;
  color: #ffffff;
  border-color: #ffffff;
}

.hero-video-background__cta--secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

@media (min-width: 768px) {
  .hero-video-background__heading {
    font-size: 56px;
  }

  .hero-video-background__description {
    font-size: 20px;
  }

  .hero-video-background__cta-group {
    flex-direction: row;
    justify-content: center;
  }

  .hero-video-background__cta {
    padding: 16px 48px;
    font-size: 15px;
  }
}

@media (min-width: 1024px) {
  .hero-video-background {
    height: 100vh;
    min-height: 600px;
  }

  .hero-video-background__heading {
    font-size: 72px;
  }

  .hero-video-background__description {
    font-size: 21px;
  }

  .hero-video-background__container {
    max-width: 800px;
    gap: 24px;
  }

  .hero-video-background__cta {
    padding: 18px 56px;
  }
}
  `,
  placeholders: [
    {
      key: 'LABEL',
      type: 'text',
      description: 'Small accent label above heading',
      defaultValue: 'Next Generation'
    },
    {
      key: 'HEADING',
      type: 'text',
      description: 'Main hero heading',
      defaultValue: 'Experience Innovation'
    },
    {
      key: 'DESCRIPTION',
      type: 'text',
      description: 'Subheading description text',
      defaultValue: 'Cutting-edge technology meets bold design. Transform your vision into reality with our revolutionary platform.'
    },
    {
      key: 'VIDEO_URL',
      type: 'url',
      description: 'Video file URL (MP4 recommended)',
      defaultValue: 'https://videos.unsplash.com/video-1234567890?auto=format&fit=crop&w=1920&q=80'
    },
    {
      key: 'VIDEO_POSTER',
      type: 'image',
      description: 'Poster image shown before video plays',
      defaultValue: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=1920&q=80'
    },
    {
      key: 'PRIMARY_CTA_TEXT',
      type: 'text',
      description: 'Primary call-to-action button text',
      defaultValue: 'Get Started'
    },
    {
      key: 'PRIMARY_CTA_URL',
      type: 'url',
      description: 'Primary CTA destination URL',
      defaultValue: '/start'
    },
    {
      key: 'SECONDARY_CTA_TEXT',
      type: 'text',
      description: 'Secondary call-to-action text',
      defaultValue: 'Learn More'
    },
    {
      key: 'SECONDARY_CTA_URL',
      type: 'url',
      description: 'Secondary CTA destination URL',
      defaultValue: '/about'
    }
  ] as PlaceholderDef[],
  animations: [
    {
      trigger: 'load',
      type: 'fadeInUp',
      duration: '1s',
      delay: '0.2s'
    },
    {
      trigger: 'scroll',
      type: 'parallax',
      duration: '0s'
    },
    {
      trigger: 'hover',
      type: 'lift',
      duration: '0.3s'
    }
  ] as AnimationDef[]
};

export { HERO_VIDEO_BACKGROUND };
