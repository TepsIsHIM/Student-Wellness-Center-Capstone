document.getElementById('generateButton').addEventListener('click', async () => {
    event.preventDefault();
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    try {
        const response = await fetch('/generate-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fromDate, toDate }),
        });

        // Handle the response as needed
        const data = await response.json();
        console.log(data);

        // Update the content with the generated statistics
        document.getElementById('firstYearCount').innerText = data.statistics['1st Year'];
        document.getElementById('secondYearCount').innerText = data.statistics['2nd Year'];
        document.getElementById('thirdYearCount').innerText = data.statistics['3rd Year'];
        document.getElementById('fourthYearCount').innerText = data.statistics['4th Year'];
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});