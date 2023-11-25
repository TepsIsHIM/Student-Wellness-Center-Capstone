function insertRecord() {

  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const serviceInput = document.getElementById('service');


  const selectedDate = new Date(dateInput.value);
  const currentDate = new Date();
  if (selectedDate < currentDate) {
    alert('Please select a future date.');
    dateInput.value = ''; 
    return;
  }


  const selectedTime = timeInput.value;
  const startTime = '07:00';
  const endTime = '17:00';
  const timeRegex = /^([01]\d|2[0-3]):([03]0|45)$/; 

  if (selectedTime < startTime || selectedTime > endTime || !timeRegex.test(selectedTime)) {
    alert('Please select a valid time between 7:00 AM and 5:00 PM in 30-minute intervals.');
    timeInput.value = ''; 
    return;
  }


  const appointmentDateTime = new Date();


  fetch('/create-appointment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      date: dateInput.value,
      time: timeInput.value,
      service: serviceInput.value,
      appointmentDateTime,
    }),
  })
    .then((response) => response.json())
    .then((data) => {

      if (data.success) {

        alert('Appointment Created Successfully');
        console.log('Appointment created successfully');
        dateInput.value = '';
        timeInput.value = '';
        serviceInput.value = '';
      } else {
        // Handle errors or display an error message
        alert(data.message); // Display the server's error message
        console.error('Appointment creation failed');
      }
    })
    .catch((error) => {
      // Handle any errors that occur during the fetch
      console.error('Error:', error);
    });
}
