const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  status: { type: String, required: true, default: '[WIP]' },
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  registrationDeadline: { type: String },
  deadline: { type: String },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
