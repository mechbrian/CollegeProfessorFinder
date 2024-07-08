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

    // Parse input to get multiple class IDs
    const classIds = classIdInput.split(/[\s,]+/).map(id => id.trim()).filter(id => id !== '');

    classIds.forEach(classId => {
        // Filter professors by class ID
        const matchingProfessors = professorData.filter(professor =>
            professor.ratingList.some(rating => rating.class_id.trim() === classId)
        );

        // Create a group for each class ID
        const classGroup = document.createElement('div');
        classGroup.classList.add('class-group');

        const groupHeader = document.createElement('h2');
        groupHeader.textContent = `Course ID: ${classId}`;
        groupHeader.style.cursor = 'pointer';
        groupHeader.onclick = () => {
            const groupContent = groupHeader.nextElementSibling;
            groupContent.style.display = groupContent.style.display === 'none' ? 'block' : 'none';
        };
        classGroup.appendChild(groupHeader);

        const groupContent = document.createElement('div');
        groupContent.style.display = 'none';
        classGroup.appendChild(groupContent);

        // Display matching professors
        if (matchingProfessors.length > 0) {
            const table = document.createElement('table');
            table.classList.add('professor-table');

            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `
                <th onclick="sortTable(event, 0)">Professor</th>
                <th onclick="sortTable(event, 1)">Latest Rating Date</th>
                <th onclick="sortTable(event, 2)">Average Quality</th>
                <th onclick="sortTable(event, 3)">Average Difficulty</th>
                <th onclick="sortTable(event, 4)">Quality 5</th>
                <th onclick="sortTable(event, 5)">Quality 4</th>
                <th onclick="sortTable(event, 6)">Quality 3</th>
                <th onclick="sortTable(event, 7)">Quality 2</th>
                <th onclick="sortTable(event, 8)">Quality 1</th>
                <th onclick="sortTable(event, 9)">Difficulty 5</th>
                <th onclick="sortTable(event, 10)">Difficulty 4</th>
                <th onclick="sortTable(event, 11)">Difficulty 3</th>
                <th onclick="sortTable(event, 12)">Difficulty 2</th>
                <th onclick="sortTable(event, 13)">Difficulty 1</th>
            `;
            table.appendChild(headerRow);

            matchingProfessors.forEach(professor => {
                const latestRating = professor.ratingList.filter(rating => rating.class_id.trim() === classId)
                                                         .reduce((latest, rating) => {
                                                             return new Date(latest.date) > new Date(rating.date) ? latest : rating;
                                                         });

                const ratings = professor.ratingList.filter(rating => rating.class_id.trim() === classId);
                const qualityAvg = ratings.reduce((sum, rating) => sum + parseFloat(rating.rating_quality), 0) / ratings.length;
                const difficultyAvg = ratings.reduce((sum, rating) => sum + parseFloat(rating.rating_difficulty), 0) / ratings.length;
                const qualityCounts = [0, 0, 0, 0, 0];
                const difficultyCounts = [0, 0, 0, 0, 0];

                ratings.forEach(rating => {
                    qualityCounts[parseInt(rating.rating_quality) - 1]++;
                    difficultyCounts[parseInt(rating.rating_difficulty) - 1]++;
                });

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${professor.name}</td>
                    <td>${latestRating.date}</td>
                    <td>${qualityAvg.toFixed(1)}</td>
                    <td>${difficultyAvg.toFixed(1)}</td>
                    <td>${qualityCounts[4]}</td>
                    <td>${qualityCounts[3]}</td>
                    <td>${qualityCounts[2]}</td>
                    <td>${qualityCounts[1]}</td>
                    <td>${qualityCounts[0]}</td>
                    <td>${difficultyCounts[4]}</td>
                    <td>${difficultyCounts[3]}</td>
                    <td>${difficultyCounts[2]}</td>
                    <td>${difficultyCounts[1]}</td>
                    <td>${difficultyCounts[0]}</td>
                `;
                table.appendChild(row);
            });

            groupContent.appendChild(table);
        } else {
            groupContent.textContent = 'No professors found for this class ID.';
        }

        resultsDiv.appendChild(classGroup);
    });
}

// Function to sort the table based on column index
function sortTable(event, columnIndex) {
    const header = event.target;
    const table = header.closest('table');
    const tbody = table.querySelector('tbody') || table;
    const rowsArray = Array.from(tbody.querySelectorAll('tr:nth-child(n+2)'));

    const isNumericColumn = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].includes(columnIndex);
    const isDateColumn = columnIndex === 1;
    const isAscending = header.getAttribute('data-order') === 'asc';

    rowsArray.sort((rowA, rowB) => {
        let valueA = rowA.children[columnIndex].innerText;
        let valueB = rowB.children[columnIndex].innerText;

        if (isDateColumn){           
            valueA = new Date(parseDate(valueA));
            valueB = new Date(parseDate(valueB));
            console.log(valueA.Date);
            console.log(valueB);
        }else if(isNumericColumn){
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        }

        if (valueA < valueB) return isAscending ? -1 : 1;
        if (valueA > valueB) return isAscending ? 1 : -1;
        return 0;
    });

    rowsArray.forEach(row => tbody.appendChild(row));

    header.setAttribute('data-order', isAscending ? 'desc' : 'asc');
}

// Function to parse date strings like "Jun 5th, 2024"
function parseDate(dateString) {
    const [month, dayWithSuffix, year] = dateString.replace(',', '').split(' ');
    // Remove the "th", "rd", "nd", or "st" suffix
    const day = dayWithSuffix.slice(0,-2);
    const months = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };    
    return `${year}-${months[month]}-${day.padStart(2, '0')}`;
}

// Function to handle key press event
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        findProfessors();
    }
}
