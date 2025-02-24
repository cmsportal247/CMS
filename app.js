// 🚀 Set the API URL
const API_URL = "https://backend-7l9n.onrender.com"; // Update with your actual backend URL

// 🚀 Handle page load
document.addEventListener("DOMContentLoaded", () => {
        updateNavbar();
        fetchCases();
 
});

// 🚀 Update Navbar
function updateNavbar() {
    const authButtons = document.getElementById("auth-buttons");
    const username = localStorage.getItem("username");

    if (authButtons && username) {
        authButtons.innerHTML = `
            <span>Welcome, ${username}!</span>
            <button onclick="logout()" class="btn btn-danger">Logout</button>
        `;
    }
}

// 🚀 Login function
function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (!usernameInput || !passwordInput) {
        alert("Login fields not found!");
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert("Please enter both username and password!");
        return;
    }

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("role", data.user.role);
            window.location.href = "index.html";
        } else {
            alert("Invalid credentials. Please try again.");
        }
    })
    .catch(error => console.error("Login failed:", error));
}

// 🚀 Logout function
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// 🚀 Fetch cases from the backend
function fetchCases(query = "", page = 1, pageSize = 10) {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/cases?search=${query}&page=${page}&pageSize=${pageSize}`, {
        headers: { "Authorization": `Bearer ${token}` },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch cases");
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem("cases", JSON.stringify(data.cases)); // Store cases locally
        renderCases(data.cases);
        updatePagination(data.totalPages, page);
    })
    .catch(error => console.error("Failed to fetch cases:", error));
}

// 🚀 Render cases in the table
function renderCases(cases) {
    const tableBody = document.getElementById("cases-table-body");
    if (!tableBody) {
        console.error("Table body element not found!");
        return;
    }

    tableBody.innerHTML = "";

    cases.forEach((caseItem, index) => {
        const row = `
            <tr ondblclick="openEditModal(${index})">
                <td>${caseItem.date || ''}</td>
                <td>${caseItem.staff || ''}</td>
                <td>${caseItem.mobile || ''}</td>
                <td>${caseItem.name || ''}</td>
                <td>${caseItem.work || ''}</td>
                <td>${caseItem.info || ''}</td>
                <td>${caseItem.pending || ''}</td>
                <td>${caseItem.remarks || ''}</td>
                <td>${caseItem.status || ''}</td>
                ${localStorage.getItem("role") === "admin" ? `
                    <td>
                        <button class="btn btn-warning" onclick="openEditModal(${index})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteCase('${caseItem.id}')">Delete</button>
                    </td>` : ""}
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// 🚀 Pagination
function updatePagination(totalPages, currentPage) {
    const paginationElement = document.getElementById("pagination");
    if (!paginationElement) return;

    paginationElement.innerHTML = `
        <button ${currentPage === 1 ? "disabled" : ""} onclick="changePage(-1)">Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(1)">Next</button>
    `;
}

let currentPage = 1;

function changePage(direction) {
    currentPage += direction;
    fetchCases("", currentPage);
}

// 🚀 Add new case
function addCase() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const caseData = {
        date: document.getElementById("date")?.value || "",
        staff: document.getElementById("staff")?.value || "",
        mobile: document.getElementById("mobile")?.value || "",
        name: document.getElementById("name")?.value || "",
        work: document.getElementById("work")?.value || "",
        info: document.getElementById("info")?.value || "",
        pending: document.getElementById("pending")?.value || "",
        remarks: document.getElementById("remarks")?.value || "",
        status: document.getElementById("status")?.value || "",
    };

    if (!caseData.name || !caseData.mobile || !caseData.staff || !caseData.date) {
        alert("Please fill in all required fields (Date, Staff, Mobile, Name).");
        return;
    }

    fetch(`${API_URL}/add-case`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(caseData),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Case added successfully!");
        fetchCases();
    })
    .catch(error => console.error("Failed to add case:", error));
}

// 🚀 Delete case
function deleteCase(caseId) {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (confirm("Are you sure you want to delete this case?")) {
        fetch(`${API_URL}/delete-case/${caseId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || "Case deleted successfully!");
            fetchCases();
        })
        .catch(error => console.error("Failed to delete case:", error));
    }
}

// 🚀 Open edit modal
function openEditModal(index) {
    const cases = JSON.parse(localStorage.getItem("cases")) || [];
    const caseItem = cases[index];

    if (caseItem) {
        document.getElementById("edit-date").value = caseItem.date || "";
        document.getElementById("edit-staff").value = caseItem.staff || "";
        document.getElementById("edit-mobile").value = caseItem.mobile || "";
        document.getElementById("edit-name").value = caseItem.name || "";
        document.getElementById("edit-work").value = caseItem.work || "";
        document.getElementById("edit-info").value = caseItem.info || "";
        document.getElementById("edit-pending").value = caseItem.pending || "";
        document.getElementById("edit-remarks").value = caseItem.remarks || "";
        document.getElementById("edit-status").value = caseItem.status || "";

        const modal = new bootstrap.Modal(document.getElementById("editModal"));
        modal.show();
    } else {
        alert("Case not found!");
    }
}
