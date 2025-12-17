// Gallery rendering for Brynnie B's
// Waits for cloud data from site-data.js before rendering

window.renderGallery = function () {
  const root = document.getElementById('galleryRoot');
  if (!root || !Array.isArray(window.BB_GALLERY)) return;
  root.innerHTML = window.BB_GALLERY.map(src => `<img src="${src}" alt="Customer pup" loading="lazy">`).join('');
};

// Wait for cloud data to load, then render
document.addEventListener('siteDataReady', function () {
  window.renderGallery();
});

// Also try rendering on DOMContentLoaded as fallback
document.addEventListener('DOMContentLoaded', function () {
  // Give site-data.js a moment to load, then render
  setTimeout(function () {
    if (window.BB_GALLERY) {
      window.renderGallery();
    }
  }, 100);
});
