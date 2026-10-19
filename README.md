# 🌳 Misisa (Généalogie & Racines)

**Misisa** est une plateforme web moderne et immersive permettant d'enregistrer, d'explorer et de préserver la mémoire familiale à travers des arbres généalogiques multi-générationnels. L'arbre est matérialisé visuellement sous la forme de **racines et branches d'arbres organiques** en Canvas 2D, reliant les générations avec élégance et fluidité.

---

## 📑 Sommaire
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Stack Technique](#-stack-technique)
- [Architecture de Déploiement](#-architecture-de-déploiement)
- [Guide de Déploiement sur VPS Ubuntu 24.04 LTS](#-guide-de-déploiement-sur-vps-ubuntu-2404-lts)
  - [1. Prérequis & Mise à jour du système](#1-prérequis--mise-à-jour-du-système)
  - [2. Installation de Docker & Docker Compose sur Ubuntu 24.04](#2-installation-de-docker--docker-compose-sur-ubuntu-2404)
  - [3. Sécurisation du pare-feu UFW](#3-sécurisation-du-pare-feu-ufw)
  - [4. Déploiement du projet & Configuration](#4-déploiement-du-projet--configuration)
  - [5. Démarrage des Conteneurs](#5-démarrage-des-conteneurs)
  - [6. Configuration SSL / HTTPS avec Let's Encrypt](#6-configuration-ssl--https-avec-lets-encrypt)
  - [7. Sauvegarde et Restauration PostgreSQL 17](#7-sauvegarde-et-restauration-postgresql-17)
  - [8. Maintenance & Mises à jour](#8-maintenance--mises-à-jour)
- [Démarrage en Développement Local (sans Docker)](#-démarrage-en-développement-local-sans-docker)
- [Pipeline CI/CD GitHub Actions vers le VPS](#-pipeline-cicd-github-actions-vers-le-vps)
- [Tests Utilitaires & Automatisation](#-tests-utilitaires--automatisation)
- [Structure du Projet](#-structure-du-projet)

---

## 🌟 Fonctionnalités Principales

- 🌿 **Spatial Canvas 2D Organique** : Visualisation continue avec courbes de Bézier cubiques reliant les unions parentales aux enfants, imitant la croissance naturelle d'un arbre et de ses racines.
- 📐 **Algorithme de Mise en Page Hiérarchique Anti-Enjambement** : Positionnement strict par génération, regroupement atomique des conjoints et alignement parfait des fratries sans croisement de branches.
- 🧬 **Règles Biologiques & Validation Généalogique** :
  - Calcul dynamique de l'âge (aucun stockage d'âge fixe en BDD).
  - Écart biologique minimal de 12 ans entre la mère et l'enfant à la naissance.
  - L'enfant ne peut être plus âgé que ses parents.
  - Filiation unique (un individu n'a qu'un couple parental).
  - Union unique (un individu n'appartient qu'à une seule union active).
- 📸 **Galerie de Souvenirs Cloudinary** : Carrousel photo par membre (jusqu'à 10 photos) avec téléversement direct sécurisé (Unsigned Upload Preset) et suppression synchronisée.
- 🔐 **Système de Rôles Sécurisé (RBAC)** :
  - `ADMIN` : Propriétaire du patriarche/famille.
  - `EDITOR` (Usage Unique) : Invité autorisé à ajouter un membre ou une union. Dès l'enregistrement ou l'annulation, les droits d'édition sont automatiquement révoqués en rôle `VIEWER`.
  - `VIEWER` : Consultation seule en lecture.
- 🔒 **Chiffrement au Repos** : Chiffrement symétrique réversible (Fernet / AES-128-CBC) des annotations sensibles (ex: filiation confidentielle).

---

## 🛠️ Stack Technique

| Composant | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Radix), Lucide React |
| **State & Navigation** | TanStack React Query, Zustand (pan & zoom spatial), React Router 7 |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2, Pydantic 2, Uvicorn |
| **Base de Données** | **PostgreSQL 17** (support natif UUID, contraintes d'intégrité relationnelle) |
| **Stockage Médias** | Cloudinary (Upload direct non signé côté client + SDK Python d'administration) |
| **Sécurité & Auth** | JSON Web Tokens (PyJWT), Hachage de mot de passe Bcrypt, Chiffrement Fernet |
| **Conteneurisation** | Docker, Docker Compose, Nginx (serveur web & reverse proxy) |

---

## 🏛️ Architecture de Déploiement

```
                             [ Utilisateurs / Navigateurs ]
                                           │
                                           ▼ HTTP (80) / HTTPS (443)
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Serveur VPS (Ubuntu 24.04 LTS)                                                   │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │ Conteneur Nginx (Frontend) - Port 80 / 443                                 │  │
│  │  - Distribution des fichiers statiques du SPA React (dist/)                │  │
│  │  - Compression Gzip & En-têtes de sécurité                                 │  │
│  │  - Reverse Proxy transparent : /auth, /family, /persons, /photos, /unions  │  │
│  └─────────────────────────────────────┬──────────────────────────────────────┘  │
│                                        │ Réseau Docker interne (misisa_network)  │
│                                        ▼ Port 8000                               │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │ Conteneur FastAPI (Backend)                                                │  │
│  │  - Logique métier N-Tier (Controllers / Services / Repositories)           │  │
│  │  - Hachage Bcrypt, JWT & Chiffrement Fernet                                │  │
│  └─────────────────────────────────────┬──────────────────────────────────────┘  │
│                                        │ Port 5432                               │
│                                        ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │ Conteneur PostgreSQL 17 (Database)                                         │  │
│  │  - Volume persistant : misisa_postgres_data                                │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Guide de Déploiement sur VPS Ubuntu 24.04 LTS

Ce guide fournit l'ensemble des instructions pour déployer Misisa en production sur un serveur VPS fraîchement installé sous **Ubuntu 24.04 LTS**.

### 1. Prérequis & Mise à jour du système

Connectez-vous à votre VPS en SSH :
```bash
ssh utilisateur@ip_de_votre_vps
```

Mettez à jour les dépôts et les paquets existants :
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw htop ca-certificates gnupg lsb-release
```

---

### 2. Installation de Docker & Docker Compose sur Ubuntu 24.04

Ubuntu 24.04 (Noble Numbat) nécessite le dépôt officiel Docker pour disposer de la version la plus stable et performante de Docker Engine et du plugin Compose :

```bash
# 1. Ajout de la clé GPG officielle de Docker
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 2. Ajout du dépôt Docker officiel pour Ubuntu 24.04
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Installation de Docker Engine et Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Autoriser votre utilisateur à exécuter Docker sans sudo (optionnel)
sudo usermod -aG docker $USER
# Appliquer immédiatement le changement de groupe :
newgrp docker

# 5. Vérifier la bonne installation
docker --version
docker compose version
```

---

### 3. Sécurisation du pare-feu UFW

Configurez le pare-feu `ufw` pour autoriser uniquement SSH et les flux web (HTTP et HTTPS) :

```bash
# Autoriser le port SSH (TRÈS IMPORTANT pour ne pas être déconnecté)
sudo ufw allow OpenSSH

# Autoriser les ports HTTP (80) et HTTPS (443)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le pare-feu
sudo ufw --force enable
sudo ufw status
```

---

### 4. Déploiement du projet & Configuration

Clonez votre dépôt sur le serveur (dans `/var/www/misisa` ou dans le dossier personnel) :

```bash
# Exemple de clonage
git clone https://github.com/votre-compte/roots.git misisa
cd misisa

# Créer le fichier d'environnement de production
cp .env.example .env
```

Éditez le fichier `.env` avec `nano` pour définir vos secrets de production :
```bash
nano .env
```

Assurez-vous de configurer :
1. **`POSTGRES_PASSWORD`** : Un mot de passe très robuste.
2. **`JWT_SECRET`** : Une chaîne aléatoire longue de 64 caractères (générable via `openssl rand -hex 32`).
3. **`ENCRYPTION_KEY`** : Une autre clé secrète longue pour le chiffrement des données de filiation.
4. **`CLOUDINARY_*`** : Vos identifiants Cloudinary pour l'hébergement des photos de famille.
5. **`VITE_API_URL`** : Laissez cette variable vide pour que Nginx gère le reverse proxy en interne.

---

### 5. Démarrage des Conteneurs

Compilez les images et démarrez les services en tâche de fond :

```bash
docker compose up -d --build
```

Vérifiez l'état des conteneurs :
```bash
docker compose ps
```
Vous devriez voir les trois services en état `Up` :
- `misisa_db` (PostgreSQL 17, `healthy`)
- `misisa_backend` (FastAPI)
- `misisa_frontend` (Nginx + React SPA)

Pour consulter les logs en temps réel :
```bash
docker compose logs -f
```

À ce stade, l'application est accessible directement sur votre navigateur en saisissant l'adresse IP de votre VPS : `http://votre_ip_vps`.

---

### 6. Configuration SSL / HTTPS avec Let's Encrypt

Pour activer le protocole sécurisé HTTPS avec un nom de domaine (ex: `arbre.mondomaine.com`) :

#### Option A : Nginx sur l'hôte en amont de Docker (Recommandée & Standard)
Installez Certbot et Nginx sur l'hôte VPS :
```bash
sudo apt install -y certbot python3-certbot-nginx nginx
```

Créez une configuration Nginx sur l'hôte `/etc/nginx/sites-available/misisa` :
```nginx
server {
    server_name arbre.mondomaine.com;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activez le site et obtenez votre certificat Let's Encrypt :
```bash
sudo ln -s /etc/nginx/sites-available/misisa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtention et installation automatique du certificat SSL
sudo certbot --nginx -d arbre.mondomaine.com
```

Certbot renouvellera automatiquement le certificat tous les 90 jours.

---

### 7. Sauvegarde et Restauration PostgreSQL 17

Le volume Docker `misisa_postgres_data` persiste les données. Pour créer des sauvegardes régulières :

#### Créer une sauvegarde (Dump SQL compressé)
```bash
# Sauvegarde horodatée
docker exec -t misisa_db pg_dump -U misisa_user -d misisa_db | gzip > "backup_misisa_$(date +%Y%m%d_%H%M%S).sql.gz"
```

#### Restaurer une sauvegarde
```bash
gunzip -c backup_misisa_YYYYMMDD_HHMMSS.sql.gz | docker exec -i misisa_db psql -U misisa_user -d misisa_db
```

#### Automatiser la sauvegarde quotidienne (Cron)
Ajoutez une ligne dans `crontab -e` :
```cron
0 3 * * * docker exec -t misisa_db pg_dump -U misisa_user -d misisa_db | gzip > /var/backups/misisa_$(date +\%Y\%m\%d).sql.gz
```

---

### 8. Maintenance & Mises à jour

Pour mettre à jour l'application suite à de nouvelles modifications Git :

```bash
cd /chemin/vers/misisa

# 1. Récupérer le code à jour
git pull origin main

# 2. Reconstruire et redémarrer les conteneurs sans coupure prolongée
docker compose up -d --build

# 3. Nettoyer les anciennes images inutilisées
docker image prune -f
```

---

## 💻 Démarrage en Développement Local (sans Docker)

Si vous souhaitez exécuter le projet en local sur votre poste de travail :

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # ou .venv\Scripts\activate sous Windows
pip install -r requirements.txt
cp .env.example .env
# Démarrer le serveur
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Démarrer le serveur Vite
npm run dev
```
Accédez au frontend sur `http://localhost:5173` et à la documentation API sur `http://localhost:8000/docs`.

## 🤖 Pipeline CI/CD GitHub Actions vers le VPS

Le projet inclut une chaîne CI/CD complète dans [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) :
1. **Intégration Continue (CI)** :
   - Installation et exécution de la suite de tests unitaires backend (`python -m unittest discover`).
   - Validation du typage et compilation de production du frontend React (`npm ci` & `npm run build`).
2. **Déploiement Continu (CD)** :
   - Déclenché automatiquement lors de chaque `push` sur la branche `main` (ou manuellement via l'onglet *Actions* de GitHub).
   - Connexion SSH sécurisée au serveur VPS Ubuntu 24.04 via `appleboy/ssh-action`.
   - Récupération du code à jour (`git fetch origin main && git reset --hard origin/main`).
   - Reconstruction optimisée et redémarrage des conteneurs (`docker compose up -d --build`).
   - Nettoyage des anciennes images Docker (`docker image prune -f`).

### Configuration des Secrets GitHub
Dans votre dépôt GitHub, rendez-vous dans **Settings** > **Secrets and variables** > **Actions** et ajoutez les secrets suivants :

| Secret | Description | Exemple |
|---|---|---|
| `VPS_HOST` | Adresse IP ou nom d'hôte de votre VPS | `51.159.20.120` |
| `VPS_USER` | Utilisateur SSH disposant des droits Docker | `ubuntu` ou `root` |
| `VPS_SSH_KEY` | Clé privée SSH (sans passphrase) | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `VPS_PORT` | Port SSH (optionnel, 22 par défaut) | `22` |
| `APP_DIR` | Chemin d'accès au projet sur le VPS | `/var/www/misisa` |

---

## 🧪 Tests Utilitaires & Automatisation

Le dossier `backend/tests/` regroupe les tests automatisés vérifiant la robustesse des fonctionnalités critiques :
- **`test_family_layout.py`** : Validation du positionnement hiérarchique, alignement des générations, contiguïté stricte des couples et garantie absolue anti-enjambement des fratries.
- **`test_encryption.py`** : Chiffrement et déchiffrement Fernet (AES) au repos, préservation des valeurs vides et repli tolérant.
- **`test_jwt_security.py`** : Hachage Bcrypt, vérification de mots de passe, génération et décodage des jetons JWT d'accès et de rafraîchissement.
- **`test_person_dto.py`** : Calcul dynamique de l'âge (individus vivants, date de décès, gestion des jours et mois de naissance).

### Exécuter les tests localement
```bash
cd backend
python -m unittest discover -s tests -p "test_*.py" -v
```

---

## 📂 Structure du Projet

```
roots/
├── backend/                  # API RESTful FastAPI (Python 3.12)
│   ├── config/               # Configuration DB & Cloudinary
│   ├── controller/           # Endpoints de l'API
│   ├── dto/                  # Schémas Pydantic & validation
│   ├── entity/               # Modèles SQLAlchemy (PostgreSQL 17)
│   ├── exception/            # Gestion centralisée des erreurs
│   ├── repository/           # Couche d'accès aux données
│   ├── security/             # JWT, Bcrypt, Chiffrement Fernet
│   ├── service/              # Logique métier & mise en page arbre
│   ├── Dockerfile            # Image Docker backend
│   ├── requirements.txt      # Dépendances Python
│   └── README.md             # Documentation détaillée du backend
├── frontend/                 # Application SPA React 19 + TypeScript
│   ├── public/               # Fichiers statiques publics
│   ├── src/                  # Composants, hooks, pages, canvas 2D
│   ├── nginx.conf            # Configuration Nginx de production
│   ├── Dockerfile            # Image Docker multi-stage frontend
│   ├── package.json          # Dépendances npm & scripts
│   └── README.md             # Documentation détaillée du frontend
├── docker-compose.yml        # Orchestration PostgreSQL 17 + Backend + Frontend
├── .env.example              # Modèle de configuration globale
├── specifications.md         # Spécifications fonctionnelles initiales
└── README.md                 # Ce document
```

---

## 📄 Licence & Droits
Tous droits réservés © 2026 - **Mulunda Community - Go Beyond What You See**.
