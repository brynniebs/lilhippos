// Load gallery from localStorage (admin-editable) or use defaults
window.BB_GALLERY = (function () {
  const stored = localStorage.getItem('BB_GALLERY');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { }
  }
  return [
    'assets/img/dog1.jpg',
    'assets/img/dog2.jpg',
    'assets/img/dog3.png',
    'assets/img/dog4.jpg'
  ];
})();
window.renderGallery = function () {
  const root = document.getElementById('galleryRoot'); if (!root) return;
  root.innerHTML = window.BB_GALLERY.map(src => `<img src="${src}" alt="Customer pup" loading="lazy">`).join('');
};
