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
