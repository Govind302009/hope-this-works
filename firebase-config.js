// firebase-config.js (compat wrapper) - already filled with your config
window.firebaseConfig = {
  apiKey: "AIzaSyDCak44j2_A0HNOfiIlVyG6KDCDuU0JBmU",
  authDomain: "mahadevfabricare.firebaseapp.com",
  projectId: "mahadevfabricare",
  storageBucket: "mahadevfabricare.firebasestorage.app",
  messagingSenderId: "134839033464",
  appId: "1:134839033464:web:dbc2e9b2f0ca5a9c45978d",
  measurementId: "G-REH9MX7MCG"
};

if (window.firebase && !firebase.apps.length) {
  firebase.initializeApp(window.firebaseConfig);
  try { firebase.analytics && firebase.analytics(); } catch(e){}
}
