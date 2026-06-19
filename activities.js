// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// activities.js — فعالیت‌های ۸۴گانه  v5.9.0

const projectActivities = [
  "تشکیل ستاد پروژه مهر","تشکیل کارگروه ساماندهی نیروی انسانی","تشکیل کارگروه ثبت‌نام",
  "تشکیل کارگروه تعمیر و تجهیز","تشکیل کارگروه کیفیت‌بخشی آموزشی","تشکیل کارگروه فناوری و آموزش مجازی",
  "تشکیل کارگروه سلامت و بهداشت","تشکیل کارگروه مشارکت مردمی","تشکیل کارگروه اطلاع‌رسانی و رسانه",
  "تشکیل کارگروه فرهنگی و تربیتی","تشکیل کارگروه ایثار و مقاومت","بررسی وضعیت کلاس‌ها",
  "بررسی وضعیت نیروی انسانی","ثبت سفارش کتب درسی","توزیع کتب درسی",
  "هدایت تحصیلی پایه نهم","سنجش سلامت دانش‌آموزان","تجهیز نمازخانه",
  "بهسازی فضای آموزشی","تأمین وسایل بهداشتی","تعمیر سرویس‌های بهداشتی",
  "نصب سیستم گرمایش","نصب سیستم سرمایش","تأمین تجهیزات فناوری",
  "راه‌اندازی اینترنت مدرسه","آموزش مجازی معلمان","برگزاری جلسه اولیای دانش‌آموزان",
  "ثبت‌نام دانش‌آموزان جدیدالورود","ثبت‌نام دانش‌آموزان استثنایی","ثبت‌نام دانش‌آموزان بازمانده از تحصیل",
  "شناسایی دانش‌آموزان نیازمند حمایت","برگزاری اردوهای فرهنگی","اجرای برنامه‌های تربیتی",
  "برگزاری مسابقات علمی","برگزاری مسابقات فرهنگی","برگزاری مسابقات ورزشی",
  "برگزاری نمایشگاه دانش‌آموزی","اجرای طرح مطالعه آزاد","اجرای طرح درس‌پژوهی",
  "اجرای طرح یاددهی-یادگیری","تشکیل شورای دانش‌آموزی","انتخاب شورای معلمان",
  "برگزاری شورای مدرسه","تشکیل انجمن اولیا و مربیان","برگزاری جشن شکوفه‌ها",
  "اجرای برنامه پیشگیری از آسیب‌های اجتماعی","اجرای برنامه سلامت روان","آموزش مهارت‌های زندگی",
  "برگزاری کلاس‌های فوق‌برنامه","تشکیل گروه‌های کار تیمی معلمان","ارزیابی درونی مدرسه",
  "ارزیابی بیرونی مدرسه","تدوین برنامه بهبود کیفیت","اجرای برنامه مدرسه‌زیبا",
  "نقاشی دیوارهای مدرسه","فضاسازی بصری آموزشی","ایجاد گوشه‌های خواندنی",
  "راه‌اندازی کتابخانه","راه‌اندازی آزمایشگاه","تجهیز کارگاه‌های آموزشی",
  "برنامه‌ریزی درسی کارگروه‌ها","تنظیم تقویم آموزشی","برگزاری مراسم هفته دفاع مقدس",
  "برگزاری مراسم دهه فجر","برگزاری مراسم هفته معلم","برگزاری مراسم هفته کتاب",
  "برگزاری جشن‌های ملی","اجرای طرح اوقات فراغت","اجرای طرح تابستانه",
  "جذب خیرین مدرسه‌ساز","مشارکت انجمن اولیا در بهسازی","ارائه گزارش به آموزش و پرورش منطقه",
  "ارائه گزارش به شورای مدرسه","ثبت مستندات پروژه مهر","بارگذاری تصاویر فعالیت‌ها",
  "تنظیم صورتجلسات کارگروه‌ها","ارزیابی میانی پروژه مهر","برگزاری زنگ ایثار",
  "برگزاری مراسم بازگشایی مدارس","توزیع بسته‌های تربیتی","پایش و رصد پیشرفت پروژه",
  "ارسال گزارش نهایی پروژه مهر","تجلیل از همکاران و کارگروه‌های برتر",
  "آرشیو نهایی مستندات و گزارش پروژه مهر"
];

/* ===== حافظه محلی ===== */
let activities = [];

/* ===== بارگذاری از Supabase ===== */
async function loadActivities() {
  try {
    const rows = await sbActivities.getAll();
    if (rows.length > 0) {
      activities = rows;
    } else {
      // اگر Supabase خالی بود، فعالیت‌های پیش‌فرض را insert کن
      const defaults = [];
      for (let i = 1; i <= 84; i++) {
        defaults.push({ id: i, title: projectActivities[i-1] || ('فعالیت ' + i), done: false });
      }
      await sbActivities.upsertAll(defaults);
      activities = defaults;
    }
  } catch(e) {
    console.error('loadActivities:', e);
    toastErr('خطا در بارگذاری فعالیت‌ها: ' + e.message);
    // fallback: ساختار پیش‌فرض
    activities = [];
    for (let i = 1; i <= 84; i++) {
      activities.push({ id: i, title: projectActivities[i-1] || ('فعالیت ' + i), done: false });
    }
  }
}

