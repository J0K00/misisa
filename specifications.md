# 🌳 Instructions System & Lignes Directrices pour l'Application : "Généalogie & Racines"

## 🎯 Objectif du Projet
Développer une application web moderne multi-tenant permettant d'enregistrer, d'explorer et de visualiser dynamiquement des arbres généalogiques de génération en génération. 

L'application doit supporter :
1. La gestion de plusieurs familles distinctes (chacune ayant son propre espace/arbre).
2. Un rendu visuel immersif sous forme de **racines et branches d'arbres organiques** (Canvas 2D / SVG / D3.js).
3. La création de membres avec calcul automatique de l'âge.
4. L'enregistrement des membres structuré autour des **unions** (horizontales : mariages/partenariats ; verticales : naissances/enfants).
5. Un **carrousel de photos de souvenirs** par membre (jusqu'à 10 photos max) hébergé via Cloudinary.

---

## 🛠️ Stack Technique & Bibliothèques

* **Backend :** FastAPI (Python) avec SQLAlchemy & Pydantic.
* **Base de Données :** PostgreSQL (support natif UUID, requêtes récursives `WITH RECURSIVE`).
* **Frontend :** React + TypeScript (bundler Vite).
* **Styling & UI :** Tailwind CSS + shadcn/ui (Radix UI) + Lucide React (Icônes).
* **Stockage Média :** Cloudinary (Upload Direct Unsigned côté Client + SDK Python côté serveur pour suppression).
* **State Management & Data Fetching :** TanStack Query (React Query) + Zustand (pour le pan/zoom de l'arbre).

---

## 🎨 Direction Artistique & System Design

### 1. Palette de Couleurs : "Cocon de Souvenirs"
Atmosphère chaleureuse, organique et mémorable évoquant le parchemin ancien, le bois et la nature :
* **Parchemin / Fond principal :** `#FDFBF7` (`bg-parchemin-50`), `#F4EFE6` (`parchemin-100`)
* **Texte / Écorce sombre :** `#2A2421` (`stone-900`), `#4A3E3D` (`stone-800`)
* **Bois Noir / Accents primaires :** `#3B2314` (`amber-950`), `#5C3A21` (`amber-900`), `#8B5A2B` (`amber-800`)
* **Feuillage / Touches naturelles :** `#2E5A27` (`emerald-900`), `#487042` (`emerald-800`)

### 2. Typographie : "Racines & Héritage Noble"
* **Titres & Noms de Famille :** `Playfair Display` (Serif moderne, élégante et historique).
* **Textes, Formulaires, Cartes & UI :** `Plus Jakarta Sans` (Sans-Serif épurée, lisibilité maximale).

---

## 🏗️ Architecture & Structure des Données

### 1. Modèle Conceptuel de Données (MCD)
* **Family (Arbre Familial) :** `id` (UUID), `name`, `invite_code` (8 caractères uniques), `created_at`.
* **Person (Individu) :** `id` (UUID), `family_id` (FK), `first_name`, `last_name`, `birth_date`, `death_date` (nullable), `gender`.
* **PersonPhoto (Galerie Souvenirs) :** `id` (UUID), `person_id` (FK), `url`, `public_id` (Cloudinary), `display_order`, `created_at`. *(Max 10 photos par membre)*.
* **Union (Lien Horizontal) :** `id` (UUID), `partner_1_id` (FK), `partner_2_id` (FK, nullable), `marriage_date` (nullable), `divorce_date` (nullable).
* **UnionChildren (Lien Vertical) :** `union_id` (FK), `child_id` (FK).

### 2. Règle Métier pour le Calcul de l'Âge
* Ne **jamais** stocker l'âge en BDD.
* **Calcul automatique dans le Schema Pydantic / DTO :**
  * Si `death_date` est présent : Âge au décès = `death_date` - `birth_date`.
  * Si `death_date` est `null` : Âge actuel = `date_courante` - `birth_date`.

---

## 📸 Gestion des Photos & Intégration Cloudinary

### 1. Workflow d'Upload Direct (Client-Side Unsigned)
1. Le client React envoie le fichier directement à l'API Cloudinary via un *Unsigned Upload Preset* (`genealogie_unsigned`).
2. Cloudinary retourne la `secure_url` et le `public_id`.
3. React envoie ces métadonnées à l'endpoint FastAPI `/persons/{person_id}/photos`.

### 2. Contraintes & Fonctionnalités Backend
* Validation de la limite stricte de **10 photos maximum** par membre lors de la tentative d'ajout.
* Endpoint `DELETE /persons/{person_id}/photos/{photo_id}` : FastAPI utilise le SDK `cloudinary.uploader.destroy(public_id)` pour nettoyer Cloudinary avant d'effacer la ligne en BDD.

---

## 📐 Spécifications Graphiques & UI/UX (Spatial Canvas)

1. **Représentation des Racines (Canvas 2D / CustomPainter / SVG) :**
   * Courbes de Bézier cubiques (`bezierCurveTo` / `cubicTo`) simulant des branches et racines naturelles reliant les parents aux unions, et les unions aux enfants.
   * Épaisseur variable des lignes (plus épaisse au niveau du tronc/union, s'affinant vers les branches).

2. **Structure des Pages React :**
   * `/` : Landing Page & Rejoindre/Se connecter.
   * `/dashboard` : Galerie des familles de l'utilisateur (Créer / Rejoindre avec code).
   * `/family/:familyId` : **Vue Spatial Canvas** (100vh) avec Pan/Zoom, Header flottant et Panneau latéral coulissant (*Sheet* - `shadcn/ui`) pour afficher les détails du membre et son carrousel photo.
   * `/family/:familyId/members` : Table de données interactive pour la recherche et le filtrage.

---

## 📋 Feat & Tasks Prioritaires pour Antigravity

1. **[Backend] - Database & Schemas :**
   * Créer les tables PostgreSQL (`families`, `persons`, `person_photos`, `unions`, `union_children`).
   * Configurer FastAPI, SQLAlchemy et Pydantic avec calcul dynamique de l'âge.
2. **[Backend] - Cloudinary Photos Endpoints :**
   * Implémenter POST et DELETE `/persons/{person_id}/photos` avec vérification de la limite de 10 photos et SDK Cloudinary.
3. **[Frontend] - Setup & Design System :**
   * Initialiser React + Vite + Tailwind CSS + shadcn/ui.
   * Configurer les polices Google Fonts (*Playfair Display* & *Plus Jakarta Sans*) et les variables de couleurs *Cocon de Souvenirs*.
4. **[Frontend] - Member Photo Carousel :**
   * Créer le composant `MemberPhotoCarousel.tsx` avec prévisualisation, gestion d'upload direct vers Cloudinary et suppression.
5. **[Frontend] - Organic Root Canvas Engine :**
   * Développer le composant de rendu Canvas/SVG reliant les cartes de membres avec des lignes en racines d'arbres.
