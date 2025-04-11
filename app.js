document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');  // Ensure the token is in localStorage

    if (!token) {
        alert('Please log in first');
        window.location.href = '/login';  // Redirect to login page if no token
        return;
    }

    // Fetch cases and populate table
    const fetchCases = async (page = 1, search = '') => {
        const url = `https://backend-7l9n.onrender.com/cases?search=${search}&page=${page}`;
        
        // Show loading spinner
        document.getElementById('loadingSpinner').style.display = 'block';
        
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`  // Add Bearer token to header
                }
            });

            const data = await res.json();
            if (res.ok) {
                // Populate cases table
                const tableBody = document.querySelector('#caseTable tbody');
                tableBody.innerHTML = '';  // Clear the table before adding new rows

                data.cases.forEach(caseItem => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${caseItem.name}</td>
                        <td>${caseItem.mobile}</td>
                        <td>${caseItem.work}</td>
                        <td>${caseItem.frameSize}</td>
                        <td>${caseItem.frameColor}</td>
                        <td>${caseItem.requiredDetails}</td>
                        <td>${caseItem.advance}</td>
                        <td>${caseItem.actualPrice}</td>
                        <td>${caseItem.status}</td>
                        <td>
                            <button class="btn btn-warning" onclick="editCase(${caseItem.id})">Edit</button>
                            <button class="btn btn-danger" onclick="deleteCase(${caseItem.id})">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                // Handle pagination
                const pagination = document.getElementById('pagination');
                pagination.innerHTML = ''; // Clear pagination controls
                for (let i = 1; i <= data.totalPages; i++) {
                    const pageButton = document.createElement('button');
                    pageButton.classList.add('btn', 'btn-secondary', 'mx-1');
                    pageButton.textContent = i;
                    pageButton.onclick = () => fetchCases(i);
                    pagination.appendChild(pageButton);
                }
            } else {
                alert(data.message || 'Failed to fetch cases');
            }
        } catch (error) {
            alert('Error fetching cases: ' + error.message);
        } finally {
            document.getElementById('loadingSpinner').style.display = 'none';  // Hide loading spinner
        }
    };

    // Function to handle case editing
    window.editCase = async (id) => {
        // Fetch the case details to populate the modal for editing
        const url = `https://backend-7l9n.onrender.com/cases/${id}`;
        
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`  // Add Bearer token to header
                }
            });

            const caseData = await res.json();
            if (res.ok) {
                // Populate the modal fields with case data
                document.getElementById('name').value = caseData.name;
                document.getElementById('mobile').value = caseData.mobile;
                document.getElementById('work').value = caseData.work;
                document.getElementById('frameSize').value = caseData.frameSize;
                document.getElementById('frameColor').value = caseData.frameColor;
                document.getElementById('requiredDetails').value = caseData.requiredDetails;
                document.getElementById('advance').value = caseData.advance;
                document.getElementById('actualPrice').value = caseData.actualPrice;
                document.getElementById('status').value = caseData.status;
                document.getElementById('caseId').value = caseData.id;  // Set hidden case ID field

                // Show modal for editing case
                const modal = new bootstrap.Modal(document.getElementById('caseModal'));
                modal.show();
            } else {
                alert(caseData.message || 'Failed to fetch case details');
            }
        } catch (error) {
            alert('Error fetching case details: ' + error.message);
        }
    };

    // Function to handle case deletion
    window.deleteCase = async (id) => {
        if (confirm('Are you sure you want to delete this case?')) {
            const url = `https://backend-7l9n.onrender.com/cases/${id}`;
            try {
                const res = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`  // Add Bearer token to header
                    }
                });

                const data = await res.json();
                if (res.ok) {
                    alert('Case deleted successfully');
                    fetchCases();  // Re-fetch the cases after deletion
                } else {
                    alert(data.message || 'Failed to delete case');
                }
            } catch (error) {
                alert('Error deleting case: ' + error.message);
            }
        }
    };

    // Function to handle case form submission (Add/Edit)
    document.getElementById('caseForm').addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevent the default form submission

        const caseData = {
            name: document.getElementById('name').value,
            mobile: document.getElementById('mobile').value,
            work: document.getElementById('work').value,
            frameSize: document.getElementById('frameSize').value,
            frameColor: document.getElementById('frameColor').value,
            requiredDetails: document.getElementById('requiredDetails').value,
            advance: document.getElementById('advance').value,
            actualPrice: document.getElementById('actualPrice').value,
            status: document.getElementById('status').value
        };

        const caseId = document.getElementById('caseId').value;

        const url = caseId
            ? `https://backend-7l9n.onrender.com/cases/${caseId}`  // Update case
            : 'https://backend-7l9n.onrender.com/cases';  // Add new case

        try {
            const res = await fetch(url, {
                method: caseId ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(caseData)
            });

            const data = await res.json();
            if (res.ok) {
                alert(caseId ? 'Case updated successfully' : 'Case added successfully');
                fetchCases();  // Re-fetch the cases after adding/updating
                const modal = bootstrap.Modal.getInstance(document.getElementById('caseModal'));
                modal.hide();  // Close the modal
            } else {
                alert(data.message || 'Failed to save case');
            }
        } catch (error) {
            alert('Error saving case: ' + error.message);
        }
    });

    // Initial fetch for cases (page 1)
    fetchCases();

    // Search function (to be connected to a search input if needed)
    const searchCases = () => {
        const searchTerm = document.getElementById('searchInput').value;
        fetchCases(1, searchTerm);
    };

    // Event listener for search
    document.getElementById('searchButton').addEventListener('click', searchCases);
});
