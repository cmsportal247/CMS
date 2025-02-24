document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://your-render-backend-url.onrender.com"; // Update with your Render backend URL
    const token = localStorage.getItem("token");

    // 🚀 Check if user is logged in
    if (token) {
        document.getElementById("auth-buttons").innerHTML = `
            <span>Welcome, ${localStorage.getItem("username")}!</span>
            <button onclick="logout()" class="btn btn-danger">Logout</button>
        `;
        fetchCases();
    } else {
        window.location.href = "login.html";
    }
});

// 🚀 Login function
function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

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
function fetchCases() {
    fetch(`${API_URL}/cases`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    })
    .then(response => response.json())
    .then(cases => renderCases(cases))
    .catch(error => console.error("Failed to fetch cases:", error));
}

// 🚀 Render cases in the table
function renderCases(cases) {
    const tableBody = document.getElementById("cases-table-body");
    tableBody.innerHTML = "";

    cases.forEach((caseItem, index) => {
        const row = `
            <tr ondblclick="openEditModal(${index})">
                <td>${caseItem.date}</td>
                <td>${caseItem.staff}</td>
                <td>${caseItem.mobile}</td>
                <td>${caseItem.name}</td>
                <td>${caseItem.work}</td>
                <td>${caseItem.info}</td>
                <td>${caseItem.pending}</td>
                <td>${caseItem.remarks}</td>
                <td>${caseItem.status}</td>
                ${localStorage.getItem("role") === "admin" ? `
                    <td>
                        <button class="btn btn-danger" onclick="deleteCase('${caseItem.id}')">Delete</button>
                    </td>` : ""}
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// 🚀 Add new case
function addCase() {
    const caseData = {
        date: document.getElementById("date").value,
        staff: document.getElementById("staff").value,
        mobile: document.getElementById("mobile").value,
        name: document.getElementById("name").value,
        work: document.getElementById("work").value,
        info: document.getElementById("info").value,
        pending: document.getElementById("pending").value,
        remarks: document.getElementById("remarks").value,
        status: document.getElementById("status").value,
    };

    fetch(`${API_URL}/add-case`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(caseData),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchCases();
    })
    .catch(error => console.error("Failed to add case:", error));
}

// 🚀 Delete case
function deleteCase(caseId) {
    if (confirm("Are you sure you want to delete this case?")) {
        fetch(`${API_URL}/delete-case/${caseId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchCases();
        })
        .catch(error => console.error("Failed to delete case:", error));
    }
}
