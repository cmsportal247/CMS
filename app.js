const baseUrl = "https://backend-7l9n.onrender.com"; // Your backend API URL
const caseTable = document.getElementById("caseTable");
const caseList = document.getElementById("caseList");
const pagination = document.getElementById("pagination");
const caseModal = new bootstrap.Modal(document.getElementById('caseModal'));
const caseForm = document.getElementById("caseForm");
const loadingSpinner = document.getElementById("loadingSpinner");
const caseIdField = document.getElementById("caseId");
const nameField = document.getElementById("name");
const mobileField = document.getElementById("mobile");
const workField = document.getElementById("work");
const frameSizeField = document.getElementById("frameSize");
const frameColorField = document.getElementById("frameColor");
const statusField = document.getElementById("status");
const submitButton = document.getElementById("submitButton");

let currentPage = 1;
let totalPages = 1;

// Function to display the loading spinner
function toggleLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? "block" : "none";
}

// Fetch cases and update the table
async function fetchCases(page = 1) {
    toggleLoading(true);
    try {
        const res = await fetch(`${baseUrl}/cases?page=${page}`);
        const data = await res.json();
        totalPages = data.totalPages;
        renderCases(data.cases);
        renderPagination();
    } catch (error) {
        console.error("Error fetching cases:", error);
    } finally {
        toggleLoading(false);
    }
}

// Render cases in the table
function renderCases(cases) {
    caseList.innerHTML = "";
    cases.forEach((caseItem) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${caseItem.date}</td>
            <td>${caseItem.name}</td>
            <td>${caseItem.mobile}</td>
            <td>${caseItem.work}</td>
            <td>${caseItem.frameSize}</td>
            <td>${caseItem.frameColor}</td>
            <td>${caseItem.status}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editCase(${caseItem.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCase(${caseItem.id})">Delete</button>
            </td>
        `;
        caseList.appendChild(row);
    });
}

// Render pagination
function renderPagination() {
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement("li");
        pageItem.classList.add("page-item");
        pageItem.innerHTML = `<a class="page-link" href="#" onclick="fetchCases(${i})">${i}</a>`;
        pagination.appendChild(pageItem);
    }
}

// Open modal for adding new case
function addCase() {
    caseModal.show();
    caseIdField.value = "";
    nameField.value = "";
    mobileField.value = "";
    workField.value = "";
    frameSizeField.value = "";
    frameColorField.value = "";
    statusField.value = "Pending";
    submitButton.innerText = "Add Case";
}

// Open modal for editing existing case
async function editCase(id) {
    toggleLoading(true);
    try {
        const res = await fetch(`${baseUrl}/cases/${id}`);
        const data = await res.json();
        caseModal.show();
        caseIdField.value = data.id;
        nameField.value = data.name;
        mobileField.value = data.mobile;
        workField.value = data.work;
        frameSizeField.value = data.frameSize;
        frameColorField.value = data.frameColor;
        statusField.value = data.status;
        submitButton.innerText = "Update Case";
    } catch (error) {
        console.error("Error fetching case:", error);
    } finally {
        toggleLoading(false);
    }
}

// Handle add/edit form submission
caseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const caseData = {
        name: nameField.value,
        mobile: mobileField.value,
        work: workField.value,
        frameSize: frameSizeField.value,
        frameColor: frameColorField.value,
        status: statusField.value
    };

    toggleLoading(true);
    try {
        const method = caseIdField.value ? "PUT" : "POST";
        const url = caseIdField.value ? `${baseUrl}/cases/${caseIdField.value}` : `${baseUrl}/cases`;
        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(caseData)
        });
        const data = await res.json();
        caseModal.hide();
        fetchCases(currentPage);
        alert(data.message); // Displaying response message (success or failure)
    } catch (error) {
        console.error("Error saving case:", error);
    } finally {
        toggleLoading(false);
    }
});

// Delete case
async function deleteCase(id) {
    if (confirm("Are you sure you want to delete this case?")) {
        toggleLoading(true);
        try {
            await fetch(`${baseUrl}/cases/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchCases(currentPage);
        } catch (error) {
            console.error("Error deleting case:", error);
        } finally {
            toggleLoading(false);
        }
    }
}

// Generate Excel report
function generateExcelReport() {
    toggleLoading(true);
    fetch(`${baseUrl}/cases`)
        .then((res) => res.json())
        .then((data) => {
            const ws = XLSX.utils.json_to_sheet(data.cases);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Cases");
            XLSX.writeFile(wb, "cases_report.xlsx");
            toggleLoading(false);
        })
        .catch((error) => {
            console.error("Error generating report:", error);
            toggleLoading(false);
        });
}

// Fetch the initial list of cases
fetchCases();
