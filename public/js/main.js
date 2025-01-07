const API_URL = '/tasks';

async function fetchTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        taskList.innerHTML += `
            <li>
                <strong>${task.title}</strong><br>
                Beschreibung: ${task.description || "N/A"}<br>
                Ort: ${task.location || "N/A"}<br>
                Datum: ${task.date || "N/A"}<br>
                Anmeldefrist: ${task.deadline || "N/A"}<br>
                Status: ${task.status}<br>
                <button onclick="markDone(${task.id})">Mark Done</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </li>`;
    });
}

async function addTask() {
    const title = document.getElementById('taskInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();
    const location = document.getElementById('locationInput').value.trim();
    const date = document.getElementById('dateInput').value;
    const deadline = document.getElementById('deadlineInput').value;

    if (title) {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, location, date, deadline })
        });
        document.getElementById('taskInput').value = '';
        document.getElementById('descriptionInput').value = '';
        document.getElementById('locationInput').value = '';
        document.getElementById('dateInput').value = '';
        document.getElementById('deadlineInput').value = '';
        fetchTasks();
    }
}

async function markDone(taskId) {
    await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: '[DONE]' })
    });
    fetchTasks();
}

async function deleteTask(taskId) {
    await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
    fetchTasks();
}

fetchTasks();
