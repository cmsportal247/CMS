const API_URL = "https://backend-7l9n.onrender.com";
let allCases = [];
let currentPage = 1;
const casesPerPage = 10;

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
        status: document.getElementById("addStatus").value
    };

    fetch(`${API_URL}/add-case`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase)
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

// 🟩 Open edit case modal
function openEditCaseModal(caseItem) {
    document.getElementById("editCaseId").value = caseItem.id;
    document.getElementById("editDateReceived").value = caseItem.date_received;
    document.getElementById("editStaff").value = caseItem.staff;
    document.getElementById("editMobile").value = caseItem.mobile;
    document.getElementById("editName").value = caseItem.name;
    document.getElementById("editWork").value = caseItem.work;
    document.getElementById("editInfo").value = caseItem.info;
    document.getElementById("editPending").value = caseItem.pending;
    document.getElementById("editRemarks").value = caseItem.remarks;
    document.getElementById("editStatus").value = caseItem.status;

    document.getElementById("editCaseModal").style.display = "block";
}

// 🟩 Update an existing case
function updateCase() {
    const updatedCase = {
        id: document.getElementById("editCaseId").value,
        date_received: document.getElementById("editDateReceived").value,
        staff: document.getElementById("editStaff").value,
        mobile: document.getElementById("editMobile").value,
        name: document.getElementById("editName").value,
        work: document.getElementById("editWork").value,
        info: document.getElementById("editInfo").value,
        pending: document.getElementById("editPending").value,
        remarks: document.getElementById("editRemarks").value,
        status: document.getElementById("editStatus").value
    };

    fetch(`${API_URL}/update-case`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCase)
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.error) {
            showError(data.error);
        } else {
            showSuccess("Case updated successfully!");
            fetchCases();
            closeModal();
        }
    })
    .catch((error) => showError("Error updating case: " + error.message));
}

// 🟩 Delete a case
function deleteCase(caseId) {
    if (confirm("Are you sure you want to delete this case?")) {
        fetch(`${API_URL}/delete-case/${caseId}`, {
            method: "DELETE"
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

// 🟩 Close modals
function closeModal() {
    document.getElementById("editCaseModal").style.display = "none";
}

// 🟩 Show success message
function showSuccess(message) {
    const successDiv = document.getElementById("successMessage");
    successDiv.innerText = message;
    successDiv.style.display = "block";
    setTimeout(() => successDiv.style.display = "none", 3000);
}

// 🟩 Show error message
function showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    errorDiv.innerText = message;
    errorDiv.style.display = "block";
    setTimeout(() => errorDiv.style.display = "none", 3000);
}

// 🟩 Initialize app
fetchCases();
