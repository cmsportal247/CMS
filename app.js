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

    // ✅ Ensure saveCaseBtn exists before adding an event listener
    const saveCaseBtn = document.getElementById("saveCaseBtn");
    if (saveCaseBtn) {
        saveCaseBtn.addEventListener("click", saveCase);
    }
});

// ✅ Global Variables
let currentUser = null;
let allCases = [];
let currentPage = 1;
const casesPerPage = 10;

// ✅ Correct Backend API URL (Use your ngrok link)
const BASE_URL = "https://2237-2405-201-c04c-a12a-75d8-6f7d-6499-de33.ngrok-free.app";

// ✅ Function to switch pages
function showPage(page) {
    document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
    document.getElementById(page).style.display = "block";
}

// ✅ Fetch Cases from Backend (With Search Feature)
function fetchCases(searchQuery = "") {
    if (!currentUser) return;

    fetch(`${BASE_URL}/cases?search=${encodeURIComponent(searchQuery)}`)
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

// ✅ Save a New Case
function saveCase() {
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

    fetch(`${BASE_URL}/add-case`, {
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
