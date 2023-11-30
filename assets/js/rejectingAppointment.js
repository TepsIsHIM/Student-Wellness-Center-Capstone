document.addEventListener('DOMContentLoaded', function () {
  
  let currentAppointmentId; 

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('reject-appointment')) {
      currentAppointmentId = event.target.dataset.appointmentId;
      $('#rejectModal').modal('show');
    } else if (event.target.classList.contains('confirm-reject')) {
      const remarks = document.getElementById('modalRemarkInput2').value;
      rejectAppointment(currentAppointmentId, remarks);
    }
  });

  // Add event listeners for the close button and the "X" button
  document.getElementById('closeModalX').addEventListener('click', function () {
    $('#rejectModal').modal('hide');
  });

  document.getElementById('closeModalBtn').addEventListener('click', function () {
    $('#rejectModal').modal('hide');
  });

  function rejectAppointment(appointmentId, remarks) {
    fetch(`/rejectAppointment/${appointmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ remarks }),
    })
    .then(response => {
      if (response.ok) {
        alert('Appointment rejected successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Failed to reject the appointment');
      }
    })
    .catch(error => {
      console.error('Error rejecting the appointment:', error);
      // Handle the error or show a message to the user
    });
  }
});
