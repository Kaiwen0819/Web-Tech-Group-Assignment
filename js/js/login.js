// User database (simulated - in real app, this would be server-side)
    const users = [
      { email: 'user@community.com', password: 'user123', name: 'Community User', role: 'user' },
      { email: 'admin@community.com', password: 'admin123', name: 'Admin User', role: 'admin' }
    ];

    // Get registered users from localStorage
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      const registered = JSON.parse(storedUsers);
      registered.forEach(user => {
        if (!users.find(u => u.email === user.email)) {
          users.push(user);
        }
      });
    }

    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      // Add loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';
      submitBtn.classList.add('loading');

      // Simulate authentication delay
      setTimeout(function() {
        // Check credentials
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
          // Success
          messageDiv.textContent = `Welcome back, ${user.name}! Redirecting...`;
          messageDiv.className = 'message success';

          // Store user session
          localStorage.setItem('currentUser', JSON.stringify(user));

          // Redirect based on role
          setTimeout(function() {
            if (user.role === 'admin') {
              window.location.href = 'admin.html';
            } else {
              window.location.href = 'user.html';
            }
          }, 1000);

        } else {
          // Error
          messageDiv.textContent = 'Invalid email or password. Please try again.';
          messageDiv.className = 'message error';
          
          submitBtn.disabled = false;
          submitBtn.textContent = 'Login';
          submitBtn.classList.remove('loading');

          // Hide error after 5 seconds
          setTimeout(function() {
            messageDiv.style.display = 'none';
          }, 5000);
        }
      }, 1000);
    });