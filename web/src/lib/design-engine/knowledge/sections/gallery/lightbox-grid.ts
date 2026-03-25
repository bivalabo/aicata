import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const GALLERY_LIGHTBOX_GRID: SectionTemplate = {
  id: 'gallery-lightbox-grid',
  category: 'gallery' as SectionCategory,
  variant: 'grid' as SectionVariant,
  name: 'Lightbox Grid Gallery',
  description: 'Image gallery grid with hover zoom effects and CSS-only lightbox capability. Perfect for showcasing portfolios, products, or visual stories.',
  tones: ['modern', 'minimal', 'bold'] as DesignTone[],
  html: `<section data-section-id="gallery-lightbox-grid" class="gallery-lightbox-grid">
  <div class="gallery-lightbox-grid__container">
    <div class="gallery-lightbox-grid__header">
      <h2 class="gallery-lightbox-grid__title">{{SECTION_TITLE}}</h2>
      <p class="gallery-lightbox-grid__subtitle">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="gallery-lightbox-grid__grid">
      <a href="{{GALLERY_1_IMAGE}}" class="gallery-lightbox-grid__item gallery-lightbox-grid__item--span-2" data-lightbox="gallery">
        <img src="{{GALLERY_1_THUMBNAIL}}" alt="{{GALLERY_1_ALT}}" class="gallery-lightbox-grid__image" />
        <div class="gallery-lightbox-grid__zoom-icon">⚡</div>
      </a>
      <a href="{{GALLERY_2_IMAGE}}" class="gallery-lightbox-grid__item" data-lightbox="gallery">
        <img src="{{GALLERY_2_THUMBNAIL}}" alt="{{GALLERY_2_ALT}}" class="gallery-lightbox-grid__image" />
        <div class="gallery-lightbox-grid__zoom-icon">⚡</div>
      </a>
      <a href="{{GALLERY_3_IMAGE}}" class="gallery-lightbox-grid__item" data-lightbox="gallery">
        <img src="{{GALLERY_3_THUMBNAIL}}" alt="{{GALLERY_3_ALT}}" class="gallery-lightbox-grid__image" />
        <div class="gallery-lightbox-grid__zoom-icon">⚡</div>
      </a>
      <a href="{{GALLERY_4_IMAGE}}" class="gallery-lightbox-grid__item" data-lightbox="gallery">
        <img src="{{GALLERY_4_THUMBNAIL}}" alt="{{GALLERY_4_ALT}}" class="gallery-lightbox-grid__image" />
        <div class="gallery-lightbox-grid__zoom-icon">⚡</div>
      </a>
      <a href="{{GALLERY_5_IMAGE}}" class="gallery-lightbox-grid__item" data-lightbox="gallery">
        <img src="{{GALLERY_5_THUMBNAIL}}" alt="{{GALLERY_5_ALT}}" class="gallery-lightbox-grid__image" />
        <div class="gallery-lightbox-grid__zoom-icon">⚡</div>
      </a>
      <a href="{{GALLERY_6_IMAGE}}" class="gallery-lightbox-grid__item gallery-lightbox-grid__item--span-2" data-lightbox="gallery">
        <img src="{{GALLERY_6_THUMBNAIL}}" alt="{{GALLERY_6_ALT}}" class="gallery-lightbox-grid__image" />
        <div class="gallery-lightbox-grid__zoom-icon">⚡</div>
      </a>
    </div>
  </div>
</section>`,
  css: `
.gallery-lightbox-grid {
  width: 100%;
  padding: 60px 20px;
  background-color: var(--color-bg);
  color: var(--color-text);
}

.gallery-lightbox-grid__container {
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-lightbox-grid__header {
  text-align: center;
  margin-bottom: 50px;
}

.gallery-lightbox-grid__title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px;
  font-family: var(--font-heading);
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.gallery-lightbox-grid__subtitle {
  font-size: 16px;
  color: var(--color-muted);
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.gallery-lightbox-grid__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  auto-rows: 250px;
}

.gallery-lightbox-grid__item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  display: block;
  transition: all 0.3s ease;
}

.gallery-lightbox-grid__item--span-2 {
  grid-column: span 2;
  grid-row: span 1;
}

.gallery-lightbox-grid__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.320, 1);
}

.gallery-lightbox-grid__item:hover .gallery-lightbox-grid__image {
  transform: scale(1.15);
}

.gallery-lightbox-grid__zoom-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--color-accent-rgb), 0.95);
  border-radius: 50%;
  font-size: 24px;
  color: #ffffff;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
}

.gallery-lightbox-grid__item:hover .gallery-lightbox-grid__zoom-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.gallery-lightbox-grid__item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.gallery-lightbox-grid__item:hover::before {
  opacity: 1;
}

@media (min-width: 768px) {
  .gallery-lightbox-grid {
    padding: 80px 40px;
  }

  .gallery-lightbox-grid__title {
    font-size: 40px;
  }

  .gallery-lightbox-grid__grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    auto-rows: 280px;
  }

  .gallery-lightbox-grid__item--span-2 {
    grid-column: span 2;
  }
}

@media (max-width: 480px) {
  .gallery-lightbox-grid__grid {
    grid-template-columns: 1fr !important;
  }
  .gallery-lightbox-grid__item--span-2 {
    grid-column: span 1;
  }
}

@media (min-width: 1024px) {
  .gallery-lightbox-grid {
    padding: 100px 60px;
  }

  .gallery-lightbox-grid__title {
    font-size: 48px;
  }

  .gallery-lightbox-grid__grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    auto-rows: 300px;
  }

  .gallery-lightbox-grid__item--span-2 {
    grid-column: span 2;
    grid-row: span 1;
  }

  .gallery-lightbox-grid__zoom-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }
}
  `,
  placeholders: [
    {
      key: 'SECTION_TITLE',
      type: 'text',
      description: 'Section heading',
      defaultValue: 'Gallery'
    },
    {
      key: 'SECTION_SUBTITLE',
      type: 'text',
      description: 'Section subtitle',
      defaultValue: 'Explore our visual collection'
    },
    {
      key: 'GALLERY_1_IMAGE',
      type: 'image',
      description: 'Gallery item 1 full resolution image',
      defaultValue: 'https://images.unsplash.com/photo-1495067917819-bad636151ffe?w=1200&q=80'
    },
    {
      key: 'GALLERY_1_THUMBNAIL',
      type: 'image',
      description: 'Gallery item 1 thumbnail',
      defaultValue: 'https://images.unsplash.com/photo-1495067917819-bad636151ffe?w=600&q=80'
    },
    {
      key: 'GALLERY_1_ALT',
      type: 'text',
      description: 'Gallery item 1 alt text',
      defaultValue: 'Gallery image 1'
    },
    {
      key: 'GALLERY_2_IMAGE',
      type: 'image',
      description: 'Gallery item 2 full resolution image',
      defaultValue: 'https://images.unsplash.com/photo-1505738927281-d71bcabd7d59?w=1200&q=80'
    },
    {
      key: 'GALLERY_2_THUMBNAIL',
      type: 'image',
      description: 'Gallery item 2 thumbnail',
      defaultValue: 'https://images.unsplash.com/photo-1505738927281-d71bcabd7d59?w=600&q=80'
    },
    {
      key: 'GALLERY_2_ALT',
      type: 'text',
      description: 'Gallery item 2 alt text',
      defaultValue: 'Gallery image 2'
    },
    {
      key: 'GALLERY_3_IMAGE',
      type: 'image',
      description: 'Gallery item 3 full resolution image',
      defaultValue: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80'
    },
    {
      key: 'GALLERY_3_THUMBNAIL',
      type: 'image',
      description: 'Gallery item 3 thumbnail',
      defaultValue: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80'
    },
    {
      key: 'GALLERY_3_ALT',
      type: 'text',
      description: 'Gallery item 3 alt text',
      defaultValue: 'Gallery image 3'
    },
    {
      key: 'GALLERY_4_IMAGE',
      type: 'image',
      description: 'Gallery item 4 full resolution image',
      defaultValue: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80'
    },
    {
      key: 'GALLERY_4_THUMBNAIL',
      type: 'image',
      description: 'Gallery item 4 thumbnail',
      defaultValue: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'
    },
    {
      key: 'GALLERY_4_ALT',
      type: 'text',
      description: 'Gallery item 4 alt text',
      defaultValue: 'Gallery image 4'
    },
    {
      key: 'GALLERY_5_IMAGE',
      type: 'image',
      description: 'Gallery item 5 full resolution image',
      defaultValue: 'https://images.unsplash.com/photo-1511635408821-6b7fa84c0b3f?w=1200&q=80'
    },
    {
      key: 'GALLERY_5_THUMBNAIL',
      type: 'image',
      description: 'Gallery item 5 thumbnail',
      defaultValue: 'https://images.unsplash.com/photo-1511635408821-6b7fa84c0b3f?w=600&q=80'
    },
    {
      key: 'GALLERY_5_ALT',
      type: 'text',
      description: 'Gallery item 5 alt text',
      defaultValue: 'Gallery image 5'
    },
    {
      key: 'GALLERY_6_IMAGE',
      type: 'image',
      description: 'Gallery item 6 full resolution image',
      defaultValue: 'https://images.unsplash.com/photo-1503477521446-6141f3ece9e4?w=1200&q=80'
    },
    {
      key: 'GALLERY_6_THUMBNAIL',
      type: 'image',
      description: 'Gallery item 6 thumbnail',
      defaultValue: 'https://images.unsplash.com/photo-1503477521446-6141f3ece9e4?w=600&q=80'
    },
    {
      key: 'GALLERY_6_ALT',
      type: 'text',
      description: 'Gallery item 6 alt text',
      defaultValue: 'Gallery image 6'
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
      type: 'imageZoom',
      duration: '0.6s'
    }
  ] as AnimationDef[]
};

export { GALLERY_LIGHTBOX_GRID };
