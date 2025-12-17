/**
 * Cloud Data Sync Module for Brynnie B's
 * Uses JSONbin.io for free cloud storage
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://jsonbin.io and create a free account
 * 2. Go to API Keys and copy your X-Master-Key
 * 3. Replace 'YOUR_API_KEY_HERE' below with your key
 * 4. The first save will create the bin automatically
 */

const CloudSync = (function () {
    'use strict';

    // ===== CONFIGURATION - UPDATE THIS! =====
    const CONFIG = {
        API_KEY: 'YOUR_API_KEY_HERE',  // Replace with your JSONbin.io X-Master-Key
        BIN_ID: null,  // Will be set after first save, or set manually
        BASE_URL: 'https://api.jsonbin.io/v3'
    };

    // Storage key for bin ID
    const BIN_ID_KEY = 'BB_JSONBIN_ID';

    // Get stored bin ID
    function getBinId() {
        return CONFIG.BIN_ID || localStorage.getItem(BIN_ID_KEY);
    }

    // Save bin ID
    function saveBinId(id) {
        localStorage.setItem(BIN_ID_KEY, id);
        CONFIG.BIN_ID = id;
    }

    // Check if configured
    function isConfigured() {
        return CONFIG.API_KEY && CONFIG.API_KEY !== 'YOUR_API_KEY_HERE';
    }

    // Create new bin with data
    async function createBin(data) {
        if (!isConfigured()) {
            console.error('CloudSync: API key not configured');
            return null;
        }

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/b`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': CONFIG.API_KEY,
                    'X-Bin-Name': 'brynnie-bs-site-data',
                    'X-Bin-Private': 'false'  // Public read access
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to create bin');

            const result = await response.json();
            const binId = result.metadata.id;
            saveBinId(binId);
            console.log('CloudSync: Created new bin:', binId);
            return binId;
        } catch (error) {
            console.error('CloudSync: Error creating bin:', error);
            return null;
        }
    }

    // Update existing bin
    async function updateBin(data) {
        const binId = getBinId();
        if (!binId) {
            return await createBin(data);
        }

        if (!isConfigured()) {
            console.error('CloudSync: API key not configured');
            return false;
        }

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': CONFIG.API_KEY
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to update bin');

            console.log('CloudSync: Data saved to cloud');
            return true;
        } catch (error) {
            console.error('CloudSync: Error updating bin:', error);
            return false;
        }
    }

    // Read from bin (public access - no API key needed for reading)
    async function readBin() {
        const binId = getBinId();
        if (!binId) {
            console.log('CloudSync: No bin ID found');
            return null;
        }

        try {
            // Use /latest for most recent version, public bins don't need API key
            const response = await fetch(`${CONFIG.BASE_URL}/b/${binId}/latest`, {
                headers: {
                    'X-Master-Key': CONFIG.API_KEY || 'dummy'  // Some key needed for /latest
                }
            });

            if (!response.ok) throw new Error('Failed to read bin');

            const result = await response.json();
            console.log('CloudSync: Data loaded from cloud');
            return result.record;
        } catch (error) {
            console.error('CloudSync: Error reading bin:', error);
            return null;
        }
    }

    // Public API
    return {
        isConfigured,
        getBinId,
        saveBinId,
        save: updateBin,
        load: readBin,
        CONFIG  // Expose for manual configuration
    };
})();

// Make available globally
window.CloudSync = CloudSync;
