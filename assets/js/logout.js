document.getElementById('logout').addEventListener('click', async function (e) {
  const res = await fetch('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const json = await res.json();

  if (json.status === 200) {
    // Clear local session data or perform any cleanup
    document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Redirect to the home page
    window.location.href = '/';
  }
});