const express = require('express');
const path = require('path');
const Task = require('./task');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let tasks = [];
let currentId = 0;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/tasks', (req, res) => {
    res.json(tasks.map(task => task.toText()));
});

app.post('/tasks', (req, res) => {
    const { title, description, location, date, deadline } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const newTask = new Task(
        currentId++,
        '[WIP]',
        title,
        description || '',
        location || '',
        date || '',
        deadline || ''
    );
    tasks.push(newTask);
    res.status(201).json(newTask.toText());
});

app.put('/tasks/:task_id', (req, res) => {
    const taskId = parseInt(req.params.task_id, 10);
    const { status } = req.body;

    const task = tasks.find(task => task.id === taskId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    if (status) {
        task.setStatus(status);
    }

    res.json(task.toText());
});

app.delete('/tasks/:task_id', (req, res) => {
    const taskId = parseInt(req.params.task_id, 10);
    tasks = tasks.filter(task => task.id !== taskId);
    tasks.forEach((task, index) => task.setID(index));
    currentId = tasks.length;
    res.json(tasks.map(task => task.toText()));
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
