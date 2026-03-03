-- migrate:up
CREATE EXTENSION IF NOT EXISTS citext;

ALTER TABLE users
  ALTER COLUMN email TYPE citext;

-- migrate:down
ALTER TABLE users
  ALTER COLUMN email TYPE text;
