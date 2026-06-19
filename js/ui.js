// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// ui.js — Toast notifications & Confirm modal

/* ===== TOAST ===== */
(function() {
  var container = document.createElement('div');
  container.id = 'toastContainer';
  document.body.appendChild(container);
})();

var TOAST_ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

function showToast(msg, type, duration) {
  type = type || 'info';
  duration = duration || (type === 'error' ? 4000 : 2800);
  var container = document.getElementById('toastContainer');
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.innerHTML =
    '<span class="toast-ico">' + (TOAST_ICONS[type] || 'ℹ️') + '</span>' +
    '<span class="toast-msg">' + msg + '</span>';
  container.appendChild(t);
  setTimeout(function() {
    t.classList.add('hiding');
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
  }, duration);
}

// Shortcuts
function toastOk(msg)   { showToast(msg, 'success'); }
function toastErr(msg)  { showToast(msg, 'error'); }
function toastWarn(msg) { showToast(msg, 'warning'); }
function toastInfo(msg) { showToast(msg, 'info'); }

/* ===== CONFIRM MODAL (جایگزین confirm()) ===== */
(function() {
  var modal = document.createElement('div');
  modal.id = 'confirmModal';
  modal.innerHTML =
    '<div id="confirmBox">' +
      '<div id="confirmIcon">🗑️</div>' +
      '<div id="confirmTitle"></div>' +
      '<div id="confirmMsg"></div>' +
      '<div id="confirmBtns">' +
        '<button class="btn btn-danger" id="confirmOkBtn">تأیید</button>' +
        '<button class="btn btn-white" id="confirmCancelBtn">انصراف</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
})();

var _confirmResolve = null;

function showConfirm(msg, title, icon) {
  document.getElementById('confirmIcon').textContent  = icon  || '❓';
  document.getElementById('confirmTitle').textContent = title || 'تأیید عملیات';
  document.getElementById('confirmMsg').textContent   = msg;
  document.getElementById('confirmModal').classList.add('open');
  return new Promise(function(resolve) { _confirmResolve = resolve; });
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('confirmOkBtn').addEventListener('click', function() {
    document.getElementById('confirmModal').classList.remove('open');
    if (_confirmResolve) { _confirmResolve(true); _confirmResolve = null; }
  });
  document.getElementById('confirmCancelBtn').addEventListener('click', function() {
    document.getElementById('confirmModal').classList.remove('open');
    if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
  });
  // Close on backdrop click
  document.getElementById('confirmModal').addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('open');
      if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
    }
  });
});
