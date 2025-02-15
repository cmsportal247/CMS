document.addEventListener("DOMContentLoaded", function () {
    updateUI();
    showPage("cases"); // ✅ Default page on load

    // ✅ Ensure searchInput exists before adding an event listener
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            let searchQuery = this.value.trim();
            fetchCases(searchQuery);
        });
    }
});

// ✅ Updated Backend API URL (Use latest ngrok link)
const BASE_URL = "https://your-ngrok-url.ngrok-free.app";

// ✅ Fetch Cases (With Search)
function fetchCases(searchQuery = "") {
    if (!currentUser) return;

    fetch(`${BASE_URL}/cases?search=${encodeURIComponent(searchQuery)}`)
        .then((response) => response.json())
        .then((data) => {
            allCases = data;
            displayCases();
        })
        .catch((error) => showError("Error fetching cases: " + error.message));
}

// ✅ Display Cases with Pagination
function displayCases() {
    let tableBody = document.querySelector("#casesTable");
    tableBody.innerHTML = "";

    allCases.forEach((caseItem) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${caseItem.date_received}</td>
            <td>${caseItem.staff}</td>
            <td>${caseItem.mobile}</td>
            <td>${caseItem.name}</td>
            <td>${caseItem.work || "-"}</td>
            <td>${caseItem.info || "-"}</td>
            <td>${caseItem.pending || "-"}</td>
            <td>${caseItem.remarks || "-"}</td>
            <td>${caseItem.status}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteCase(${caseItem.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

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
        if (data.error) {
            showError(data.error);
        } else {
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            updateUI();
            fetchCases(); // ✅ Load cases after login
        }
    })
    .catch((error) => showError("Login failed: " + error.message));
}

// ✅ Logout
function logout() {
    localStorage.removeItem("currentUser");
    updateUI();
}

// ✅ Update UI
function updateUI() {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let loginForm = document.getElementById("loginForm");
    let appSection = document.getElementById("app");

    if (currentUser) {
        loginForm.style.display = "none";
        appSection.style.display = "block";
        fetchCases();
    } else {
        loginForm.style.display = "block";
        appSection.style.display = "none";
    }
}

// ✅ Show Errors
function showError(message) {
    alert("❌ " + message);
}
