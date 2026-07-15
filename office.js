// سامانه پروژه مهر — ناحیه ۴ شیراز
// office.js — وظایف اداره پیش از اول مهر (ستاد ناحیه‌ای)  v6.4

/**
 * ۸ کارگروه تخصصی ملی ۱۴۰۶-۱۴۰۵ (متناظر با دستورالعمل وزارتی)
 * رئیس ستاد منطقه‌ای = مدیر آموزش و پرورش ناحیه
 * دبیرخانه = ارزیابی عملکرد
 */
const OFFICIAL_WORKGROUPS = [
  {
    id: 1,
    title: 'تأمین، تعمیر و تجهیز فضاهای آموزشی',
    head: 'معاون برنامه‌ریزی و توسعه منابع',
    duties: 'ایمن‌سازی فضا، پدافند غیرعامل، پایداری آموزش مجازی، برق اضطراری، بهسازی کلاس و سرویس'
  },
  {
    id: 2,
    title: 'ساماندهی منابع انسانی',
    head: 'معاون توسعه منابع / کارشناسی نیروی انسانی',
    duties: 'کلاس‌بندی، ابلاغ معلمان، نقل و انتقال، سازماندهی نیروهای جدید و بازنشسته'
  },
  {
    id: 3,
    title: 'توسعه کمی و کیفی کودکستان‌ها',
    head: 'مسئول تعلیم و تربیت کودک',
    duties: 'جذب نوآموز، ثبت‌نام سیدا، نظارت شهریه و کیفیت کودکستان‌ها'
  },
  {
    id: 4,
    title: 'کیفیت‌بخشی آموزشی ابتدایی',
    head: 'معاون آموزش ابتدایی',
    duties: 'ثبت‌نام ابتدایی، کلاس چندپایه، بازماندگان از تحصیل، توزیع کتب، سنجش سلامت نوآموز'
  },
  {
    id: 5,
    title: 'کیفیت‌بخشی آموزشی متوسطه',
    head: 'معاون آموزش متوسطه',
    duties: 'هدایت تحصیلی، ثبت‌نام متوسطه، پژوهش‌سرا، توازن رشته‌ها'
  },
  {
    id: 6,
    title: 'کیفیت‌بخشی تربیتی و تندرستی',
    head: 'معاون پرورشی و فرهنگی',
    duties: 'طرح نماد، نماز جماعت، اتاق بهداشت و مشاوره، غربالگری سلامت، آمادگی بحران'
  },
  {
    id: 7,
    title: 'اطلاع‌رسانی و رسانه',
    head: 'روابط عمومی',
    duties: 'پوشش خبری، فضاسازی رسانه‌ای، تجلیل خیرین، اطلاع‌رسانی ثبت‌نام و بازگشایی'
  },
  {
    id: 8,
    title: 'ترویج فرهنگ ایثار، شهادت و مقاومت',
    head: 'مسئول ایثار و مقاومت / پرورشی',
    duties: 'زنگ ایثار، روایت‌گری مقاومت، فضاسازی ایثار، هماهنگی با بنیاد شهید و بسیج'
  }
];

/**
 * چک‌لیست اداره قبل از اول مهر — آنچه «اداره» باید انجام دهد
 * (جدا از چک‌لیست مدرسه)
 */
