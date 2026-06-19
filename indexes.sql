-- =============================================
-- سامانه جامع پروژه مهر — Indexes v6.1
-- =============================================

create index if not exists idx_profiles_role       on profiles(role);
create index if not exists idx_profiles_school     on profiles(school_id);
create index if not exists idx_members_school      on members(school_id);
create index if not exists idx_members_group       on members(group_name);
create index if not exists idx_activities_done     on activities(done);
create index if not exists idx_reports_created     on reports(created_at);
create index if not exists idx_reports_group       on reports(group_id);
create index if not exists idx_activity_log_created on activity_log(created_at);
create index if not exists idx_login_log_time      on login_log(login_time);
create index if not exists idx_school_files_school on school_files(school_id);
create index if not exists idx_documents_activity  on documents(activity_id);
