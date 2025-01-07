// Get references to elements
const taskList = document.querySelector(".tasks ul");
const taskDetails = document.querySelector(".selected_task");
const addTaskButton = document.querySelector(".inputFields button"); // Fix selector
const inputs = document.querySelectorAll(".inputFields input");

let tasks = [];  // Declare tasks globally
let nextId = 1;  // Custom ID system - starting from 1

// Function to add a task
addTaskButton.addEventListener("click", async () => {
    // Get input values
    const title = inputs[0].value; // Title
    const description = inputs[1].value; // Description
    const location = inputs[2].value; // Location
    const deadline = inputs[3].value; // Deadline
    const registrationDeadline = inputs[4].value; // Registration Deadline

    // Basic validation
    if (!title || !deadline) {
        alert("Please provide both Title and Deadline!");
        return;
    }

    // Create task object with a custom ID
    const task = {
        id: nextId++, // Use the custom ID and increment for the next task
        title,
        description,
        location,
        deadline,
        registrationDeadline,
        status: "WIP",
    };

    try {
        // Send POST request to backend to save task
        const response = await fetch("/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(task),
        });

        const newTask = await response.json();
        console.log("Task added:", newTask);

        // Render the updated task list from the backend
        renderTaskList();
        inputs.forEach((input) => (input.value = "")); // Clear inputs
    } catch (error) {
        console.error("Error adding task:", error);
    }
});

// Function to fetch tasks and render them
async function renderTaskList() {
    try {
        const response = await fetch("/tasks");
        tasks = await response.json(); // Store tasks in the global tasks array

        // Log fetched tasks to confirm the updated list
        console.log("Fetched tasks:", tasks);

        taskList.innerHTML = ""; // Clear existing tasks
        if (tasks.length === 0) {
            taskList.innerHTML = "<li>No tasks available</li>";
        } else {
            tasks.forEach((task) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <strong>${task.title}</strong><br>
                    Status: ${task.status}<br>
                    Deadline: ${task.deadline}
                `;
                // Pass the task's custom id to displayTaskDetails
                listItem.addEventListener("click", () => displayTaskDetails(task.id)); // Pass task ID
                taskList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

// Modify displayTaskDetails to check if tasks array is populated
function displayTaskDetails(taskId) {
    const task = tasks.find(task => task.id === taskId); // Find the task by custom ID
    if (!task) {
        console.error("Task not found");
        return;
    }

    taskDetails.innerHTML = `
        <h2>Task Details</h2>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Location:</strong> ${task.location}</p>
        <p><strong>Deadline:</strong> ${task.deadline}</p>
        <p><strong>Registration Deadline:</strong> ${task.registrationDeadline}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <button onclick="markTaskDone(${task.id})">Mark Done</button>
        <button onclick="deleteTask(${task.id})">Delete</button>
    `;
}

// Function to mark a task as done (updated to use custom task ID)
async function markTaskDone(taskId) {
    try {
        const task = tasks.find(task => task.id === taskId); // Find task by custom ID
        if (!task) {
            console.error("Task not found");
            return;
        }

        // Update task status to "Done"
        task.status = "Done"; // Update in the tasks array

        // Send PUT request to backend to update the task
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

        renderTaskList(); // Re-render tasks after updating
        taskDetails.innerHTML = ""; // Clear task details
    } catch (error) {
        console.error("Error marking task as done:", error);
    }
}

// Function to delete a task (updated to use custom task ID)
async function deleteTask(taskId) {
    try {
        const taskIndex = tasks.findIndex(task => task.id === taskId); // Find task by custom ID
        if (taskIndex === -1) {
            console.error("Task not found");
            return;
        }

        // Send DELETE request to the backend to delete the task
        const response = await fetch(`/tasks/${taskId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        console.log(`Task with ID ${taskId} deleted`);

        // Remove the task from the tasks array
        tasks.splice(taskIndex, 1);

        // After deleting, re-render the updated task list from the backend
        renderTaskList(); // Fetch the tasks again and re-render the list
        taskDetails.innerHTML = ""; // Clear task details
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

// Initial call to load tasks on page load
window.onload = renderTaskList;
