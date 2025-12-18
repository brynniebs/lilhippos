(function () {
  const CART_KEY = 'bb_cart';
  const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const setCart = (v) => { localStorage.setItem(CART_KEY, JSON.stringify(v)); window.dispatchEvent(new Event('storage')); };

  // Add to cart function
  window.BB_addToCart = function (item) {
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === item.id && i.variant === item.variant);
    if (idx > -1) { cart[idx].qty += item.qty || 1; } else cart.push({ ...item, qty: item.qty || 1 });
    setCart(cart); if (window.__bb_updateCartCount) window.__bb_updateCartCount(); alert('Added to cart!');
  };

  // Render cart
  window.renderCart = function () {
    const root = document.getElementById('cartRoot'); if (!root) return;
    const cart = getCart();
    const cartActions = document.getElementById('cartActions');
    const cartEmpty = document.getElementById('cartEmpty');

    // Handle empty cart
    if (!cart.length) {
      root.innerHTML = '';
      if (cartActions) cartActions.style.display = 'none';
      if (cartEmpty) cartEmpty.style.display = 'block';
      return;
    }

    // Show cart actions, hide empty message
    if (cartActions) cartActions.style.display = 'block';
    if (cartEmpty) cartEmpty.style.display = 'none';

    // Render cart items
    const rows = cart.map((i, idx) => {
      const line = (i.price * i.qty).toFixed(2);
      return `<div class="cart-item">
        <img src="${i.image || 'assets/img/IMG_20250918_220658-removebg-preview.png'}" alt="${i.name}">
        <div><h4>${i.name}</h4><div class="small">${i.variant || ''}</div></div>
        <div>Qty: <input type="number" min="1" value="${i.qty}" data-idx="${idx}" class="qty-input" style="width:68px"></div>
        <div class="price">$${line}</div>
        <button class="btn btn-danger btn-small" onclick="BB_removeFromCart(${idx})">✕</button>
      </div>`
    }).join('');

    const total = cart.reduce((a, i) => a + (i.price * i.qty), 0);
    root.innerHTML = rows + `<p class="cart-summary"><strong>Subtotal: $${total.toFixed(2)}</strong></p>`;

    // Quantity change handlers
    root.querySelectorAll('.qty-input').forEach(inp => {
      inp.addEventListener('change', e => {
        const idx = +e.target.dataset.idx; const c = getCart();
        c[idx].qty = Math.max(1, parseInt(e.target.value || '1', 10)); setCart(c); window.renderCart();
      });
    });

    // Initialize PayPal buttons
    initPayPalButtons(total);
  };

  // Remove item from cart
  window.BB_removeFromCart = function (idx) {
    const cart = getCart();
    cart.splice(idx, 1);
    setCart(cart);
    window.renderCart();
    if (window.__bb_updateCartCount) window.__bb_updateCartCount();
  };

  // Initialize PayPal Buttons
  function initPayPalButtons(total) {
    const container = document.getElementById('paypal-button-container');
    if (!container || !window.paypal) return;

    // Clear any existing buttons
    container.innerHTML = '';

    const cart = getCart();
    if (cart.length === 0) return;

    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      },

      createOrder: function (data, actions) {
        const cart = getCart();
        const total = cart.reduce((a, i) => a + (i.price * i.qty), 0);

        return actions.order.create({
          purchase_units: [{
            description: "Brynnie B's Order",
            amount: {
              currency_code: 'USD',
              value: total.toFixed(2),
              breakdown: {
                item_total: { currency_code: 'USD', value: total.toFixed(2) }
              }
            },
            items: cart.map(item => ({
              name: item.name + (item.variant ? ` (${item.variant})` : ''),
              unit_amount: { currency_code: 'USD', value: item.price.toFixed(2) },
              quantity: item.qty.toString()
            }))
          }]
        });
      },

      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          // Payment successful!
          const cart = getCart();
          const total = cart.reduce((a, i) => a + (i.price * i.qty), 0);

          // Save order to cloud (if CloudSync available)
          if (window.CloudSync && CloudSync.isConfigured()) {
            saveOrderToCloud({
              id: Date.now(),
              type: 'shop',
              paypalOrderId: data.orderID,
              items: cart,
              total: total,
              status: 'paid',
              customerName: details.payer?.name?.given_name || 'Customer',
              customerEmail: details.payer?.email_address || '',
              date: new Date().toISOString()
            });
          }

          // Clear cart
          setCart([]);
          if (window.__bb_updateCartCount) window.__bb_updateCartCount();

          // Show success message
          document.getElementById('cartRoot').innerHTML = `
            <div style="text-align:center;padding:40px 0;">
              <h2 style="color:#28a745;">🎉 Thank You!</h2>
              <p>Your order has been placed successfully.</p>
              <p>Order ID: ${data.orderID}</p>
              <p>We'll email you at <strong>${details.payer?.email_address || 'your email'}</strong> with shipping details.</p>
              <a class="btn btn-primary" href="shop.html" style="margin-top:20px;">Continue Shopping</a>
            </div>
          `;
          document.getElementById('cartActions').style.display = 'none';
        });
      },

      onError: function (err) {
        console.error('PayPal Error:', err);
        alert('There was an error processing your payment. Please try again.');
      },

      onCancel: function (data) {
        console.log('Payment cancelled');
      }

    }).render('#paypal-button-container');
  }

  // Save order to cloud storage
  async function saveOrderToCloud(order) {
    try {
      const data = await CloudSync.load();
      const orders = data?.orders || [];
      orders.push(order);
      await CloudSync.save({ ...data, orders });
      console.log('Order saved to cloud!');
    } catch (e) {
      console.error('Failed to save order:', e);
    }
  }

})();
