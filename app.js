const baseUrl = "https://backend-7l9n.onrender.com"; // Your backend URL
let authToken = localStorage.getItem("token") || null;

// Elements
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const btnLogout = document.getElementById("btnLogout");
const openModalBtn = document.getElementById("openModalBtn");
const caseModal = document.getElementById("caseModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveCaseBtn = document.getElementById("saveCaseBtn");
const modalTitle = document.getElementById("modalTitle");

const formFields = [
  "caseId", "date", "name", "mobile", "altMobile", "work",
  "frameSize", "frameColor", "requiredDetails", "advance", "actualPrice", "status"
];
const form = {};
formFields.forEach(id => form[id] = document.getElementById(id));

// ---------- LOGIN ----------
loginBtn?.addEventListener("click", async () => {
  const mobile = document.getElementById("mobile").value;
  const password = document.getElementById("password").value;
  if (!mobile || !password) return;

  try {
    const res = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: mobile, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      authToken = data.token;
      localStorage.setItem("token", authToken);
      showDashboard();
    } else {
      loginError.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Login failed:", err);
    loginError.classList.remove("hidden");
  }
});

// ---------- SHOW / HIDE ----------
function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  refreshIframe();
}
function resetForm() {
  formFields.forEach(id => (form[id].value = ""));
  form["caseId"].value = "";
  modalTitle.textContent = "Add New Case";
}
function refreshIframe() {
  const iframe = document.querySelector("iframe");
  iframe.src = iframe.src;
}

// ---------- LOGOUT ----------
btnLogout?.addEventListener("click", () => {
  localStorage.removeItem("token");
  authToken = null;
  loginSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
});

// ---------- MODAL ----------
openModalBtn?.addEventListener("click", () => {
  resetForm();
  caseModal.classList.remove("hidden");
});
closeModalBtn?.addEventListener("click", () => {
  caseModal.classList.add("hidden");
});

// ---------- SAVE / UPDATE CASE ----------
saveCaseBtn?.addEventListener("click", async () => {
  const data = {};
  formFields.forEach(id => (data[id] = form[id].value));

  if (!data.name || !data.mobile || !data.date) {
    alert("Name, mobile, and date are required.");
    return;
  }

  const isEditing = !!data.caseId;
  const url = isEditing
    ? `${baseUrl}/update-case/${data.caseId}`
    : `${baseUrl}/add-case`;

  const payload = { ...data };
  delete payload.caseId;

  try {
    const res = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok) {
      alert("Case saved successfully.");
      caseModal.classList.add("hidden");
      refreshIframe();
    } else {
      alert(result.error || "Failed to save case.");
    }
  } catch (err) {
    console.error("Save error:", err);
    alert("Something went wrong.");
  }
});

// ---------- LOAD UI ON START ----------
if (authToken) showDashboard();
