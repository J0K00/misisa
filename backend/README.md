# 🌳 Misisa - Backend API (FastAPI)

API RESTful N-Tier moderne développée avec **FastAPI**, **SQLAlchemy** et **PostgreSQL 17**, assurant la persistance des données généalogiques, l'authentification sécurisée, le chiffrement des données sensibles et le calcul dynamique des métriques familiales.

---

## 🏛️ Architecture N-Tier (Repository Pattern)

Le backend suit rigoureusement le modèle en couches pour assurer la séparation des responsabilités, la maintenabilité et la testabilité :

```
[ Requête HTTP ]
       │
       ▼
1. Controllers (`/controller`) ──► Validation des droits (`/security`), extraction DTO
       │
       ▼
2. Services (`/service`)        ──► Logique métier pure, règles de parenté, calculs, Cloudinary
       │
       ▼
3. Repositories (`/repository`) ──► Requêtes SQLAlchemy, transactions base de données
       │
       ▼
4. Entities (`/entity`)         ──► Modèles relationnels PostgreSQL (UUID natifs)
```

### Rôle des dossiers
- **`config/`** : Configuration générale de l'application, initialisation Cloudinary et moteur SQLAlchemy (`database.py`).
- **`controller/`** : Endpoints REST (`auth_controller`, `family_viewer_controller`, `person_admin_controller`, `photo_admin_controller`, `union_controller`).
- **`dto/`** : Schémas Pydantic d'entrée/sortie avec `@computed_field` (calcul de l'âge dynamique sans stockage en base).
- **`entity/`** : Modèles SQLAlchemy (`UserEntity`, `FamilyEntity`, `PersonEntity`, `UnionEntity`, `UnionChildrenEntity`, `PhotoEntity`, `FamilyMembershipEntity`).
- **`exception/`** : Exceptions globales (`NotFoundException`, `ForbiddenException`, `BadRequestException`) mappées en réponses HTTP propres.
- **`repository/`** : Abstraction de la persistance en base.
- **`security/`** : Hachage de mot de passe (`bcrypt`), génération et vérification JWT (`PyJWT`), chiffrement symétrique réversible Fernet (`encryption.py`).
- **`service/`** : Logique métier (calcul de mise en page hiérarchique de l'arbre, gestion des unions et filiations, synchronisation Cloudinary).

---

## 🔐 Sécurité & Règles Métier

1. **Calcul dynamique de l'âge** : L'âge n'est jamais figé en base de données :
   - Personne vivante : $\text{date\_actuelle} - \text{birth\_date}$.
   - Personne décédée : $\text{death\_date} - \text{birth\_date}$.
2. **Règles biologiques & logiques** :
   - Écart minimal de 12 ans entre la mère et l'enfant lors d'une naissance.
   - Un enfant ne peut pas avoir un âge supérieur à ses parents.
   - Unicité de filiation : un membre ne peut être rattaché comme enfant qu'à une seule union.
   - Unicité d'union : un membre ne peut faire partie que d'une seule union.
3. **Contrôle des rôles (RBAC)** :
   - `ADMIN` : Créateur de la famille, droits complets.
   - `EDITOR` : Membre invité avec droit temporaire d'édition.
   - **Révocation automatique** : Dès qu'un éditeur enregistre ou annule l'ajout d'un membre/union, son rôle bascule automatiquement en `VIEWER` (avec émission d'un nouveau jeton via l'en-tête `X-New-Token`).
   - `VIEWER` : Consultation seule.
4. **Chiffrement des données sensibles** :
   - Les informations confidentielles (telles que le champ de filiation optionnel) sont chiffrées au repos via **Fernet (AES-128-CBC)** avec une clé dérivée de `ENCRYPTION_KEY`.

---

## 📡 Endpoints de l'API

### Authentification (`/auth`)
| Méthode | Route | Description |
|---|---|---|
| `POST` | `/auth/register` | Inscription d'un utilisateur |
| `POST` | `/auth/login` | Connexion et obtention des jetons JWT |
| `POST` | `/auth/guest` | Connexion invité avec code d'invitation |
| `POST` | `/auth/guest-downgrade` | Révocation des droits d'édition de l'invité |
| `GET` | `/auth/me` | Profil de l'utilisateur connecté |
| `PUT` | `/auth/me` | Mise à jour du profil |
| `DELETE` | `/auth/me` | Suppression du compte utilisateur |

### Familles & Arbre (`/family`)
| Méthode | Route | Description |
|---|---|---|
| `POST` | `/family/` | Création d'une nouvelle famille (associe le patriarche) |
| `GET` | `/family/my-families` | Liste des familles de l'utilisateur |
| `GET` | `/family/{family_id}/tree` | Données complètes de l'arbre (membres, unions, enfants, rôles) |
| `POST` | `/family/{family_id}/recompute-layout` | Recalcul automatique des coordonnées hiérarchiques |
| `POST` | `/family/{family_id}/memberships/editor-code` | Génération d'un code d'édition temporaire |

### Membres & Individus (`/persons`)
| Méthode | Route | Description |
|---|---|---|
| `POST` | `/persons/` | Ajout d'un individu dans l'arbre |
| `GET` | `/persons/{person_id}` | Détails d'un membre |
| `PUT` | `/persons/{person_id}` | Modification des informations |
| `DELETE` | `/persons/{person_id}` | Suppression d'un membre |

### Unions & Filiations (`/unions`)
| Méthode | Route | Description |
|---|---|---|
| `POST` | `/unions/` | Création d'une union entre deux partenaires |
| `POST` | `/unions/{union_id}/children` | Rattachement d'un enfant à une union |
| `DELETE` | `/unions/{union_id}` | Suppression d'une union |

### Photos de Souvenirs (`/photos`)
| Méthode | Route | Description |
|---|---|---|
| `POST` | `/photos/persons/{person_id}/photos` | Ajout d'une photo Cloudinary (max 10 photos/membre) |
| `DELETE` | `/photos/persons/{person_id}/photos/{photo_id}` | Suppression de la photo en base et sur Cloudinary |

---

## ⚙️ Variables d'Environnement (`.env`)

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL 17 | `postgresql://user:pass@localhost:5432/misisa_db` |
| `JWT_SECRET` | Clé de signature des jetons JWT | `secret_tres_long_et_securise` |
| `ENCRYPTION_KEY` | Clé secrète pour le chiffrement Fernet | `cle_secrete_de_chiffrement` |
| `CLOUDINARY_CLOUD_NAME` | Identifiant de compte Cloudinary | `demo` |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary | `1234567890` |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary | `abcdef123456` |

---

## 💻 Démarrage Local (Développement)

### 1. Prérequis
- Python 3.12 ou supérieur
- Instance PostgreSQL 17 accessible

### 2. Installation
```bash
# Se placer dans le dossier backend
cd backend

# Créer et activer un environnement virtuel
python -m venv .venv
source .venv/bin/activate  # Sur Linux/macOS
# .venv\Scripts\activate   # Sur Windows

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cp .env.example .env
# Renseigner vos accès dans .env
```

### 3. Lancement du serveur
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
L'API est accessible sur `http://127.0.0.1:8000`.
La documentation Swagger interactive est disponible sur `http://127.0.0.1:8000/docs`.

---

## 🐳 Exécution via Docker

```bash
docker build -t misisa-backend .
docker run -p 8000:8000 --env-file .env misisa-backend
```
