// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// auth.js — احراز هویت Supabase Auth  v6.4
// جریان: ثبت‌نام → ساخت کاربر در Auth با approved=false → تأیید ناظر → ورود

/* ===== وضعیت کاربر جاری ===== */
let _currentUser = null;

function getCurrentUser() { return _currentUser; }

/* ===== ساخت ایمیل داخلی از روی کد پرسنلی ===== */
// نکته: دامنه باید واقعی و دارای MX باشد وگرنه Supabase خطای
// «Email address is invalid» می‌دهد. gmail.com مطمئن‌ترین گزینه است.
// کاربر این ایمیل را نمی‌بیند و واقعی بودنش لازم نیست، چون «Confirm email» خاموش است.
function _codeToEmail(code) {
  const clean = String(code).trim()
    .replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
    .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
    .replace(/\D/g, '');
  return `mehr.p${clean}@gmail.com`;
}

/* ===== ورود با کد پرسنلی و رمز ===== */
async function login() {
  const code     = document.getElementById('loginCode').value.trim();
  const password = document.getElementById('personnelCode').value.trim();

  if (!code || !password) { toastErr('کد پرسنلی و رمز عبور را وارد کنید.'); return; }

  const email = _codeToEmail(code);
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) { loginBtn.disabled = true; loginBtn.innerText = '⏳ در حال ورود...'; }

  try {
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const authUser = data.user;

    // دریافت پروفایل
    let profile = null;
    try {
      const { data: profRows } = await _supabase
        .from('profiles').select('*').eq('id', authUser.id).limit(1);
      if (profRows && profRows.length) {
        profile = profRows[0];
      } else {
        // پروفایل وجود ندارد؛ با upsert می‌سازیم تا خطای کلید تکراری ندهد
        const { data: created } = await _supabase
          .from('profiles')
          .upsert({
            id:             authUser.id,
            full_name:      authUser.email,
            role:           'teacher',
            personnel_code: code,
            approved:       false
          }, { onConflict: 'id' })
          .select()
          .limit(1);
        profile = (created && created.length) ? created[0]
          : { id: authUser.id, full_name: authUser.email, role: 'teacher', approved: false };
      }
    } catch(e) {
      console.warn('Profile read error:', e.message);
      // در صورت خطا، یک‌بار دیگر فقط می‌خوانیم (بدون insert) تا duplicate نشود
      try {
        const { data: retry } = await _supabase
          .from('profiles').select('*').eq('id', authUser.id).limit(1);
        if (retry && retry.length) profile = retry[0];
      } catch(e2) {}
    }

    // اگر کاربر هنوز توسط ادمین تأیید نشده، اجازه ورود نده
    if (profile && profile.approved !== true) {
      await _supabase.auth.signOut();
      toastErr('حساب شما هنوز توسط ادمین سایت تأیید نشده است. لطفاً پس از تأیید دوباره تلاش کنید.');
      return;
    }

    _currentUser = {
      id:        authUser.id,
      email:     authUser.email,
      role:      profile?.role || 'teacher',
      full_name: profile?.full_name || authUser.email,
      school_name: profile?.school_name || '',
      school_level: profile?.school_level || 'مشترک'
    };

    // هشدار اگر نقش انتخابی با پروفایل فرق داشت (ورود همچنان مجاز است)
    const hint = (document.getElementById('loginRoleHint') || {}).value;
    if (hint) {
      const actual = _currentUser.role;
      const schoolRoles = ['manager', 'teacher'];
      const mismatch =
        (hint === 'admin' && actual !== 'admin') ||
        (hint === 'inspector' && actual !== 'inspector') ||
        (hint === 'manager' && !schoolRoles.includes(actual) && actual !== 'admin');
      if (mismatch) {
        toastErr('نقش انتخابی با نقش تأییدشده شما یکی نیست؛ با نقش واقعی پروفایل وارد شدید: ' + (ROLE_LABELS[actual] || actual));
      }
    }

    // لاگ ورود
    try {
      await sbLoginLog.add(authUser.id, authUser.email, _currentUser.role);
      await addLog('login', 'ورود به سامانه', `${_currentUser.full_name} (${_currentUser.role})`);
    } catch(e) { console.warn('login log failed:', e.message); }

    await _loadAllDataAndShowDashboard();

  } catch(e) {
    const msg = e.message === 'Invalid login credentials'
      ? 'کد پرسنلی یا رمز عبور اشتباه است.'
      : 'خطا در ورود: ' + e.message;
    toastErr(msg);
  } finally {
    if (loginBtn) { loginBtn.disabled = false; loginBtn.innerText = 'ورود به سامانه ←'; }
  }
}

