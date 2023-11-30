document.addEventListener('DOMContentLoaded', function () {
  
    let currentAppointmentId; 
  
    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('reschedule-appointment')) {
        currentAppointmentId = event.target.dataset.appointmentId;
        $('#reschedModal').modal('show');
        $('#rejectModal').modal('hide');
      } else if (event.target.classList.contains('confirm-reschedule')) {
        const date = document.getElementById('rescheduleDate').value;
        const rescheduleTime = document.getElementById('rescheduleDate').value;
        const rescheduleNotes = document.getElementById('rescheduleDate').value;
        reschedAppointment(currentAppointmentId, date,rescheduleTime,rescheduleNotes);
      }
    });
  
    // Add event listeners for the close button and the "X" button
    document.getElementById('closeModalX3').addEventListener('click', function () {
      $('#reschedModal').modal('hide');
      $('#rejectModal').modal('show');
    });
  
    document.getElementById('closeModalBtn3').addEventListener('click', function () {
      $('#reschedModal').modal('hide');
      $('#rejectModal').modal('show');
    });
  
    function reschedAppointment(appointmentId, date,rescheduleTime,rescheduleNotes) {
      fetch(`/reschedAppointment/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date,rescheduleTime,rescheduleNotes }),
      })
      .then(response => {
        if (response.ok) {
          alert('Appointment Reschedule successfully!');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          console.error('Failed to Reschedule the appointment');
        }
      })
      .catch(error => {
        console.error('Error Reschedule the appointment:', error);
      });
    }
  });
  