// changePassword.js
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

            try {
                const response = await fetch('/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ newPassword }),
                });

                if (response.ok) {
                    // Password changed successfully
                    const message = await response.text();
                    alert(message); // You can customize this alert or redirect the user to a success page
                } else {
                    // Handle other response statuses
                    const errorMessage = await response.text();
                    alert(`Error: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                alert('Failed to change password. Please try again.'); // Provide user-friendly error message
            }
        });
    }
});
