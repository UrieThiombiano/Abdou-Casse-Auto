-- Commandes hors site (entrepot Bassinko ou commande a l'exterieur du pays),
-- saisies manuellement par l'admin. A executer apres schema.sql.

create table if not exists manual_orders (
    id bigint generated always as identity primary key,
    customer_name text not null,
    customer_phone text not null,
    source_type text not null check (source_type in ('entrepot_bassinko', 'commande_exterieure')),
    condition text not null check (condition in ('neuf', 'occasion')),
    description text not null,
    total_amount numeric(14, 0) not null default 0,
    deposit_amount numeric(14, 0) not null default 0 check (deposit_amount >= 0 and deposit_amount <= total_amount),
    estimated_delivery_date date,
    status text not null default 'en_cours'
        check (status in ('en_cours', 'expediee', 'douane', 'recue_magasin', 'livree', 'annulee')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists manual_orders_status_idx on manual_orders (status);

create or replace trigger manual_orders_set_updated_at before update on manual_orders
    for each row execute function set_updated_at();

alter table manual_orders enable row level security;

-- Aucun acces public : saisie et suivi 100% internes.
drop policy if exists "manual_orders_admin_all" on manual_orders;
create policy "manual_orders_admin_all" on manual_orders for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Le carnet de commandes n'affiche que les commandes hors site : la vue
-- unifiee avec les commandes du site (order_book) n'est plus utilisee, pour
-- eviter de melanger les deux dans l'interface admin.
drop view if exists order_book;
