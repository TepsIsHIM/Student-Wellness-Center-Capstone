document.addEventListener('DOMContentLoaded', function () {
    // Event delegation for showing the modal
    document.addEventListener('click', function (event) {
        let id;
      if (event.target.classList.contains('showCounselingModal')) {
        id = event.target.getAttribute('data-id');
        $('#counselingModal').modal('show');
      }
      else if (event.target.classList.contains('showConsultationModal')) {
         id = event.target.getAttribute('data-id');
        $('#consultationModal').modal('show');
      }
      else if (event.target.classList.contains('showInterviewModal')) {
         id = event.target.getAttribute('data-id');
        $('#interviewModal').modal('show');
      }
      else if (event.target.classList.contains('showTestingModal')) {
         id = event.target.getAttribute('data-id');
        $('#testingModal').modal('show');
      }
      else if (event.target.classList.contains('showOtherModal')) {
         id = event.target.getAttribute('data-id');
        $('#othersModal').modal('show');
      }
  
    

    document.getElementById('submitCounseling').addEventListener('click', function () {
        const nameOfConcern = document.getElementById('concernSelect1').value;
        const typeOfClient = document.getElementById('clientSelect1').value;
        const typeOfSession = document.getElementById('sessionSelect1').value;
        const date = document.getElementById('dateInput1').value;
        const hours = document.getElementById('hoursInput1').value;
        const minutes = document.getElementById('minutesInput1').value;
        const notes = document.getElementById('noteTextarea1').value;
        const title = document.getElementById('counselingModalLabel').value;
        // Send the data to the server
        fetch('/submit-counseling', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nameOfConcern,
            typeOfClient,
            typeOfSession,
            date,
            hours,
            minutes,
            notes,
            title,
            id
          }),
        })
          .then(response => response.json())
          .then(data => {
            // Handle the response from the server if needed
            console.log('Success:', data);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      });
    });
});
  
  