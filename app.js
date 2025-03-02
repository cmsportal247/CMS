const apiBaseUrl = "https://backend-7l9n.onrender.com";
let currentPage = 1;

function showToast(message) {
    const toastElement = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toastMessage.innerText = message;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

function checkAndHandleToken() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("appSection").style.display = "block";
        document.getElementById("welcomeText").innerText = `Welcome, ${username}`;
        fetchCases();
    } else {
        document.getElementById("loginSection").style.display = "block";
        document.getElementById("appSection").style.display = "none";
    }
}

async function login() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

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
}

function logout() {
    localStorage.clear();
    showToast("Logged out!");
    checkAndHandleToken();
}

async function fetchCases() {
    const token = localStorage.getItem("token");
    const searchQuery = document.getElementById("searchInput").value;

    const response = await fetch(`${apiBaseUrl}/cases?page=${currentPage}&search=${searchQuery}`, {
        headers: { "Authorization": `Bearer ${token}` },
    });

    if (response.ok) {
        const cases = await response.json();
        renderCasesTable(cases);
    } else {
        showToast("Failed to fetch cases");
    }
}

function renderCasesTable(cases) {
    const table = document.getElementById("casesTable");
    table.innerHTML = "";
    cases.forEach((c) => {
        table.innerHTML += `
            <tr>
                <td>${c.dateReceived}</td>
                <td>${c.staff}</td>
                <td>${c.mobile}</td>
                <td>${c.name}</td>
                <td>${c.work}</td>
                <td>${c.remarks}</td>
                <td>${c.status}</td>
                <td>
                    <button class="btn btn-warning" onclick="editCase('${c._id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteCase('${c._id}')">Delete</button>
                </td>
            </tr>`;
    });
}

async function deleteCase(id) {
    const token = localStorage.getItem("token");
    await fetch(`${apiBaseUrl}/delete-case/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
    });
    showToast("Case deleted!");
    fetchCases();
}

function changePage(offset) {
    currentPage += offset;
    fetchCases();
}
