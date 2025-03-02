const apiBaseUrl = "https://backend-7l9n.onrender.com"; // Your live backend API
let currentPage = 1;

// ✅ Check token & handle login/logout state
function checkAndHandleToken() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("appSection").style.display = "block";
        document.getElementById("logoutBtn").style.display = "inline-block";
        document.getElementById("welcomeText").innerText = `Welcome, ${username}`;
        showSection("casesSection"); // Show Cases by default
        fetchCases();
    } else {
        document.getElementById("loginSection").style.display = "block";
        document.getElementById("appSection").style.display = "none";
        document.getElementById("logoutBtn").style.display = "none";
    }
}

// ✅ Toast message function
function showToast(message) {
    const toastMessage = document.getElementById("toastMessage");
    const toast = new bootstrap.Toast(document.getElementById("toast"));

    if (toastMessage) {
        toastMessage.innerText = message;
        toast.show();
    }
}

// ✅ Login function
async function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${apiBaseUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", username);
            showToast("Login successful!");
            checkAndHandleToken();
        } else {
            showToast(data.message || "Invalid credentials");
        }
    } catch (error) {
        showToast("Login failed. Try again.");
    }
}

// ✅ Logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    showToast("Logged out successfully!");
    checkAndHandleToken();
}

// ✅ Show sections
function showSection(sectionId) {
    document.getElementById("casesSection").style.display = "none";
    document.getElementById("reportsSection").style.display = "none";
    document.getElementById("settingsSection").style.display = "none";
    document.getElementById(sectionId).style.display = "block";
}

// ✅ Fetch Cases with pagination & search
async function fetchCases() {
    const token = localStorage.getItem("token");
    const searchQuery = document.getElementById("searchInput").value || "";

    try {
        const response = await fetch(`${apiBaseUrl}/cases?page=${currentPage}&search=${searchQuery}`, {
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
            const cases = await response.json();
            renderCasesTable(cases);
        } else {
            showToast("Failed to fetch cases");
        }
    } catch (error) {
        showToast("Error fetching cases");
    }
}

// ✅ Render cases in the table
function renderCasesTable(cases) {
    const table = document.getElementById("casesTable");
    table.innerHTML = "";

    if (cases.length === 0) {
        table.innerHTML = "<tr><td colspan='8'>No cases found.</td></tr>";
        return;
    }

    cases.forEach((c) => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${c.dateReceived}</td>
            <td>${c.staff}</td>
            <td>${c.mobile}</td>
            <td>${c.name}</td>
            <td>${c.work}</td>
            <td>${c.remarks}</td>
            <td>${c.status}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editCase('${c._id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCase('${c._id}')">Delete</button>
            </td>
        `;
    });
}

// ✅ Add Case
async function addCase() {
    const token = localStorage.getItem("token");

    const caseData = {
        dateReceived: document.getElementById("caseDate").value,
        staff: document.getElementById("caseStaff").value,
        mobile: document.getElementById("caseMobile").value,
        name: document.getElementById("caseName").value,
        work: document.getElementById("caseWork").value,
        remarks: document.getElementById("caseRemarks").value,
        status: document.getElementById("caseStatus").value,
    };

    try {
        const response = await fetch(`${apiBaseUrl}/add-case`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(caseData),
        });

        if (response.ok) {
            showToast("Case added successfully!");
            fetchCases();
        } else {
            showToast("Failed to add case.");
        }
    } catch (error) {
        showToast("Error adding case.");
    }
}

// ✅ Pagination controls
function changePage(offset) {
    currentPage += offset;
    if (currentPage < 1) currentPage = 1;
    fetchCases();
}

// ✅ Export reports to Excel
function exportToExcel() {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    window.open(`${apiBaseUrl}/export-excel?from=${fromDate}&to=${toDate}`, "_blank");
}

// ✅ Change password
async function changePassword() {
    const token = localStorage.getItem("token");
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        showToast("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ oldPassword, newPassword }),
        });

        if (response.ok) {
            showToast("Password changed successfully!");
        } else {
            showToast("Failed to change password.");
        }
    } catch (error) {
        showToast("Error changing password.");
    }
}
