// js/admin.js
(() => {
  // =========================
  // Config
  // =========================
  const API_BASE = "http://localhost:3000/api";

  // =========================
  // Auth Guard
  // =========================
  function requireAdmin() {
    const raw = localStorage.getItem("currentUser");
    if (!raw) {
      window.location.href = "login.html";
      return null;
    }
    const user = JSON.parse(raw);
    if (user.role !== "admin") {
      window.location.href = "user.html";
      return null;
    }
    return user;
  }

  const me = requireAdmin();
  if (!me) return;

  // =========================
  // DOM Helpers
  // =========================
  const $ = (id) => document.getElementById(id);

  // Form / List
  const addAnnouncementBtn = $("addAnnouncementBtn");
  const announcementFormContainer = $("announcementFormContainer");
  const announcementForm = $("announcementForm");
  const cancelAnnouncementBtn = $("cancelAnnouncementBtn");
  const announcementMessage = $("announcementMessage");
  const announcementsList = $("announcementsList");

  // Calendar
  const calendarGrid = $("calendarGrid");
  const currentMonthDisplay = $("currentMonth");
  const prevMonthBtn = $("prevMonth");
  const nextMonthBtn = $("nextMonth");

  // Day detail panel
  const eventDetails = $("eventDetails");
  const selectedDate = $("selectedDate");
  const eventsList = $("eventsList");

  // Logout
  const logoutBtn = document.querySelector(".logout-btn");

  // =========================
  // State
  // =========================
  let announcements = [];        // Announcements obtained from the backend
  let currentDate = new Date();  // Current month on calendar
  let editingId = null;          // Editing Firestore doc id (for update)

  // =========================
  // UI Helpers
  // =========================
  function showMessage(text, type = "success", ms = 1500) {
    if (!announcementMessage) return;
    announcementMessage.textContent = text;
    announcementMessage.className = `message ${type}`;
    announcementMessage.style.display = "block";

    if (ms > 0) {
      setTimeout(() => {
        announcementMessage.style.display = "none";
        announcementMessage.textContent = "";
      }, ms);
    }
  }

  function hideFormAndMessage() {
    if (announcementFormContainer) announcementFormContainer.classList.remove("active");
    if (addAnnouncementBtn) addAnnouncementBtn.style.display = "inline-block";
    if (announcementForm) announcementForm.reset();

    if (announcementMessage) {
      announcementMessage.style.display = "none";
      announcementMessage.textContent = "";
    }

    // reset edit state
    editingId = null;
    const submitBtn = announcementForm?.querySelector(".btn-submit");
    if (submitBtn) submitBtn.textContent = "Post Announcement";
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function toYMD(year, monthIndex, day) {
    // monthIndex: 0-11
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // =========================
  // API
  // =========================
  async function apiGetAnnouncements() {
    const res = await fetch(`${API_BASE}/announcements`);
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return Array.isArray(data) ? data : [];
  }

  async function apiPostAnnouncement(payload) {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data; // {id, seq?}
  }

  async function apiUpdateAnnouncement(id, payload) {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }

  async function apiDeleteAnnouncement(id) {
    const res = await fetch(`${API_BASE}/announcements/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }

  // =========================
  // Render: Announcement List
  // =========================
  function renderAnnouncementsList() {
    if (!announcementsList) return;

    announcementsList.innerHTML = "";

    if (!announcements.length) {
      announcementsList.innerHTML = `<li class="announcement-item">No announcements yet.</li>`;
      return;
    }

    // If the backend has a sequence number (seq(1,2,3)), use that sequence number first; otherwise, use the UI's index + 1.
    const sorted = [...announcements].sort((a, b) => {
      const sa = Number(a.seq || 0);
      const sb = Number(b.seq || 0);
      if (sa && sb) return sb - sa; // The larger (latest) seq value comes first
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });

    sorted.forEach((a, idx) => {
      const id = a.id;
      const title = escapeHtml(a.title || "");
      const category = escapeHtml(a.category || "notice");
      const content = escapeHtml(a.content || "");
      const eventDate = escapeHtml(a.eventDate || "");
      const isUrgent = !!a.isUrgent;

      const displayNo = a.seq ? Number(a.seq) : idx + 1;

      const li = document.createElement("li");
      li.className = "announcement-item";
      li.dataset.id = id; // delete/update 用
      li.dataset.date = eventDate;
      li.dataset.category = category;
      li.dataset.title = a.title || "";
      li.dataset.content = a.content || "";
      li.dataset.isUrgent = String(!!a.isUrgent);

      li.innerHTML = `
        <div class="announcement-header">
          <span class="announcement-category category-${category}">
            ${category.toUpperCase()}${isUrgent ? " ⚠️" : ""}
          </span>
          <span class="announcement-date">${eventDate}</span>
        </div>

        <div class="announcement-content">
          <strong>${title} <span style="opacity:.6;font-weight:500;">#${displayNo}</span></strong>
          <p>${content}</p>
        </div>

        <div class="announcement-actions">
          <button class="btn-action btn-edit" type="button">Edit</button>
          <button class="btn-action btn-delete" type="button">Delete</button>
        </div>
      `;

      announcementsList.appendChild(li);
    });
  }

  // =========================
  // Calendar
  // =========================
  function getEventsFromState() {
    return announcements
      .filter((a) => a.eventDate)
      .map((a) => ({
        date: a.eventDate, // YYYY-MM-DD
        category: a.category || "notice",
        title: a.title || "",
        content: a.content || "",
        id: a.id,
      }));
  }

  function renderCalendar() {
    if (!calendarGrid || !currentMonthDisplay) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ];
    currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;

    calendarGrid.innerHTML = "";

    // headers
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
      const header = document.createElement("div");
      header.className = "calendar-day-header";
      header.textContent = d;
      calendarGrid.appendChild(header);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const events = getEventsFromState();

    // prev month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      calendarGrid.appendChild(createDayCell(day, true, year, month - 1, events));
    }

    // this month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarGrid.appendChild(createDayCell(day, false, year, month, events));
    }

    // next month fill (6 rows * 7 = 42)
    const totalCells = firstDay + daysInMonth;
    const remaining = 42 - totalCells;
    for (let day = 1; day <= remaining; day++) {
      calendarGrid.appendChild(createDayCell(day, true, year, month + 1, events));
    }
  }

  function createDayCell(day, isOtherMonth, year, monthIndex, events) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    if (isOtherMonth) cell.classList.add("other-month");

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    const cellDateObj = new Date(year, monthIndex, day);

    // ✅ Today's purple squares (only displayed in "This Month's Squares")
    if (!isOtherMonth && isSameDay(cellDateObj, new Date())) {
      cell.classList.add("today");
    }

    const dateString = toYMD(year, monthIndex, day);
    const dayEvents = events.filter((e) => e.date === dateString);

    if (dayEvents.length > 0) {
      cell.classList.add("has-event");
      const dots = document.createElement("div");
      dots.className = "event-dots";

      dayEvents.forEach((event) => {
        const dot = document.createElement("span");
        dot.className = `event-dot ${event.category}-type`;
        dot.title = event.title;
        dots.appendChild(dot);
      });

      cell.appendChild(dots);
    }

    cell.addEventListener("click", () => showEventsForDay(dateString, dayEvents));
    return cell;
  }

  function showEventsForDay(dateString, dayEvents) {
    if (!eventDetails || !selectedDate || !eventsList) return;

    if (!dayEvents.length) {
      eventDetails.classList.remove("active");
      return;
    }

    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    selectedDate.textContent = `Events for ${formatted}`;

    eventsList.innerHTML = "";
    dayEvents.forEach((event) => {
      const item = document.createElement("div");
      item.className = "event-item";

      const categoryClass = `category-${event.category}`;
      const categoryName = event.category.charAt(0).toUpperCase() + event.category.slice(1);

      item.innerHTML = `
        <div class="event-item-header">
          <span class="event-item-title">${escapeHtml(event.title)}</span>
          <span class="event-item-category announcement-category ${categoryClass}">
            ${escapeHtml(categoryName)}
          </span>
        </div>
        <div class="event-item-content">${escapeHtml(event.content)}</div>
      `;

      eventsList.appendChild(item);
    });

    eventDetails.classList.add("active");
    eventDetails.classList.add('active');

  // ✅ Automatically scroll to the details section below (smooth)
    setTimeout(() => {
    eventDetails.scrollIntoView({ behavior: "smooth", block: "start" });

  // ✅ Optional: Accessibility feature, allowing the keyboard/screen reader to know that the focus is on this area.
    eventDetails.setAttribute("tabindex", "-1");
    eventDetails.focus({ preventScroll: true });
    }, 50);
  }

  // =========================
  // Load + Refresh
  // =========================
  async function refreshAll() {
    announcements = await apiGetAnnouncements();
    renderAnnouncementsList();
    renderCalendar();
    if (eventDetails) eventDetails.classList.remove("active");
  }

  // =========================
  // Events: UI
  // =========================
  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

  // Open Form
  if (addAnnouncementBtn) {
    addAnnouncementBtn.addEventListener("click", () => {
      if (announcementFormContainer) announcementFormContainer.classList.add("active");
      addAnnouncementBtn.style.display = "none";
      editingId = null;

      const submitBtn = announcementForm?.querySelector(".btn-submit");
      if (submitBtn) submitBtn.textContent = "Post Announcement";

      $("announcementTitle")?.focus();
    });
  }

  // Cancel Form
  if (cancelAnnouncementBtn) {
    cancelAnnouncementBtn.addEventListener("click", () => hideFormAndMessage());
  }

  // Submit Form (POST or PUT)
  if (announcementForm) {
    announcementForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = $("announcementTitle")?.value.trim();
      const category = $("announcementCategory")?.value;
      const content = $("announcementContent")?.value.trim();
      const eventDate = $("announcementDate")?.value;
      const isUrgent = !!$("isUrgent")?.checked;

      const submitBtn = announcementForm.querySelector(".btn-submit");

      if (!title || !category || !content || !eventDate) {
        showMessage("Please fill in all required fields.", "error", 2000);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = editingId ? "Updating..." : "Posting...";
      }

      try {
        if (editingId) {
          await apiUpdateAnnouncement(editingId, { title, category, content, eventDate, isUrgent });
          showMessage("✅ Updated!", "success", 1200);
        } else {
          await apiPostAnnouncement({ title, category, content, eventDate, isUrgent });
          showMessage("✅ Posted!", "success", 1200);
        }

        // ✅ Automatically refresh list + calendar
        await refreshAll();

        // ✅ Collapse the form in 1.2 seconds + Tip
        setTimeout(() => hideFormAndMessage(), 1200);
      } catch (err) {
        console.error(err);
        showMessage(`❌ Error: ${err.message}`, "error", 2500);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = editingId ? "Update Announcement" : "Post Announcement";
        }
      }
    });
  }

  // List: Delete / Edit (event delegation)
  if (announcementsList) {
    announcementsList.addEventListener("click", async (e) => {
      const delBtn = e.target.closest(".btn-delete");
      const editBtn = e.target.closest(".btn-edit");

      const item = e.target.closest(".announcement-item");
      if (!item) return;

      const id = item.dataset.id;
      if (!id) return;

      // ===== Edit =====
      if (editBtn) {
        // Open the form and fill it in
        if (announcementFormContainer) announcementFormContainer.classList.add("active");
        if (addAnnouncementBtn) addAnnouncementBtn.style.display = "none";

        editingId = id;

        $("announcementTitle").value = item.dataset.title || "";
        $("announcementCategory").value = item.dataset.category || "notice";
        $("announcementContent").value = item.dataset.content || "";
        $("announcementDate").value = item.dataset.date || "";
        $("isUrgent").checked = item.dataset.isUrgent === "true";

        const submitBtn = announcementForm?.querySelector(".btn-submit");
        if (submitBtn) submitBtn.textContent = "Update Announcement";

        $("announcementTitle")?.focus();
        return;
      }

      // ===== Delete =====
      if (delBtn) {
        const ok = confirm("Are you sure you want to delete this announcement?");
        if (!ok) return;

        try {
          await apiDeleteAnnouncement(id);
          showMessage("✅ Deleted!", "success", 1000);

          // ✅ Automatically refresh list + calendar
          await refreshAll();
        } catch (err) {
          console.error(err);
          showMessage(`❌ Delete failed: ${err.message}`, "error", 2500);
        }
      }
    });
  }

  // Calendar nav
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
      if (eventDetails) eventDetails.classList.remove("active");
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
      if (eventDetails) eventDetails.classList.remove("active");
    });
  }

  // Smooth scroll nav (optional)
  document.querySelectorAll("nav a:not(.logout-btn)").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // =========================
  // Init
  // =========================
  refreshAll().catch((err) => {
    console.error(err);
    showMessage(`❌ Failed to load announcements: ${err.message}`, "error", 4000);
  });
})();
