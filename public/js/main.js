const taskList = document.querySelector(".tasks ul");
const taskDetails = document.querySelector(".selected_task");
const addTaskButton = document.querySelector(".inputFields button");
const inputs = document.querySelectorAll(".inputFields input");
const logoutButton = document.querySelector(".logoutButton");

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
        status: "active",
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

async function getEmailByUserId(userId) {
    try {
        const response = await fetch(`/user/email/${userId}`);
        
        if (response.ok) {
            const data = await response.json();
            return data.email;
        } else {
            console.error("Error: User not found or something went wrong.");
            return null;
        }
    } catch (error) {
        console.error('Error fetching email:', error);
        return null;
    }
}

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
                const isOwner = task.userId === window.userId;
                const taskDeadline = new Date(task.deadline);
                const currentDate = new Date();
                const timeDiff = taskDeadline - currentDate;
                const oneDayInMillis = 24 * 60 * 60 * 1000;

                const isDeadlineSoon = timeDiff <= oneDayInMillis && timeDiff > 0;

                listItem.innerHTML = `
                    <strong>${task.title}</strong><br>
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

async function displayTaskDetails(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (!task) {
        console.error("Task not found");
        return;
    }

    const isOwner = task.userId === userId;

    taskDetails.innerHTML = `
        <h2>Appointment Details</h2>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Location:</strong> ${task.location}</p>
        <p><strong>Time:</strong> ${task.time}</p>
        <p><strong>Deadline:</strong> ${task.deadline}</p>
        <p><strong>Registration Deadline:</strong> ${task.registrationDeadline}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <p><strong>Public:</strong> ${task.public ? "Yes" : "No"}</p>
    `;

    if (task.participants && task.participants.length > 0) {
        taskDetails.innerHTML += `<h3>Participants:</h3><ul>`;
        
        for (const participantId of task.participants) {
            const email = await getEmailByUserId(participantId);
            if (email) {
                taskDetails.innerHTML += `<li>${email}</li>`;
            } else {
                taskDetails.innerHTML += `<li>Could not fetch email</li>`;
            }
        }

        taskDetails.innerHTML += `</ul>`;
    } else {
        taskDetails.innerHTML += `<p>No participants yet.</p>`;
    }

    if (task.public && !isOwner) {
        taskDetails.innerHTML += `
            <button onclick="joinTask(${task.id})">Join Task</button>
        `;
    }

    if (isOwner) {
        taskDetails.innerHTML += `
            <button onclick="markTaskDone(${task.id})">Cancel Task</button>
            <button onclick="deleteTask(${task.id})">Delete Task</button>
        `;
    }
}

async function joinTask(taskId) {
    try {
        const response = await fetch(`/join-task/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();
        if (response.ok) {
            alert('Successfully joined the task!');
            renderTaskList();
        } else {
            alert(result.message || 'Failed to join the task');
        }
    } catch (error) {
        console.error("Error joining task:", error);
    }
}

async function markTaskDone(taskId) {
    try {
        const task = tasks.find(task => task.id === taskId);
        if (!task) {
            console.error("Task not found");
            return;
        }

        task.status = "canceled";

        const response = await fetch(`/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "canceled" }),
        });

        if (!response.ok) {
            throw new Error("Failed to update task status");
        }

        const updatedTask = await response.json();
        console.log("Task updated:", updatedTask);

        renderTaskList();
        taskDetails.innerHTML = "";
    } catch (error) {
        console.error("Error marking task as canceled:", error);
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

window.onload = async () => {
    await getUserId();
    renderTaskList();
};
