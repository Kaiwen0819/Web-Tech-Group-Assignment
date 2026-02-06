// ===== Auth check =====
(function () {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(currentUser);

  // admin shouldn't be in user.html
  if (user.role === "admin") {
    window.location.href = "admin.html";
    return;
  }

  const displayName = user.name || user.email || "User";
  document.getElementById("headerTitle").textContent =
    `🏘️ Smart Community Hub - Welcome, ${displayName}`;
})();

// ===== Logout =====
document.querySelector(".logout-btn").addEventListener("click", function (e) {
  e.preventDefault();
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});

// ===== Calendar + announcements (must be placed in the same IIFE for renderCalendar to be called) =====
(function () {
  let currentDate = new Date(2026, 1, 1);
  let __fp = "";

  function fingerprint(items) {
    return (items || [])
      .map(a => `${a.id || ""}|${a.eventDate || ""}|${a.title || ""}`)
      .join(";");
  }

  async function fetchAnnouncements() {
    const res = await fetch("http://localhost:3000/api/announcements");
    if (!res.ok) throw new Error(`GET /announcements HTTP ${res.status}`);
    return await res.json();
  }

  function renderAnnouncements(items) {
    const list = document.getElementById("announcementsList");
    list.innerHTML = "";

    items.forEach((a) => {
      const cat = (a.category || "event").toLowerCase();
      const li = document.createElement("li");
      li.className = "announcement-item";
      li.setAttribute("role", "listitem");
      li.setAttribute("data-date", a.eventDate || "");
      li.setAttribute("data-category", cat);

      li.innerHTML = `
        <div class="announcement-header">
          <span class="announcement-category category-${cat}">
            ${cat.charAt(0).toUpperCase() + cat.slice(1)}
          </span>
          <span class="announcement-date">${a.eventDate || ""}</span>
        </div>
        <div class="announcement-content">
          <strong>${a.title || ""}</strong>
          <p>${a.content || ""}</p>
        </div>
      `;
      list.appendChild(li);
    });
  }

  function getEventsFromDOM() {
    const announcements = document.querySelectorAll(".announcement-item");
    const events = [];

    announcements.forEach((item) => {
      const date = item.getAttribute("data-date");
      const category = item.getAttribute("data-category");
      const title = item.querySelector("strong")?.textContent || "";
      const content = item.querySelector("p")?.textContent || "";
      if (date) events.push({ date, category, title, content });
    });

    return events;
  }

  function renderCalendar() {
    const calendarGrid = document.getElementById("calendarGrid");
    const currentMonthDisplay = document.getElementById("currentMonth");

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;

    calendarGrid.innerHTML = "";

    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayHeaders.forEach((day) => {
      const header = document.createElement("div");
      header.className = "calendar-day-header";
      header.textContent = day;
      calendarGrid.appendChild(header);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const events = getEventsFromDOM();

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      calendarGrid.appendChild(createDayCell(d, true, year, month - 1, events));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      calendarGrid.appendChild(createDayCell(d, false, year, month, events));
    }

    const totalCells = firstDay + daysInMonth;
    const remainingCells = 42 - totalCells;
    for (let d = 1; d <= remainingCells; d++) {
      calendarGrid.appendChild(createDayCell(d, true, year, month + 1, events));
    }
  }

  function createDayCell(day, isOtherMonth, year, month, events) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    if (isOtherMonth) cell.classList.add("other-month");

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = events.filter((e) => e.date === dateString);

    if (dayEvents.length > 0) {
      cell.classList.add("has-event");
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "event-dots";

      dayEvents.forEach((event) => {
        const dot = document.createElement("span");
        dot.className = `event-dot ${event.category}-type`;
        dot.title = event.title;
        dotsContainer.appendChild(dot);
      });

      cell.appendChild(dotsContainer);
    }

    cell.addEventListener("click", function () {
      showEventsForDay(dateString, dayEvents);
    });

    return cell;
  }

  function showEventsForDay(dateString, dayEvents) {
    const eventDetails = document.getElementById("eventDetails");
    const selectedDate = document.getElementById("selectedDate");
    const eventsList = document.getElementById("eventsList");

    if (dayEvents.length === 0) {
      eventDetails.classList.remove("active");
      return;
    }

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    selectedDate.textContent = `Events for ${formattedDate}`;
    eventsList.innerHTML = "";

    dayEvents.forEach((event) => {
      const eventItem = document.createElement("div");
      eventItem.className = "event-item";
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

    eventDetails.classList.add("active");
    eventDetails.classList.add('active');

  // ✅ Automatically scroll to the details section below (smooth)
    setTimeout(() => {
    eventDetails.scrollIntoView({ behavior: "smooth", block: "start" });

  // ✅ Optional: Accessibility feature, allowing the keyboard/screen reader to know that the focus is on this area
    eventDetails.setAttribute("tabindex", "-1");
    eventDetails.focus({ preventScroll: true });
  }, 50);

  }

  async function refresh() {
    try {
      const items = await fetchAnnouncements();
      const fp = fingerprint(items);
      if (fp === __fp) return;

      __fp = fp;
      renderAnnouncements(items);
      renderCalendar();

      const details = document.getElementById("eventDetails");
      if (details) details.classList.remove("active");
    } catch (e) {
      console.error("refresh error:", e);
    }
  }

  document.getElementById("prevMonth").addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    document.getElementById("eventDetails").classList.remove("active");
  });

  document.getElementById("nextMonth").addEventListener("click", function () {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    document.getElementById("eventDetails").classList.remove("active");
  });

  // ✅ The page will sync once upon opening + automatically sync every 1 second 
  refresh();
  setInterval(refresh, 1000);
})();



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