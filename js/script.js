// Check if user is logged in
    (function() {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
      }

      const user = JSON.parse(currentUser);
      const headerTitle = document.getElementById('headerTitle');
      
      // Update header based on user role
      if (user.role === 'admin') {
        headerTitle.innerHTML = '🏘️ Smart Community Hub <span class="admin-badge">ADMIN</span>';
        document.getElementById('addAnnouncementBtn').style.display = 'inline-block';
      } else {
        headerTitle.textContent = `🏘️ Smart Community Hub - Welcome, ${user.name}`;
        document.getElementById('addAnnouncementBtn').style.display = 'inline-block';
      }
    })();

    // Logout functionality
    document.querySelector('.logout-btn').addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });

    // Announcement functionality
    (function() {
      'use strict';

      const addAnnouncementBtn = document.getElementById('addAnnouncementBtn');
      const announcementFormContainer = document.getElementById('announcementFormContainer');
      const announcementForm = document.getElementById('announcementForm');
      const cancelAnnouncementBtn = document.getElementById('cancelAnnouncementBtn');
      const announcementMessage = document.getElementById('announcementMessage');
      const announcementsList = document.getElementById('announcementsList');

      // Show announcement form
      addAnnouncementBtn.addEventListener('click', function() {
        announcementFormContainer.classList.add('active');
        addAnnouncementBtn.style.display = 'none';
        document.getElementById('announcementTitle').focus();
      });

      // Cancel announcement form
      cancelAnnouncementBtn.addEventListener('click', function() {
        announcementFormContainer.classList.remove('active');
        addAnnouncementBtn.style.display = 'inline-block';
        announcementForm.reset();
      });

      // Submit announcement
      announcementForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('announcementTitle').value.trim();
        const category = document.getElementById('announcementCategory').value;
        const content = document.getElementById('announcementContent').value.trim();
        const eventDate = document.getElementById('announcementDate').value;
        const isUrgent = document.getElementById('isUrgent').checked;
        const submitBtn = announcementForm.querySelector('.btn-submit');

        if (!title || !category || !content || !eventDate) {
          try {
            const res = await fetch("http://localhost:3000/api/announcements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      category,
      content,
      eventDate,
      isUrgent
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to post announcement");
  }

  // ✅ 成功后你再把它 insert 到 announcementsList（你原本那段 create li 的代码可以保留）
  announcementMessage.textContent = `✅ Posted! ID: ${data.id}`;
  announcementMessage.className = "success";
  announcementMessage.style.display = "block";

} catch (err) {
  console.error(err);
  announcementMessage.textContent = "❌ Error posting announcement";
  announcementMessage.className = "error";
  announcementMessage.style.display = "block";
} finally {
  submitBtn.disabled = false;
  submitBtn.textContent = "Post Announcement";
  submitBtn.classList.remove("loading");
}

        }

        // Add loading state (same as registration)
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';
        submitBtn.classList.add('loading');

        // Simulate posting delay (same 1 second as registration)
        setTimeout(function() {
          // Create new announcement element
          const dateObj = new Date(eventDate);
          const displayDate = dateObj.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });

          const categoryClass = `category-${category}`;
          const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
          const urgencyClass = isUrgent ? (category === 'alert' ? 'urgent' : 'important') : '';

          const newAnnouncement = document.createElement('li');
          newAnnouncement.className = `announcement-item ${urgencyClass}`;
          newAnnouncement.setAttribute('role', 'listitem');
          newAnnouncement.setAttribute('aria-label', `${categoryName}: ${title}`);
          newAnnouncement.setAttribute('data-date', eventDate);
          newAnnouncement.setAttribute('data-category', category);
          
          newAnnouncement.innerHTML = `
            <div class="announcement-header">
              <span class="announcement-category ${categoryClass}">${categoryName}</span>
              <span class="announcement-date">${displayDate}</span>
            </div>
            <div class="announcement-content">
              <strong>${title}</strong>
              <p>${content}</p>
            </div>
          `;

          // Add to top of list
          announcementsList.insertBefore(newAnnouncement, announcementsList.firstChild);

          // Highlight new announcement
          newAnnouncement.style.animation = 'slideIn 0.5s ease';

          // Refresh calendar to show new event
          renderCalendar();

          // Show success message (same style as registration)
          announcementMessage.textContent = `Thank you! Your announcement "${title}" has been posted successfully to the community.`;
          announcementMessage.className = 'success';
          announcementMessage.style.display = 'block';

          // Reset form and hide
          announcementForm.reset();
          announcementFormContainer.classList.remove('active');
          addAnnouncementBtn.style.display = 'inline-block';

          // Reset button (same as registration)
          submitBtn.disabled = false;
          submitBtn.textContent = 'Post Announcement';
          submitBtn.classList.remove('loading');

          // Hide success message after 5 seconds (same as registration)
          setTimeout(function() {
            announcementMessage.style.display = 'none';
            announcementMessage.className = '';
          }, 5000);

          // Scroll to announcements section
          document.getElementById('announcements').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 1000);
      });

      // ===== CALENDAR FUNCTIONALITY =====
      let currentDate = new Date(2026, 1, 1); // February 2026

      function renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthDisplay = document.getElementById('currentMonth');
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Display current month and year
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
        
        // Clear existing calendar
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
          const header = document.createElement('div');
          header.className = 'calendar-day-header';
          header.textContent = day;
          calendarGrid.appendChild(header);
        });
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Get all events
        const events = getEvents();
        
        // Add previous month's days
        for (let i = firstDay - 1; i >= 0; i--) {
          const day = daysInPrevMonth - i;
          const dayCell = createDayCell(day, true, year, month - 1, events);
          calendarGrid.appendChild(dayCell);
        }
        
        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
          const dayCell = createDayCell(day, false, year, month, events);
          calendarGrid.appendChild(dayCell);
        }
        
        // Add next month's days
        const totalCells = firstDay + daysInMonth;
        const remainingCells = 42 - totalCells; // 6 rows * 7 days
        for (let day = 1; day <= remainingCells; day++) {
          const dayCell = createDayCell(day, true, year, month + 1, events);
          calendarGrid.appendChild(dayCell);
        }
      }
      
      function createDayCell(day, isOtherMonth, year, month, events) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        if (isOtherMonth) cell.classList.add('other-month');
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        
        // Check if this is today
        const today = new Date();
        const cellDate = new Date(year, month, day);
        if (!isOtherMonth && 
            cellDate.getDate() === today.getDate() && 
            cellDate.getMonth() === today.getMonth() && 
            cellDate.getFullYear() === today.getFullYear()) {
          cell.classList.add('today');
        }
        
        cell.appendChild(dayNumber);
        
        // Add event dots
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateString);
        
        if (dayEvents.length > 0) {
          cell.classList.add('has-event');
          const dotsContainer = document.createElement('div');
          dotsContainer.className = 'event-dots';
          
          dayEvents.forEach(event => {
            const dot = document.createElement('span');
            dot.className = `event-dot ${event.category}-type`;
            dot.title = event.title;
            dotsContainer.appendChild(dot);
          });
          
          cell.appendChild(dotsContainer);
        }
        
        // Add click handler to show events
        cell.addEventListener('click', function() {
          showEventsForDay(dateString, dayEvents);
        });
        
        return cell;
      }
      
      function getEvents() {
        const announcements = document.querySelectorAll('.announcement-item');
        const events = [];
        
        announcements.forEach(item => {
          const date = item.getAttribute('data-date');
          const category = item.getAttribute('data-category');
          const title = item.querySelector('strong').textContent;
          const content = item.querySelector('p').textContent;
          
          if (date) {
            events.push({ date, category, title, content });
          }
        });
        
        return events;
      }
      
      function showEventsForDay(dateString, dayEvents) {
        const eventDetails = document.getElementById('eventDetails');
        const selectedDate = document.getElementById('selectedDate');
        const eventsList = document.getElementById('eventsList');
        
        if (dayEvents.length === 0) {
          eventDetails.classList.remove('active');
          return;
        }
        
        // Format date for display
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        selectedDate.textContent = `Events for ${formattedDate}`;
        
        // Clear and populate events list
        eventsList.innerHTML = '';
        dayEvents.forEach(event => {
          const eventItem = document.createElement('div');
          eventItem.className = 'event-item';
          
          const categoryClass = `category-${event.category}`;
          const categoryName = event.category.charAt(0).toUpperCase() + event.category.slice(1);
          
          eventItem.innerHTML = `
            <div class="event-item-header">
              <span class="event-item-title">${event.title}</span>
              <span class="event-item-category announcement-category ${categoryClass}">${categoryName}</span>
            </div>
            <div class="event-item-content">${event.content}</div>
          `;
          
          eventsList.appendChild(eventItem);
        });
        
        eventDetails.classList.add('active');
      }
      
      // Calendar navigation
      document.getElementById('prevMonth').addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        document.getElementById('eventDetails').classList.remove('active');
      });
      
      document.getElementById('nextMonth').addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        document.getElementById('eventDetails').classList.remove('active');
      });
      
      // Initial calendar render
      renderCalendar();

      // Smooth scroll for navigation links
      document.querySelectorAll('nav a:not(.logout-btn)').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            
            // Set focus to target section for accessibility
            target.setAttribute('tabindex', '-1');
            target.focus();
          }
        });
      });

      // Keyboard navigation enhancement
      document.addEventListener('keydown', function(e) {
        // Allow Escape key to clear form messages
        if (e.key === 'Escape') {
          if (announcementMessage.style.display !== 'none') {
            announcementMessage.style.display = 'none';
            announcementMessage.className = '';
          }
          if (announcementFormContainer.classList.contains('active')) {
            announcementFormContainer.classList.remove('active');
            addAnnouncementBtn.style.display = 'inline-block';
            announcementForm.reset();
          }
        }
      });

    })();