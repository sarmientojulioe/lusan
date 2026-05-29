# ============================================================
#  LUSAN — Dockerfile de producción (todo en uno)
#  Compila el frontend Angular y lo sirve junto con la API
#  FastAPI desde un único contenedor.
# ============================================================

# --- Etapa 1: compilar el frontend Angular ---
FROM node:22-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build:prod

# --- Etapa 2: backend FastAPI sirviendo API + frontend ---
FROM python:3.13-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Dependencias del backend
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Código del backend
COPY backend/app ./backend/app

# Frontend ya compilado, en la ruta que main.py espera (BASE_DIR/frontend_dist)
COPY --from=build /app/dist/lusan-front/browser ./frontend_dist

# Render/Railway/Fly inyectan el puerto en la variable $PORT (por defecto 8000)
ENV PORT=8000
EXPOSE 8000

# Arranca Gunicorn con workers Uvicorn. --chdir para que "app.main" sea importable.
CMD ["sh", "-c", "gunicorn --chdir /app/backend -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:${PORT} app.main:app"]
