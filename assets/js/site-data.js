/**
 * Site Data Loader - Brynnie B's
 * Loads data from npoint.io cloud storage for all visitors
 */

(function () {
    'use strict';

    // ===== CONFIGURATION =====
    // Update this BIN_ID to match cloud-sync.js
    const CONFIG = {
        BIN_ID: '2dfb970277fcb31f7f16',  // npoint.io bin ID
        BASE_URL: 'https://api.npoint.io'
    };

    // Default data (fallback if cloud fails)
    const DEFAULTS = {
        events: [
            { id: 1, date: 'Oct 25 · 9am-3pm', title: 'Pinckneyville Mardi Gras', city: 'Pinckneyville, IL', map: '#' },
            { id: 2, date: 'Nov 1-2 · Sat 9am-4pm · Sun 10am-3pm', title: 'Fox Senior High School', city: 'Arnold, MO', map: '#' },
            { id: 3, date: 'Nov 28-30 · Fri 3pm-8pm · Sat 10am-4pm', title: 'Kay Weber Art & Craft Show', city: 'Belleville, IL', map: '#' }
        ],
        gallery: [
            'assets/img/dog1.jpg',
            'assets/img/dog2.jpg',
            'assets/img/dog3.png',
            'assets/img/dog4.jpg'
        ],
        content: {
            heroHeadline: 'Handmade pet accessories that show off their personality.',
            heroSubtitle: 'Durable, comfy, and irresistibly cute—crafted in small batches with love.',
            heroFeatures: ['Handmade Quality', 'Comfort-First Fit', 'Personalized Options'],
            valueCards: [
                { title: 'Built to romp', text: 'Everyday-tough materials with smooth finishes for sensitive pups.' },
                { title: 'Made with care', text: 'Each piece is assembled by hand and inspected before it ships.' },
                { title: 'Sized just right', text: 'From tiny necks to blocky heads - flexible sizing covered.' },
                { title: 'Personal touches', text: 'Add name beads or pick your bead palette for a one-of-a-kind look.' }
            ],
            featuredTitle: 'Featured Favorites',
            featuredText: 'Beaded collars, bowties, bandanas, and shirt collars designed to turn heads at the dog park.',
            aboutStory: "Brynnie B's started with one very loved dog and a hobby for beadwork that got out of hand—in the best way.",
            aboutValues: ['Comfort and safety come first.', 'Personalization is part of the fun.', 'We source thoughtfully and assemble by hand.']
        }
    };

    // Load data from cloud
    async function loadCloudData() {
        if (!CONFIG.BIN_ID || CONFIG.BIN_ID === 'YOUR_BIN_ID_HERE') {
            console.log('SiteData: No BIN_ID configured, using defaults');
            return null;
        }

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/${CONFIG.BIN_ID}`);
            if (!response.ok) throw new Error('Failed to load');

            const data = await response.json();
            console.log('SiteData: Loaded from cloud');
            return data;
        } catch (error) {
            console.log('SiteData: Cloud load failed, using defaults');
            return null;
        }
    }

    // Filter out past events (auto-archive)
    function filterPastEvents(events) {
        if (!Array.isArray(events)) return events;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return events.filter(ev => {
            // Check if event has endDate (new format)
            if (ev.endDate) {
                const endDate = new Date(ev.endDate + 'T23:59:59');
                return endDate >= today;
            }
            // For legacy events without endDate, keep them
            return true;
        });
    }

    // Initialize and expose data
    async function init() {
        const cloudData = await loadCloudData();

        // Set global data objects with past event filtering
        const allEvents = cloudData?.events || DEFAULTS.events;
        window.BB_EVENTS = filterPastEvents(allEvents);
        window.BB_GALLERY = cloudData?.gallery || DEFAULTS.gallery;
        window.BB_CONTENT = cloudData?.content || DEFAULTS.content;
        window.BB_PRODUCTS = cloudData?.products || null; // Products from cloud

        // Dispatch event so other scripts know data is ready
        document.dispatchEvent(new CustomEvent('siteDataReady'));
    }

    // Auto-initialize
    init();

    // Expose for debugging
    window.SiteData = { CONFIG, loadCloudData };
})();
