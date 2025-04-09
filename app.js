const API_BASE = "https://backend-7l9n.onrender.com";
let token = localStorage.getItem("token");

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const caseModal = document.getElementById("caseModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const caseForm = document.getElementById("caseForm");
const caseTableBody = document.querySelector("#caseTable tbody");
const modalTitle = document.getElementById("modalTitle");

// Tab Buttons
const casesTab = document.getElementById("casesTab");
const reportsTab = document.getElementById("reportsTab");
const settingsTab = document.getElementById("settingsTab");
const casesSection = document.getElementById("casesSection");
const reportsSection = document.getElementById("reportsSection");
const settingsSection = document.getElementById("settingsSection");

// Check login
if (!token) {
  window.location.reload(); // Or redirect to login if needed
} else {
  loadCases();
}

// Tab Switching
function switchTab(activeTab) {
  [casesTab, reportsTab, settingsTab].forEach(tab => tab.classList.remove("active-tab"));
  [casesSection, reportsSection, settingsSection].forEach(section => section.classList.add("hidden"));

  if (activeTab === "cases") {
    casesTab.classList.add("active-tab");
    casesSection.classList.remove("hidden");
  } else if (activeTab === "reports") {
    reportsTab.classList.add("active-tab");
    reportsSection.classList.remove("hidden");
  } else {
    settingsTab.classList.add("active-tab");
    settingsSection.classList.remove("hidden");
  }
}

casesTab.onclick = () => switchTab("cases");
reportsTab.onclick = () => switchTab("reports");
settingsTab.onclick = () => switchTab("settings");

// Logout
logoutBtn.onclick = () => {
  localStorage.removeItem("token");
  window.location.reload();
};

// Open Modal for New Case
openAddModalBtn.onclick = () => {
  modalTitle.textContent = "Add Case";
  caseForm.reset();
  document.getElementById("caseId").value = "";
  caseModal.classList.remove("hidden");
};

// Close Modal
closeModalBtn.onclick = () => caseModal.classList.add("hidden");

// Save Case (Add or Edit)
caseForm.onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(caseForm);
  const caseId = formData.get("caseId");
  const data = Object.fromEntries(formData.entries());

  const url = caseId
    ? `${API_BASE}/cases/${caseId}`
    : `${API_BASE}/cases`;
  const method = caseId ? "PUT" : "POST";

  try {
    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    });
    caseModal.classList.add("hidden");
    loadCases();
  } catch (err) {
    alert("Error saving case.");
    console.error(err);
  }
};

// Load All Cases
async function loadCases() {
  try {
    const res = await fetch(`${API_BASE}/cases`, {
      headers: { Authorization: "Bearer " + token },
    });
    const cases = await res.json();

    caseTableBody.innerHTML = "";
    cases.forEach((c) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.id || ""}</td>
        <td>${c.date || ""}</td>
        <td>${c.name || ""}</td>
        <td>${c.mobile || ""}</td>
        <td>${c.altMobile || ""}</td>
        <td>${c.work || ""}</td>
        <td>${c.frameSize || ""}</td>
        <td>${c.frameColor || ""}</td>
        <td>${c.requiredDetails || ""}</td>
        <td>${c.advance || ""}</td>
        <td>${c.actualPrice || ""}</td>
        <td>${c.status || ""}</td>
        <td class="space-x-2">
          <button onclick='editCase(${JSON.stringify(c)})' class="text-blue-600 hover:underline">Edit</button>
          <button onclick='deleteCase("${c.id}")' class="text-red-600 hover:underline">Delete</button>
        </td>
      `;
      caseTableBody.appendChild(row);
    });
  } catch (err) {
    alert("Error loading cases.");
    console.error(err);
  }
}

// Edit Case
function editCase(c) {
  modalTitle.textContent = "Edit Case";
  caseModal.classList.remove("hidden");
  for (const key in c) {
    const el = document.getElementById(key);
    if (el) el.value = c[key];
  }
}

// Delete Case
async function deleteCase(id) {
  if (!confirm("Are you sure?")) return;
  try {
    await fetch(`${API_BASE}/cases/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    loadCases();
  } catch (err) {
    alert("Failed to delete.");
  }
}

// Export to Excel
document.getElementById("exportBtn").onclick = async () => {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  if (!from || !to) {
    alert("Select both dates.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/cases/export?from=${from}&to=${to}`, {
      headers: { Authorization: "Bearer " + token },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cases.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Export failed.");
  }
};

// Change Password
document.getElementById("changePasswordBtn").onclick = async () => {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  if (!oldPassword || !newPassword) {
    alert("Fill both fields.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      alert("Password changed successfully.");
    } else {
      alert(data.message || "Password change failed.");
    }
  } catch (err) {
    alert("Error changing password.");
  }
};
