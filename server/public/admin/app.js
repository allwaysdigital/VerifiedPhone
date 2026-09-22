(function () {
  const ICONS = {
    overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    shops: '<path d="M4 9l1-5h14l1 5"/><path d="M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M5 9v10h14V9"/><path d="M9 21v-6h6v6"/>',
    devices: '<rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/>',
    brands: '<path d="M20.59 13.41 13.41 20.59a2 2 0 0 1-2.82 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.4" fill="currentColor" stroke="none"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    check: '<circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><polyline points="3.5 8.5 12 13 20.5 8.5"/><line x1="12" y1="13" x2="12" y2="22"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  };

  function iconSvg(name) {
    return `<svg viewBox="0 0 24 24">${ICONS[name] || ''}</svg>`;
  }

  document.querySelectorAll('[data-icon]').forEach(el => {
    el.innerHTML = iconSvg(el.dataset.icon);
  });

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

  function badge(className, text) {
    const span = document.createElement('span');
    span.className = `badge ${className}`;
    span.textContent = text;
    return span;
  }

  function shopCell(name, phone) {
    const wrap = document.createElement('div');
    wrap.className = 'shop-cell';
    const initial = (name || '?').trim().charAt(0).toUpperCase();
    wrap.innerHTML = `
      <div class="shop-avatar">${initial}</div>
      <div class="shop-cell-text">
        <span class="shop-cell-name">${name || '—'}</span>
        <span class="shop-cell-phone">${phone || '—'}</span>
      </div>
    `;
    return wrap;
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
        { label: 'Total Shops', value: data.totalShops, view: 'shops', icon: 'shops', color: 'orange' },
        { label: 'Complete Profiles', value: data.completedProfiles, view: 'shops', icon: 'check', color: 'green' },
        { label: 'Active Subscriptions', value: data.activeSubs, view: 'shops', icon: 'bolt', color: 'blue' },
        { label: 'Trial Subscriptions', value: data.trialSubs, view: 'shops', icon: 'clock', color: 'purple' },
        { label: 'Total Devices', value: data.totalDevices, view: 'devices', status: '', icon: 'devices', color: 'orange' },
        {
          label: 'Available Stock',
          value: data.availableDevices,
          view: 'devices',
          status: 'Available',
          icon: 'box',
          color: 'green',
        },
        { label: 'Sold', value: data.soldDevices, view: 'devices', status: 'Sold', icon: 'cart', color: 'purple' },
        { label: 'Brands', value: data.totalBrands, view: 'brands', icon: 'brands', color: 'blue' },
      ];
      grid.innerHTML = '';
      for (const stat of stats) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'stat-card';
        card.innerHTML = `
          <div class="stat-icon ${stat.color}">${iconSvg(stat.icon)}</div>
          <div class="stat-body">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
          </div>
        `;
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
  const shopsGrid = document.getElementById('shops-grid');
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
    shopsGrid.innerHTML = '';
    shopsEmpty.hidden = shops.length > 0;

    for (const shop of shops) {
      shopsGrid.appendChild(buildShopCard(shop));
    }
  }

  function field(labelText, control) {
    const wrap = document.createElement('label');
    wrap.className = 'field';
    const label = document.createElement('span');
    label.className = 'field-label';
    label.textContent = labelText;
    wrap.appendChild(label);
    wrap.appendChild(control);
    return wrap;
  }

  function buildShopCard(shop) {
    const card = document.createElement('div');
    card.className = 'shop-card';

    const header = document.createElement('div');
    header.className = 'shop-card-header';
    header.appendChild(shopCell(shop.shopName, shop.phoneNumber));
    header.appendChild(
      badge(shop.profileCompleted ? 'yes' : 'no', shop.profileCompleted ? 'Complete' : 'Incomplete'),
    );
    card.appendChild(header);

    const fields = document.createElement('div');
    fields.className = 'shop-card-fields';
    fields.appendChild(field('Subscription', shopStatusSelect(shop)));
    fields.appendChild(field('Plan', shopPlanSelect(shop)));
    card.appendChild(fields);

    const footer = document.createElement('div');
    footer.className = 'shop-card-footer';
    const toggleRow = document.createElement('div');
    toggleRow.className = 'toggle-row';
    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'field-label';
    toggleLabel.textContent = 'OTP Bypass';
    toggleRow.appendChild(toggleLabel);
    toggleRow.appendChild(shopBypassToggle(shop));
    footer.appendChild(toggleRow);
    const joined = document.createElement('span');
    joined.className = 'shop-card-joined';
    joined.textContent = `Joined ${formatDate(shop.createdAt)}`;
    footer.appendChild(joined);
    card.appendChild(footer);

    return card;
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

  function shopBypassToggle(shop) {
    const label = document.createElement('label');
    label.className = 'toggle';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = shop.otpBypass;
    input.addEventListener('change', () => saveShop(shop.id, { otpBypass: input.checked }));
    const track = document.createElement('span');
    track.className = 'toggle-track';
    const thumb = document.createElement('span');
    thumb.className = 'toggle-thumb';
    track.appendChild(thumb);
    label.appendChild(input);
    label.appendChild(track);
    return label;
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
  const devicesGrid = document.getElementById('devices-grid');
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
      devicesGrid.innerHTML = '';
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
        devicesEmpty.hidden = devicesGrid.children.length > 0;
      })
      .catch(err => {
        devicesError.textContent = err.message;
        devicesError.hidden = false;
      });
  }

  function renderDevices(devices, { append }) {
    if (!append) {
      devicesGrid.innerHTML = '';
    }
    for (const d of devices) {
      devicesGrid.appendChild(buildDeviceCard(d));
    }
  }

  function moneyField(labelText, value, className) {
    const wrap = document.createElement('div');
    wrap.className = 'money-field';
    const label = document.createElement('span');
    label.className = 'field-label';
    label.textContent = labelText;
    const val = document.createElement('span');
    val.className = `money-value${className ? ` ${className}` : ''}`;
    val.textContent = formatMoney(value);
    wrap.appendChild(label);
    wrap.appendChild(val);
    return wrap;
  }

  function personField(labelText, name, mobile) {
    const wrap = document.createElement('div');
    wrap.className = 'person-field';
    const label = document.createElement('span');
    label.className = 'field-label';
    label.textContent = labelText;
    const val = document.createElement('span');
    val.className = 'person-value';
    val.textContent = name ? `${name} · ${mobile}` : '—';
    wrap.appendChild(label);
    wrap.appendChild(val);
    return wrap;
  }

  function buildDeviceCard(d) {
    const card = document.createElement('div');
    card.className = 'device-card';

    const header = document.createElement('div');
    header.className = 'device-card-header';
    header.appendChild(shopCell(d.shopName, d.shopPhone));
    const badges = document.createElement('div');
    badges.className = 'device-card-badges';
    badges.appendChild(badge(d.status === 'Sold' ? 'sold' : 'available', d.status));
    badges.appendChild(
      badge(d.verification === 'Suspicious' ? 'suspicious' : 'yes', d.verification),
    );
    header.appendChild(badges);
    card.appendChild(header);

    const title = document.createElement('div');
    title.className = 'device-card-title';
    const model = document.createElement('div');
    model.className = 'device-card-model';
    model.textContent = `${d.brand} ${d.model}`;
    const imei = document.createElement('div');
    imei.className = 'device-card-imei';
    imei.textContent = d.imei1 ? `IMEI ${d.imei1}` : 'IMEI not recorded';
    title.appendChild(model);
    title.appendChild(imei);
    card.appendChild(title);

    const money = document.createElement('div');
    money.className = 'device-card-money';
    money.appendChild(moneyField('Purchase', d.purchasePrice));
    money.appendChild(moneyField('Sale', d.salePrice));
    money.appendChild(moneyField('Profit', d.profit, 'profit'));
    card.appendChild(money);

    const people = document.createElement('div');
    people.className = 'device-card-people';
    people.appendChild(personField('Seller', d.sellerName, d.sellerMobile));
    people.appendChild(personField('Buyer', d.buyerName, d.buyerMobile));
    card.appendChild(people);

    const footer = document.createElement('div');
    footer.className = 'device-card-footer';
    const purchased = document.createElement('span');
    purchased.textContent = `Purchased ${formatDate(d.purchasedAt)}`;
    const sold = document.createElement('span');
    sold.textContent = `Sold ${formatDate(d.soldAt)}`;
    footer.appendChild(purchased);
    footer.appendChild(sold);
    card.appendChild(footer);

    return card;
  }

  // ---------- Brands ----------
  const brandForm = document.getElementById('brand-form');
  const brandNameInput = document.getElementById('brand-name-input');
  const brandsError = document.getElementById('brands-error');
  const brandsGrid = document.getElementById('brands-grid');
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
    brandsGrid.innerHTML = '';
    brandsEmpty.hidden = brands.length > 0;
    for (const brand of brands) {
      const chip = document.createElement('div');
      chip.className = 'chip';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = brand.name;
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'icon-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteBrand(brand.id));
      chip.appendChild(nameSpan);
      chip.appendChild(deleteBtn);
      brandsGrid.appendChild(chip);
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
