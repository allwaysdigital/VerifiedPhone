(function () {
  const TOKEN_KEY = 'vp_admin_token';

  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const dashboardError = document.getElementById('dashboard-error');
  const searchInput = document.getElementById('search-input');
  const logoutBtn = document.getElementById('logout-btn');
  const tbody = document.getElementById('shops-tbody');
  const emptyState = document.getElementById('empty-state');

  const SUBSCRIPTION_STATUSES = ['none', 'trial', 'active', 'expired'];
  const PLAN_IDS = ['monthly', 'yearly'];

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function api(path, options) {
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options && options.headers),
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== '/api/admin/login') {
      clearToken();
      showLogin();
      throw new Error('Session expired. Please log in again.');
    }
    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }
    return data;
  }

  function showLogin() {
    loginView.hidden = false;
    dashboardView.hidden = true;
  }

  function showDashboard() {
    loginView.hidden = true;
    dashboardView.hidden = false;
    loadShops();
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  }

  function renderShops(shops) {
    tbody.innerHTML = '';
    emptyState.hidden = shops.length > 0;

    for (const shop of shops) {
      const tr = document.createElement('tr');

      tr.appendChild(cell('Phone', shop.phoneNumber || '—'));
      tr.appendChild(cell('Shop Name', shop.shopName || '—'));
      tr.appendChild(
        cell(
          'Profile',
          badge(shop.profileCompleted, shop.profileCompleted ? 'Complete' : 'Incomplete'),
        ),
      );
      tr.appendChild(cell('Subscription', statusSelect(shop)));
      tr.appendChild(cell('Plan', planSelect(shop)));
      tr.appendChild(cell('OTP Bypass', bypassCheckbox(shop)));
      tr.appendChild(cell('Joined', formatDate(shop.createdAt)));

      tbody.appendChild(tr);
    }
  }

  function cell(label, content) {
    const td = document.createElement('td');
    td.setAttribute('data-label', label);
    if (content instanceof Node) {
      td.appendChild(content);
    } else {
      td.textContent = content;
    }
    return td;
  }

  function badge(isPositive, text) {
    const span = document.createElement('span');
    span.className = `badge ${isPositive ? 'yes' : 'no'}`;
    span.textContent = text;
    return span;
  }

  function statusSelect(shop) {
    const select = document.createElement('select');
    for (const status of SUBSCRIPTION_STATUSES) {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      option.selected = status === shop.subscription.status;
      select.appendChild(option);
    }
    select.addEventListener('change', () =>
      saveShop(shop.id, { subscriptionStatus: select.value }),
    );
    return select;
  }

  function planSelect(shop) {
    const select = document.createElement('select');
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.textContent = '—';
    noneOption.selected = !shop.subscription.planId;
    select.appendChild(noneOption);
    for (const plan of PLAN_IDS) {
      const option = document.createElement('option');
      option.value = plan;
      option.textContent = plan;
      option.selected = plan === shop.subscription.planId;
      select.appendChild(option);
    }
    select.addEventListener('change', () =>
      saveShop(shop.id, { subscriptionPlanId: select.value || null }),
    );
    return select;
  }

  function bypassCheckbox(shop) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = shop.otpBypass;
    input.addEventListener('change', () => saveShop(shop.id, { otpBypass: input.checked }));
    return input;
  }

  async function saveShop(id, patch) {
    dashboardError.hidden = true;
    try {
      await api(`/api/admin/shops/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    } catch (err) {
      dashboardError.textContent = err.message;
      dashboardError.hidden = false;
    }
  }

  let searchTimer = null;
  function loadShops() {
    const q = searchInput.value.trim();
    api(`/api/admin/shops${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      .then(data => renderShops(data.shops))
      .catch(err => {
        dashboardError.textContent = err.message;
        dashboardError.hidden = false;
      });
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadShops, 300);
  });

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginError.hidden = true;
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    try {
      const data = await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      showDashboard();
    } catch (err) {
      loginError.textContent = err.message;
      loginError.hidden = false;
    }
  });

  logoutBtn.addEventListener('click', () => {
    clearToken();
    showLogin();
  });

  if (getToken()) {
    showDashboard();
  } else {
    showLogin();
  }
})();
