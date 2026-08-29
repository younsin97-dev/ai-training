const STORAGE_KEY = "my-tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const priorityInput = document.getElementById("priority-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const taskCounter = document.getElementById("task-counter");
const filters = document.getElementById("filters");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return parsed.map((task) => ({
      priority: "medium",
      ...task,
    }));
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getFilteredTasks() {
  if (currentFilter === "active") return tasks.filter((t) => !t.completed);
  if (currentFilter === "completed") return tasks.filter((t) => t.completed);
  return tasks;
}

function render() {
  list.innerHTML = "";

  const filtered = getFilteredTasks();

  filtered.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item" + (task.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark \"" + task.text + "\" as complete");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const badge = document.createElement("span");
    badge.className = "priority-badge priority-" + task.priority;
    badge.textContent = task.priority;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, text, badge, deleteBtn);
    list.appendChild(item);
  });

  if (tasks.length === 0) {
    emptyState.textContent = "No tasks yet. Add one above!";
    emptyState.classList.remove("hidden");
  } else if (filtered.length === 0) {
    emptyState.textContent = "No tasks match this filter.";
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  const remaining = tasks.filter((t) => !t.completed).length;
  taskCounter.textContent = remaining === 1 ? "1 task remaining" : remaining + " tasks remaining";
}

function addTask(text, priority) {
  tasks.push({
    id: Date.now().toString(),
    text,
    completed: false,
    priority,
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text, priorityInput.value);
  input.value = "";
  priorityInput.value = "medium";
  input.focus();
});

filters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  filters.querySelectorAll(".filter-btn").forEach((b) => b.classList.toggle("active", b === btn));
  render();
});

render();
