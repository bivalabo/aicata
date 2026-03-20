import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const SOCIAL_PROOF_INSTAGRAM: SectionTemplate = {
  id: 'social-proof-instagram',
  category: 'social-proof',
  variant: 'grid',
  name: 'Instagram Feed UGC Grid',
  description: 'Instagram-style UGC grid (6 square images) with hover overlay showing likes/caption. "Follow us @brand" CTA.',
  tones: ['modern', 'playful', 'warm'],

  html: `
<section data-section-id="social-proof-instagram" class="social-proof-instagram">
  <div class="social-proof-instagram__container">
    <!-- Section Header -->
    <div class="social-proof-instagram__header">
      <h2 class="social-proof-instagram__title">{{SECTION_TITLE}}</h2>
      <p class="social-proof-instagram__subtitle">{{SECTION_SUBTITLE}}</p>
    </div>

    <!-- Instagram Grid -->
    <div class="social-proof-instagram__grid">
      <!-- Post 1 -->
      <article class="social-proof-instagram__post">
        <img src="{{POST_1_IMAGE}}" alt="{{POST_1_CAPTION}}" class="social-proof-instagram__image" />
        <div class="social-proof-instagram__overlay">
          <div class="social-proof-instagram__stats">
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-6.55 8.53L10 18.35z"/>
              </svg>
              <span>{{POST_1_LIKES}}</span>
            </div>
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <span>{{POST_1_COMMENTS}}</span>
            </div>
          </div>
          <p class="social-proof-instagram__caption">{{POST_1_CAPTION}}</p>
        </div>
      </article>

      <!-- Post 2 -->
      <article class="social-proof-instagram__post">
        <img src="{{POST_2_IMAGE}}" alt="{{POST_2_CAPTION}}" class="social-proof-instagram__image" />
        <div class="social-proof-instagram__overlay">
          <div class="social-proof-instagram__stats">
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-6.55 8.53L10 18.35z"/>
              </svg>
              <span>{{POST_2_LIKES}}</span>
            </div>
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <span>{{POST_2_COMMENTS}}</span>
            </div>
          </div>
          <p class="social-proof-instagram__caption">{{POST_2_CAPTION}}</p>
        </div>
      </article>

      <!-- Post 3 -->
      <article class="social-proof-instagram__post">
        <img src="{{POST_3_IMAGE}}" alt="{{POST_3_CAPTION}}" class="social-proof-instagram__image" />
        <div class="social-proof-instagram__overlay">
          <div class="social-proof-instagram__stats">
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-6.55 8.53L10 18.35z"/>
              </svg>
              <span>{{POST_3_LIKES}}</span>
            </div>
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <span>{{POST_3_COMMENTS}}</span>
            </div>
          </div>
          <p class="social-proof-instagram__caption">{{POST_3_CAPTION}}</p>
        </div>
      </article>

      <!-- Post 4 -->
      <article class="social-proof-instagram__post">
        <img src="{{POST_4_IMAGE}}" alt="{{POST_4_CAPTION}}" class="social-proof-instagram__image" />
        <div class="social-proof-instagram__overlay">
          <div class="social-proof-instagram__stats">
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-6.55 8.53L10 18.35z"/>
              </svg>
              <span>{{POST_4_LIKES}}</span>
            </div>
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <span>{{POST_4_COMMENTS}}</span>
            </div>
          </div>
          <p class="social-proof-instagram__caption">{{POST_4_CAPTION}}</p>
        </div>
      </article>

      <!-- Post 5 -->
      <article class="social-proof-instagram__post">
        <img src="{{POST_5_IMAGE}}" alt="{{POST_5_CAPTION}}" class="social-proof-instagram__image" />
        <div class="social-proof-instagram__overlay">
          <div class="social-proof-instagram__stats">
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-6.55 8.53L10 18.35z"/>
              </svg>
              <span>{{POST_5_LIKES}}</span>
            </div>
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <span>{{POST_5_COMMENTS}}</span>
            </div>
          </div>
          <p class="social-proof-instagram__caption">{{POST_5_CAPTION}}</p>
        </div>
      </article>

      <!-- Post 6 -->
      <article class="social-proof-instagram__post">
        <img src="{{POST_6_IMAGE}}" alt="{{POST_6_CAPTION}}" class="social-proof-instagram__image" />
        <div class="social-proof-instagram__overlay">
          <div class="social-proof-instagram__stats">
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-6.55 8.53L10 18.35z"/>
              </svg>
              <span>{{POST_6_LIKES}}</span>
            </div>
            <div class="social-proof-instagram__stat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <span>{{POST_6_COMMENTS}}</span>
            </div>
          </div>
          <p class="social-proof-instagram__caption">{{POST_6_CAPTION}}</p>
        </div>
      </article>
    </div>

    <!-- CTA -->
    <div class="social-proof-instagram__cta">
      <a href="{{INSTAGRAM_LINK}}" class="social-proof-instagram__cta-link" target="_blank" rel="noopener noreferrer">
        {{INSTAGRAM_CTA_TEXT}}
      </a>
    </div>
  </div>
</section>
  `,

  css: `
.social-proof-instagram {
  background: var(--color-bg);
  padding: 3rem 1.5rem;
}

.social-proof-instagram__container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Header */
.social-proof-instagram__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
}

.social-proof-instagram__title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.social-proof-instagram__subtitle {
  font-family: var(--font-body);
  font-size: 1rem;
  color: rgba(var(--color-text-rgb), 0.65);
  margin: 0;
}

/* Grid */
.social-proof-instagram__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.social-proof-instagram__post {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 1 / 1;
  cursor: pointer;
}

.social-proof-instagram__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
}

.social-proof-instagram__post:hover .social-proof-instagram__image {
  transform: scale(1.08);
}

/* Overlay */
.social-proof-instagram__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.social-proof-instagram__post:hover .social-proof-instagram__overlay {
  opacity: 1;
}

/* Stats */
.social-proof-instagram__stats {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
}

.social-proof-instagram__stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
}

.social-proof-instagram__stat svg {
  width: 18px;
  height: 18px;
}

/* Caption */
.social-proof-instagram__caption {
  color: white;
  font-family: var(--font-body);
  font-size: 0.85rem;
  text-align: center;
  margin: 0;
  max-width: 200px;
  line-height: 1.4;
}

/* CTA */
.social-proof-instagram__cta {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}

.social-proof-instagram__cta-link {
  display: inline-block;
  padding: 0.9rem 2rem;
  background: var(--color-accent);
  color: var(--color-bg);
  border: 2px solid var(--color-accent);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.social-proof-instagram__cta-link:hover {
  background: transparent;
  color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-accent-rgb), 0.2);
}

/* Mobile */
@media (max-width: 640px) {
  .social-proof-instagram {
    padding: 2rem 1rem;
  }

  .social-proof-instagram__container {
    gap: 2rem;
  }

  .social-proof-instagram__title {
    font-size: 1.4rem;
  }

  .social-proof-instagram__subtitle {
    font-size: 0.9rem;
  }

  .social-proof-instagram__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .social-proof-instagram__stat {
    font-size: 0.8rem;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .social-proof-instagram {
    padding: 3rem 2rem;
  }

  .social-proof-instagram__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.75rem;
  }

  .social-proof-instagram__title {
    font-size: 1.9rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .social-proof-instagram {
    padding: 4rem 2rem;
  }

  .social-proof-instagram__grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 1.5rem;
  }

  .social-proof-instagram__title {
    font-size: 2.2rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .social-proof-instagram__image,
  .social-proof-instagram__overlay,
  .social-proof-instagram__cta-link {
    transition: none;
  }
}
  `,

  placeholders: [
    { key: 'SECTION_TITLE', type: 'text', description: 'Instagram feed section title', defaultValue: 'Follow Us on Instagram' },
    { key: 'SECTION_SUBTITLE', type: 'text', description: 'Instagram feed section subtitle', defaultValue: 'See what our community is creating' },
    { key: 'POST_1_IMAGE', type: 'image', description: 'Post 1 image', defaultValue: 'https://via.placeholder.com/400x400?text=Post+1' },
    { key: 'POST_1_CAPTION', type: 'text', description: 'Post 1 caption', defaultValue: 'Summer vibes ☀️' },
    { key: 'POST_1_LIKES', type: 'text', description: 'Post 1 likes', defaultValue: '1.2K' },
    { key: 'POST_1_COMMENTS', type: 'text', description: 'Post 1 comments', defaultValue: '48' },
    { key: 'POST_2_IMAGE', type: 'image', description: 'Post 2 image', defaultValue: 'https://via.placeholder.com/400x400?text=Post+2' },
    { key: 'POST_2_CAPTION', type: 'text', description: 'Post 2 caption', defaultValue: 'New collection out now' },
    { key: 'POST_2_LIKES', type: 'text', description: 'Post 2 likes', defaultValue: '2.8K' },
    { key: 'POST_2_COMMENTS', type: 'text', description: 'Post 2 comments', defaultValue: '156' },
    { key: 'POST_3_IMAGE', type: 'image', description: 'Post 3 image', defaultValue: 'https://via.placeholder.com/400x400?text=Post+3' },
    { key: 'POST_3_CAPTION', type: 'text', description: 'Post 3 caption', defaultValue: 'Weekend essentials' },
    { key: 'POST_3_LIKES', type: 'text', description: 'Post 3 likes', defaultValue: '956' },
    { key: 'POST_3_COMMENTS', type: 'text', description: 'Post 3 comments', defaultValue: '32' },
    { key: 'POST_4_IMAGE', type: 'image', description: 'Post 4 image', defaultValue: 'https://via.placeholder.com/400x400?text=Post+4' },
    { key: 'POST_4_CAPTION', type: 'text', description: 'Post 4 caption', defaultValue: 'Love this look' },
    { key: 'POST_4_LIKES', type: 'text', description: 'Post 4 likes', defaultValue: '1.5K' },
    { key: 'POST_4_COMMENTS', type: 'text', description: 'Post 4 comments', defaultValue: '67' },
    { key: 'POST_5_IMAGE', type: 'image', description: 'Post 5 image', defaultValue: 'https://via.placeholder.com/400x400?text=Post+5' },
    { key: 'POST_5_CAPTION', type: 'text', description: 'Post 5 caption', defaultValue: 'Sustainable fashion 🌱' },
    { key: 'POST_5_LIKES', type: 'text', description: 'Post 5 likes', defaultValue: '2.1K' },
    { key: 'POST_5_COMMENTS', type: 'text', description: 'Post 5 comments', defaultValue: '89' },
    { key: 'POST_6_IMAGE', type: 'image', description: 'Post 6 image', defaultValue: 'https://via.placeholder.com/400x400?text=Post+6' },
    { key: 'POST_6_CAPTION', type: 'text', description: 'Post 6 caption', defaultValue: 'Everyday style' },
    { key: 'POST_6_LIKES', type: 'text', description: 'Post 6 likes', defaultValue: '3.2K' },
    { key: 'POST_6_COMMENTS', type: 'text', description: 'Post 6 comments', defaultValue: '124' },
    { key: 'INSTAGRAM_LINK', type: 'url', description: 'Instagram profile link', defaultValue: 'https://instagram.com' },
    { key: 'INSTAGRAM_CTA_TEXT', type: 'text', description: 'Instagram CTA button text', defaultValue: 'Follow @aicata' },
  ],

  animations: [
    { trigger: 'hover', type: 'image-zoom-in', duration: '0.4s', delay: '0s' },
    { trigger: 'hover', type: 'overlay-fade-in', duration: '0.3s', delay: '0s' },
    { trigger: 'load', type: 'fade-in-stagger', duration: '0.4s', delay: '0.1s' },
  ],
};

export { SOCIAL_PROOF_INSTAGRAM };
