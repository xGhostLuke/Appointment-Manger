class Task {
    constructor(taskId, status, title) {
      this.id = taskId;
      this.status = status;
      this.title = title;
    }
  
    toText() {
      return `${this.id}: ${this.status} ${this.title}`;
    }
  
    toString() {
      return `/${this.id}/${this.status}/${this.title}|`;
    }
  
    setStatus(newStatus) {
      this.status = newStatus;
    }

    getId(){
        return this.id;
    }
  }
  