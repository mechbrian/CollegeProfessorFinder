// Variable to store professor data, initially set to null
let professorData = null;

// Async function to fetch professor data
async function fetchProfessorData() {
    const response = await fetch('data/professor_details.json'); // Fetch the JSON data
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText); // Throw error if response is not ok
    }
    const data = await response.json(); // Parse the JSON data
    return data; // Return the parsed data
}

// Function to find professors by class ID
async function findProfessors() {
    const classIdInput = document.getElementById('classIdInput').value.trim();
    const resultsDiv = document.getElementById('results');

    // Clear previous results
    resultsDiv.innerHTML = '';

    // Load professor data if not already loaded
    if(!professorData){
        try{
            professorData = await fetchProfessorData(); // Fetch the professor data
        }
        catch(error){
            resultsDiv.textContent = 'Error loading professor data. Please try again later.'; // Display error message
            console.error('Error loading professor data:', error); // Log error to the console
            return; // Exit the function
        }
    }

    // Filter professors by class ID
    const matchingProfessors = professorData.filter(professor =>
        professor.ratingList.some(rating => rating.class_id.trim() === classIdInput)
    );

    // Display matching professors
    if (matchingProfessors.length > 0) {
        matchingProfessors.forEach(professor => {
            const professorDiv = document.createElement('div');
            professorDiv.classList.add('professor');
            professorDiv.innerHTML = `<h2>${professor.name}</h2>`;
            const ratingsList = document.createElement('ul');

            professor.ratingList.forEach(rating => {
                if (rating.class_id.trim() === classIdInput) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <strong>Date:</strong> ${rating.date} <br>
                        <strong>Quality:</strong> ${rating.rating_quality} <br>
                        <strong>Difficulty:</strong> ${rating.rating_difficulty} <br>
                        <strong>Comment:</strong> ${rating.comment}
                    `;
                    ratingsList.appendChild(listItem);
                }
            });

            professorDiv.appendChild(ratingsList);
            resultsDiv.appendChild(professorDiv);
        });
    } else {
        resultsDiv.textContent = 'No professors found for this class ID.';
    }
}
