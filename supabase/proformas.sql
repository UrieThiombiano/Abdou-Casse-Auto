-- Factures proforma (K.A SPARE PARTS) generees depuis l'espace admin.
-- A executer apres schema.sql.

create table if not exists proformas (
    id bigint generated always as identity primary key,
    number text not null unique,
    issue_date date not null default current_date,
    client_name text not null,
    client_address text,
    client_phone text,
    client_rccm text,
    client_ifu text,
    client_rni text,
    object text,
    registration_number text,
    chassis_number text,
    items jsonb not null default '[]'::jsonb,
    total_amount numeric(14, 0) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists proformas_issue_date_idx on proformas (issue_date desc);

create trigger proformas_set_updated_at before update on proformas
    for each row execute function set_updated_at();

alter table proformas enable row level security;

-- Aucun acces public : uniquement l'admin (usage interne, documents commerciaux).
create policy "proformas_admin_all" on proformas for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
