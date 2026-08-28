-- Ateliers / reparations : un vehicule "entre" au garage, les ouvriers ajoutent
-- des lignes (pieces, main d'oeuvre) au fil des travaux, et a la "sortie" du
-- vehicule on totalise et le client solde. Meme logique qu'un dossier patient
-- de clinique (admission -> soins ajoutes au dossier -> sortie -> facture).
-- Usage 100% interne (saisie admin/atelier), aucun formulaire public.
-- A executer apres schema.sql.

create table if not exists repair_tickets (
    id bigint generated always as identity primary key,
    ticket_number text not null unique,
    customer_name text not null,
    customer_phone text not null,
    brand_id bigint references brands (id) on delete set null,
    model text,
    registration_number text,
    vin text,
    diagnosis text,
    entry_date date not null default current_date,
    exit_date date,
    status text not null default 'en_cours' check (status in ('en_cours', 'sorti')),
    -- Colonnes recalculees automatiquement (voir triggers plus bas) a partir
    -- des lignes et des paiements : jamais ecrites directement par l'appli.
    total_amount numeric(14, 0) not null default 0,
    amount_paid numeric(14, 0) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table repair_tickets drop constraint if exists repair_tickets_vin_check;
alter table repair_tickets add constraint repair_tickets_vin_check
    check (vin is null or char_length(vin) = 17);

create index if not exists repair_tickets_status_idx on repair_tickets (status);

create trigger repair_tickets_set_updated_at before update on repair_tickets
    for each row execute function set_updated_at();

-- Lignes ajoutees au fil des travaux (pieces posees, main d'oeuvre, autres frais).
-- Table separee (pas un jsonb) : chaque ajout est un enregistrement independant
-- et date, comme sur le carnet papier.
create table if not exists repair_ticket_items (
    id bigint generated always as identity primary key,
    ticket_id bigint not null references repair_tickets (id) on delete cascade,
    type text not null check (type in ('piece', 'main_oeuvre', 'autre')),
    description text not null,
    quantity numeric(10, 2) not null default 1 check (quantity > 0),
    unit_price numeric(14, 0) not null default 0 check (unit_price >= 0),
    created_at timestamptz not null default now()
);

create index if not exists repair_ticket_items_ticket_idx on repair_ticket_items (ticket_id);

-- Acomptes verses par le client pendant que le vehicule est encore en atelier
-- (avant le solde final a la sortie).
create table if not exists repair_ticket_payments (
    id bigint generated always as identity primary key,
    ticket_id bigint not null references repair_tickets (id) on delete cascade,
    amount numeric(14, 0) not null check (amount > 0),
    paid_at date not null default current_date,
    note text,
    created_at timestamptz not null default now()
);

create index if not exists repair_ticket_payments_ticket_idx on repair_ticket_payments (ticket_id);

-- Total du et total paye sur repair_tickets sont derives des lignes / paiements :
-- recalcules automatiquement a chaque insertion / modification / suppression,
-- pour que la liste des tickets affiche un solde toujours a jour.
create or replace function recompute_repair_ticket_totals(p_ticket_id bigint)
returns void as $$
begin
    update repair_tickets set
        total_amount = coalesce(
            (select sum(quantity * unit_price) from repair_ticket_items where ticket_id = p_ticket_id), 0
        ),
        amount_paid = coalesce(
            (select sum(amount) from repair_ticket_payments where ticket_id = p_ticket_id), 0
        )
    where id = p_ticket_id;
end;
$$ language plpgsql;

create or replace function repair_ticket_totals_trigger()
returns trigger as $$
begin
    perform recompute_repair_ticket_totals(coalesce(new.ticket_id, old.ticket_id));
    return null;
end;
$$ language plpgsql;

drop trigger if exists repair_ticket_items_after_change on repair_ticket_items;
create trigger repair_ticket_items_after_change
    after insert or update or delete on repair_ticket_items
    for each row execute function repair_ticket_totals_trigger();

drop trigger if exists repair_ticket_payments_after_change on repair_ticket_payments;
create trigger repair_ticket_payments_after_change
    after insert or update or delete on repair_ticket_payments
    for each row execute function repair_ticket_totals_trigger();

alter table repair_tickets enable row level security;
alter table repair_ticket_items enable row level security;
alter table repair_ticket_payments enable row level security;

-- Aucun acces public : saisie et suivi 100% internes (comme manual_orders).
create policy "repair_tickets_admin_all" on repair_tickets for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "repair_ticket_items_admin_all" on repair_ticket_items for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "repair_ticket_payments_admin_all" on repair_ticket_payments for all
    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
