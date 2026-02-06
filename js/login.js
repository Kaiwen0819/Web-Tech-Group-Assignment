// js/login.js
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // ✅ After successful login, save the data to localStorage (for use by admin.js)
    const role = email.includes("admin") ? "admin" : "user";

    localStorage.setItem(
    "currentUser",
    JSON.stringify({
    email,
    role,
    // You can also store the uid (optional)）
    uid: auth.currentUser?.uid || ""
  })
);

    // ✅ Login successful → Jump to page (your own rules: if it contains "admin", go to "admin").
    if (email.includes("admin")) {
      window.location.href = "admin.html";
    } else {
      window.location.href = "user.html";
    }
  } catch (error) {
    message.textContent = error.message;
    message.className = "message error";
    message.style.display = "block";
  }
});
