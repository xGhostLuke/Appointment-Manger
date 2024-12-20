const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());  // For parsing application/json
app.use(express.static(path.join(__dirname, 'public')));

// Task class
class Task {
  constructor(id, status, title) {
    this.id = id;
    this.status = status;
    this.title = title;
  }

  toText() {
    return `${this.id}: ${this.status} ${this.title}`;
  }

  setStatus(status) {
    this.status = status;
  }

  setID(id){
    this.id = id;
  }
}

let tasks = [];
let currentId = 0; // Variable to keep track of the last used task ID

// Serve the home page (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));  // Serve index.html from the views folder
});

// Get all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks.map(task => task.toText()));
});

// Add a new task
app.post('/tasks', (req, res) => {
  const data = req.body;

  if (!data || !data.title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask = new Task(currentId++, '[WIP]', data.title);
  console.log("Added Task: " + newTask.toText());
  tasks.push(newTask);
  res.status(201).json(tasks.map(task => task.toText()));
});

// Update an existing task
app.put('/tasks/:task_id', (req, res) => {
  const taskId = parseInt(req.params.task_id, 10);  // Ensure taskId is a number
  const data = req.body;

  if (!data) {
    return res.status(400).json({ error: 'No data provided' });
  }

  const task = tasks.find(task => task.id === taskId);
  if (task) {
    task.setStatus(data.status || task.status);
    return res.json(tasks.map(task => task.toText()));
  } else {
    return res.status(404).json({ error: 'Task not found' });
  }
});

// Delete a task
app.delete('/tasks/:task_id', (req, res) => {
  const taskId = parseInt(req.params.task_id, 10); // Ensure taskId is a number
  console.log("Deleted Task with ID: " + taskId + " " + req.params.task_id);

  // Remove the task
  tasks = tasks.filter(task => task.id !== taskId);

  // Reassign IDs to the remaining tasks to keep them sequential
  tasks.forEach((task, index) => {
    task.setID(index); // Reassign sequential IDs starting from 0
  });

  // Reset currentId to the next available ID
  currentId = tasks.length;

  res.json(tasks.map(task => task.toText()));
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
