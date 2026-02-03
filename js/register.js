// js/register.js
import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const registerForm = document.getElementById("registerForm");
const messageDiv = document.getElementById("message");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const phoneInput = document.getElementById("phone");

// patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\d\s\-\+\(\)]+$/;
const namePattern = /^[a-zA-Z\s]{2,}$/;

function showError(group, errorSpan, message) {
  group.classList.add("error");
  errorSpan.textContent = message;
}
function clearError(group, errorSpan) {
  group.classList.remove("error");
  errorSpan.textContent = "";
}

function validateName() {
  const group = nameInput.closest(".form-group");
  const errorSpan = document.getElementById("nameError");

  if (nameInput.value.trim() === "") {
    showError(group, errorSpan, "Name is required");
    return false;
  }
  if (!namePattern.test(nameInput.value.trim())) {
    showError(group, errorSpan, "Please enter a valid name (letters only, minimum 2 characters)");
    return false;
  }
  clearError(group, errorSpan);
  return true;
}

function validateEmail() {
  const group = emailInput.closest(".form-group");
  const errorSpan = document.getElementById("emailError");

  if (emailInput.value.trim() === "") {
    showError(group, errorSpan, "Email is required");
    return false;
  }
  if (!emailPattern.test(emailInput.value.trim())) {
    showError(group, errorSpan, "Please enter a valid email address");
    return false;
  }
  clearError(group, errorSpan);
  return true;
}

function validatePassword() {
  const group = passwordInput.closest(".form-group");
  const errorSpan = document.getElementById("passwordError");

  if (passwordInput.value === "") {
    showError(group, errorSpan, "Password is required");
    return false;
  }
  if (passwordInput.value.length < 6) {
    showError(group, errorSpan, "Password must be at least 6 characters");
    return false;
  }
  clearError(group, errorSpan);
  return true;
}

function validatePhone() {
  const group = phoneInput.closest(".form-group");
  const errorSpan = document.getElementById("phoneError");

  if (phoneInput.value.trim() !== "" && !phonePattern.test(phoneInput.value.trim())) {
    showError(group, errorSpan, "Please enter a valid phone number");
    return false;
  }
  clearError(group, errorSpan);
  return true;
}

// realtime validate
nameInput.addEventListener("blur", validateName);
emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);
phoneInput.addEventListener("blur", validatePhone);

// submit
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateName() || !validateEmail() || !validatePassword() || !validatePhone()) {
    messageDiv.textContent = "Please fix the errors above.";
    messageDiv.className = "message error";
    messageDiv.style.display = "block";
    return;
  }

  const fullName = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const phone = phoneInput.value.trim();

  const submitBtn = registerForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  try {
    // ✅ 1) create Firebase Auth user
    await createUserWithEmailAndPassword(auth, email, password);

    // ✅ 2) save extra profile to Firestore via your backend
    const res = await fetch("http://localhost:3000/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, phone }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    messageDiv.textContent = "✅ Account created! Redirecting to login...";
    messageDiv.className = "message success";
    messageDiv.style.display = "block";

    setTimeout(() => window.location.href = "login.html", 1200);
  } catch (err) {
    messageDiv.textContent = `❌ ${err.message}`;
    messageDiv.className = "message error";
    messageDiv.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});
