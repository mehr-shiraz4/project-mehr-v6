// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// schools.js — مدارس، مستندات، صورتجلسات، ناظر  v6.0

/* ===== حافظه محلی ===== */
let documents       = [];
let meetings        = [];
let schools         = [];
let observerReports = [];

/* ===== بارگذاری از Supabase ===== */
async function loadDocuments() {
  try { documents = await sbDocuments.getAll(); }
  catch(e) { console.error('loadDocuments:', e); documents = []; }
}
async function loadMeetings() {
  try { meetings = await sbMeetings.getAll(); }
  catch(e) { console.error('loadMeetings:', e); meetings = []; }
}
async function loadSchools() {
  try { schools = await sbSchools.getAll(); }
  catch(e) { console.error('loadSchools:', e); schools = []; }
}
async function loadObserverReports() {
  try { observerReports = await sbObserver.getAll(); }
  catch(e) { console.error('loadObserverReports:', e); observerReports = []; }
}

/* ===== DOCUMENTS — آپلود در Storage ===== */

function loadActivitiesToDocuments() {
  const sel = document.getElementById('documentActivity'); if (!sel) return;
  sel.innerHTML = '';
  activities.forEach(a => { sel.innerHTML += `<option value="${a.id}">${a.id} - ${escapeHtml(a.title)}</option>`; });
}

async function saveDocument() {
  const title    = document.getElementById('documentTitle').value.trim();
  const activity = document.getElementById('documentActivity').value;
  const type     = document.getElementById('documentType').value;
  const schoolEl = document.getElementById('documentSchoolName');
  const schoolName = schoolEl ? schoolEl.value.trim() : '';
  const fi       = document.getElementById('documentFile');
  const btn      = document.getElementById('saveDocumentBtn');
  const barWrap  = document.getElementById('docUploadProgress');
  const barFill  = document.getElementById('docUploadBar');
  const barText  = document.getElementById('docUploadText');
  const file     = fi.files[0];
  const user     = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  if (!user) { toastErr('ابتدا وارد سامانه شوید'); return; }
  if (!title) { toastErr('عنوان مستند را وارد کنید'); return; }
  if (!file)  { toastErr('فایل انتخاب نشده است'); return; }

  const MAX_SIZE = 20 * 1024 * 1024; // ۲۰MB
  if (file.size > MAX_SIZE) {
    toastErr('حجم فایل بیش از ۲۰ مگابایت است. فایل را فشرده کنید یا PDF سبک‌تر بفرستید.');
    fi.value = '';
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = '⏳ در حال آپلود...'; }
  if (barWrap) barWrap.style.display = 'block';
  if (barFill) barFill.style.width = '15%';
  if (barText) barText.textContent = 'ارسال فایل به سرور...';

  try {
    toastOk('در حال آپلود امن...');
    if (barFill) barFill.style.width = '45%';

    const { filePath, signedUrl } = await uploadFile('school-files', file);
    if (barFill) barFill.style.width = '75%';
    if (barText) barText.textContent = 'ثبت در کارتابل ناظر...';

    const docData = {
      title,
      activity_id: activity,
      file_type: type,
      file_name: file.name,
      file_path: filePath,
      file_url: signedUrl || '',
      uploaded_by: user.id,
      school_name: schoolName || user.full_name || '',
      review_status: 'pending'
    };
    const result = await sbDocuments.add(docData);
    const created = Array.isArray(result) ? result[0] : result;
    documents.unshift(created);
    renderDocuments();
    if (typeof renderObserverCartable === 'function') renderObserverCartable();

    document.getElementById('documentTitle').value = '';
    fi.value = '';
    if (barFill) barFill.style.width = '100%';
    if (barText) barText.textContent = 'آپلود کامل شد — به کارتابل ناظر ارسال شد';
    const msg = document.getElementById('docSavedMsg');
    if (msg) { msg.style.display = 'block'; setTimeout(() => { msg.style.display = 'none'; }, 3000); }
    toastOk('مستند آپلود شد و به کارتابل ناظر رفت');
    setTimeout(() => { if (barWrap) barWrap.style.display = 'none'; if (barFill) barFill.style.width = '0%'; }, 1200);
  } catch(err) {
    const hint = /network|fetch|Failed to fetch/i.test(err.message || '')
      ? ' اتصال اینترنت یا دسترسی Storage را بررسی کنید.'
      : (/row-level security|RLS|policy|403|401/i.test(err.message || '')
        ? ' دسترسی بارگذاری تنظیم نشده؛ فایل supabase-security.sql را در پنل اجرا کنید.'
        : '');
    toastErr('خطا در آپلود مستند: ' + err.message + hint);
    if (barText) barText.textContent = 'آپلود ناموفق';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📤 ثبت مستند'; }
  }
}

