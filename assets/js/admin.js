/**
 * Admin Panel JavaScript – Brynnie B's
 * Handles authentication, CRUD for events/gallery, and content management
 */

(function () {
    'use strict';

    // ===== Configuration =====
    const ADMIN_PASSWORD = 'brynnie2024';  // Change this password!
    const STORAGE_KEYS = {
        AUTH: 'BB_ADMIN_AUTH',
        EVENTS: 'BB_EVENTS',
        GALLERY: 'BB_GALLERY',
        CONTENT: 'BB_CONTENT',
        PRODUCTS: 'BB_PRODUCTS',
        ORDERS: 'BB_ORDERS',
        CATEGORIES: 'BB_CATEGORIES'
    };

    // ===== Default Data =====
    const DEFAULT_EVENTS = [
        { id: 1, date: 'Oct 25 · 9am–3pm', title: 'Pinckneyville Mardi Gras', city: 'Pinckneyville, IL', map: 'https://www.google.com/maps/place/4+S+Walnut+St,+Pinckneyville,+IL+62274' },
        { id: 2, date: 'Nov 1–2 · Sat 9am–4pm · Sun 10am–3pm', title: 'Fox Senior High School', city: 'Arnold, MO', map: 'https://www.google.com/maps?q=fox+senior+high+school+arnold+mo' },
        { id: 3, date: 'Nov 28–30 · Fri 3pm–8pm · Sat 10am–4pm · Sun 10am–4pm', title: 'Kay Weber Art & Craft Show', city: 'Belleville, IL', map: 'https://www.google.com/maps?q=200+S+Belt+E,+Belleville,+IL+62220' }
    ];

    const DEFAULT_GALLERY = [
        'assets/img/dog1.jpg',
        'assets/img/dog2.jpg',
        'assets/img/dog3.png',
        'assets/img/dog4.jpg'
    ];

    const DEFAULT_CONTENT = {
        heroHeadline: 'Handmade pet accessories that show off their personality.',
        heroSubtitle: 'Durable, comfy, and irresistibly cute—crafted in small batches with love.',
        heroFeatures: ['Handmade Quality', 'Comfort‑First Fit', 'Personalized Options'],
        valueCards: [
            { title: 'Built to romp', text: 'Everyday‑tough materials with smooth finishes for sensitive pups.' },
            { title: 'Made with care', text: 'Each piece is assembled by hand and inspected before it ships.' },
            { title: 'Sized just right', text: 'From tiny necks to blocky heads - we have got flexible sizing covered.' },
            { title: 'Personal touches', text: 'Add name beads or pick your bead palette for a one‑of‑a‑kind look.' }
        ],
        featuredTitle: 'Featured Favorites',
        featuredText: 'Beaded collars, bowties, bandanas, and shirt collars designed to turn heads at the dog park.',
        aboutStory: "Brynnie B's started with one very loved dog and a hobby for beadwork that got out of hand—in the best way. Today we design and handcraft small‑batch accessories that are comfortable to wear and made to last. We believe every pet deserves something special that shows off their personality.",
        aboutValues: ['Comfort and safety come first.', 'Personalization is part of the fun.', 'We source thoughtfully and assemble by hand.']
    };

    const DEFAULT_PRODUCTS = [
        { id: 'bc-rose', name: 'Beaded Collar – Rose Mix', price: 24.00, category: 'beaded-collars', image: 'assets/img/IMG_20250918_220658-removebg-preview.png', sizes: ['XS', 'S', 'M', 'L'], colors: ['Rose'], notes: '', inventory: 10 },
        { id: 'bc-berry', name: 'Beaded Collar – Berry Pop', price: 24.00, category: 'beaded-collars', image: 'assets/img/IMG_20250918_220658-removebg-preview.png', sizes: ['XS', 'S', 'M', 'L'], colors: ['Berry'], notes: '', inventory: 10 },
        { id: 'bw-classic', name: 'Bowtie – Classic Check', price: 16.00, category: 'bowties', image: 'assets/img/IMG_20250918_220658-removebg-preview.png', sizes: ['S', 'M', 'L'], colors: ['Multi'], notes: '', inventory: 5 },
        { id: 'bd-peach', name: 'Bandana – Peach Plaid', price: 14.00, category: 'bandanas', image: 'assets/img/IMG_20250918_220658-removebg-preview.png', sizes: ['S', 'M', 'L'], colors: ['Peach'], notes: '', inventory: 8 },
        { id: 'sc-denim', name: 'Shirt Collar – Soft Denim', price: 18.00, category: 'shirt-collars', image: 'assets/img/IMG_20250918_220658-removebg-preview.png', sizes: ['S', 'M', 'L'], colors: ['Denim'], notes: '', inventory: 6 }
    ];

    const DEFAULT_ORDERS = [];

    const DEFAULT_CATEGORIES = [
        { id: 'beaded-collars', name: 'Beaded Collars' },
        { id: 'bowties', name: 'Bowties' },
        { id: 'bandanas', name: 'Bandanas' },
        { id: 'shirt-collars', name: 'Shirt Collars' }
    ];

    // ===== State =====
    let events = [];
    let gallery = [];
    let content = {};
    let products = [];
    let orders = [];
    let categories = [];
    let editingEventId = null;
    let editingProductId = null;
    let salesChart = null;

    // ===== DOM Elements =====
    const $ = id => document.getElementById(id);

    // ===== Initialization =====
    async function init() {
        setupEventListeners();
        await loadData();
        checkAuth();
    }

    async function loadData() {
        // Try to load from cloud first
        if (window.CloudSync && CloudSync.isConfigured()) {
            const cloudData = await CloudSync.load();
            if (cloudData) {
                events = cloudData.events || [...DEFAULT_EVENTS];
                gallery = cloudData.gallery || [...DEFAULT_GALLERY];
                content = cloudData.content || { ...DEFAULT_CONTENT };
                products = cloudData.products || [...DEFAULT_PRODUCTS];
                orders = cloudData.orders || [...DEFAULT_ORDERS];
                categories = cloudData.categories || [...DEFAULT_CATEGORIES];
                // Also save to localStorage as backup
                localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
                localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
                localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
                localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
                localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
                localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
                return;
            }
        }
        // Fallback to localStorage
        events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [...DEFAULT_EVENTS];
        gallery = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY)) || [...DEFAULT_GALLERY];
        content = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT)) || { ...DEFAULT_CONTENT };
        products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || [...DEFAULT_PRODUCTS];
        orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [...DEFAULT_ORDERS];
        categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || [...DEFAULT_CATEGORIES];
    }

    async function saveData() {
        // Save to localStorage first (instant)
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
        localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));

        // Then save to cloud for everyone
        if (window.CloudSync && CloudSync.isConfigured()) {
            const success = await CloudSync.save({ events, gallery, content, products, orders, categories });
            if (success) {
                console.log('Data synced to cloud!');
            }
        }
    }

    // ===== Authentication =====
    function checkAuth() {
        const isAuth = localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
        if (isAuth) {
            showDashboard();
        }
    }

    function handleLogin(e) {
        e.preventDefault();
        const password = $('passwordInput').value;
        const errorEl = $('loginError');

        if (password === ADMIN_PASSWORD) {
            localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
            errorEl.classList.remove('show');
            showDashboard();
        } else {
            errorEl.classList.add('show');
            $('passwordInput').value = '';
        }
    }

    function handleLogout() {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        location.reload();
    }

    function showDashboard() {
        $('loginScreen').style.display = 'none';
        $('adminDashboard').classList.add('active');
        renderEvents();
        renderGallery();
        renderContent();
        renderProducts();
        renderOrders();
        renderDashboard();
        renderCategories();
    }

    // ===== Tab Navigation =====
    function setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                $(btn.dataset.tab).classList.add('active');
            });
        });
    }

    // ===== EVENTS MANAGEMENT =====
    function renderEvents() {
        const list = $('eventsList');
        if (!list) return;

        if (events.length === 0) {
            list.innerHTML = '<p class="text-center" style="color:#666;padding:20px;">No events yet. Add your first event above!</p>';
            return;
        }

        list.innerHTML = events.map(ev => `
      <div class="item-card" data-id="${ev.id}">
        <div class="item-info">
          <p class="item-title">${ev.title}</p>
          <p class="item-meta">${ev.date} • ${ev.city}</p>
        </div>
        <div class="item-actions">
          <button class="btn btn-secondary btn-small" onclick="AdminPanel.editEvent(${ev.id})">Edit</button>
          <button class="btn btn-danger btn-small" onclick="AdminPanel.deleteEvent(${ev.id})">Delete</button>
        </div>
      </div>
    `).join('');
    }

    // Format date for display (e.g., "Nov 28-30" or "Dec 25")
    function formatEventDate(startDate, endDate, times) {
        const start = new Date(startDate + 'T00:00:00');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let dateStr = `${months[start.getMonth()]} ${start.getDate()}`;

        if (endDate) {
            const end = new Date(endDate + 'T00:00:00');
            if (start.getMonth() === end.getMonth()) {
                dateStr = `${months[start.getMonth()]} ${start.getDate()}-${end.getDate()}`;
            } else {
                dateStr = `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
            }
        }

        if (times) {
            dateStr += ` · ${times}`;
        }

        return dateStr;
    }

    function handleEventSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const startDate = form.eventStartDate.value;
        const endDate = form.eventEndDate.value || null;
        const times = form.eventTimes.value || '';

        const eventData = {
            id: editingEventId || Date.now(),
            date: formatEventDate(startDate, endDate, times),
            startDate: startDate,
            endDate: endDate || startDate,
            title: form.eventTitle.value,
            city: form.eventCity.value,
            map: form.eventMap.value || '#'
        };

        if (editingEventId) {
            const idx = events.findIndex(ev => ev.id === editingEventId);
            if (idx > -1) events[idx] = eventData;
            editingEventId = null;
            $('eventFormTitle').textContent = 'Add New Event';
            $('eventSubmitBtn').textContent = 'Add Event';
        } else {
            events.push(eventData);
        }

        saveData();
        renderEvents();
        form.reset();
        showToast('Event saved!');
    }

    function editEvent(id) {
        const ev = events.find(e => e.id === id);
        if (!ev) return;

        editingEventId = id;
        $('eventStartDate').value = ev.startDate || '';
        $('eventEndDate').value = ev.endDate || '';
        $('eventTimes').value = '';
        $('eventTitle').value = ev.title;
        $('eventCity').value = ev.city;
        $('eventMap').value = ev.map;
        $('eventFormTitle').textContent = 'Edit Event';
        $('eventSubmitBtn').textContent = 'Update Event';
        $('eventsPanel').scrollIntoView({ behavior: 'smooth' });
    }

    function deleteEvent(id) {
        if (!confirm('Delete this event?')) return;
        events = events.filter(ev => ev.id !== id);
        saveData();
        renderEvents();
        showToast('Event deleted');
    }

    // ===== GALLERY MANAGEMENT =====
    function renderGallery() {
        const grid = $('galleryGrid');
        if (!grid) return;

        if (gallery.length === 0) {
            grid.innerHTML = '<p class="text-center" style="color:#666;padding:20px;grid-column:1/-1;">No images yet. Upload your first image!</p>';
            return;
        }

        grid.innerHTML = gallery.map((src, idx) => `
      <div class="gallery-item">
        <img src="${src}" alt="Gallery image ${idx + 1}">
        <button class="delete-btn" onclick="AdminPanel.deleteImage(${idx})" title="Delete">×</button>
      </div>
    `).join('');
    }

    function handleImageUpload(e) {
        const files = e.target.files;
        if (!files.length) return;

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = function (ev) {
                gallery.push(ev.target.result);  // Store as base64
                saveData();
                renderGallery();
                showToast('Image uploaded!');
            };
            reader.readAsDataURL(file);
        });

        e.target.value = '';  // Reset input
    }

    function deleteImage(idx) {
        if (!confirm('Delete this image?')) return;
        gallery.splice(idx, 1);
        saveData();
        renderGallery();
        showToast('Image deleted');
    }

    // ===== CONTENT MANAGEMENT =====
    function renderContent() {
        // Hero section
        $('contentHeroHeadline').value = content.heroHeadline || '';
        $('contentHeroSubtitle').value = content.heroSubtitle || '';
        $('contentHeroFeatures').value = (content.heroFeatures || []).join('\n');

        // Value cards
        const cardsHtml = (content.valueCards || []).map((card, idx) => `
      <div class="content-section">
        <h4>Card ${idx + 1}</h4>
        <div class="form-group mb-0">
          <label>Title</label>
          <input type="text" value="${card.title}" onchange="AdminPanel.updateValueCard(${idx}, 'title', this.value)">
        </div>
        <div class="form-group mb-0 mt-24">
          <label>Text</label>
          <textarea onchange="AdminPanel.updateValueCard(${idx}, 'text', this.value)">${card.text}</textarea>
        </div>
      </div>
    `).join('');
        $('valueCardsEditor').innerHTML = cardsHtml;

        // Featured section
        $('contentFeaturedTitle').value = content.featuredTitle || '';
        $('contentFeaturedText').value = content.featuredText || '';

        // About section
        $('contentAboutStory').value = content.aboutStory || '';
        $('contentAboutValues').value = (content.aboutValues || []).join('\n');
    }

    function saveContent() {
        content.heroHeadline = $('contentHeroHeadline').value;
        content.heroSubtitle = $('contentHeroSubtitle').value;
        content.heroFeatures = $('contentHeroFeatures').value.split('\n').filter(s => s.trim());
        content.featuredTitle = $('contentFeaturedTitle').value;
        content.featuredText = $('contentFeaturedText').value;
        content.aboutStory = $('contentAboutStory').value;
        content.aboutValues = $('contentAboutValues').value.split('\n').filter(s => s.trim());

        saveData();
        showToast('Content saved!');
    }

    function updateValueCard(idx, field, value) {
        if (content.valueCards && content.valueCards[idx]) {
            content.valueCards[idx][field] = value;
            saveData();
        }
    }

    // ===== PRODUCTS MANAGEMENT =====
    function renderProducts() {
        const list = $('productsList');
        if (!list) return;

        if (products.length === 0) {
            list.innerHTML = '<p class="text-center" style="color:#666;padding:20px;">No products yet. Add your first product above!</p>';
            return;
        }

        list.innerHTML = products.map(p => `
      <div class="item-card" data-id="${p.id}">
        <img src="${p.image || 'assets/img/IMG_20250918_220658-removebg-preview.png'}" alt="${p.name}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
        <div class="item-info">
          <p class="item-title">${p.name}</p>
          <p class="item-meta">$${p.price.toFixed(2)} • ${p.category} • Stock: ${p.inventory || 0}</p>
        </div>
        <div class="item-actions">
          <button class="btn btn-secondary btn-small" onclick="AdminPanel.editProduct('${p.id}')">Edit</button>
          <button class="btn btn-danger btn-small" onclick="AdminPanel.deleteProduct('${p.id}')">Delete</button>
        </div>
      </div>
    `).join('');
    }

    // ===== CATEGORY MANAGEMENT =====
    function renderCategories() {
        const select = $('productCategory');
        if (!select) return;

        select.innerHTML = categories.map(c =>
            `<option value="${c.id}">${c.name}</option>`
        ).join('');
    }

    function addCategory() {
        const input = $('newCategoryInput');
        const name = input.value.trim();
        if (!name) return;

        const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (categories.some(c => c.id === id)) {
            showToast('Category already exists!');
            return;
        }

        categories.push({ id, name });
        saveData();
        renderCategories();
        input.value = '';
        showToast('Category added!');
    }

    function deleteCategory() {
        const select = $('productCategory');
        const selectedId = select.value;
        if (!selectedId) return;

        // Check if any products use this category
        const productsUsingCategory = products.filter(p => p.category === selectedId);
        if (productsUsingCategory.length > 0) {
            alert(`Cannot delete: ${productsUsingCategory.length} product(s) use this category. Change their category first.`);
            return;
        }

        if (!confirm('Delete this category?')) return;

        categories = categories.filter(c => c.id !== selectedId);
        saveData();
        renderCategories();
        showToast('Category deleted!');
    }

    // Product colors state
    let productColors = [];

    function addColor() {
        const input = $('colorInput');
        const color = input.value.trim();
        if (color && !productColors.includes(color)) {
            productColors.push(color);
            renderColorTags();
            input.value = '';
        }
    }

    function removeColor(idx) {
        productColors.splice(idx, 1);
        renderColorTags();
    }

    function renderColorTags() {
        const container = $('colorTags');
        if (!container) return;
        container.innerHTML = productColors.map((c, i) =>
            `<span class="color-tag">${c} <button type="button" onclick="AdminPanel.removeColor(${i})">×</button></span>`
        ).join('');
    }

    function handleProductSubmit(e) {
        e.preventDefault();
        const form = e.target;

        // Get sizes from checkboxes
        const sizeCheckboxes = form.querySelectorAll('input[name="sizes"]:checked');
        const sizes = Array.from(sizeCheckboxes).map(cb => cb.value);

        // Get image from hidden field (set by upload)
        const imageValue = $('productImage').value;

        const productData = {
            id: editingProductId || 'prod-' + Date.now(),
            name: form.productName.value,
            price: parseFloat(form.productPrice.value) || 0,
            category: form.productCategory.value,
            image: imageValue || 'assets/img/IMG_20250918_220658-removebg-preview.png',
            sizes: sizes.length ? sizes : ['S', 'M', 'L'],
            colors: [...productColors],
            notes: form.productNotes.value || '',
            inventory: parseInt(form.productInventory.value) || 0
        };

        if (editingProductId) {
            const idx = products.findIndex(p => p.id === editingProductId);
            if (idx > -1) products[idx] = productData;
            editingProductId = null;
            $('productFormTitle').textContent = 'Add New Product';
            $('productSubmitBtn').textContent = 'Add Product';
        } else {
            products.push(productData);
        }

        saveData();
        renderProducts();
        renderDashboard();

        // Reset form
        form.reset();
        productColors = [];
        renderColorTags();
        resetProductImagePreview();

        showToast('Product saved!');
    }

    function editProduct(id) {
        const p = products.find(prod => prod.id === id);
        if (!p) return;

        editingProductId = id;
        $('productName').value = p.name;
        $('productPrice').value = p.price;
        $('productCategory').value = p.category;
        $('productImage').value = p.image || '';
        $('productNotes').value = p.notes || '';
        $('productInventory').value = p.inventory || 0;

        // Set size checkboxes
        document.querySelectorAll('input[name="sizes"]').forEach(cb => {
            cb.checked = (p.sizes || []).includes(cb.value);
        });

        // Set color tags
        productColors = [...(p.colors || [])];
        renderColorTags();

        // Set image preview
        if (p.image) {
            setProductImagePreview(p.image);
        }

        $('productFormTitle').textContent = 'Edit Product';
        $('productSubmitBtn').textContent = 'Update Product';
        $('productsPanel').scrollIntoView({ behavior: 'smooth' });
    }

    function setProductImagePreview(src) {
        const preview = $('productImagePreview');
        if (preview) {
            preview.innerHTML = `<img src="${src}" alt="Preview" style="max-width:200px;max-height:200px;border-radius:8px;">`;
        }
        $('productImage').value = src;
    }

    function resetProductImagePreview() {
        const preview = $('productImagePreview');
        if (preview) {
            preview.innerHTML = `<span class="upload-icon">📷</span><p>Click or drag image here</p>`;
        }
        $('productImage').value = '';
    }

    function handleProductImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (ev) {
            setProductImagePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    }

    function deleteProduct(id) {
        if (!confirm('Delete this product?')) return;
        products = products.filter(p => p.id !== id);
        saveData();
        renderProducts();
        renderDashboard();
        showToast('Product deleted');
    }

    // ===== ORDERS MANAGEMENT =====
    function renderOrders() {
        const customList = $('customOrdersList');
        const shopList = $('shopOrdersList');

        if (customList) {
            const customOrders = orders.filter(o => o.type === 'custom');
            if (customOrders.length === 0) {
                customList.innerHTML = '<p class="text-center" style="color:#666;padding:20px;">No custom orders yet.</p>';
            } else {
                customList.innerHTML = customOrders.map(o => `
          <div class="item-card">
            <div class="item-info">
              <p class="item-title">${o.name} - ${o.email}</p>
              <p class="item-meta">${o.pet || 'No pet name'} • ${o.size} • ${o.hardware}</p>
              <p class="item-meta">${o.colors || 'No color specified'}</p>
            </div>
            <div class="item-actions">
              <span style="background:${o.status === 'paid' ? 'var(--success)' : o.status === 'quoted' ? 'var(--tan)' : 'var(--blush)'};color:#fff;padding:4px 10px;border-radius:12px;font-size:0.8rem;">${o.status || 'pending'}</span>
            </div>
          </div>
        `).join('');
            }
        }

        if (shopList) {
            const shopOrders = orders.filter(o => o.type === 'shop');
            if (shopOrders.length === 0) {
                shopList.innerHTML = '<p class="text-center" style="color:#666;padding:20px;">No shop orders yet.</p>';
            } else {
                shopList.innerHTML = shopOrders.map(o => `
          <div class="item-card">
            <div class="item-info">
              <p class="item-title">Order #${o.id.toString().slice(-6)}</p>
              <p class="item-meta">${o.items?.length || 0} items • $${(o.total || 0).toFixed(2)}</p>
            </div>
            <div class="item-actions">
              <span style="background:${o.status === 'paid' ? 'var(--success)' : 'var(--blush)'};color:#fff;padding:4px 10px;border-radius:12px;font-size:0.8rem;">${o.status || 'pending'}</span>
            </div>
          </div>
        `).join('');
            }
        }
    }

    // ===== DASHBOARD =====
    function renderDashboard() {
        // Calculate stats
        const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.total || 0), 0);
        const orderCount = orders.length;
        const productCount = products.length;
        const lowStock = products.filter(p => (p.inventory || 0) < 5).length;

        // Update stat cards
        if ($('statRevenue')) $('statRevenue').textContent = '$' + totalRevenue.toFixed(2);
        if ($('statOrders')) $('statOrders').textContent = orderCount;
        if ($('statProducts')) $('statProducts').textContent = productCount;
        if ($('statLowStock')) $('statLowStock').textContent = lowStock;

        // Recent orders
        const recentList = $('recentOrdersList');
        if (recentList) {
            const recent = orders.slice(-5).reverse();
            if (recent.length === 0) {
                recentList.innerHTML = '<p class="text-center" style="color:#666;padding:20px;">No orders yet.</p>';
            } else {
                recentList.innerHTML = recent.map(o => `
          <div class="item-card">
            <div class="item-info">
              <p class="item-title">${o.type === 'custom' ? 'Custom Order' : 'Shop Order'} #${o.id.toString().slice(-6)}</p>
              <p class="item-meta">$${(o.total || 0).toFixed(2)} • ${o.status || 'pending'}</p>
            </div>
          </div>
        `).join('');
            }
        }

        // Sales chart
        renderSalesChart();
    }

    function renderSalesChart() {
        const canvas = $('salesChart');
        if (!canvas) return;

        // Generate mock data for demo (replace with real order data)
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            // Count orders for this day
            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.date || o.id);
                return orderDate.toDateString() === d.toDateString() && o.status === 'paid';
            });
            data.push(dayOrders.reduce((sum, o) => sum + (o.total || 0), 0));
        }

        if (salesChart) {
            salesChart.data.labels = labels;
            salesChart.data.datasets[0].data = data;
            salesChart.update();
        } else {
            salesChart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue ($)',
                        data: data,
                        backgroundColor: 'rgba(46, 127, 134, 0.7)',
                        borderColor: 'rgba(46, 127, 134, 1)',
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    }

    // ===== EXPORT / IMPORT =====
    function exportData() {
        const data = {
            events,
            gallery,
            content,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `brynnie-bs-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Data exported!');
    }

    function importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (ev) {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.events) events = data.events;
                if (data.gallery) gallery = data.gallery;
                if (data.content) content = data.content;
                saveData();
                renderEvents();
                renderGallery();
                renderContent();
                showToast('Data imported successfully!');
            } catch (err) {
                alert('Invalid backup file. Please select a valid JSON backup.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    // ===== UTILITIES =====
    function showToast(message) {
        const toast = $('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Login
        $('loginForm').addEventListener('submit', handleLogin);
        $('logoutBtn').addEventListener('click', handleLogout);

        // Tabs
        setupTabs();

        // Events form
        $('eventForm').addEventListener('submit', handleEventSubmit);

        // Gallery upload
        const uploadArea = $('uploadArea');
        const fileInput = $('galleryUpload');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', e => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--teal)';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--tan)';
        });
        uploadArea.addEventListener('drop', e => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--tan)';
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleImageUpload({ target: fileInput });
            }
        });
        fileInput.addEventListener('change', handleImageUpload);

        // Content save
        $('saveContentBtn').addEventListener('click', saveContent);

        // Products form
        $('productForm').addEventListener('submit', handleProductSubmit);

        // Product image upload
        const productImageUpload = $('productImageUpload');
        const productImageFile = $('productImageFile');
        if (productImageUpload && productImageFile) {
            productImageUpload.addEventListener('click', () => productImageFile.click());
            productImageUpload.addEventListener('dragover', e => {
                e.preventDefault();
                productImageUpload.style.borderColor = 'var(--teal)';
            });
            productImageUpload.addEventListener('dragleave', () => {
                productImageUpload.style.borderColor = 'var(--tan)';
            });
            productImageUpload.addEventListener('drop', e => {
                e.preventDefault();
                productImageUpload.style.borderColor = 'var(--tan)';
                if (e.dataTransfer.files.length) {
                    productImageFile.files = e.dataTransfer.files;
                    handleProductImageUpload({ target: productImageFile });
                }
            });
            productImageFile.addEventListener('change', handleProductImageUpload);
        }

    }

    // ===== PUBLIC API =====
    window.AdminPanel = {
        editEvent,
        deleteEvent,
        deleteImage,
        updateValueCard,
        editProduct,
        deleteProduct,
        addColor,
        removeColor,
        addCategory,
        deleteCategory
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
