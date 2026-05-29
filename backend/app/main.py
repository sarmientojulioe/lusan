from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field

BASE_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIST = BASE_DIR / "frontend_dist"


class FeatureItem(BaseModel):
    title: str
    text: str


class StatItem(BaseModel):
    value: str
    label: str


class Palette(BaseModel):
    wine: str
    gold: str
    cream: str
    charcoal: str


class BrandPayload(BaseModel):
    name: str
    tagline: str
    heroTitle: str
    heroDescription: str
    logo: str
    palette: Palette
    highlights: list[FeatureItem]
    stats: list[StatItem]


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    message: str = Field(min_length=10, max_length=2000)


app = FastAPI(
    title="LUSAN Brand API",
    version="1.0.0",
    summary="Backend listo para producción para la landing de LUSAN."
)

default_origins = "http://localhost:4200,http://127.0.0.1:4200,http://localhost:8080"
cors_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", default_origins).split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "lusan-brand-api"}


@app.get("/api/brand", response_model=BrandPayload)
def get_brand() -> BrandPayload:
    return BrandPayload(
        name="LUSAN",
        tagline="Tradicionalmente rico",
        heroTitle="Tradición gourmet con presencia digital premium",
        heroDescription=(
            "Experiencia web elegante con profundidad 3D, acentos dorados y una dirección visual "
            "centrada en la herencia de marca, la calidez artesanal y la conversión comercial."
        ),
        logo="/brand/logo-lusan-premium.jpg",
        palette=Palette(
            wine="#6d0f14",
            gold="#9a772a",
            cream="#f6f0e6",
            charcoal="#140d0e",
        ),
        highlights=[
            FeatureItem(
                title="Identidad sólida",
                text="Dirección visual basada en contraste premium, serif protagonista y acabado editorial.",
            ),
            FeatureItem(
                title="Profundidad 3D",
                text="Capas, luces y microinteracciones para una primera impresión memorable.",
            ),
            FeatureItem(
                title="Escalable",
                text="Base lista para catálogo, franquicias, campañas promocionales o integración con CRM.",
            ),
        ],
        stats=[
            StatItem(value="1950", label="Trayectoria"),
            StatItem(value="50", label="Menu"),
            StatItem(value="3D", label="Tradición"),
        ],
    )


@app.post("/api/contact")
def create_contact(payload: ContactRequest) -> dict[str, Any]:
    return {
        "accepted": True,
        "message": "Lead recibido. Integra aquí tu correo, CRM o automatización.",
        "lead": payload.model_dump(),
    }


if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "brand"
    if assets_dir.exists():
        app.mount("/brand", StaticFiles(directory=assets_dir), name="brand")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str) -> FileResponse:
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Ruta API no encontrada")

        requested_file = FRONTEND_DIST / full_path
        if requested_file.exists() and requested_file.is_file():
            return FileResponse(requested_file)

        index_file = FRONTEND_DIST / "index.html"
        if not index_file.exists():
            raise HTTPException(status_code=404, detail="Frontend no disponible")
        return FileResponse(index_file)
