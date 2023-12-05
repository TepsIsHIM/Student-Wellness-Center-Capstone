// updatePassword.js

document.addEventListener('DOMContentLoaded', function () {
    const changeForm = document.getElementById('changeForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
  
    if (changeForm) {
      changeForm.addEventListener('submit', async function (event) {
        event.preventDefault();
  
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
  
        if (newPassword !== confirmPassword) {
          // Passwords do not match
          alert('Passwords do not match');
          return;
        }
  
        // Extract token from the fragment identifier
        const fragment = window.location.hash.substr(1);
        const params = new URLSearchParams(fragment);
        const token = params.get('access_token');
  
        try {
          const response = await fetch('/changePassword', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, newPassword }),
          });
  
          if (response.ok) {
            // Password changed successfully
            const message = await response.json();
            alert(message.success); // You can customize this alert or handle it as needed
          } else {
            // Handle other response statuses
            const errorMessage = await response.json();
            alert(`Error: ${errorMessage.error}`);
          }
        } catch (error) {
          console.error('Unexpected error:', error);
          alert('Failed to change password. Please try again.'); // Provide user-friendly error message
        }
      });
    }
  });
  