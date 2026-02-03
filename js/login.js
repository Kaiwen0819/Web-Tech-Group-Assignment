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
    // ✅ 登录成功后，把资料存进 localStorage（给 admin.js 用）
    const role = email.includes("admin") ? "admin" : "user";

    localStorage.setItem(
    "currentUser",
    JSON.stringify({
    email,
    role,
    // 也可以存 uid（可选）
    uid: auth.currentUser?.uid || ""
  })
);

    // ✅ 登录成功 → 跳页（你自己规则：含 admin 就去 admin）
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
