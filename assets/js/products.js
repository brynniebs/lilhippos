// Products for Brynnie B's Shop
// Uses cloud data if available, otherwise defaults

// Default products (fallback)
const DEFAULT_PRODUCTS = [
  { id: 'bc-rose', name: 'Beaded Collar – Rose Mix', price: 24.00, category: 'beaded-collars', image: 'assets/img/IMG_20250918_220658-removebg-preview.png', sizes: ['XS', 'S', 'M', 'L'], colors: ['Rose'], inventory: 10 },
  { id: 'bc-berry', name: 'Beaded Collar – Berry Pop', price: 24.00, category: 'beaded-collars', image: 'assets/img/IMG_20250918_220658-removebg-preview.png', sizes: ['XS', 'S', 'M', 'L'], colors: ['Berry'], inventory: 10 },
  { id: 'bw-classic', name: 'Bowtie – Classic Check', price: 16.00, category: 'bowties', image: 'assets/img/IMG_20250918_220658-removebg-preview.png', sizes: ['S', 'M', 'L'], colors: ['Multi'], inventory: 5 },
  { id: 'bd-peach', name: 'Bandana – Peach Plaid', price: 14.00, category: 'bandanas', image: 'assets/img/IMG_20250918_220658-removebg-preview.png', sizes: ['S', 'M', 'L'], colors: ['Peach'], inventory: 8 },
  { id: 'sc-denim', name: 'Shirt Collar – Soft Denim', price: 18.00, category: 'shirt-collars', image: 'assets/img/IMG_20250918_220658-removebg-preview.png', sizes: ['S', 'M', 'L'], colors: ['Denim'], inventory: 6 }
];

window.renderProducts = function () {
  const root = document.getElementById('productsRoot'); if (!root) return;

  // Use cloud products if available, otherwise defaults
  const products = window.BB_PRODUCTS || DEFAULT_PRODUCTS;

  const hash = (location.hash || '').replace('#', '');
  const grouped = products.reduce((m, p) => { (m[p.category] = m[p.category] || []).push(p); return m; }, {});
  const order = ['beaded-collars', 'bowties', 'bandanas', 'shirt-collars'];

  root.innerHTML = order.map(cat => {
    const list = (grouped[cat] || [])
      .filter(p => !hash || p.category === hash)
      .filter(p => (p.inventory || 0) > 0) // Only show in-stock items
      .map(p => {
        const sizes = p.sizes || p.variants || ['S', 'M', 'L'];
        return `<article class="product">
        <img src="${p.image}" alt="${p.name}">
        <div class="meta">
          <h3>${p.name}</h3>
          <div class="price">$${p.price.toFixed(2)}</div>
          <div style="margin:8px 0">
            <label>Size <select id="v-${p.id}">${sizes.map(v => `<option>${v}</option>`).join('')}</select></label>
          </div>
          <button class="btn btn-primary" onclick="BB_addToCart({id:'${p.id}',name:'${p.name}',price:${p.price},variant:document.getElementById('v-${p.id}').value,image:'${p.image}'})">Add to Cart</button>
        </div>
      </article>`;
      }).join('');
    const title = cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `<h2 id="${cat}">${title}</h2><div class="product-grid">${list || '<p>No items yet.</p>'}</div>`;
  }).join('');
};
