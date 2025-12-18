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

// Default categories (fallback)
const DEFAULT_CATEGORIES = [
  { id: 'beaded-collars', name: 'Beaded Collars' },
  { id: 'bowties', name: 'Bowties' },
  { id: 'bandanas', name: 'Bandanas' },
  { id: 'shirt-collars', name: 'Shirt Collars' }
];

// Get price for a product based on size (handles variable pricing)
function getProductPrice(product, size) {
  if (product.variablePricing && product.sizePrices && product.sizePrices[size]) {
    return product.sizePrices[size];
  }
  return product.price;
}

window.renderProducts = function () {
  const root = document.getElementById('productsRoot'); if (!root) return;

  // Use cloud data if available, otherwise defaults
  const products = window.BB_PRODUCTS || DEFAULT_PRODUCTS;
  const categories = window.BB_CATEGORIES || DEFAULT_CATEGORIES;

  const hash = (location.hash || '').replace('#', '');

  // Group products by category
  const grouped = products.reduce((m, p) => { (m[p.category] = m[p.category] || []).push(p); return m; }, {});

  // Use dynamic category order from cloud (or defaults)
  const categoryOrder = categories.map(c => c.id);

  root.innerHTML = categoryOrder.map(catId => {
    const category = categories.find(c => c.id === catId);
    const catName = category ? category.name : catId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const list = (grouped[catId] || [])
      .filter(p => !hash || p.category === hash)
      .filter(p => (p.inventory || 0) > 0) // Only show in-stock items
      .map(p => {
        const sizes = p.sizes || p.variants || ['S', 'M', 'L'];
        const hasVariablePricing = p.variablePricing && p.sizePrices;

        // Build size options with prices if variable pricing
        const sizeOptions = sizes.map(v => {
          if (hasVariablePricing && p.sizePrices[v]) {
            return `<option value="${v}" data-price="${p.sizePrices[v]}">${v} - $${p.sizePrices[v].toFixed(2)}</option>`;
          }
          return `<option value="${v}">${v}</option>`;
        }).join('');

        // Initial price display
        const initialPrice = hasVariablePricing && p.sizePrices[sizes[0]] ? p.sizePrices[sizes[0]] : p.price;

        return `<article class="product" data-product-id="${p.id}">
        <img src="${p.image}" alt="${p.name}">
        <div class="meta">
          <h3>${p.name}</h3>
          <div class="price" id="price-${p.id}">$${initialPrice.toFixed(2)}</div>
          <div style="margin:8px 0">
            <label>Size <select id="v-${p.id}" onchange="updateProductPrice('${p.id}', this)">${sizeOptions}</select></label>
          </div>
          <button class="btn btn-primary" onclick="addProductToCart('${p.id}')">Add to Cart</button>
        </div>
      </article>`;
      }).join('');

    // Only show category if it has products
    if (!list) return '';

    return `<h2 id="${catId}">${catName}</h2><div class="product-grid">${list}</div>`;
  }).filter(html => html).join('');

  // Show message if no products at all
  if (!root.innerHTML.trim()) {
    root.innerHTML = '<p class="text-center" style="padding:40px;color:#666;">No products available yet. Check back soon!</p>';
  }
};

// Update price display when size changes (for variable pricing)
window.updateProductPrice = function (productId, select) {
  const products = window.BB_PRODUCTS || DEFAULT_PRODUCTS;
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const size = select.value;
  const price = getProductPrice(product, size);
  const priceEl = document.getElementById('price-' + productId);
  if (priceEl) {
    priceEl.textContent = '$' + price.toFixed(2);
  }
};

// Add product to cart with correct price
window.addProductToCart = function (productId) {
  const products = window.BB_PRODUCTS || DEFAULT_PRODUCTS;
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const select = document.getElementById('v-' + productId);
  const size = select ? select.value : 'M';
  const price = getProductPrice(product, size);

  BB_addToCart({
    id: productId,
    name: product.name,
    price: price,
    variant: size,
    image: product.image
  });
};