async function deleteDocument(id) {
  const doc = documents.find(d => String(d.id) === String(id));
  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  const isAdmin = user && user.role === 'admin';
  if (doc && doc.review_status === 'approved' && !isAdmin) {
    toastErr('مستند تأییدشده فقط توسط ادمین قابل حذف است.');
    return;
  }
  try {
    await sbDocuments.remove(id);
    documents = documents.filter(d => String(d.id) !== String(id));
    renderDocuments();
    if (typeof renderObserverCartable === 'function') renderObserverCartable();
  } catch(e) {
    toastErr('خطا در حذف مستند: ' + e.message);
  }
}

async function openDocumentFile(id) {
  const doc = documents.find(d => String(d.id) === String(id));
  if (!doc) return;
  try {
    const pathOrUrl = doc.file_path || doc.file_url;
    const url = await getDocumentSignedUrl(pathOrUrl, 3600);
    if (!url) { toastErr('مسیر فایل موجود نیست'); return; }
    window.open(url, '_blank');
  } catch(e) {
    toastErr('خطا در باز کردن فایل: ' + e.message);
  }
}

function reviewStatusLabel(status) {
  if (status === 'approved') return '<span class="tag badge-parvareshi">تأیید شده</span>';
  if (status === 'rejected') return '<span class="tag" style="background:#FFCDD2;color:#B71C1C;">رد شده</span>';
  return '<span class="tag badge-prep">در انتظار بررسی</span>';
}

function renderDocuments() {
  const list = document.getElementById('documentsList'); if (!list) return;
  list.innerHTML = '';
  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  const mine = (user && !['admin','inspector'].includes(user.role))
    ? documents.filter(d => String(d.uploaded_by) === String(user.id))
    : documents;

  if (!mine.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-ico">📎</div><div class="empty-text">هنوز مستندی ثبت نشده است.</div></div>';
    return;
  }
  mine.forEach(doc => {
    const fileName = doc.file_name || '';
    const icon = doc.file_type === 'PDF' ? '📕' : doc.file_type === 'Word' ? '📘' : doc.file_type === 'اکسل' ? '📗' : '📄';
    list.innerHTML += `<div class="info-card">
      <h4>${icon} ${escapeHtml(doc.title)} ${reviewStatusLabel(doc.review_status)}</h4>
      <p>مدرسه: ${escapeHtml(doc.school_name || '—')} &nbsp;|&nbsp; فعالیت: ${escapeHtml(String(doc.activity_id||''))} &nbsp;|&nbsp; نوع: ${escapeHtml(doc.file_type||'')} &nbsp;|&nbsp; فایل: ${escapeHtml(fileName)}</p>
      <button class="btn btn-white" style="padding:6px 12px;font-size:12px;" data-action="openDocumentFile" data-id="${doc.id}">👁️ مشاهده امن</button>
      <button class="btn btn-danger" style="padding:6px 12px;font-size:12px;" data-action="deleteDocument" data-id="${doc.id}">🗑️ حذف</button>
    </div>`;
  });
}

