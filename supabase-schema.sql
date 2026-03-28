-- ============================================================
-- FuelSpotter NG — Supabase SQL Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. STATIONS TABLE
-- Stores each petrol station and its current crowd-reported status.
create table if not exists stations (
  id           bigint generated always as identity primary key,
  name         text not null,
  area         text not null,
  latitude     double precision,
  longitude    double precision,
  fuel_status  text not null default 'unknown'
                 check (fuel_status in ('available', 'nofuel', 'unknown')),
  queue_length text
                 check (queue_length in ('short', 'medium', 'long') or queue_length is null),
  last_updated timestamptz default now(),
  created_at   timestamptz default now()
);

-- 2. REPORTS TABLE
-- Each crowd-submitted report. Source of truth for history + reliability.
create table if not exists reports (
  id           bigint generated always as identity primary key,
  station_id   bigint not null references stations(id) on delete cascade,
  fuel_status  text not null
                 check (fuel_status in ('available', 'nofuel')),
  queue_length text
                 check (queue_length in ('short', 'medium', 'long') or queue_length is null),
  comment      text,
  created_at   timestamptz default now()
);

-- 3. PROFILES TABLE
-- Extends Supabase Auth users with custom fields.
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  avatar_url   text,
  email        text unique,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security modeller;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. INDEXES
create index if not exists reports_station_id_idx on reports(station_id);
create index if not exists stations_fuel_status_idx on stations(fuel_status);
create index if not exists stations_last_updated_idx on stations(last_updated desc);

-- 5. ROW LEVEL SECURITY
-- Allow public reads. Only authenticated users (or anon) can insert reports.
alter table stations enable row level security;
alter table reports  enable row level security;

-- Anyone can read stations
create policy "Public read stations"
  on stations for select using (true);

-- Anyone can read reports
create policy "Public read reports"
  on reports for select using (true);

-- Authenticated users can insert reports (or anyone if you want to keep it open)
create policy "Anyone can insert reports"
  on reports for insert with check (true);

-- Anyone can update a station (triggered by report submission)
create policy "Public update stations"
  on stations for update using (true);

-- 6. REAL-TIME
-- Enable real-time updates for the stations table
alter publication supabase_realtime add table stations;

-- ============================================================
-- SEED DATA — Lagos petrol stations
-- ============================================================

insert into stations (name, area, latitude, longitude, fuel_status, queue_length, last_updated) values
  ('Mobil Petrol Station',      'Ikeja',          6.5955,  3.3384, 'available', 'medium',  now() - interval '3 minutes'),
  ('NNPC Mega Station',         'Lekki Phase 1',  6.4281,  3.5237, 'available', 'long',    now() - interval '8 minutes'),
  ('Total Energies',            'Yaba',           6.5095,  3.3711, 'nofuel',    null,      now() - interval '25 minutes'),
  ('Ardova Petroleum',          'Victoria Island',6.4248,  3.4177, 'available', 'short',   now() - interval '1 minute'),
  ('Conoil',                    'Surulere',       6.4967,  3.3515, 'unknown',   null,      now() - interval '90 minutes'),
  ('AP (Forte Oil)',            'Maryland',       6.5538,  3.3590, 'nofuel',    null,      now() - interval '12 minutes'),
  ('Oando Filling Station',     'Ikorodu',        6.6194,  3.5078, 'available', 'medium',  now() - interval '5 minutes'),
  ('Nipco Petrol Station',      'Ajah',           6.4659,  3.5826, 'unknown',   null,      now() - interval '3 hours'),
  ('MRS Oil',                   'Apapa',          6.4480,  3.3602, 'available', 'short',   now() - interval '15 minutes'),
  ('Rainoil',                   'Gbagada',        6.5570,  3.3859, 'nofuel',    null,      now() - interval '40 minutes');
