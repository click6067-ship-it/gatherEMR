-- gatherEMR v1 schema. Stores DE-IDENTIFIED data only.
-- Public, no-login tool → anon key + permissive RLS (de-identified public data).

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  specialty text not null default 'emergency',
  masked_text text not null,                 -- de-identified source ONLY (raw never stored)
  status text not null default 'summarized',
  created_at timestamptz not null default now()
);

create table if not exists chunks (
  document_id uuid not null references documents(id) on delete cascade,
  id text not null,                          -- cN
  start_pos int not null,
  end_pos int not null,
  line int not null,
  text text not null,                        -- de-identified chunk text
  primary key (document_id, id)
);

create table if not exists summaries (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  specialty text not null,
  content jsonb not null,                    -- ResolvedSummary
  lint jsonb not null default '[]'::jsonb,
  model text not null,
  created_at timestamptz not null default now()
);

create table if not exists spend_ledger (
  day date primary key,
  usd numeric not null default 0
);

create index if not exists chunks_document_idx on chunks(document_id);
create index if not exists summaries_document_idx on summaries(document_id);

-- RLS. v1: de-identified public data + capability-URL deletes (doc id = uuid).
-- NOTE: with only the anon key these are open; when a Supabase SECRET key is
-- added, tighten spend_ledger to server-only.
alter table documents enable row level security;
alter table chunks enable row level security;
alter table summaries enable row level security;
alter table spend_ledger enable row level security;

drop policy if exists public_rw_documents on documents;
drop policy if exists public_rw_chunks on chunks;
drop policy if exists public_rw_summaries on summaries;
drop policy if exists public_rw_spend on spend_ledger;

create policy public_rw_documents on documents for all using (true) with check (true);
create policy public_rw_chunks on chunks for all using (true) with check (true);
create policy public_rw_summaries on summaries for all using (true) with check (true);
create policy public_rw_spend on spend_ledger for all using (true) with check (true);
