# Architecture N-Tier du Backend

Le backend est structuré selon les standards industriels **N-Tier (Repository Pattern)**.

## Flux de données
1. **Controller (`/controller`)** : Reçoit la requête HTTP, vérifie les droits (`/security`), extrait le body via les DTOs (`/dto`). Appelle le Service.
2. **Service (`/service`)** : Contient la logique métier pure (vérification des limites, calculs, interactions externes comme Cloudinary).
3. **Repository (`/repository`)** : Couche d'abstraction vers la base de données. Gère les requêtes SQLAlchemy avec les Entités (`/entity`).
4. **Entity (`/entity`)** : Les modèles de tables SQLAlchemy (avec typage UUID spécifique PostgreSQL).
5. **DTO (`/dto`)** : Modèles Pydantic pour la validation I/O. La logique calculée (comme l'âge) se trouve ici via `@computed_field`.
6. **Exception (`/exception`)** : Gestionnaire global pour renvoyer des HTTP status propres (404, 403, 400).

## Nommage des Controllers
Les controllers suivent une logique orientée Rôle si besoin (ex: `PersonAdminController`, `PhotoAdminController`).
