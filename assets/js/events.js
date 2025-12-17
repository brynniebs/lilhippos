// Events rendering for Brynnie B's
// Waits for cloud data from site-data.js before rendering

window.renderEvents = function () {
  const root = document.getElementById('eventsRoot');
  if (!root || !Array.isArray(window.BB_EVENTS)) return;
  root.innerHTML = window.BB_EVENTS.map(ev => `
    <article class="event-card">
      <div class="date">${ev.date}</div>
      <h3>${ev.title}</h3>
      <div class="small">${ev.city}</div>
      <a class="btn btn-outline" href="${ev.map}" target="_blank" rel="noopener">Map</a>
    </article>
  `).join('');
};

// Wait for cloud data to load, then render
document.addEventListener('siteDataReady', function () {
  window.renderEvents();
});

// Also try rendering on DOMContentLoaded as fallback
document.addEventListener('DOMContentLoaded', function () {
  // Give site-data.js a moment to load, then render
  setTimeout(function () {
    if (window.BB_EVENTS) {
      window.renderEvents();
    }
  }, 100);
});