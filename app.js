document.addEventListener("DOMContentLoaded", function () {
    showPage("cases"); 
    updateUI();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            let searchQuery = this.value.trim();
            fetchCases(searchQuery);
        });
    }
});

// ✅ Backend API
const BASE_URL = "https://your-ngrok-url.ngrok-free.app"; 

// ✅ Login
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.error) showError(data.error);
        else {
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            updateUI();
        }
    })
    .catch((error) => showError("Login failed: " + error.message));
}

// ✅ Show Page
function showPage(page) {
    document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
    document.getElementById(page).style.display = "block";
}

// ✅ Update UI
function updateUI() {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
    document.getElementById("loginForm").style.display = currentUser ? "none" : "block";
    document.getElementById("app").style.display = currentUser ? "block" : "none";
}

// ✅ Logout
function logout() {
    localStorage.removeItem("currentUser");
    updateUI();
}

// ✅ Show Error
function showError(message) {
    alert("❌ " + message);
}
