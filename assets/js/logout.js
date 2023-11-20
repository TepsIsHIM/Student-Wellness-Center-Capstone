document.getElementById('logout').addEventListener('click', async function(e) {
  const res = await fetch('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const json = await res.json()

  if (json.status === 200) {
    window.location.href = '/'
  }
})
