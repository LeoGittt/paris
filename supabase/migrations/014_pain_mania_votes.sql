-- Pain Manía easter egg votes
create table if not exists pain_mania_votes (
  id         uuid primary key default uuid_generate_v4(),
  vote       text not null check (vote in ('si', 'no')),
  created_at timestamptz default now()
);

alter table pain_mania_votes enable row level security;

create policy "anon can insert" on pain_mania_votes
  for insert to anon, authenticated with check (true);

create policy "anon can read" on pain_mania_votes
  for select to anon, authenticated using (true);
