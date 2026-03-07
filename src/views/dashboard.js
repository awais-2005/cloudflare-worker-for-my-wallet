export function serveDashboard(c) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Dashboard</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --surface: #1a1d27; --surface2: #242836;
    --border: #2e3348; --text: #e4e6f0; --text2: #9ca0b8;
    --primary: #6c63ff; --primary-hover: #5a52d5;
    --green: #22c55e; --red: #ef4444; --yellow: #eab308;
    --radius: 10px;
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  a { color: var(--primary); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* AUTH */
  .auth-wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .auth-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 2.5rem; width: 100%; max-width: 400px; }
  .auth-card h1 { font-size: 1.5rem; margin-bottom: .25rem; }
  .auth-card p.sub { color: var(--text2); margin-bottom: 1.5rem; font-size: .9rem; }
  .form-group { margin-bottom: 1rem; }
  .form-group label { display: block; font-size: .85rem; color: var(--text2); margin-bottom: .35rem; }
  .form-group input { width: 100%; padding: .65rem .85rem; background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: .95rem; outline: none; }
  .form-group input:focus { border-color: var(--primary); }
  .btn { display: inline-block; padding: .7rem 1.4rem; background: var(--primary); color: #fff; border: none; border-radius: 6px; font-size: .95rem; cursor: pointer; width: 100%; text-align: center; }
  .btn:hover { background: var(--primary-hover); }
  .btn:disabled { opacity: .5; cursor: not-allowed; }
  .error-msg { color: var(--red); font-size: .85rem; margin-top: .75rem; }
  .switch-link { text-align: center; margin-top: 1rem; font-size: .85rem; color: var(--text2); }

  /* LAYOUT */
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 240px; background: var(--surface); border-right: 1px solid var(--border); padding: 1.5rem 1rem; display: flex; flex-direction: column; position: fixed; height: 100vh; }
  .sidebar .logo { font-size: 1.15rem; font-weight: 700; margin-bottom: 2rem; padding: 0 .5rem; }
  .sidebar nav a { display: flex; align-items: center; gap: .6rem; padding: .65rem .75rem; border-radius: 6px; color: var(--text2); font-size: .9rem; margin-bottom: .2rem; transition: all .15s; }
  .sidebar nav a:hover, .sidebar nav a.active { background: var(--surface2); color: var(--text); text-decoration: none; }
  .sidebar .spacer { flex: 1; }
  .sidebar .logout-btn { padding: .6rem .75rem; border-radius: 6px; color: var(--red); font-size: .9rem; cursor: pointer; border: none; background: none; text-align: left; }
  .sidebar .logout-btn:hover { background: var(--surface2); }
  .main { margin-left: 240px; flex: 1; padding: 2rem; }
  .page-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }

  /* STATS */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; }
  .stat-card .label { font-size: .8rem; color: var(--text2); text-transform: uppercase; letter-spacing: .05em; margin-bottom: .35rem; }
  .stat-card .value { font-size: 1.75rem; font-weight: 700; }
  .stat-card .value.green { color: var(--green); }
  .stat-card .value.red { color: var(--red); }

  /* TABLE */
  .table-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 2rem; }
  .table-card .table-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .table-card .table-header h2 { font-size: 1.1rem; }
  .table-card .table-header .badge { background: var(--surface2); padding: .25rem .65rem; border-radius: 20px; font-size: .8rem; color: var(--text2); }
  table { width: 100%; border-collapse: collapse; }
  thead th { text-align: left; padding: .75rem 1.25rem; font-size: .8rem; color: var(--text2); text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid var(--border); background: var(--surface2); }
  tbody td { padding: .75rem 1.25rem; font-size: .9rem; border-bottom: 1px solid var(--border); }
  tbody tr:hover { background: var(--surface2); }
  .type-badge { display: inline-block; padding: .15rem .55rem; border-radius: 4px; font-size: .8rem; font-weight: 500; }
  .type-badge.income { background: rgba(34,197,94,.15); color: var(--green); }
  .type-badge.expense { background: rgba(239,68,68,.15); color: var(--red); }
  .avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: var(--surface2); display: inline-flex; align-items: center; justify-content: center; font-size: .85rem; color: var(--text2); overflow: hidden; vertical-align: middle; margin-right: .5rem; }
  .avatar-sm img { width: 100%; height: 100%; object-fit: cover; }

  /* USER DETAIL MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; padding: 1.5rem; }
  .modal .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .modal .modal-header h2 { font-size: 1.2rem; }
  .modal .close-btn { background: none; border: none; color: var(--text2); font-size: 1.3rem; cursor: pointer; }
  .modal .close-btn:hover { color: var(--text); }
  .user-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-bottom: 1.5rem; }
  .user-info-grid .info-item .lbl { font-size: .75rem; color: var(--text2); text-transform: uppercase; }
  .user-info-grid .info-item .val { font-size: .95rem; }

  /* SEARCH */
  .search-box { padding: .5rem .85rem; background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: .85rem; outline: none; width: 220px; }
  .search-box:focus { border-color: var(--primary); }

  /* LOADING */
  .spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-center { display: flex; align-items: center; justify-content: center; padding: 3rem; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .main { margin-left: 0; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .user-info-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<div id="app"></div>

<script>
const API_BASE = '';
let token = localStorage.getItem('admin_token');

// --- UTILS ---
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { ...opts, headers });
  if (res.status === 401 || res.status === 403) { logout(); throw new Error('Unauthorized'); }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function $(sel, parent = document) { return parent.querySelector(sel); }
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'innerHTML') el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else if (c) el.appendChild(c);
  }
  return el;
}

