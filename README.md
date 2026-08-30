# Gospel Break Chain Ministry

Site vitrine et espace d’administration du **Gospel Break Chain Ministry**, un ministère chrétien envoyé sur le terrain pour annoncer l’Évangile, accompagner les personnes vulnérables et soutenir les communautés difficiles d’accès.

## Positionnement

Gospel Break Chain Ministry n’est pas une église locale. Le site présente un ministère consacré principalement à :

- l’évangélisation et les missions sur le terrain ;
- les peuples non atteints et les zones difficiles d’accès ;
- la scolarisation et la prise en charge des orphelins et demi-orphelins victimes de guerre ;
- la relation d’aide chrétienne ;
- l’accompagnement spirituel, émotionnel et psychologique ;
- la prière et le soutien des équipes missionnaires.

## Site public

L’accueil est organisé autour de :

- Hero et appel à la mission ;
- À propos (`#a-propos`) ;
- Mission, vision et présentation de l’Évangile ;
- Domaines de service (`#ministeres`) ;
- Pasteur Jean Emmanuel (`#pasteur`) ;
- Projets à soutenir ;
- Impact / actions réalisées ;
- Témoignages ;
- Appel à la prière ;
- Contact (`#contact`) ;
- Soutien de la mission.

La navbar est fixe et les ancres tiennent compte de sa hauteur.

## SEO et performance

Le frontend dispose maintenant d’un socle SEO technique :

- titre et description adaptés à chaque route publique ;
- balises Open Graph et Twitter Card ;
- URL canonique générée à partir de l’origine réelle du site ;
- `robots` avec `noindex` pour les routes inconnues ;
- données structurées JSON-LD `Organization` et `WebSite` ;
- `robots.txt` généré au build ;
- sitemap XML généré automatiquement lorsque `VITE_SITE_URL` est défini ;
- manifest web ;
- cache mémoire de la configuration publique de l’organisation pendant 60 secondes afin d’éviter les requêtes répétées depuis le header, footer et contenu de page.

Avant le déploiement, définir `VITE_SITE_URL` avec le vrai domaine HTTPS dans l’environnement de production. Sans cette variable, le build n’invente pas de domaine et génère seulement un `robots.txt` sans déclaration de sitemap.

```bash
VITE_SITE_URL=https://votre-domaine.tld
npm run build
```

## Actions et projets

Les principaux axes éditoriaux sont :

1. **Évangélisation & missions** — aller vers les peuples non atteints.
2. **Enfance & solidarité** — redonner un avenir aux enfants vulnérables.
3. **Relation d’aide chrétienne** — écouter, accompagner et restaurer.

Les projets comprennent notamment le parrainage d’enfants, les missions auprès des non-atteints et le soutien à la relation d’aide.

## Prière et accompagnement

Une demande de prière est enregistrée par l’API. Après une soumission réussie, une popup demande : **« Avez-vous besoin d’assistance ? »**. Le visiteur peut poursuivre sur WhatsApp ou fermer la popup et rester sur le formulaire.

Le bouton **Besoin d’aide ?** est accessible directement depuis la navbar.

## Modules supprimés

Les anciens modules **Prédications** et **Galerie** ont été retirés globalement : navigation, API frontend, routes backend, CRUD d’administration, données de seed et tables dédiées. La migration `004_remove_obsolete_content_modules.sql` supprime les tables `sermons` et `gallery_items` après vérification de leurs dépendances.

La section autonome **Pillars** n’existe plus ; les éléments pertinents sont intégrés dans le positionnement et la section À propos.

## Stack

- Frontend : React + Vite
- Backend : PHP natif
- Base de données : MySQL
- Paiement : module Genius Pay existant

## Structure

```text
church/
├── frontend/
│   ├── src/site/
│   │   ├── MinistryHome.jsx
│   │   ├── PrayerPage.jsx
│   │   ├── components.jsx
│   │   └── pages/
│   └── package.json
├── backend/
│   ├── public/index.php
│   └── src/
└── database/
    ├── schema.sql
    └── migrations/
```

## Installation locale

Prérequis : Git, Node.js, npm, PHP 8.x et MySQL/MariaDB.

```bash
git clone https://github.com/Mr-Josh/church.git
cd church
cd frontend
npm install
npm run dev
```

Backend :

```bash
cd backend
php -S 127.0.0.1:8000 -t public
```

Par défaut, l’API utilise `http://localhost:8000/api` et le frontend Vite utilise son port de développement configuré.

## Vérifications frontend

```bash
cd frontend
npm install
npm run build
```

Pour prévisualiser le build :

```bash
npm run preview
```

## Git

Les nouveaux développements du site du ministère sont réalisés directement sur `main` dans le dépôt de référence.
