document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    showPage("cases");
});

// ✅ Backend API URL (Update this with your latest Ngrok URL)
const BASE_URL = "https://5b0b-2405-201-c04c-a12a-75d8-6f7d-6499-de33.ngrok-free.app"; 

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
function fetchCases(searchQuery = "") {
    console.log("🔄 Fetching cases from:", `${BASE_URL}/cases?search=${encodeURIComponent(searchQuery)}`);

    fetch(`${BASE_URL}/cases?search=${encodeURIComponent(searchQuery)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("✅ Cases received:", data);
            allCases = data;
            displayCases();
        })
        .catch(error => {
            console.error("❌ Error fetching cases:", error);
            showError("❌ Failed to fetch cases. Check backend connection.");
        });
}

function displayCases() {
    let tableBody = document.getElementById("casesTable");
    tableBody.innerHTML = ""; // Clear previous data

    if (allCases.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center">No cases found</td></tr>`;
        return;
    }

    allCases.forEach((caseItem) => {
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
// ✅ Save New Case (Add Case)
function addCase() {
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

    // ✅ Validate Required Fields
    if (!caseData.date_received || !caseData.staff || !caseData.mobile || !caseData.name || caseData.mobile.length !== 10) {
        showError("❌ Please fill all required fields correctly.");
        return;
    }

    fetch(`${BASE_URL}/add-case`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.error) {
            showError(data.error);
        } else {
            showSuccess("✅Case added successfully!");
            fetchCases(); // Refresh case list
            bootstrap.Modal.getInstance(document.getElementById("addCaseModal")).hide(); // Close modal
        }
    })
    .catch((error) => showError("❌ Error adding case: " + error.message));
}
// ✅ Format Date (Fix Invalid Dates)
function formatDate(dateString) {
    if (!dateString) return "-"; // Handle missing dates
    let date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // Format as DD/MM/YYYY
}

// ✅ Success/Error Messages
function showSuccess(message) {
    alert("✅ " + message);
}

function showError(message) {
    alert("❌ " + message);
}
