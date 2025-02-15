document.addEventListener("DOMContentLoaded", function () {
    updateUI();
    showPage("cases"); // ✅ Default page on load

    // ✅ Ensure searchInput exists before adding an event listener
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            let searchQuery = this.value.trim();
            fetchCases(searchQuery);
        });
    }

    // ✅ Ensure saveCaseBtn exists before adding an event listener
    const saveCaseBtn = document.getElementById("saveCaseBtn");
    if (saveCaseBtn) {
        saveCaseBtn.addEventListener("click", saveCase);
    }
});

// ✅ Global Variables
const BASE_URL = "https://2237-2405-201-c04c-a12a-75d8-6f7d-6499-de33.ngrok-free.app"; 

function showPage(page) {
    document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
    document.getElementById(page).style.display = "block";

    // ✅ Show Change Password only in "Settings"
    document.getElementById("changePasswordForm").style.display = (page === "settings") ? "block" : "none";
}
