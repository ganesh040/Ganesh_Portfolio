/* ============================================================
   GANESH REDDY GUDIBANDI — Terminal Portfolio
   main.js
   ============================================================ */

const GITHUB_USER = 'ganesh040';

// ── NAVIGATION ────────────────────────────────────────────────
function show(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
  if (id === 'skills') renderSkills();
  if (id === 'stats')  loadStats();
}

// ── SKILLS ────────────────────────────────────────────────────
const skillGroups = [
  { label: '// BACK-END', skills: [
    { name: 'Java / Kotlin / Spring Boot',     pct: 90 },
    { name: 'Python (FastAPI/Django/Flask)',    pct: 88 },
    { name: 'Node.js',                         pct: 80 },
    { name: 'Go',                              pct: 72 },
  ]},
  { label: '// AI & ML', skills: [
    { name: 'LangChain / RAG Pipelines',       pct: 82 },
    { name: 'OpenAI API / Prompt Eng.',        pct: 80 },
    { name: 'Generative AI / LLMs',            pct: 78 },
    { name: 'scikit-learn / MLflow',           pct: 75 },
  ]},
  { label: '// FRONT-END', skills: [
    { name: 'React / React Native',            pct: 82 },
    { name: 'TypeScript / JavaScript',         pct: 80 },
    { name: 'Redux / HTML / CSS',              pct: 75 },
  ]},
  { label: '// DATA & MESSAGING', skills: [
    { name: 'PostgreSQL / MySQL / Aurora',     pct: 85 },
    { name: 'MongoDB / Redis',                 pct: 80 },
    { name: 'Kafka / Event-Driven Systems',    pct: 78 },
  ]},
  { label: '// CLOUD & DEVOPS', skills: [
    { name: 'AWS (EKS/Lambda/RDS/S3/etc.)',    pct: 85 },
    { name: 'Docker / Kubernetes',             pct: 82 },
    { name: 'Terraform / GitHub Actions',      pct: 78 },
    { name: 'CI/CD / CloudWatch',              pct: 76 },
  ]},
  { label: '// TESTING & PROCESS', skills: [
    { name: 'TDD: pytest / Jest / JUnit',      pct: 82 },
    { name: 'Agile / Scrum',                   pct: 85 },
    { name: 'Code Reviews / Git',              pct: 88 },
  ]},
];

let skillsRendered = false;

function renderSkills() {
  if (skillsRendered) return;
  skillsRendered = true;
  const container = document.getElementById('skills-container');

  skillGroups.forEach(group => {
    const g = document.createElement('div');
    g.className = 'skill-group';
    g.innerHTML = `<div class="sgroup-label">${group.label}</div>`;

    group.skills.forEach(s => {
      const row = document.createElement('div');
      row.className = 'skill-row';
      row.innerHTML = `
        <span class="sname">${s.name}</span>
        <div class="sbar-bg">
          <div class="sbar-fill" style="width:0" data-w="${s.pct}%"></div>
        </div>
        <span class="spct">${s.pct}%</span>`;
      g.appendChild(row);
    });

    container.appendChild(g);
  });

  // Animate bars after a short delay
  setTimeout(() => {
    container.querySelectorAll('.sbar-fill').forEach(b => {
      b.style.width = b.dataset.w;
    });
  }, 100);
}

// ── STATS ─────────────────────────────────────────────────────
let statsLoaded = false;

async function loadStats() {
  if (statsLoaded) return;
  statsLoaded = true;
  await Promise.all([loadGitHub(), loadLeetCode()]);
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

// ── GITHUB ────────────────────────────────────────────────────
async function loadGitHub() {
  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers: { Accept: 'application/vnd.github+json' } }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, { headers: { Accept: 'application/vnd.github+json' } }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`, { headers: { Accept: 'application/vnd.github+json' } }),
    ]);

    const user   = await userRes.json();
    const repos  = await reposRes.json();
    const events = await eventsRes.json();

    document.getElementById('gh-status').textContent = 'connected';

    // Overview panel
    document.getElementById('gh-overview').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
        <div style="text-align:center;border:1px solid #003300;padding:8px;">
          <div class="big-num">${user.public_repos || 0}</div>
          <div class="big-sub">PUBLIC REPOS</div>
        </div>
        <div style="text-align:center;border:1px solid #003300;padding:8px;">
          <div class="big-num">${user.followers || 0}</div>
          <div class="big-sub">FOLLOWERS</div>
        </div>
      </div>
      <div style="font-size:11px;color:#006600;margin-bottom:6px;">
        // @${user.login} · joined ${new Date(user.created_at).getFullYear()}
      </div>
      <div style="font-size:12px;color:#009922;">
        ${user.bio || 'Full-Stack Engineer · AWS Certified · AI/ML'}
      </div>`;

    // Language breakdown
    const langMap = {};
    if (Array.isArray(repos)) {
      repos.forEach(r => {
        if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
      });
    }
    const total  = Object.values(langMap).reduce((a, b) => a + b, 0) || 1;
    const sorted = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 7);

    document.getElementById('gh-langs').innerHTML = sorted.length
      ? sorted.map(([lang, cnt]) => {
          const pct = Math.round(cnt / total * 100);
          return `
            <div class="lang-row">
              <span class="lang-name">${lang}</span>
              <div class="lang-bar-bg">
                <div class="lang-bar-fill" style="width:0" data-w="${pct}%"></div>
              </div>
              <span class="lang-pct">${pct}%</span>
            </div>`;
        }).join('')
      : '<div class="err-msg">No language data found.</div>';

    setTimeout(() => {
      document.querySelectorAll('.lang-bar-fill').forEach(b => {
        b.style.width = b.dataset.w;
      });
    }, 200);

    // Recent commits from push events
    const pushes  = Array.isArray(events) ? events.filter(e => e.type === 'PushEvent') : [];
    const commits = [];
    pushes.slice(0, 8).forEach(e => {
      const repoName = e.repo?.name?.split('/')[1] || e.repo?.name || 'repository';
      const branch   = e.payload?.ref?.replace('refs/heads/', '') || 'branch';
      const timestamp = e.created_at;

      if (Array.isArray(e.payload?.commits) && e.payload.commits.length) {
        e.payload.commits.forEach(c => {
          const sha = c.sha || c.id || '';
          commits.push({
            msg:  (c.message || `Push to ${branch}`).split('\n')[0],
            repo: repoName,
            time: timestamp,
            url:  c.url || (sha ? `https://github.com/${e.repo.name}/commit/${sha}` : null),
          });
        });
      } else if (e.payload?.head) {
        const sha = e.payload.head;
        commits.push({
          msg:  `Push to ${branch}`,
          repo: repoName,
          time: timestamp,
          url:  `https://github.com/${e.repo.name}/commit/${sha}`,
        });
      }
    });

    const shown = commits.slice(0, 6);
    document.getElementById('gh-commits').innerHTML = shown.length
      ? shown.map(c => `
          <div class="commit-item">
            <span class="commit-dot">⊶</span>
            <span class="commit-msg">${c.url ? `<a href="${c.url}" target="_blank" rel="noopener">${c.msg.substring(0, 36)}${c.msg.length > 36 ? '…' : ''}</a>` : `${c.msg.substring(0, 36)}${c.msg.length > 36 ? '…' : ''}`}</span>
            <span class="commit-repo">${c.repo}</span>
            <span class="commit-time">${timeAgo(c.time)}</span>
          </div>`).join('')
      : '<div style="color:#005500;font-size:12px;">No recent public push events found.</div>';

  } catch (err) {
    console.error('[GitHub error]', err);
    document.getElementById('gh-status').textContent = 'error';
    ['gh-overview', 'gh-langs', 'gh-commits'].forEach(id => {
      document.getElementById(id).innerHTML =
        '<div class="err-msg">GitHub API unavailable. Works on your live domain.</div>';
    });
  }
}

