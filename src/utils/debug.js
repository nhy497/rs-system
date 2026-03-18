// src/utils/debug.js

function isDebugEnabled() {
    const urlParams = new URLSearchParams(window.location.search);
    return APP_CONFIG.DEBUG || urlParams.get('debug') === 'true';
}

function debugLog(...args) {
    if (isDebugEnabled()) {
        console.log('[DEBUG]:', ...args);
    }
}

function debugInfo(...args) {
    if (isDebugEnabled()) {
        console.info('[INFO]:', ...args);
    }
}

function debugWarn(...args) {
    console.warn('[WARN]:', ...args);
}

function debugError(...args) {
    console.error('[ERROR]:', ...args);
}

export { isDebugEnabled, debugLog, debugInfo, debugWarn, debugError };