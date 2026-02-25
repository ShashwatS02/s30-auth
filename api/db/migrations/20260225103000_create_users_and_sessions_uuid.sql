-- migrate:up

CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  refresh_token_hash text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index sessions_user_id_idx on sessions(user_id);

-- migrate:down

drop table if exists sessions;
drop table if exists users;
