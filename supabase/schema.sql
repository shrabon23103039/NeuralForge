-- Enable PostGIS once, in Supabase SQL editor
create extension if not exists postgis;

create table if not exists profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  phone text,
  role text check (role in ('citizen','authority')) not null default 'citizen',
  department text check (department in ('city_corporation','disaster_management','police')),
  trust_score int default 100,
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  report_type text check (report_type in ('crime','hazard')) not null,
  category text not null, -- robbery, snatching, manhole, road_damage, drain, fire_risk, other
  description text,
  photo_url text,
  lat double precision not null,
  lng double precision not null,
  location geography(Point,4326),
  severity text check (severity in ('low','medium','high')),      -- AI-generated
  ai_is_valid boolean default true,                                 -- AI spam/fake filter
  ai_summary_en text,
  ai_summary_bn text,
  target_department text check (target_department in ('city_corporation','disaster_management','police')),
  status text check (status in ('received','verified','in_progress','resolved','rejected')) default 'received',
  duplicate_of uuid references reports(id),
  confirm_count int default 0,
  dispute_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists verifications (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id),
  user_id uuid references profiles(id),
  vote_type text check (vote_type in ('confirm','dispute')),
  created_at timestamptz default now(),
  unique(report_id, user_id)
);

create table if not exists sos_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  lat double precision,
  lng double precision,
  status text check (status in ('active','acknowledged','resolved')) default 'active',
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Trigger to auto-populate the geography column from lat/lng
create or replace function set_location() returns trigger as $$
begin
  new.location := ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326);
  return new;
end;
$$ language plpgsql;

drop trigger if exists reports_set_location on reports;
create trigger reports_set_location before insert or update on reports
for each row execute function set_location();
