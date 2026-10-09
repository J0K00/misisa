from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.database import engine
from config.config import configure_cloudinary
from entity.base import Base

# Import all entities to ensure tables are created
import entity.person_entity
import entity.photo_entity
import entity.family_entity
import entity.union_entity
import entity.user_entity
import entity.family_membership_entity

# Exceptions
from exception.global_exceptions import (
    NotFoundException, not_found_exception_handler,
    ForbiddenException, forbidden_exception_handler,
    BadRequestException, bad_request_exception_handler
)

# Routers
from controller.auth_controller import router as auth_router
from controller.person_admin_controller import router as person_router
from controller.photo_admin_controller import router as photo_router
from controller.family_viewer_controller import router as family_router

# Configuration Cloudinary
configure_cloudinary()

# Création des tables dans la BDD PostgreSQL (Idéalement via Alembic en prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Généalogie & Racines API")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des exception handlers
app.add_exception_handler(NotFoundException, not_found_exception_handler)
app.add_exception_handler(ForbiddenException, forbidden_exception_handler)
app.add_exception_handler(BadRequestException, bad_request_exception_handler)

# Enregistrement des controllers
app.include_router(auth_router)
app.include_router(person_router)
app.include_router(photo_router)
app.include_router(family_router)

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API N-Tier de Généalogie & Racines"}
