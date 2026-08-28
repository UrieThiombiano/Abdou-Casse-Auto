-- Demandes de pieces : VIN optionnel (mais recommande, memes regles que les
-- commandes : 17 caracteres) et plusieurs photos (jusqu'a 5) au lieu d'une seule.
-- A executer apres part_requests.sql.

alter table part_requests add column if not exists vin text;

alter table part_requests drop constraint if exists part_requests_vin_check;
alter table part_requests add constraint part_requests_vin_check
    check (vin is null or char_length(vin) = 17);

alter table part_requests add column if not exists photo_paths text[] not null default '{}';

update part_requests
set photo_paths = array[photo_path]
where photo_path is not null and photo_paths = '{}';
