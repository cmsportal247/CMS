document.addEventListener("DOMContentLoaded", function () {
    updateUI();
    showPage("cases"); // ✅ Default page on load
});

// ✅ Global Variables
let currentUser = null;
let allCases = [];
let currentPage = 1;
const casesPerPage = 10;

// ✅ Function to switch pages
function showPage(page) {
    document.querySelectorAll(".page").forEach((p) => p.style.display = "none");
    document.getElementById(page).style.display = "block";
}

// ✅ Fetch Cases from Backend (With Search Feature)
function fetchCases(searchQuery = "") {
    if (!currentUser) return;

    fetch(`http://localhost:4000/cases?search=${searchQuery}`)
        .then((response) => response.json())
        .then((data) => {
            allCases = data;
            currentPage = 1; // Reset to first page after search
            displayCases();
        })
        .catch((error) => showError("Error fetching cases: " + error.message));
}

// ✅ Display Cases with Pagination
function displayCases() {
    let tableBody = document.querySelector("#casesTable");
    tableBody.innerHTML = "";

    let startIndex = (currentPage - 1) * casesPerPage;
    let endIndex = startIndex + casesPerPage;
    let paginatedCases = allCases.slice(startIndex, endIndex);

    paginatedCases.forEach((caseItem) => {
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
                ${currentUser.role === "admin" ? 
                    `<button class="btn btn-danger btn-sm" onclick="deleteCase(${caseItem.id})">Delete</button>` : 
                    `<span class="text-muted">Restricted</span>`}
            </td>
        `;
        row.addEventListener("dblclick", () => openEditModal(caseItem));
        tableBody.appendChild(row);
    });

    document.getElementById("pageIndicator").innerText = `Page ${currentPage}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = endIndex >= allCases.length;
}

// ✅ Change Page (Next/Previous)
function changePage(step) {
    currentPage += step;
    displayCases();
}

// ✅ Search Cases (Linked to Search Bar)
document.getElementById("searchInput").addEventListener("input", function () {
    let searchQuery = this.value.trim();
    fetchCases(searchQuery);
});

// ✅ Open New Case Modal & Auto-Fill Date
function openNewCaseModal() {
    let today = new Date().toISOString().split("T")[0];
    document.getElementById("caseDate").value = today;

    let modal = new bootstrap.Modal(document.getElementById("newCaseModal"));
    modal.show();
}

// ✅ Handle Saving a New Case
document.getElementById("saveCaseBtn").addEventListener("click", function () {
    let caseData = {
        date_received: document.getElementById("caseDate").value,
        staff: document.getElementById("caseStaff").value,
        mobile: document.getElementById("caseMobile").value,
        name: document.getElementById("caseName").value,
        work: document.getElementById("caseWork").value,
        info: document.getElementById("caseInfo").value,
        pending: document.getElementById("casePending").value,
        remarks: document.getElementById("caseRemarks").value,
        status: document.getElementById("caseStatus").value,
    };

    if (!caseData.date_received || !caseData.staff || !caseData.mobile || !caseData.name || caseData.mobile.length !== 10) {
        showError("❌ Please fill all required fields correctly.");
        return;
    }

    fetch("http://localhost:4000/add-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData),
    })
    .then(() => {
        showSuccess("Case added successfully!");
        fetchCases();
        bootstrap.Modal.getInstance(document.getElementById("newCaseModal")).hide();
    })
    .catch((error) => showError("Error adding case: " + error.message));
});

// ✅ Delete Case Function
function deleteCase(caseId) {
    if (!confirm("Are you sure you want to delete this case?")) return;

    fetch(`http://localhost:4000/delete-case/${caseId}`, { method: "DELETE" })
        .then((response) => response.json())
        .then(() => {
            showSuccess("Case deleted successfully!");
            fetchCases();
        })
        .catch((error) => showError("Error deleting case: " + error.message));
}

// ✅ Open Edit Case Modal (Double Click on Row)
function openEditModal(caseItem) {
    document.getElementById("caseDate").value = caseItem.date_received;
    document.getElementById("caseStaff").value = caseItem.staff;
    document.getElementById("caseMobile").value = caseItem.mobile;
    document.getElementById("caseName").value = caseItem.name;
    document.getElementById("caseWork").value = caseItem.work;
    document.getElementById("caseInfo").value = caseItem.info;
    document.getElementById("casePending").value = caseItem.pending;
    document.getElementById("caseRemarks").value = caseItem.remarks;
    document.getElementById("caseStatus").value = caseItem.status;

    let modal = new bootstrap.Modal(document.getElementById("newCaseModal"));
    modal.show();
}

// ✅ Handle Login
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    fetch("http://localhost:4000/login", {
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

// ✅ Update UI Based on Role
function updateUI() {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));

    let loginForm = document.getElementById("loginForm");
    let appSection = document.getElementById("app");
    let welcomeText = document.getElementById("welcomeText");
    let logoutBtn = document.getElementById("logoutBtn");

    if (currentUser) {
        loginForm.style.display = "none";
        appSection.style.display = "block";
        welcomeText.innerText = `Welcome, ${currentUser.username} (${currentUser.role})`;
        logoutBtn.style.display = "block";
        fetchCases();
    } else {
        loginForm.style.display = "block";
        appSection.style.display = "none";
        logoutBtn.style.display = "none";
        welcomeText.innerText = "";
    }
}

// ✅ Logout
function logout() {
    localStorage.removeItem("currentUser");
    updateUI();
}

// ✅ Date Formatter (DD/MM/YYYY)
function formatDate(dateString) {
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
