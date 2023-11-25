document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll('.btn-edit-user');
    const editForm = document.getElementById('editForm');
    const adminSwitch = document.getElementById('adminSwitch');
  
    // Initialize the Bootstrap Switch
    $(adminSwitch).bootstrapSwitch();
  
    let selectedEmail; // Variable to store the selected counselor's email
  
    editButtons.forEach(editButton => {
      editButton.addEventListener('click', function () {
        const card = this.closest('.counselor-card');
        selectedEmail = card.querySelector('.card-text.email').innerText;
  
        // Open the modal
        $('#editModal').modal('show');
      });
    });
  
    if (editForm) {
      document.getElementById('confirmButton').addEventListener('click', function () {
        const departmentCheckboxes = document.querySelectorAll('input[name="department"]:checked');
  
        const data = {
          counselorEmail: selectedEmail,
          departments: Array.from(departmentCheckboxes).map(checkbox => checkbox.value),
          admin: adminSwitch.checked, // Use the state of the switch
        };
  
        // Send the data object to the server using fetch
        fetch('/adminEditRoles/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
          })
          .then(data => {
            console.log(data); // Log the server response
            // Display a success message to the user
            alert('Counselor role updated successfully!');
            // Reload the current page or perform any other actions
            window.location.reload();
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error.message);
            // Display an error message to the user
            alert('Error updating counselor role. Please try again.');
          });
      });
    }

});

// Add smooth closing for the modal
$('#modalCloseButtonX, #modalCancelButton').on('click', function () {
    $('#editModal').modal('hide');
});
