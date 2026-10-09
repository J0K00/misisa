import os
import cloudinary

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/misisa_db")

def configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "demo"),
        api_key=os.getenv("CLOUDINARY_API_KEY", "api_key"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET", "api_secret"),
    )
