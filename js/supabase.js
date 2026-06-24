// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// supabase.js — لایه دسترسی به Supabase  v6.3

// =============================================
// Config — از window.APP_CONFIG یا fallback
// =============================================
const _cfg = (typeof window.APP_CONFIG !== 'undefined') ? window.APP_CONFIG : {
  supabaseUrl:  'https://bomwdnzarrhysnhuagye.supabase.co',
  supabaseAnon: 'sb_publishable_7PLpcKVd1SnOJ5-zzVPY3w_9DwZwAR7'
};

const _supabase = supabase.createClient(_cfg.supabaseUrl, _cfg.supabaseAnon);

// =============================================
// Wrapper ایمن — با ثبت خودکار خطا در system_errors
// =============================================

// از داخل safeQuery دوباره صدا زده نمی‌شود تا حلقه‌ی بی‌نهایت رخ ندهد
async function _logSystemError(context, err) {
  // اگر خطا مربوط به خودِ جدول system_errors باشد، لاگ نکن (جلوگیری از حلقه)
  if (context && context.startsWith('system_errors.')) return;
  try {
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    await _supabase.from('system_errors').insert({
      context: context || null,
      message: err?.message || String(err),
      details: {
        code:    err?.code    || null,
        details: err?.details || null,
        hint:    err?.hint    || null,
        status:  err?.status  || null
      },
      user_id:   user?.id        || null,
      user_name: user?.full_name || null,
      url:       (typeof window !== 'undefined' && window.location) ? window.location.href : null
    });
  } catch (logErr) {
    // اگر خود ثبت خطا هم fail شود، فقط در کنسول می‌ماند — هیچ throw‌ی به بیرون نمی‌رود
    console.warn('[_logSystemError] failed to record error:', logErr?.message || logErr);
  }
}

async function safeQuery(fn, context) {
  try {
    const { data, error } = await fn();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[safeQuery]', context || '', err);
    // عدم انتظار (await نکردن) تا تأخیر در مسیر اصلی ایجاد نشود
    _logSystemError(context, err);
    throw err;
  }
}

// =============================================
// CRUD عمومی
// =============================================
const sb = {
  async getAll(table, order = 'id') {
    return safeQuery(() => _supabase.from(table).select('*').order(order), `${table}.getAll`);
  },
  async insert(table, data) {
    return safeQuery(() => _supabase.from(table).insert(data).select(), `${table}.insert`);
  },
  async update(table, id, data) {
    return safeQuery(() => _supabase.from(table).update(data).eq('id', id).select(), `${table}.update`);
  },
  async delete(table, id) {
    return safeQuery(() => _supabase.from(table).delete().eq('id', id), `${table}.delete`);
  },
  async upsert(table, data, conflict = 'id') {
    return safeQuery(() =>
      _supabase.from(table).upsert(data, { onConflict: conflict }).select(), `${table}.upsert`
    );
  }
};

// =============================================
// Data layer
// =============================================

const sbUsers = {
  async getAll()         { return sb.getAll('profiles'); },
  async update(id, data) { return sb.update('profiles', id, data); },
  async remove(id)       { return sb.delete('profiles', id); }
};

const sbMembers = {
  async getAll()         { return sb.getAll('members'); },
  async add(data)        { return sb.insert('members', data); },
  async update(id, data) { return sb.update('members', id, data); },
  async remove(id)       { return sb.delete('members', id); }
};

const sbActivities = {
  async getAll()          { return sb.getAll('activities', 'id'); },
  async setDone(id, done) { return sb.update('activities', id, { done, updated_at: new Date().toISOString() }); },
  async upsertAll(rows)   {
    return safeQuery(() =>
      _supabase.from('activities').upsert(rows, { onConflict: 'id' }).select(), 'activities.upsertAll'
    );
  }
};

const sbSchools = {
  async getAll()         { return sb.getAll('schools'); },
  async add(data)        { return sb.insert('schools', data); },
  async update(id, data) { return sb.update('schools', id, data); },
  async remove(id)       { return sb.delete('schools', id); }
};

const sbDocuments = {
  async getAll()   { return sb.getAll('documents'); },
  async add(data)  { return sb.insert('documents', data); },
  async remove(id) { return sb.delete('documents', id); }
};

const sbSchoolFiles = {
  async getAll(schoolId) {
    return safeQuery(() =>
      _supabase.from('school_files').select('*').eq('school_id', schoolId), 'school_files.getAll'
    );
  },
  async add(data)  { return sb.insert('school_files', data); },
  async remove(id) { return sb.delete('school_files', id); }
};

const sbMeetings = {
  async getAll()   { return sb.getAll('meetings'); },
  async add(data)  { return sb.insert('meetings', data); },
  async remove(id) { return sb.delete('meetings', id); }
};

const sbObserver = {
  async getAll()   { return sb.getAll('observer_reports'); },
  async add(data)  { return sb.insert('observer_reports', data); }
};

const sbForms = {
  async getAll()        { return sb.getAll('forms', 'form_num'); },
  async save(num, data) {
    return safeQuery(() =>
      _supabase.from('forms').upsert({ form_num: num, data }, { onConflict: 'form_num' }).select(), 'forms.save'
    );
  }
};

const sbReports = {
  async getAll()   { return sb.getAll('reports'); },
  async add(data)  { return sb.insert('reports', data); },
  async remove(id) { return sb.delete('reports', id); }
};

const sbGroupManagers = {
  async getAll()             { return sb.getAll('group_managers', 'group_num'); },
  async save(groupNum, name) {
    return safeQuery(() =>
      _supabase.from('group_managers')
        .upsert({ group_num: groupNum, name }, { onConflict: 'group_num' })
        .select(), 'group_managers.save'
    );
  }
};

const sbLog = {
  async add(type, title, detail, userName) {
    return sb.insert('activity_log', { type, title, detail, user_name: userName || '—' });
  },
  async getAll() { return sb.getAll('activity_log', 'created_at'); }
};

const sbLoginLog = {
  async add(userId, email, role) {
    return sb.insert('login_log', {
      user_id:    userId,
      email:      email,
      role:       role,
      user_agent: navigator.userAgent
    });
  },
  async getAll() {
    return safeQuery(() =>
      _supabase.from('login_log').select('*').order('login_time', { ascending: false }), 'login_log.getAll'
    );
  }
};

const sbSystemErrors = {
  async getAll(limit = 50) {
    return safeQuery(() =>
      _supabase.from('system_errors').select('*').order('created_at', { ascending: false }).limit(limit)
    , 'system_errors.getAll');
  }
};

// =============================================
// Supabase Storage — آپلود فایل
// =============================================
async function uploadFile(bucket, file) {
  const filePath = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { data, error } = await _supabase.storage.from(bucket).upload(filePath, file);
  if (error) throw error;
  const { data: { publicUrl } } = _supabase.storage.from(bucket).getPublicUrl(filePath);
  return { filePath, publicUrl };
}
