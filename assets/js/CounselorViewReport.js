// Get the timeEncoded parameter from the URL
const urlParams = new URLSearchParams(window.location.search);
const timeEncoded = urlParams.get('timeEncoded');

// Now you can use the timeEncoded variable in your page logic
console.log("Time Encoded: " + timeEncoded);
