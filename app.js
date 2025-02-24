const API_URL = "https://backend-7l9n.onrender.com";

let currentPage = 1;
let pageSize = 10;

// ✅ Show/Hide pages
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) selectedPage.style.display = 'block';
}

// ✅ Login function
function login() {
    const username = document.getElementById("username")?.value;
    const password = document.getElementById("password")?.value;

    if (!username || !password) {
        showError("Please enter username and password");
        return;
    }

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", username);
            showSuccess("Login successful!");
            updateUI();
        } else {
            showError("Invalid credentials");
        }
    })
    .catch(err => showError("Login failed: " + err.message));
}

// ✅ Logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    updateUI();
    showSuccess("Logged out successfully");
}

// ✅ Update UI based on login
function updateUI() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const loginForm = document.getElementById("loginForm");
    const appSection = document.getElementById("app");
    const logoutBtn = document.getElementById("logoutBtn");
    const welcomeText = document.getElementById("welcomeText");

    if (token) {
        loginForm.style.display = "none";
        appSection.style.display = "block";
        logoutBtn.style.display = "block";
        welcomeText.innerText = `Welcome, ${username || 'User'}`;
        fetchCases();
    } else {
        loginForm.style.display = "block";
        appSection.style.display = "none";
        logoutBtn.style.display = "none";
        welcomeText.innerText = "";
    }
}

// ✅ Fetch and display cases
function fetchCases(query = "") {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/cases?search=${query}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => renderCases(data))
    .catch(err => showError("Failed to fetch cases: " + err.message));
}

// ✅ Render cases in the table
function renderCases(cases) {
    const casesTable = document.getElementById("casesTable");
    if (!casesTable) return;

    casesTable.innerHTML = "";

    const start = (currentPage - 1) * pageSize;
    const paginatedCases = cases.slice(start, start + pageSize);

    paginatedCases.forEach((caseData) => {
        const row = casesTable.insertRow();
        row.innerHTML = `
            <td>${caseData.date}</td>
            <td>${caseData.staff}</td>
            <td>${caseData.mobile}</td>
            <td>${caseData.name}</td>
            <td>${caseData.work}</td>
            <td>${caseData.info}</td>
            <td>${caseData.pending}</td>
            <td>${caseData.remarks}</td>
            <td>${caseData.status}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEditCaseModal('${caseData.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCase('${caseData.id}')">Delete</button>
            </td>
        `;
    });

    document.getElementById("pageIndicator").innerText = `Page ${currentPage}`;
}

// ✅ Pagination
function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    fetchCases();
}

// ✅ Add new case (with modal)
function addCase() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newCase = {
        date: document.getElementById("caseDate").value,
        staff: document.getElementById("caseStaff").value,
        mobile: document.getElementById("caseMobile").value,
        name: document.getElementById("caseName").value,
        work: document.getElementById("caseWork").value,
        info: document.getElementById("caseInfo").value,
        pending: document.getElementById("casePending").value,
        remarks: document.getElementById("caseRemarks").value,
        status: document.getElementById("caseStatus").value
    };

    fetch(`${API_URL}/add-case`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newCase)
    })
    .then(res => res.json())
    .then(() => {
        showSuccess("Case added successfully");
        closeAddCaseModal();
        fetchCases();
    })
    .catch(err => showError("Failed to add case: " + err.message));
}

// ✅ Edit case (open modal)
function openEditCaseModal(caseId) {
    alert(`Open edit modal for case ID: ${caseId}`);
    // You can load the case details and pre-fill the form here
}

// ✅ Delete case
function deleteCase(caseId) {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (confirm("Are you sure you want to delete this case?")) {
        fetch(`${API_URL}/delete-case/${caseId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(() => {
            showSuccess("Case deleted successfully");
            fetchCases();
        })
        .catch(err => showError("Failed to delete case: " + err.message));
    }
}

// ✅ Modal handling
function openAddCaseModal() {
    document.getElementById("addCaseModal").style.display = "block";
}

function closeAddCaseModal() {
    document.getElementById("addCaseModal").style.display = "none";
}

// ✅ Success and error messages
function showSuccess(message) {
    alert(message);
}

function showError(message) {
    alert("Error: " + message);
}

// ✅ Initialize UI
window.onload = updateUI;
