let pwVisible = false;

function setRole(role) {
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

function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const label = document.getElementById('btn-label');
  const spinner = document.getElementById('spinner');
  const arrow = document.getElementById('arrow-icon');
  btn.disabled = true;
  label.style.display = 'none';
  arrow.style.display = 'none';
  spinner.style.display = 'block';
  setTimeout(() => {
    btn.disabled = false;
    label.style.display = 'inline';
    arrow.style.display = 'block';
    spinner.style.display = 'none';
  }, 1800);
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
    .then((result) => {
      const user = result.user;
      console.log("Logged in user:", user);
      alert("Successfully signed in as " + user.displayName + " (" + user.email + ")");
    }).catch((error) => {
      console.error("Auth error:", error);
      alert("Authentication failed: " + error.message);
    });
});
