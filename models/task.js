const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  status: { type: String, required: true, default: '[WIP]' },
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  time: { type: String},
  registrationDeadline: { type: String },
  deadline: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  public: { type: Boolean, default: false }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
