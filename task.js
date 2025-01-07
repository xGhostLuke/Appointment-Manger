class Task {
  constructor(id, status, title, description, location, date, deadline) {
      this.id = id;
      this.status = status;
      this.title = title;
      this.description = description;
      this.location = location;
      this.date = date;
      this.deadline = deadline;
  }

  toText() {
      return {
          id: this.id,
          status: this.status,
          title: this.title,
          description: this.description,
          location: this.location,
          date: this.date,
          deadline: this.deadline
      };
  }

  setStatus(newStatus) {
      this.status = newStatus;
  }

  setID(newId) {
      this.id = newId;
  }
}

module.exports = Task;
