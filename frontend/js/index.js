// Global State and Mock DB Initialization
const DEFAULT_JOBS = [
  {
    id: "stripe-swe-1",
    title: "Software Engineering Intern",
    companyName: "Stripe",
    location: "San Francisco, CA",
    duration: "3 Months",
    stipend: 15000,
    description: "Join Stripe's payments engine team to build developer-friendly APIs. You will work on API integrations, dashboard enhancements, and scale infrastructure. Requirements: Strong foundations in data structures, algorithms, and web technologies.",
    postedBy: "sarah@stripe.com",
    logoColor: "#635BFF",
    logoChar: "S",
    createdAt: new Date().toLocaleDateString()
  },
  {
    id: "notion-pd-2",
    title: "Product Design Intern",
    companyName: "Notion",
    location: "Remote",
    duration: "6 Months",
    stipend: 12000,
    description: "Work on Notion's core editor team. Create intuitive UX patterns, design new interactive blocks, and work closely with product managers and engineers. Requirements: Portfolio demonstrating UI/UX layout design, prototyping skills, and product thinking.",
    postedBy: "sarah@stripe.com",
    logoColor: "#000000",
    logoChar: "N",
    createdAt: new Date().toLocaleDateString()
  }
];

const DEFAULT_USERS = [
  { name: "Alex Smith", email: "alex@university.edu", role: "student", resume: "https://drive.google.com/file/d/alex-resume/view" },
  { name: "Sarah Jenkins", email: "sarah@stripe.com", role: "recruiter", company: "Stripe" },
  { name: "Supriyo Admin", email: "supriyo3606c@gmail.com", role: "admin" },
  { name: "Super Admin", email: "admin@workhub.com", role: "admin" }
];

// Load collections from localStorage or set defaults
let jobs = JSON.parse(localStorage.getItem("workhub_jobs")) || [];
let applications = JSON.parse(localStorage.getItem("workhub_applications")) || [];
let users = JSON.parse(localStorage.getItem("workhub_users")) || [];
let activeUserEmail = localStorage.getItem("workhub_active_user_email") || null;
let currentRole = "guest";
let currentJobIdToApply = null;
let currentJobIdToEdit = null;

function updateSessionState() {
  activeUserEmail = localStorage.getItem("workhub_active_user_email") || null;
  if (activeUserEmail === "supriyo3606c@gmail.com") {
    currentRole = "admin";
  } else if (activeUserEmail) {
    const foundUser = users.find(u => u.email === activeUserEmail);
    if (foundUser) {
      currentRole = foundUser.role;
    } else {
      currentRole = "student";
    }
  } else {
    currentRole = "guest";
  }
}

// Initialize mock DB if empty
function initMockDB() {
  if (jobs.length === 0 && localStorage.getItem("workhub_jobs") === null) {
    jobs = [...DEFAULT_JOBS];
    localStorage.setItem("workhub_jobs", JSON.stringify(jobs));
  }
  if (users.length === 0) {
    users = [...DEFAULT_USERS];
    localStorage.setItem("workhub_users", JSON.stringify(users));
  }
  // Ensure supriyo3606c@gmail.com is in users list as admin
  if (!users.some(u => u.email === "supriyo3606c@gmail.com")) {
    users.push({ name: "Supriyo Admin", email: "supriyo3606c@gmail.com", role: "admin" });
    saveUsers();
  }
  updateSessionState();
}

// Save helpers
function saveJobs() {
  localStorage.setItem("workhub_jobs", JSON.stringify(jobs));
}

function saveApplications() {
  localStorage.setItem("workhub_applications", JSON.stringify(applications));
}

function saveUsers() {
  localStorage.setItem("workhub_users", JSON.stringify(users));
}

// Get logged-in user detail based on simulation role
function getCurrentMockUser() {
  if (activeUserEmail) {
    return users.find(u => u.email === activeUserEmail) || null;
  }
  return null;
}

