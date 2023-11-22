$(document).ready(function () {
    // Initial state
    hideAllSections();

    // Event handler for category type selection
    $("#concernSelect3").change(function () {
      hideAllSections(); // Hide all sections

      // Show the selected section based on the category type
      var selectedCategory = $(this).val();
      if (selectedCategory === "CONSULTATION") {
        showConsultationSection();
      } else if (selectedCategory === "COUNSELING") {
        showCounselingSection();
      } else if (selectedCategory === "INTERVIEW") {
        showInterviewSection();
      } else if (selectedCategory === "TESTING") {
        showTestingSection();
      } else if (selectedCategory === "OTHERS") {
        showOthersSection();
      }
    });

    function hideAllSections() {
      $(".consultation-section, .counseling-section, .interview-section, .testing-section, .others-section").hide();
    }

    function showConsultationSection() {
      $(".consultation-section").show();
    }

    function showCounselingSection() {
      $(".counseling-section").show();
    }

    function showInterviewSection() {
      $(".interview-section").show();
    }

    function showTestingSection() {
      $(".testing-section").show();
    }

    function showOthersSection() {
      $(".others-section").show();
    }
  });

  
async function suggestEmails() {
    const input = document.getElementById('email').value;

    // Fetch email suggestions from the server endpoint
    const response = await fetch(`/emailSuggestions?input=${input}`);
    const data = await response.json();

    const suggestionList = document.getElementById('emailSuggestions');
    suggestionList.innerHTML = ''; // Clear previous suggestions

    if (data.suggestions) {
        const filteredSuggestions = data.suggestions.filter(emailData => emailData.email.toLowerCase().startsWith(input.toLowerCase()));

        filteredSuggestions.forEach(emailData => {
            const suggestion = document.createElement('div');
            suggestion.textContent = emailData.email; // Display email in the suggestion list
            suggestion.classList.add('suggestion-item'); // Add a class to the suggestion
            suggestion.addEventListener('click', () => {
                fillFormFields(emailData);
                suggestionList.innerHTML = ''; // Clear the suggestion list after selecting
            });
            suggestionList.appendChild(suggestion);
        });
    }
}

function fillFormFields(selectedData) {
    // Fill form fields with the selected data
    document.getElementById('email').value = selectedData.email;
    document.getElementById('fname').value = selectedData.first_name;
    document.getElementById('lname').value = selectedData.last_name;
    document.getElementById('department').value = selectedData.department;
    // ... and so on for other fields
}
function insertRecord() {
    const student_Email = document.getElementById('email').value;
    const student_fname = document.getElementById('fname').value;
    const student_lname = document.getElementById('lname').value;
    const progCode = document.getElementById('progcode').value;
    const schoolYear = document.getElementById('schoolYear').value;
    const department = document.getElementById('department').value;
    const typeOfService = document.getElementById('typeOfService').options[document.getElementById('typeOfService').selectedIndex].text;
    const natureOfConcern = document.getElementById('natureOfConcern').options[document.getElementById('natureOfConcern').selectedIndex].text;
    const categoryType = document.getElementById('categoryType').options[document.getElementById('categoryType').selectedIndex].text;
    const counselingClient = document.getElementById('counselingClient').value;
    const sessionName = document.getElementById('sessionName').options[document.getElementById('sessionName').selectedIndex].text;
    const notes = document.getElementById('note').value;

    // Create an object with the form data
    const formData = {
        student_Email: student_Email,
        student_fname: student_fname,
        student_lname: student_lname,
        progCode: progCode,
        schoolYear: schoolYear,
        department: department,
        typeOfService: typeOfService,
        natureOfConcern: natureOfConcern,
        categoryType: categoryType,
        counselingClient: counselingClient,
        sessionName: sessionName,
        notes: notes
    };

    fetch('/counselorEncoding', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData) // Send form data as JSON
    })
    .then((response) => response.json())
    .then((data) => {
        // Handle the response from the server
        if (data.message === 'Encoded successfully') {
            // Display a success message or redirect to a confirmation page
            alert('Report Submitted Successfully');
            console.log('Encode created successfully');
        } else {
            // Handle errors or display an error message
            alert('Report Creation Failed');
            console.error('Encode creation failed');
        }
    })
    .catch((error) => {
        // Handle any errors that occur during the fetch
        console.error('Error:', error);
    });
}
