const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Task = require('./models/task');
const User = require('./models/user')
const app = express();
const bcrypt = require('bcrypt')

mongoose.connect('mongodb://localhost:27017/tasksDB', {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/taskpage', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ id: 1 });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/tasks/:task_id', async (req, res) => {
  const taskId = parseInt(req.params.task_id, 10);

  try {
    const task = await Task.findOne({ id: taskId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.post('/tasks', async (req, res) => {
  const { title, description, location, registrationDeadline, deadline } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const lastTask = await Task.findOne().sort({ id: -1 });
    const newId = lastTask ? lastTask.id + 1 : 0;

    const newTask = new Task({
      id: newId,
      status: '[WIP]',
      title,
      description: description || '',
      location: location || '',
      registrationDeadline: registrationDeadline || '',
      deadline: deadline || '',
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Error saving task:', err);
    res.status(500).json({ error: 'Failed to save task' });
  }
});

app.put('/tasks/:task_id', async (req, res) => {
  const taskId = parseInt(req.params.task_id, 10);
  const { status } = req.body;

  try {
    const task = await Task.findOne({ id: taskId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = status || task.status;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/tasks/:task_id', async (req, res) => {
  const taskId = parseInt(req.params.task_id, 10);

  try {
    const deletedTask = await Task.findOneAndDelete({ id: taskId });

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const tasks = await Task.find().sort({ id: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
  }

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ error: 'Email is already registered' });
      }

      const user = new User({ email, password });
      await user.save();
      res.json({ success: true });
  } catch (err) {
      console.error('Error registering user:', err);
      res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
  }

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ error: 'User not found' });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (isPasswordCorrect) {
          res.json({ success: true });
      } else {
          res.status(400).json({ error: 'Invalid password' });
      }
  } catch (err) {
      console.error('Error logging in:', err);
      res.status(500).json({ error: 'Login failed' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