/* ===== نمایش/مخفی‌کردن فرم ثبت‌نام ===== */
function showRegisterForm() {
  const loginCard = document.getElementById('loginCard');
  if (loginCard) loginCard.style.display = 'none';
  const roleGrid = document.getElementById('loginRoleGrid');
  if (roleGrid) roleGrid.style.display = 'none';
  const reg = document.getElementById('registerForm');
  if (reg) reg.style.display = 'block';
}
function hideRegisterForm() {
  const reg = document.getElementById('registerForm');
  if (reg) reg.style.display = 'none';
  const loginCard = document.getElementById('loginCard');
  if (loginCard) loginCard.style.display = 'block';
  const roleGrid = document.getElementById('loginRoleGrid');
  if (roleGrid) roleGrid.style.display = 'grid';
}

const ROLE_LABELS = {
  admin: 'ادمین سایت',
  inspector: 'ناظر منطقه',
  manager: 'مدیر مدرسه',
  teacher: 'معاون / عضو کارگروه'
};

function selectLoginRole(role) {
  const hint = document.getElementById('loginRoleHint');
  if (hint) hint.value = role;
  document.querySelectorAll('[data-login-role]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-login-role') === role);
  });
  const pill = document.getElementById('selectedRolePill');
  if (pill) {
    const map = {
      manager: 'نقش انتخابی: مدیر / معاون مدرسه',
      inspector: 'نقش انتخابی: ناظر منطقه',
      admin: 'نقش انتخابی: ادمین سایت'
    };
    pill.textContent = map[role] || map.manager;
  }
  const regRole = document.getElementById('regRole');
  if (regRole && role !== 'admin') regRole.value = role === 'inspector' ? 'inspector' : 'manager';
}

/* سطح فعال داخل سامانه (مثل تغییر نقش/سطح در مای‌مدیو) */
async function setActiveLevel(level) {
  if (!_currentUser) return;
  _currentUser.school_level = level;
  const levelEl = document.getElementById('dashUserLevel');
  if (levelEl) levelEl.textContent = 'مقطع: ' + level;
  document.querySelectorAll('[data-active-level]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-active-level') === level);
  });
  if (typeof activityFilter !== 'undefined') {
    activityFilter.level = level;
    const filterLevel = document.getElementById('filterLevel');
    if (filterLevel) {
      if (![...filterLevel.options].some(o => o.value === level)) {
        const opt = document.createElement('option');
        opt.value = level; opt.textContent = level;
        filterLevel.appendChild(opt);
      }
      filterLevel.value = level;
    }
    if (typeof renderActivities === 'function') renderActivities();
  }
  try {
    await sbUsers.update(_currentUser.id, { school_level: level });
  } catch (e) {
    console.warn('setActiveLevel persist:', e.message);
  }
  toastOk('سطح فعال: ' + level);
}

function syncActiveLevelChips() {
  const lv = _currentUser?.school_level;
  document.querySelectorAll('[data-active-level]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-active-level') === lv);
  });
  // ناظر/ادمین هم می‌تواند سطح فیلتر ببیند
  const box = document.getElementById('levelSwitchBox');
  if (box) box.style.display = 'flex';
}

