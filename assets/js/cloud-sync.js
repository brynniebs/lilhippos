/**
 * Cloud Data Sync Module for Brynnie B's
 * Uses npoint.io for free, no-signup cloud storage
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://www.npoint.io/
 * 2. Click "+ Create new bin"
 * 3. Paste the starter JSON and save
 * 4. Copy the bin ID from the URL (after /api/bin/)
 * 5. Replace 'YOUR_BIN_ID_HERE' below with your bin ID
 */

const CloudSync = (function () {
    'use strict';

    // ===== CONFIGURATION - UPDATE THIS! =====
    const CONFIG = {
        BIN_ID: 'YOUR_BIN_ID_HERE',  // Replace with your npoint.io bin ID
        BASE_URL: 'https://api.npoint.io'
    };

    // Check if configured
    function isConfigured() {
        return CONFIG.BIN_ID && CONFIG.BIN_ID !== 'YOUR_BIN_ID_HERE';
    }

    // Get the bin ID
    function getBinId() {
        return CONFIG.BIN_ID;
    }

    // Save data to npoint
    async function save(data) {
        if (!isConfigured()) {
            console.warn('CloudSync: BIN_ID not configured');
            return false;
        }

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/${CONFIG.BIN_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save');

            console.log('CloudSync: Data saved to cloud!');
            return true;
        } catch (error) {
            console.error('CloudSync: Error saving:', error);
            return false;
        }
    }

    // Load data from npoint
    async function load() {
        if (!isConfigured()) {
            console.log('CloudSync: BIN_ID not configured');
            return null;
        }

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/${CONFIG.BIN_ID}`);

            if (!response.ok) throw new Error('Failed to load');

            const data = await response.json();
            console.log('CloudSync: Data loaded from cloud');
            return data;
        } catch (error) {
            console.error('CloudSync: Error loading:', error);
            return null;
        }
    }

    // Public API
    return {
        isConfigured,
        getBinId,
        save,
        load,
        CONFIG
    };
})();

// Make available globally
window.CloudSync = CloudSync;