function esc(s) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(s || ''));
  return d.innerHTML;
}

function formatAmount(n) { return parseFloat(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// --- ROUTER ---
let currentPage = 'overview';
function navigate(page) {
  currentPage = page;
  renderApp();
}
function logout() { token = null; localStorage.removeItem('admin_token'); renderApp(); }

// --- AUTH PAGE ---
async function renderAuth() {
  const app = $('#app');
  app.innerHTML = '';

  let canSignup = false;
  try { const r = await api('/admin/can-signup'); canSignup = r.canSignup; } catch {}

  let isSignup = canSignup;
  function draw() {
    app.innerHTML = '';
    const card = h('div', { className: 'auth-card' });
    card.appendChild(h('h1', {}, isSignup ? 'Create Admin' : 'Admin Login'));
    card.appendChild(h('p', { className: 'sub' }, isSignup ? 'Set up your admin account (one-time only)' : 'Sign in to your admin dashboard'));

    const form = h('form', {});
    const usernameGroup = h('div', { className: 'form-group' },
      h('label', {}, 'Username'),
      h('input', { type: 'text', id: 'username', placeholder: 'admin', autocomplete: 'username', required: 'true' })
    );
    const passwordGroup = h('div', { className: 'form-group' },
      h('label', {}, 'Password'),
      h('input', { type: 'password', id: 'password', placeholder: '••••••••', autocomplete: 'current-password', required: 'true' })
    );
    form.appendChild(usernameGroup);
    form.appendChild(passwordGroup);
    const btn = h('button', { type: 'submit', className: 'btn' }, isSignup ? 'Create Admin' : 'Login');
    form.appendChild(btn);
    const errEl = h('div', { className: 'error-msg', id: 'auth-error' });
    form.appendChild(errEl);
    card.appendChild(form);

    if (canSignup && !isSignup) {
      const sw = h('div', { className: 'switch-link' }, 'No admin yet? ', h('a', { href: '#', onClick: (e) => { e.preventDefault(); isSignup = true; draw(); } }, 'Create one'));
      card.appendChild(sw);
    } else if (!canSignup && isSignup) {
      isSignup = false; // force login
    }

    if (!isSignup && canSignup) {
      // show nothing extra
    } else if (isSignup && !canSignup) {
      // already has admin
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      btn.disabled = true;
      errEl.textContent = '';
      const username = $('#username').value.trim();
      const password = $('#password').value;
      try {
        if (isSignup) {
          await api('/admin/signup', { method: 'POST', body: JSON.stringify({ username, password }) });
          isSignup = false;
          draw();
          return;
        }
        const res = await api('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
        token = res.token;
        localStorage.setItem('admin_token', token);
        renderApp();
      } catch (err) {
        errEl.textContent = err.message;
        btn.disabled = false;
      }
    });

    app.appendChild(h('div', { className: 'auth-wrap' }, card));
  }
  draw();
}

// --- DASHBOARD ---
async function renderDashboard() {
  const app = $('#app');
  app.innerHTML = '';

  const sidebar = h('div', { className: 'sidebar' },
    h('div', { className: 'logo' }, '\\u{1F6E1} Admin Panel'),
    h('nav', {},
      h('a', { href: '#', 'data-page': 'overview', className: currentPage === 'overview' ? 'active' : '', onClick: (e) => { e.preventDefault(); navigate('overview'); } }, '\\u{1F4CA} Overview'),
      h('a', { href: '#', 'data-page': 'users', className: currentPage === 'users' ? 'active' : '', onClick: (e) => { e.preventDefault(); navigate('users'); } }, '\\u{1F465} Users'),
      h('a', { href: '#', 'data-page': 'transactions', className: currentPage === 'transactions' ? 'active' : '', onClick: (e) => { e.preventDefault(); navigate('transactions'); } }, '\\u{1F4B3} Transactions')
    ),
    h('div', { className: 'spacer' }),
    h('button', { className: 'logout-btn', onClick: logout }, '\\u{1F6AA} Logout')
  );

  const main = h('div', { className: 'main' });
  app.appendChild(h('div', { className: 'app' }, sidebar, main));

  main.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';

  if (currentPage === 'overview') await renderOverview(main);
  else if (currentPage === 'users') await renderUsers(main);
  else if (currentPage === 'transactions') await renderTransactions(main);
}

async function renderOverview(main) {
  try {
    const [stats, users, transactions] = await Promise.all([
      api('/admin/api/stats'),
      api('/admin/api/users'),
      api('/admin/api/transactions')
    ]);
    main.innerHTML = '';
    main.appendChild(h('h1', { className: 'page-title' }, 'Dashboard Overview'));

    const grid = h('div', { className: 'stats-grid' },
      statCard('Total Users', stats.totalUsers, ''),
      statCard('Total Transactions', stats.totalTransactions, ''),
      statCard('Total Income', formatAmount(stats.totalIncome), 'green'),
      statCard('Total Expense', formatAmount(stats.totalExpense), 'red')
    );
    main.appendChild(grid);

    // Recent users
    main.appendChild(buildUsersTable(users.slice(0, 5), 'Recent Users'));
    // Recent transactions
    main.appendChild(buildTransactionsTable(transactions.slice(0, 10), 'Recent Transactions'));
  } catch (err) {
    main.innerHTML = '<p style="color:var(--red)">Failed to load dashboard: ' + esc(err.message) + '</p>';
  }
}

function statCard(label, value, colorClass) {
  return h('div', { className: 'stat-card' },
    h('div', { className: 'label' }, label),
    h('div', { className: 'value ' + colorClass }, String(value))
  );
}

async function renderUsers(main) {
  try {
    const users = await api('/admin/api/users');
    main.innerHTML = '';
    main.appendChild(h('h1', { className: 'page-title' }, 'All Users'));
    main.appendChild(buildUsersTable(users, 'Users', true));
  } catch (err) {
    main.innerHTML = '<p style="color:var(--red)">Failed to load users</p>';
  }
}

function buildUsersTable(users, title, showSearch = false) {
  const card = h('div', { className: 'table-card' });
  const header = h('div', { className: 'table-header' },
    h('h2', {}, title),
    h('span', { className: 'badge' }, users.length + ' total')
  );

  let searchInput;
  if (showSearch) {
    searchInput = h('input', { type: 'text', className: 'search-box', placeholder: 'Search users...' });
    header.appendChild(searchInput);
  }
  card.appendChild(header);

  const table = h('table', {});
  table.appendChild(h('thead', {},
    h('tr', {},
      h('th', {}, 'User'),
      h('th', {}, 'Email'),
      h('th', {}, 'Currency'),
      h('th', {}, 'Actions')
    )
  ));
  const tbody = h('tbody', {});

  function renderRows(list) {
    tbody.innerHTML = '';
    if (list.length === 0) {
      tbody.appendChild(h('tr', {}, h('td', { colspan: '4', style: 'text-align:center;color:var(--text2)' }, 'No users found')));
      return;
    }
    for (const u of list) {
      const avatarEl = h('span', { className: 'avatar-sm' });
      if (u.avatar) {
        avatarEl.appendChild(h('img', { src: esc(u.avatar), alt: '' }));
      } else {
        avatarEl.textContent = (u.name || '?')[0].toUpperCase();
      }
      const row = h('tr', {},
        h('td', {}, avatarEl, h('span', {}, esc(u.name))),
        h('td', {}, esc(u.email)),
        h('td', {}, esc(u.currency || 'USD')),
        h('td', {}, h('a', { href: '#', onClick: (e) => { e.preventDefault(); showUserDetail(u.id); } }, 'View'))
      );
      tbody.appendChild(row);
    }
  }
  renderRows(users);

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      renderRows(users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
    });
  }

  table.appendChild(tbody);
  card.appendChild(table);
  return card;
}

