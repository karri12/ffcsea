/**
 * FFC Sea Foods - Shared Config
 * Settings are saved by admin panel and read by the storefront.
 */

const FFC_CONFIG_KEY = 'ffc_shop_config';

const DEFAULT_CONFIG = {
    products: {
        'prawn-100': {
            name: 'Large Prawns',
            count: '100 Count',
            pricePerKg: 300,
            image: 'assets/prawns-100.png'
        },
        'prawn-150': {
            name: 'Medium Prawns',
            count: '150 Count',
            pricePerKg: 250,
            image: 'assets/prawns-150.jpg'
        },
        'prawn-200': {
            name: 'Small Prawns',
            count: '200 Count',
            pricePerKg: 200,
            image: 'assets/prawns-200.png'
        }
    },
    delivery: {
        charge: 0
    },
    prepServices: {
        none:      { label: 'None (Whole Prawns with Shell)',       chargePerKg: 0 },
        cleaning:  { label: 'Cleaning Only (Cleaned, Shell On)',    chargePerKg: 0 },
        peeled:    { label: 'Peeled Service (Shell & Head Removed)',chargePerKg: 30 },
        butterfly: { label: 'Butterfly Cut Service (Split Back)',   chargePerKg: 30 }
    }
};

function getConfig() {
    try {
        const saved = localStorage.getItem(FFC_CONFIG_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Deep merge so new keys added in DEFAULT_CONFIG still appear
            return deepMerge(DEFAULT_CONFIG, parsed);
        }
    } catch (e) {
        console.warn('Could not load shop config from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

function saveConfig(config) {
    try {
        localStorage.setItem(FFC_CONFIG_KEY, JSON.stringify(config));
        return true;
    } catch (e) {
        console.error('Could not save shop config:', e);
        return false;
    }
}

function deepMerge(defaults, overrides) {
    const result = JSON.parse(JSON.stringify(defaults));
    for (const key in overrides) {
        if (
            overrides[key] !== null &&
            typeof overrides[key] === 'object' &&
            !Array.isArray(overrides[key]) &&
            typeof result[key] === 'object'
        ) {
            result[key] = deepMerge(result[key], overrides[key]);
        } else {
            result[key] = overrides[key];
        }
    }
    return result;
}

// Expose globally
window.FFCConfig = { getConfig, saveConfig, DEFAULT_CONFIG, FFC_CONFIG_KEY };
