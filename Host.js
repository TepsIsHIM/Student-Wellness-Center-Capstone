const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const myapp = express();
const port = 3030;
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser')

myapp.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// Middleware to parse JSON requests
myapp.use(express.json());
myapp.use(express.urlencoded({ extended: true }));
myapp.use(cors());
myapp.use(cookieParser());


myapp.set('view engine', 'ejs');
myapp.set('views', __dirname + '/view');
myapp.use(express.static(__dirname + '/assets'));

// Supabase configuration
const { createClient, SupabaseClient } = require('@supabase/supabase-js');
const supabase = createClient('https://waeqvekicdlqijxmhclw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZXF2ZWtpY2RscWlqeG1oY2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUyNjMxNjIsImV4cCI6MjAxMDgzOTE2Mn0.8Ga9_qwNgeAKlqWI_xCLQPJFqGha3XfiNMxrT8_RXaM');

async function getUser(type, email) {
  if (type) {
    const { data } = await supabase
      .from(type)
      .select('*')
      .eq('email', email?.toUpperCase())
      .single();

    if (!data && type === 'Student Accounts') return getUser('Counselor Accounts', email)
    else false

    return data
  }
}

myapp.use(async (req, res, next) => {
  if (req.url.startsWith('/vendor') || req.url.startsWith('/img') || req.url.startsWith('/inactivity.js') || req.url.startsWith('/favicon.ico') || req.url.startsWith('/logout')) return next()

  const studentToken = req.cookies.userData;
  const studentUser = await supabase.auth.getUser(studentToken)
  const studentData = await getUser('Student Accounts', studentUser.data?.user?.email)

  res.locals.studentData = studentData;
  res.locals.counselorData = studentData;
  next();
});


//=========GETTING===========//
myapp.get('/', (req, res) => {
  res.render('LoginPage');
});

myapp.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword');
});

myapp.get('/changePassword', (req, res) => {
  res.render('changePassword');
});

myapp.get('/Registerpage', (req, res) => {
  res.render('RegisterPage');
});

myapp.get('/StudentHomepage', (req, res) => {
  const studentData = res.locals.studentData;
  res.render('StudentHomepage', { studentData });
});

myapp.get('/studentProfilePage', (req, res) => {
  const studentData = res.locals.studentData;
  res.render('studentProfilePage', { studentData });
});

myapp.get('/studentAppointmentStatus', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const studentData = res.locals.studentData;
    const studentEmail = studentData.email; // Assuming the email is stored in counselorData

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: pendingAppointment, error } = await supabase
      .from('Pending Appointment') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: acceptedAppointment, error1 } = await supabase
      .from('Accepted Appointment') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error1.message);
      return res.status(500).send('Internal server error');
    }

    res.render('studentAppointmentStatus', { studentData, pendingAppointment, acceptedAppointment });
  } catch (error1) {
    // Handle any unexpected server errors
    console.error('Server error:', error1.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/studentAppointmentHistory', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const studentData = res.locals.studentData;
    const studentEmail = studentData.email;  // Assuming the email is stored in counselorData

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: appointmentHistory, error } = await supabase
      .from('Appointment History') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .in('prog_status', ['COMPLETED', 'REJECTED', 'CANCELLED'])
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    const { data: ignoredAppointmentHistory, error1 } = await supabase
      .from('Appointment History') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .in('prog_status', ['IGNORED'])
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error1.message);
      return res.status(500).send('Internal server error');
    }


    res.render('studentAppointmentHistory', { studentData, appointmentHistory, ignoredAppointmentHistory });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorList', (req, res) => {
  res.render('CounselorList');
});

myapp.get('/CreateAppointmentPage', (req, res) => {
  const studentData = res.locals.studentData;
  res.render('CreateAppointmentPage', { studentData });
});