/* ===== ثبت‌نام با کد پرسنلی (در انتظار تأیید ناظر) ===== */
// کاربر در Supabase Auth ساخته می‌شود ولی با approved=false.
// رمز را خود Supabase امن نگه می‌دارد (دیگر SHA256 دستی لازم نیست).
async function registerRequest() {
  if (window._registerBusy) return;
  window._registerBusy = true;

  const name     = document.getElementById('regName').value.trim();
  const code     = document.getElementById('regCode').value.trim();
  const school   = document.getElementById('regSchool').value.trim();
  const role     = document.getElementById('regRole').value;
  const level    = (document.getElementById('regLevel') || {}).value || 'ابتدایی';
  const password = document.getElementById('regPassword').value.trim();

  if (!name || !code || !password) {
    window._registerBusy = false;
    toastErr('نام، کد پرسنلی و رمز عبور را کامل وارد کنید.');
    return;
  }
  if (!school && role !== 'inspector') {
    window._registerBusy = false;
    toastErr('نام مدرسه را وارد کنید.');
    return;
  }
  if (password.length < 6) {
    window._registerBusy = false;
    toastErr('رمز عبور باید حداقل ۶ کاراکتر باشد.');
    return;
  }
  // کد پرسنلی باید حداقل ۴ رقم باشد
  const codeDigits = String(code).replace(/\D/g, '');
  if (codeDigits.length < 4) {
    window._registerBusy = false;
    toastErr('کد پرسنلی باید حداقل ۴ رقم باشد.');
    return;
  }

  const regBtn = document.getElementById('registerSubmitBtn');
  if (regBtn) { regBtn.disabled = true; regBtn.innerText = '⏳ در حال ارسال...'; }

  try {
    const email = _codeToEmail(code);

    // ساخت کاربر در Supabase Auth. trigger پروفایل را با approved=false می‌سازد.
    const { data, error } = await _supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name:      name,
          role:           role,
          personnel_code: code,
          school_name:    school || null,
          school_level:   level
        }
      }
    });

    if (error) {
      // خطاهای رایج را به فارسی ترجمه کن
      let msg = error.message;
      if (/already registered|already been registered|User already/i.test(msg)) {
        msg = 'این کد پرسنلی قبلاً ثبت شده است.';
      } else if (/invalid/i.test(msg) && /email/i.test(msg)) {
        msg = 'کد پرسنلی پذیرفته نشد. لطفاً فقط رقم وارد کنید و دوباره تلاش کنید.';
      } else if (/rate limit/i.test(msg)) {
        msg = 'تعداد درخواست‌ها زیاد بوده است. چند دقیقه بعد دوباره تلاش کنید.';
      } else if (/at least/i.test(msg) && /character/i.test(msg)) {
        msg = 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
      }
      throw new Error(msg);
    }

    // تلاش برای ذخیره مقطع در پروفایل (اگر ستون وجود داشته باشد)
    try {
      if (data?.user?.id) {
        await _supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name,
          role,
          personnel_code: code,
          school_name: school || null,
          school_level: level,
          approved: false
        }, { onConflict: 'id' });
      }
    } catch (e) { console.warn('profile upsert after signup:', e.message); }

    // signUp ممکن است session بسازد؛ خارج می‌شویم تا کاربر تأییدنشده وارد نماند.
    try { await _supabase.auth.signOut(); } catch(e) {}

    toastOk('درخواست ثبت‌نام ارسال شد. پس از تأیید ادمین وارد شوید.');
    hideRegisterForm();
    document.getElementById('regName').value     = '';
    document.getElementById('regCode').value     = '';
    document.getElementById('regSchool').value   = '';
    document.getElementById('regPassword').value = '';

  } catch(e) {
    toastErr('خطا در ثبت‌نام: ' + e.message);
  } finally {
    window._registerBusy = false;
    if (regBtn) { regBtn.disabled = false; regBtn.innerText = 'ارسال درخواست'; }
  }
}

/* ===== تأیید کاربر — فقط ادمین سایت ===== */
async function approveUser(id) {
  if (!_currentUser || _currentUser.role !== 'admin') {
    toastErr('فقط ادمین سایت می‌تواند کاربران را تأیید کند.');
    return;
  }
  try {
    await sbUsers.update(id, { approved: true });
    const idx = users.findIndex(u => String(u.id) === String(id));
    if (idx !== -1) users[idx].approved = true;
    renderUsers();
    if (typeof renderPendingUsers === 'function') renderPendingUsers();
    toastOk('کاربر تأیید شد و اکنون می‌تواند وارد شود.');
    await addLog('edit', 'تأیید کاربر', `کاربر با شناسه ${id} تأیید شد`);
  } catch(e) {
    toastErr('خطا در تأیید کاربر: ' + e.message);
  }
}

/* ===== رد/حذف درخواست — فقط ادمین سایت ===== */
async function rejectUser(id) {
  if (!_currentUser || _currentUser.role !== 'admin') {
    toastErr('فقط ادمین سایت می‌تواند درخواست را رد کند.');
    return;
  }
  const ok = await showConfirm('این درخواست حذف شود؟', 'حذف درخواست', '🗑️');
  if (!ok) return;
  try {
    await sbUsers.remove(id);   // فقط پروفایل حذف می‌شود
    users = users.filter(u => String(u.id) !== String(id));
    renderUsers();
    if (typeof renderPendingUsers === 'function') renderPendingUsers();
    toastOk('درخواست حذف شد.');
    await addLog('delete', 'حذف درخواست کاربر', `کاربر با شناسه ${id} حذف شد`);
  } catch(e) {
    toastErr('خطا در حذف: ' + e.message);
  }
}