// Page load event listener
document.addEventListener("DOMContentLoaded", () => {
  initMockDB();
  setupEventListeners();
  updateUIForRole();
  renderListings();
  
  // Start on relevant dashboard or listings
  if (currentRole === "student") {
    showView("student-dashboard");
  } else if (currentRole === "recruiter") {
    showView("recruiter-dashboard");
  } else if (currentRole === "admin") {
    showView("admin-dashboard");
  } else {
    showView("listings");
  }
});

// Setup event listeners for forms and filters
function setupEventListeners() {
  // Navigation links
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = link.getAttribute("data-view");
      showView(targetView);
    });
  });

  // Filter input listeners (search only)
  document.getElementById("search-input").addEventListener("input", renderListings);

  // Resume save button
  const saveResumeBtn = document.getElementById("btn-save-resume");
  if (saveResumeBtn) {
    saveResumeBtn.addEventListener("click", () => {
      const link = document.getElementById("student-resume-input").value.trim();
      if (!link) {
        alert("Please enter a valid link.");
        return;
      }
      const student = getCurrentMockUser();
      if (student) {
        student.resume = link;
        saveUsers();
        alert("Resume link saved successfully!");
        renderStudentDashboard();
      }
    });
  }

  // Forms Submissions
  document.getElementById("form-apply").addEventListener("submit", submitApplication);
  document.getElementById("form-post-job").addEventListener("submit", submitJobForm);

  // Logo click
  document.querySelector(".brand").addEventListener("click", () => {
    showView("listings");
  });
}

// Navigation & pane routing
function showView(viewId) {
  // Hide all sections
  document.querySelectorAll(".view-section").forEach(sec => {
    sec.classList.remove("active");
  });

  // Show target section
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add("active");
  }

  // Update navbar active state
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("data-view") === viewId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Hero visibility: only on Listings page and when not logged in / student
  const hero = document.getElementById("hero-section");
  if (hero) {
    if (viewId === "listings" && (currentRole === "guest" || currentRole === "student")) {
      hero.style.display = "block";
    } else {
      hero.style.display = "none";
    }
  }

  // Render specific dashboard content when shown
  if (viewId === "student-dashboard") renderStudentDashboard();
  if (viewId === "recruiter-dashboard") renderRecruiterDashboard();
  if (viewId === "admin-dashboard") renderAdminDashboard();
  if (viewId === "listings") renderListings();
}

// Adjust UI elements depending on active simulated role
function updateUIForRole() {
  const user = getCurrentMockUser();
  const navLinks = document.getElementById("main-nav-links");
  const navActions = document.getElementById("nav-auth-actions");

  // Reset navbar visibility
  navLinks.innerHTML = "";
  navActions.innerHTML = "";

  // Standard Explore/Browse listing is always available
  const browseLink = document.createElement("button");
  browseLink.className = "nav-link active";
  browseLink.setAttribute("data-view", "listings");
  browseLink.textContent = "Explore Internships";
  browseLink.addEventListener("click", () => showView("listings"));
  navLinks.appendChild(browseLink);

  if (currentRole === "guest") {
    // Show Login/Signup links
    navActions.innerHTML = `
      <a href="login.html" class="btn-login">Log In</a>
      <a href="signup.html" class="btn-signup">Sign Up</a>
    `;
  } else {
    // Authenticated state
    const avatarChar = user && user.name ? user.name.charAt(0) : "U";
    navActions.innerHTML = `
      <div class="profile-avatar" style="width: 32px; height: 32px; font-size: 13px; margin: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
        ${avatarChar}
      </div>
      <button onclick="handleLogout()" class="btn-login" style="cursor:pointer; background:none; border:none; padding:8px 16px; font-weight:600;">Log Out</button>
    `;

    // Append role-specific dashboard link
    if (currentRole === "student") {
      const studentDashLink = document.createElement("button");
      studentDashLink.className = "nav-link";
      studentDashLink.setAttribute("data-view", "student-dashboard");
      studentDashLink.textContent = "Student Dashboard";
      studentDashLink.addEventListener("click", () => showView("student-dashboard"));
      navLinks.appendChild(studentDashLink);
    } else if (currentRole === "recruiter") {
      const recruiterDashLink = document.createElement("button");
      recruiterDashLink.className = "nav-link";
      recruiterDashLink.setAttribute("data-view", "recruiter-dashboard");
      recruiterDashLink.textContent = "Recruiter Dashboard";
      recruiterDashLink.addEventListener("click", () => showView("recruiter-dashboard"));
      navLinks.appendChild(recruiterDashLink);
    } else if (currentRole === "admin") {
      const adminDashLink = document.createElement("button");
      adminDashLink.className = "nav-link";
      adminDashLink.setAttribute("data-view", "admin-dashboard");
      adminDashLink.textContent = "Admin Panel";
      adminDashLink.addEventListener("click", () => showView("admin-dashboard"));
      navLinks.appendChild(adminDashLink);
    }
  }
}

