// Contact form: inline validation, then submission to Netlify Forms without a
// page reload. If JavaScript fails, the form still posts normally.

const messages: Record<string, (el: HTMLInputElement | HTMLTextAreaElement) => string> = {
  name: (el) => (el.value.trim() ? '' : 'Please tell me your name.'),
  email: (el) => {
    if (!el.value.trim()) return 'Please enter your email address so I can reply.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) ? '' : 'That email address does not look quite right. Check for typos.';
  },
  details: (el) => (el.value.trim().length >= 10 ? '' : 'Please add a sentence or two about your business and what you need.'),
};

export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = 'true';

  const success = document.querySelector<HTMLElement>('[data-success]')!;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const button = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const buttonLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;

  const setError = (name: string, message: string) => {
    const out = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (out) out.textContent = message;
    const fields = form.querySelectorAll<HTMLInputElement>(`[name="${name}"]`);
    fields.forEach((f) => (message ? f.setAttribute('aria-invalid', 'true') : f.removeAttribute('aria-invalid')));
  };

  const validateField = (name: string) => {
    if (name === 'budget') {
      const picked = form.querySelector('[name="budget"]:checked');
      const msg = picked ? '' : 'Pick the closest option, or "Not sure yet".';
      setError('budget', msg);
      return !msg;
    }
    const el = form.elements.namedItem(name) as HTMLInputElement | null;
    if (!el || !messages[name]) return true;
    const msg = messages[name](el);
    setError(name, msg);
    return !msg;
  };

  // Validate when leaving a field, and re-check as they type once an error is showing.
  form.addEventListener('focusout', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name && t.value && messages[t.name]) validateField(t.name);
  });
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.getAttribute('aria-invalid') === 'true') validateField(t.name);
  });
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'budget') validateField('budget');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');

    const order = ['name', 'email', 'budget', 'details'];
    const invalid = order.filter((n) => !validateField(n));
    if (invalid.length) {
      status.textContent = invalid.length === 1 ? 'One thing needs fixing above.' : `${invalid.length} things need fixing above.`;
      status.classList.add('is-error');
      const first = form.querySelector<HTMLElement>(`[name="${invalid[0]}"]`);
      first?.focus();
      return;
    }

    button.setAttribute('aria-busy', 'true');
    button.disabled = true;
    buttonLabel.textContent = 'Sending…';

    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch {
      status.textContent = 'Sorry, that did not send. Please try again, or use the email address alongside.';
      status.classList.add('is-error');
    } finally {
      button.removeAttribute('aria-busy');
      button.disabled = false;
      buttonLabel.textContent = 'Send enquiry';
    }
  });
}
