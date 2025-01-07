document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const toggleFormButton = document.getElementById("toggleFormButton");

    toggleFormButton.addEventListener("click", () => {
        loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
        registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
        toggleFormButton.textContent = toggleFormButton.textContent.includes("Register") 
            ? "Already have an account? Login" 
            : "Don't have an account? Register";
    });

    // Handle Login Form Submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = '/taskpage';  // Redirect to index.html after successful login
        } else {
            alert(result.error || "Login failed.");
        }
    });

    // Handle Register Form Submission
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("registerConfirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = '/taskpage';  // Redirect to index.html after successful registration
        } else {
            alert(result.error || "Registration failed.");
        }
    });
});
