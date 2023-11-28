document.addEventListener('DOMContentLoaded', function () {
  
  let currentAppointmentId; 

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('accept-appointment')) {

      currentAppointmentId = event.target.dataset.appointmentId;
      $('#acceptModal').modal('show');
    } else if (event.target.classList.contains('confirm-accept')) {

      const remarks = document.getElementById('modalRemarkInput1').value;

      acceptAppointment(currentAppointmentId, remarks);
    }
  });


  function acceptAppointment(appointmentId, remarks) {
    fetch(`/acceptAppointment/${appointmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ remarks }),
    })
    .then(response => {
      if (response.ok) {
        alert('Appointment accepted successfully!');


        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Failed to accept the appointment');
      }
    })
    .catch(error => {
      console.error('Error accepting the appointment:', error);

    });
  }
});

document.addEventListener('DOMContentLoaded', function () {

  function refreshPage() {

    window.location.reload();
  }


  document.addEventListener('click', function (event) {

    if (event.target.id === 'closeModalBtn' || event.target.closest('#closeModalBtn')) {

      refreshPage();
    } else if (event.target.id === 'closeModaX'|| event.target.closest('#closeModalX')) {
      refreshPage();
    }
  });
});

