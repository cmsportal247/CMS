document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    showPage("cases");
});

// ✅ Backend API URL (Update this with your latest Ngrok URL)
const BASE_URL = "https://a9ea-2405-201-c04c-a12a-75d8-6f7d-6499-de33.ngrok-free.app"; 

let currentUser = null;
let allCases = [];
let currentPage = 1;
const casesPerPage = 10;

// ✅ Show Page Function
function showPage(page) {
    document.querySelectorAll(".page").forEach((p) => p.style.display = "none");
    let targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.style.display = "block";
    } else {
        console.error(`❌ Page ${page} not found.`);
    }
}
// ✅ Open Add Case Modal
function openAddCaseModal() {
    console.log("Opening Add Case Modal..."); // Debugging log
    let modalElement = document.getElementById("addCaseModal");
    
    if (modalElement) {
        let modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        console.error("❌ Modal with ID 'addCaseModal' not found.");
    }
}


// ✅ Update UI After Login
function updateUI() {
    currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    let loginForm = document.getElementById("loginForm");
    let appSection = document.getElementById("app");
    let welcomeText = document.getElementById("welcomeText");
    let logoutBtn = document.getElementById("logoutBtn");

    if (currentUser) {
        loginForm.style.display = "none";
        appSection.style.display = "block";
        welcomeText.innerText = `Welcome, ${currentUser.username}`;
        logoutBtn.style.display = "block";
        fetchCases();
    } else {
        loginForm.style.display = "block";
        appSection.style.display = "none";
        logoutBtn.style.display = "none";
    }
}

// ✅ Login Function
function login() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

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
        }
    })
    .catch((error) => showError("Login failed: " + error.message));
}

// ✅ Logout Function
function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

// ✅ Fetch Cases with Search
function fetchCases(searchQuery = "") {
    fetch(`${BASE_URL}/cases?search=${encodeURIComponent(searchQuery)}`)
        .then((response) => response.json())
        .then((data) => {
            allCases = data;
            currentPage = 1;
            displayCases();
        })
        .catch((error) => showError("Error fetching cases: " + error.message));
}

// ✅ Display Cases with Pagination
function displayCases() {
    let tableBody = document.getElementById("casesTable");
    tableBody.innerHTML = "";

    let start = (currentPage - 1) * casesPerPage;
    let end = start + casesPerPage;
    let paginatedCases = allCases.slice(start, end);

    paginatedCases.forEach((caseItem) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${caseItem.date_received}</td>
            <td>${caseItem.staff}</td>
            <td>${caseItem.mobile}</td>
            <td>${caseItem.name}</td>
            <td>${caseItem.work}</td>
            <td>${caseItem.pending}</td>
            <td>${caseItem.remarks}</td>
            <td>${caseItem.status}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteCase(${caseItem.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("pageIndicator").innerText = `Page ${currentPage}`;
}

// ✅ Pagination Controls
function changePage(step) {
    let maxPage = Math.ceil(allCases.length / casesPerPage);
    if (currentPage + step > 0 && currentPage + step <= maxPage) {
        currentPage += step;
        displayCases();
    }
}

// ✅ Delete Case Function
function deleteCase(caseId) {
    if (!confirm("Are you sure you want to delete this case?")) return;

    fetch(`${BASE_URL}/delete-case/${caseId}`, { method: "DELETE" })
        .then((response) => response.json())
        .then(() => {
            showSuccess("Case deleted successfully!");
            fetchCases();
        })
        .catch((error) => showError("Error deleting case: " + error.message));
}

// ✅ Success/Error Messages
function showSuccess(message) {
    alert("✅ " + message);
}

function showError(message) {
    alert("❌ " + message);
}
