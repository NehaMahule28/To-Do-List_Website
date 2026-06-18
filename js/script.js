// =====================
// DOM ELEMENTS
// =====================
const taskInput = document.getElementById("taskInput");
const category = document.getElementById("category");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");

const emptyState = document.getElementById("emptyState");
const filterBtns = document.querySelectorAll(".filter-btn");
const darkToggle = document.getElementById("darkToggle");

const searchInput = document.querySelector(".search-box input");

// =====================
// STATE
// =====================
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let searchText = "";
let calendar; // IMPORTANT: declare before use

// =====================
// SAVE TASKS
// =====================
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// =====================
// CALENDAR EVENTS
// =====================
function getCalendarEvents() {
    return tasks
        .filter(task => task.dueDate)
        .map(task => ({
            title: task.text,
            start: task.dueDate,
            color:
                task.priority === "High"
                    ? "red"
                    : task.priority === "Medium"
                    ? "orange"
                    : "green",
            extendedProps: {
                category: task.category,
                priority: task.priority,
                completed: task.completed
            }
        }));
}

// =====================
// INIT CALENDAR
// =====================
function initCalendar() {
    const calendarEl = document.getElementById("calendar");

    if (!calendarEl) return;

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: 500,

        events: getCalendarEvents(),

        eventClick: function(info) {
            alert(
                `Task: ${info.event.title}\nCategory: ${info.event.extendedProps.category}`
            );
        }
    });

    calendar.render();
}

// =====================
// UPDATE CALENDAR
// =====================
function renderCalendar() {
    if (!calendar) return;

    calendar.removeAllEvents();
    calendar.addEventSource(getCalendarEvents());
}
const calendarBtn = document.getElementById("toggleCalendarBtn");
const calendarContainer = document.getElementById("calendarContainer");

calendarBtn.addEventListener("click", () => {

    if (calendarContainer.style.display === "none" ||
        calendarContainer.style.display === "") {

        calendarContainer.style.display = "block";
        calendarBtn.textContent = "❌ Hide Calendar";

        // render calendar correctly when opened
        if(calendar){
            calendar.updateSize();
        }

    } else {

        calendarContainer.style.display = "none";
        calendarBtn.textContent = "📅 View Calendar";
    }
});

// =====================
// RENDER TASKS
// =====================
function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks.filter(task => {
        const matchFilter =
            currentFilter === "all" ||
            (currentFilter === "completed" && task.completed) ||
            (currentFilter === "pending" && !task.completed);

        const matchSearch = task.text
            .toLowerCase()
            .includes(searchText.toLowerCase());

        return matchFilter && matchSearch;
    });

    emptyState.style.display = filteredTasks.length ? "none" : "block";

    filteredTasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.classList.add("task-item");
        if (task.completed) li.classList.add("completed");

        li.innerHTML = `
            <div class="task-info">
                <h4>${task.text}</h4>
                <p>
                    📂 ${task.category} |
                    ⚡ ${task.priority} |
                    📅 ${task.dueDate || "No date"}
                </p>
            </div>

            <div class="actions">
                <button onclick="toggleTask(${index})">
                    ${task.completed ? "Undo" : "Done"}
                </button>
                <button onclick="deleteTask(${index})">Delete</button>
            </div>
        `;

        taskList.appendChild(li);
    });

    updateStats();
    renderCalendar(); // sync calendar every update
}

// =====================
// ADD TASK
// =====================
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    tasks.push({
        text,
        category: category.value,
        priority: priority.value,
        dueDate: dueDate.value,
        completed: false
    });

    taskInput.value = "";
    dueDate.value = "";

    saveTasks();
    renderTasks();
}

// =====================
// TOGGLE TASK
// =====================
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

// =====================
// DELETE TASK
// =====================
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// =====================
// STATS
// =====================
function updateStats() {
    totalTasksEl.textContent = tasks.length;
    completedTasksEl.textContent = tasks.filter(t => t.completed).length;
    pendingTasksEl.textContent = tasks.filter(t => !t.completed).length;
}

// =====================
// FILTERS
// =====================
filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".filter-btn.active").classList.remove("active");
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// =====================
// SEARCH
// =====================
searchInput.addEventListener("input", e => {
    searchText = e.target.value;
    renderTasks();
});

// =====================
// DARK MODE
// =====================
darkToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
});


// =====================
// EVENTS
// =====================
addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});
const topBtn = document.getElementById("topBtn");

// show/hide on scroll
window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
        topBtn.classList.add("show");
    } else {
        topBtn.classList.remove("show");
    }
});

// scroll to top
topBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// =====================
// GLOBAL ACCESS
// =====================
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// =====================
// INIT APP (IMPORTANT ORDER)
// =====================
renderTasks();
initCalendar();