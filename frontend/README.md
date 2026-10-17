# 🌳 Misisa - Frontend (React + TypeScript + Vite)

Interface utilisateur immersive pour la visualisation et l'exploration d'arbres généalogiques multi-générationnels sous forme de **racines et branches organiques**, propulsée par **React 19**, **TypeScript**, **Vite** et **Tailwind CSS**.

---

## ✨ Fonctionnalités & Expérience Visuelle

- 🌿 **Spatial Canvas 2D Interactif** : Moteur de rendu graphique personnalisé traçant des branches et des racines naturelles en courbes de Bézier cubiques (`bezierCurveTo`) reliant unions et enfants.
- 📐 **Mise en page hiérarchique automatique** : Algorithme de positionnement intelligent garantissant l'alignement strict des générations, l'atomicité des couples mariés et l'absence totale d'enjambements ou de croisements de lignes.
- 🔍 **Navigation spatiale fluide** : Panoramique par glisser-déposer (pan) et zoom continu avec mémorisation de l'état via **Zustand**.
- 📸 **Carrousel de souvenirs (Cloudinary)** : Galerie photos par individu (jusqu'à 10 photos) avec téléversement direct et non signé côté client vers Cloudinary.
- 🎨 **Direction artistique "Cocon de Souvenirs"** : Teintes parchemin et écorce (`#FDFBF7`, `#3B2314`, `#5C3A21`), combinées aux polices nobles *Playfair Display* et *Plus Jakarta Sans*.
- 🛡️ **Gestion dynamique des rôles (RBAC)** :
  - Formulaire contextuel lors de l'arrivée par code d'édition invité.
  - Bascule instantanée du rôle d'éditeur en simple spectateur (`VIEWER`) dès l'enregistrement ou l'annulation d'un ajout.
  - Masquage automatique des boutons d'action d'ajout pour les lecteurs.

---

## 🏗️ Structure du Projet

```
frontend/src/
├── components/
│   ├── canvas/             # Spatial Canvas 2D (moteur de tracé des racines et cartes)
│   ├── drawer/             # Panneau coulissant (fiche détaillée du membre, carrousel photo)
│   ├── forms/              # Formulaires (ajout membre, création union, rattachement enfant)
│   ├── navbar/             # Barre de navigation supérieure
│   └── ui/                 # Composants d'interface réutilisables (shadcn/ui / Radix)
├── hooks/
│   └── useFamilyTree.ts    # Requêtes et mutations React Query synchronisées avec l'API
├── pages/
│   ├── DashboardPage.tsx   # Liste et gestion des familles
│   ├── FamilyTreeCanvasPage.tsx # Vue plein écran de l'arbre généalogique
│   ├── JoinTreePage.tsx    # Rejoindre via un code d'invitation (lecture ou édition)
│   ├── LoginPage.tsx       # Connexion utilisateur
│   └── RegisterPage.tsx    # Inscription
├── services/
│   ├── api.ts              # Client Axios configuré avec intercepteurs JWT & switch de rôle
│   └── cloudinary.ts       # Service d'upload unsigned vers l'API Cloudinary
├── store/
│   ├── useAuthStore.ts     # État global utilisateur et persistance du token
│   ├── useModalStore.ts    # Modales de confirmation et alertes globales
│   └── useTreeStore.ts     # Coordonnées de panoramique (x, y) et échelle de zoom
└── utils/
    └── treeLayout.ts       # Algorithme de calcul des coordonnées hiérarchiques
```

---

## ⚙️ Variables d'Environnement (`.env`)

| Variable | Description | Valeur par défaut / Exemple |
|---|---|---|
| `VITE_API_URL` | URL de l'API Backend | Vide en production Docker (géré par Nginx), ou `http://127.0.0.1:8000` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud Name Cloudinary | `demo` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Preset d'upload non signé | `genealogie_unsigned` |

---

## 💻 Démarrage Local (Développement)

### 1. Prérequis
- **Node.js** v20.x ou v22.x
- **npm** v10+

### 2. Installation
```bash
# Se placer dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Créer votre fichier d'environnement local
cp .env.example .env
```

### 3. Lancer le serveur de développement
```bash
npm run dev
```
L'application démarre sur `http://localhost:5173`. En mode développement, le client Axios redirige automatiquement vers `http://127.0.0.1:8000`.

### 4. Build de production & Lint
```bash
# Vérification du typage TypeScript et compilation Vite
npm run build

# Analyse statique du code (Oxlint)
npm run lint

# Prévisualisation du build de production localement
npm run preview
```

---

## 🐳 Déploiement Conteneurisé avec Nginx

Le `Dockerfile` utilise un build multi-étapes :
1. **Étape 1 (Builder)** : Compilation via `node:22-alpine` générant les assets optimisés dans `/app/dist`.
2. **Étape 2 (Serveur)** : Image ultra-légère `nginx:1.27-alpine` servant les fichiers statiques avec compression gzip et reverse-proxying transparent des requêtes API vers `http://backend:8000`.

```bash
docker build -t misisa-frontend .
docker run -p 80:80 misisa-frontend
```
