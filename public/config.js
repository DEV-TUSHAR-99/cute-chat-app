// Configuration for Cute Chat App
// Update this with your backend URL

const CONFIG = {
    // Backend server URL - update this after deploying backend
    // Examples:
    // - Render: 'https://cute-chat-app.onrender.com'
    // - Replit: 'https://cute-chat-app.username.repl.co'
    // - Railway: 'https://cute-chat-app.up.railway.app'
    // - Local: 'http://localhost:3000'
    
    SERVER_URL: 'https://cute-chat-app.onrender.com'
};

// For local development, auto-detect
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    CONFIG.SERVER_URL = 'http://localhost:3000';
}
