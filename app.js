document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    showPage("cases");
});

// ✅ Backend API URL (Update this with your deployed URL)
const API_URL = "https://backend-7l9n.onrender.com";

let currentUser = null;
let allCases = [];
let currentPage = 1;
const casesPerPage = 10;

// ✅ Show Page
function showPage(page) {
    document.querySelectorAll(".page").forEach((p) => p.style.display = "none");
    document.getElementById(page).style.display = "block";
}

// ✅ Open Add Case Modal
function openAddCaseModal() {
    let modalElement = document.getElementById("addCaseModal");
    let modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// ✅ Update UI After Login
function updateUI() {
    currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

    if (currentUser) {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("app").style.display = "block";
        document.getElementById("welcomeText").innerText = `Welcome, ${currentUser.username}`;
        document.getElementById("logoutBtn").style.display = "block";
        fetchCases();
    } else {
        document.getElementById("loginForm").style.display = "block";
        document.getElementById("app").style.display = "none";
        document.getElementById("logoutBtn").style.display = "none";
    }
}

// ✅ Login
function login() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    fetch(`${API_URL}/login`, {
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

// ✅ Logout
function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

// ✅ Fetch Cases
function fetchCases(searchQuery = "") {
    fetch(`${API_URL}/cases?search=${encodeURIComponent(searchQuery)}`)
        .then((response) => response.json())
        .then((data) => {
            allCases = data;
            displayCases();
        })
        .catch((error) => showError("Failed to fetch cases: " + error.message));
}

// ✅ Display Cases
function displayCases() {
    let tableBody = document.getElementById("casesTable");
    tableBody.innerHTML = "";

    if (allCases.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center">No cases found</td></tr>`;
        return;
    }

    const startIndex = (currentPage - 1) * casesPerPage;
    const casesToDisplay = allCases.slice(startIndex, startIndex + casesPerPage);

    casesToDisplay.forEach((caseItem) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatDate(caseItem.date_received)}</td>
            <td>${caseItem.staff}</td>
            <td>${caseItem.mobile}</td>
            <td>${caseItem.name}</td>
            <td>${caseItem.work || "-"}</td>
            <td>${caseItem.info || "-"}</td>
            <td>${caseItem.pending || "-"}</td>
            <td>${caseItem.remarks || "-"}</td>
            <td>${caseItem.status}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteCase('${caseItem.id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById("pageIndicator").innerText = `Page ${currentPage} of ${Math.ceil(allCases.length / casesPerPage)}`;
}

// ✅ Change Page
function changePage(step) {
    let maxPage = Math.ceil(allCases.length / casesPerPage);
    if (currentPage + step > 0 && currentPage + step <= maxPage) {
        currentPage += step;
        displayCases();
    }
}

// ✅ Delete Case
function deleteCase(caseId) {
    if (!confirm("Are you sure you want to delete this case?")) return;

    fetch(`${API_URL}/delete-case/${caseId}`, { method: "DELETE" })
        .then(() => {
            showSuccess("Case deleted successfully!");
            fetchCases();
        })
        .catch((error) => showError("Error deleting case: " + error.message));
}

// ✅ Format Date
function formatDate(dateString) {
    if (!dateString) return "-";
    let date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
}

// ✅ Success/Error Messages
function showSuccess(message) {
    alert("✅ " + message);
}

function showError(message) {
    alert("❌ " + message);
}
