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
  
  const email = document.getElementById('email-input').value.trim();
  const role = (email === "supriyo3606c@gmail.com") ? "admin" : selectedRole;
  
  localStorage.setItem('workhub_active_user_email', email);
  localStorage.setItem('workhub_active_role', role);
  
  let usersList = JSON.parse(localStorage.getItem('workhub_users')) || [
    { name: "Alex Smith", email: "alex@university.edu", role: "student", resume: "https://drive.google.com/file/d/alex-resume/view" },
    { name: "Sarah Jenkins", email: "sarah@stripe.com", role: "recruiter", company: "Stripe" },
    { name: "Super Admin", email: "admin@workhub.com", role: "admin" }
  ];
  if (!usersList.some(u => u.email === email)) {
    usersList.push({
      name: email.split('@')[0],
      email: email,
      role: role
    });
    localStorage.setItem('workhub_users', JSON.stringify(usersList));
  }

  setTimeout(() => {
    btn.disabled = false;
    label.style.display = 'inline';
    arrow.style.display = 'block';
    spinner.style.display = 'none';
    window.location.href = 'index.html';
  }, 1200);
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
      
      const email = user.email;
      const role = (email === "supriyo3606c@gmail.com") ? "admin" : selectedRole;
      
      localStorage.setItem('workhub_active_user_email', email);
      localStorage.setItem('workhub_active_role', role);
      
      let usersList = JSON.parse(localStorage.getItem('workhub_users')) || [];
      if (!usersList.some(u => u.email === email)) {
        usersList.push({
          name: user.displayName || email.split('@')[0],
          email: email,
          role: role
        });
        localStorage.setItem('workhub_users', JSON.stringify(usersList));
      }

      alert("Successfully signed in as " + user.displayName + " (" + user.email + ")");
      window.location.href = 'index.html';
    }).catch((error) => {
      console.error("Auth error:", error);
      alert("Authentication failed: " + error.message);
    });
});
