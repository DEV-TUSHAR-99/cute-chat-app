// Chat Page - Firebase Version (Vercel Compatible)
// Real-time chat using Firebase Realtime Database

let db = null;
let currentRoomId = null;
let currentUsername = null;
let isUser1 = false;
let messagesRef = null;

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded');
        return;
    }
    
    db = firebase.database();
    
    // Get room info from sessionStorage
    currentRoomId = sessionStorage.getItem('roomId');
    const isCreator = sessionStorage.getItem('isCreator') === 'true';
    const joinToken = sessionStorage.getItem('joinToken');
    
    if (!currentRoomId) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set username
    currentUsername = isCreator ? 'User 1' : 'User 2';
    isUser1 = isCreator;
    
    // Initialize room
    initializeRoom();
    
    // Load messages
    loadMessages();
    
    // Listen for new messages
    listenForMessages();
    
    // Listen for user join/leave
    listenForUserStatus();
});

// Initialize room in Firebase
async function initializeRoom() {
    const roomRef = db.ref(`rooms/${currentRoomId}`);
    const roomSnapshot = await roomRef.once('value');
    const roomData = roomSnapshot.val();
    
    if (!roomData) {
        alert('Room not found');
        window.location.href = 'index.html';
        return;
    }
    
    // Mark user as joined
    if (isUser1) {
        await roomRef.child('user1').update({ joined: true, joinedAt: Date.now() });
    } else {
        await roomRef.child('user2').update({ joined: true, joinedAt: Date.now() });
    }
    
    // Update UI
    updateConnectionStatus(true);
}

// Load existing messages
async function loadMessages() {
    const messagesSnapshot = await db.ref(`rooms/${currentRoomId}/messages`).once('value');
    const messages = messagesSnapshot.val();
    
    if (messages) {
        Object.entries(messages).forEach(([key, msg]) => {
            displayMessage(msg);
        });
    }
}

// Listen for new messages
function listenForMessages() {
    messagesRef = db.ref(`rooms/${currentRoomId}/messages`);
    messagesRef.orderByChild('timestamp').on('child_added', (snapshot) => {
        const msg = snapshot.val();
        displayMessage(msg);
    });
}

// Listen for user status
function listenForUserStatus() {
    const roomRef = db.ref(`rooms/${currentRoomId}`);
    roomRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const user1Joined = data.user1?.joined;
            const user2Joined = data.user2?.joined;
            
            if (user1Joined && user2Joined) {
                showNotification('Both users connected! 💕');
            }
        }
    });
}

// Send message
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const message = {
        text: text,
        sender: currentUsername,
        timestamp: Date.now()
    };
    
    // Push to Firebase
    await db.ref(`rooms/${currentRoomId}/messages`).push(message);
    
    // Clear input
    input.value = '';
}

// Display message in chat
function displayMessage(msg) {
    const chatMessages = document.getElementById('chatMessages');
    const isOwnMessage = msg.sender === currentUsername;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwnMessage ? 'sent' : 'received'}`;
    
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(msg.text)}</div>
        <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle Enter key
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Update connection status
function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
        statusEl.textContent = connected ? '🟢 Connected' : '🔴 Disconnected';
    }
}

// Show notification
function showNotification(text) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = text;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// Leave room
function leaveRoom() {
    if (messagesRef) {
        messagesRef.off();
    }
    
    // Mark as left
    const userField = isUser1 ? 'user1' : 'user2';
    db.ref(`rooms/${currentRoomId}/${userField}`).update({ joined: false });
    
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Theme Toggle
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeUI(newTheme);
}

function updateThemeUI(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
