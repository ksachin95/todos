const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const themeToggle = document.getElementById("themeToggle");
const STORAGE_KEY = "todoApp.tasks";
const THEME_KEY = "todoApp.theme";

function loadTasks() {
	const storedValue = localStorage.getItem(STORAGE_KEY);
	if (!storedValue) {
		return [];
	}

	try {
		return JSON.parse(storedValue) || [];
	} catch (error) {
		console.warn("Failed to parse saved tasks:", error);
		return [];
	}
}

function loadTheme() {
	const savedTheme = localStorage.getItem(THEME_KEY);
	if (savedTheme === "light" || savedTheme === "dark") {
		return savedTheme;
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function applyTheme(theme) {
	document.documentElement.dataset.theme = theme;
	localStorage.setItem(THEME_KEY, theme);
	themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
}

function toggleTheme() {
	const currentTheme = document.documentElement.dataset.theme || loadTheme();
	applyTheme(currentTheme === "dark" ? "light" : "dark");
}

function saveTasks(tasks) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTaskElement(task) {
	const item = document.createElement("li");
	item.className = "task-item";
	item.dataset.taskId = task.id;

	const textNode = document.createElement("p");
	textNode.textContent = task.text;
	item.appendChild(textNode);

	const editButton = document.createElement("button");
	editButton.type = "button";
	editButton.textContent = "Edit";
	editButton.addEventListener("click", (event) => {
		event.stopPropagation();
		startEditingTask(task, item, textNode);
	});
	item.appendChild(editButton);

	const deleteButton = document.createElement("button");
	deleteButton.type = "button";
	deleteButton.textContent = "Delete";
	deleteButton.addEventListener("click", (event) => {
		event.stopPropagation();
		removeTask(task.id);
	});
	item.appendChild(deleteButton);

	if (task.completed) {
		item.classList.add("completed");
		textNode.style.textDecoration = "line-through";
		textNode.style.opacity = "0.72";
	}

	item.addEventListener("click", () => toggleTaskCompletion(task.id));
	return item;
}

function startEditingTask(task, item, textNode) {
	const editInput = document.createElement("input");
	editInput.type = "text";
	editInput.value = task.text;
	editInput.className = "task-edit-input";
	editInput.style.width = "100%";
	editInput.style.padding = "0.9rem 1rem";
	editInput.style.border = "1px solid rgba(37, 99, 235, 0.24)";
	editInput.style.borderRadius = "16px";
	editInput.style.font = "inherit";
	editInput.style.color = "#0f172a";
	editInput.style.background = "#f8fbff";

	item.replaceChild(editInput, textNode);
	editInput.focus();
	editInput.select();

	function cancelEdit() {
		item.replaceChild(textNode, editInput);
	}

	function finishEdit() {
		const updatedText = editInput.value.trim();
		if (!updatedText) {
			cancelEdit();
			return;
		}

		if (updatedText !== task.text) {
			updateTaskText(task.id, updatedText);
		}
		item.replaceChild(textNode, editInput);
	}

	editInput.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			finishEdit();
		} else if (event.key === "Escape") {
			cancelEdit();
		}
	});

	editInput.addEventListener("blur", finishEdit);
}

function updateTaskText(taskId, newText) {
	const tasks = loadTasks().map((task) => {
		if (task.id !== taskId) {
			return task;
		}

		return {
			...task,
			text: newText,
		};
	});

	saveTasks(tasks);
	renderTasks(tasks);
}

function renderTasks(tasks) {
	taskList.innerHTML = "";
	tasks.forEach((task) => {
		taskList.appendChild(createTaskElement(task));
	});
}

function addTask() {
	const text = taskInput.value.trim();
	if (!text) {
		taskInput.value = "";
		taskInput.focus();
		return;
	}

	const tasks = loadTasks();
	const newTask = {
		id: `${Date.now()}`,
		text,
		completed: false,
	};

	tasks.push(newTask);
	saveTasks(tasks);
	renderTasks(tasks);
	taskInput.value = "";
	taskInput.focus();
}

function removeTask(taskId) {
	const tasks = loadTasks().filter((task) => task.id !== taskId);
	saveTasks(tasks);
	renderTasks(tasks);
}

function toggleTaskCompletion(taskId) {
	const tasks = loadTasks().map((task) => {
		if (task.id !== taskId) {
			return task;
		}

		return {
			...task,
			completed: !task.completed,
		};
	});

	saveTasks(tasks);
	renderTasks(tasks);
}

function initializeApp() {
	addTaskButton.addEventListener("click", addTask);
	taskInput.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			addTask();
		}
	});
	themeToggle.addEventListener("click", toggleTheme);

	applyTheme(loadTheme());
	renderTasks(loadTasks());
}

document.addEventListener("DOMContentLoaded", initializeApp);
