-- migrate:up
alter table sessions
  add column expires_at timestamptz not null default (now() + interval '30 days'),
  add column replaced_by uuid;

create index sessions_refresh_token_hash_idx on sessions(refresh_token_hash);

-- migrate:down
drop index if exists sessions_refresh_token_hash_idx;

alter table sessions
  drop column if exists replaced_by,
  drop column if exists expires_at;
