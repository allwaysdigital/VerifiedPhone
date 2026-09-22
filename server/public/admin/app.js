(function () {
  const TOKEN_KEY = 'vp_admin_token';

  const loginView = document.getElementById('login-view');
  const appView = document.getElementById('app-view');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('backdrop');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const pageTitle = document.getElementById('page-title');
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const panels = Array.from(document.querySelectorAll('.panel'));

  const PAGE_TITLES = {
    overview: 'Overview',
    shops: 'Shops',
    devices: 'Devices',
    brands: 'Brands',
  };

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
    appView.hidden = true;
  }

  function showApp() {
    loginView.hidden = true;
    appView.hidden = false;
    switchView('overview');
  }

  function switchView(view) {
    navItems.forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
    panels.forEach(panel => {
      panel.hidden = panel.dataset.panel !== view;
    });
    pageTitle.textContent = PAGE_TITLES[view] || '';
    closeSidebar();

    if (view === 'overview') loadOverview();
    if (view === 'shops') loadShops();
    if (view === 'devices') loadDevices({ reset: true });
    if (view === 'brands') loadBrands();
  }

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.hidden = false;
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.hidden = true;
  }

  hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  backdrop.addEventListener('click', closeSidebar);

  navItems.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  logoutBtn.addEventListener('click', () => {
    clearToken();
    showLogin();
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
      showApp();
    } catch (err) {
      loginError.textContent = err.message;
      loginError.hidden = false;
    }
  });

  function cell(label, content) {
    const td = document.createElement('td');
    td.setAttribute('data-label', label);
    if (content instanceof Node) {
      td.appendChild(content);
    } else {
      td.textContent = content ?? '—';
    }
    return td;
  }

  function badge(className, text) {
    const span = document.createElement('span');
    span.className = `badge ${className}`;
    span.textContent = text;
    return span;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  }

  function formatMoney(n) {
    if (n === null || n === undefined) return '—';
    return `₹${Number(n).toLocaleString('en-IN')}`;
  }

  // ---------- Overview ----------
  async function loadOverview() {
    const grid = document.getElementById('stat-grid');
    try {
      const data = await api('/api/admin/overview');
      const stats = [
        { label: 'Total Shops', value: data.totalShops, view: 'shops' },
        { label: 'Complete Profiles', value: data.completedProfiles, view: 'shops' },
        { label: 'Active Subscriptions', value: data.activeSubs, view: 'shops' },
        { label: 'Trial Subscriptions', value: data.trialSubs, view: 'shops' },
        { label: 'Total Devices', value: data.totalDevices, view: 'devices', status: '' },
        {
          label: 'Available Stock',
          value: data.availableDevices,
          view: 'devices',
          status: 'Available',
        },
        { label: 'Sold', value: data.soldDevices, view: 'devices', status: 'Sold' },
        { label: 'Brands', value: data.totalBrands, view: 'brands' },
      ];
      grid.innerHTML = '';
      for (const stat of stats) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'stat-card';
        card.innerHTML = `<div class="stat-value">${stat.value}</div><div class="stat-label">${stat.label}</div>`;
        card.addEventListener('click', () => {
          if (stat.status !== undefined) {
            devicesStatusFilter.value = stat.status;
          }
          switchView(stat.view);
        });
        grid.appendChild(card);
      }
    } catch (err) {
      grid.innerHTML = `<p class="error">${err.message}</p>`;
    }
  }

  // ---------- Shops ----------
  const shopsSearch = document.getElementById('shops-search');
  const shopsError = document.getElementById('shops-error');
  const shopsTbody = document.getElementById('shops-tbody');
  const shopsEmpty = document.getElementById('shops-empty');

  const SUBSCRIPTION_STATUSES = ['none', 'trial', 'active', 'expired'];
  const PLAN_IDS = ['monthly', 'yearly'];

  let shopsSearchTimer = null;
  shopsSearch.addEventListener('input', () => {
    clearTimeout(shopsSearchTimer);
    shopsSearchTimer = setTimeout(loadShops, 300);
  });

  function loadShops() {
    const q = shopsSearch.value.trim();
    shopsError.hidden = true;
    api(`/api/admin/shops${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      .then(data => renderShops(data.shops))
      .catch(err => {
        shopsError.textContent = err.message;
        shopsError.hidden = false;
      });
  }

  function renderShops(shops) {
    shopsTbody.innerHTML = '';
    shopsEmpty.hidden = shops.length > 0;

    for (const shop of shops) {
      const tr = document.createElement('tr');
      tr.appendChild(cell('Phone', shop.phoneNumber));
      tr.appendChild(cell('Shop Name', shop.shopName));
      tr.appendChild(
        cell('Profile', badge(shop.profileCompleted ? 'yes' : 'no', shop.profileCompleted ? 'Complete' : 'Incomplete')),
      );
      tr.appendChild(cell('Subscription', shopStatusSelect(shop)));
      tr.appendChild(cell('Plan', shopPlanSelect(shop)));
      tr.appendChild(cell('OTP Bypass', shopBypassCheckbox(shop)));
      tr.appendChild(cell('Joined', formatDate(shop.createdAt)));
      shopsTbody.appendChild(tr);
    }
  }

  function shopStatusSelect(shop) {
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

  function shopPlanSelect(shop) {
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

  function shopBypassCheckbox(shop) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = shop.otpBypass;
    input.addEventListener('change', () => saveShop(shop.id, { otpBypass: input.checked }));
    return input;
  }

  async function saveShop(id, patch) {
    shopsError.hidden = true;
    try {
      await api(`/api/admin/shops/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    } catch (err) {
      shopsError.textContent = err.message;
      shopsError.hidden = false;
    }
  }

  // ---------- Devices ----------
  const devicesSearch = document.getElementById('devices-search');
  const devicesStatusFilter = document.getElementById('devices-status-filter');
  const devicesError = document.getElementById('devices-error');
  const devicesTbody = document.getElementById('devices-tbody');
  const devicesEmpty = document.getElementById('devices-empty');
  const devicesLoadMoreBtn = document.getElementById('devices-load-more');

  let devicesCursor = null;

  let devicesSearchTimer = null;
  devicesSearch.addEventListener('input', () => {
    clearTimeout(devicesSearchTimer);
    devicesSearchTimer = setTimeout(() => loadDevices({ reset: true }), 300);
  });
  devicesStatusFilter.addEventListener('change', () => loadDevices({ reset: true }));
  devicesLoadMoreBtn.addEventListener('click', () => loadDevices({ reset: false }));

  function loadDevices({ reset }) {
    if (reset) {
      devicesCursor = null;
      devicesTbody.innerHTML = '';
    }
    devicesError.hidden = true;

    const params = new URLSearchParams();
    const q = devicesSearch.value.trim();
    if (q) params.set('q', q);
    if (devicesStatusFilter.value) params.set('status', devicesStatusFilter.value);
    if (devicesCursor) params.set('cursor', devicesCursor);

    api(`/api/admin/devices?${params.toString()}`)
      .then(data => {
        renderDevices(data.devices, { append: !reset });
        devicesCursor = data.nextCursor;
        devicesLoadMoreBtn.hidden = !devicesCursor;
        devicesEmpty.hidden = devicesTbody.children.length > 0;
      })
      .catch(err => {
        devicesError.textContent = err.message;
        devicesError.hidden = false;
      });
  }

  function renderDevices(devices, { append }) {
    if (!append) {
      devicesTbody.innerHTML = '';
    }
    for (const d of devices) {
      const tr = document.createElement('tr');
      tr.appendChild(cell('Shop', `${d.shopName} · ${d.shopPhone}`));
      tr.appendChild(cell('Brand & Model', `${d.brand} ${d.model}`));
      tr.appendChild(
        cell('Status', badge(d.status === 'Sold' ? 'sold' : 'available', d.status)),
      );
      tr.appendChild(
        cell(
          'Verification',
          badge(d.verification === 'Suspicious' ? 'suspicious' : 'yes', d.verification),
        ),
      );
      tr.appendChild(cell('IMEI', d.imei1));
      tr.appendChild(cell('Purchase', formatMoney(d.purchasePrice)));
      tr.appendChild(cell('Sale', formatMoney(d.salePrice)));
      tr.appendChild(cell('Profit', formatMoney(d.profit)));
      tr.appendChild(cell('Seller', d.sellerName ? `${d.sellerName} · ${d.sellerMobile}` : '—'));
      tr.appendChild(cell('Buyer', d.buyerName ? `${d.buyerName} · ${d.buyerMobile}` : '—'));
      tr.appendChild(cell('Purchased', formatDate(d.purchasedAt)));
      tr.appendChild(cell('Sold', formatDate(d.soldAt)));
      devicesTbody.appendChild(tr);
    }
  }

  // ---------- Brands ----------
  const brandForm = document.getElementById('brand-form');
  const brandNameInput = document.getElementById('brand-name-input');
  const brandsError = document.getElementById('brands-error');
  const brandsTbody = document.getElementById('brands-tbody');
  const brandsEmpty = document.getElementById('brands-empty');

  function loadBrands() {
    brandsError.hidden = true;
    api('/api/admin/brands')
      .then(data => renderBrands(data.brands))
      .catch(err => {
        brandsError.textContent = err.message;
        brandsError.hidden = false;
      });
  }

  function renderBrands(brands) {
    brandsTbody.innerHTML = '';
    brandsEmpty.hidden = brands.length > 0;
    for (const brand of brands) {
      const tr = document.createElement('tr');
      tr.appendChild(cell('Name', brand.name));
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'icon-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteBrand(brand.id));
      tr.appendChild(cell('', deleteBtn));
      brandsTbody.appendChild(tr);
    }
  }

  brandForm.addEventListener('submit', async event => {
    event.preventDefault();
    brandsError.hidden = true;
    const name = brandNameInput.value.trim();
    if (!name) return;
    try {
      await api('/api/admin/brands', { method: 'POST', body: JSON.stringify({ name }) });
      brandNameInput.value = '';
      loadBrands();
    } catch (err) {
      brandsError.textContent = err.message;
      brandsError.hidden = false;
    }
  });

  async function deleteBrand(id) {
    brandsError.hidden = true;
    try {
      await api(`/api/admin/brands/${id}`, { method: 'DELETE' });
      loadBrands();
    } catch (err) {
      brandsError.textContent = err.message;
      brandsError.hidden = false;
    }
  }

  // ---------- Boot ----------
  if (getToken()) {
    showApp();
  } else {
    showLogin();
  }
})();