myapp.get('/CounselorHomePage',async (req, res) => {
  let hasNewAppointments;
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;

    // Fetch counselor's departments
    const { data: counselorDepartments, error: counselorError } = await supabase
      .from('Counselor Role')
      .select('department')
      .eq('email', counselorEmail);

    if (counselorError) {
      console.error('Error fetching counselor departments:', counselorError.message);
      return res.status(500).send('Internal server error');
    }

    const departments = counselorDepartments.map(entry => entry.department);

    // Fetch new appointments
    const { data: newAppointments, error: newAppointmentsError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .in('department', departments)
      .eq('notif', true)
      .order('date', { ascending: true });

    if (newAppointmentsError) {
      console.error('Error fetching new appointments:', newAppointmentsError.message);
      console.log('Has new appointments:', newAppointments);
      return res.status(500).send('Internal server error');
    }
    else{
      console.log('Has new appointments:', newAppointments);
    }

    hasNewAppointments = newAppointments.length > 0;

    // Fetch all pending appointments
    const { data: pendingAppointments, error } = await supabase
      .from('Pending Appointment')
      .select('*')
      .in('department', departments)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching pending appointments:', error.message);
      return res.status(500).send('Internal server error');
    }


    const currentTime = new Date();
    const updatedPendingAppointments = [];

    // Loop through pending appointments
    for (const appointment of pendingAppointments) {
      const appointedDateTime = new Date(`${appointment.appointed_date} ${appointment.appointed_time}`);

      if (currentTime > appointedDateTime) {
        // Prepare data for 'Appointment History' with REJECTED status
        const rejectedAppointmentData = {
          counselor_email: counselorEmail,
          counselor_Fname: counselorData.first_name,
          counselor_Lname: counselorData.last_name,
          date: appointment.appointed_date,
          time: appointment.appointed_time,
          email: appointment.email,
          department: appointment.department,
          first_name: appointment.first_name,
          last_name: appointment.last_name,
          appointed_date: appointment.appointed_date,
          appointed_time: appointment.appointed_time,
          prog_status: 'IGNORED'
          // Add other fields needed for the Appointment History table
        };

        // Insert rejected appointment in the 'Appointment History' table
        const { data: insertedAppointment, error: insertError } = await supabase
          .from('Appointment History')
          .insert(rejectedAppointmentData);

        if (insertError) {
          console.error('Error inserting rejected appointment:', insertError.message);
          // Handle the error if insertion fails
        }

        // Delete the rejected appointment from 'Pending Appointment'
        const { error: deleteError } = await supabase
          .from('Pending Appointment')
          .delete()
          .eq('id', appointment.id);

        if (deleteError) {
          console.error('Error deleting expired appointment:', deleteError.message);
          // Handle the error if deletion fails
        }
      } else {
        // Appointment is still pending, add it to the updated list
        updatedPendingAppointments.push(appointment);
        // console.log('Pending Appointments:', updatedPendingAppointments);

      }
    }

    const pendingAppointmentsCount = newAppointments.length;
    res.render('CounselorHomePage', { counselorData, pendingAppointments: updatedPendingAppointments, hasNewAppointments: hasNewAppointments, pendingAppointmentsCount:pendingAppointmentsCount });
  } catch (error) {

    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorProfilePage', (req, res) => {
  const counselorData = res.locals.counselorData;
  res.render('CounselorProfilePage', { counselorData });
});

myapp.get('/CounselorPendingAppointmentPage', async (req, res) => {
  let hasNewAppointments;
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;

    // Fetch counselor's departments
    const { data: counselorDepartments, error: counselorError } = await supabase
      .from('Counselor Role')
      .select('department')
      .eq('email', counselorEmail);

    if (counselorError) {
      console.error('Error fetching counselor departments:', counselorError.message);
      return res.status(500).send('Internal server error');
    }

    const departments = counselorDepartments.map(entry => entry.department);

    // Fetch new appointments
    const { data: newAppointments, error: newAppointmentsError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .in('department', departments)
      .eq('notif', true)
      .order('date', { ascending: true });

    if (newAppointmentsError) {
      console.error('Error fetching new appointments:', newAppointmentsError.message);
      console.log('Has new appointments:', newAppointments);
      return res.status(500).send('Internal server error');
    }
    else{
      console.log('Has new appointments:', newAppointments);
    }

    hasNewAppointments = newAppointments.length > 0;

    // Fetch all pending appointments
    const { data: pendingAppointments, error } = await supabase
      .from('Pending Appointment')
      .select('*')
      .in('department', departments)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching pending appointments:', error.message);
      return res.status(500).send('Internal server error');
    }


    const currentTime = new Date();
    const updatedPendingAppointments = [];

    // Loop through pending appointments
    for (const appointment of pendingAppointments) {
      const appointedDateTime = new Date(`${appointment.appointed_date} ${appointment.appointed_time}`);

      if (currentTime > appointedDateTime) {
        // Prepare data for 'Appointment History' with REJECTED status
        const rejectedAppointmentData = {
          counselor_email: counselorEmail,
          counselor_Fname: counselorData.first_name,
          counselor_Lname: counselorData.last_name,
          date: appointment.appointed_date,
          time: appointment.appointed_time,
          email: appointment.email,
          department: appointment.department,
          first_name: appointment.first_name,
          last_name: appointment.last_name,
          appointed_date: appointment.appointed_date,
          appointed_time: appointment.appointed_time,
          prog_status: 'IGNORED'
          // Add other fields needed for the Appointment History table
        };

        // Insert rejected appointment in the 'Appointment History' table
        const { data: insertedAppointment, error: insertError } = await supabase
          .from('Appointment History')
          .insert(rejectedAppointmentData);

        if (insertError) {
          console.error('Error inserting rejected appointment:', insertError.message);
          // Handle the error if insertion fails
        }

        // Delete the rejected appointment from 'Pending Appointment'
        const { error: deleteError } = await supabase
          .from('Pending Appointment')
          .delete()
          .eq('id', appointment.id);

        if (deleteError) {
          console.error('Error deleting expired appointment:', deleteError.message);
          // Handle the error if deletion fails
        }
      } else {
        // Appointment is still pending, add it to the updated list
        updatedPendingAppointments.push(appointment);
        // console.log('Pending Appointments:', updatedPendingAppointments);

      }
    }

    // Update new_flag for the viewed appointments
    for (const appointment of updatedPendingAppointments) {
      const { error: updateError } = await supabase
        .from('Pending Appointment')
        .update({ notif: false })
        .eq('id', appointment.id);


      if (updateError) {
        console.error('Error updating appointment status:', updateError.message);
        // Handle the error if the update fails
      }
      else {
        // console.log('Pending Appointments:', updatedPendingAppointments);
      }
    }

    res.render('CounselorPendingAppointmentPage', { counselorData, pendingAppointments: updatedPendingAppointments, hasNewAppointments: hasNewAppointments, });
  } catch (error) {

    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});


