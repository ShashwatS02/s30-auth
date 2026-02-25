-- migrate:up

create table users (
  id bigint generated always as identity primary key,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table sessions (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  refresh_token_hash text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index sessions_user_id_idx on sessions(user_id);

-- migrate:down

drop table if exists sessions;
drop table if exists users;
