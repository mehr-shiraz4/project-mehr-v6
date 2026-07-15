// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// forms.js — نمون‌برگ‌ها و نمودار  v5.9.0

/* ===== FORMS ===== */

async function saveForm(num) {
  let data = {};
  if (num === 1) {
    data = {
      registered: document.getElementById('f1_registered').value,
      remaining:  document.getElementById('f1_remaining').value,
      notes:      document.getElementById('f1_notes').value
    };
  } else if (num === 2) {
    data = {
      teachers: document.getElementById('f2_teachers').value,
      shortage: document.getElementById('f2_shortage').value,
      notes:    document.getElementById('f2_notes').value
    };
  } else if (num === 3) {
    data = {
      classes: document.getElementById('f3_classes').value,
      ready:   document.getElementById('f3_ready').value,
      needs:   document.getElementById('f3_needs').value
    };
  } else if (num === 4) {
    data = {
      score:   document.getElementById('f4_score').value,
      comment: document.getElementById('f4_comment').value
    };
  } else if (num === 5) {
    data = { report: document.getElementById('f5_report').value };
  }

  try {
    await sbForms.save(num, data);
    const msg = document.getElementById('formsSavedMsg');
    if (msg) { msg.style.display = 'block'; setTimeout(() => { msg.style.display = 'none'; }, 3000); }
  } catch(e) {
    toastErr('خطا در ذخیره نمون‌برگ: ' + e.message);
  }
}

async function loadForms() {
  try {
    const rows = await sbForms.getAll();
    // rows: [{ form_num: 1, data: {...} }, ...]
    const formData = {};
    rows.forEach(r => { formData[r.form_num] = r.data; });

    if (formData[1]) {
      document.getElementById('f1_registered').value = formData[1].registered || '';
      document.getElementById('f1_remaining').value  = formData[1].remaining  || '';
      document.getElementById('f1_notes').value      = formData[1].notes      || '';
    }
    if (formData[2]) {
      document.getElementById('f2_teachers').value = formData[2].teachers || '';
      document.getElementById('f2_shortage').value = formData[2].shortage || '';
      document.getElementById('f2_notes').value    = formData[2].notes    || '';
    }
    if (formData[3]) {
      document.getElementById('f3_classes').value = formData[3].classes || '';
      document.getElementById('f3_ready').value   = formData[3].ready   || '';
      document.getElementById('f3_needs').value   = formData[3].needs   || '';
    }
    if (formData[4]) {
      document.getElementById('f4_score').value   = formData[4].score   || '';
      document.getElementById('f4_comment').value = formData[4].comment || '';
    }
    if (formData[5]) {
      document.getElementById('f5_report').value = formData[5].report || '';
    }
  } catch(e) {
    console.error('loadForms:', e);
    // در صورت خطا، فیلدها خالی می‌مانند — مشکل بلوکه‌کننده نیست
  }
}

/* ===== CHARTS ===== */
let progressChartInst = null, groupChartInst = null;

function renderCharts() {
  const done = activities.filter(a => a.done).length;
  const ctx1 = document.getElementById('progressChart');
  if (ctx1) {
    if (progressChartInst) progressChartInst.destroy();
    progressChartInst = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['انجام شده', 'باقی‌مانده'],
        datasets: [{ data: [done, 84-done], backgroundColor: ['#1565C0','#BBDEFB'], borderColor: ['#0D47A1','#90CAF9'], borderWidth: 2 }]
      },
      options: { plugins: { legend: { position:'bottom' }, title: { display:true, text:`پیشرفت: ${Math.round((done/84)*100)}%`, color:'#1A3A6B', font:{ size:15 } } } }
    });
  }
  const ctx2 = document.getElementById('groupChart');
  if (ctx2) {
    if (groupChartInst) groupChartInst.destroy();
    const counts = groupNames.map(g => members.filter(m => (m.group || m.group_name) === g).length);
    groupChartInst = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: groupNames.map(g => g.length > 12 ? g.substring(0,12)+'…' : g),
        datasets: [{ label:'تعداد اعضا', data:counts, backgroundColor:'#1E88E5', borderColor:'#1565C0', borderWidth:1, borderRadius:6 }]
      },
      options: { responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1 } } } }
    });
  }
}
