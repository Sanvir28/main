// main.js — navigation, year filling, contact form, GitHub repo polling

// NAV toggle
document.addEventListener('click', (e) => {
  const toggleIds = ['navToggle','navToggle2','navToggle3','navToggle4','navToggle5','navToggle6'];
  toggleIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn && e.target === btn) {
      const navId = 'nav' + (id.replace('navToggle','') || '');
      const nav = document.getElementById(navId);
      if (nav) nav.classList.toggle('open');
    }
  });
});

// Fill year placeholders
function setYears(){
  const ids = ['year','yearAbout','yearAwards','yearProjects','yearContact','yearTerms'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.textContent = new Date().getFullYear();
  });
}
setYears();

// CONTACT FORM: open mail client prefilled
function encode(v){ return encodeURIComponent(v || ''); }
window.openMailClient = function(){
  const name = document.getElementById('cf-name')?.value || '';
  const email = document.getElementById('cf-email')?.value || '';
  const message = document.getElementById('cf-message')?.value || '';
  const subject = encode(`Portfolio contact from ${name || email}`);
  const body = encode(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  const mailto = `mailto:sanvir2010@gmail.com?cc=singhstudios2010@gmail.com&subject=${subject}&body=${body}`;
  window.location.href = mailto;
  return false;
};

// Optional: send via Formspree (ENTER your endpoint below if you want serverless form)
const FORMSPREE_ENDPOINT = ''; // e.g. https://formspree.io/f/xxxxx
window.sendViaFormspree = async function(){
  if(!FORMSPREE_ENDPOINT){ alert('Formspree endpoint not configured. See README.'); return; }
  const name = document.getElementById('cf-name')?.value || '';
  const email = document.getElementById('cf-email')?.value || '';
  const message = document.getElementById('cf-message')?.value || '';
  const data = { name, email, message };
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    if(res.ok) alert('Message sent — thank you!');
    else alert('Failed to send message.');
  } catch (e) { console.error(e); alert('Error sending message'); }
};

// GITHUB repo fetch and auto-refresh
async function fetchGithubRepos() {
  const container = document.getElementById('repo-list');
  if(!container) return;
  container.innerHTML = '<div class="muted">Loading repositories…</div>';
  try {
    const resp = await fetch('https://api.github.com/users/Sanvir28/repos?per_page=100&sort=updated');
    if(!resp.ok){
      container.innerHTML = `<div class="muted">Unable to fetch repos: ${resp.status} ${resp.statusText}</div>`;
      return;
    }
    const repos = await resp.json();
    if(!Array.isArray(repos) || repos.length === 0){
      container.innerHTML = '<div class="muted">No repositories found.</div>';
      return;
    }
    // Sort by updated_at descending (GitHub param should already do but ensure)
    repos.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
    container.innerHTML = '';
    repos.forEach(repo => {
      const card = document.createElement('div');
      card.className = 'card repo-card';
      const desc = repo.description ? repo.description : 'No description provided.';
      const updated = new Date(repo.updated_at).toLocaleString();
      card.innerHTML = `
        <h3><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a></h3>
        <p class="muted">${desc}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <small class="muted">Updated: ${updated}</small>
          <div style="display:flex;gap:8px;align-items:center">
            <small class="muted">★ ${repo.stargazers_count}</small>
            <small class="muted">${repo.language || '—'}</small>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('fetchGithubRepos error', err);
    container.innerHTML = '<div class="muted">Error loading repositories.</div>';
  }
}

// start polling every 60s
fetchGithubRepos();
setInterval(fetchGithubRepos, 60000);