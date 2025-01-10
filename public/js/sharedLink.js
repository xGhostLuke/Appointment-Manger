document.addEventListener('DOMContentLoaded', function () {
    const taskTitle = document.getElementById('task-title');
    const taskDescription = document.getElementById('task-description');
    const taskLocation = document.getElementById('task-location');
    const taskTime = document.getElementById('task-time');
    const taskDeadline = document.getElementById('task-deadline');
    const taskRegistrationDeadline = document.getElementById('task-registration-deadline');
    const taskStatus = document.getElementById('task-status');

    const registrationForm = document.getElementById('appointment-registration');

    const identifier = window.location.pathname.split('/')[2];

    fetch(`/appointment/${identifier}/data`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Task not found');
            }
            return response.json();
        })
        .then(data => {
            taskTitle.textContent = data.title || 'No title available';
            taskDescription.textContent = data.description || 'No description available';
            taskLocation.textContent = data.location || 'No location available';
            taskTime.textContent = data.time || 'No time available';
            taskDeadline.textContent = data.deadline || 'No deadline available';
            taskRegistrationDeadline.textContent = data.registrationDeadline || 'No registration deadline available';
            taskStatus.textContent = data.status || 'No status available';
        })
        .catch(error => {
            console.error('Error loading task data:', error);
            taskTitle.textContent = 'Error loading task data';
            taskDescription.textContent = 'Please try again later.';
            taskLocation.textContent = 'Error';
            taskTime.textContent = 'Error';
            taskDeadline.textContent = 'Error';
            taskRegistrationDeadline.textContent = 'Error';
            taskStatus.textContent = 'Error';
        });

    registrationForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(registrationForm);
        const data = {
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            email: formData.get('email')
        };

        fetch(`/appointment/${identifier}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Registration successful!');
                registrationForm.reset();
            } else {
                alert('Registration failed: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error registering:', error);
            alert('An error occurred. Please try again later.');
        });
    });
});
