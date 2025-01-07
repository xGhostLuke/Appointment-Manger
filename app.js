const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Task = require('./models/task');  // Import the Task model
const { Console } = require('console');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tasksDB', {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
  console.log('Test')
});

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ id: 1 });  // Sort tasks by custom id
    res.json(tasks);  // Returns empty array if no tasks
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task by ID
// Get task by ID
app.get('/tasks/:task_id', async (req, res) => {
  const taskId = parseInt(req.params.task_id, 10);

  try {
      const task = await Task.findOne({ id: taskId });
      if (!task) {
          return res.status(404).json({ error: 'Task not found' });
      }
      console.log('Returning task details:', task);  // Log the task details being returned
      res.json(task);  // Return the task as JSON
  } catch (err) {
      console.error('Error fetching task:', err);
      res.status(500).json({ error: 'Failed to fetch task' });
  }
});




// POST a new task
app.post('/tasks', async (req, res) => {
  console.log('Received POST request to add a task');  // This should log when the route is hit

  const { title, description, location, registrationDeadline, deadline } = req.body;
  if (!title) {
    console.log('Title is missing');  // Log if title is missing
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const lastTask = await Task.findOne().sort({ id: -1 });
    const newId = lastTask ? lastTask.id + 1 : 0;  // Generate the next ID
    console.log('New task ID:', newId);  // Log the new task ID

    const newTask = new Task({
      id: newId,
      status: '[WIP]',
      title,
      description: description || '',
      location: location || '',
      registrationDeadline: registrationDeadline || '',
      deadline: deadline || '',
    });

    // Save the task to the database (only call save once)
    const savedTask = await newTask.save();  // This is the only call you need to save the task
    console.log('Task saved:', savedTask);  // Log the saved task

    res.status(201).json(savedTask);  // Send the saved task as a response
  } catch (err) {
    console.error('Error saving task:', err);  // Log any error that occurs
    res.status(500).json({ error: 'Failed to save task' });
  }
});




app.put('/tasks/:task_id', async (req, res) => {
  const taskId = parseInt(req.params.task_id, 10);  // Use the custom ID from the URL
  const { status } = req.body;

  try {
    // Find task by custom ID
    const task = await Task.findOne({ id: taskId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update the task status
    task.status = status || task.status; // If no status provided, keep the old one

    // Save the updated task
    const updatedTask = await task.save();
    res.json(updatedTask);  // Send back the updated task
  } catch (err) {
    console.error('Error updating task:', err);  // Log the error
    res.status(500).json({ error: 'Failed to update task' });
  }
});



app.delete('/tasks/:task_id', async (req, res) => {
  const taskId = parseInt(req.params.task_id, 10);  // Get taskId from params

  try {
      // Find the task by custom ID and delete it
      const deletedTask = await Task.findOneAndDelete({ id: taskId });

      if (!deletedTask) {
          return res.status(404).json({ error: 'Task not found' });
      }

      console.log(`Deleted task with id: ${taskId}`); // Log the deleted task

      // Return the updated tasks list after deletion
      const tasks = await Task.find().sort({ id: 1 });  // Sort tasks by ID in ascending order
      res.json(tasks);  // Respond with the updated tasks list
  } catch (err) {
      res.status(500).json({ error: 'Failed to delete task' });
  }
});




// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
