const taskList = document.querySelector(".tasks ul");
const taskDetails = document.querySelector(".selected_task");

let tasks = [];

async function renderTaskList() {
    try {
        const response = await fetch("/pubtasks");
        tasks = await response.json();

        taskList.innerHTML = tasks.length === 0 ? "<li>No public Appointments</li>" : '';

        tasks.forEach((task) => {
            const listItem = document.createElement("li");
                const taskDeadline = new Date(task.registrationDeadline);
                const currentDate = new Date();
                const timeDiff = taskDeadline - currentDate;
                const oneDayInMillis = 24 * 60 * 60 * 1000;

                const isDeadlineSoon = timeDiff <= oneDayInMillis;

                listItem.innerHTML = `
                    <strong>${task.title}</strong><br>
                    Status: ${task.status}<br>
                    Deadline: ${task.deadline}
                `;

                if (isDeadlineSoon) {
                    listItem.classList.add("highlight-deadline");
                }

                if (task.status === "canceled") {
                    listItem.classList.add("highlight-status");
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
        <div class="register-form">
            <h3>Register for this Appointment</h3>
            <form id="registration-form">
                <label for="first-name">First Name:</label>
                <input type="text" id="first-name" name="first-name" required>
                <label for="last-name">Last Name:</label>
                <input type="text" id="last-name" name="last-name" required>
                <label for="email">EMail:</label>
                <input type="text" id="email" name="email" required>
                <button type="submit">Register</button>
            </form>
        </div>
    `;

    const registrationForm = document.getElementById("registration-form");
    registrationForm.addEventListener("submit", (event) => handleRegistration(event, taskId));
}

async function handleRegistration(event, taskId) {
    event.preventDefault();

    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;

    try {
        const response = await fetch(`/joinforeign/${taskId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ firstName, lastName, email })
        });

        if (!response.ok) {
            throw new Error("Failed to register for the appointment");
        }

        alert("You have successfully registered for the appointment!");
    } catch (error) {
        console.error("Error registering for appointment:", error);
        alert("An error occurred while registering. Please try again.");
    }

    event.target.reset();
}

window.onload = renderTaskList;
