-- Donnees de demarrage — equivalent de BrandSeeder + DemoDataSeeder.
-- A executer apres schema.sql. Le compte admin se cree separement
-- (voir README, section "Créer le compte admin") car auth.users n'est
-- pas modifiable par simple SQL cote client.

insert into brands (name)
values ('Toyota'), ('Hyundai'), ('Mitsubishi'), ('Suzuki'), ('Lexus'), ('Kia')
on conflict (name) do nothing;

-- Annonces de demonstration (a supprimer une fois les vraies annonces saisies).
insert into listings (title, category, brand_id, model, year_from, year_to, item_condition, description)
select v.title, v.category, b.id, v.model, v.year_from, v.year_to, v.item_condition, v.description
from (values
    ('Pare-choc avant', 'neuf', 'Toyota', 'Corolla', 2015, 2019, 'Neuf, sous emballage', 'Pare-choc avant compatible Toyota Corolla.'),
    ('Phare avant droit', 'neuf', 'Hyundai', 'Tucson', 2018, 2022, 'Neuf, sous emballage', 'Phare avant droit compatible Hyundai Tucson.'),
    ('Retroviseur electrique', 'occasion', 'Toyota', 'RAV4', 2012, 2016, 'Bon etat, fonctionnel', 'Retroviseur electrique compatible Toyota RAV4.'),
    ('Radiateur moteur', 'occasion', 'Mitsubishi', 'Pajero', 2010, 2015, 'Bon etat, fonctionnel', 'Radiateur moteur compatible Mitsubishi Pajero.'),
    ('Jante alliage 17"', 'neuf', 'Kia', 'Sportage', 2016, 2021, 'Neuf, sous emballage', 'Jante alliage 17" compatible Kia Sportage.'),
    ('Alternateur', 'occasion', 'Suzuki', 'Vitara', 2013, 2018, 'Bon etat, fonctionnel', 'Alternateur compatible Suzuki Vitara.'),
    ('Feu arriere gauche', 'neuf', 'Lexus', 'RX', 2015, 2020, 'Neuf, sous emballage', 'Feu arriere gauche compatible Lexus RX.'),
    ('Boite a vitesse automatique', 'occasion', 'Toyota', 'Hilux', 2014, 2019, 'Bon etat, fonctionnel', 'Boite a vitesse automatique compatible Toyota Hilux.')
) as v(title, category, brand_name, model, year_from, year_to, item_condition, description)
join brands b on b.name = v.brand_name
on conflict do nothing;
