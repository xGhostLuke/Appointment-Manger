    
// Get references to elements
const taskList = document.querySelector(".tasks ul");
const taskDetails = document.querySelector(".selected_task");
const addTaskButton = document.querySelector(".inputFields button"); // Fix selector
const inputs = document.querySelectorAll(".inputFields input");

// Tasks array to store task data
let tasks = [];

// Function to add a task
addTaskButton.addEventListener("click", () => {
    // Get input values
    const title = inputs[0].value;
    const description = inputs[1].value;
    const location = inputs[2].value;
    const deadline = inputs[3].value;
    const registrationDeadline = inputs[4].value;

    // Basic validation
    if (!title || !deadline) {
        alert("Please provide both Title and Deadline!");
        return;
    }

    // Create task object
    const task = {
        title,
        description,
        location,
        deadline,
        registrationDeadline,
        status: "WIP",
    };

    // Add task to the list
    tasks.push(task);

    // Update UI
    renderTaskList();

    // Clear inputs
    inputs.forEach((input) => (input.value = ""));
});

// Function to render tasks
function renderTaskList() {
    taskList.innerHTML = ""; // Clear existing tasks
    tasks.forEach((task, index) => {
        // Create a list item
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <strong>${task.title}</strong><br>
            Status: ${task.status}<br>
            Deadline: ${task.deadline}
        `;

        // Add event listener to display task details
        listItem.addEventListener("click", () => displayTaskDetails(index));
        taskList.appendChild(listItem);
    });
}

// Function to display task details
function displayTaskDetails(index) {
    const task = tasks[index];
    taskDetails.innerHTML = `
        <h2>Task Details</h2>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Location:</strong> ${task.location}</p>
        <p><strong>Deadline:</strong> ${task.deadline}</p>
        <p><strong>Registration Deadline:</strong> ${task.registrationDeadline}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <button onclick="markTaskDone(${index})">Mark Done</button>
        <button onclick="deleteTask(${index})">Delete</button>
    `;
}

// Function to mark a task as done
function markTaskDone(index) {
    tasks[index].status = "Done";
    renderTaskList();
    taskDetails.innerHTML = ""; // Clear task details
}

// Function to delete a task
function deleteTask(index) {
    tasks.splice(index, 1); // Remove the task
    renderTaskList();
    taskDetails.innerHTML = ""; // Clear task details
}
