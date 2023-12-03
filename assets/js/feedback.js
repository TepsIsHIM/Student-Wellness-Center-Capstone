document.addEventListener('DOMContentLoaded', function () {
  
    let currentAppointmentId; 
  
    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('feedback')) {
        currentAppointmentId = event.target.dataset.appointmentId;
      } else if (event.target.classList.contains('confirm-submit')) {
       const form = event.target.closest('form');

    if (form) {
      // Find the checked radio button within the form
      const selectedRating = form.querySelector('input[name="rating"]:checked');

      if (selectedRating) {
        // Get the value of the selected radio button
        const ratingValue = selectedRating.value;
        feedback(currentAppointmentId, ratingValue);
      }
    }
      }
    });
  
    // Add event listeners for the close button and the "X" button
    document.getElementById('closeModalX2').addEventListener('click', function () {
      $('#exampleModal').modal('hide');
    });
  
    document.getElementById('closeModalBtn2').addEventListener('click', function () {
      $('#exampleModal').modal('hide');
    });
  
    function feedback(appointmentId, ratingValue) {
      fetch(`/acceptAppointment/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ratingValue }),
      })
      .then(response => {
        if (response.ok) {
          $('#exampleModal').modal('hide');
          alert('Feedback successfully!');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          response.json().then(data => {
            $('#exampleModal').modal('hide');
            alert('Failed to Feedback: ' + data.message);
          });
        }
      })
      .catch(error => {
        console.error('Error Feedback:', error);
      });
    }
  });
  