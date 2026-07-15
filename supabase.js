// سامانه جامع پروژه مهر — ناحیه ۴ شیراز
// supabase.js — لایه دسترسی به Supabase  v6.1

// =============================================
// Config — از window.APP_CONFIG یا fallback
// =============================================
const _cfg = (typeof window.APP_CONFIG !== 'undefined') ? window.APP_CONFIG : {
  supabaseUrl:  'https://yyfhiekgmtaxobndjkpv.supabase.co',
  supabaseAnon: 'sb_publishable_9vxsuC2lxcpVHa_DEW2jwg_ggzguG32'
};

const _supabase = supabase.createClient(_cfg.supabaseUrl, _cfg.supabaseAnon);

// =============================================
// Wrapper ایمن
// =============================================
async function safeQuery(fn) {
  try {
    const { data, error } = await fn();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[safeQuery]', err);
    throw err;
  }
}

// =============================================
// CRUD عمومی
// =============================================
const sb = {
  async getAll(table, order = 'id') {
    return safeQuery(() => _supabase.from(table).select('*').order(order));
  },
  async insert(table, data) {
    return safeQuery(() => _supabase.from(table).insert(data).select());
  },
  async update(table, id, data) {
    return safeQuery(() => _supabase.from(table).update(data).eq('id', id).select());
  },
  async delete(table, id) {
    return safeQuery(() => _supabase.from(table).delete().eq('id', id));
  },
  async upsert(table, data, conflict = 'id') {
    return safeQuery(() =>
      _supabase.from(table).upsert(data, { onConflict: conflict }).select()
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
      _supabase.from('activities').upsert(rows, { onConflict: 'id' }).select()
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
  async getAll() {
    // ناظر/ادمین: همه | مدرسه: فقط فایل‌های خودش (RLS هم همین را اعمال می‌کند)
    return sb.getAll('documents');
  },
  async add(data)  { return sb.insert('documents', data); },
  async update(id, data) { return sb.update('documents', id, data); },
  async remove(id) { return sb.delete('documents', id); }
};

const sbSchoolFiles = {
  async getAll(schoolId) {
    return safeQuery(() =>
      _supabase.from('school_files').select('*').eq('school_id', schoolId)
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
      _supabase.from('forms').upsert({ form_num: num, data }, { onConflict: 'form_num' }).select()
    );
  }
};

const sbReports = {
  async getAll()   { return sb.getAll('reports'); },
  async add(data)  { return sb.insert('reports', data); },
  async update(id, data) { return sb.update('reports', id, data); },
  async remove(id) { return sb.delete('reports', id); }
};

const sbGroupManagers = {
  async getAll()             { return sb.getAll('group_managers', 'group_num'); },
  async save(groupNum, name) {
    return safeQuery(() =>
      _supabase.from('group_managers')
        .upsert({ group_num: groupNum, name }, { onConflict: 'group_num' })
        .select()
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
      _supabase.from('login_log').select('*').order('login_time', { ascending: false })
    );
  }
};

// =============================================
// Supabase Storage — آپلود خصوصی + لینک موقت (Signed URL)
// مسیر: {userId}/{timestamp}_{filename}
// =============================================
async function uploadFile(bucket, file) {
  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  if (!user || !user.id) throw new Error('برای آپلود باید وارد سامانه شوید.');

  const safeName = file.name.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, '_');
  const filePath = `${user.id}/${Date.now()}_${safeName}`;
  const { error } = await _supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined
  });
  if (error) throw error;

  // لینک موقت ۱ ساعته — نه public
  const { data: signed, error: signErr } = await _supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 60);
  if (signErr) throw signErr;

  return { filePath, publicUrl: signed.signedUrl, signedUrl: signed.signedUrl };
}

async function getDocumentSignedUrl(filePath, expiresSec) {
  if (!filePath) return null;
  // اگر مسیر قدیمی public بود، همان را برگردان
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const { data, error } = await _supabase.storage
    .from('school-files')
    .createSignedUrl(filePath, expiresSec || 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}
