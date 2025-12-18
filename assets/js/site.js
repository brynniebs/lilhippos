(function () {
  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const nav = document.querySelector('.main-nav');
  if (navToggle && nav) { navToggle.addEventListener('click', () => nav.classList.toggle('open')); }

  // Cart count updater
  function updateCartCount() {
    const el = document.querySelector('[data-cart-count]'); if (!el) return;
    const cart = JSON.parse(localStorage.getItem('bb_cart') || '[]');
    const qty = cart.reduce((a, i) => a + i.qty, 0); el.textContent = `Cart (${qty})`;
  }
  updateCartCount();
  window.addEventListener('storage', updateCartCount);
  window.__bb_updateCartCount = updateCartCount;

  // Function to render home page previews
  function renderHomePreviews() {
    // Events preview (home page)
    if (window.BB_EVENTS && document.getElementById('eventsPreview')) {
      const wrap = document.getElementById('eventsPreview');
      wrap.innerHTML = window.BB_EVENTS.slice(0, 3).map(ev => `
        <article class="event-card"><div class="date">${ev.date}</div><h4>${ev.title}</h4><div class="small">${ev.city}</div></article>`).join('');
    }

    // Gallery preview (home page)
    if (window.BB_GALLERY && document.getElementById('galleryPreview')) {
      const gp = document.getElementById('galleryPreview');
      gp.innerHTML = window.BB_GALLERY.slice(0, 6).map(src => `<img src="${src}" alt="Gallery image"/>`).join('');
    }
  }

  // Function to apply content
  function applyContent() {
    const content = window.BB_CONTENT || JSON.parse(localStorage.getItem('BB_CONTENT') || 'null');
    if (!content) return;

    try {
      // Home page - Hero section
      const heroH1 = document.querySelector('.hero h1');
      const heroLead = document.querySelector('.hero .lead');
      const heroFeatures = document.querySelector('.hero .features-inline');

      if (heroH1 && content.heroHeadline) heroH1.textContent = content.heroHeadline;
      if (heroLead && content.heroSubtitle) heroLead.textContent = content.heroSubtitle;
      if (heroFeatures && content.heroFeatures) {
        heroFeatures.innerHTML = content.heroFeatures.map(f => `<li>${f}</li>`).join('');
      }

      // Home page - Value cards
      const valueCards = document.querySelectorAll('.value-cards .card');
      if (valueCards.length && content.valueCards) {
        content.valueCards.forEach((card, idx) => {
          if (valueCards[idx]) {
            const h3 = valueCards[idx].querySelector('h3');
            const p = valueCards[idx].querySelector('p');
            if (h3 && card.title) h3.textContent = card.title;
            if (p && card.text) p.textContent = card.text;
          }
        });
      }

      // Home page - Featured section
      const splitSection = document.querySelector('.split');
      if (splitSection) {
        const splitH2 = splitSection.querySelector('h2');
        const splitP = splitSection.querySelector('p');
        if (splitH2 && content.featuredTitle) splitH2.textContent = content.featuredTitle;
        if (splitP && content.featuredText) splitP.textContent = content.featuredText;
      }

      // About page
      const aboutMain = document.querySelector('.narrow');
      if (aboutMain) {
        const storyP = aboutMain.querySelector('h1 + p');
        const valuesList = aboutMain.querySelector('.list');

        if (storyP && content.aboutStory) storyP.textContent = content.aboutStory;
        if (valuesList && content.aboutValues) {
          valuesList.innerHTML = content.aboutValues.map(v => `<li>${v}</li>`).join('');
        }
      }

    } catch (e) {
      console.warn('Error applying admin content:', e);
    }
  }

  // Wait for cloud data, then render
  document.addEventListener('siteDataReady', function () {
    renderHomePreviews();
    applyContent();
  });

  // Fallback: try rendering after a delay on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (window.BB_EVENTS || window.BB_GALLERY || window.BB_CONTENT) {
        renderHomePreviews();
        applyContent();
      }
    }, 200);
  });
})();
