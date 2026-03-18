const productSuggestions = [
  { label: 'Men / Tailored Shirts', url: '/men/' },
  { label: 'Women / Occasion Dresses', url: '/women/' },
  { label: 'Shoes / Leather Loafers', url: '/shoes/' },
  { label: 'Jewelry / Gold Essentials', url: '/jewelry/' },
  { label: 'Accessories / Travel Edit', url: '/accessories/' },
  { label: 'Product / Signature Trench', url: '/product/' },
  { label: 'Checkout / Secure Payment', url: '/checkout/' },
  { label: 'Account / Order Tracking', url: '/account/' }
];

function initSearch() {
  document.querySelectorAll('[data-search]').forEach((form) => {
    const input = form.querySelector('input');
    const box = form.parentElement.querySelector('[data-suggestions]');
    const render = (items) => {
      box.innerHTML = '';
      if (!items.length || !input.value.trim()) {
        box.classList.remove('show');
        return;
      }
      items.forEach((item) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = item.label;
        btn.addEventListener('click', () => {
          window.location.href = item.url;
        });
        box.appendChild(btn);
      });
      box.classList.add('show');
    };
    input.addEventListener('input', () => {
      const value = input.value.toLowerCase();
      const matches = productSuggestions.filter((item) => item.label.toLowerCase().includes(value)).slice(0, 5);
      render(matches);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const match = productSuggestions.find((item) => item.label.toLowerCase().includes(input.value.toLowerCase()));
        if (match) window.location.href = match.url;
      }
    });
    document.addEventListener('click', (event) => {
      if (!form.parentElement.contains(event.target)) box.classList.remove('show');
    });
  });
}

function initNav() {
  const button = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    nav.classList.toggle('show');
    button.setAttribute('aria-expanded', String(nav.classList.contains('show')));
  });
}

function initContrast() {
  const key = 'clothingsite-contrast';
  const root = document.documentElement;
  const saved = localStorage.getItem(key);
  if (saved) root.dataset.contrast = saved;
  document.querySelectorAll('[data-contrast-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      root.dataset.contrast = root.dataset.contrast === 'high' ? 'default' : 'high';
      localStorage.setItem(key, root.dataset.contrast);
    });
  });
}

function initCarousel() {
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    carousel.querySelectorAll('[data-carousel-dir]').forEach((button) => {
      button.addEventListener('click', () => {
        const dir = Number(button.dataset.carouselDir);
        track.scrollBy({ left: dir * 320, behavior: 'smooth' });
      });
    });
  });
}

function initFilters() {
  const cards = [...document.querySelectorAll('[data-product-card]')];
  const chips = [...document.querySelectorAll('[data-filter]')];
  if (!cards.length || !chips.length) return;
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.group;
      chips.filter((item) => item.dataset.group === group).forEach((item) => item.classList.remove('active'));
      chip.classList.add('active');
      const activeFilters = Object.fromEntries(
        [...new Set(chips.filter((item) => item.classList.contains('active')).map((item) => item.dataset.group))].map((key) => [
          key,
          chips.find((item) => item.classList.contains('active') && item.dataset.group === key)?.dataset.value || 'all'
        ])
      );
      cards.forEach((card) => {
        const show = Object.entries(activeFilters).every(([key, value]) => value === 'all' || card.dataset[key]?.includes(value));
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

function initWishlist() {
  const key = 'clothingsite-wishlist';
  const getItems = () => JSON.parse(localStorage.getItem(key) || '[]');
  const setItems = (items) => localStorage.setItem(key, JSON.stringify(items));
  const refreshCount = () => {
    document.querySelectorAll('[data-wishlist-count]').forEach((node) => { node.textContent = String(getItems().length); });
  };
  document.querySelectorAll('[data-wishlist]').forEach((button) => {
    const id = button.dataset.wishlist;
    const update = () => {
      const saved = getItems().includes(id);
      button.textContent = saved ? '♥ Saved' : '♡ Wishlist';
      button.setAttribute('aria-pressed', String(saved));
    };
    button.addEventListener('click', () => {
      const items = getItems();
      if (items.includes(id)) {
        setItems(items.filter((item) => item !== id));
      } else {
        setItems([...items, id]);
      }
      update();
      refreshCount();
    });
    update();
  });
  refreshCount();
}

function initVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  document.querySelectorAll('[data-voice-search]').forEach((button) => {
    if (!SpeechRecognition) {
      button.disabled = true;
      button.title = 'Voice search is not supported in this browser.';
      return;
    }
    button.addEventListener('click', () => {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        const input = document.querySelector('[data-search] input');
        if (input) {
          input.value = text;
          input.dispatchEvent(new Event('input'));
        }
      };
    });
  });
}

function initProductGallery() {
  const stage = document.querySelector('[data-stage-image]');
  if (!stage) return;
  document.querySelectorAll('[data-thumb]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-thumb]').forEach((thumb) => thumb.classList.remove('active'));
      button.classList.add('active');
      stage.src = button.dataset.src;
      stage.alt = button.dataset.alt;
    });
  });
  document.querySelectorAll('[data-rotate]').forEach((button) => {
    button.addEventListener('click', () => {
      stage.src = button.dataset.src;
      stage.alt = button.dataset.alt;
    });
  });
}

function initChat() {
  const toggle = document.querySelector('[data-chat-toggle]');
  const panel = document.querySelector('[data-chat-window]');
  const form = document.querySelector('[data-chat-form]');
  const stream = document.querySelector('[data-chat-messages]');
  if (!toggle || !panel || !form || !stream) return;
  toggle.addEventListener('click', () => panel.classList.toggle('show'));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('input');
    if (!input.value.trim()) return;
    const guest = document.createElement('div');
    guest.className = 'chat-bubble';
    guest.textContent = input.value;
    stream.appendChild(guest);
    const reply = document.createElement('div');
    reply.className = 'chat-bubble agent';
    reply.textContent = 'Our stylist team is online — we recommend the Signature Capsule or can help finalize checkout.';
    stream.appendChild(reply);
    stream.scrollTop = stream.scrollHeight;
    input.value = '';
  });
}

function initForms() {
  document.querySelectorAll('[data-demo-submit]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const target = form.querySelector('[data-form-status]');
      if (target) target.textContent = 'Thanks — your request has been saved in this demo experience.';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSearch();
  initContrast();
  initCarousel();
  initFilters();
  initWishlist();
  initVoiceSearch();
  initProductGallery();
  initChat();
  initForms();
});
