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

// Parse .env / env / env.json file
async function loadEnv() {
  try {
    // Try to load .env first
    let response = await fetch('.env');
    if (!response.ok) {
      // Fallback to env without dot (if server blocks dotfiles)
      response = await fetch('env');
    }
    if (!response.ok) {
      // Fallback to env.json (very reliable static JSON fallback)
      response = await fetch('env.json');
      if (response.ok) {
        return await response.json();
      }
    }
    if (!response.ok) {
      console.warn("Could not load .env, env, or env.json file");
      return {};
    }
    const text = await response.text();
    const env = {};
    text.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        env[key] = value;
      }
    });
    return env;
  } catch (e) {
    console.error("Failed to load env file:", e);
    return {};
  }
}

// Initialize Firebase
let firebaseInitialized = false;
loadEnv().then(env => {
  if (env.FIREBASE_API_KEY) {
    const firebaseConfig = {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOMAIN,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID,
      measurementId: env.FIREBASE_MEASUREMENT_ID
    };
    firebase.initializeApp(firebaseConfig);
    firebaseInitialized = true;
  } else {
    console.warn("Firebase configuration not found in .env, env, or env.json");
  }
});

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