const OFFICE_CHECKLIST = [
  // فاز ۱ — سازماندهی
  { id: 'o01', phase: 1, phaseTitle: 'فاز ۱ — سازماندهی (تیر و مرداد)', title: 'تشکیل ستاد پروژه مهر ناحیه با ریاست مدیر آموزش و پرورش' },
  { id: 'o02', phase: 1, phaseTitle: 'فاز ۱ — سازماندهی (تیر و مرداد)', title: 'فعال‌سازی دبیرخانه ستاد در ارزیابی عملکرد' },
  { id: 'o03', phase: 1, phaseTitle: 'فاز ۱ — سازماندهی (تیر و مرداد)', title: 'صدور ابلاغ رسمی برای ۸ کارگروه تخصصی ناحیه' },
  { id: 'o04', phase: 1, phaseTitle: 'فاز ۱ — سازماندهی (تیر و مرداد)', title: 'برگزاری جلسه توجیهی مدیران مدارس (حضوری/مجازی)' },
  { id: 'o05', phase: 1, phaseTitle: 'فاز ۱ — سازماندهی (تیر و مرداد)', title: 'ابلاغ تقویم اجرایی و مهلت‌های مستندسازی به مدارس' },
  { id: 'o06', phase: 1, phaseTitle: 'فاز ۱ — سازماندهی (تیر و مرداد)', title: 'تعیین ناظران منطقه و تقسیم مدارس بین ناظران' },
  // فاز ۲ — اجرا و پایش
  { id: 'o07', phase: 2, phaseTitle: 'فاز ۲ — اجرا و پایش (مرداد و شهریور)', title: 'پایش ثبت‌نام دانش‌آموزان و عدالت آموزشی' },
  { id: 'o08', phase: 2, phaseTitle: 'فاز ۲ — اجرا و پایش (مرداد و شهریور)', title: 'پایش ساماندهی نیروی انسانی و ابلاغ‌ها' },
  { id: 'o09', phase: 2, phaseTitle: 'فاز ۲ — اجرا و پایش (مرداد و شهریور)', title: 'پایش تعمیر، تجهیز و ایمن‌سازی مدارس' },
  { id: 'o10', phase: 2, phaseTitle: 'فاز ۲ — اجرا و پایش (مرداد و شهریور)', title: 'پایش سفارش و توزیع کتب درسی' },
  { id: 'o11', phase: 2, phaseTitle: 'فاز ۲ — اجرا و پایش (مرداد و شهریور)', title: 'پیگیری جذب بازماندگان از تحصیل و سنجش نوآموزان' },
  { id: 'o12', phase: 2, phaseTitle: 'فاز ۲ — اجرا و پایش (مرداد و شهریور)', title: 'هماهنگی کارگروه ایثار و مقاومت برای زنگ ایثار' },
  { id: 'o13', phase: 2, phaseTitle: 'فاز ۲ — اجرا و پایش (مرداد و شهریور)', title: 'هماهنگی کارگروه تربیتی و تندرستی (سلامت، نماز، نماد)' },
  // فاز ۳ — ارزیابی
  { id: 'o14', phase: 3, phaseTitle: 'فاز ۳ — ارزیابی و رفع نقص (شهریور)', title: 'دریافت و بررسی مستندات مدارس در کارتابل ناظر' },
  { id: 'o15', phase: 3, phaseTitle: 'فاز ۳ — ارزیابی و رفع نقص (شهریور)', title: 'بازدید میدانی ناظران و ثبت امتیاز مدارس' },
  { id: 'o16', phase: 3, phaseTitle: 'فاز ۳ — ارزیابی و رفع نقص (شهریور)', title: 'پیگیری رفع نواقص اعلام‌شده تا قبل از اول مهر' },
  { id: 'o17', phase: 3, phaseTitle: 'فاز ۳ — ارزیابی و رفع نقص (شهریور)', title: 'تأیید آمادگی مدارس برای بازگشایی' },
  // فاز ۴ — بازگشایی
  { id: 'o18', phase: 4, phaseTitle: 'فاز ۴ — اول مهر و جمع‌بندی', title: 'نظارت بر اجرای زنگ ایثار / مراسم بازگشایی' },
  { id: 'o19', phase: 4, phaseTitle: 'فاز ۴ — اول مهر و جمع‌بندی', title: 'جمع‌بندی گزارش نهایی ناحیه و ارسال به اداره کل' },
  { id: 'o20', phase: 4, phaseTitle: 'فاز ۴ — اول مهر و جمع‌بندی', title: 'آرشیو مستندات و صورتجلسات ستاد ناحیه' }
];

const OFFICE_STORAGE_KEY = 'mehr_office_checklist_v64';

let officeDone = {};

