-- =============================================
-- سامانه جامع پروژه مهر — Schema v6.1
-- فقط همین فایل را اجرا کن
-- =============================================

-- جدول پروفایل کاربران (لینک به Supabase Auth)
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    role text not null check (role in ('teacher','manager','inspector','admin')),
    school_id uuid,
    created_at timestamptz default now()
);

-- مدارس
create table if not exists schools (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    code text unique,
    manager text,
    level text,
    city text,
    score int default 0,
    created_at timestamptz default now()
);

-- ارتباط پروفایل به مدرسه
alter table profiles
    add constraint if not exists fk_school
    foreign key (school_id) references schools(id);

-- کارگروه‌ها (جدول مستقل به جای رشته)
create table if not exists work_groups (
    id int primary key,
    name text not null
);

insert into work_groups (id, name) values
  (1,'کارگروه ۱'),(2,'کارگروه ۲'),(3,'کارگروه ۳'),
  (4,'کارگروه ۴'),(5,'کارگروه ۵'),(6,'کارگروه ۶'),
  (7,'کارگروه ۷'),(8,'کارگروه ۸'),(9,'کارگروه ۹'),
  (10,'کارگروه ۱۰')
on conflict do nothing;

-- اعضای کارگروه‌ها
create table if not exists members (
    id bigint primary key generated always as identity,
    group_name text not null,
    name text not null,
    post text,
    phone text,
    school_id uuid references schools(id) on delete set null,
    created_at timestamptz default now()
);

-- ۸۴ فعالیت پروژه مهر
create table if not exists activities (
    id int primary key,
    title text not null,
    done boolean not null default false,
    updated_at timestamptz default now()
);

-- فایل‌های مدارس (بدون base64 — فقط لینک Storage)
create table if not exists school_files (
    id uuid primary key default gen_random_uuid(),
    school_id uuid references schools(id) on delete cascade,
    file_name text,
    file_url text,
    uploaded_at timestamptz default now()
);

-- مستندات (بدون file_data/base64)
create table if not exists documents (
    id bigint primary key generated always as identity,
    title text not null,
    activity_id int references activities(id),
    file_name text,
    file_url text,
    file_type text,
    created_at timestamptz default now()
);

-- صورتجلسات
create table if not exists meetings (
    id bigint primary key generated always as identity,
    title text not null,
    number text,
    date text,
    members text,
    resolutions text,
    followup text,
    created_at timestamptz default now()
);

-- گزارش‌های ناظر
create table if not exists observer_reports (
    id bigint primary key generated always as identity,
    school_id uuid references schools(id) on delete set null,
    school_name text,
    report text,
    score int default 0,
    date text,
    created_at timestamptz default now()
);

-- نمون‌برگ‌های رسمی
create table if not exists forms (
    form_num int primary key,
    data jsonb not null default '{}'
);

-- گزارش‌های ارسالی — group_id به جای group_name رشته
create table if not exists reports (
    id bigint primary key generated always as identity,
    group_id int references work_groups(id),
    group_name text,   -- برای نمایش سریع
    name text,
    period text,
    done text,
    issues text,
    progress text,
    date text,
    created_at timestamptz default now()
);

-- مدیران کارگروه‌ها
create table if not exists group_managers (
    group_num int primary key,
    name text default ''
);

-- لاگ فعالیت‌ها
create table if not exists activity_log (
    id bigint primary key generated always as identity,
    type text,
    title text,
    detail text,
    user_name text,
    created_at timestamptz default now()
);

-- لاگ ورود حرفه‌ای
create table if not exists login_log (
    id bigint generated always as identity primary key,
    user_id uuid references profiles(id) on delete set null,
    email text,
    role text,
    login_time timestamptz default now(),
    user_agent text
);

-- مقداردهی اولیه
insert into group_managers (group_num, name)
select i, '' from generate_series(1,10) s(i)
on conflict do nothing;

-- =============================================
-- Trigger: ساخت خودکار پروفایل بعد از Signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'teacher')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
