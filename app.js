// ✅ API Base URL (Render API)
const API_BASE_URL = "https://backend-7l9n.onrender.com"; 

// ✅ Pagination Settings
let currentPage = 1;
const casesPerPage = 10;

// ✅ Show Toast Notifications
function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ✅ Show Loading Spinner
function showLoading(show) {
    document.getElementById("loadingSpinner").style.display = show ? "block" : "none";
}

// ✅ Login Function
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        showToast("Please enter both username and password", "danger");
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        showLoading(false);

        if (response.ok) {
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            updateUI();
            showToast("Login successful!", "success");
        } else {
            showToast(result.error || "Invalid credentials", "danger");
        }
    } catch (error) {
        showLoading(false);
        showToast("Server error! Please try again.", "danger");
    }
}

// ✅ Logout Function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    updateUI();
    showToast("Logged out successfully!", "success");
}

// ✅ Update UI (Login/Logout)
function updateUI() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    document.getElementById("loginForm").style.display = token ? "none" : "block";
    document.getElementById("app").style.display = token ? "block" : "none";
    document.getElementById("logoutBtn").style.display = token ? "block" : "none";
    document.getElementById("welcomeText").innerText = token ? `Welcome, ${user.username}` : "";

    if (token) fetchCases();
}

// ✅ Fetch Cases with Pagination & Search
async function fetchCases(search = "", page = 1) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/cases?search=${search}&page=${page}&limit=${casesPerPage}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        showLoading(false);

        if (response.ok) {
            renderCases(result.cases);
            renderPagination(result.totalPages, page);
        } else {
            showToast("Failed to fetch cases!", "danger");
        }
    } catch (error) {
        showLoading(false);
        showToast("Error fetching cases!", "danger");
    }
}

// ✅ Render Cases in Table
function renderCases(cases) {
    const tableBody = document.getElementById("casesTableBody");
    tableBody.innerHTML = "";

    cases.forEach((caseData) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${caseData.date_received}</td>
            <td>${caseData.staff}</td>
            <td>${caseData.mobile}</td>
            <td>${caseData.name}</td>
            <td>${caseData.work}</td>
            <td>${caseData.info}</td>
            <td>${caseData.status}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editCase('${caseData.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="confirmDelete('${caseData.id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ✅ Render Pagination
function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.innerHTML += `
            <li class="page-item ${i === currentPage ? "active" : ""}">
                <a class="page-link" href="#" onclick="fetchCases('', ${i})">${i}</a>
            </li>
        `;
    }
}

// ✅ Confirm Delete Case
function confirmDelete(caseId) {
    document.getElementById("confirmDeleteBtn").onclick = function() {
        deleteCase(caseId);
    };
    new bootstrap.Modal(document.getElementById("deleteCaseModal")).show();
}

// ✅ Delete Case
async function deleteCase(caseId) {
    const token = localStorage.getItem("token");

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/delete-case/${caseId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        showLoading(false);

        if (response.ok) {
            fetchCases();
            showToast("Case deleted successfully!", "success");
        } else {
            showToast("Failed to delete case!", "danger");
        }
    } catch (error) {
        showLoading(false);
        showToast("Error deleting case!", "danger");
    }
}

// ✅ Export Reports to Excel
function exportToExcel() {
    const token = localStorage.getItem("token");

    window.open(`${API_BASE_URL}/export-excel`, "_blank");
}

// ✅ Auto-fill Current Date for New Case
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("caseDate").value = new Date().toISOString().split("T")[0];
});

// ✅ Initialize UI on Page Load
updateUI();