function loadOfficeChecklist() {
  try {
    officeDone = JSON.parse(localStorage.getItem(OFFICE_STORAGE_KEY) || '{}') || {};
  } catch (e) {
    officeDone = {};
  }
}

function saveOfficeChecklist() {
  localStorage.setItem(OFFICE_STORAGE_KEY, JSON.stringify(officeDone));
}

async function toggleOfficeItem(id) {
  officeDone[id] = !officeDone[id];
  saveOfficeChecklist();
  renderOfficeSection();
  updateOfficeProgress();
  try {
    if (typeof addLog === 'function') {
      const item = OFFICE_CHECKLIST.find(x => x.id === id);
      await addLog('edit', 'چک‌لیست اداره', `${item ? item.title : id}: ${officeDone[id] ? 'انجام' : 'بازگشت'}`);
    }
  } catch (e) {}
}

function officeStats() {
  const total = OFFICE_CHECKLIST.length;
  const done = OFFICE_CHECKLIST.filter(i => officeDone[i.id]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const byPhase = {};
  OFFICE_CHECKLIST.forEach(i => {
    if (!byPhase[i.phase]) byPhase[i.phase] = { total: 0, done: 0, title: i.phaseTitle };
    byPhase[i.phase].total++;
    if (officeDone[i.id]) byPhase[i.phase].done++;
  });
  return { total, done, pct, byPhase };
}

function updateOfficeProgress() {
  const s = officeStats();
  const el = id => document.getElementById(id);
  if (el('officeDoneCount')) el('officeDoneCount').textContent = s.done;
  if (el('officeTotalCount')) el('officeTotalCount').textContent = s.total;
  if (el('officePercent')) el('officePercent').textContent = s.pct + '%';
  if (el('officeBar')) el('officeBar').style.width = s.pct + '%';
  if (el('dashOfficePct')) el('dashOfficePct').textContent = s.pct + '%';
}

function renderOfficialWorkgroups() {
  const box = document.getElementById('officialWorkgroups');
  if (!box) return;
  box.innerHTML = OFFICIAL_WORKGROUPS.map(g => `
    <div class="info-card" style="margin-bottom:8px;">
      <h4>${g.id}. ${escapeHtml(g.title)}</h4>
      <p style="font-size:12px;color:#666;margin-top:4px;"><b>مسئول پیشنهادی:</b> ${escapeHtml(g.head)}</p>
      <p style="font-size:12px;color:#555;margin-top:4px;">${escapeHtml(g.duties)}</p>
    </div>
  `).join('');
}

function renderOfficeSection() {
  loadOfficeChecklist();
  renderOfficialWorkgroups();
  updateOfficeProgress();

  const box = document.getElementById('officeChecklistBox');
  if (!box) return;

  let html = '';
  let lastPhase = null;
  OFFICE_CHECKLIST.forEach(item => {
    if (item.phase !== lastPhase) {
      if (lastPhase !== null) html += '</tbody></table>';
      const st = officeStats().byPhase[item.phase];
      html += `<h4 class="phase-title">${escapeHtml(item.phaseTitle)}
        <small style="font-weight:normal;color:#666;"> — ${st.done}/${st.total}</small></h4>
        <table><thead><tr><th style="width:48px;">انجام</th><th>اقدام اداره</th></tr></thead><tbody>`;
      lastPhase = item.phase;
    }
    html += `<tr style="${officeDone[item.id] ? 'background:#E8F5E9;' : ''}">
      <td style="text-align:center;"><input type="checkbox" ${officeDone[item.id] ? 'checked' : ''} data-action="toggleOfficeItem" data-id="${item.id}"></td>
      <td>${escapeHtml(item.title)}</td>
    </tr>`;
  });
  if (lastPhase !== null) html += '</tbody></table>';
  box.innerHTML = html;
}

function syncGroupSelectToOfficial() {
  const sel = document.getElementById('groupSelect');
  if (!sel) return;
  sel.innerHTML = OFFICIAL_WORKGROUPS.map(g =>
    `<option value="${escapeHtml(g.title)}">${g.id}. ${escapeHtml(g.title)}</option>`
  ).join('');
}
