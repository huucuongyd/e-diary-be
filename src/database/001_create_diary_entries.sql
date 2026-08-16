CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "authorId" character varying NOT NULL,
  title character varying NOT NULL,
  content text NOT NULL,
  "imageUrl" character varying,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS IDX_diary_entries_authorId ON diary_entries ("authorId");