myapp.get('/CounselorAcceptedAppointmentPage', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email; // Assuming the email is stored in counselorData

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: acceptedAppointments, error } = await supabase
      .from('Accepted Appointment') // Replace with your actual table name
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching pending appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorAcceptedAppointmentPage', { counselorData, acceptedAppointments });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorAppointmentHistoryPage', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email; // Assuming the email is stored in counselorData

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: appointmentHistory, error } = await supabase
      .from('Appointment History') // Replace with your actual table name
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorAppointmentHistoryPage', { counselorData, appointmentHistory });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorLogs', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const { data: counselorLog, error } = await supabase
      .from('Report')
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date_encoded', { ascending: true }, 'time_encoded', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorLogs', { counselorLog });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorReport', async(req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const { data: counselorReport, error } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date', { ascending: true }, 'time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorReport', { counselorReport, });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorManualReport', async(req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const { data: counselorReport, error } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date', { ascending: true }, 'time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorManualReport', { counselorReport, });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/emailSuggestions', async (req, res) => {
  const userInput = req.query.input; 
  const { data: suggestedEmails, error } = await supabase
    .from('Student Accounts')
    .select('*')
    .ilike('email', `%${userInput}%`);

  if (error) {
    // Handle error, if necessary
    console.error('Error fetching student data:', error);
    return res.status(500).json({ error: 'Error fetching suggestions' });
  }

  res.json({ suggestions: suggestedEmails });
});

myapp.get('/adminHomepage', (req, res) => {
  const counselorData = res.locals.counselorData;
  res.render('adminHomepage', { counselorData });
});

myapp.get('/adminCreateAccounts', (req, res) => {
  const counselorData = res.locals.counselorData;
  res.render('adminCreateAccounts', { counselorData });
});

