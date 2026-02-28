document.getElementById('currentYear').textContent = new Date().getFullYear();

const toggleButton = document.getElementById('toggleMore');
const bioMore = document.getElementById('bioMore');
let expanded = false;

function setExpandedState(isExpanded) {
  if (isExpanded) {
    bioMore.classList.add('is-open');
    bioMore.setAttribute('aria-hidden', 'false');
    bioMore.style.maxHeight = `${bioMore.scrollHeight}px`;
    return;
  }

  bioMore.style.maxHeight = `${bioMore.scrollHeight}px`;
  // Force reflow so the collapse transition always starts from the current height.
  bioMore.offsetHeight;
  bioMore.classList.remove('is-open');
  bioMore.setAttribute('aria-hidden', 'true');
  bioMore.style.maxHeight = '0px';
}

toggleButton.addEventListener('click', () => {
  expanded = !expanded;
  setExpandedState(expanded);
  toggleButton.textContent = expanded ? 'Lees minder' : 'Lees meer';
});

window.addEventListener('resize', () => {
  if (expanded) {
    bioMore.style.maxHeight = `${bioMore.scrollHeight}px`;
  }
});

const LOGO_DELAY_MS = 100;
const REST_DELAY_MS = 340;
const logoRevealTarget = document.querySelector('[data-reveal-logo]');
const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'))
  .filter((target) => !target.hasAttribute('data-reveal-logo'));
const revealTargetsNow = () => {
  requestAnimationFrame(() => {
    if (logoRevealTarget) {
      setTimeout(() => {
        logoRevealTarget.classList.add('is-visible');
      }, LOGO_DELAY_MS);
    }

    setTimeout(() => {
      revealTargets.forEach((target) => target.classList.add('is-visible'));
    }, REST_DELAY_MS);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', revealTargetsNow, { once: true });
} else {
  revealTargetsNow();
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert('Copied to clipboard');
    })
    .catch((err) => {
      console.error('Failed to copy: ', err);
    });
}

const contactModal = document.getElementById('contactModal');
const contactForm = document.getElementById('contactForm');
const closeContactModalButton = document.getElementById('closeContactModal');
const openContactButtons = document.querySelectorAll('.js-open-contact');
const contactStatus = document.getElementById('contactStatus');
const submitContactButton = document.getElementById('submitContact');
const mailtoFallbackButton = document.getElementById('mailtoFallback');

function buildMailtoUrl() {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  const subject = encodeURIComponent(`Nieuwe booking aanvraag van ${name || 'websitebezoeker'}`);
  const body = encodeURIComponent(
    `Naam: ${name || '-'}\nE-mail: ${email || '-'}\nTelefoon: ${phone || '-'}\n\nBericht:\n${message || '-'}`
  );

  return `mailto:info@studioieks.com?subject=${subject}&body=${body}`;
}

function openContactModal() {
  contactModal.classList.add('is-open');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('contactName').focus();
}

function closeContactModal() {
  contactModal.classList.remove('is-open');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

openContactButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    openContactModal();
  });
});

closeContactModalButton.addEventListener('click', closeContactModal);

contactModal.addEventListener('click', (event) => {
  if (event.target === contactModal) {
    closeContactModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && contactModal.classList.contains('is-open')) {
    closeContactModal();
  }
});

mailtoFallbackButton.addEventListener('click', () => {
  window.location.href = buildMailtoUrl();
});

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  submitContactButton.disabled = true;
  submitContactButton.classList.add('opacity-70', 'cursor-not-allowed');
  contactStatus.textContent = 'Bezig met verzenden...';

  const payload = {
    name: document.getElementById('contactName').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    phone: document.getElementById('contactPhone').value.trim(),
    message: document.getElementById('contactMessage').value.trim(),
    _subject: 'Nieuwe booking aanvraag via Studio Ieks',
    _template: 'table',
    _captcha: 'false'
  };

  try {
    const response = await fetch('https://formsubmit.co/ajax/vandorstmaurice@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('FormSubmit request failed');
    }

    contactStatus.textContent = 'Je aanvraag is verzonden. We nemen zo snel mogelijk contact op.';
    contactForm.reset();
  } catch (error) {
    console.error(error);
    contactStatus.textContent =
      'Verzenden via lukte niet. Gebruik de knop "Open e-mail app".';
  } finally {
    submitContactButton.disabled = false;
    submitContactButton.classList.remove('opacity-70', 'cursor-not-allowed');
  }
});
