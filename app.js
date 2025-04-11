document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');  // Ensure the token is in localStorage

    if (!token) {
        alert('Please log in first');
        window.location.href = '/login';  // Redirect to login page if no token
        return;
    }

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
            console.log(data); // Log the response data

            if (res.ok) {
                if (Array.isArray(data)) {  // Check if the response is an array of cases
                    // Populate cases table
                    const tableBody = document.querySelector('#caseTable tbody');
                    tableBody.innerHTML = '';  // Clear the table before adding new rows

                    data.forEach(caseItem => {
                        // Ensure fields are present, if not set default values
                        const {
                            date = '',
                            altMobile = '',
                            mobile = '',
                            requiredDetails = '',
                            work = '',
                            frameSize = 'N/A', // Default to 'N/A' if not available
                            frameColor = 'N/A',
                            actualPrice = '0',
                            status = 'Pending',
                            id = 'N/A' // Ensure ID exists, if missing set 'N/A'
                        } = caseItem;

                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${date}</td>
                            <td>${mobile}</td>
                            <td>${work}</td>
                            <td>${frameSize}</td>
                            <td>${frameColor}</td>
                            <td>${requiredDetails}</td>
                            <td>${actualPrice}</td>
                            <td>${status}</td>
                            <td><button class="btn btn-warning" onclick="editCase(${id})">Edit</button></td>
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
                    alert('Error: Invalid response format. Expected an array of cases.');
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
    const editCase = (id) => {
        // Fetch the case details to populate the modal for editing
        // Show modal (code for modal will be added in modal HTML)
        console.log('Editing case with ID:', id);
    };

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