myapp.get('/adminEditRoles', async (req, res) => {
  const counselorData = res.locals.counselorData;
  try {
    const { data: editRoles, error } = await supabase
      .from('Counselor Accounts') 
      .select('*')

    if (error) {
      // Handle the error
      console.error('Error fetching Counselor Accounts:', error.message);
      return res.status(500).send('Internal server error');
    }
    res.render('adminEditRoles', {  editRoles,counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/adminAppointmentHistory', async (req, res) => {
  const counselorData = res.locals.counselorData;
  try {
    const { data: appointmentHistory, error } = await supabase
      .from('Appointment History')
      .select('*')
      .order('date', { ascending: true }); 

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('adminAppointmentHistory', { appointmentHistory,counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/adminAcceptedAppointment', async (req, res) => {
  const counselorData = res.locals.counselorData;
  try {
    const { data: acceptedAppointment, error } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .order('date', { ascending: true }); 

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('adminAcceptedAppointment', { acceptedAppointment, counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/adminPendingAppointment', async (req, res) => {
  const counselorData = res.locals.counselorData;
  try {
    const { data: pendingAppointment, error } = await supabase
      .from('Pending Appointment')
      .select('*')
      .order('date', { ascending: true }); 

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('adminPendingAppointment', { pendingAppointment, counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/adminViewAccounts', async (req, res) => {
  const counselorData = res.locals.counselorData;
  try {
    const { data: studentViewAccounts, error } = await supabase
      .from('Student Accounts')
      .select('*')
      .order('email', { ascending: true }); 

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }
    const { data: counselorViewAccounts, error1 } = await supabase
      .from('Counselor Accounts')
      .select('*')
      .order('email', { ascending: true }); 

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }
    res.render('adminViewAccounts', { studentViewAccounts,counselorViewAccounts, counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/adminCounselorLog', async (req, res) => {
  const counselorData = res.locals.counselorData;
  try {
    const { data: counselorLog, error } = await supabase
      .from('Report')
      .select('*')
      .order('date_encoded', { ascending: true },'time_encoded', { ascending: true }); 

    if (error) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('adminCounselorLog', { counselorLog,counselorData });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

//=========POSTING===========//



  // REGISTRATION
myapp.post('/register', async (req, res) => {
  const { idNumber, email, password, lastName, firstName, gender, birthDate, phoneNumber, accountType, departmentSelect } = req.body;

  const uppercaseFirstName = firstName.toUpperCase()
  const uppercaseLastName = lastName.toUpperCase()
  const uppercaseEmail = email.toUpperCase()
  const uppercaseIDNumber= idNumber.toUpperCase()
  const uppercaseGender = gender.toUpperCase()
  const uppercaseAccountType = accountType.toUpperCase()
  try {
    const emailExists = await supabase
      .from(accountType === 'Student' ? 'Student Accounts' : 'Counselor Accounts')
      .select('email')
      .eq('email', uppercaseEmail)
      .single();

    if (emailExists.data) {
      // Handle the case where the email is already registered
      res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
      return;
    }

    // Register the user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Error registering user:', error.message);
      res.status(500).json({ error: 'Registration failed' });
      return;
    }

    // SEPERATE
    if (accountType === 'Student') {   
      // INSERT
      const { data: userData, error: userError } = await supabase
        .from('Student Accounts')
        .insert([
          {
            first_name: uppercaseFirstName,
            last_name: uppercaseLastName,
            birth_date: birthDate,
            gender: uppercaseGender,
            email: uppercaseEmail,
            password, 
            id_number: uppercaseIDNumber,
            phone_number: phoneNumber,
            accountType: uppercaseAccountType,
            department:departmentSelect
          },
        ])
        .single();


      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          // Handle the case where the email is already registered
          res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
        } else {
          console.error('Error registering user:', error.message);
          res.status(500).json({ error: 'Registration failed' });
        }
        return;
      }
    } else if (accountType === 'Counselor') {
      // INSERT
      const { data: userData, error: userError } = await supabase
        .from('Counselor Accounts')
        .insert([
          {
            first_name: uppercaseFirstName,
            last_name: uppercaseLastName,
            birth_date: birthDate,
            gender: uppercaseGender,
            email: uppercaseEmail,
            password, 
            id_number: uppercaseIDNumber,
            phone_number: phoneNumber,
            accountType: uppercaseAccountType,

          },
        ])
        .single();

      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          // Handle the case where the email is already registered
          res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
        } else {
          console.error('Error registering user:', error.message);
          res.status(500).json({ error: 'Registration failed' });
        }
        return;
      }
    }


    res.status(200).json({ success: 'Registration successful' });


  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

myapp.post('/forgotPassword', async (req, res) => {
  const { email } = req.body;
  try {
    // Fetch the student data from the specific table
    const { data: studentData, error: studentError } = await supabase
      .from('Student Accounts')
      .select('*')
      .eq('email', email.toUpperCase())
      .single();

    if (studentData) {
      await supabase.auth.resetPasswordForEmail(studentData.email);
      return res.status(200).send('Password reset email sent successfully');
    }

      
    const { data: counselorData, error: counselorError } = await supabase
      .from('Counselor Accounts')
      .select('*')
      .eq('email', email.toUpperCase())
      .single();

    if (counselorData) {
      await supabase.auth.resetPasswordForEmail(counselorData.email);
      return res.status(200).send('Password reset email sent successfully');
    }

    // If user not found in both student and counselor accounts
    console.error('User data not found');
    return res.status(404).send('User not found');

  } catch (e) {
    console.error('Unexpected error:', e);
    return res.status(500).send('Failed');
  }
});

myapp.post('/changePassword', async (req, res) => {
  const { email,password } = req.body;


  try {
    const { data, error: changepsw } = await supabase.auth.updateUser({ 
      email: email, 
      password: password 
    })
    
    if (changepsw) {
     
      console.error('Error logging in:', changepsw.message);
      if (changepsw.message.includes("Invalid login credentials")) {
        res.status(401).json({ error: 'Incorrect email or password' });
      } else {
        res.status(500).json({ error: 'Login failed' });
      }
    
      return;
    }
    if (!data || !data.user) {
      console.error('Authentication failed');
      res.status(401).json({ error: 'Authentication failed' });
      return;
    }

  } catch (e) {
    console.error('Unexpected error:', e);
    return res.status(500).send('Failed');
  }
});

// LOGIN
myapp.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      console.error('Error logging in:', loginError.message);
      if (loginError.message.includes("Invalid login credentials")) {
        res.status(401).json({ error: 'Incorrect email or password' });
      } else {
        res.status(500).json({ error: 'Login failed' });
      }
    
      return;
    }

    if (!data || !data.user) {
      console.error('Authentication failed');
      res.status(401).json({ error: 'Authentication failed' });
      return;
    }

    // Fetch the student data from the specific table
    const { data: studentData, error: studentError } = await supabase
      .from('Student Accounts')
      .select('*')
      .eq('email', email.toUpperCase())
      .single();

    // Check if the user is a student
    if (studentData) {
      // Store the student data in the session
      res.cookie('userData', data.session.access_token, {
        httpOnly: true
      })

      res
        .status(200)
        .json({ success: 'Login successful', accountType: 'Student' });
      return;

    } else {
      // Fetch the counselor data from the specific table
      const { data: counselorData, error: counselorError } = await supabase
        .from('Counselor Accounts')
        .select('*')
        .eq('email', email.toUpperCase())
        .single();

      // Check if the user is a counselor
      if (counselorData) {
        res.cookie('userData', data.session.access_token, {
          httpOnly: true
        })
        res.status(200).json({ success: 'Login successful', accountType: 'Counselor' });
        return;
      }
      else 
      {console.error('User data not found');
        res.status(404).json({ error: 'User not found' });
      }

    }
  } catch (e) {
    console.error('Unexpected error:', e); 
    res.status(500).json({ error: 'Login failed' });
  }
});

myapp.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      res.clearCookie('userData');
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");


      res.status(200).json({ status: 200, message: 'Logout successful' });
    } else {
      res.status(500).json({ status: 500, message: error.message || 'Logout failed' });
    }
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    res.status(500).json({ status: 500, error: 'Logout failed' });
  }
});

// APPOINTMENT
myapp.post('/create-appointment', async (req, res) => { 
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.studentData.email;
    const userFirstName = res.locals.studentData.first_name;
    const userLastName = res.locals.studentData.last_name;
    const department = res.locals.studentData.department;
    const appointmentDate = req.body.date;
    const appointmentTime = req.body.time;
    const service = req.body.service;

    // Get the current date and time when the "appoint" button is clicked in the Philippines Time Zone (Asia/Manila)
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    // Format the time in the desired time zone
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);

    // Extract the date component
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: checkPending, error: checkPendingError } = await supabase
    .from('Pending Appointment')
    .select('*')
    .eq('email', userEmail);

    const { data: checkAccepted, error: checkAcceptedError } = await supabase
    .from('Accepted Appointment')
    .select('*')
    .eq('email', userEmail);

    if (checkPending && checkPending.length > 0) {
      return res.json({ success: false, message: 'You already have a pending appointment.' });
    }

    // Check if there's an existing accepted appointment
    if (checkAccepted && checkAccepted.length > 0) {
      return res.json({ success: false, message: 'You already have an ongoing appointment.' });
    }


    const { data:appoint, error } = await supabase
      .from('Pending Appointment')
      .upsert([
        {
          email: userEmail,
          last_name: userLastName,
          first_name: userFirstName,
          date: appointmentDateStr,
          time: appointmentTimeStr,
          department: department,
          notes: service,
          appointed_time: appointmentTime ,
          appointed_date: appointmentDate,
          prog_stat: 'PENDING',
          notif: true
        },
      ]);

    if (error) {
      // Handle the error
      console.error('Error creating appointment:', error.message);
      res.json({ success: false });
    } else {
      // Appointment created successfully
      console.log('Appointment created successfully:', appoint);
      res.json({ success: true });
    }
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.json({ success: false });
  }
});

myapp.post('/studentCancelAppointment/:appointmentId', async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;  
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const cancelledAppointmentData = {
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept ,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_status: 'CANCELLED'

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(cancelledAppointmentData);

    if (insertError) {
      console.error('Error inserting cancelled appointment:', insertError.message);
      return res.status(500).send('Failed to cancel the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});
//EDIT ROLES
myapp.post('/updateDepartments', async (req, res) => {
  const { email, departments } = req.body;

  try {
    // Fetch existing user departments from the database
    const { data: existingDepartments, error: existingError } = await supabase
      .from('Counselor Role')
      .select('department')
      .eq('email', email);

    if (existingError) {
      throw existingError;
    }

    // Extract existing department names from the result
    const existingDepartmentNames = existingDepartments.map(dept => dept.department);

    // Determine departments to delete and insert
    const departmentsToDelete = existingDepartmentNames.filter(dept => !departments.includes(dept));
    const departmentsToInsert = departments.filter(dept => !existingDepartmentNames.includes(dept));

    // Perform deletion and insertion
    await supabase
      .from('Counselor Role')
      .delete()
      .eq('email', email)
      .in('department', departmentsToDelete);

    await supabase
      .from('Counselor Role')
      .insert(
        departmentsToInsert.map(dept => ({ email, department: dept }))
      );

    res.status(200).json({ message: 'Departments updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update departments' });
  }
});

myapp.post('/acceptAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName= counselorData.first_name;
    const counselorLName= counselorData.last_name;
    const appointmentId = req.params.appointmentId;  
    const remarks = req.body.remarks;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const acceptedAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept ,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_stat: 'ACCEPTED',
      remarks: remarks

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Accepted Appointment')
      .insert(acceptedAppointmentData);

    if (insertError) {
      console.error('Error inserting accepted appointment:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment accepted successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/completeAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName= counselorData.first_name;
    const counselorLName= counselorData.last_name;
    const appointmentId = req.params.appointmentId;  
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'completed Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;


    // Prepare data for 'completed Appointment' with counselor details and adjusted date/time
    const completedAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept ,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_status: 'COMPLETED'

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    // Save accepted appointment in the 'Appointment History' table
const { data: insertAppointmentHistory, error: insertError1 } = await supabase
.from('Appointment History')
.insert(completedAppointmentData);

if (insertError1) {
console.error('Error inserting completed appointment:', insertError1.message);
return res.status(500).send('Failed to complete the appointment');
}

// Insert into 'Completed Appointment (No Reports)' table
const { data: insertCompletedAppointments, error: insertError2 } = await supabase
.from('Completed Appointment (No Reports)')
.insert(completedAppointmentData);

if (insertError2) {
console.error('Error inserting into Completed Appointment (No Reports):', insertError2.message);
return res.status(500).send('Failed to complete the appointment');
}

    // Remove the appointment from 'completed Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Accepted Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error completed appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment completed successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/rejectAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName= counselorData.first_name;
    const counselorLName= counselorData.last_name;
    const appointmentId = req.params.appointmentId;  
    const remarks = req.body.remarks;
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const rejectedAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept ,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_status: 'REJECTED',
      remarks: remarks

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(rejectedAppointmentData);

    if (insertError) {
      console.error('Error inserting rejected appointment:', insertError.message);
      return res.status(500).send('Failed to reject the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment rejected successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/cancelAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = res.locals.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName= counselorData.first_name;
    const counselorLName= counselorData.last_name;
    const appointmentId = req.params.appointmentId; 
    const remarks = req.body.remarks; 
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;

    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const cancelledAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept ,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_status: 'CANCELLED',
      remarks: remarks

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(cancelledAppointmentData);

    if (insertError) {
      console.error('Error inserting cancelled appointment:', insertError.message);
      return res.status(500).send('Failed to cancel the appointment');
    }

    // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Accepted Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-manualCounseling', async (req, res) => {
  const { email, fname, lname, department, progcode, concernSelect1, clientSelect1, sessionSelect1,dateInput1, hoursInput1, minutesInput1,noteTextarea1  } = req.body;
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.counselorData.email;
    const userFirstName = res.locals.counselorData.first_name;
    const userLastName = res.locals.counselorData.last_name;
    const encodedDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const encodedTimeStr = encodedDateTime.toLocaleString('en-US', options);
    const encodedDateStr = encodedDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const encodeData = {
      student_email: email.toUpperCase(),
      student_lname: lname.toUpperCase(),
      student_fname: fname.toUpperCase(),
      progcode: progcode.toUpperCase(),
      department: department.toUpperCase(),
      service: "COUNSELING",
      concern: concernSelect1.toUpperCase(),
      client: clientSelect1.toUpperCase(),
      session: sessionSelect1.toUpperCase(),
      notes: noteTextarea1,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: encodedDateStr,
      time_encoded: encodedTimeStr,
      hours:hoursInput1,
      minutes:minutesInput1,
      date_appointed:dateInput1

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Encode Report:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    res.status(200).json({ message: 'Encoded successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

//MANUAL REPORT
myapp.post('/submit-manualConsultation', async (req, res) => {
  const { email, fname, lname, department, progcode, consultSelect2 ,dateInput2, hoursInput2, minutesInput2,noteTextarea2  } = req.body;
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.counselorData.email;
    const userFirstName = res.locals.counselorData.first_name;
    const userLastName = res.locals.counselorData.last_name;
    const encodedDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const encodedTimeStr = encodedDateTime.toLocaleString('en-US', options);
    const encodedDateStr = encodedDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const encodeData = {
      student_email: email.toUpperCase(),
      student_lname: lname.toUpperCase(),
      student_fname: fname.toUpperCase(),
      progcode: progcode.toUpperCase(),
      department: department.toUpperCase(),
      service: "CONSULTATION",
      category: consultSelect2,
      notes: noteTextarea2,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: encodedDateStr,
      time_encoded: encodedTimeStr,
      hours:hoursInput2,
      minutes:minutesInput2,
      date_appointed:dateInput2

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Encode Report:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    res.status(200).json({ message: 'Encoded successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-manualInterview', async (req, res) => {
  const { email, fname, lname, department, progcode, concernSelect3,dateInput3, hoursInput3, minutesInput3,noteTextarea3  } = req.body;
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.counselorData.email;
    const userFirstName = res.locals.counselorData.first_name;
    const userLastName = res.locals.counselorData.last_name;
    const encodedDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const encodedTimeStr = encodedDateTime.toLocaleString('en-US', options);
    const encodedDateStr = encodedDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const encodeData = {
      student_email: email.toUpperCase(),
      student_lname: lname.toUpperCase(),
      student_fname: fname.toUpperCase(),
      progcode: progcode.toUpperCase(),
      department: department.toUpperCase(),
      service: "INTERVIEW",
      concern: concernSelect3.toUpperCase(),
      notes: noteTextarea3,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: encodedDateStr,
      time_encoded: encodedTimeStr,
      hours:hoursInput3,
      minutes:minutesInput3,
      date_appointed:dateInput3

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Encode Report:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    res.status(200).json({ message: 'Encoded successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-manualTesting', async (req, res) => {
  const { email, fname, lname, department, progcode, categType4, concernSelect4,dateInput4, hoursInput4, minutesInput4,noteTextarea4  } = req.body;
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.counselorData.email;
    const userFirstName = res.locals.counselorData.first_name;
    const userLastName = res.locals.counselorData.last_name;
    const encodedDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const encodedTimeStr = encodedDateTime.toLocaleString('en-US', options);
    const encodedDateStr = encodedDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const encodeData = {
      student_email: email.toUpperCase(),
      student_lname: lname.toUpperCase(),
      student_fname: fname.toUpperCase(),
      progcode: progcode.toUpperCase(),
      department: department.toUpperCase(),
      service: "TESTING",
      category: categType4,
      concern: concernSelect4.toUpperCase(),
      notes: noteTextarea4,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: encodedDateStr,
      time_encoded: encodedTimeStr,
      hours:hoursInput4,
      minutes:minutesInput4,
      date_appointed:dateInput4

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Encode Report:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    res.status(200).json({ message: 'Encoded successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-manualOthers', async (req, res) => {
  const { email, fname, lname, department, progcode, concernSelect5, clientSelect5,dateInput5, hoursInput5, minutesInput5,noteTextarea5 } = req.body;
  try {
    // Access session data, such as email and first name
    const userEmail = res.locals.counselorData.email;
    const userFirstName = res.locals.counselorData.first_name;
    const userLastName = res.locals.counselorData.last_name;
    const encodedDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false, // Use 24-hour format
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const encodedTimeStr = encodedDateTime.toLocaleString('en-US', options);
    const encodedDateStr = encodedDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const encodeData = {
      student_email: email.toUpperCase(),
      student_lname: lname.toUpperCase(),
      student_fname: fname.toUpperCase(),
      progcode: progcode.toUpperCase(),
      department: department.toUpperCase(),
      service: "OTHERS",
      concern: concernSelect5.toUpperCase(),
      client: clientSelect5.toUpperCase(),
      notes: noteTextarea5,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: encodedDateStr,
      time_encoded: encodedTimeStr,
      hours:hoursInput5,
      minutes:minutesInput5,
      date_appointed:dateInput5

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Encode Report:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

    res.status(200).json({ message: 'Encoded successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

//AUTO REPORT
myapp.post('/submit-counseling', async (req, res) => {
  try {
    const { nameOfConcern,typeOfClient,typeOfSession,hours,minutes,notes,id } = req.body;
    const counselorData = res.locals.counselorData;
    const userEmail = counselorData.email;
    const userFirstName = counselorData.first_name;
    const userLastName = counselorData.last_name; 
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('id', id);

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appointdate = appointmentDetails.appointed_date;

    const appointprogcode = appointmentDetails.progCode;
    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const encodeData = {
      student_email: student_Email,
      student_lname: student_LName,
      student_fname: student_FName,
      progcode: appointprogcode,
      department: dept,
      service:"COUNSELING",
      concern: nameOfConcern,
      client: typeOfClient,
      session: typeOfSession,
      notes: notes,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: appointmentDateStr,
      time_encoded: appointmentTimeStr,
      hours: hours,
      minutes: minutes,
      date_appointed: appointdate,
    };
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Report:', insertError.message);
      return res.status(500).send('Failed to Report');
    }


    const { error: deleteError } = await supabase
      .from('Completed Appointment (No Reports)')
      .delete()
      .eq('id',id);

    if (deleteError) {
      console.error('Error deleting:', deleteError.message);

    }
    res.status(200).json({ message: 'Reported successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-consultation', async (req, res) => {
  try {
    const {  category,hours,minutes,notes,title,id } = req.body;
    const counselorData = res.locals.counselorData;
    const userEmail = counselorData.email;
    const userFirstName = counselorData.first_name;
    const userLastName = counselorData.last_name; 
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('id', id);

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appointdate = appointmentDetails.appointed_date;

    const appointprogcode = appointmentDetails.progCode;
    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const encodeData = {
      student_email: student_Email,
      student_lname: student_LName,
      student_fname: student_FName,
      progcode: appointprogcode,
      department: dept,
      service: "CONSULTATION",
      category: category,
      notes: notes,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: appointmentDateStr,
      time_encoded: appointmentTimeStr,
      hours: hours,
      minutes: minutes,
      date_appointed: appointdate,
    };
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Report:', insertError.message);
      return res.status(500).send('Failed to Report');
    }


    const { error: deleteError } = await supabase
      .from('Completed Appointment (No Reports)')
      .delete()
      .eq('id',id);

    if (deleteError) {
      console.error('Error deleting:', deleteError.message);

    }
    res.status(200).json({ message: 'Reported successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-interview', async (req, res) => {
  try {
    const { nameOfConcern,hours,minutes,notes,title,id } = req.body;
    const counselorData = res.locals.counselorData;
    const userEmail = counselorData.email;
    const userFirstName = counselorData.first_name;
    const userLastName = counselorData.last_name; 
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('id', id);

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appointdate = appointmentDetails.appointed_date;

    const appointprogcode = appointmentDetails.progCode;
    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const encodeData = {
      student_email: student_Email,
      student_lname: student_LName,
      student_fname: student_FName,
      progcode: appointprogcode,
      department: dept,
      service: "INTERVIEW",
      concern: nameOfConcern,
      notes: notes,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: appointmentDateStr,
      time_encoded: appointmentTimeStr,
      hours: hours,
      minutes: minutes,
      date_appointed: appointdate,
    };
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Report:', insertError.message);
      return res.status(500).send('Failed to Report');
    }


    const { error: deleteError } = await supabase
      .from('Completed Appointment (No Reports)')
      .delete()
      .eq('id',id);

    if (deleteError) {
      console.error('Error deleting:', deleteError.message);

    }
    res.status(200).json({ message: 'Reported successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-testing', async (req, res) => {
  try {
    const { nameOfConcern,categType,hours,minutes,notes,id } = req.body;
    const counselorData = res.locals.counselorData;
    const userEmail = counselorData.email;
    const userFirstName = counselorData.first_name;
    const userLastName = counselorData.last_name; 
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('id', id);

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appointdate = appointmentDetails.appointed_date;

    const appointprogcode = appointmentDetails.progCode;
    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const encodeData = {
      student_email: student_Email,
      student_lname: student_LName,
      student_fname: student_FName,
      progcode: appointprogcode,
      department: dept,
      service: "TESTING",
      concern: nameOfConcern.toUpperCase(),
      category: categType,
      notes: notes,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: appointmentDateStr,
      time_encoded: appointmentTimeStr,
      hours: hours,
      minutes: minutes,
      date_appointed: appointdate,
    };
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Report:', insertError.message);
      return res.status(500).send('Failed to Report');
    }


    const { error: deleteError } = await supabase
      .from('Completed Appointment (No Reports)')
      .delete()
      .eq('id',id);

    if (deleteError) {
      console.error('Error deleting:', deleteError.message);

    }
    res.status(200).json({ message: 'Reported successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/submit-others', async (req, res) => {
  try {
    const { nameOfConcern,typeOfClient,hours,minutes,notes,id } = req.body;
    const counselorData = res.locals.counselorData;
    const userEmail = counselorData.email;
    const userFirstName = counselorData.first_name;
    const userLastName = counselorData.last_name; 
    const appointmentDateTime = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Completed Appointment (No Reports)')
      .select('*')
      .eq('id', id);

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appointdate = appointmentDetails.appointed_date;
    const appointprogcode = appointmentDetails.progCode;
    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const encodeData = {
      student_email: student_Email,
      student_lname: student_LName,
      student_fname: student_FName,
      progcode: appointprogcode,
      department: dept,
      service: "OTHERS",
      concern: nameOfConcern,
      client: typeOfClient,
      notes: notes,
      counselor_email: userEmail,
      counselor_fname: userFirstName,
      counselor_lname: userLastName,
      date_encoded: appointmentDateStr,
      time_encoded: appointmentTimeStr,
      hours: hours,
      minutes: minutes,
      date_appointed: appointdate,
    };
    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: encodeReport, error: insertError } = await supabase
      .from('Report')
      .insert(encodeData);

    if (insertError) {
      console.error('Error Report:', insertError.message);
      return res.status(500).send('Failed to Report');
    }


    const { error: deleteError } = await supabase
      .from('Completed Appointment (No Reports)')
      .delete()
      .eq('id',id);

    if (deleteError) {
      console.error('Error deleting:', deleteError.message);

    }
    res.status(200).json({ message: 'Reported successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/adminCreateAccount', async (req, res) => {
  const { idNumber, email, lastName, firstName, gender, birthDate, phoneNumber, accountType, departmentSelect } = req.body;
  const uppercaseFirstName = firstName.toUpperCase();
  const uppercaseLastName = lastName.toUpperCase();
  const uppercaseEmail = email.toUpperCase()
  const uppercaseIDNumber= idNumber.toUpperCase()
  const uppercaseGender = gender.toUpperCase()
  const uppercaseAccountType = accountType.toUpperCase()
  try {



    // SEPERATE
    if (accountType === 'Student') {   
      // Register the user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'student123'
      });

      if (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ error: 'Registration failed' });
        return;
      }
      // INSERT
      const { data: userData, error: userError } = await supabase
        .from('Student Accounts')
        .insert([
          {
            first_name: uppercaseFirstName,
            last_name: uppercaseLastName,
            birth_date: birthDate,
            gender: uppercaseGender,
            email: uppercaseEmail,
            password: 'student123', 
            id_number: uppercaseIDNumber,
            phone_number: phoneNumber,
            accountType: uppercaseAccountType,
            department:departmentSelect
          },
        ])
        .single();

      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          // Handle the case where the email is already registered
          res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
        } else {
          console.error('Error registering user:', error.message);
          res.status(500).json({ error: 'Registration failed' });
        }
        return;
      }
    } else if (accountType === 'Counselor') {
      // Register the user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password:'counselor123'
      });

      if (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ error: 'Registration failed' });
        return;
      }
      // INSERT
      const { data: userData, error: userError } = await supabase
        .from('Counselor Accounts')
        .insert([
          {
            first_name: uppercaseFirstName,
            last_name: uppercaseLastName,
            birth_date: birthDate,
            gender: uppercaseGender,
            email: uppercaseEmail,
            password: 'counselor123', 
            id_number: uppercaseIDNumber,
            phone_number: phoneNumber,
            accountType: uppercaseAccountType,
            department:departmentSelect

          },
        ])
        .single();

      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          // Handle the case where the email is already registered
          res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
        } else {
          console.error('Error registering user:', error.message);
          res.status(500).json({ error: 'Registration failed' });
        }
        return;
      }
    }


    res.status(200).json({ success: 'Registration successful' });


  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});