/* ===== کارتابل ناظر منطقه — مستندات + گزارش‌ها ===== */
function renderObserverCartable() {
  const box = document.getElementById('observerCartable');
  if (!box) return;
  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  if (!user || !['admin','inspector'].includes(user.role)) {
    box.innerHTML = '<div class="empty-state"><div class="empty-text">فقط ناظر منطقه / ادمین</div></div>';
    return;
  }

  const statusFilter = (document.getElementById('cartableFilter') || {}).value || 'pending';
  const tab = (document.getElementById('cartableTab') || {}).value || 'all';

  const matchStatus = (st) => {
    const s = st || 'pending';
    if (statusFilter === 'all') return true;
    return s === statusFilter;
  };

  let docs = (documents || []).filter(d => matchStatus(d.review_status));
  let reps = (typeof reports !== 'undefined' ? reports : []).filter(r => matchStatus(r.review_status));

  if (tab === 'documents') reps = [];
  if (tab === 'reports') docs = [];

  const pendingDocs = (documents || []).filter(d => !d.review_status || d.review_status === 'pending').length;
  const pendingReps = (typeof reports !== 'undefined' ? reports : []).filter(r => !r.review_status || r.review_status === 'pending').length;
  const countEl = document.getElementById('cartablePendingCount');
  const repEl = document.getElementById('cartableReportPending');
  if (countEl) countEl.textContent = pendingDocs + pendingReps;
  if (repEl) repEl.textContent = pendingReps;

  if (!docs.length && !reps.length) {
    box.innerHTML = '<div class="empty-state"><div class="empty-ico">📭</div><div class="empty-text">موردی در این فیلتر نیست.</div></div>';
    return;
  }

  // گروه‌بندی بر اساس مدرسه
  const groups = {};
  const addItem = (school, item) => {
    const key = school || 'بدون نام مدرسه';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  };
  docs.forEach(d => addItem(d.school_name, { kind: 'doc', data: d }));
  reps.forEach(r => addItem(r.school_name, { kind: 'report', data: r }));

  let html = '';
  Object.keys(groups).sort().forEach(school => {
    html += `<div class="cartable-school"><h4>🏫 ${escapeHtml(school)} <small>(${groups[school].length})</small></h4>`;
    groups[school].forEach(item => {
      if (item.kind === 'doc') {
        const doc = item.data;
        html += `<div class="info-card cartable-item">
          <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;">
            <div>
              <span class="tag badge-mehr">مستند</span>
              <b>${escapeHtml(doc.title)}</b> ${reviewStatusLabel(doc.review_status)}
              <div style="font-size:12px;color:#666;margin-top:4px;">
                فعالیت ${escapeHtml(String(doc.activity_id||'—'))} · ${escapeHtml(doc.file_type||'')} · ${escapeHtml(doc.file_name||'')}
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="btn btn-white" style="padding:6px 10px;font-size:12px;" data-action="openDocumentFile" data-id="${doc.id}">👁️ مشاهده</button>
              <button class="btn btn-success" style="padding:6px 10px;font-size:12px;" data-action="reviewDocument" data-id="${doc.id}" data-status="approved">✔ تأیید</button>
              <button class="btn btn-danger" style="padding:6px 10px;font-size:12px;" data-action="reviewDocument" data-id="${doc.id}" data-status="rejected">✖ رد</button>
            </div>
          </div>
        </div>`;
      } else {
        const r = item.data;
        html += `<div class="info-card cartable-item" style="border-right:4px solid #0D9488;">
          <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:flex-start;">
            <div style="flex:1;">
              <span class="tag badge-prep">گزارش</span>
              <b>${escapeHtml(r.group || r.group_name || '')}</b> ${reviewStatusLabel(r.review_status)}
              <div style="font-size:12px;color:#666;margin-top:4px;">
                👤 ${escapeHtml(r.name || '—')} · 🎓 ${escapeHtml(r.school_level || '—')} · 🗓 ${escapeHtml(r.period || '')} · 📊 ${escapeHtml(r.progress || '')} · 📅 ${escapeHtml(r.date || '')}
              </div>
              <div style="font-size:12px;margin-top:6px;white-space:pre-wrap;background:#F7FBF9;padding:8px;border-radius:8px;">${escapeHtml((r.done || '').slice(0, 400))}${(r.done||'').length > 400 ? '…' : ''}</div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="btn btn-success" style="padding:6px 10px;font-size:12px;" data-action="reviewReport" data-id="${r.id}" data-status="approved">✔ تأیید</button>
              <button class="btn btn-danger" style="padding:6px 10px;font-size:12px;" data-action="reviewReport" data-id="${r.id}" data-status="rejected">✖ رد</button>
            </div>
          </div>
        </div>`;
      }
    });
    html += '</div>';
  });
  box.innerHTML = html;
}

async function reviewDocument(id, status) {
  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  if (!user || !['admin','inspector'].includes(user.role)) {
    toastErr('فقط ناظر منطقه می‌تواند بررسی کند.');
    return;
  }
  try {
    await sbDocuments.update(id, {
      review_status: status,
      reviewed_at: new Date().toISOString()
    });
    const idx = documents.findIndex(d => String(d.id) === String(id));
    if (idx !== -1) {
      documents[idx].review_status = status;
      documents[idx].reviewed_at = new Date().toISOString();
    }
    renderDocuments();
    renderObserverCartable();
    toastOk(status === 'approved' ? 'مستند تأیید شد' : 'مستند رد شد');
  } catch(e) {
    toastErr('خطا در ثبت بررسی: ' + e.message);
  }
}

