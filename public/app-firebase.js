// Cute Chat App - Firebase Version (Vercel Compatible)
// No backend needed - uses Firebase Realtime Database

// Firebase will be initialized in firebase-config.js
let db = null;
let currentRoomId = null;
let currentJoinToken = null;

// Initialize when Firebase loads
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined') {
        db = firebase.database();
    }
});

// Generate random room ID and token
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateToken() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Create new chat room
async function createRoom() {
    try {
        const roomId = generateRoomId();
        const joinToken = generateToken();
        
        // Create room in Firebase
        await db.ref(`rooms/${roomId}`).set({
            createdAt: Date.now(),
            joinToken: joinToken,
            user1: { joined: false },
            user2: { joined: false }
        });
        
        currentRoomId = roomId;
        currentJoinToken = joinToken;
        
        // Show invite modal
        document.getElementById('tokenDisplay').textContent = joinToken;
        document.getElementById('inviteModal').classList.remove('hidden');
        
        // Store in sessionStorage
        sessionStorage.setItem('roomId', currentRoomId);
        sessionStorage.setItem('isCreator', 'true');
        sessionStorage.setItem('joinToken', joinToken);
        
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room. Please try again.');
    }
}

// Join room with token
async function joinRoom() {
    const tokenInput = document.getElementById('joinToken');
    const token = tokenInput.value.trim().toUpperCase();
    
    if (!token) {
        alert('Please enter a token');
        return;
    }
    
    try {
        // Search for room with this token
        const roomsSnapshot = await db.ref('rooms').once('value');
        const rooms = roomsSnapshot.val();
        
        let foundRoom = null;
        for (const [roomId, roomData] of Object.entries(rooms || {})) {
            if (roomData.joinToken === token) {
                foundRoom = { roomId, ...roomData };
                break;
            }
        }
        
        if (foundRoom) {
            sessionStorage.setItem('roomId', foundRoom.roomId);
            sessionStorage.setItem('joinToken', token);
            sessionStorage.setItem('isCreator', 'false');
            window.location.href = 'chat.html';
        } else {
            alert('Invalid token. Please check and try again.');
        }
    } catch (error) {
        console.error('Error joining room:', error);
        alert('Failed to join room. Please try again.');
    }
}

// Enter chat room (for creator)
function enterChatRoom() {
    window.location.href = 'chat.html';
}

// Copy token to clipboard
function copyToken() {
    const token = document.getElementById('tokenDisplay').textContent;
    navigator.clipboard.writeText(token).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

// Close modal
function closeModal() {
    document.getElementById('inviteModal').classList.add('hidden');
}

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
    if (theme === 'dark') {
        icon.textContent = '☀️';
    } else {
        icon.textContent = '🌙';
    }
}

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeUI(savedTheme);