/* ===== لیست کاربران در انتظار تأیید (برای پنل ناظر) ===== */
function renderPendingUsers() {
  const box = document.getElementById('pendingUsersList');
  if (!box) return;
  const pending = (users || []).filter(u => u.approved !== true);
  if (!pending.length) {
    box.innerHTML = '<div class="empty-state"><div class="empty-ico">✅</div><div class="empty-text">درخواست در انتظار تأییدی وجود ندارد.</div></div>';
    return;
  }
  box.innerHTML = pending.map(u => `
    <div class="info-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <div>
        <b>${escapeHtml(u.full_name || '—')}</b>
        <div style="font-size:12px;color:#666;">کد پرسنلی: ${escapeHtml(u.personnel_code || '—')} — سمت: ${escapeHtml(ROLE_LABELS[u.role] || u.role || '—')}${u.school_name ? ' — مدرسه: ' + escapeHtml(u.school_name) : ''}${u.school_level ? ' — مقطع: ' + escapeHtml(u.school_level) : ''}</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-success" style="padding:6px 12px;font-size:13px;" data-action="approveUser" data-id="${u.id}">✔ تأیید</button>
        <button class="btn btn-danger"  style="padding:6px 12px;font-size:13px;" data-action="rejectUser"  data-id="${u.id}">✖ رد</button>
      </div>
    </div>`).join('');
}

/* ===== خروج ===== */
async function logout() {
  try { await addLog('logout', 'خروج از سامانه', _currentUser?.full_name || '—'); } catch(e) {}
  await _supabase.auth.signOut();
  _currentUser = null;

  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('mainNav').style.display    = 'none';
  document.getElementById('tabBar').style.display     = 'none';
  document.getElementById('moreDrawer').style.display = 'none';
  document.getElementById('moreDrawer').classList.remove('open');
  document.getElementById('loginPage').classList.remove('hidden');
  document.body.classList.remove('logged-in');
  const banner = document.getElementById('siteBanner');
  if (banner) banner.style.display = 'none';
  document.querySelectorAll('.module-section').forEach(s => s.style.display = 'none');
}

/* ===== بازیابی Session بعد از رفرش ===== */
async function restoreSession() {
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return false;

    let profile = null;
    try {
      const { data: rows } = await _supabase
        .from('profiles').select('*').eq('id', session.user.id).limit(1);
      if (rows && rows.length) profile = rows[0];
    } catch(e) { console.warn('restoreSession profile:', e.message); }

    // اگر تأیید نشده، session را پاک کن
    if (!profile || profile.approved !== true) {
      await _supabase.auth.signOut();
      return false;
    }

    _currentUser = {
      id:        session.user.id,
      email:     session.user.email,
      role:      profile?.role || 'teacher',
      full_name: profile?.full_name || session.user.email,
      school_name: profile?.school_name || '',
      school_level: profile?.school_level || 'مشترک'
    };

    await _loadAllDataAndShowDashboard();
    return true;
  } catch(e) {
    console.warn('restoreSession:', e);
    return false;
  }
}

