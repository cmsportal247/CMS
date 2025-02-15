document.addEventListener("DOMContentLoaded", function () {
    showPage("cases"); 
    updateUI();

    document.getElementById("newCaseBtn").addEventListener("click", openNewCaseModal);
    document.getElementById("searchInput").addEventListener("input", function () {
        fetchCases(this.value.trim());
    });
});

// ✅ Backend API
const BASE_URL = "https://2237-2405-201-c04c-a12a-75d8-6f7d-6499-de33.ngrok-free.app"; 

// ✅ Show Page
function showPage(page) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(page).style.display = "block";
}

// ✅ Update UI
function updateUI() {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
    document.getElementById("loginForm").style.display = currentUser ? "none" : "block";
    document.getElementById("app").style.display = currentUser ? "block" : "none";
}

// ✅ Fetch Cases
function fetchCases(searchQuery = "") {
    fetch(`${BASE_URL}/cases?search=${encodeURIComponent(searchQuery)}`)
        .then(response => response.json())
        .then(data => {
            let tableBody = document.getElementById("casesTable");
            tableBody.innerHTML = "";
            data.forEach(caseItem => {
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
                    <td><button class="btn btn-danger btn-sm" onclick="deleteCase(${caseItem.id})">Delete</button></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => showError("Error fetching cases: " + error.message));
}

// ✅ Login
function login() {
    fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: document.getElementById("username").value,
            password: document.getElementById("password").value,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) showError(data.error);
        else {
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            updateUI();
        }
    })
    .catch(error => showError("Login failed: " + error.message));
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