async function reviewReport(id, status) {
  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  if (!user || !['admin','inspector'].includes(user.role)) {
    toastErr('فقط ناظر منطقه می‌تواند بررسی کند.');
    return;
  }
  try {
    if (typeof sbReports.update === 'function') {
      await sbReports.update(id, { review_status: status, reviewed_at: new Date().toISOString() });
    }
    const idx = reports.findIndex(r => String(r.id) === String(id));
    if (idx !== -1) {
      reports[idx].review_status = status;
      reports[idx].reviewed_at = new Date().toISOString();
    }
    renderReportsList();
    renderObserverCartable();
    toastOk(status === 'approved' ? 'گزارش تأیید شد' : 'گزارش رد شد');
  } catch(e) {
    // حتی اگر ستون در DB نباشد، وضعیت محلی را عوض کن
    const idx = reports.findIndex(r => String(r.id) === String(id));
    if (idx !== -1) reports[idx].review_status = status;
    renderReportsList();
    renderObserverCartable();
    toastErr('بررسی محلی ثبت شد (سرور: ' + e.message + ')');
  }
}

/* ===== MEETINGS ===== */

async function saveMeeting() {
  const m = {
    number:      document.getElementById('meetingNumber').value,
    date:        document.getElementById('meetingDate').value,
    title:       document.getElementById('meetingTitle').value,
    members:     document.getElementById('meetingMembers').value,
    resolutions: document.getElementById('meetingResolutions').value,
    followup:    document.getElementById('meetingFollowup').value
  };
  if (!m.title) { toastErr('عنوان جلسه وارد نشده است'); return; }
  try {
    const result  = await sbMeetings.add(m);
    const created = Array.isArray(result) ? result[0] : result;
    meetings.push(created);
    renderMeetings();
    ['meetingNumber','meetingDate','meetingTitle','meetingMembers','meetingResolutions','meetingFollowup']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  } catch(e) {
    toastErr('خطا در ذخیره صورتجلسه: ' + e.message);
  }
}

async function deleteMeeting(id) {
  try {
    await sbMeetings.remove(id);
    meetings = meetings.filter(m => String(m.id) !== String(id));
    renderMeetings();
  } catch(e) {
    toastErr('خطا در حذف صورتجلسه: ' + e.message);
  }
}

function renderMeetings() {
  const list = document.getElementById('meetingsList'); if (!list) return;
  list.innerHTML = '';
  if (!meetings.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-ico">📝</div><div class="empty-text">هنوز صورتجلسه‌ای ثبت نشده است.</div></div>';
    return;
  }
  meetings.forEach(m => {
    list.innerHTML += `<div class="info-card">
      <h4>📝 جلسه شماره ${escapeHtml(m.number || '')} — ${escapeHtml(m.title)}</h4>
      <p>📅 تاریخ: ${escapeHtml(m.date || '')}</p>
      <p>👥 اعضای حاضر: ${escapeHtml(m.members || '')}</p>
      <p>✅ مصوبات: ${escapeHtml(m.resolutions || '')}</p>
      <p>👤 مسئول پیگیری: ${escapeHtml(m.followup || '')}</p>
      <button class="btn btn-danger" style="padding:5px 10px;font-size:12px;margin-top:8px;" data-action="deleteMeeting" data-id="${m.id}">🗑️ حذف</button>
    </div>`;
  });
}

/* ===== SCHOOLS ===== */

async function addSchool() {
  const name    = document.getElementById('schoolName').value.trim();
  const code    = document.getElementById('schoolCode').value.trim();
  const manager = document.getElementById('schoolManager').value.trim();
  const level   = document.getElementById('schoolLevel').value;
  if (!name || !code) { toastErr('نام و کد مدرسه الزامی است'); return; }
  if (schools.find(s => s.code === code)) {
    toastErr('مدرسه‌ای با کد «' + code + '» قبلاً ثبت شده است');
    return;
  }
  try {
    const result  = await sbSchools.add({ name, code, manager, level, score: 0 });
    const created = Array.isArray(result) ? result[0] : result;
    schools.push(created);
    renderSchools();
    await addLog('add', 'افزودن مدرسه', `${name} (کد: ${code}) اضافه شد`);
    toastOk('مدرسه «' + name + '» ثبت شد');
    document.getElementById('schoolName').value    = '';
    document.getElementById('schoolCode').value    = '';
    document.getElementById('schoolManager').value = '';
  } catch(e) {
    toastErr('خطا در ثبت مدرسه: ' + e.message);
  }
}