async function showUserDetail(id) {
  const overlay = h('div', { className: 'modal-overlay', onClick: (e) => { if (e.target === overlay) overlay.remove(); } });
  const modal = h('div', { className: 'modal' },
    h('div', { className: 'modal-header' },
      h('h2', {}, 'User Details'),
      h('button', { className: 'close-btn', onClick: () => overlay.remove() }, '\\u2715')
    ),
    h('div', { className: 'loading-center' }, h('div', { className: 'spinner' }))
  );
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  try {
    const data = await api('/admin/api/users/' + id);
    modal.innerHTML = '';
    modal.appendChild(h('div', { className: 'modal-header' },
      h('h2', {}, esc(data.name)),
      h('button', { className: 'close-btn', onClick: () => overlay.remove() }, '\\u2715')
    ));

    const info = h('div', { className: 'user-info-grid' },
      infoItem('ID', data.id),
      infoItem('Email', data.email),
      infoItem('Currency', data.currency || 'USD'),
      infoItem('Transactions', data.transactions.length)
    );
    modal.appendChild(info);

    if (data.transactions.length > 0) {
      modal.appendChild(buildTransactionsTable(data.transactions.map(t => ({ ...t, user_name: data.name, user_email: data.email })), 'Transactions'));
    } else {
      modal.appendChild(h('p', { style: 'color:var(--text2);text-align:center;padding:1rem' }, 'No transactions'));
    }
  } catch (err) {
    modal.innerHTML = '<p style="color:var(--red);padding:1rem">Failed to load user</p>';
  }
}

