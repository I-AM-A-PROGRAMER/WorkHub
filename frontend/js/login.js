const API_URL = 'https://workhub-wdsm.onrender.com/api';
let pwVisible = false;
let selectedRole = 'student';

function setRole(role) {
  selectedRole = role;
  const isRecruiter = role === 'recruiter';
  document.getElementById('btn-student').classList.toggle('active', !isRecruiter);
  document.getElementById('btn-recruiter').classList.toggle('active', isRecruiter);
  document.getElementById('email-label').textContent = isRecruiter ? 'Work email' : 'Email address';
  document.getElementById('email-input').placeholder = isRecruiter ? 'you@company.com' : 'you@university.edu';
  document.getElementById('btn-label').textContent = isRecruiter ? 'Sign in as Recruiter' : 'Sign in as Student';
  document.getElementById('recruiter-notice').classList.toggle('visible', isRecruiter);
}

function togglePassword() {
  pwVisible = !pwVisible;
  document.getElementById('pw-input').type = pwVisible ? 'text' : 'password';
  document.getElementById('eye-show').style.display = pwVisible ? 'none' : 'block';
  document.getElementById('eye-hide').style.display = pwVisible ? 'block' : 'none';
}

async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const label = document.getElementById('btn-label');
  const spinner = document.getElementById('spinner');
  const arrow = document.getElementById('arrow-icon');
  
  const errorAlert = document.getElementById('login-error');
  const errorMessage = document.getElementById('error-message');
  
  if (errorAlert) {
    errorAlert.style.display = 'none';
  }

  const email = document.getElementById('email-input').value.trim();
  const password = document.getElementById('pw-input').value;

  // Start spinner animation
  btn.disabled = true;
  label.style.display = 'none';
  arrow.style.display = 'none';
  spinner.style.display = 'block';

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        portalRole: selectedRole
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save authentication details
    localStorage.setItem('workhub_token', data.token);
    localStorage.setItem('workhub_active_user_email', data.email);
    localStorage.setItem('workhub_active_role', data.role);

    setTimeout(() => {
      btn.disabled = false;
      label.style.display = 'inline';
      arrow.style.display = 'block';
      spinner.style.display = 'none';
      window.location.href = 'index.html';
    }, 500);

  } catch (error) {
    btn.disabled = false;
    label.style.display = 'inline';
    arrow.style.display = 'block';
    spinner.style.display = 'none';

    if (errorAlert && errorMessage) {
      errorMessage.textContent = error.message;
      errorAlert.style.display = 'flex';
    } else {
      alert(error.message);
    }
  }
}

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAzWMhMAU09WjOboL5SnEcEMD7FSrJK2Mc",
  authDomain: "authentication-f62b4.firebaseapp.com",
  projectId: "authentication-f62b4",
  storageBucket: "authentication-f62b4.firebasestorage.app",
  messagingSenderId: "461551814952",
  appId: "1:461551814952:web:a2132a5f306c7452cca81d",
  measurementId: "G-MZWN3QD8JD"
};

let firebaseInitialized = false;
try {
  firebase.initializeApp(firebaseConfig);
  firebaseInitialized = true;
} catch (e) {
  console.error("Firebase init error:", e);
}

// Handle Google Sign-In
document.getElementById('google-signin-btn').addEventListener('click', () => {
  if (!firebaseInitialized) {
    alert("Firebase is not initialized. Please ensure .env / env.json file is loaded correctly.");
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(async (result) => {
      const user = result.user;
      console.log("Logged in user:", user);
      
      const email = user.email;
      const errorAlert = document.getElementById('login-error');
      const errorMessage = document.getElementById('error-message');

      if (errorAlert) {
        errorAlert.style.display = 'none';
      }

      try {
        const response = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            name: user.displayName,
            portalRole: selectedRole
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Google authentication failed');
        }

        // Save credentials & redirect
        localStorage.setItem('workhub_token', data.token);
        localStorage.setItem('workhub_active_user_email', data.email);
        localStorage.setItem('workhub_active_role', data.role);

        alert("Successfully signed in as " + (data.name || user.displayName) + " (" + data.email + ")");
        window.location.href = 'index.html';

      } catch (error) {
        firebase.auth().signOut();
        if (errorAlert && errorMessage) {
          errorMessage.textContent = error.message;
          errorAlert.style.display = 'flex';
        } else {
          alert(error.message);
        }
      }
    }).catch((error) => {
      console.error("Auth error:", error);
      alert("Authentication failed: " + error.message);
    });
});

