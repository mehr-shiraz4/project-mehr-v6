// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// activities.js — فعالیت‌های ۸۴گانه + متادیتای پرورشی/زمان‌بندی  v6.2.0

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

/**
 * متادیتای هر فعالیت (index = id-1)
 * domain:  پرورشی | آموزشی | اجرایی | مشترک
 * phase:   مهر | آماده‌سازی | سالانه
 * level:   مشترک | ابتدایی | متوسطه
 * tip:     توضیح کوتاه (اختیاری)
 */
const activityMeta = {
  1:  { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  2:  { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  3:  { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  4:  { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  5:  { domain:'آموزشی', phase:'مهر', level:'مشترک' },
  6:  { domain:'آموزشی', phase:'مهر', level:'مشترک' },
  7:  { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  8:  { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  9:  { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  10: { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  11: { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  12: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  13: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  14: { domain:'آموزشی', phase:'مهر', level:'مشترک' },
  15: { domain:'آموزشی', phase:'مهر', level:'مشترک' },
  16: { domain:'آموزشی', phase:'مهر', level:'متوسطه' },
  17: { domain:'پرورشی', phase:'مهر', level:'مشترک', tip:'در فاز مهر عمدتاً برنامه‌ریزی و هماهنگی سنجش' },
  18: { domain:'پرورشی', phase:'آماده‌سازی', level:'مشترک' },
  19: { domain:'اجرایی', phase:'آماده‌سازی', level:'مشترک' },
  20: { domain:'پرورشی', phase:'آماده‌سازی', level:'مشترک' },
  21: { domain:'پرورشی', phase:'آماده‌سازی', level:'مشترک' },
  22: { domain:'اجرایی', phase:'آماده‌سازی', level:'مشترک' },
  23: { domain:'اجرایی', phase:'آماده‌سازی', level:'مشترک' },
  24: { domain:'آموزشی', phase:'آماده‌سازی', level:'مشترک' },
  25: { domain:'آموزشی', phase:'آماده‌سازی', level:'مشترک' },
  26: { domain:'آموزشی', phase:'آماده‌سازی', level:'مشترک' },
  27: { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  28: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  29: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  30: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  31: { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  32: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  33: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  34: { domain:'آموزشی', phase:'سالانه', level:'مشترک' },
  35: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  36: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  37: { domain:'آموزشی', phase:'سالانه', level:'مشترک' },
  38: { domain:'آموزشی', phase:'سالانه', level:'مشترک' },
  39: { domain:'آموزشی', phase:'سالانه', level:'مشترک' },
  40: { domain:'آموزشی', phase:'سالانه', level:'مشترک' },
  41: { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  42: { domain:'آموزشی', phase:'مهر', level:'مشترک' },
  43: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  44: { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  45: { domain:'پرورشی', phase:'مهر', level:'ابتدایی' },
  46: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  47: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  48: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  49: { domain:'آموزشی', phase:'سالانه', level:'مشترک' },
  50: { domain:'آموزشی', phase:'مهر', level:'مشترک' },
  51: { domain:'اجرایی', phase:'سالانه', level:'مشترک', tip:'خودارزیابی مدرسه بر اساس شاخص‌های داخلی کیفیت' },
  52: { domain:'اجرایی', phase:'سالانه', level:'مشترک', tip:'بازدید/ارزیابی توسط ناظر یا کارشناس منطقه/ناحیه' },
  53: { domain:'آموزشی', phase:'سالانه', level:'مشترک' },
  54: { domain:'اجرایی', phase:'آماده‌سازی', level:'مشترک' },
  55: { domain:'اجرایی', phase:'آماده‌سازی', level:'مشترک' },
  56: { domain:'آموزشی', phase:'آماده‌سازی', level:'مشترک' },
  57: { domain:'پرورشی', phase:'آماده‌سازی', level:'مشترک' },
  58: { domain:'آموزشی', phase:'آماده‌سازی', level:'مشترک' },
  59: { domain:'آموزشی', phase:'آماده‌سازی', level:'مشترک' },
  60: { domain:'آموزشی', phase:'آماده‌سازی', level:'متوسطه' },
  61: { domain:'آموزشی', phase:'مهر', level:'مشترک' },
  62: { domain:'آموزشی', phase:'مهر', level:'مشترک' },
  63: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  64: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  65: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  66: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  67: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  68: { domain:'پرورشی', phase:'سالانه', level:'مشترک' },
  69: { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  70: { domain:'اجرایی', phase:'سالانه', level:'مشترک' },
  71: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  72: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  73: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  74: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  75: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  76: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  77: { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  78: { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  79: { domain:'پرورشی', phase:'مهر', level:'مشترک' },
  80: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  81: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  82: { domain:'اجرایی', phase:'مهر', level:'مشترک' },
  83: { domain:'اجرایی', phase:'سالانه', level:'مشترک' },
  84: { domain:'اجرایی', phase:'مهر', level:'مشترک' }
};

let activities = [];
/* پیش‌فرض: فقط فاز اول مهر + آماده‌سازی (پروژه مهر مخصوص بازگشایی است، نه برنامه سالانه) */
let activityFilter = { domain: 'all', phase: 'اول‌مهر', level: 'all', q: '' };

function getMeta(id) {
  return activityMeta[id] || { domain:'مشترک', phase:'سالانه', level:'مشترک' };
}

function domainBadge(domain) {
  const map = {
    'پرورشی': 'badge-parvareshi',
    'آموزشی': 'badge-amoozeshi',
    'اجرایی': 'badge-ejraee',
    'مشترک': 'badge-moshtarak'
  };
  return map[domain] || 'badge-moshtarak';
}

function phaseBadge(phase) {
  const map = {
    'مهر': 'badge-mehr',
    'آماده‌سازی': 'badge-prep',
    'سالانه': 'badge-yearly'
  };
  return map[phase] || 'badge-yearly';
}

/* ===== بارگذاری از Supabase ===== */
async function loadActivities() {
  try {
    const rows = await sbActivities.getAll();
    if (rows.length > 0) {
      activities = rows;
    } else {
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
  a.done = newDone;
  renderActivities();
  updateProgress();
  updateDashboard();
  try {
    await sbActivities.setDone(numId, newDone);
    await addLog('edit', 'وضعیت فعالیت', `فعالیت ${a.id}: "${a.title}" — ${newDone ? 'انجام شده ✅' : 'بازگشت به انجام‌نشده'}`);
  } catch(e) {
    a.done = !newDone;
    renderActivities();
    updateProgress();
    updateDashboard();
    toastErr('خطا در ذخیره وضعیت: ' + e.message);
  }
}

function setActivityFilter(key, value) {
  activityFilter[key] = value;
  renderActivities();
  updateFilterCounts();
}

function filteredActivities() {
  const q = (activityFilter.q || '').trim();
  return activities.filter(a => {
    const m = getMeta(a.id);
    if (activityFilter.domain !== 'all' && m.domain !== activityFilter.domain) return false;
    if (activityFilter.phase === 'اول‌مهر') {
      if (m.phase !== 'مهر' && m.phase !== 'آماده‌سازی') return false;
    } else if (activityFilter.phase !== 'all' && m.phase !== activityFilter.phase) {
      return false;
    }
    // مقطع: ابتدایی / متوسطه اول / متوسطه دوم + مشترک
    if (activityFilter.level !== 'all') {
      const lv = activityFilter.level;
      if (lv === 'ابتدایی') {
        if (m.level !== 'مشترک' && m.level !== 'ابتدایی') return false;
      } else if (lv === 'متوسطه اول' || lv === 'متوسطه دوم' || lv === 'متوسطه') {
        if (m.level !== 'مشترک' && m.level !== 'متوسطه') return false;
      } else if (m.level !== activityFilter.level) {
        return false;
      }
    }
    if (q && !(String(a.id).includes(q) || (a.title || '').includes(q))) return false;
    return true;
  });
}

function updateFilterCounts() {
  const el = document.getElementById('filterResultCount');
  if (!el) return;
  const list = filteredActivities();
  const done = list.filter(a => a.done).length;
  el.textContent = `${list.length} مورد نمایش · ${done} انجام‌شده`;
}

function renderActivities() {
  const c = document.getElementById('activitiesContainer'); if (!c) return;
  const list = filteredActivities();
  if (!list.length) {
    c.innerHTML = '<div class="empty-state"><div class="empty-ico">🔍</div><div class="empty-text">با فیلتر فعلی موردی یافت نشد.</div></div>';
    updateFilterCounts();
    return;
  }
  let html = '<table><thead><tr><th>ردیف</th><th>عنوان فعالیت</th><th>حوزه</th><th>زمان</th><th>مقطع</th><th style="text-align:center;">وضعیت</th></tr></thead><tbody>';
  list.forEach(a => {
    const m = getMeta(a.id);
    const tip = m.tip ? `<div class="act-tip">${escapeHtml(m.tip)}</div>` : '';
    html += `<tr style="${a.done ? 'background:#E3F2FD;' : ''}">
      <td>${a.id}</td>
      <td>${escapeHtml(a.title)}${tip}</td>
      <td><span class="tag ${domainBadge(m.domain)}">${escapeHtml(m.domain)}</span></td>
      <td><span class="tag ${phaseBadge(m.phase)}">${escapeHtml(m.phase)}</span></td>
      <td><span class="tag badge-level">${escapeHtml(m.level)}</span></td>
      <td style="text-align:center;"><input type="checkbox" ${a.done ? 'checked' : ''} data-action="toggleActivity" data-id="${a.id}"></td>
    </tr>`;
  });
  html += '</tbody></table>';
  c.innerHTML = html;
  updateFilterCounts();
}

function exportParvareshiList() {
  const rows = activities
    .filter(a => getMeta(a.id).domain === 'پرورشی')
    .map(a => {
      const m = getMeta(a.id);
      return `${a.id}. ${a.title} | زمان: ${m.phase} | مقطع: ${m.level}${m.tip ? ' | ' + m.tip : ''}`;
    });
  const mehrRows = activities
    .filter(a => {
      const m = getMeta(a.id);
      return m.domain === 'پرورشی' && (m.phase === 'مهر' || m.phase === 'آماده‌سازی');
    })
    .map(a => {
      const m = getMeta(a.id);
      return `${a.id}. ${a.title} | زمان: ${m.phase} | مقطع: ${m.level}${m.tip ? ' | ' + m.tip : ''}`;
    });
  const text = [
    'فهرست فعالیت‌های پرورشی — پروژه مهر (اول مهر) — ناحیه ۴ شیراز',
    'توجه: پروژه مهر مخصوص آماده‌سازی و بازگشایی اول مهر است؛ موارد سالانه (هفته کتاب، دهه فجر و…) خارج از اولویت این پروژه هستند.',
    '────────────────────────────────────',
    '—— موارد اولویت پروژه مهر (پرورشی) ——',
    ...mehrRows,
    '',
    '—— سایر موارد پرورشی سالانه (خارج از اولویت فعلی) ——',
    ...rows.filter(r => !mehrRows.some(m => m.startsWith(r.split('.')[0] + '.'))),
    '',
    'اولویت مستندسازی الآن: موارد «مهر» و «آماده‌سازی».'
  ].join('\n');

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fehrest-parvareshi-mehr.txt';
  a.click();
  URL.revokeObjectURL(url);
  toastOk('فهرست پرورشی دانلود شد');
}

function updateProgress() {
  const done = activities.filter(a => a.done).length;
  const pct  = activities.length ? Math.round((done / 84) * 100) : 0;
  const s = id => document.getElementById(id);
  if (s('doneActivities'))  s('doneActivities').innerText  = done;
  if (s('progressPercent')) s('progressPercent').innerText = pct + '%';
  if (s('projectScore'))    s('projectScore').innerText    = pct;
  if (s('actBar'))          s('actBar').style.width        = pct + '%';

  const parv = activities.filter(a => getMeta(a.id).domain === 'پرورشی');
  const parvDone = parv.filter(a => a.done).length;
  if (s('parvCount')) s('parvCount').innerText = parv.length;
  if (s('parvDone'))  s('parvDone').innerText  = parvDone;

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
  if (typeof updateOfficeProgress === 'function') updateOfficeProgress();

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