async function loadLeetCode() {
  try {
    // Try your own Vercel proxy first (works on live site)
    const res = await fetch('/api/leetcode', { method: 'POST' });
    if (!res.ok) throw new Error(`proxy ${res.status}`);
    const data = await res.json();
    renderLeetCode(
      data.solved.all,
      data.solved.easy,
      data.solved.medium,
      data.solved.hard,
      data.ranking,
      data.streak
    );
  } catch (_) {
    // Fallback: call LeetCode GraphQL directly 
    try {
      const query = `{"query":"{matchedUser(username:\\"ganesh040\\"){submitStats{acSubmissionNum{difficulty count}}}}"}`;
      const res   = await fetch('https://leetcode.com/graphql', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
        body:    query,
      });
      const data  = await res.json();
      const stats = data?.data?.matchedUser?.submitStats?.acSubmissionNum || [];
      const f     = d => stats.find(s => s.difficulty === d) || { count: 0 };
      renderLeetCode(f('All').count, f('Easy').count, f('Medium').count, f('Hard').count, null, null);
    } catch (_2) {
      // Static fallback — last known values
      renderLeetCode(43, 36, 7, 0, 2760244, 0);
    }
  }
}

function renderLeetCode(total, easy, med, hard, ranking, streak) {
  document.getElementById('lc-stats').innerHTML = `
    <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:12px;">
      <span class="big-num">${total}</span>
      <span class="big-sub">SOLVED / 3822+</span>
    </div>
    ${ranking ? `<div style="color:#006600;font-size:11px;margin-bottom:6px;">GLOBAL RANK: <span style="color:#ccaa00;">#${ranking.toLocaleString()}</span></div>` : ''}
    ${streak  ? `<div style="color:#006600;font-size:11px;margin-bottom:8px;">STREAK: <span style="color:#00ff41;">${streak} days</span></div>` : ''}
    <div class="lc-bar-row">
      <span class="lc-label easy">Easy</span>
      <div class="lc-bar-bg"><div class="lc-bar-fill easy" style="width:0" data-w="${Math.min(100, Math.round(easy / 922 * 100))}%"></div></div>
      <span class="lc-count">${easy} / 922</span>
    </div>
    <div class="lc-bar-row">
      <span class="lc-label med">Medium</span>
      <div class="lc-bar-bg"><div class="lc-bar-fill med" style="width:0" data-w="${Math.min(100, Math.round(med / 1997 * 100))}%"></div></div>
      <span class="lc-count">${med} / 1997</span>
    </div>
    <div class="lc-bar-row">
      <span class="lc-label hard">Hard</span>
      <div class="lc-bar-bg"><div class="lc-bar-fill hard" style="width:0" data-w="${Math.min(100, Math.round(hard / 903 * 100))}%"></div></div>
      <span class="lc-count">${hard} / 903</span>
    </div>
    <div style="font-size:10px;color:#004400;margin-top:8px;">
      // Live data via /api/leetcode proxy. See api/leetcode.js to deploy.
    </div>`;

  setTimeout(() => {
    document.querySelectorAll('.lc-bar-fill').forEach(b => {
      b.style.width = b.dataset.w;
    });
  }, 300);
}

// ── STATUS BAR CLOCK ──────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
  const d = new Date();
  document.getElementById('clock').textContent =
    pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  document.getElementById('cpu').textContent = Math.floor(Math.random() * 15 + 2);
}

tick();
setInterval(tick, 1000);
