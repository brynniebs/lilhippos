// Load events from localStorage (admin-editable) or use defaults
window.BB_EVENTS = (function () {
  const stored = localStorage.getItem('BB_EVENTS');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { }
  }
  return [
    { date: 'Oct 25 · 9am–3pm', title: 'Pinckneyville Mardi Gras', city: 'Pinckneyville, IL', map: 'https://www.google.com/maps/place/4+S+Walnut+St,+Pinckneyville,+IL+62274' },
    { date: 'Nov 1–2 · Sat 9am–4pm · Sun 10am–3pm', title: 'Fox Senior High School', city: 'Arnold, MO', map: 'https://www.google.com/maps?q=fox+senior+high+school+arnold+mo' },
    { date: 'Nov 28–30 · Fri 3pm–8pm · Sat 10am–4pm · Sun 10am–4pm', title: 'Kay Weber Art & Craft Show', city: 'Belleville, IL', map: 'https://www.google.com/maps?q=200+S+Belt+E,+Belleville,+IL+62220' }
  ];
})();

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

// Auto-run when possible
if (document.readyState !== 'loading') window.renderEvents();
else document.addEventListener('DOMContentLoaded', window.renderEvents);