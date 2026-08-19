-- Disponibilite d'une annonce : en stock au magasin, ou sur commande
-- (piece a faire venir de l'exterieur, delai indicatif 1 a 3 mois).
-- A executer apres schema.sql.

alter table listings add column if not exists availability text not null default 'en_stock';

alter table listings drop constraint if exists listings_availability_check;
alter table listings add constraint listings_availability_check
    check (availability in ('en_stock', 'sur_commande'));

create index if not exists listings_availability_idx on listings (availability);
