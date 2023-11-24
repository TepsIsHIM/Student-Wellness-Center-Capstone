function insertRecord() {
  // Get the form values (date, time, service)
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const serviceInput = document.getElementById('service');

  // Check if the selected date is in the past
  const selectedDate = new Date(dateInput.value);
  const currentDate = new Date();
  if (selectedDate < currentDate) {
    alert('Please select a future date.');
    dateInput.value = ''; // Clear the date input
    return;
  }

  // Check if the selected date is not a weekend (Saturday or Sunday)
  const dayOfWeek = selectedDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    alert('Please select a date from Monday to Friday.');
    dateInput.value = ''; // Clear the date input
    return;
  }

  // Check if the selected time is outside the allowed range or not in 30-minute intervals
  const selectedTime = timeInput.value;
  const startTime = '08:00';
  const endTime = '17:00';
  const timeRegex = /^([01]\d|2[0-3]):([03]0|45)$/; // Updated regex for HH:00 or HH:30 format

  if (selectedTime < startTime || selectedTime > endTime || !timeRegex.test(selectedTime)) {
    alert('Please select a valid time between 8:00 AM and 5:00 PM in 30-minute intervals.');
    timeInput.value = ''; // Clear the time input
    return;
  }

  // Get the current date and time when the "appoint" button is clicked
  const appointmentDateTime = new Date();

  // Send the data to the server using AJAX or fetch
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
      // Handle the response from the server
      if (data.success) {
        // Display a success message or redirect to a confirmation page
        alert('Appointment Created Successfully');
        console.log('Appointment created successfully');
        dateInput.value = '';
        timeInput.value = '';
        serviceInput.value = '';
      } else {
        // Handle errors or display an error message
        alert('Appointment Creation Failed');
        console.error('Appointment creation failed');
      }
    })
    .catch((error) => {
      // Handle any errors that occur during the fetch
      console.error('Error:', error);
    });
}


// function insertRecord() {
//   // Get the form values (date, time, service)
//   const dateInput = document.getElementById('date');
//   const timeInput = document.getElementById('time');
//   const serviceInput = document.getElementById('service');

//   // Check if the selected date is in the past
//   const selectedDate = new Date(dateInput.value);
//   const currentDate = new Date();
//   if (selectedDate < currentDate) {
//     alert('Please select a future date.');
//     dateInput.value = ''; // Clear the date input
//     return;
//   }

//   // Check if the selected time is outside the allowed range or not in 30-minute intervals
//   const selectedTime = timeInput.value;
//   const startTime = '08:00';
//   const endTime = '17:00';
//   const timeRegex = /^([01]\d|2[0-3]):([03]0|45)$/; // Updated regex for HH:00 or HH:30 format

//   if (selectedTime < startTime || selectedTime > endTime || !timeRegex.test(selectedTime)) {
//     alert('Please select a valid time between :00 AM and 5:00 PM in 30-minute intervals.');
//     timeInput.value = ''; // Clear the time input
//     return;
//   }

//   // Get the current date and time when the "appoint" button is clicked
//   const appointmentDateTime = new Date();

//   // Send the data to the server using AJAX or fetch
//   fetch('/create-appointment', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       date: dateInput.value,
//       time: timeInput.value,
//       service: serviceInput.value,
//       appointmentDateTime,
//     }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       // Handle the response from the server
//       if (data.success) {
//         // Display a success message or redirect to a confirmation page
//         alert('Appointment Created Successfully');
//         console.log('Appointment created successfully');
//         dateInput.value = '';
//         timeInput.value = '';
//         serviceInput.value = '';
//       } else {
//         // Handle errors or display an error message
//         alert('Appointment Creation Failed');
//         console.error('Appointment creation failed');
//       }
//     })
//     .catch((error) => {
//       // Handle any errors that occur during the fetch
//       console.error('Error:', error);
//     });
// }
