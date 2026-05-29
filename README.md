# LUSAN Web Production

Landing premium para LUSAN con estética moderna, capas 3D y stack separado en Angular + FastAPI.

## Estructura

- `frontend/`: aplicación Angular standalone con animaciones, branding y build para producción.
- `backend/`: API en FastAPI con endpoints de salud, branding y contacto.
- `docker-compose.yml`: levanta frontend con Nginx y backend con Gunicorn/Uvicorn.

## Desarrollo local

### Frontend

```bash
cd frontend
npm install
npm run start
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Producción con Docker

```bash
docker compose up --build -d
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8000/api/health`

## Build del frontend

```bash
cd frontend
npm install
npm run build:prod
```

El build quedará disponible en `frontend/dist/lusan-front/browser`.

## Próximos pasos recomendados

1. Reemplazar el endpoint `/api/contact` por integración real con correo, WhatsApp Business, HubSpot o tu CRM.
2. Conectar el catálogo o productos reales desde una base de datos o CMS.
3. Añadir SEO por páginas, analítica y formularios con validación avanzada.
4. Optimizar imágenes finales del branding en formato WebP y favicon.