async function deleteSchool(id) {
  const s = schools.find(x => String(x.id) === String(id));
  try {
    await sbSchools.remove(id);
    schools = schools.filter(x => String(x.id) !== String(id));
    renderSchools();
    if (s) {
      await addLog('delete', 'حذف مدرسه', `${s.name} (کد: ${s.code||''}) حذف شد`);
      toastOk('مدرسه حذف شد');
    }
  } catch(e) {
    toastErr('خطا در حذف مدرسه: ' + e.message);
  }
}

function renderSchools() {
  const t = document.getElementById('schoolsTable'); if (!t) return;
  t.innerHTML = '';
  schools.forEach((s, i) => {
    t.innerHTML += `<tr><td>${i+1}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.code||'')}</td><td>${escapeHtml(s.manager||'')}</td><td>${escapeHtml(s.level||'')}</td>
    <td><button class="btn btn-danger" style="padding:5px 10px;font-size:12px;" data-action="deleteSchool" data-id="${s.id}">🗑️</button></td></tr>`;
  });
  generateRanking();
}

function generateRanking() {
  const ranking = [...schools].sort((a, b) => (b.score || 0) - (a.score || 0));
  const t = document.getElementById('rankingTable'); if (!t) return;
  t.innerHTML = '';
  if (!ranking.length) {
    t.innerHTML = '<tr><td colspan="5" style="padding:0;border:none;"><div class="empty-state"><div class="empty-ico">🏆</div><div class="empty-text">هنوز مدرسه‌ای ثبت نشده است.</div></div></td></tr>';
    return;
  }
  const medals = ['🥇','🥈','🥉'];
  ranking.forEach((s, i) => {
    t.innerHTML += `<tr><td>${medals[i] || (i+1)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.level||'')}</td><td>${escapeHtml(s.manager||'')}</td><td><strong>${escapeHtml(String(s.score||0))}</strong></td></tr>`;
  });
}

/* ===== OBSERVER ===== */

function populateObserverSchoolSelect() {
  const sel = document.getElementById('observerSchoolSelect'); if (!sel) return;
  sel.innerHTML = '';
  if (!schools.length) { sel.innerHTML = '<option>ابتدا مدرسه ثبت کنید</option>'; return; }
  schools.forEach(s => { sel.innerHTML += `<option value="${s.id}">${escapeHtml(s.name)}</option>`; });
}

async function saveObserverReport() {
  const schoolId = document.getElementById('observerSchoolSelect').value;
  const report   = document.getElementById('observerReport').value.trim();
  const score    = parseInt(document.getElementById('observerScore').value) || 0;
  if (!report) { toastErr('گزارش بازدید وارد نشده است'); return; }
  const school = schools.find(s => String(s.id) === String(schoolId));
  try {
    if (school) {
      await sbSchools.update(school.id, { score });
      school.score = score;
    }
    const result  = await sbObserver.add({
      school_id:   schoolId,
      school_name: school ? school.name : 'نامشخص',
      report, score,
      date: new Date().toLocaleDateString('fa-IR')
    });
    const created = Array.isArray(result) ? result[0] : result;
    observerReports.push(created);
    toastOk('گزارش بازدید ثبت شد');
    renderObserverReports();
    renderSchools();
    document.getElementById('observerReport').value = '';
    document.getElementById('observerScore').value  = '';
  } catch(e) {
    toastErr('خطا در ثبت گزارش: ' + e.message);
  }
}

function renderObserverReports() {
  const div = document.getElementById('observerList'); if (!div) return;
  div.innerHTML = '';
  if (!observerReports.length) {
    div.innerHTML = '<div class="empty-state"><div class="empty-ico">🔍</div><div class="empty-text">هنوز ارزیابی‌ای ثبت نشده است.</div></div>';
    return;
  }
  observerReports.forEach(r => {
    const sName = r.school_name || 'نامشخص';
    div.innerHTML += `<div class="info-card">
      <h4>🏫 ${escapeHtml(sName)}</h4>
      <p>${escapeHtml(r.report)}</p>
      <p>⭐ امتیاز: <strong style="color:var(--gold);font-size:18px;">${escapeHtml(String(r.score||0))}</strong> از ۱۰۰</p>
      <p style="color:#aaa;font-size:12px;">📅 ${escapeHtml(r.date||'')}</p>
    </div>`;
  });
}