function infoItem(label, value) {
  return h('div', { className: 'info-item' },
    h('div', { className: 'lbl' }, label),
    h('div', { className: 'val' }, String(value))
  );
}

async function renderTransactions(main) {
  try {
    const transactions = await api('/admin/api/transactions');
    main.innerHTML = '';
    main.appendChild(h('h1', { className: 'page-title' }, 'All Transactions'));
    main.appendChild(buildTransactionsTable(transactions, 'Transactions', true));
  } catch (err) {
    main.innerHTML = '<p style="color:var(--red)">Failed to load transactions</p>';
  }
}

function buildTransactionsTable(transactions, title, showSearch = false) {
  const card = h('div', { className: 'table-card' });
  const header = h('div', { className: 'table-header' },
    h('h2', {}, title),
    h('span', { className: 'badge' }, transactions.length + ' total')
  );
  let searchInput;
  if (showSearch) {
    searchInput = h('input', { type: 'text', className: 'search-box', placeholder: 'Search transactions...' });
    header.appendChild(searchInput);
  }
  card.appendChild(header);

  const table = h('table', {});
  table.appendChild(h('thead', {},
    h('tr', {},
      h('th', {}, 'ID'),
      h('th', {}, 'User'),
      h('th', {}, 'Type'),
      h('th', {}, 'Amount'),
      h('th', {}, 'Description'),
      h('th', {}, 'Date')
    )
  ));
  const tbody = h('tbody', {});

  function renderRows(list) {
    tbody.innerHTML = '';
    if (list.length === 0) {
      tbody.appendChild(h('tr', {}, h('td', { colspan: '6', style: 'text-align:center;color:var(--text2)' }, 'No transactions found')));
      return;
    }
    for (const t of list) {
      const typeBadge = h('span', { className: 'type-badge ' + (t.type === 'income' ? 'income' : 'expense') }, esc(t.type));
      const row = h('tr', {},
        h('td', {}, '#' + t.id),
        h('td', {}, esc(t.user_name || 'User #' + t.user_id)),
        h('td', {}, typeBadge),
        h('td', {}, formatAmount(t.amount)),
        h('td', {}, esc(t.description || '-')),
        h('td', {}, esc(t.created_at || '-'))
      );
      tbody.appendChild(row);
    }
  }
  renderRows(transactions);

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      renderRows(transactions.filter(t =>
        (t.user_name || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.type || '').toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      ));
    });
  }

  table.appendChild(tbody);
  card.appendChild(table);
  return card;
}

// --- RENDER ---
function renderApp() {
  if (!token) renderAuth();
  else renderDashboard();
}
renderApp();
<\/script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
