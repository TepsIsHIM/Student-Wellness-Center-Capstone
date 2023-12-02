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

  // Check if the selected date is not a weekend (Saturday or Sunday)
  const dayOfWeek = selectedDate.getDay();
  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    alert('Please select a date from Monday to Friday.');
    dateInput.value = ''; // Clear the date input
    return;
  }

  const selectedTime = timeInput.value;
  const startTime = '08:00';
  const endTime = '17:00';
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Adjusted regex for 10-minute intervals

  if (selectedTime < startTime || selectedTime > endTime) {
    alert('Please select a valid time between 8:00 AM and 5:00 PM in 10-minute intervals.');
    timeInput.value = ''; // Clear the time input
    return;
  }

  if (!timeRegex.test(selectedTime)) {
    alert('Time must be in 10-minutes intervel ex. 8:00 8:10 8:20 8:30');
    timeInput.value = ''; // Clear the time input
    return;
  }

  if (!dateInput){
    alert("Please select a date")
  return;
  }
  if (!timeInput){
    alert("Please select a time")
  return;
  }
  
  if (!dateInput||!timeInput){
    alert("Please select a date and time")
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
