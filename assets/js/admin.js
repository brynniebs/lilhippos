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
        CONTENT: 'BB_CONTENT'
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

    // ===== State =====
    let events = [];
    let gallery = [];
    let content = {};
    let editingEventId = null;

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
                // Also save to localStorage as backup
                localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
                localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
                localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
                return;
            }
        }
        // Fallback to localStorage
        events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [...DEFAULT_EVENTS];
        gallery = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY)) || [...DEFAULT_GALLERY];
        content = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENT)) || { ...DEFAULT_CONTENT };
    }

    async function saveData() {
        // Save to localStorage first (instant)
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
        localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));

        // Then save to cloud for everyone
        if (window.CloudSync && CloudSync.isConfigured()) {
            const success = await CloudSync.save({ events, gallery, content });
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

        // Export/Import
        $('exportBtn').addEventListener('click', exportData);
        $('importInput').addEventListener('change', importData);
    }

    // ===== PUBLIC API =====
    window.AdminPanel = {
        editEvent,
        deleteEvent,
        deleteImage,
        updateValueCard
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
