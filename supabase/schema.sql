-- Abdou Casse Auto — schema Supabase (Postgres)
-- Equivalent des migrations Laravel de l'app PHP d'origine.
-- A executer dans l'editeur SQL de votre projet Supabase (ou via `supabase db push`).

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists brands (
    id bigint generated always as identity primary key,
    name text not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists listings (
    id bigint generated always as identity primary key,
    title text not null,
    category text not null check (category in ('neuf', 'occasion')),
    brand_id bigint not null references brands (id) on delete restrict,
    model text,
    year_from smallint,
    year_to smallint,
    version_provenance text,
    item_condition text,
    description text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists listings_category_brand_id_idx on listings (category, brand_id);

create table if not exists listing_photos (
    id bigint generated always as identity primary key,
    listing_id bigint not null references listings (id) on delete cascade,
    path text not null,
    "position" integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists listing_photos_listing_id_idx on listing_photos (listing_id);

create table if not exists orders (
    id bigint generated always as identity primary key,
    listing_id bigint references listings (id) on delete set null,
    customer_name text not null,
    customer_phone text not null,
    vin text not null,
    brand_id bigint not null references brands (id) on delete restrict,
    model text,
    version_provenance text,
    year smallint,
    comment text,
    status text not null default 'en_attente' check (status in ('en_attente', 'traitee', 'annulee')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on orders (status);

create table if not exists contact_messages (
    id bigint generated always as identity primary key,
    name text not null,
    message text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================================================================
-- updated_at trigger
-- =========================================================================

create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger brands_set_updated_at before update on brands
    for each row execute function set_updated_at();
create trigger listings_set_updated_at before update on listings
    for each row execute function set_updated_at();
create trigger listing_photos_set_updated_at before update on listing_photos
    for each row execute function set_updated_at();
create trigger orders_set_updated_at before update on orders
    for each row execute function set_updated_at();
create trigger contact_messages_set_updated_at before update on contact_messages
    for each row execute function set_updated_at();

-- =========================================================================
-- Row Level Security
-- =========================================================================
-- Aucune inscription publique : le seul role authentifie est l'admin
-- (compte cree manuellement, voir README). "authenticated" == admin ici.

alter table brands enable row level security;
alter table listings enable row level security;
alter table listing_photos enable row level security;
alter table orders enable row level security;
alter table contact_messages enable row level security;

-- Brands : lecture publique, ecriture admin.
create policy "brands_public_select" on brands for select using (true);
create policy "brands_admin_all" on brands for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Listings : lecture publique des annonces actives, admin voit/gere tout.
create policy "listings_public_select_active" on listings for select
    using (is_active = true or auth.role() = 'authenticated');
create policy "listings_admin_insert" on listings for insert
    with check (auth.role() = 'authenticated');
create policy "listings_admin_update" on listings for update
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "listings_admin_delete" on listings for delete
    using (auth.role() = 'authenticated');

-- Listing photos : lecture publique si l'annonce est active, admin gere tout.
create policy "listing_photos_public_select" on listing_photos for select
    using (
        auth.role() = 'authenticated'
        or exists (select 1 from listings l where l.id = listing_id and l.is_active = true)
    );
create policy "listing_photos_admin_insert" on listing_photos for insert
    with check (auth.role() = 'authenticated');
create policy "listing_photos_admin_update" on listing_photos for update
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "listing_photos_admin_delete" on listing_photos for delete
    using (auth.role() = 'authenticated');

-- Orders : creation publique (formulaire de commande), consultation/maj admin uniquement.
create policy "orders_public_insert" on orders for insert with check (true);
create policy "orders_admin_select" on orders for select using (auth.role() = 'authenticated');
create policy "orders_admin_update" on orders for update
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Contact messages : creation publique (formulaire de contact), consultation admin uniquement.
create policy "contact_messages_public_insert" on contact_messages for insert with check (true);
create policy "contact_messages_admin_select" on contact_messages for select using (auth.role() = 'authenticated');

-- =========================================================================
-- Storage (photos des annonces)
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "listing_photos_bucket_public_read" on storage.objects for select
    using (bucket_id = 'listing-photos');
create policy "listing_photos_bucket_admin_insert" on storage.objects for insert
    with check (bucket_id = 'listing-photos' and auth.role() = 'authenticated');
create policy "listing_photos_bucket_admin_update" on storage.objects for update
    using (bucket_id = 'listing-photos' and auth.role() = 'authenticated');
create policy "listing_photos_bucket_admin_delete" on storage.objects for delete
    using (bucket_id = 'listing-photos' and auth.role() = 'authenticated');
