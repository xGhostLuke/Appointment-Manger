const taskList = document.querySelector(".tasks ul");
const taskDetails = document.querySelector(".selected_task");
const addTaskButton = document.querySelector(".inputFields button");
const inputs = document.querySelectorAll(".inputFields input");
const logoutButton = document.querySelector(".logoutButton")

let tasks = [];
let nextId = 1;
let userId;

logoutButton.addEventListener("click", () => {
    window.location.href = '/';
});

addTaskButton.addEventListener("click", async () => {
    const title = inputs[0].value;
    const description = inputs[1].value;
    const location = inputs[2].value;
    const time = inputs[3].value;
    const deadline = inputs[4].value;
    const registrationDeadline = inputs[5].value;
    const isPublic = document.querySelector('#isPublic').checked;

    if (!title || !deadline) {
        alert("Please provide both Title and Deadline!");
        return;
    }

    const task = {
        id: nextId++,
        title,
        description,
        location,
        time,
        deadline,
        registrationDeadline,
        status: "WIP",
        isPublic: isPublic
    };

    try {
        const response = await fetch("/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });

        const newTask = await response.json();
        console.log("Task added:", newTask);
        renderTaskList();
        inputs.forEach((input) => (input.value = ""));
    } catch (error) {
        console.error("Error adding task:", error);
    }
});

async function getUserId() {
    try {
      const response = await fetch('/user');
      const data = await response.json();
      if (data.userId) {
        userId = data.userId;
      } else {
        window.location.href = '/'; // Redirect to login
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
      window.location.href = '/'; // Redirect to login
    }
  }
  
  window.onload = async () => {
    await getUserId();
    renderTaskList();
  };

async function renderTaskList() {
    try {
        const response = await fetch("/tasks");
        tasks = await response.json();

        console.log("Tasks fetched from server:", tasks);

        taskList.innerHTML = "";
        if (tasks.length === 0) {
            taskList.innerHTML = "<li>No tasks available</li>";
        } else {
            tasks.forEach((task) => {
                const listItem = document.createElement("li");
                const isOwner = task.userId === userId; // Compare with global userId
                const taskDeadline = new Date(task.deadline);
                const currentDate = new Date();
                const timeDiff = taskDeadline - currentDate;
                const oneDayInMillis = 24 * 60 * 60 * 1000;

                const isDeadlineSoon = timeDiff <= oneDayInMillis && timeDiff > 0;

                listItem.innerHTML = `
                    <strong>${task.title}</strong><br>
                    ${task.public ? '<span>Public</span><br>' : ''}
                    Status: ${task.status}<br>
                    Deadline: ${task.deadline}
                `;

                if (isDeadlineSoon) {
                    listItem.classList.add("highlight-deadline");
                }

                listItem.addEventListener("click", () => displayTaskDetails(task.id));
                taskList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}



function displayTaskDetails(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (!task) {
        console.error("Task not found");
        return;
    }

    const isOwner = task.userId === window.userId;  // Check if the logged-in user is the task owner

    taskDetails.innerHTML = `
        <h2>Appointment Details</h2>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Location:</strong> ${task.location}</p>
        <p><strong>Time:</strong> ${task.time}</p>
        <p><strong>Deadline:</strong> ${task.deadline}</p>
        <p><strong>Registration Deadline:</strong> ${task.registrationDeadline}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <p><strong>Public:</strong> ${task.isPublic}</p>

        <button onclick="markTaskDone(${task.id})">Mark Done</button>
        <button onclick="deleteTask(${task.id})">Delete</button>`

}

async function markTaskDone(taskId) {
    try {
        const task = tasks.find(task => task.id === taskId);
        if (!task) {
            console.error("Task not found");
            return;
        }

        task.status = "Done";

        const response = await fetch(`/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "Done" }),
        });

        if (!response.ok) {
            throw new Error("Failed to update task status");
        }

        const updatedTask = await response.json();
        console.log("Task updated:", updatedTask);

        renderTaskList();
        taskDetails.innerHTML = "";
    } catch (error) {
        console.error("Error marking task as done:", error);
    }
}

async function deleteTask(taskId) {
    try {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            console.error("Task not found");
            return;
        }

        const response = await fetch(`/tasks/${taskId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        console.log(`Task with ID ${taskId} deleted`);

        tasks.splice(taskIndex, 1);
        renderTaskList();
        taskDetails.innerHTML = "";
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

window.onload = renderTaskList;
