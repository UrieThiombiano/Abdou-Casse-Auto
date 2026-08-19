-- Demandes de pieces — "avez-vous cette piece ?" avec photo jointe.
-- A executer apres schema.sql.

create table if not exists part_requests (
    id bigint generated always as identity primary key,
    customer_name text not null,
    customer_phone text not null,
    message text not null,
    photo_path text,
    status text not null default 'en_attente' check (status in ('en_attente', 'traitee', 'annulee')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists part_requests_status_idx on part_requests (status);

create trigger part_requests_set_updated_at before update on part_requests
    for each row execute function set_updated_at();

alter table part_requests enable row level security;

-- Creation publique (formulaire "avez-vous cette piece ?"), consultation/maj admin uniquement.
create policy "part_requests_public_insert" on part_requests for insert with check (true);
create policy "part_requests_admin_select" on part_requests for select using (auth.role() = 'authenticated');
create policy "part_requests_admin_update" on part_requests for update
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Stockage des photos jointes par les visiteurs (bucket dedie, distinct des photos
-- d'annonces gerees par l'admin). Limite 8 Mo, images uniquement, appliquee par le bucket
-- lui-meme (protection meme si la policy RLS ci-dessous est large).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'part-request-photos',
    'part-request-photos',
    true,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "part_request_photos_public_read" on storage.objects for select
    using (bucket_id = 'part-request-photos');
create policy "part_request_photos_public_insert" on storage.objects for insert
    with check (bucket_id = 'part-request-photos');
create policy "part_request_photos_admin_delete" on storage.objects for delete
    using (bucket_id = 'part-request-photos' and auth.role() = 'authenticated');