function handleLogout() {
  localStorage.removeItem("workhub_active_user_email");
  localStorage.removeItem("workhub_active_role");
  updateSessionState();
  updateUIForRole();
  showView("listings");
}
window.handleLogout = handleLogout;

// Render Internship Listings (Browse view)
function renderListings() {
  const grid = document.getElementById("jobs-grid");
  if (!grid) return;

  const searchQuery = document.getElementById("search-input").value.toLowerCase().trim();

  // Filter listings
  const filtered = jobs.filter(job => {
    // Search filter
    const matchesSearch = job.title.toLowerCase().includes(searchQuery) ||
                          job.companyName.toLowerCase().includes(searchQuery) ||
                          job.description.toLowerCase().includes(searchQuery);
    return matchesSearch;
  });

  // Render dynamic Available Listings counter in Hero
  const heroCount = document.getElementById("hero-jobs-count");
  if (heroCount) {
    heroCount.textContent = jobs.length;
  }

  // Render Job Cards
  grid.innerHTML = "";
  document.getElementById("count-display").textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <div class="empty-state-title">No internships found</div>
        <p>Try adjusting your search query.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(job => {
    const card = document.createElement("div");
    card.className = "card-job";

    // Application details check
    const student = getCurrentMockUser();
    const hasApplied = student ? applications.some(app => app.jobId === job.id && app.studentEmail === student.email) : false;
    const appliedObj = hasApplied ? applications.find(app => app.jobId === job.id && app.studentEmail === student.email) : null;

    let actionBtnHTML = "";
    if (currentRole === "student" || currentRole === "guest") {
      if (hasApplied) {
        actionBtnHTML = `
          <span class="badge badge-green" style="padding: 8px 14px; font-size: 12px; font-weight: 700;">
            Status: ${appliedObj.status.toUpperCase()}
          </span>
        `;
      } else {
        actionBtnHTML = `
          <button class="btn-card btn-card-primary" onclick="handleCardApply('${job.id}')">Apply Now</button>
        `;
      }
    } else if (currentRole === "recruiter") {
      // Recruiters can edit/delete their postings (or simulate it)
      actionBtnHTML = `
        <button class="btn-card btn-card-secondary" onclick="openEditJobModal('${job.id}')">Edit</button>
        <button class="btn-card btn-card-danger" onclick="handleDeleteJob('${job.id}')">Delete</button>
      `;
    } else if (currentRole === "admin") {
      actionBtnHTML = `
        <button class="btn-card btn-card-danger" onclick="handleDeleteJob('${job.id}')">Remove Listing</button>
      `;
    }

    card.innerHTML = `
      <div class="card-job-logo" style="background:${job.logoColor || '#cbd5e1'}">${job.logoChar || 'W'}</div>
      <div class="card-job-details">
        <div class="card-job-header">
          <div>
            <h3 class="card-job-title">${job.title}</h3>
            <div class="card-job-company">${job.companyName}</div>
          </div>
          <div class="card-job-badges">
            <span class="badge badge-stipend">${
              isNaN(job.stipend) ? job.stipend : `₹${Number(job.stipend).toLocaleString()}/mo`
            }</span>
          </div>
        </div>
        <div class="card-job-meta">
          <div class="card-job-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${job.location}
          </div>
          <div class="card-job-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${job.duration}
          </div>
          <div class="card-job-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Posted ${job.createdAt || 'Just now'}
          </div>
        </div>
        <p class="card-job-desc">${job.description}</p>
        <div class="card-job-footer">
          <div class="card-job-badges">
            <span class="badge badge-slate">Internship</span>
          </div>
          <div class="card-actions">
            ${actionBtnHTML}
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Student Dashboard Rendering
function renderStudentDashboard() {
  const student = getCurrentMockUser();
  if (!student) return;

  // Set Profile details
  document.getElementById("student-profile-name").textContent = student.name;
  document.getElementById("student-profile-email").textContent = student.email;
  document.getElementById("student-resume-input").value = student.resume || "";

  // Render Applications
  const tableBody = document.getElementById("student-apps-table-body");
  if (!tableBody) return;

  // Filter student applications
  const studentApps = applications.filter(app => app.studentEmail === student.email);

  // Update stats counters
  document.getElementById("stat-student-applied").textContent = studentApps.length;
  document.getElementById("stat-student-shortlisted").textContent = studentApps.filter(a => a.status === "Shortlisted").length;
  document.getElementById("stat-student-review").textContent = studentApps.filter(a => a.status === "Under Review" || a.status === "Applied").length;

  tableBody.innerHTML = "";
  if (studentApps.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center" style="padding:32px; color:var(--slate-400)">
          You haven't applied to any internships yet.
        </td>
      </tr>
    `;
    return;
  }

  studentApps.forEach(app => {
    // Find job title
    const job = jobs.find(j => j.id === app.jobId) || { title: "Deleted Listing", companyName: "Unknown" };
    const row = document.createElement("tr");

    let badgeClass = "status-applied";
    if (app.status === "Under Review") badgeClass = "status-review";
    if (app.status === "Shortlisted") badgeClass = "status-shortlisted";
    if (app.status === "Rejected") badgeClass = "status-rejected";

    row.innerHTML = `
      <td style="font-weight: 700; color: var(--slate-900)">${job.title}</td>
      <td>${job.companyName}</td>
      <td>${app.appliedAt || 'Today'}</td>
      <td><a href="${app.resumeLink}" target="_blank" style="color:var(--green)">Link</a></td>
      <td><span class="badge-status ${badgeClass}">${app.status}</span></td>
    `;
    tableBody.appendChild(row);
  });
}

// Recruiter Dashboard Rendering
function renderRecruiterDashboard() {
  const recruiter = getCurrentMockUser();
  if (!recruiter) return;

  const postingsContainer = document.getElementById("recruiter-postings-list");
  if (!postingsContainer) return;

  // Filter jobs posted by recruiter
  const recruiterJobs = jobs.filter(j => j.postedBy === recruiter.email);

  // Update counters
  const totalApps = applications.filter(app => recruiterJobs.some(j => j.id === app.jobId)).length;
  const totalShortlisted = applications.filter(app => app.status === "Shortlisted" && recruiterJobs.some(j => j.id === app.jobId)).length;

  document.getElementById("stat-recruiter-listings").textContent = recruiterJobs.length;
  document.getElementById("stat-recruiter-applicants").textContent = totalApps;
  document.getElementById("stat-recruiter-shortlisted").textContent = totalShortlisted;

  postingsContainer.innerHTML = "";
  if (recruiterJobs.length === 0) {
    postingsContainer.innerHTML = `
      <div class="empty-state" style="margin-top:0">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
        </svg>
        <div class="empty-state-title">No listings posted yet</div>
        <p>Post internships to begin receiving applications from top student talent.</p>
        <button class="btn-card btn-card-primary mt-4" onclick="openPostJobModal()">Post Internship</button>
      </div>
    `;
    return;
  }

  recruiterJobs.forEach(job => {
    const item = document.createElement("div");
    item.className = "recruiter-job-item";

    const jobApps = applications.filter(app => app.jobId === job.id);

    item.innerHTML = `
      <div class="recruiter-job-summary" onclick="toggleApplicantsDrawer('${job.id}')">
        <div class="recruiter-job-title-group">
          <h3>${job.title}</h3>
          <div class="recruiter-job-meta">
            <span>Location: ${job.location}</span>
            <span>·</span>
            <span>Stipend: ${
              isNaN(job.stipend) ? job.stipend : `₹${Number(job.stipend).toLocaleString()}/mo`
            }</span>
            <span>·</span>
            <span>Duration: ${job.duration}</span>
          </div>
        </div>
        <div class="recruiter-job-actions">
          <span class="applicant-count-pill">${jobApps.length} Applicants</span>
          <svg id="arrow-icon-${job.id}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="recruiter-job-applicants-drawer" id="drawer-${job.id}">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Email</th>
                <th>Applied Date</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="applicant-rows-${job.id}">
              <!-- Rendered applicant rows -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    postingsContainer.appendChild(item);

    // Render applicant rows inside the drawer
    const rowContainer = document.getElementById(`applicant-rows-${job.id}`);
    if (jobApps.length === 0) {
      rowContainer.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding:16px; color:var(--slate-400); background:transparent">
            No applicants have applied yet.
          </td>
        </tr>
      `;
    } else {
      jobApps.forEach(app => {
        const tr = document.createElement("tr");
        tr.style.background = "transparent";

        tr.innerHTML = `
          <td style="font-weight: 700; color: var(--slate-900)">
            <span title="${app.coverLetter || 'No description'}" style="cursor:help; border-bottom:1px dotted var(--slate-400)">
              ${app.studentName}
            </span>
          </td>
          <td>${app.studentEmail}</td>
          <td>${app.appliedAt || 'Today'}</td>
          <td><a href="${app.resumeLink}" target="_blank" style="color:var(--green); font-weight:600">View Resume</a></td>
          <td>
            <select class="status-select" onchange="handleStatusChange('${app.id}', this.value)">
              <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
              <option value="Under Review" ${app.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
              <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
              <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </td>
          <td>
            <button class="btn-card btn-card-secondary" style="padding: 4px 8px;" onclick="viewCoverLetter('${app.studentName}', '${escapeHtml(app.coverLetter)}')">Cover Letter</button>
          </td>
        `;
        rowContainer.appendChild(tr);
      });
    }
  });
}

