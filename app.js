document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    showPage("cases");
});

const BASE_URL = "https://your-ngrok-url.ngrok-free.app"; 

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

// ✅ Fetch Cases
function fetchCases(searchQuery = "") {
    fetch(`${BASE_URL}/cases?search=${encodeURIComponent(searchQuery)}`)
        .then((response) => response.json())
        .then((data) => {
            allCases = data;
            displayCases();
        })
        .catch((error) => console.error("❌ Error fetching cases:", error));
}

// ✅ Display Cases with Pagination
function displayCases() {
    let tableBody = document.getElementById("casesTable");
    tableBody.innerHTML = "";
    let start = (currentPage - 1) * casesPerPage;
    let end = start + casesPerPage;
    allCases.slice(start, end).forEach((caseItem) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${caseItem.date_received}</td>
            <td>${caseItem.staff}</td>
            <td>${caseItem.mobile}</td>
            <td>${caseItem.name}</td>
            <td>${caseItem.work}</td>
            <td>${caseItem.pending}</td>
            <td>${caseItem.remarks}</td>
            <td>${caseItem.status}</td>
            <td>
                <button onclick="deleteCase(${caseItem.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ✅ Logout Function
function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}
