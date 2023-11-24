document.addEventListener('DOMContentLoaded', function () {
  const createAccountButton = document.getElementById('createAccountButton');
  const accountTypeSelect = document.getElementById('accountType');
  const departmentDropdown = document.getElementById('departmentDropdown');



  if (createAccountButton && accountTypeSelect) {
    createAccountButton.addEventListener('click', handleRegistration);

    // Check the initial account type selection and set the visibility of the department dropdown
    if (accountTypeSelect.value === 'Student') {
      departmentDropdown.style.display = 'block';
    }
    accountTypeSelect.addEventListener('change', handleAccountTypeChange);
  }
  function handleAccountTypeChange() {
    const programCodeField = document.querySelector('#programCode');
    const programCodeLabel = document.querySelector('label[for="programCode"]');
    const selectedAccountType = accountTypeSelect.value;
    if (selectedAccountType === 'Student') {
      // Show the department dropdown and hide the checklist
      departmentDropdown.style.display = 'block';
    programCodeLabel.style.display = 'block'; // Show the Program Code label
    programCodeField.style.display = 'block'; // Show the Program Code field
    } else if (selectedAccountType === 'Counselor') {
      programCodeLabel.style.display = 'none';
    programCodeField.style.display = 'none';
    departmentDropdown.style.display = 'none';
    }
    else {
      // Hide both if none selected
      departmentDropdown.style.display = 'none';
    programCodeField.style.display = 'none';
    }
  }
});
function handleRegistration() {
  // Get form data
  const firstName = document.querySelector('#firstName').value;
  const lastName = document.querySelector('#lastName').value;
  const birthDate = document.querySelector('#birthdayDate').value;
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const idNumber = document.querySelector('#IDnumber').value;
  const phoneNumber = document.querySelector('#phoneNumber').value;
  const accountType = document.querySelector('#accountType').value;
  const departmentSelect = document.querySelector('#departmentSelect').value;
  const programCode = document.querySelector('#programCode').value;
  const createAccountButton = document.getElementById('createAccountButton');
  createAccountButton.disabled = true;

  // Regular expressions for validation
  const nameRegex = /^[a-zA-Z\s]+$/; // Only alphabetic characters
  const phPhoneNumberRegex = /^\+639\d{9}$/; // Philippine phone number format
  const dlsudEmailRegex = /^[\w-]+@dlsud\.edu\.ph$/; // DLSUD email format
  const programCodeRegex = /^[a-zA-Z]{3}\d{2}$/;

  // Perform form validation
  if (
    !firstName ||
    !lastName ||
    !birthDate ||
    !email ||
    !password ||
    !idNumber ||
    !programCode ||
    !phoneNumber
  ) {
    alert('Please fill out all required fields.');
    createAccountButton.disabled = false;
    return; // Prevent form submission
  }

  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    alert('First Name and Last Name should only contain alphabetic characters.');
    createAccountButton.disabled = false;
    return; // Prevent form submission
  }

  if (!phPhoneNumberRegex.test(phoneNumber)) {
    alert('Please enter a valid Philippine phone number (+639xxxxxxxxx).');
    createAccountButton.disabled = false;
    return; // Prevent form submission
  }

  if (!dlsudEmailRegex.test(email)) {
    alert('Please enter a valid DLSUD email address (e.g., user@dlsud.edu.ph).');
    createAccountButton.disabled = false;
    return; // Prevent form submission
  }

  if (accountType === 'Student' && !/^\d{9}$/.test(idNumber)) {
    createAccountButton.disabled = false;
    alert('Please enter a valid ID number for students.');
    return; // Prevent form submission
  } else if (accountType === 'Counselor' && !/^F-\d+$/.test(idNumber)) {
    createAccountButton.disabled = false;
    alert('Please enter a valid ID number for counselors ');
    return; // Prevent form submission
  }


  // Perform programCode validation
  if (accountType !== 'Counselor' && !programCodeRegex.test(programCode)) {
    createAccountButton.disabled = false;
    alert('Please enter a valid program code (e.g., BIT12).');
    return; // Prevent form submission
  }

  // Create a user object with form data
  const user = {
    firstName,
    lastName,
    birthDate,
    gender,
    email,
    password,
    idNumber,
    phoneNumber,
    accountType,
    departmentSelect,
    programCode
  };

  // Send the user data to the server
  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then((data) => {
    if (data.success) {
      const successMessage = document.querySelector('#successMessage');
      successMessage.style.display = 'block';
      const form = document.querySelector('#insertForm');
      form.style.display = 'none';
    } else {
      alert('Registration failed. Please try again.');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
    alert('Email may have been used already OR have not yet confirmed');
  })
  .finally(() => {
    // Re-enable the "Create Account" button after the registration process is complete
    createAccountButton.disabled = false;
  });
}
