import type { SectionTemplate, SectionCategory, SectionVariant, DesignTone, PlaceholderDef, AnimationDef } from '../../../types';

const CONTACT_FORM_ELEGANT_SPLIT: SectionTemplate = {
  id: 'contact-form-elegant-split',
  category: 'contact-form',
  variant: 'split',
  name: 'Contact Form Elegant Split',
  description: 'Split layout: left side has contact info (address, phone, email, hours), right side has form (name, email, subject, message, submit button).',
  tones: ['elegant', 'minimal', 'modern'],

  html: `
<section data-section-id="contact-form-elegant-split" class="contact-form-elegant-split">
  <div class="contact-form-elegant-split__container">
    <!-- Left: Contact Information -->
    <div class="contact-form-elegant-split__info-side">
      <div class="contact-form-elegant-split__info-header">
        <h2 class="contact-form-elegant-split__info-title">{{INFO_TITLE}}</h2>
        <p class="contact-form-elegant-split__info-subtitle">{{INFO_SUBTITLE}}</p>
      </div>

      <!-- Address -->
      <div class="contact-form-elegant-split__info-block">
        <h3 class="contact-form-elegant-split__block-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S8.62 6.5 10 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
          </svg>
          {{ADDRESS_TITLE}}
        </h3>
        <p class="contact-form-elegant-split__block-text">{{ADDRESS_LINE_1}}</p>
        <p class="contact-form-elegant-split__block-text">{{ADDRESS_LINE_2}}</p>
      </div>

      <!-- Phone -->
      <div class="contact-form-elegant-split__info-block">
        <h3 class="contact-form-elegant-split__block-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.6915026,12.4744748 C16.1624075,12.0152817 15.2395469,11.4231472 14.2257341,12.0152817 C13.5151496,12.5274722 13.0446545,12.4744748 12.2547301,11.6788213 C11.5457131,10.9347957 11.4915502,10.4353088 12.0274626,9.89898945 C12.6563168,9.27298667 12.0274626,8.35044872 11.1824257,7.51452416 C10.4032128,6.75577297 9.54216671,5.82610618 8.82270468,6.54049968 C8.03572959,7.32292267 8.27501847,8.01913696 8.82270468,8.55166155 C9.61093844,9.3468518 10.4915502,10.2092281 10.4915502,11.1871383 C10.4915502,12.9898945 8.64987905,15.4397622 6.25000117,15.4397622 C3.75001033,15.4397622 2,13.8166207 2,11.4744748 C2,7.1449928 5.18485717,3.5 10.4915502,3.5 C13.1259058,3.5 15.2395469,4.79329772 16.6915026,6.75577297 C17.1624222,7.48572041 17.1624222,8.40632879 16.6915026,8.98062869 C16.1624075,9.48064612 15.5474804,9.48064612 15.0451722,8.98062869 C13.9562367,7.83752316 12.6563168,6.80030386 11.1824257,6.80030386 C8.42879154,6.80030386 6.74873619,8.44928269 6.74873619,10.4353088 C6.74873619,12.2019808 7.90417913,13.8166207 9.54216671,13.8166207 C11.0421956,13.8166207 12.1242142,12.9606848 12.1242142,11.8068322 C12.1242142,11.3237235 11.8050373,10.9347957 11.4915502,10.9347957 C11.1624075,10.9347957 10.9357905,11.2541285 10.9357905,11.5940467 L10.9357905,12.0547852 C10.9357905,12.3677953 10.6915502,12.5274722 10.4915502,12.5274722 C9.95970075,12.5274722 9.54216671,12.0944039 9.54216671,11.4744748 L9.54216671,10.9347957 C9.54216671,10.2092281 10.0274626,9.70397553 10.4915502,9.70397553 C10.8051373,9.70397553 11.1624075,9.89898945 11.3891142,10.1647339 C11.7565982,9.89898945 12.0274626,9.66953482 12.4649551,9.27298667 C13.0451722,8.75715092 13.5151496,8.75715092 14.0180228,9.27298667 C14.6586795,9.95003099 15.1624075,10.4353088 15.7971112,10.9347957 C16.1624075,11.2541285 16.6915026,11.2541285 16.6915026,12.4744748 Z" fill="currentColor"/>
          </svg>
          {{PHONE_TITLE}}
        </h3>
        <a href="tel:{{PHONE_NUMBER}}" class="contact-form-elegant-split__block-link">{{PHONE_NUMBER}}</a>
      </div>

      <!-- Email -->
      <div class="contact-form-elegant-split__info-block">
        <h3 class="contact-form-elegant-split__block-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 6l-8 5-8-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{EMAIL_TITLE}}
        </h3>
        <a href="mailto:{{EMAIL_ADDRESS}}" class="contact-form-elegant-split__block-link">{{EMAIL_ADDRESS}}</a>
      </div>

      <!-- Hours -->
      <div class="contact-form-elegant-split__info-block">
        <h3 class="contact-form-elegant-split__block-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.2"/>
            <path d="M10 6v4h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          {{HOURS_TITLE}}
        </h3>
        <p class="contact-form-elegant-split__block-text">{{HOURS_WEEKDAY}}</p>
        <p class="contact-form-elegant-split__block-text">{{HOURS_WEEKEND}}</p>
      </div>
    </div>

    <!-- Right: Contact Form -->
    <div class="contact-form-elegant-split__form-side">
      <div class="contact-form-elegant-split__form-header">
        <h2 class="contact-form-elegant-split__form-title">{{FORM_TITLE}}</h2>
        <p class="contact-form-elegant-split__form-subtitle">{{FORM_SUBTITLE}}</p>
      </div>

      <form class="contact-form-elegant-split__form" aria-label="Contact form">
        <!-- Name Field -->
        <div class="contact-form-elegant-split__form-group">
          <label for="contact-name" class="contact-form-elegant-split__label">{{NAME_LABEL}}</label>
          <input
            type="text"
            id="contact-name"
            class="contact-form-elegant-split__input"
            placeholder="{{NAME_PLACEHOLDER}}"
            required
          />
        </div>

        <!-- Email Field -->
        <div class="contact-form-elegant-split__form-group">
          <label for="contact-email" class="contact-form-elegant-split__label">{{EMAIL_LABEL}}</label>
          <input
            type="email"
            id="contact-email"
            class="contact-form-elegant-split__input"
            placeholder="{{EMAIL_PLACEHOLDER}}"
            required
          />
        </div>

        <!-- Subject Field -->
        <div class="contact-form-elegant-split__form-group">
          <label for="contact-subject" class="contact-form-elegant-split__label">{{SUBJECT_LABEL}}</label>
          <input
            type="text"
            id="contact-subject"
            class="contact-form-elegant-split__input"
            placeholder="{{SUBJECT_PLACEHOLDER}}"
          />
        </div>

        <!-- Message Field -->
        <div class="contact-form-elegant-split__form-group">
          <label for="contact-message" class="contact-form-elegant-split__label">{{MESSAGE_LABEL}}</label>
          <textarea
            id="contact-message"
            class="contact-form-elegant-split__textarea"
            placeholder="{{MESSAGE_PLACEHOLDER}}"
            rows="5"
            required
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="contact-form-elegant-split__submit-btn">
          {{SUBMIT_BUTTON_TEXT}}
        </button>
      </form>
    </div>
  </div>
</section>
  `,

  css: `
.contact-form-elegant-split {
  background: var(--color-bg);
  padding: 4rem 1.5rem;
}

.contact-form-elegant-split__container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Left Side - Contact Info */
.contact-form-elegant-split__info-side {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-form-elegant-split__info-header {
  margin-bottom: 0.5rem;
}

.contact-form-elegant-split__info-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.contact-form-elegant-split__info-subtitle {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: rgba(var(--color-text-rgb), 0.65);
  margin: 0;
}

.contact-form-elegant-split__info-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-form-elegant-split__block-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.contact-form-elegant-split__block-title svg {
  color: var(--color-accent);
  flex-shrink: 0;
}

.contact-form-elegant-split__block-text {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: rgba(var(--color-text-rgb), 0.75);
  margin: 0;
  line-height: 1.6;
}

.contact-form-elegant-split__block-link {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-accent);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  display: inline-block;
  width: fit-content;
}

.contact-form-elegant-split__block-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-accent);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.contact-form-elegant-split__block-link:hover::after {
  width: 100%;
}

/* Right Side - Form */
.contact-form-elegant-split__form-side {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-form-elegant-split__form-header {
  margin-bottom: 0.5rem;
}

.contact-form-elegant-split__form-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.contact-form-elegant-split__form-subtitle {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: rgba(var(--color-text-rgb), 0.65);
  margin: 0;
}

/* Form */
.contact-form-elegant-split__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-form-elegant-split__form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-form-elegant-split__label {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
}

.contact-form-elegant-split__input,
.contact-form-elegant-split__textarea {
  background: rgba(var(--color-text-rgb), 0.03);
  border: 1px solid rgba(var(--color-text-rgb), 0.15);
  border-radius: 6px;
  padding: 0.875rem 1rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--color-text);
  transition: all 0.2s ease;
  outline: none;
}

.contact-form-elegant-split__input::placeholder,
.contact-form-elegant-split__textarea::placeholder {
  color: rgba(var(--color-text-rgb), 0.5);
}

.contact-form-elegant-split__input:focus,
.contact-form-elegant-split__textarea:focus {
  background: rgba(var(--color-text-rgb), 0.01);
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.1);
}

.contact-form-elegant-split__textarea {
  resize: vertical;
  min-height: 140px;
}

/* Submit Button */
.contact-form-elegant-split__submit-btn {
  background: var(--color-accent);
  color: var(--color-bg);
  border: 2px solid var(--color-accent);
  border-radius: 6px;
  padding: 1rem 2rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0.5rem;
}

.contact-form-elegant-split__submit-btn:hover {
  background: transparent;
  color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--color-accent-rgb), 0.25);
}

.contact-form-elegant-split__submit-btn:active {
  transform: translateY(0);
}

/* Mobile */
@media (max-width: 767px) {
  .contact-form-elegant-split {
    padding: 2rem 1.5rem;
  }

  .contact-form-elegant-split__container {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .contact-form-elegant-split__info-title,
  .contact-form-elegant-split__form-title {
    font-size: 1.4rem;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .contact-form-elegant-split {
    padding: 3rem 2rem;
  }

  .contact-form-elegant-split__container {
    gap: 3rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .contact-form-elegant-split {
    padding: 4rem 2rem;
  }

  .contact-form-elegant-split__container {
    gap: 4rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .contact-form-elegant-split__input,
  .contact-form-elegant-split__textarea,
  .contact-form-elegant-split__submit-btn,
  .contact-form-elegant-split__block-link {
    transition: none;
  }
}
  `,

  placeholders: [
    { key: 'INFO_TITLE', type: 'text', description: 'Contact info section title', defaultValue: 'Get in Touch' },
    { key: 'INFO_SUBTITLE', type: 'text', description: 'Contact info section subtitle', defaultValue: 'We would love to hear from you' },
    { key: 'ADDRESS_TITLE', type: 'text', description: 'Address section title', defaultValue: 'Address' },
    { key: 'ADDRESS_LINE_1', type: 'text', description: 'Address line 1', defaultValue: '123 Main Street' },
    { key: 'ADDRESS_LINE_2', type: 'text', description: 'Address line 2', defaultValue: 'New York, NY 10001' },
    { key: 'PHONE_TITLE', type: 'text', description: 'Phone section title', defaultValue: 'Phone' },
    { key: 'PHONE_NUMBER', type: 'text', description: 'Phone number', defaultValue: '+1 (555) 123-4567' },
    { key: 'EMAIL_TITLE', type: 'text', description: 'Email section title', defaultValue: 'Email' },
    { key: 'EMAIL_ADDRESS', type: 'text', description: 'Email address', defaultValue: 'hello@aicata.com' },
    { key: 'HOURS_TITLE', type: 'text', description: 'Hours section title', defaultValue: 'Hours' },
    { key: 'HOURS_WEEKDAY', type: 'text', description: 'Weekday hours', defaultValue: 'Mon-Fri: 9:00 AM - 6:00 PM' },
    { key: 'HOURS_WEEKEND', type: 'text', description: 'Weekend hours', defaultValue: 'Sat-Sun: 10:00 AM - 4:00 PM' },
    { key: 'FORM_TITLE', type: 'text', description: 'Form section title', defaultValue: 'Send a Message' },
    { key: 'FORM_SUBTITLE', type: 'text', description: 'Form section subtitle', defaultValue: 'Fill out the form below and we will get back to you shortly' },
    { key: 'NAME_LABEL', type: 'text', description: 'Name field label', defaultValue: 'Full Name' },
    { key: 'NAME_PLACEHOLDER', type: 'text', description: 'Name field placeholder', defaultValue: 'John Doe' },
    { key: 'EMAIL_LABEL', type: 'text', description: 'Email field label', defaultValue: 'Email Address' },
    { key: 'EMAIL_PLACEHOLDER', type: 'text', description: 'Email field placeholder', defaultValue: 'john@example.com' },
    { key: 'SUBJECT_LABEL', type: 'text', description: 'Subject field label', defaultValue: 'Subject' },
    { key: 'SUBJECT_PLACEHOLDER', type: 'text', description: 'Subject field placeholder', defaultValue: 'How can we help?' },
    { key: 'MESSAGE_LABEL', type: 'text', description: 'Message field label', defaultValue: 'Message' },
    { key: 'MESSAGE_PLACEHOLDER', type: 'text', description: 'Message field placeholder', defaultValue: 'Tell us more about your inquiry...' },
    { key: 'SUBMIT_BUTTON_TEXT', type: 'text', description: 'Submit button text', defaultValue: 'Send Message' },
  ],

  animations: [
    { trigger: 'load', type: 'fade-in', duration: '0.4s', delay: '0.1s' },
    { trigger: 'hover', type: 'underline-expand', duration: '0.3s', delay: '0s' },
  ] as AnimationDef[],
};

export { CONTACT_FORM_ELEGANT_SPLIT };
