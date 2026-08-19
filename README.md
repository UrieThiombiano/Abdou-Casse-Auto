# Abdou Casse Auto — React + Vite + Supabase

Réécriture complète du site (PHP/Laravel + Livewire d'origine, dans `../repo`)
en **React + Vite** pour le front, et **Supabase** (Postgres + Auth + Storage)
pour le backend. Objectif : un site 100% statique côté front, facile à
déployer (Vercel, Netlify, Cloudflare Pages, GitHub Pages…), sans serveur PHP
à maintenir.

Toutes les pages, tous les comportements et tout le design (couleurs,
police Archivo, boutons carrés, animations) ont été repris à l'identique.

## Fonctionnalités reprises

**Site public**
- Accueil : recherche rapide par marque, présentation, réassurance
- Catalogue "Pièces neuves" et "Occasion — France au revoir" : filtres
  marque/année, pagination (12/page)
- Fiche produit : galerie photo, aucun prix affiché, CTA "Commander" + WhatsApp
- Commande d'une pièce : formulaire sans paiement en ligne (paiement à la
  livraison uniquement), pré-rempli si on vient d'une fiche produit
- Contact : formulaire + coordonnées + lien Google Maps
- Avez-vous cette pièce ? : bouton flottant présent sur les deux pages
  catalogue, ouvrant une fenêtre modale (formulaire + photo jointe, upload
  anonyme vers un bucket dédié limité à 8 Mo / images uniquement), envoyé
  comme une commande
- Statistiques de fréquentation (visites, clics contact/téléphone,
  "Commander une pièce", localisation) trackées silencieusement côté
  visiteur, visibles uniquement par l'admin

**Espace admin** (`/admin/login`, aucune inscription publique)
- Tableau de bord : compteurs, graphique commandes sur 14 jours, dernières commandes
- Gestion des annonces : création/édition/suppression, upload photos
  (compressées en WebP côté navigateur avant envoi, comme l'ancien
  `ImageUploader` PHP), filtres, pagination (15/page)
- Gestion des commandes : filtre par statut, détail, changement de statut,
  lien WhatsApp direct, export CSV (Excel) généré côté navigateur
- Gestion des demandes de pièces : mêmes fonctionnalités que les commandes,
  avec affichage de la photo jointe par le visiteur
- Fréquentation du site (30 derniers jours) : visites, clics contact/téléphone,
  clics "Commander une pièce", clics localisation

## Stack

- React 19 + React Router 7
- Vite 8 + Tailwind CSS v4 (`@tailwindcss/vite`, tokens dans `src/index.css`)
- Supabase JS v2 : Postgres (données), Auth (compte admin), Storage (photos)

## Mise en route

### 1. Créer un projet Supabase

Sur [supabase.com](https://supabase.com), créez un projet, puis récupérez
dans **Project Settings → API** :
- l'URL du projet
- la clé `anon public`
- la clé `service_role` (uniquement pour la création du compte admin, jamais côté client)

### 2. Appliquer le schéma

Dans **SQL Editor** de Supabase, exécutez dans l'ordre :
1. `supabase/schema.sql` — tables, sécurité (RLS), bucket de stockage `listing-photos`
2. `supabase/part_requests.sql` — table + bucket `part-request-photos` pour "Avez-vous cette pièce ?"
3. `supabase/analytics.sql` — table + fonction `analytics_summary()` pour les statistiques de fréquentation
4. `supabase/proformas.sql` — table des factures proforma
5. `supabase/manual_orders.sql` — table des commandes hors site (carnet de commandes)
6. `supabase/seed.sql` — marques + annonces de démonstration (optionnel, à supprimer en prod)

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Renseignez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.

### 4. Créer le compte admin

Il n'y a pas d'inscription publique (comme dans la version PHP). Créez le
compte admin avec le script fourni (nécessite la clé `service_role`) :

```bash
SUPABASE_URL=https://xxxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=xxxx \
ADMIN_EMAIL=admin@abdoucasseauto.com \
ADMIN_PASSWORD=changeme123 \
node supabase/create-admin.mjs
```

Vous pouvez aussi créer/gérer le compte directement dans
**Authentication → Users** sur le dashboard Supabase.

### 5. Installer et lancer

```bash
npm install
npm run dev
```

## Déploiement

Le projet compile en fichiers statiques (`npm run build` → dossier `dist/`),
déployables sur n'importe quel hébergeur statique : Vercel, Netlify,
Cloudflare Pages, GitHub Pages, etc. Aucun serveur PHP/MySQL à gérer — cela
règle directement les problèmes de déploiement rencontrés avec la version
Laravel.

Pensez à configurer les mêmes variables d'environnement
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) sur la plateforme
d'hébergement, et à ajouter une règle de réécriture SPA (toutes les routes
→ `index.html`), par exemple pour Netlify (`public/_redirects`) :

```
/*  /index.html  200
```

Pour un hébergement Apache classique (mutualisé type cPanel), le fichier
`public/.htaccess` (copié dans `dist/` au build) fait la même chose via
`mod_rewrite`.

## Différences avec la version PHP

- **Auth "se souvenir de moi"** : Supabase conserve la session automatiquement
  entre les visites (localStorage) ; la case à cocher n'a plus d'utilité et a
  été retirée.
- **Compression d'images** : effectuée dans le navigateur (Canvas API,
  redimensionnement 1600px + export WebP qualité 80%) au moment de l'upload,
  au lieu du serveur (Intervention Image côté Laravel).
- **Export CSV** : généré côté navigateur (Blob + téléchargement) au lieu
  d'un endpoint serveur streamé.

## Structure

```
src/
  components/     Layouts (public/admin/auth), nav, pagination, etc.
  context/        AuthContext (session Supabase)
  lib/            Client Supabase, config société, statuts commande, upload image
  pages/          Pages publiques
  pages/admin/    Pages admin (login, dashboard, annonces, commandes)
supabase/
  schema.sql        Tables + RLS + bucket de stockage
  part_requests.sql Table + bucket "Avez-vous cette pièce ?"
  analytics.sql     Table + fonction agrégée pour les statistiques de fréquentation
  proformas.sql     Table des factures proforma
  manual_orders.sql Table des commandes hors site (carnet de commandes)
  seed.sql          Marques + annonces de démonstration
  create-admin.mjs  Script de création du compte admin
```
