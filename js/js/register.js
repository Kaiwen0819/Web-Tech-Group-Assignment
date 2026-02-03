const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const phoneInput = document.getElementById('phone');

    // Validation patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[\d\s\-\+\(\)]+$/;
    const namePattern = /^[a-zA-Z\s]{2,}$/;

    // Validation functions
    function validateName() {
      const nameGroup = nameInput.closest('.form-group');
      const errorSpan = document.getElementById('nameError');
      
      if (nameInput.value.trim() === '') {
        showError(nameGroup, errorSpan, 'Name is required');
        return false;
      } else if (!namePattern.test(nameInput.value.trim())) {
        showError(nameGroup, errorSpan, 'Please enter a valid name (letters only, minimum 2 characters)');
        return false;
      } else {
        clearError(nameGroup);
        return true;
      }
    }

    function validateEmail() {
      const emailGroup = emailInput.closest('.form-group');
      const errorSpan = document.getElementById('emailError');
      
      if (emailInput.value.trim() === '') {
        showError(emailGroup, errorSpan, 'Email is required');
        return false;
      } else if (!emailPattern.test(emailInput.value.trim())) {
        showError(emailGroup, errorSpan, 'Please enter a valid email address');
        return false;
      } else {
        clearError(emailGroup);
        return true;
      }
    }

    function validatePassword() {
      const passwordGroup = passwordInput.closest('.form-group');
      const errorSpan = document.getElementById('passwordError');
      
      if (passwordInput.value === '') {
        showError(passwordGroup, errorSpan, 'Password is required');
        return false;
      } else if (passwordInput.value.length < 6) {
        showError(passwordGroup, errorSpan, 'Password must be at least 6 characters');
        return false;
      } else {
        clearError(passwordGroup);
        return true;
      }
    }

    function validatePhone() {
      const phoneGroup = phoneInput.closest('.form-group');
      const errorSpan = document.getElementById('phoneError');
      
      if (phoneInput.value.trim() !== '' && !phonePattern.test(phoneInput.value.trim())) {
        showError(phoneGroup, errorSpan, 'Please enter a valid phone number');
        return false;
      } else {
        clearError(phoneGroup);
        return true;
      }
    }

    function showError(group, errorSpan, message) {
      group.classList.add('error');
      errorSpan.textContent = message;
    }

    function clearError(group) {
      group.classList.remove('error');
    }

    // Real-time validation
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    phoneInput.addEventListener('blur', validatePhone);

    // Form submission
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Validate all fields
      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();
      const isPhoneValid = validatePhone();

      if (!isNameValid || !isEmailValid || !isPasswordValid || !isPhoneValid) {
        messageDiv.textContent = 'Please fix the errors above.';
        messageDiv.className = 'message error';
        setTimeout(() => { messageDiv.style.display = 'none'; }, 3000);
        return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const phone = phoneInput.value.trim();
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      // Check if email already exists
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const defaultUsers = ['user@community.com', 'admin@community.com'];
      
      if (existingUsers.find(u => u.email === email) || defaultUsers.includes(email)) {
        messageDiv.textContent = 'This email is already registered. Please login instead.';
        messageDiv.className = 'message error';
        setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
        return;
      }

      // Add loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';
      submitBtn.classList.add('loading');

      // Simulate registration delay
      setTimeout(function() {
        // Create new user
        const newUser = { 
          email, 
          password, 
          name, 
          role: 'user', 
          phone 
        };

        // Save to localStorage
        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

        // Success
        messageDiv.textContent = `Account created successfully! Redirecting to login...`;
        messageDiv.className = 'message success';

        // Redirect to login after 2 seconds
        setTimeout(function() {
          window.location.href = 'login.html';
        }, 2000);

      }, 1000);
    });