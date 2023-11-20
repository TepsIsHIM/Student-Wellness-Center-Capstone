document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logout');

  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        const response = await fetch('/logout', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Redirect to the login page or any other page after successful logout
          window.location.href = '/login';
        } else {
          console.error('Logout failed');
        }
      } catch (error) {
        console.error('Unexpected error during logout:', error);
      }
    });
  }
});