// Utility to escape HTML strings safely
function escapeHtml(unsafe) {
  return unsafe
    ? unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
    : '';
}

function viewCoverLetter(name, text) {
  alert(`Cover Letter from ${name}:\n\n"${text || 'No description provided.'}"`);
}

// Toggle applicants drawer drawer
function toggleApplicantsDrawer(jobId) {
  const drawer = document.getElementById(`drawer-${jobId}`);
  const arrow = document.getElementById(`arrow-icon-${jobId}`);
  if (drawer && arrow) {
    const isActive = drawer.classList.contains("active");
    if (isActive) {
      drawer.classList.remove("active");
      arrow.style.transform = "rotate(0deg)";
    } else {
      drawer.classList.add("active");
      arrow.style.transform = "rotate(180deg)";
    }
  }
}

// Recruiter updates status of applicant
function handleStatusChange(appId, newStatus) {
  const app = applications.find(a => a.id === appId);
  if (app) {
    app.status = newStatus;
    saveApplications();
    renderRecruiterDashboard();
    
    // Alert user (UX polish)
    console.log(`Updated Application ${appId} status to ${newStatus}`);
  }
}

// Admin Dashboard Rendering
function renderAdminDashboard() {
  // Stats
  document.getElementById("stat-admin-users").textContent = users.length;
  document.getElementById("stat-admin-listings").textContent = jobs.length;
  document.getElementById("stat-admin-applications").textContent = applications.length;

  // Render User Management Table
  const userTableBody = document.getElementById("admin-users-table-body");
  if (userTableBody) {
    userTableBody.innerHTML = "";
    users.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700; color:var(--slate-900)">${user.name}</td>
        <td>${user.email}</td>
        <td style="text-transform:uppercase; font-size:11px; font-weight:600; color:var(--green-text)">${user.role}</td>
        <td>${user.role === 'recruiter' ? (user.company || 'Stripe') : (user.role === 'student' ? 'University' : 'WorkHub Admin')}</td>
        <td>
          <button class="btn-card btn-card-danger" style="padding: 4px 8px;" onclick="handleDeleteUser('${user.email}')" ${user.role === 'admin' ? 'disabled' : ''}>Delete</button>
        </td>
      `;
      userTableBody.appendChild(tr);
    });
  }

  // Render All Listings Table
  const jobsTableBody = document.getElementById("admin-listings-table-body");
  if (jobsTableBody) {
    jobsTableBody.innerHTML = "";
    jobs.forEach(job => {
      const tr = document.createElement("tr");
      const appCount = applications.filter(a => a.jobId === job.id).length;
      tr.innerHTML = `
        <td style="font-weight:700; color:var(--slate-900)">${job.title}</td>
        <td>${job.companyName}</td>
        <td>${job.location}</td>
        <td>${appCount} Applications</td>
        <td>
          <button class="btn-card btn-card-danger" style="padding: 4px 8px;" onclick="handleDeleteJob('${job.id}')">Delete</button>
        </td>
      `;
      jobsTableBody.appendChild(tr);
    });
  }
}

// Delete user functionality
function handleDeleteUser(email) {
  if (confirm(`Are you sure you want to delete user with email ${email}?`)) {
    users = users.filter(u => u.email !== email);
    saveUsers();
    
    // Also remove applications associated with this user if student
    applications = applications.filter(a => a.studentEmail !== email);
    saveApplications();

    renderAdminDashboard();
  }
}

// Student applying for a job cards click
function handleCardApply(jobId) {
  if (currentRole === "guest") {
    alert("Please sign in to apply for internships!");
    window.location.href = "login.html";
    return;
  }
  if (currentRole !== "student") {
    alert("Only students can apply for internships.");
    return;
  }

  currentJobIdToApply = jobId;
  const job = jobs.find(j => j.id === jobId);
  if (job) {
    document.getElementById("apply-modal-job-title").textContent = job.title;
    document.getElementById("apply-modal-company").textContent = job.companyName;
    document.getElementById("apply-modal-description").textContent = job.description;

    // Autofill resume if student has one saved
    const student = getCurrentMockUser();
    document.getElementById("apply-resume-link").value = (student && student.resume) ? student.resume : "";
    document.getElementById("apply-cover-letter").value = "";

    // Open Modal
    document.getElementById("modal-apply").classList.add("active");
  }
}

// Submit Application Modal Form
function submitApplication(e) {
  e.preventDefault();
  const resumeLink = document.getElementById("apply-resume-link").value.trim();
  const coverLetter = document.getElementById("apply-cover-letter").value.trim();

  if (!resumeLink) {
    alert("Resume link is required.");
    return;
  }

  const student = getCurrentMockUser();
  if (!student) return;

  // Check duplicate
  const alreadyApplied = applications.some(app => app.jobId === currentJobIdToApply && app.studentEmail === student.email);
  if (alreadyApplied) {
    alert("You have already applied to this internship.");
    closeModal('apply');
    return;
  }

  // Create Application Object
  const newApp = {
    id: "app-" + Date.now(),
    jobId: currentJobIdToApply,
    studentName: student.name,
    studentEmail: student.email,
    resumeLink: resumeLink,
    coverLetter: coverLetter,
    status: "Applied",
    appliedAt: new Date().toLocaleDateString()
  };

  applications.push(newApp);
  saveApplications();

  // Save the resume link back to the student profile if it wasn't there
  if (!student.resume) {
    student.resume = resumeLink;
    saveUsers();
  }

  closeModal('apply');
  alert("Application submitted successfully!");
  
  // Refresh UI
  renderListings();
  renderStudentDashboard();
}

// Job posting creation & editing modal trigger
function openPostJobModal() {
  currentJobIdToEdit = null;
  document.getElementById("post-job-modal-title").textContent = "Post New Internship";
  document.getElementById("form-post-job").reset();
  
  // Set default recruiter company in company field
  const recruiter = getCurrentMockUser();
  if (recruiter && recruiter.company) {
    document.getElementById("job-company").value = recruiter.company;
  }

  document.getElementById("modal-post-job").classList.add("active");
}

function openEditJobModal(jobId) {
  currentJobIdToEdit = jobId;
  const job = jobs.find(j => j.id === jobId);
  if (job) {
    document.getElementById("post-job-modal-title").textContent = "Edit Internship Listing";
    document.getElementById("job-title-input").value = job.title;
    document.getElementById("job-company").value = job.companyName;
    document.getElementById("job-location").value = job.location;
    document.getElementById("job-duration").value = job.duration;
    document.getElementById("job-stipend").value = job.stipend;
    document.getElementById("job-desc").value = job.description;

    document.getElementById("modal-post-job").classList.add("active");
  }
}

// Post/Edit job form submit
function submitJobForm(e) {
  e.preventDefault();

  const title = document.getElementById("job-title-input").value.trim();
  const company = document.getElementById("job-company").value.trim();
  const location = document.getElementById("job-location").value.trim();
  const duration = document.getElementById("job-duration").value.trim();
  const stipend = parseInt(document.getElementById("job-stipend").value.trim(), 10) || 0;
  const desc = document.getElementById("job-desc").value.trim();

  const recruiter = getCurrentMockUser();
  const email = recruiter ? recruiter.email : "sarah@stripe.com";

  if (currentJobIdToEdit) {
    // Edit Mode
    const jobIndex = jobs.findIndex(j => j.id === currentJobIdToEdit);
    if (jobIndex > -1) {
      jobs[jobIndex] = {
        ...jobs[jobIndex],
        title,
        companyName: company,
        location,
        duration,
        stipend,
        description: desc
      };
      saveJobs();
      alert("Internship listing updated!");
    }
  } else {
    // Create Mode
    const colors = ["#635BFF", "#F24E1E", "#000000", "#10B981", "#3B82F6", "#8B5CF6"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newJob = {
      id: "job-" + Date.now(),
      title,
      companyName: company,
      location,
      duration,
      stipend,
      description: desc,
      postedBy: email,
      logoColor: randomColor,
      logoChar: company ? company.charAt(0).toUpperCase() : "I",
      createdAt: new Date().toLocaleDateString()
    };
    jobs.push(newJob);
    saveJobs();
    alert("Internship listing created successfully!");
  }

  closeModal('post-job');
  renderListings();
  renderRecruiterDashboard();
}

// Delete internship listing
function handleDeleteJob(jobId) {
  if (confirm("Are you sure you want to delete this internship listing? All applicant applications for this post will also be deleted.")) {
    jobs = jobs.filter(j => j.id !== jobId);
    saveJobs();

    // Clean up applications
    applications = applications.filter(app => app.jobId !== jobId);
    saveApplications();

    renderListings();
    renderRecruiterDashboard();
    renderAdminDashboard();
  }
}

// General Modal Closing Helper
function closeModal(type) {
  document.getElementById(`modal-${type}`).classList.remove("active");
}

// Global actions expose (necessary due to script scoping / inline click bindings)
window.handleCardApply = handleCardApply;
window.handleDeleteJob = handleDeleteJob;
window.openEditJobModal = openEditJobModal;
window.openPostJobModal = openPostJobModal;
window.closeModal = closeModal;
window.handleStatusChange = handleStatusChange;
window.toggleApplicantsDrawer = toggleApplicantsDrawer;
window.viewCoverLetter = viewCoverLetter;
window.handleDeleteUser = handleDeleteUser;
