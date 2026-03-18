// Landing Page JavaScript

let currentRoomId = null;
let currentJoinToken = null;

// Theme Toggle Functionality
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

// Chat Preview Animation
function animatePreview() {
    const messages = [
        { text: "Hey! 👋", type: "received" },
        { text: "Hi there! 💕", type: "sent" },
        { text: "This is so cute! 🥰", type: "received" },
        { text: "Yes! Secure too 🔒", type: "sent" },
        { text: "Love the pink theme 💗", type: "received" },
        { text: "Only we can see this 😊", type: "sent" }
    ];
    
    let currentIndex = 0;
    const container = document.getElementById('previewMessages');
    
    if (!container) return;
    
    // Clear existing messages
    container.innerHTML = '';
    
    function addMessage() {
        const msg = messages[currentIndex % messages.length];
        const div = document.createElement('div');
        div.className = `preview-message ${msg.type}`;
        
        const time = new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        div.innerHTML = `
            <span class="preview-text">${msg.text}</span>
            <span class="preview-time">${time}</span>
        `;
        
        container.appendChild(div);
        
        // Keep only last 4 messages
        while (container.children.length > 4) {
            container.removeChild(container.firstChild);
        }
        
        // Auto scroll
        container.scrollTop = container.scrollHeight;
        
        currentIndex++;
    }
    
    // Initial messages
    addMessage();
    setTimeout(addMessage, 800);
    setTimeout(addMessage, 1600);
    setTimeout(addMessage, 2400);
    
    // Continue animation
    setInterval(addMessage, 3000);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    loadTheme();
    animatePreview();
    // Animation system is initialized by animations.js
});

// Create new chat room
async function createRoom() {
    try {
        const response = await fetch('/api/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.roomId && data.token) {
            currentRoomId = data.roomId;
            currentJoinToken = data.token; // Full token: roomId_joinToken
            
            // Show invite modal with only token
            document.getElementById('tokenDisplay').textContent = currentJoinToken;
            document.getElementById('inviteModal').classList.remove('hidden');
            
            // Store in sessionStorage for later
            sessionStorage.setItem('roomId', currentRoomId);
            sessionStorage.setItem('isCreator', 'true');
        }
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room. Please try again.');
    }
}

// Copy token
function copyToken() {
    navigator.clipboard.writeText(currentJoinToken).then(() => {
        const copyIcon = document.getElementById('copyIcon');
        const copyText = document.getElementById('copyText');
        
        copyIcon.textContent = '✅';
        copyText.textContent = 'Copied!';
        
        setTimeout(() => {
            copyIcon.textContent = '📋';
            copyText.textContent = 'Copy';
        }, 2000);
    });
}

// Enter chat room
function enterChat() {
    if (currentRoomId) {
        window.location.href = `/chat.html?room=${currentRoomId}`;
    }
}

// Join from token
function joinFromLink() {
    const token = document.getElementById('joinLink').value.trim();
    
    if (!token) {
        alert('Please enter the token number');
        return;
    }
    
    // Token format: roomId_joinToken (full token)
    const lastUnderscore = token.lastIndexOf('_');
    if (lastUnderscore > 0) {
        const roomId = token.substring(0, lastUnderscore);
        const joinToken = token.substring(lastUnderscore + 1);
        sessionStorage.setItem('isCreator', 'false');
        window.location.href = `/chat.html?room=${roomId}&token=${joinToken}`;
    } else {
        alert('Invalid token format. Please enter the full token (e.g., abc123_def456)');
    }
}

// Allow Enter key to submit
document.getElementById('joinLink')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinFromLink();
    }
});
