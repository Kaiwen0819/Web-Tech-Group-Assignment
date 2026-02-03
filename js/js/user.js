// Check authentication
    (function() {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        window.location.href = 'login.html';
        return;
      }

      const user = JSON.parse(currentUser);
      
      // Redirect admin to admin page
      if (user.role === 'admin') {
        window.location.href = 'admin.html';
        return;
      }

      // Update header for user
      document.getElementById('headerTitle').textContent = `🏘️ Smart Community Hub - Welcome, ${user.name}`;
    })();

    // Logout
    document.querySelector('.logout-btn').addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });

    // Calendar functionality
    (function() {
      let currentDate = new Date(2026, 1, 1);

      function renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthDisplay = document.getElementById('currentMonth');
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
        
        calendarGrid.innerHTML = '';
        
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
          const header = document.createElement('div');
          header.className = 'calendar-day-header';
          header.textContent = day;
          calendarGrid.appendChild(header);
        });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        const events = getEvents();
        
        for (let i = firstDay - 1; i >= 0; i--) {
          const day = daysInPrevMonth - i;
          const dayCell = createDayCell(day, true, year, month - 1, events);
          calendarGrid.appendChild(dayCell);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
          const dayCell = createDayCell(day, false, year, month, events);
          calendarGrid.appendChild(dayCell);
        }
        
        const totalCells = firstDay + daysInMonth;
        const remainingCells = 42 - totalCells;
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
        
        const today = new Date();
        const cellDate = new Date(year, month, day);
        if (!isOtherMonth && 
            cellDate.getDate() === today.getDate() && 
            cellDate.getMonth() === today.getMonth() && 
            cellDate.getFullYear() === today.getFullYear()) {
          cell.classList.add('today');
        }
        
        cell.appendChild(dayNumber);
        
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
        
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        selectedDate.textContent = `Events for ${formattedDate}`;
        
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
      
      renderCalendar();

      document.querySelectorAll('nav a:not(.logout-btn)').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            target.setAttribute('tabindex', '-1');
            target.focus();
          }
        });
      });
    })();