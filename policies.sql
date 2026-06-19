-- =============================================
-- سامانه جامع پروژه مهر — RLS Policies v6.1
-- USING برای SELECT/UPDATE/DELETE
-- WITH CHECK برای INSERT
-- =============================================

-- فعال‌سازی RLS
alter table profiles         enable row level security;
alter table schools          enable row level security;
alter table members          enable row level security;
alter table activities       enable row level security;
alter table documents        enable row level security;
alter table school_files     enable row level security;
alter table meetings         enable row level security;
alter table observer_reports enable row level security;
alter table forms            enable row level security;
alter table reports          enable row level security;
alter table group_managers   enable row level security;
alter table activity_log     enable row level security;
alter table login_log        enable row level security;

-- =============================================
-- profiles
-- =============================================

create policy "profiles: read own"
on profiles for select
using (auth.uid() = id);

create policy "profiles: update own"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles: admin read all"
on profiles for select
using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "profiles: admin write all"
on profiles for insert
with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "profiles: admin delete"
on profiles for delete
using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- trigger insert (ساخت پروفایل بعد از signup — بدون بررسی)
create policy "profiles: allow trigger insert"
on profiles for insert
with check (true);

-- =============================================
-- schools
-- =============================================

create policy "schools: authenticated read"
on schools for select
using (auth.role() = 'authenticated');

create policy "schools: manager/admin insert"
on schools for insert
with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

create policy "schools: manager/admin update"
on schools for update
using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

create policy "schools: admin delete"
on schools for delete
using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- =============================================
-- members
-- =============================================

create policy "members: authenticated read"
on members for select
using (auth.role() = 'authenticated');

create policy "members: manager/admin insert"
on members for insert
with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

create policy "members: manager/admin update"
on members for update
using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','manager'))
);

create policy "members: admin delete"
on members for delete
using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- =============================================
-- activities
-- =============================================

create policy "activities: authenticated read"
on activities for select
using (auth.role() = 'authenticated');

create policy "activities: teacher+ insert"
on activities for insert
with check (auth.role() = 'authenticated');

create policy "activities: teacher+ update"
on activities for update
using (auth.role() = 'authenticated');

create policy "activities: admin delete"
on activities for delete
using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- =============================================
-- documents & school_files
-- =============================================

create policy "documents: authenticated read"
on documents for select
using (auth.role() = 'authenticated');

create policy "documents: authenticated insert"
on documents for insert
with check (auth.role() = 'authenticated');

create policy "documents: authenticated delete"
on documents for delete
using (auth.role() = 'authenticated');

create policy "school_files: authenticated read"
on school_files for select
using (auth.role() = 'authenticated');

create policy "school_files: authenticated insert"
on school_files for insert
with check (auth.role() = 'authenticated');

create policy "school_files: authenticated delete"
on school_files for delete
using (auth.role() = 'authenticated');

-- =============================================
-- meetings
-- =============================================

create policy "meetings: authenticated read"
on meetings for select
using (auth.role() = 'authenticated');

create policy "meetings: authenticated insert"
on meetings for insert
with check (auth.role() = 'authenticated');

create policy "meetings: authenticated delete"
on meetings for delete
using (auth.role() = 'authenticated');

-- =============================================
-- forms
-- =============================================

create policy "forms: authenticated read"
on forms for select
using (auth.role() = 'authenticated');

create policy "forms: authenticated insert"
on forms for insert
with check (auth.role() = 'authenticated');

create policy "forms: authenticated update"
on forms for update
using (auth.role() = 'authenticated');

-- =============================================
-- reports
-- =============================================

create policy "reports: authenticated read"
on reports for select
using (auth.role() = 'authenticated');

create policy "reports: authenticated insert"
on reports for insert
with check (auth.role() = 'authenticated');

create policy "reports: authenticated delete"
on reports for delete
using (auth.role() = 'authenticated');

-- =============================================
-- observer_reports
-- =============================================

create policy "observer_reports: authenticated read"
on observer_reports for select
using (auth.role() = 'authenticated');

create policy "observer_reports: authenticated insert"
on observer_reports for insert
with check (auth.role() = 'authenticated');

-- =============================================
-- group_managers
-- =============================================

create policy "group_managers: authenticated read"
on group_managers for select
using (auth.role() = 'authenticated');

create policy "group_managers: authenticated update"
on group_managers for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- =============================================
-- activity_log — فقط admin و inspector می‌خوانند
-- =============================================

create policy "activity_log: admin/inspector read"
on activity_log for select
using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','inspector'))
);

create policy "activity_log: authenticated insert"
on activity_log for insert
with check (auth.role() = 'authenticated');

-- =============================================
-- login_log — فقط admin و inspector می‌خوانند
-- =============================================

create policy "login_log: admin/inspector read"
on login_log for select
using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','inspector'))
);

create policy "login_log: authenticated insert"
on login_log for insert
with check (auth.role() = 'authenticated');

-- =============================================
-- Storage Policies — bucket: school-files
-- =============================================

create policy "storage: authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'school-files');

create policy "storage: public read"
on storage.objects for select
using (bucket_id = 'school-files');

create policy "storage: authenticated delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'school-files');
