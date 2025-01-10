const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Task = require('./models/task');
const User = require('./models/user');
const app = express();
const bcrypt = require('bcrypt');
const crypto = require("crypto");
var userId = 0;
var currentUser = "";

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
        { userId },
        { public: true }
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
    const task = await Task.findOne({ id: taskId })
      .populate('participants', 'email').exec;
    console.log("Populated Task:", task);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

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
      userId,
      public: isPublic || false,
    });

    const savedTask = await newTask.save();
    console.log("Task created:", savedTask);
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
    res.json(publicTasks);
  } catch (err) {
    console.error('Error fetching public tasks:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/user/email/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ email: user.email });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
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
    currentUser = email;
    res.json({ success: true });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/join-task/:taskId', async (req, res) => {
  const taskId = req.params.taskId;

  if (!userId) {
    return res.status(403).json({ error: 'You must be logged in to participate' });
  }

  try {
    const task = await Task.findOne({ id: taskId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.participants.includes(userId)) {
      return res.status(400).json({ message: 'You have already joined this appointment' });
    }

    task.participants.push(userId);
    await task.save();

    res.status(200).json({ message: 'Successfully joined the task' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error joining task' });
  }
});

app.post('/joinforeign/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "First name, last name and email are required!" });
  }

  try {
    const task = await Task.findOne({ id: taskId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.foreignparticipants.push({ firstName, lastName, email });
    await task.save();

    res.status(200).json({ message: "Successfully registered for the appointment" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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
      currentUser = email;
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post("/createPublicLink/:taskId", async (req, res) => {
  let taskId = req.params.taskId;

  taskId = Number(taskId);

  if (isNaN(taskId)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const task = await Task.findOne({ id: taskId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!task.public) {
      return res.status(400).json({ error: "Task is not public" });
    }

    if (!task.publicLink) {
      const uniqueIdentifier = crypto.randomBytes(6).toString("hex");
      task.publicLink = `${req.protocol}://${req.get("host")}/appointment/${uniqueIdentifier}`;
      await task.save();
    }

    res.status(200).json({ publicLink: task.publicLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/appointment/:identifier', async (req, res) => {
  const { identifier } = req.params;

  try {
    const task = await Task.findOne({ publicLink: `${req.protocol}://${req.get('host')}/appointment/${identifier}` });

    if (!task) {
      return res.status(404).send('Task not found or is not public.');
    }

    res.sendFile(path.join(__dirname, 'views', 'sharedLink.html'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/appointment/:identifier/data', async (req, res) => {
  const { identifier } = req.params;

  try {
    const task = await Task.findOne({ publicLink: `${req.protocol}://${req.get('host')}/appointment/${identifier}` });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      title: task.title,
      description: task.description,
      location: task.location,
      time: task.time,
      deadline: task.deadline,
      registrationDeadline: task.registrationDeadline,
      status: task.status,
      foreignparticipants: task.foreignparticipants || [],
      participants: task.participants || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/appointment/:identifier/register', async (req, res) => {
  const { identifier } = req.params;
  const { firstName, lastName, email } = req.body;

  try {
    const task = await Task.findOne({ publicLink: `${req.protocol}://${req.get('host')}/appointment/${identifier}` });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or is not public.' });
    }

    const participant = { firstName, lastName, email };
    task.foreignparticipants.push(participant);

    await task.save();

    res.json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
