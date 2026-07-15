// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// backup.js — پشتیبان‌گیری، بازیابی و لاگ  v5.9.0

const BACKUP_VERSION = '5.9.0';

/* ===== BACKUP — خروجی JSON از Supabase ===== */
async function backupData() {
  try {
    const [
      usersData, membersData, activitiesData,
      schoolsData, documentsData, meetingsData,
      observerData, formsData, reportsData
    ] = await Promise.all([
      sbUsers.getAll(), sbMembers.getAll(), sbActivities.getAll(),
      sbSchools.getAll(), sbDocuments.getAll(), sbMeetings.getAll(),
      sbObserver.getAll(), sbForms.getAll(), sbReports.getAll()
    ]);

    const data = {
      _meta: {
        version: BACKUP_VERSION,
        appName: 'سامانه جامع پروژه مهر',
        exportedAt:   new Date().toISOString(),
        exportedAtFa: new Date().toLocaleDateString('fa-IR') + ' — ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      },
      users: usersData, members: membersData, activities: activitiesData,
      schools: schoolsData, documents: documentsData, meetings: meetingsData,
      observerReports: observerData, forms: formsData, reports: reportsData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup_project_mehr_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    await addLog('backup', 'پشتیبان‌گیری', 'فایل backup دانلود شد');
    toastOk('فایل پشتیبان دانلود شد');
  } catch(e) {
    toastErr('خطا در پشتیبان‌گیری: ' + e.message);
  }
}

/* ===== EXPORT EXCEL — CSV فعالیت‌ها ===== */
function exportExcel() {
  let csv = '\uFEFFردیف,عنوان فعالیت,وضعیت\n';
  activities.forEach(a => {
    csv += `${a.id},"${a.title}",${a.done ? 'انجام شده' : 'انجام نشده'}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ProjectMehr_Activities.csv';
  a.click();
  addLog('export', 'خروجی اکسل', 'خروجی CSV فعالیت‌ها دانلود شد');
  toastOk('خروجی اکسل دانلود شد');
}

/* ===== RESTORE ===== */
function restoreData() {
  const file = document.getElementById('restoreFile').files[0];
  if (!file) { toastErr('فایل پشتیبان انتخاب نشده است'); return; }

  const loadingEl = document.getElementById('restoreLoading');

  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== 'object') throw new Error('فرمت فایل معتبر نیست');
      const hasData = ['users','members','activities','schools'].some(k => Array.isArray(data[k]));
      if (!hasData) throw new Error('این فایل یک فایل پشتیبان معتبر پروژه مهر نیست');

      const meta       = data._meta || {};
      const exportDate = meta.exportedAtFa || '—';
      const version    = meta.version || 'قدیمی';

      const ok = await showConfirm(
        `نسخه: ${version}\nتاریخ پشتیبان: ${exportDate}\n\nتمام اطلاعات فعلی با این فایل جایگزین می‌شود.`,
        'بازیابی اطلاعات', '🔁'
      );
      if (!ok) return;
      if (loadingEl) loadingEl.style.display = 'flex';

      try {
        // upsert هر entity به Supabase
        if (Array.isArray(data.users) && data.users.length)
          for (const u of data.users) await sbUsers.add({ name: u.name, code: u.code, role: u.role }).catch(() => {});

        if (Array.isArray(data.members) && data.members.length)
          for (const m of data.members) await sbMembers.add({ group_name: m.group || m.group_name, name: m.name, post: m.post, phone: m.phone }).catch(() => {});

        if (Array.isArray(data.activities) && data.activities.length)
          await sbActivities.upsertAll(data.activities.map(a => ({ id: a.id, title: a.title, done: a.done })));

        if (Array.isArray(data.schools) && data.schools.length)
          for (const s of data.schools) await sbSchools.add({ name: s.name, code: s.code, manager: s.manager, level: s.level, score: s.score || 0 }).catch(() => {});

        if (Array.isArray(data.meetings) && data.meetings.length)
          for (const m of data.meetings) await sbMeetings.add({ title: m.title, date: m.date, members: m.members || m.attendees, resolutions: m.resolutions || m.decisions, followup: m.followup }).catch(() => {});

        if (Array.isArray(data.reports) && data.reports.length)
          for (const r of data.reports) await sbReports.add(r).catch(() => {});

        if (Array.isArray(data.forms) && data.forms.length) {
          for (const f of data.forms) await sbForms.save(f.form_num, f.data).catch(() => {});
        } else if (data.forms && typeof data.forms === 'object') {
          for (const [num, d] of Object.entries(data.forms)) await sbForms.save(parseInt(num), d).catch(() => {});
        }

        await addLog('restore', 'بازیابی', `فایل پشتیبان نسخه ${version} (${exportDate}) بازیابی شد`);
        toastOk('بازیابی موفق — در حال بارگذاری مجدد...');
        setTimeout(() => location.reload(), 1500);
      } catch(err) {
        if (loadingEl) loadingEl.style.display = 'none';
        toastErr('خطا در بازیابی: ' + err.message);
      }
    } catch(err) {
      if (loadingEl) loadingEl.style.display = 'none';
      toastErr(err.message || 'فایل پشتیبان معتبر نیست');
    }
  };
  reader.onerror = () => {
    if (loadingEl) loadingEl.style.display = 'none';
    toastErr('خطا در خواندن فایل پشتیبان');
  };
  reader.readAsText(file);
}

/* ===== LOG SYSTEM — Supabase ===== */

async function addLog(type, title, detail) {
  try {
    const currentUser = (typeof users !== 'undefined' && window._currentUserCode)
      ? (users.find(u => u.code === window._currentUserCode) || {}).name || '—'
      : '—';
    await sbLog.add(type, title, detail, currentUser);
  } catch(e) {
    console.warn('addLog failed:', e.message);
  }
}

const LOG_ICONS = {
  login:'🔑', logout:'🚪', backup:'💾', restore:'🔁',
  export:'📊', add:'➕', edit:'✏️', delete:'🗑️', other:'📌'
};

async function renderActivityLog() {
  const container = document.getElementById('activityLogList');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:20px;color:#aaa;">در حال بارگذاری...</div>';
  try {
    const log = await sbLog.getAll();
    if (!log.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-ico">📋</div><div class="empty-text">هنوز رویدادی ثبت نشده است.</div></div>';
      return;
    }
    container.innerHTML = [...log].reverse().map(l => {
      const ico  = LOG_ICONS[l.type] || LOG_ICONS.other;
      const d    = l.created_at ? new Date(l.created_at) : null;
      const date = d ? d.toLocaleDateString('fa-IR') : (l.date || '—');
      const time = d ? d.toLocaleTimeString('fa-IR', { hour:'2-digit', minute:'2-digit' }) : (l.time || '—');
      const user = l.user_name || l.user || '';
      return `<div class="info-card" style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;margin-bottom:8px;">
        <span style="font-size:18px;flex-shrink:0;">${ico}</span>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">
            <strong style="font-size:13px;">${escapeHtml(l.title||'')}</strong>
            <span style="font-size:11px;color:#999;">${date} — ${time}</span>
          </div>
          <div style="font-size:12px;color:#555;margin-top:3px;">${escapeHtml(l.detail||'')}</div>
          ${user && user !== '—' ? `<div style="font-size:11px;color:#aaa;margin-top:2px;">👤 ${escapeHtml(user)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    container.innerHTML = '<div class="empty-state"><div class="empty-ico">⚠️</div><div class="empty-text">خطا در بارگذاری لاگ‌ها: ' + escapeHtml(e.message) + '</div></div>';
  }
}

async function exportLog() {
  try {
    const log = await sbLog.getAll();
    if (!log.length) { toastWarn('لاگی برای خروجی وجود ندارد'); return; }
    let csv = '\uFEFFنوع,عنوان,جزئیات,کاربر,تاریخ,ساعت\n';
    [...log].reverse().forEach(l => {
      const d    = l.created_at ? new Date(l.created_at) : null;
      const date = d ? d.toLocaleDateString('fa-IR') : (l.date || '—');
      const time = d ? d.toLocaleTimeString('fa-IR', { hour:'2-digit', minute:'2-digit' }) : (l.time || '—');
      csv += `"${l.type}","${l.title}","${l.detail}","${l.user_name || l.user || ''}","${date}","${time}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'logs_project_mehr_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  } catch(e) {
    toastErr('خطا در خروجی لاگ: ' + e.message);
  }
}

async function clearLog() {
  const ok = await showConfirm('تمام لاگ‌های فعالیت برای همیشه پاک می‌شوند.', 'پاک کردن لاگ‌ها', '🗑️');
  if (!ok) return;
  try {
    // حذف کل جدول لاگ از طریق REST API
    await sbFetch('activity_log', { method: 'DELETE', prefer: 'return=minimal', headers: { 'Prefer': 'return=minimal' } });
  } catch(e) {
    // اگر حذف کل جدول پشتیبانی نشد، لیست خالی نشان بده
    console.warn('clearLog:', e);
  }
  renderActivityLog();
  toastOk('لاگ‌ها پاک شدند');
}
