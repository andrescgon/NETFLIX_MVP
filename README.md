# 🎬 Plataforma de streaming (MVP tipo Netflix)

Plataforma web donde los usuarios crean su cuenta y perfiles, se suscriben a un plan y ven películas en línea, con historial, "seguir viendo" y un **chatbot con IA que recomienda películas** del catálogo.

Proyecto **individual** — Andrés Castro González, Universidad Sergio Arboleda (2025).

## Funcionalidades

**Para usuarios**
- Registro e inicio de sesión con **JWT** (con rotación de *refresh tokens*).
- Varios **perfiles** por cuenta, como en Netflix.
- **Planes de suscripción** y catálogo con filtros por género, actor y director.
- **Reproducción de video** con adelantar/retroceder (HTTP Range) y **descargas con enlaces firmados** que expiran (HMAC-SHA256).
- **Historial** y fila de **"Seguir viendo"** que recuerda en qué minuto quedaste.
- **Chatbot de recomendaciones** con Google Gemini que usa el catálogo real como contexto.

**Para administradores**
- Panel con estadísticas y actividad reciente.
- Gestión de películas, actores, directores y carga de videos.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Python, **Django 5**, **Django REST Framework**, SimpleJWT |
| Frontend | **React 19**, Vite, React Router |
| Base de datos | **PostgreSQL 17** |
| IA | Google Gemini API |
| Video | ffmpeg |
| Infraestructura | **Docker** y Docker Compose |

> El módulo de pagos con **Mercado Pago** (preferencias + webhook) está implementado en `payments/`, pero desactivado en esta versión.

## Cómo ejecutarlo

Requisitos: Docker y Docker Compose.

```bash
git clone https://github.com/andrescgon/NETFLIX_MVP.git
cd NETFLIX_MVP
cp .env.example .env        # completa las variables
docker compose up --build
```

- Backend (API): http://localhost:8000
- Frontend: `cd frontend && npm install && npm run dev` → http://localhost:5173

La base de datos se restaura automáticamente desde `dump.backup` la primera vez.

## Estructura

```
backend/        Configuración de Django
users/          Registro, login y JWT
profiles/       Perfiles por cuenta
subscriptions/  Planes y suscripciones
content/        Catálogo (películas, actores, directores, géneros)
streaming/      Reproducción y enlaces firmados
history/        Historial, "seguir viendo" y recomendaciones
chatbot/        Chatbot con Google Gemini
admin_api/      Panel de administración
uploader/       Carga de videos
payments/       Integración con Mercado Pago (desactivada)
frontend/       Aplicación React
```
