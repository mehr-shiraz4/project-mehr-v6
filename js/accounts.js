js/// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// users.js — کاربران (profiles) و اعضای کارگروه  v6.0

/* ===== حافظه محلی (cache) ===== */
let users   = [];
let members = [];

/* ===== بارگذاری از Supabase ===== */
async function loadUsers() {
  try {
    users = await sbUsers.getAll();
  } catch(e) {
    console.error('loadUsers:', e);
    toastErr('خطا در بارگذاری کاربران: ' + e.message);
    users = [];
  }
}

async function loadMembers() {
  try {
    const rows = await sbMembers.getAll();
    members = rows.map(m => ({ ...m, group: m.group_name || m.group }));
  } catch(e) {
    console.error('loadMembers:', e);
    toastErr('خطا در بارگذاری اعضا: ' + e.message);
    members = [];
  }
}

/* ===== USERS ===== */

async function addUser() {
  const name   = document.getElementById('userName').value.trim();
  const code   = document.getElementById('userCode').value.trim();
  const role   = document.getElementById('userRole').value;
  const editId = document.getElementById('userName').dataset.editId;
  if (!name || !code) { toastErr('اطلاعات را کامل وارد کنید'); return; }

  try {
    if (editId) {
      await sbUsers.update(editId, { full_name: name, role });
      const idx = users.findIndex(u => String(u.id) === String(editId));
      if (idx !== -1) users[idx] = { ...users[idx], full_name: name, role };
      delete document.getElementById('userName').dataset.editId;
      await addLog('edit', 'ویرایش کاربر', `${name} (${role}) ویرایش شد`);
      toastOk('اطلاعات کاربر ویرایش شد');
    } else {
      // توجه: ایجاد کاربر جدید نیازمند signUp از طریق Admin API است
      // در پنل Supabase، کاربران را با invite یا Admin API ایجاد کنید
      toastErr('برای افزودن کاربر جدید از پنل Supabase استفاده کنید.');
      return;
    }
  } catch(e) {
    toastErr('خطا: ' + e.message);
    return;
  }

  renderUsers();
  document.getElementById('userName').value = '';
  document.getElementById('userCode').value = '';
}

function editUser(id) {
  const u = users.find(x => String(x.id) === String(id));
  if (!u) return;
  document.getElementById('userName').value = u.full_name || u.name || '';
  document.getElementById('userCode').value  = u.email || '';
  document.getElementById('userRole').value  = u.role || '';
  document.getElementById('userName').dataset.editId = id;
  document.getElementById('userName').focus();
  showSection('usersSection');
}

async function deleteUser(id) {
  const u = users.find(x => String(x.id) === String(id));
  const ok = await showConfirm('این کاربر حذف شود؟', 'حذف کاربر', '🗑️');
  if (!ok) return;
  try {
    await sbUsers.remove(id);
    users = users.filter(x => String(x.id) !== String(id));
    renderUsers();
    if (u) {
      await addLog('delete', 'حذف کاربر', `${u.full_name||u.name||''} (${u.role}) حذف شد`);
      toastOk('کاربر حذف شد');
    }
  } catch(e) {
    toastErr('خطا در حذف کاربر: ' + e.message);
  }
}

function renderUsers() {
  const t = document.getElementById('usersTable'); if (!t) return;
  t.innerHTML = '';
  users.forEach((u, i) => {
    const displayName = escapeHtml(u.full_name || u.name || '');
    const displayId   = escapeHtml(u.email || String(u.id).slice(0,8));
    t.innerHTML += `<tr><td>${i+1}</td><td>${displayName}</td><td>${displayId}</td><td>${escapeHtml(u.role)}</td>
    <td>
      <button class="btn btn-white" style="padding:5px 10px;font-size:12px;" data-action="editUser" data-id="${u.id}">✏️</button>
      <button class="btn btn-danger" style="padding:5px 10px;font-size:12px;" data-action="deleteUser" data-id="${u.id}">🗑️</button>
    </td></tr>`;
  });
}

/* ===== MEMBERS ===== */

async function addMember() {
  const group  = document.getElementById('groupSelect').value;
  const name   = document.getElementById('memberName').value.trim();
  const post   = document.getElementById('memberPost').value.trim();
  const phone  = document.getElementById('memberPhone').value.trim();
  const editId = document.getElementById('memberName').dataset.editId;
  if (!name) { toastErr('نام عضو وارد نشده است'); return; }

  try {
    if (editId) {
      await sbMembers.update(editId, { group_name: group, name, post, phone });
      const idx = members.findIndex(m => String(m.id) === String(editId));
      if (idx !== -1) members[idx] = { ...members[idx], group, group_name: group, name, post, phone };
      delete document.getElementById('memberName').dataset.editId;
    } else {
      const result  = await sbMembers.add({ group_name: group, name, post, phone });
      const created = Array.isArray(result) ? result[0] : result;
      members.push({ ...created, group: created.group_name || group });
    }
  } catch(e) {
    toastErr('خطا: ' + e.message);
    return;
  }

  renderMembers();
  document.getElementById('memberName').value  = '';
  document.getElementById('memberPost').value  = '';
  document.getElementById('memberPhone').value = '';
}

function editMember(id) {
  const m = members.find(x => String(x.id) === String(id));
  if (!m) return;
  document.getElementById('groupSelect').value = m.group || m.group_name;
  document.getElementById('memberName').value  = m.name;
  document.getElementById('memberPost').value  = m.post;
  document.getElementById('memberPhone').value = m.phone;
  document.getElementById('memberName').dataset.editId = id;
  document.getElementById('memberName').focus();
  showSection('membersSection');
}

async function deleteMember(id) {
  try {
    await sbMembers.remove(id);
    members = members.filter(x => String(x.id) !== String(id));
    renderMembers();
  } catch(e) {
    toastErr('خطا در حذف عضو: ' + e.message);
  }
}

function renderMembers() {
  const t = document.getElementById('membersTable'); if (!t) return;
  t.innerHTML = '';
  members.forEach((m, i) => {
    const g = escapeHtml(m.group || m.group_name || '');
    t.innerHTML += `<tr><td>${i+1}</td><td>${g}</td><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.post)}</td><td>${escapeHtml(m.phone)}</td>
    <td>
      <button class="btn btn-white" style="padding:5px 10px;font-size:12px;" data-action="editMember" data-id="${m.id}">✏️</button>
      <button class="btn btn-danger" style="padding:5px 10px;font-size:12px;" data-action="deleteMember" data-id="${m.id}">🗑️</button>
    </td></tr>`;
  });
}
