(function(){
  const CART_KEY = 'bb_cart';
  const getCart = ()=> JSON.parse(localStorage.getItem(CART_KEY)||'[]');
  const setCart = (v)=>{ localStorage.setItem(CART_KEY, JSON.stringify(v)); window.dispatchEvent(new Event('storage')); };
  window.BB_addToCart = function(item){
    const cart = getCart();
    const idx = cart.findIndex(i=> i.id===item.id && i.variant===item.variant);
    if(idx>-1){ cart[idx].qty += item.qty || 1; } else cart.push({...item, qty:item.qty||1});
    setCart(cart); if(window.__bb_updateCartCount) window.__bb_updateCartCount(); alert('Added to cart!');
  };
  window.renderCart = function(){
    const root = document.getElementById('cartRoot'); if(!root) return;
    const cart = getCart(); if(!cart.length){ root.innerHTML = '<p>Your cart is empty.</p>'; return; }
    const rows = cart.map((i,idx)=>{
      const line = (i.price*i.qty).toFixed(2);
      return `<div class="cart-item">
        <img src="${i.image||'assets/img/IMG_20250918_220658-removebg-preview.png'}" alt="${i.name}">
        <div><h4>${i.name}</h4><div class="small">${i.variant||''}</div></div>
        <div>Qty: <input type="number" min="1" value="${i.qty}" data-idx="${idx}" class="qty-input" style="width:68px"></div>
        <div class="price">$${line}</div></div>`
    }).join('');
    const total = cart.reduce((a,i)=>a+(i.price*i.qty),0);
    root.innerHTML = rows + `<p class="cart-summary">Subtotal: $${total.toFixed(2)}</p>`;
    root.querySelectorAll('.qty-input').forEach(inp=>{
      inp.addEventListener('change', e=>{
        const idx = +e.target.dataset.idx; const c = getCart();
        c[idx].qty = Math.max(1, parseInt(e.target.value||'1',10)); setCart(c); window.renderCart();
      });
    });
    const checkoutBtn = document.getElementById('checkoutBtn');
    if(checkoutBtn){
      checkoutBtn.onclick = ()=>{
        const lines = getCart().map(i=>`${i.qty} x ${i.name} (${i.variant||'standard'}) - $${(i.price*i.qty).toFixed(2)}`).join('\n');
        const total = getCart().reduce((a,i)=>a+i.price*i.qty,0).toFixed(2);
        const subject = encodeURIComponent('Brynnie B’s Order');
        const body = encodeURIComponent(lines+`\n\nSubtotal: $${total}`);
        location.href = `mailto:?subject=${subject}&body=${body}`;
      };
    }
  };
})();
