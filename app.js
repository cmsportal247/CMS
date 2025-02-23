const API_URL = "https://backend-7l9n.onrender.com";
let allCases = [];
let currentPage = 1;
const casesPerPage = 10;

// 🟩 Login function
function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            showSuccess("Login successful!");
            updateUI(); // Refresh UI after login
        } else {
            showError("Invalid username or password");
        }
    })
    .catch((error) => showError("Login failed: " + error.message));
}

// 🟩 Update UI after login
function updateUI() {
    const token = localStorage.getItem("token");
    if (token) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("appSection").style.display = "block";
        fetchCases();
    } else {
        document.getElementById("loginSection").style.display = "block";
        document.getElementById("appSection").style.display = "none";
    }
}

// 🟩 Fetch all cases
function fetchCases() {
    fetch(`${API_URL}/cases`)
        .then((response) => response.json())
        .then((data) => {
            allCases = data;
            displayCases();
        })
        .catch((error) => showError("Error fetching cases: " + error.message));
}

// 🟩 Display cases with pagination
function displayCases() {
    const start = (currentPage - 1) * casesPerPage;
    const end = start + casesPerPage;
    const paginatedCases = allCases.slice(start, end);

    const tableBody = document.getElementById("caseTableBody");
    if (!tableBody) {
        console.error("caseTableBody element not found!");
        return;
    }
    tableBody.innerHTML = "";

    paginatedCases.forEach((caseItem) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${caseItem.date_received}</td>
            <td>${caseItem.staff}</td>
            <td>${caseItem.mobile}</td>
            <td>${caseItem.name}</td>
            <td>${caseItem.work}</td>
            <td>${caseItem.info}</td>
            <td>${caseItem.pending}</td>
            <td>${caseItem.remarks}</td>
            <td>${caseItem.status}</td>
            <td><button onclick="deleteCase('${caseItem.id}')">Delete</button></td>
        `;
        row.ondblclick = () => openEditCaseModal(caseItem);
    });

    updatePaginationControls();
}

// 🟩 Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(allCases.length / casesPerPage);
    document.getElementById("pageInfo").innerText = `Page ${currentPage} of ${totalPages}`;
}

// 🟩 Change page
function changePage(direction) {
    const totalPages = Math.ceil(allCases.length / casesPerPage);
    currentPage += direction;

    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    displayCases();
}

// 🟩 Add a new case
function addCase() {
    const newCase = {
        date_received: document.getElementById("addDateReceived").value,
        staff: document.getElementById("addStaff").value,
        mobile: document.getElementById("addMobile").value,
        name: document.getElementById("addName").value,
        work: document.getElementById("addWork").value,
        info: document.getElementById("addInfo").value,
        pending: document.getElementById("addPending").value,
        remarks: document.getElementById("addRemarks").value,
        status: document.getElementById("addStatus").value,
    };

    fetch(`${API_URL}/add-case`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.error) {
            showError(data.error);
        } else {
            showSuccess("Case added successfully!");
            fetchCases();
        }
    })
    .catch((error) => showError("Error adding case: " + error.message));
}

// 🟩 Delete a case
function deleteCase(caseId) {
    if (confirm("Are you sure you want to delete this case?")) {
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
}

// 🟩 Show success message
function showSuccess(message) {
    const successDiv = document.getElementById("successMessage");
    if (successDiv) {
        successDiv.innerText = message;
        successDiv.style.display = "block";
        setTimeout(() => successDiv.style.display = "none", 3000);
    } else {
        console.warn("Success message element not found!");
    }
}

// 🟩 Show error message
function showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
        errorDiv.innerText = message;
        errorDiv.style.display = "block";
        setTimeout(() => errorDiv.style.display = "none", 3000);
    } else {
        console.warn("Error message element not found!");
    }
}

// 🟩 Initialize app
updateUI();