/* ===== بارگذاری داده‌ها و نمایش داشبورد ===== */
async function _loadAllDataAndShowDashboard() {
  await Promise.all([
    loadUsers(), loadMembers(), loadActivities(),
    loadDocuments(), loadMeetings(), loadSchools(),
    loadObserverReports(), loadReports()
  ]);
  await loadGroupManagers();

  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('mainNav').style.display = 'flex';
  document.body.classList.add('logged-in');
  const banner = document.getElementById('siteBanner');
  if (banner) banner.style.display = 'none';
  if (window.innerWidth <= 768) {
    document.getElementById('tabBar').style.display     = 'flex';
    document.getElementById('moreDrawer').style.display = 'block';
    document.getElementById('moreDrawer').classList.remove('open');
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'صبح بخیر،';
    if (h < 17) return 'ظهر بخیر،';
    return 'عصر بخیر،';
  }

  const greetEl = document.getElementById('dashGreeting');
  const nameEl  = document.getElementById('dashUserName');
  const roleEl  = document.getElementById('dashUserRole');
  const levelEl = document.getElementById('dashUserLevel');
  const schoolLine = document.getElementById('dashSchoolLine');
  if (greetEl) greetEl.textContent = getGreeting();
  if (nameEl)  nameEl.textContent  = _currentUser.full_name;
  if (roleEl)  roleEl.textContent  = ROLE_LABELS[_currentUser.role] || _currentUser.role;
  if (levelEl) levelEl.textContent = 'مقطع: ' + (_currentUser.school_level || '—');
  if (schoolLine) {
    schoolLine.textContent = _currentUser.school_name
      ? ('مدرسه: ' + _currentUser.school_name)
      : (_currentUser.role === 'inspector' || _currentUser.role === 'admin' ? 'سطح: ناحیه / اداره' : 'مدرسه: —');
  }

  // فیلتر خودکار مقطع برای کاربران مدرسه
  if (typeof activityFilter !== 'undefined' && _currentUser.school_level) {
    const lv = _currentUser.school_level;
    if (lv === 'ابتدایی' || lv === 'متوسطه اول' || lv === 'متوسطه دوم') {
      activityFilter.level = lv;
      const filterLevel = document.getElementById('filterLevel');
      if (filterLevel) {
        // گزینه را اگر نبود اضافه کن
        if (![...filterLevel.options].some(o => o.value === lv)) {
          const opt = document.createElement('option');
          opt.value = lv; opt.textContent = lv;
          filterLevel.appendChild(opt);
        }
        filterLevel.value = lv;
      }
    }
  }

  applyRoleVisibility();
  if (typeof syncActiveLevelChips === 'function') syncActiveLevelChips();

  updateDashboard();
  if (typeof renderOfficeSection === 'function') renderOfficeSection();
  if (typeof syncGroupSelectToOfficial === 'function') syncGroupSelectToOfficial();
  renderUsers(); renderMembers(); renderActivities();
  renderDocuments(); loadActivitiesToDocuments();
  renderMeetings(); renderSchools(); renderObserverReports();
  populateObserverSchoolSelect();
  renderReportsList();
  if (typeof renderObserverCartable === 'function') renderObserverCartable();
  if (typeof renderPendingUsers === 'function') renderPendingUsers();
  const schoolDoc = document.getElementById('documentSchoolName');
  if (schoolDoc && _currentUser.school_name && !schoolDoc.value) schoolDoc.value = _currentUser.school_name;
}

/* ===== کنترل نمایش منوها بر اساس نقش =====
   admin     = ادمین سایت: تأیید کاربران
   inspector = ناظر منطقه: کارتابل همه مستندات
   manager/teacher = مدرسه: فقط فایل و گزارش خودشان
*/
function applyRoleVisibility() {
  const role = _currentUser && _currentUser.role;
  const isAdmin = role === 'admin';
  const isObserver = role === 'admin' || role === 'inspector';

  document.querySelectorAll('[data-section="usersSection"], #drawer-users').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });
  if (!isAdmin) {
    const s = document.getElementById('usersSection');
    if (s) s.style.display = 'none';
  }

  // ناظر + ادمین: کارتابل / ارزیابی / وظایف اداره
  const observerSelectors = [
    '[data-section="observerSection"]',
    '[data-section="officeSection"]',
    '#navBtnInspector',
    '#drawer-observer',
    '#drawer-inspector',
    '#drawer-office'
  ];
  observerSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.display = isObserver ? '' : 'none';
    });
  });
  if (!isObserver) {
    ['observerSection','inspectorSection','officeSection'].forEach(id => {
      const s = document.getElementById(id);
      if (s) s.style.display = 'none';
    });
  }

  document.querySelectorAll('[data-section="membersSection"], [data-section="groupsSection"], #drawer-members, #drawer-groups').forEach(el => {
    el.style.display = (isAdmin || role === 'manager') ? '' : 'none';
  });
}

function openInspectorPanel() {
  document.getElementById('navMenu').classList.remove('open');
  if (_currentUser && ['inspector','admin'].includes(_currentUser.role)) {
    showSection('observerSection');
    if (typeof renderObserverCartable === 'function') renderObserverCartable();
    if (typeof renderInspectorPanel === 'function') renderInspectorPanel();
  } else {
    toastErr('این بخش فقط برای ناظر منطقه / ادمین است.');
  }
}

