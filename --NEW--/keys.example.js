// Template for keys.js. Copy this file to keys.js and fill in real values.
// keys.js is gitignored. Never put real keys in this file.
// Pages load it with <script src="/keys.js"></script> before any script that uses window.HLL_KEYS.
window.HLL_KEYS = {
    // Firebase: hulalla-party (used by most pages)
    firebase: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
        projectId: "YOUR_PROJECT",
        storageBucket: "YOUR_PROJECT.firebasestorage.app",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID",
        measurementId: "YOUR_MEASUREMENT_ID"
    },

    // Firebase: separate web app used by play/horror/script.js
    firebaseHorror: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID",
        measurementId: "YOUR_MEASUREMENT_ID"
    },

    // Firebase: beta-deweysworld (used by indexxx.html)
    firebaseDeweysworld: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
        projectId: "YOUR_PROJECT",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID",
        measurementId: "YOUR_MEASUREMENT_ID"
    },

    // Groq API keys for the AI chat (one is picked at random per request)
    groq: [
        "YOUR_GROQ_API_KEY_1",
        "YOUR_GROQ_API_KEY_2",
        "YOUR_GROQ_API_KEY_3"
    ],

    // deeSMSX SMS gateway (store OTP + POS)
    deesmsx: {
        secretKey: "YOUR_DEESMSX_SECRET_KEY",
        apiKey: "YOUR_DEESMSX_API_KEY"
    }
};
