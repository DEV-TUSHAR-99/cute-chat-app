// Chat Page JavaScript

const socket = io(CONFIG.SERVER_URL);
let currentRoomId = null;
let currentUsername = null;
let isTyping = false;
let typingTimeout = null;

// Theme Toggle Functionality
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeUI(newTheme);
    
    // Notify animation system about theme change
    if (window.animSystem) {
        window.animSystem.isDarkTheme = newTheme === 'dark';
        window.animSystem.initAnimation();
    }
}

function updateThemeUI(theme) {
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');
    
    if (theme === 'dark') {
        icon.textContent = '☀️';
        text.textContent = 'Light';
    } else {
        icon.textContent = '🌙';
        text.textContent = 'Dark';
    }
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

// Initialize theme
loadTheme();

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');
const joinToken = urlParams.get('token');

// DOM Elements
const usernameModal = document.getElementById('usernameModal');
const chatInterface = document.getElementById('chatInterface');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const typingIndicator = document.getElementById('typingIndicator');
const typingText = document.getElementById('typingText');
const userCount = document.getElementById('userCount');

// Initialize
if (!roomId) {
    alert('No room specified. Redirecting to home...');
    window.location.href = '/';
} else {
    currentRoomId = roomId;
    verifyRoom();
}

// Verify room before allowing entry
async function verifyRoom() {
    try {
        const response = await fetch(`${CONFIG.SERVER_URL}/api/verify-room/${roomId}?token=${joinToken || ''}`);
        const data = await response.json();
        
        if (!data.valid) {
            alert(data.error || 'Invalid room');
            window.location.href = '/';
            return;
        }
        
        // Room is valid, show username modal
        usernameModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error verifying room:', error);
        alert('Failed to verify room');
        window.location.href = '/';
    }
}

// Set username and join room
function setUsername() {
    const usernameInput = document.getElementById('usernameInput');
    const username = usernameInput.value.trim();
    
    if (!username) {
        alert('Please enter your name');
        return;
    }
    
    if (username.length < 2 || username.length > 20) {
        alert('Name must be between 2 and 20 characters');
        return;
    }
    
    currentUsername = username;
    
    // Hide modal and show chat
    usernameModal.classList.add('hidden');
    chatInterface.classList.remove('hidden');
    
    // Join the room
    socket.emit('join-room', {
        roomId: currentRoomId,
        username: currentUsername
    });
    
    // Focus on input
    messageInput.focus();
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    socket.emit('send-message', {
        roomId: currentRoomId,
        message: message,
        type: 'text'
    });
    
    messageInput.value = '';
    messageInput.focus();
    
    // Stop typing indicator
    stopTyping();
}

// Handle typing
function handleTyping() {
    if (!isTyping) {
        isTyping = true;
        socket.emit('typing', {
            roomId: currentRoomId,
            isTyping: true
        });
    }
    
    // Clear existing timeout
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    // Set new timeout
    typingTimeout = setTimeout(stopTyping, 2000);
}

function stopTyping() {
    isTyping = false;
    socket.emit('typing', {
        roomId: currentRoomId,
        isTyping: false
    });
}

// Add message to UI with cute effects
function addMessage(data, isSent = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    const time = new Date(data.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Add cute emoji reactions for received messages
    const reactions = isSent ? '' : `
        <div class="message-reactions">
            <button class="reaction-btn" onclick="addReaction(this, '❤️')">❤️</button>
            <button class="reaction-btn" onclick="addReaction(this, '😍')">😍</button>
            <button class="reaction-btn" onclick="addReaction(this, '🔥')">🔥</button>
            <button class="reaction-btn" onclick="addReaction(this, '👍')">👍</button>
        </div>
    `;
    
    // Delivery status for sent messages
    const deliveryStatus = isSent ? '<span class="delivery-status">✓✓</span>' : '';
    
    messageDiv.innerHTML = `
        ${!isSent ? `<div class="message-header">${escapeHtml(data.username)}</div>` : ''}
        <div class="message-content">${escapeHtml(data.message)}</div>
        <div class="message-time">${time} ${deliveryStatus}</div>
        ${reactions}
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Add pop animation
    messageDiv.style.animation = 'none';
    messageDiv.offsetHeight; // Trigger reflow
    messageDiv.style.animation = isSent ? 'messagePopSend 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'messagePopReceive 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    // Add floating hearts effect for cute messages
    if (data.message.includes('❤️') || data.message.includes('😍') || data.message.includes('love') || data.message.includes('miss')) {
        createFloatingHearts(messageDiv);
    }
    
    scrollToBottom();
}

// Add reaction to message
function addReaction(btn, emoji) {
    const messageDiv = btn.closest('.message');
    let reactionBar = messageDiv.querySelector('.reaction-bar');
    
    if (!reactionBar) {
        reactionBar = document.createElement('div');
        reactionBar.className = 'reaction-bar';
        messageDiv.appendChild(reactionBar);
    }
    
    // Check if emoji already exists
    const existing = reactionBar.querySelector(`[data-emoji="${emoji}"]`);
    if (existing) {
        const count = existing.querySelector('.reaction-count');
        count.textContent = parseInt(count.textContent) + 1;
        existing.classList.add('bounce');
        setTimeout(() => existing.classList.remove('bounce'), 300);
    } else {
        const reaction = document.createElement('span');
        reaction.className = 'reaction-item';
        reaction.setAttribute('data-emoji', emoji);
        reaction.innerHTML = `${emoji} <span class="reaction-count">1</span>`;
        reactionBar.appendChild(reaction);
    }
    
    // Hide reaction buttons after selection
    const reactions = messageDiv.querySelector('.message-reactions');
    if (reactions) {
        reactions.style.opacity = '0';
        setTimeout(() => reactions.remove(), 300);
    }
}

// Create floating hearts animation
function createFloatingHearts(element) {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = ['❤️', '💖', '💕', '💗', '💓'][Math.floor(Math.random() * 5)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = (2 + Math.random() * 2) + 's';
            element.appendChild(heart);
            
            setTimeout(() => heart.remove(), 4000);
        }, i * 200);
    }
}

// Add system message
function addSystemMessage(text, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'join' ? 'join-message' : 
                           type === 'leave' ? 'leave-message' : 'system-message';
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Scroll to bottom
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toggle emoji picker (simple version)
function toggleEmoji() {
    const emojis = ['😊', '❤️', '😂', '👍', '😍', '🎉', '🔥', '💕', '😘', '🥰'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    messageInput.value += randomEmoji;
    messageInput.focus();
}

// Toggle protection info
function toggleProtectionInfo() {
    document.getElementById('protectionModal').classList.remove('hidden');
}

function closeProtectionInfo() {
    document.getElementById('protectionModal').classList.add('hidden');
}

// Leave chat
function leaveChat() {
    if (confirm('Are you sure you want to leave this chat?')) {
        socket.disconnect();
        window.location.href = '/';
    }
}

// Protection removed - normal functionality

// Socket event listeners
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('previous-messages', (messages) => {
    messages.forEach(msg => {
        addMessage(msg, msg.username === currentUsername);
    });
});

socket.on('new-message', (data) => {
    addMessage(data, data.username === currentUsername);
});

socket.on('user-joined', (data) => {
    addSystemMessage(data.message, 'join');
    userCount.textContent = 'Connected 💕';
});

socket.on('user-left', (data) => {
    addSystemMessage(data.message, 'leave');
    userCount.textContent = 'Waiting...';
});

socket.on('chat-ready', (data) => {
    addSystemMessage(data.message, 'join');
    userCount.textContent = 'Both Connected 💕';
});

socket.on('user-typing', (data) => {
    if (data.isTyping) {
        typingText.textContent = `${data.username} is typing...`;
        typingIndicator.classList.remove('hidden');
    } else {
        typingIndicator.classList.add('hidden');
    }
});

socket.on('error', (data) => {
    alert(data.message);
    window.location.href = '/';
});

// Event listeners
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    } else {
        handleTyping();
    }
});

// Allow Enter key on username input
document.getElementById('usernameInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        setUsername();
    }
});

// Warn before leaving
window.addEventListener('beforeunload', (e) => {
    if (currentUsername) {
        e.preventDefault();
        e.returnValue = '';
    }
});
