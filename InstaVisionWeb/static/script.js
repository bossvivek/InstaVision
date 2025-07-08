// These variables will store the files selected by the user for comparison.
let selectedFileA = null;
let selectedFileB = null;

// This function sets up a drag-and-drop area (drop zone) for file uploads.
// dropZoneId: the id of the drop zone element in HTML
// inputId: the id of the hidden file input element
// fileSetter: a function to update the selected file variable
function setupDropZone(dropZoneId, inputId, fileSetter) {
    const dropZone = document.getElementById(dropZoneId); // The area where users can drop files
    const fileInput = document.getElementById(inputId);   // The hidden file input element

    // When the drop zone is clicked, open the file picker dialog
    dropZone.addEventListener('click', () => fileInput.click());

    // When a file is selected using the file picker
    fileInput.addEventListener('change', () => {
        fileSetter(fileInput.files[0]); // Store the selected file
        dropZone.querySelector('p').textContent = fileInput.files[0].name; // Show file name in drop zone
    });

    // When a file is dragged over the drop zone, highlight it
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault(); // Prevent default to allow drop
        dropZone.classList.add('dragover'); // Add a CSS class for visual feedback
    });

    // When the dragged file leaves the drop zone, remove highlight
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    // When a file is dropped onto the drop zone
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault(); // Prevent default browser behavior
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0]; // Get the dropped file
        fileSetter(file); // Store the file
        dropZone.querySelector('p').textContent = file.name; // Show file name
    });
}

// Set up two drop zones: one for each file to compare
setupDropZone('dropA', 'fileA', (file) => selectedFileA = file);
setupDropZone('dropB', 'fileB', (file) => selectedFileB = file);

// This function uploads the selected files to the server for comparison
async function uploadFiles() {
    // If either file is missing, alert the user and stop
    if (!selectedFileA || !selectedFileB) {
        alert('Please upload both files!');
        return;
    }

    // Create a FormData object to send files to the server
    const formData = new FormData();
    formData.append('fileA', selectedFileA); // Add first file
    formData.append('fileB', selectedFileB); // Add second file

    // Send the files to the server at the '/compare' endpoint
    const response = await fetch('/compare', {
        method: 'POST',
        body: formData
    });

    // Wait for the server's response and convert it to JSON
    const result = await response.json();
    // Show the results on the page
    displayResults(result);
}

// This function displays the comparison results on the web page
function displayResults(result) {
    // Show items found in both files, only in file A, and only in file B
    populateList('commonList', result.common);
    populateList('uniqueAList', result.unique_to_a);
    populateList('uniqueBList', result.unique_to_b);
}

// This function fills a list element with items
// listId: the id of the HTML element to fill
// items: an array of strings to display
function populateList(listId, items) {
    const listElement = document.getElementById(listId);
    listElement.innerHTML = '';

    items.forEach(html => {
        const div = document.createElement('div');
        div.className = 'list-group-item';
        div.innerHTML = html;  // ✅ Renders as clickable link
        listElement.appendChild(div);
    });
}


// Live Search Function
// Filters the displayed items in a list based on the user's search input
// listId: the id of the list to search in
// query: the search string entered by the user
function searchItems(listId, query) {
    const listElement = document.getElementById(listId);
    const items = listElement.getElementsByClassName('list-group-item');
    const searchTerm = query.toLowerCase();

    Array.from(items).forEach(item => {
        if (item.textContent.toLowerCase().includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}
