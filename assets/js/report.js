$(document).ready(function () {
    // Initial state
    hideAllSections();

    // Event handler for category type selection
    $("#serviceSelect3").change(function () {
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

  document.addEventListener('DOMContentLoaded', function () {
    // Add event listeners for form submission
    document.getElementById('submitConsultation').addEventListener('click', submitConsultation);
    document.getElementById('submitCounseling').addEventListener('click', submitCounseling);
    document.getElementById('submitInterview').addEventListener('click', submitInterview);
    document.getElementById('submitTesting').addEventListener('click', submitTesting);
    document.getElementById('submitOthers').addEventListener('click', submitOthers);
  });
//CLEAR
  function clearCounselingFields() {
    document.getElementById("concernSelect1").value = "";
    document.getElementById("clientSelect1").value = "";
    document.getElementById("sessionSelect1").value = "";
    document.getElementById("hoursInput1").value = "";
    document.getElementById("minutesInput1").value = "";
    document.getElementById("noteTextarea1").value = "";
  }
  
  function clearInterviewFields() {
    document.getElementById("concernSelect3").value = "";
    document.getElementById("hoursInput3").value = "";
    document.getElementById("minutesInput3").value = "";
    document.getElementById("noteTextarea3").value = "";
  }
  
  function clearTestingFields() {
    document.getElementById("categType4").value = "";
    document.getElementById("concernSelect4").value = "";
    document.getElementById("hoursInput4").value = "";
    document.getElementById("minutesInput4").value = "";
    document.getElementById("noteTextarea4").value = "";
  }
  
  function clearOthersFields() {
    document.getElementById("concernSelect5").value = "";
    document.getElementById("clientSelect5").value = "";
    document.getElementById("hoursInput5").value = "";
    document.getElementById("minutesInput5").value = "";
    document.getElementById("noteTextarea5").value = "";
  }
//SUGGESTION
function fillFormFields(selectedData) {
    // Fill form fields with the selected data
    document.getElementById('email').value = selectedData.email;
    document.getElementById('fname').value = selectedData.first_name;
    document.getElementById('lname').value = selectedData.last_name;
    document.getElementById('department').value = selectedData.department;
    // ... and so on for other fields
}

  
  function extractCommonData() {
    return {
      fname: document.getElementById('fname').value,
      lname: document.getElementById('lname').value,
      email: document.getElementById('email').value,
      progcode: document.getElementById('progcode').value,
      department: document.getElementById('department').value,
    };
  }
  
  function submitConsultation() {
    const data = extractCommonData();
    data.consultSelect2 = document.getElementById('consultSelect2').value;
    data.hoursInput2 = document.getElementById('hoursInput2').value;
    data.minutesInput2 = document.getElementById('minutesInput2').value;
    data.noteTextarea2 = document.getElementById('noteTextarea2').value;
    data.dateInput2 = document.getElementById('dateInput2').value;
  
    submitData('/submit-manualConsultation', data);
  }
  
  function submitCounseling() {
    const data = extractCommonData();
    data.concernSelect1 = document.getElementById('concernSelect1').value;
    data.clientSelect1 = document.getElementById('clientSelect1').value;
    data.sessionSelect1 = document.getElementById('sessionSelect1').value;
    data.hoursInput1 = document.getElementById('hoursInput1').value;
    data.minutesInput1 = document.getElementById('minutesInput1').value;
    data.noteTextarea1 = document.getElementById('noteTextarea1').value;
    data.dateInput1 = document.getElementById('dateInput1').value;
    submitData('/submit-manualCounseling', data);
  }
  
  function submitInterview() {
    const data = extractCommonData();
    data.concernSelect3 = document.getElementById('concernSelect3').value;
    data.hoursInput3 = document.getElementById('hoursInput3').value;
    data.minutesInput3 = document.getElementById('minutesInput3').value;
    data.noteTextarea3 = document.getElementById('noteTextarea3').value;
    data.dateInput3 = document.getElementById('dateInput3').value;
    submitData('/submit-manualInterview', data);
  }
  
  function submitTesting() {
    const data = extractCommonData();
    data.categType4 = document.getElementById('categType4').value;
    data.concernSelect4 = document.getElementById('concernSelect4').value;
    data.hoursInput4 = document.getElementById('hoursInput4').value;
    data.minutesInput4 = document.getElementById('minutesInput4').value;
    data.noteTextarea4 = document.getElementById('noteTextarea4').value;
    data.dateInput4 = document.getElementById('dateInput4').value;
    submitData('/submit-manualTesting', data);
  }
  
  function submitOthers() {
    const data = extractCommonData();
    data.concernSelect5 = document.getElementById('concernSelect5').value;
    data.clientSelect5 = document.getElementById('clientSelect5').value;
    data.hoursInput5 = document.getElementById('hoursInput5').value;
    data.minutesInput5 = document.getElementById('minutesInput5').value;
    data.noteTextarea5 = document.getElementById('noteTextarea5').value;
    data.dateInput5 = document.getElementById('dateInput5').value;
    submitData('/submit-manualOthers', data);
  }
  
  function submitData(endpoint, data) {
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.success) {
            alert('Report Successfully submitted!');
          }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  