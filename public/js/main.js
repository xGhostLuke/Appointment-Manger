const API_URL = '/tasks';

async function fetchTasks() {
    const response = await fetch(API_URL);
    const tasks = await response.json();
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        taskList.innerHTML += `
            <li>
                ${task}
                <button onclick="markDone(${index})">Mark Done</button>
                <button onclick="deleteTask(${index})">Delete</button>
            </li>`;
    });
}

async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const title = taskInput.value.trim();
    if (title) {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        taskInput.value = '';
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
