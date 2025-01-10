const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Task = require('./models/task');
const User = require('./models/user')
const app = express();
const bcrypt = require('bcrypt')
var userId = 0;

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
  if (!userId) {
    return res.sendFile(path.join(__dirname, 'views', 'login.html'));
  }
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/user', (req, res) => {
  if (!userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({ userId });
});


app.get('/tasks', async (req, res) => {
  if (!userId) {
    return res.status(403).json({ error: 'You must be logged in to view tasks' });
  }

  try {
    const tasks = await Task.find({
      $or: [
        { userId },  // Tasks created by the logged-in user
        { public: true }  // Public tasks
      ]
    }).sort({ id: 1 });

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

    // Only the owner can see non-public tasks
    if (!task.public && task.userId !== req.session.userId) {
      return res.status(403).json({ error: 'You are not authorized to view this task' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.post('/tasks', async (req, res) => {
  const { title, description, location, time, registrationDeadline, deadline, isPublic } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const lastTask = await Task.findOne().sort({ id: -1 });
    const newId = lastTask ? lastTask.id + 1 : 0;

    const newTask = new Task({
      id: newId,
      status: 'active',
      title,
      description,
      location,
      time,
      registrationDeadline,
      deadline,
      userId,  // Associate the task with the logged-in user
      public: isPublic || false,  // Use the isPublic field from the request, defaulting to false
    });

    const savedTask = await newTask.save();

    console.log("Task created:", savedTask); // Log task data to confirm it's being saved
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error saving task:", err);
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

app.get('/public-tasks', async (req, res) => {
  try {
    const publicTasks = await Task.find({ public: true });

    res.sendFile(path.join(__dirname, 'views', 'public.html'));
  } catch (err) {
    console.error('Error fetching public tasks:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/pubtasks', async (req, res) => {
  try {
    const publicTasks = await Task.find({ public: true });
    res.json(publicTasks); // Send tasks as JSON response
  } catch (err) {
    console.error('Error fetching public tasks:', err);
    res.status(500).send('Internal Server Error');
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
      userId = user._id; 
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
          userId = user._id; 
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
