const apiBaseUrl = "https://backend-7l9n.onrender.com";
let token = localStorage.getItem("token") || "";
let currentPage = 1;
let currentEditingCaseId = null;
let casesList = [];
const pageSize = 10;

const loadingSpinner = document.getElementById("loadingSpinner");

// -------------------
// Toast Utility
// -------------------
function showToast(message) {
  const toastMsgEl = document.getElementById("toastMessage");
  if (toastMsgEl) {
    toastMsgEl.innerText = message;
    const toastEl = document.getElementById("toast");
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// -------------------
// Loading Spinner
// -------------------
function showLoading() {
  loadingSpinner.style.display = "block";
}
function hideLoading() {
  loadingSpinner.style.display = "none";
}

// -------------------
// Fetch & Render Cases
// -------------------
async function fetchCases() {
  showLoading();
  try {
    const res = await fetch(`${apiBaseUrl}/cases`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    casesList = data.reverse();
    renderCases();
  } catch (error) {
    console.error("❌ Error fetching cases:", error);
    showToast("Failed to fetch cases.");
  } finally {
    hideLoading();
  }
}

function renderCases() {
  const tbody = document.getElementById("caseTableBody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const currentCases = casesList.slice(start, end);

  currentCases.forEach((c, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${start + index + 1}</td>
      <td>${c.date}</td>
      <td>${c.name}</td>
      <td>${c.mobile}</td>
      <td>${c.altMobile}</td>
      <td>${c.work}</td>
      <td>${c.frameSize}</td>
      <td>${c.frameColor}</td>
      <td>${c.requiredDetails}</td>
      <td>${c.advance}</td>
      <td>${c.actualPrice}</td>
      <td>${c.status}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editCase('${c.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCase('${c.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination();
}

// -------------------
// Pagination
// -------------------
function renderPagination() {
  const totalPages = Math.ceil(casesList.length / pageSize);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.onclick = () => {
      currentPage = i;
      renderCases();
    };
    pagination.appendChild(li);
  }
}

// -------------------
// Add / Update Case
// -------------------
document.getElementById("caseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const caseData = {
    date: form.date.value,
    name: form.name.value,
    mobile: form.mobile.value,
    altMobile: form.altMobile.value,
    work: form.work.value,
    frameSize: form.frameSize.value,
    frameColor: form.frameColor.value,
    requiredDetails: form.requiredDetails.value,
    advance: form.advance.value,
    actualPrice: form.actualPrice.value,
    status: form.status.value,
  };

  try {
    const url = currentEditingCaseId
      ? `${apiBaseUrl}/update-case/${currentEditingCaseId}`
      : `${apiBaseUrl}/add-case`;
    const method = currentEditingCaseId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(caseData),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message);
      form.reset();
      currentEditingCaseId = null;
      fetchCases();
    } else {
      showToast(data.error || "Something went wrong");
    }
  } catch (error) {
    console.error("❌ Error submitting case:", error);
    showToast("Failed to save case.");
  }
});

// -------------------
// Edit Case
// -------------------
function editCase(id) {
  const c = casesList.find((item) => item.id === id);
  if (!c) return;

  currentEditingCaseId = id;

  const form = document.getElementById("caseForm");
  form.date.value = c.date;
  form.name.value = c.name;
  form.mobile.value = c.mobile;
  form.altMobile.value = c.altMobile;
  form.work.value = c.work;
  form.frameSize.value = c.frameSize;
  form.frameColor.value = c.frameColor;
  form.requiredDetails.value = c.requiredDetails;
  form.advance.value = c.advance;
  form.actualPrice.value = c.actualPrice;
  form.status.value = c.status;

  window.scrollTo(0, 0);
}

// -------------------
// Delete Case
// -------------------
async function deleteCase(id) {
  if (!confirm("Are you sure you want to delete this case?")) return;

  try {
    const res = await fetch(`${apiBaseUrl}/delete-case/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message);
      fetchCases();
    } else {
      showToast(data.error);
    }
  } catch (error) {
    console.error("❌ Error deleting case:", error);
    showToast("Failed to delete case.");
  }
}

// -------------------
// Search Case
// -------------------
document.getElementById("searchInput").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const filtered = casesList.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.mobile.includes(query) ||
      c.altMobile.includes(query) ||
      c.work.toLowerCase().includes(query) ||
      c.status.toLowerCase().includes(query)
  );
  const tbody = document.getElementById("caseTableBody");
  tbody.innerHTML = "";

  filtered.forEach((c, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${c.date}</td>
      <td>${c.name}</td>
      <td>${c.mobile}</td>
      <td>${c.altMobile}</td>
      <td>${c.work}</td>
      <td>${c.frameSize}</td>
      <td>${c.frameColor}</td>
      <td>${c.requiredDetails}</td>
      <td>${c.advance}</td>
      <td>${c.actualPrice}</td>
      <td>${c.status}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editCase('${c.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCase('${c.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
});

// -------------------
// Init
// -------------------
window.onload = () => {
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  fetchCases();
};
