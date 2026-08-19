-- Statistiques de frequentation — visites du site, clics telephone/contact,
-- clics "Commander une piece", clics "Localisation".
-- A executer apres schema.sql.

create table if not exists analytics_events (
    id bigint generated always as identity primary key,
    event_type text not null check (event_type in ('page_view', 'phone_click', 'order_click', 'location_click')),
    path text,
    session_id text,
    created_at timestamptz not null default now()
);

create index if not exists analytics_events_type_created_idx on analytics_events (event_type, created_at);

alter table analytics_events enable row level security;

-- Creation publique (tracking anonyme cote visiteur), consultation admin uniquement.
create policy "analytics_events_public_insert" on analytics_events for insert with check (true);
create policy "analytics_events_admin_select" on analytics_events for select using (auth.role() = 'authenticated');

-- Resume agrege pour le tableau de bord admin, sur les N derniers jours.
-- SECURITY INVOKER (par defaut) : respecte la RLS ci-dessus, donc seul un
-- admin connecte obtient des chiffres (un visiteur anonyme aurait 0 partout).
create or replace function analytics_summary(days integer default 30)
returns table (
    site_visits bigint,
    phone_clicks bigint,
    order_clicks bigint,
    location_clicks bigint
)
language sql
stable
as $$
    select
        count(distinct session_id) filter (where event_type = 'page_view') as site_visits,
        count(*) filter (where event_type = 'phone_click') as phone_clicks,
        count(*) filter (where event_type = 'order_click') as order_clicks,
        count(*) filter (where event_type = 'location_click') as location_clicks
    from analytics_events
    where created_at >= now() - (days || ' days')::interval;
$$;
