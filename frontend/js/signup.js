let currentRole = 'student';
let currentStep = 1;
let pwVisible = false;

function setRole(role) {
  currentRole = role;
  const isR = role === 'recruiter';
  document.getElementById('btn-student').classList.toggle('active', !isR);
  document.getElementById('btn-recruiter').classList.toggle('active', isR);
  document.getElementById('email-label').textContent = isR ? 'Work email' : 'Email address';
  document.getElementById('email-input').placeholder = isR ? 'you@company.com' : 'you@university.edu';
  document.getElementById('slbl-2').textContent = isR ? 'Company' : 'Profile';
  document.getElementById('student-fields').style.display = isR ? 'none' : 'block';
  document.getElementById('recruiter-fields').style.display = isR ? 'block' : 'none';
  const badge = document.getElementById('summary-role-badge');
  if (badge) badge.textContent = isR ? 'Recruiter' : 'Student';
}

function updateSteps(step) {
  for (let i = 1; i <= 3; i++) {
    const num = document.getElementById('snum-' + i);
    const lbl = document.getElementById('slbl-' + i);
    if (i < step) {
      num.className = 'step-num done';
      num.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      lbl.className = 'step-label';
    } else if (i === step) {
      num.className = 'step-num active';
      num.textContent = i;
      lbl.className = 'step-label active';
    } else {
      num.className = 'step-num pending';
      num.textContent = i;
      lbl.className = 'step-label';
    }
  }
  for (let i = 1; i <= 2; i++) {
    document.getElementById('sc-' + i).className = 'step-connector' + (step > i ? ' done' : '');
  }
}

function showSection(step) {
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-' + step).classList.add('active');
  document.getElementById('right-panel').scrollTop = 0;
}

function validateStep1() {
  let ok = true;
  const fn = document.getElementById('first-name').value.trim();
  const ln = document.getElementById('last-name').value.trim();
  const em = document.getElementById('email-input').value.trim();
  const pw = document.getElementById('pw-input').value;
  const showErr = (id, show) => {
    document.getElementById(id).classList.toggle('visible', show);
  };
  if (!fn) { showErr('err-firstname', true); ok = false; } else showErr('err-firstname', false);
  if (!ln) { showErr('err-lastname', true); ok = false; } else showErr('err-lastname', false);
  if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showErr('err-email', true); ok = false; } else showErr('err-email', false);
  if (pw.length < 8) { showErr('err-password', true); ok = false; } else showErr('err-password', false);
  return ok;
}

function populateSummary() {
  const fn = document.getElementById('first-name').value.trim();
  const ln = document.getElementById('last-name').value.trim();
  const em = document.getElementById('email-input').value.trim();
  document.getElementById('summary-name').textContent = fn + ' ' + ln;
  document.getElementById('summary-email').textContent = em;
  document.getElementById('summary-role-badge').textContent = currentRole === 'recruiter' ? 'Recruiter' : 'Student';

  let details = '';
  if (currentRole === 'student') {
    const uni = document.getElementById('university').value || '—';
    const deg = document.getElementById('degree').value || '—';
    const yr  = document.getElementById('grad-year').value || '—';
    const fos = document.getElementById('field-of-study').value || '—';
    const opp = document.getElementById('opp-type').value || '—';
    details = `University: ${uni}<br>Degree: ${deg} · Graduating ${yr}<br>Field: ${fos}<br>Looking for: ${opp}`;
  } else {
    const co  = document.getElementById('company-name').value || '—';
    const ind = document.getElementById('industry').value || '—';
    const ttl = document.getElementById('job-title').value || '—';
    details = `Company: ${co}<br>Industry: ${ind}<br>Title: ${ttl}`;
  }
  document.getElementById('summary-details').innerHTML = details;
}

function goStep(target) {
  if (target === 2 && currentStep === 1) {
    if (!validateStep1()) return;
  }
  if (target === 3) {
    populateSummary();
  }
  currentStep = target;
  updateSteps(target);
  showSection(target);
}

function togglePassword() {
  pwVisible = !pwVisible;
  document.getElementById('pw-input').type = pwVisible ? 'text' : 'password';
  document.getElementById('eye-show').style.display = pwVisible ? 'none' : 'block';
  document.getElementById('eye-hide').style.display = pwVisible ? 'block' : 'none';
}



function handleSubmit() {
  if (!document.getElementById('terms-check').checked) {
    alert('Please agree to the Terms of Service to continue.');
    return;
  }
  const btn = document.getElementById('submit-btn');
  const label = document.getElementById('submit-label');
  const spinner = document.getElementById('spinner');
  const arrow = document.getElementById('submit-arrow');
  btn.disabled = true;
  label.style.display = 'none';
  arrow.style.display = 'none';
  spinner.style.display = 'block';

  setTimeout(() => {
    document.getElementById('main-form').style.display = 'none';
    const ss = document.getElementById('success-screen');
    ss.classList.add('visible');
    if (currentRole === 'recruiter') {
      document.getElementById('success-msg').textContent = 'Your recruiter account is under review. We\'ll notify you within 24 hours once approved — then you can start posting listings.';
      document.getElementById('success-chips').innerHTML = '<span class="success-chip">Account created</span><span class="success-chip">Under review</span><span class="success-chip">Email sent</span>';
    }
  }, 2000);
}