function cancelInspectorPanel() {
  const m = document.getElementById('inspectorModal');
  if (m) m.style.display = 'none';
}

async function checkInspectorPassword() {
  // دسترسی فقط با نقش در پروفایل — رمز مشترک کلاینت امن نیست و حذف شد
  if (!_currentUser || !['inspector','admin'].includes(_currentUser.role)) {
    cancelInspectorPanel();
    toastErr('این بخش فقط برای ناظر منطقه / ادمین است.');
    return;
  }
  cancelInspectorPanel();
  showSection('observerSection');
  if (typeof renderObserverCartable === 'function') renderObserverCartable();
}

function closeInspectorPanel() {
  document.querySelectorAll('.module-section').forEach(s => s.style.display = 'none');
  goHome();
}

async function renderInspectorPanel() {
  // تأیید کاربران فقط در بخش ادمین است
  if (_currentUser && _currentUser.role === 'admin' && typeof renderPendingUsers === 'function') {
    renderPendingUsers();
  }
  const doneActivities = activities.filter(a => a.done).length;
  document.getElementById('insActivityDone').innerText = doneActivities + ' / 84';
  document.getElementById('insSchoolCount').innerText  = schools.length;

  try {
    const formRows = await sbForms.getAll();
    const formData = {};
    formRows.forEach(r => { formData[r.form_num] = r.data; });
    const formsDone = [1,2,3,4,5].filter(n =>
      formData[n] && Object.values(formData[n]).some(v => (v||'').toString().trim() !== '')
    ).length;
    document.getElementById('insFormsDone').innerText = formsDone + ' / 5';

    const formLabels = {
      1:'فرم ۱ — ثبت‌نام دانش‌آموزان', 2:'فرم ۲ — نیروی انسانی',
      3:'فرم ۳ — آماده‌سازی کلاس‌ها',  4:'فرم ۴ — ارزیابی کیفی',
      5:'فرم ۵ — گزارش نهایی'
    };
    const formsListEl = document.getElementById('insFormsList');
    if (formsListEl) {
      formsListEl.innerHTML = [1,2,3,4,5].map(n => {
        const filled = formData[n] && Object.values(formData[n]).some(v => (v||'').toString().trim() !== '');
        const badge  = filled
          ? '<span class="badge badge-success">تکمیل‌شده</span>'
          : '<span class="badge badge-danger">تکمیل‌نشده</span>';
        return `<div class="info-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <span>${formLabels[n]}</span>${badge}</div>`;
      }).join('');
    }
  } catch(e) { document.getElementById('insFormsDone').innerText = '—'; }

  const schoolsTable = document.getElementById('insSchoolsTable');
  if (schoolsTable) {
    schoolsTable.innerHTML = !schools.length
      ? '<tr><td colspan="5"><div class="empty-state"><div class="empty-ico">🏫</div><div class="empty-text">هنوز مدرسه‌ای ثبت نشده است.</div></div></td></tr>'
      : schools.map(s => `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.code||'')}</td><td>${escapeHtml(s.manager||'—')}</td><td>${escapeHtml(s.level||'—')}</td><td>${escapeHtml(String(s.score||0))}</td></tr>`).join('');
  }

  try {
    const loginLog = await sbLoginLog.getAll();
    document.getElementById('insLoginCount').innerText = loginLog.length;
    const loginTable = document.getElementById('insLoginTable');
    if (loginTable) {
      loginTable.innerHTML = !loginLog.length
        ? '<tr><td colspan="4"><div class="empty-state"><div class="empty-ico">🕒</div><div class="empty-text">هنوز ورودی ثبت نشده است.</div></div></td></tr>'
        : loginLog.map(l => {
            const d    = l.login_time ? new Date(l.login_time) : null;
            const date = d ? d.toLocaleDateString('fa-IR') : '—';
            const time = d ? d.toLocaleTimeString('fa-IR', {hour:'2-digit',minute:'2-digit'}) : '—';
            return `<tr><td>${escapeHtml(l.email||'')}</td><td>${escapeHtml(l.role||'')}</td><td>${date}</td><td>${time}</td></tr>`;
          }).join('');
    }
  } catch(e) { document.getElementById('insLoginCount').innerText = '—'; }
}
