# Gospel Break Chain Ministry

> Site vitrine et espace d'administration de **Gospel Break Chain Ministry**.

Le projet fournit à l'église une présence web moderne, claire et accessible, avec un espace privé permettant au pasteur de gérer les contenus et les demandes reçues depuis le site.

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Espace administrateur](#espace-administrateur)
- [Architecture](#architecture)
- [Structure du projet](#structure-du-projet)
- [API](#api)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Déploiement](#déploiement)
- [Sécurité](#sécurité)
- [Paiements et dons](#paiements-et-dons)
- [Communication](#communication)
- [Statut](#statut)

## Présentation

Le site est pensé comme un **site vitrine d'église**, et non comme un réseau social ou une plateforme de messagerie.

Les visiteurs peuvent découvrir l'église, ses missions, ses activités et ses contenus, puis effectuer certaines actions importantes : demander une prière, demander de l'aide, envoyer un témoignage, faire un don ou contacter l'église.

La communication directe reste volontairement orientée vers **WhatsApp** afin de conserver une expérience simple.

Le projet suit une architecture volontairement légère :

- **Frontend :** ReactJS + Vite
- **Backend :** PHP natif / PHP pur
- **Base de données :** MySQL
- **Administration :** un seul utilisateur, le pasteur
- **Paiement :** module prévu mais développé séparément

L'objectif est de ne pas complexifier inutilement l'application avec des microservices ou une infrastructure lourde.

## Fonctionnalités

### Site public

Le site vitrine prévoit notamment :

- Accueil
- Présentation de l'église
- Vision, mission et valeurs
- Ministères
- Programmes et activités
- Événements
- Enseignements / contenus spirituels
- Témoignages
- Faire un don
- Demande de prière
- Demande d'aide
- Contact
- Informations pratiques
- Orientation vers WhatsApp

### Demande de prière

Un visiteur peut transmettre un sujet de prière depuis le site.

Les informations peuvent notamment comprendre :

- nom ;
- numéro de téléphone ;
- adresse e-mail ;
- sujet ;
- message ;
- caractère confidentiel ;
- caractère urgent.

La demande est enregistrée par l'API et devient disponible dans l'administration du pasteur.

### Demande d'aide

Le visiteur peut également envoyer une demande d'aide avec ses coordonnées et son message.

L'objectif est de permettre à l'église d'identifier rapidement les demandes nécessitant un accompagnement.

### Témoignages

Les visiteurs peuvent soumettre un témoignage. Celui-ci n'est pas publié automatiquement : il passe par l'espace d'administration pour être modéré avant publication.

### Faire un don

Une page dédiée aux dons est prévue dans le site vitrine. L'intégration du prestataire de paiement est volontairement séparée du reste du développement.

## Espace administrateur

L'administration est conçue pour **le pasteur uniquement**.

Point d'entrée :

```text
/admin/login
```

Après authentification, le pasteur accède à un dashboard centralisé.

### Dashboard

Le dashboard permet de visualiser rapidement :

- les demandes de prière ;
- les demandes d'aide ;
- les témoignages à modérer ;
- l'activité récente ;
- les statistiques principales ;
- les actions prioritaires ;
- les contenus du site ;
- les informations de l'église ;
- les paramètres d'administration.

L'interface a été pensée pour être **aérée, lisible et orientée vers les tâches prioritaires**, plutôt que de reproduire un dashboard générique surchargé.

### Modules d'administration

```text
Dashboard
├── Demandes de prière
├── Demandes d'aide
├── Témoignages
├── Contenu du site
├── Informations de l'église
├── Paramètres
└── Déconnexion
```

Le module de paiement/don reste volontairement séparé et n'est pas utilisé comme une fonctionnalité administrative dépendante du dashboard actuel.

## Architecture

```text
                         VISITEURS
                             │
                             ▼
                    ┌─────────────────┐
                    │ React + Vite    │
                    │ Site vitrine    │
                    │ + Administration│
                    └────────┬────────┘
                             │ HTTPS / API
                             ▼
                    ┌─────────────────┐
                    │   PHP natif     │
                    │    REST API     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      MySQL      │
                    │     church      │
                    └─────────────────┘
```

### Pourquoi un monolithe ?

Le projet est volontairement construit en monolithe pour rester simple à développer et à maintenir.

Il n'y a pas besoin, à ce stade, de microservices, de RabbitMQ, de Redis ou d'une architecture distribuée : le besoin principal est un site institutionnel avec un espace d'administration limité à un seul utilisateur.

Cette approche permet de garder :

- une base de code compréhensible ;
- un déploiement simple ;
- une maintenance réduite ;
- peu de dépendances infrastructurelles ;
- une évolution progressive si les besoins augmentent.

## Structure du projet

```text
church/
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminRequestsPage.jsx
│   │   │   ├── AdminContentPage.jsx
│   │   │   ├── AdminResourcePage.jsx
│   │   │   └── admin.css
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── config/
    ├── public/
    │   └── index.php
    └── src/
```

## API

Quelques routes principales utilisées par le frontend :

```text
GET  /api/health

POST /api/auth/login
POST /api/auth/logout

GET  /api/admin/dashboard

POST /api/prayer-requests
POST /api/help-requests
POST /api/testimonials
```

Le backend contient également les routes nécessaires à la gestion des ressources de l'administration.

## Installation locale

### Prérequis

- Git
- Node.js
- npm
- PHP 8.x
- MySQL ou MariaDB

### Cloner le dépôt

```bash
git clone https://github.com/Mr-Josh/church.git
cd church
```

### Installer le frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend est généralement accessible sur :

```text
http://localhost:5173
```

### Lancer le backend

Dans un second terminal :

```bash
cd backend
php -S 127.0.0.1:8000 -t public
```

L'API est alors disponible sur :

```text
http://127.0.0.1:8000/api
```

### Base MySQL

Créer la base de données :

```sql
CREATE DATABASE church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Puis importer le schéma et les données SQL fournis par le projet, selon les fichiers présents dans le dépôt.

## Variables d'environnement

### Frontend

Le frontend utilise :

```text
VITE_API_URL
```

En local :

```text
VITE_API_URL=http://localhost:8000/api
```

En production, cette variable doit pointer vers l'URL HTTPS du backend PHP.

### Backend

La configuration du backend doit notamment prévoir :

```text
APP_ENV
APP_URL
CORS_ORIGIN
DB_HOST
DB_PORT
DB_DATABASE
DB_USERNAME
DB_PASSWORD
```

Les secrets et identifiants ne doivent pas être commités dans Git.

## Déploiement

### Frontend — Vercel

Le frontend React/Vite peut être déployé sur Vercel.

Configuration recommandée :

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Variable de production :

```text
VITE_API_URL=https://<domaine-api>/api
```

### Backend — PHP + MySQL

Le backend doit être déployé sur un hébergement compatible avec PHP et MySQL.

Vercel est utilisé pour le frontend React ; le backend reste un serveur PHP classique.

Architecture de production :

```text
                    INTERNET
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
      VERCEL                   SERVEUR PHP
   React + Vite                  REST API
          │                         │
          └──────── HTTPS ──────────┘
                                    │
                                    ▼
                                  MySQL
```

## Sécurité

Le projet applique notamment les principes suivants :

- authentification réservée au pasteur ;
- vérification des mots de passe avec `password_verify` ;
- mots de passe destinés à être stockés avec `password_hash` ;
- routes d'administration protégées ;
- secrets backend séparés du frontend ;
- CORS configuré pour le frontend autorisé ;
- HTTPS recommandé en production ;
- identifiants MySQL jamais exposés au navigateur.

## Paiements et dons

La page **Faire un don** fait partie du périmètre fonctionnel du site.

Cependant, l'intégration du paiement est volontairement indépendante du développement actuel. Cela permet d'intégrer ultérieurement le prestataire retenu sans coupler toute l'application à une solution de paiement.

> **Note :** le développement de la partie paiement est réalisé séparément et n'est pas à modifier dans le cadre du travail actuel du frontend/dashboard.

## Communication WhatsApp

Le site ne comporte pas de messagerie interne.

Lorsqu'une communication directe avec l'église est nécessaire, l'utilisateur est orienté vers **WhatsApp**.

Les formulaires de prière et d'aide restent disponibles pour structurer les demandes et permettre au pasteur de les retrouver dans son espace d'administration.

## Principes UX / produit

Le site est conçu autour de quelques principes :

- navigation simple ;
- informations facilement accessibles ;
- appels à l'action clairement visibles ;
- formulaires courts et compréhensibles ;
- communication directe via WhatsApp ;
- administration centralisée ;
- dashboard volontairement aéré ;
- évolution progressive sans sur-architecture.

## Statut du projet

**Projet en développement — V1.**

Les fondations du site vitrine, des formulaires, de l'API et de l'espace d'administration sont en place.

Les éléments liés aux paiements/dons sont prévus mais restent séparés du périmètre d'intégration actuel.

## Modifications de la branche `frontend-dev`

### Section des piliers (`.pillars` / `.pillar-grid`)
- **Séparation de la section Hero** : Suppression de la marge supérieure négative (`margin-top: -48px` et `margin-top: -30px`) sur la classe `.pillars`. La section des piliers est désormais complètement détachée et séparée de la section Hero, avec un espacement uniforme et esthétique de 80px sur desktop et 50px sur mobile/tablette.
- **Centrage du contenu** : Centrage horizontal de la grille des piliers dans sa section. De plus, le contenu de chaque pilier individuel (icône, titre `h3` et description `p`) a été centré grâce à des règles flexbox (`display: flex; flex-direction: column; align-items: center; text-align: center;`) pour un rendu visuel équilibré et premium.
- **Ajout d'un titre de section** : Intégration du composant `<SectionTitle>` avec le sur-titre (eyebrow) `"NOS PILIERS"` et le titre `"Les fondements de notre foi"` juste au-dessus de la grille des piliers pour structurer et introduire élégamment cette partie de la page d'accueil.

### Barre de navigation (`fixed-navbar.css`)
- **Correction de l'espace vide sous la navbar** : Ajustement du `padding-top` sur l'élément `main` (réduit à `84px` sur desktop et `68px` sur mobile au lieu de `122px` et `102px` respectively) suite à la mise en commentaire de la barre supérieure (`topbar`). Cela a permis de supprimer la zone vide indésirable qui flottait sous la barre de navigation fixe.

### Section Hero (`hero-logo-fix.css` / `responsive.css`)
- **Correction du débordement sur mobile** : Séparation des styles de `.hero-home` (page d'accueil) et `.page-hero` (pages internes) sous la règle mobile `max-width: 780px`. Auparavant, une hauteur contrainte de 430px (`min-height: 430px!important`) forçait le contenu de l'accueil (titre, verset biblique long et boutons CTA empilés) à déborder et à chevaucher la section des piliers. La page d'accueil utilise désormais `min-height: 680px!important` et `height: auto!important` sur mobile afin que la hauteur s'adapte dynamiquement et proprement au volume de contenu.

### Suppression des bannières Hero sur les pages internes (`InteractionPages.jsx` / `ContentPages.jsx`)
- **Retrait global de la bannière Hero** : Le composant `PageHero` (qui affichait un grand bandeau bleu foncé avec arrière-plan, image de marque et verset dynamique) a été retiré de l'ensemble des pages internes (À propos, Pasteur, Ministères, Programmes, Événements, Prédications, Galerie, Témoignages, Prière, Évangélisation, Aide, Contact, Dons).
- **Remplacement par des titres épurés** : Chaque page interne affiche désormais à la place un titre sobre et élégant via le composant `<SectionTitle>` enveloppé dans un conteneur (`.container`) avec un décalage vertical (`padding-top: 50px`). Cela rend le site plus léger, plus moderne et recentre l'attention sur le contenu spécifique de chaque page, tout en conservant la bannière Hero exclusive sur la page d'accueil.

### Défilement automatique vers le haut lors de la navigation (`AppEntry.jsx`)
- **Problème corrigé** : En cliquant sur un lien dans le pied de page (footer), l'utilisateur était bien redirigé vers la bonne page mais restait positionné au bas de la page (là où il se trouvait avant de cliquer), ce qui donnait une expérience désagréable.
- **Solution** : Ajout d'un composant `<ScrollToTop>` dans `AppEntry.jsx`. Ce composant écoute les changements de route via le hook `useLocation` de React Router et exécute `window.scrollTo(0, 0)` à chaque changement d'URL, forçant ainsi la page à revenir en haut à chaque navigation.

## Dépôt

Repository : `Mr-Josh/church`

Projet réalisé pour la présence numérique de **Gospel Break Chain Ministry**.
