const taskList = document.querySelector(".tasks ul");
const taskDetails = document.querySelector(".selected_task");
const addTaskButton = document.querySelector(".inputFields button");
const inputs = document.querySelectorAll(".inputFields input");

let tasks = [];
let nextId = 1;

async function renderTaskList() {
    try {
        const response = await fetch("/pubtasks");
        tasks = await response.json();

        taskList.innerHTML = tasks.length === 0 ? "<li>No public Appointments</li>" : '';

        tasks.forEach((task) => {
            const listItem = document.createElement("li");
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
}

window.onload = renderTaskList;
