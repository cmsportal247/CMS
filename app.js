document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    showPage("cases");
});

// ✅ Backend API URL
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

// ✅ Open Edit Case Modal (Double Click)
function openEditCaseModal(caseId) {
    const selectedCase = allCases.find((c) => c.id === caseId);
    if (!selectedCase) return;

    document.getElementById("editCaseId").value = selectedCase.id;
    document.getElementById("editDateReceived").value = formatDate(selectedCase.date_received);
    document.getElementById("editStaff").value = selectedCase.staff || "";
    document.getElementById("editMobile").value = selectedCase.mobile || "";
    document.getElementById("editName").value = selectedCase.name || "";
    document.getElementById("editWork").value = selectedCase.work || "";
    document.getElementById("editInfo").value = selectedCase.info || "";
    document.getElementById("editPending").value = selectedCase.pending || "";
    document.getElementById("editRemarks").value = selectedCase.remarks || "";
    document.getElementById("editStatus").value = selectedCase.status || "";

    let modalElement = document.getElementById("editCaseModal");
    let modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// ✅ Update Case
function updateCase() {
    const caseId = document.getElementById("editCaseId").value;

    const updatedCase = {
        date_received: document.getElementById("editDateReceived").value,
        staff: document.getElementById("editStaff").value,
        mobile: document.getElementById("editMobile").value,
        name: document.getElementById("editName").value,
        work: document.getElementById("editWork").value,
        info: document.getElementById("editInfo").value,
        pending: document.getElementById("editPending").value,
        remarks: document.getElementById("editRemarks").value,
        status: document.getElementById("editStatus").value,
    };

    fetch(`${API_URL}/update-case/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCase),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showError(data.error);
            } else {
                showSuccess("Case updated successfully!");
                fetchCases();
            }
        })
        .catch((error) => showError("Error updating case: " + error.message));
}

// ✅ Update UI After Login
function updateUI() {
    currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

    if (currentUser && currentUser.username) {
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

// ✅ Fetch Cases (with Search)
function fetchCases(searchQuery = "") {
    fetch(`${API_URL}/cases?search=${encodeURIComponent(searchQuery)}`)
        .then((response) => response.json())
        .then((data) => {
            allCases = data;
            displayCases();
        })
        .catch((error) => {
            console.error("Failed to fetch cases:", error);
            showError("Failed to fetch cases: " + error.message);
        });
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

        row.ondblclick = () => openEditCaseModal(caseItem.id);
        tableBody.appendChild(row);
    });

    document.getElementById("pageIndicator").innerText = `Page ${currentPage} of ${Math.ceil(allCases.length / casesPerPage)}`;
}

// ✅ Delete Case
function deleteCase(caseId) {
    if (!confirm("Are you sure you want to delete this case?")) return;

    fetch(`${API_URL}/delete-case/${caseId}`, {
        method: "DELETE",
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showError(data.error);
            } else {
                showSuccess("Case deleted successfully!");
                fetchCases();
            }
        })
        .catch((error) => showError("Error deleting case: " + error.message));
}

// ✅ Change Password
function changePassword() {
    const oldPassword = document.getElementById("oldPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();

    fetch(`${API_URL}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser.username, oldPassword, newPassword }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showError(data.error);
            } else {
                showSuccess("Password changed successfully!");
            }
        })
        .catch((error) => showError("Error changing password: " + error.message));
}

// ✅ Success/Error Messages
function showSuccess(message) {
    alert("✅ " + message);
}

function showError(message) {
    alert("❌" + message);
}

// ✅ Format Date
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}
