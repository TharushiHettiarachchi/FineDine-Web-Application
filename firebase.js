
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyD6otX0ShRq_YiNp5_6JpFetGuakCfrolc",
    authDomain: "finedine-3970b.firebaseapp.com",
    databaseURL: "https://finedine-3970b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "finedine-3970b",
    storageBucket: "finedine-3970b.firebasestorage.app",
    messagingSenderId: "100569643108",
    appId: "1:100569643108:web:1f91e24c5306aca1e4c771",
    measurementId: "G-Q2QRJQM00G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);

export { db, database };