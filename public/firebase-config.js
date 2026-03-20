// Firebase Configuration for Cute Chat App
// Replace with your Firebase config

const firebaseConfig = {
    apiKey: "Z4qiFBS-Z3h3kWpk3hWpYvpTGn3El9UOS2qBc70pUFY",
    authDomain: "chat-6b606.firebaseapp.com",
    databaseURL: "https://chat-6b606-default-rtdb.firebaseio.com",
    projectId: "chat-6b606",
    storageBucket: "chat-6b606.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
