window.addEventListener("load", () => {
    const token = localStorage.getItem("token");
    const caseModal = document.getElementById("caseModal");
    const caseForm = document.getElementById("caseForm");
    const searchInput = document.getElementById("searchInput");
    const caseTableBody = document.getElementById("caseTableBody");
    const paginationContainer = document.getElementById("pagination");

    // Elements for form fields
    const caseFields = {
        name: document.getElementById("name"),
        mobile: document.getElementById("mobile"),
        altMobile: document.getElementById("altMobile"),
        work: document.getElementById("work"),
        frameSize: document.getElementById("frameSize"),
        frameColor: document.getElementById("frameColor"),
        requiredDetails: document.getElementById("requiredDetails"),
        advance: document.getElementById("advance"),
        actualPrice: document.getElementById("actualPrice"),
        status: document.getElementById("status")
    };

    // Utility to toggle modals
    const toggleModal = (open) => {
        if (open) caseModal.classList.remove('hidden');
        else caseModal.classList.add('hidden');
    };

    // Load cases
    const loadCases = async (search = "") => {
        try {
            showLoader(true);
            const res = await fetch(`https://backend-7l9n.onrender.com/cases?search=${search}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            renderCases(data.cases);
            setupPagination(data.totalPages);
        } catch (err) {
            showToast("Error loading cases", "error");
        } finally {
            showLoader(false);
        }
    };

    // Render cases to table
    const renderCases = (cases) => {
        caseTableBody.innerHTML = cases.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.mobile}</td>
                <td>${c.status}</td>
                <td><button onclick="editCase(${c.id})">Edit</button></td>
                <td><button onclick="deleteCase(${c.id})">Delete</button></td>
            </tr>
        `).join("");
    };

    // Setup pagination
    const setupPagination = (totalPages) => {
        paginationContainer.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            pageButton.onclick = () => loadCases("", i);
            paginationContainer.appendChild(pageButton);
        }
    };

    // Edit case
    window.editCase = (id) => {
        const caseToEdit = document.getElementById(`case-${id}`);
        populateForm(caseToEdit);
        toggleModal(true);
    };

    // Populate form with case data
    const populateForm = (caseData) => {
        for (const field in caseFields) {
            caseFields[field].value = caseData[field];
        }
    };

    // Add or update case
    caseForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            showLoader(true);
            const caseData = {};
            for (const field in caseFields) {
                caseData[field] = caseFields[field].value;
            }
            const res = await fetch("https://backend-7l9n.onrender.com/cases", {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(caseData)
            });
            const data = await res.json();
            showToast("Case saved successfully", "success");
            toggleModal(false);
            loadCases();
        } catch (err) {
            showToast("Error saving case", "error");
        } finally {
            showLoader(false);
        }
    });

    // Search functionality
    searchInput.addEventListener("input", () => {
        const query = searchInput.value;
        loadCases(query);
    });

    // Show loading spinner
    const showLoader = (show) => {
        const loader = document.getElementById("loader");
        if (loader) {
            if (show) loader.classList.remove('hidden');
            else loader.classList.add('hidden');
        }
    };

    // Show toast notifications
    const showToast = (message, type) => {
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.className = `toast ${type}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    loadCases();  // Load cases on page load
});