/* ===== toggle ===== */
async function toggleActivity(id) {
  const numId = parseInt(id);
  const a = activities.find(x => x.id === numId);
  if (!a) return;
  const newDone = !a.done;
  // به‌روزرسانی local cache بلافاصله (optimistic UI)
  a.done = newDone;
  renderActivities();
  updateProgress();
  updateDashboard();
  // ذخیره در Supabase
  try {
    await sbActivities.setDone(numId, newDone);
    await addLog('edit', 'وضعیت فعالیت', `فعالیت ${a.id}: "${a.title}" — ${newDone ? 'انجام شده ✅' : 'بازگشت به انجام‌نشده'}`);
  } catch(e) {
    // rollback
    a.done = !newDone;
    renderActivities();
    updateProgress();
    updateDashboard();
    toastErr('خطا در ذخیره وضعیت: ' + e.message);
  }
}

function renderActivities() {
  const c = document.getElementById('activitiesContainer'); if (!c) return;
  let html = '<table><thead><tr><th>ردیف</th><th>عنوان فعالیت</th><th style="text-align:center;">وضعیت</th></tr></thead><tbody>';
  activities.forEach(a => {
    html += `<tr style="${a.done ? 'background:#E3F2FD;' : ''}">
      <td>${a.id}</td><td>${escapeHtml(a.title)}</td>
      <td style="text-align:center;"><input type="checkbox" ${a.done ? 'checked' : ''} data-action="toggleActivity" data-id="${a.id}"></td>
    </tr>`;
  });
  html += '</tbody></table>';
  c.innerHTML = html;
}

function updateProgress() {
  const done = activities.filter(a => a.done).length;
  const pct  = activities.length ? Math.round((done / 84) * 100) : 0;
  const s = id => document.getElementById(id);
  if (s('doneActivities'))  s('doneActivities').innerText  = done;
  if (s('progressPercent')) s('progressPercent').innerText = pct + '%';
  if (s('projectScore'))    s('projectScore').innerText    = pct;
  if (s('actBar'))          s('actBar').style.width        = pct + '%';
  ['activitySchoolStatus'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    if (pct < 40) { el.innerText = 'نیازمند پیگیری';    el.className = 'badge badge-danger'; }
    else if (pct < 80) { el.innerText = 'در حال آماده‌سازی'; el.className = 'badge badge-warning'; }
    else               { el.innerText = 'آماده بازگشایی';    el.className = 'badge badge-success'; }
  });
}

function updateDashboard() {
  const done = activities.filter(a => a.done).length;
  const pct  = activities.length ? Math.round((done / 84) * 100) : 0;
  const s = id => document.getElementById(id);
  if (s('dashDone'))    s('dashDone').innerText    = done;
  if (s('dashPercent')) s('dashPercent').innerText = pct + '%';
  if (s('dashScore'))   s('dashScore').innerText   = pct;
  if (s('dashBar'))     s('dashBar').style.width   = pct + '%';
  if (s('dashSchools')) s('dashSchools').innerText = schools.length;
  if (s('dashReports')) s('dashReports').innerText = (typeof reports !== 'undefined' ? reports.length : 0);

  const el = s('schoolStatus');
  if (el) {
    if (pct < 40) { el.innerText = 'نیازمند پیگیری';    el.className = 'badge badge-danger'; }
    else if (pct < 80) { el.innerText = 'در حال آماده‌سازی'; el.className = 'badge badge-warning'; }
    else               { el.innerText = 'آماده بازگشایی';    el.className = 'badge badge-success'; }
  }

  const actBox = s('dashActions');
  if (actBox) {
    const remaining   = 84 - done;
    const reportCount = (typeof reports !== 'undefined') ? reports.length : 0;
    let actions = [];
    if (remaining > 0)
      actions.push({ ico:'✅', text: remaining + ' فعالیت باقی‌مانده دارید', btn:'مشاهده چک‌لیست', fn:"showSection('activitiesSection')", color:'var(--primary)' });
    if (reportCount === 0)
      actions.push({ ico:'📤', text:'هنوز گزارشی ارسال نشده است', btn:'ارسال اولین گزارش', fn:"showSection('reportSection')", color:'var(--warning)' });
    if (meetings.length === 0)
      actions.push({ ico:'📝', text:'صورتجلسه‌ای ثبت نشده', btn:'ثبت صورتجلسه', fn:"showSection('meetingsSection')", color:'#6a1b9a' });
    if (actions.length === 0)
      actions.push({ ico:'🎉', text:'عالی! همه اقدامات اولیه انجام شده', btn:'مشاهده نمودار', fn:"showSection('chartSection')", color:'var(--success)' });
    actBox.innerHTML = actions.map(a => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--off-white);border-radius:10px;margin-bottom:8px;border-right:4px solid ${a.color};">
        <span style="font-size:22px;">${a.ico}</span>
        <span style="flex:1;font-size:13px;color:var(--dark-mid);">${a.text}</span>
        <button data-action-fn="${a.fn}" style="background:${a.color};color:white;border:none;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer;font-family:inherit;white-space:nowrap;">${a.btn}</button>
      </div>`).join('');
  }
}
