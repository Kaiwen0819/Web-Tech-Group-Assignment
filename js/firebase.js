// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSs0c3OPYXUw_wPW-kzxEmVs5VuNZjDpk",
  authDomain: "web-tech-group-assignment.firebaseapp.com",
  projectId: "web-tech-group-assignment",
  storageBucket: "web-tech-group-assignment.firebasestorage.app",
  messagingSenderId: "353218397336",
  appId: "1:353218397336:web:7de84fe0ff99bf2199fced",
  measurementId: "G-0815GS9S33"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
