# Netflix MVP - Plataforma de Streaming

Una plataforma de streaming completa desarrollada con Django (Backend), React (Frontend) y PostgreSQL, con funcionalidades de administración, gestión de perfiles, suscripciones y reproducción de contenido.

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Acceso a la Aplicación](#acceso-a-la-aplicación)
- [Credenciales de Administrador](#credenciales-de-administrador)
- [Funcionalidades del Frontend](#funcionalidades-del-frontend)
- [APIs Disponibles](#apis-disponibles)
- [Comandos Útiles](#comandos-útiles)

---

## Características

- **Autenticación y Autorización**: Sistema JWT con refresh tokens
- **Gestión de Perfiles**: Múltiples perfiles por cuenta
- **Streaming de Video**: Reproducción HLS con seguimiento de progreso
- **Sistema de Suscripciones**: Planes de pago y gestión de suscripciones
- **Panel de Administración**: CRUD completo de películas, usuarios, actores, directores y géneros
- **Historial de Visualización**: Seguimiento de películas vistas por perfil
- **Recomendaciones**: Sistema de recomendaciones de contenido
- **ChatBot**: Asistente para usuarios
- **Diseño Responsivo**: Adaptado para móviles y escritorio

---

## Tecnologías

### Backend
- Django 5.x
- Django REST Framework
- PostgreSQL 17
- JWT Authentication
- Docker & Docker Compose

### Frontend
- React 19
- React Router DOM
- Axios
- Vite
- CSS Modules

---

## Requisitos Previos

Asegúrate de tener instalado en tu sistema:

- [Docker](https://www.docker.com/get-started) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.0 o superior)

---

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/netflix-mvp.git
cd netflix-mvp
```

### 2. Levantar los Contenedores con Docker Compose

Ejecuta el siguiente comando para construir e iniciar todos los servicios:

```bash
docker-compose up -d --build
```

### 3. Restaurar la Base de Datos

Después de que los contenedores estén corriendo, ejecuta los siguientes comandos para restaurar la base de datos:

```bash
docker cp dump.backup netflix_mvp_db:/dump.backup
```

```bash
docker exec -it netflix_mvp_db pg_restore -U postgres -d DataBaseNetflix --clean --if-exists --no-owner --no-privileges /dump.backup
```

### 4. Verificar que los Servicios Estén Listos

Verifica que todos los contenedores estén corriendo:

```bash
docker-compose ps
```

Deberías ver:
- `netflix_mvp_db` (PostgreSQL)
- `netflix_mvp_backend` (Django)
- `netflix_mvp_frontend` (React/Vite)

---

## Acceso a la Aplicación

### Frontend (Usuario)

Accede a la aplicación web en tu navegador:

```
http://localhost:5173
```

### Panel de Administración Django

Accede al panel de administración nativo de Django:

```
http://localhost:8000/admin/
```

### API REST (Browsable API)

Puedes explorar las APIs directamente en:

```
http://localhost:8000/api/
```

**Nota:** Al entrar a `/api/` aparece un botón "Log in" en la parte superior derecha. Si entras primero a `/admin/` te pide que inicies sesión. Con esto, no es necesario estar colocando el token de acceso cada vez que cambias de sección: la sesión queda guardada automáticamente.

---

## Credenciales de Administrador

### Cuenta de Administrador (Acceso Total)

| Campo | Valor |
|-------|-------|
| **URL** | `http://localhost:8000/admin/` |
| **Correo** | `admin123@gmail.com` |
| **Contraseña** | `adminnice123` |
| **Permisos** | Acceso completo a todas las funcionalidades |

**Este administrador puede:**
- Gestionar usuarios, películas, actores, directores, géneros
- Ver estadísticas y reportes
- Gestionar suscripciones y pagos
- Crear, editar y eliminar cualquier contenido
- Acceder a todas las secciones del panel de administración

### Cuenta de Administrador (Acceso Limitado)

| Campo | Valor |
|-------|-------|
| **URL** | `http://localhost:8000/admin/` |
| **Correo** | `andre@gmail.com` |
| **Contraseña** | `andres123` |
| **Permisos** | Acceso limitado a ciertas funcionalidades |

**Este administrador puede:**
- Subir videos
- Crear actores, géneros, directores
- Crear y editar películas
- **NO puede:** Eliminar usuarios ni acceder a configuraciones sensibles

---

## Funcionalidades del Frontend

### Secciones Principales

#### 1. Autenticación (`/login`, `/register`)
- **Registro de usuarios**: Crear cuenta con email y contraseña
- **Login**: Iniciar sesión con credenciales
- **Autenticación JWT**: Tokens de acceso y refresh automáticos
- **Sesión persistente**: La sesión se mantiene entre recargas

#### 2. Gestión de Perfiles (`/profiles`, `/profiles/manage`)
- **Selección de perfil**: Elige qué perfil usar al entrar
- **Crear perfiles**: Añade múltiples perfiles por cuenta (ej: "Niños", "Adultos")
- **Editar perfiles**: Modifica nombre y configuración
- **Eliminar perfiles**: Borra perfiles no deseados
- **Perfil activo**: El sistema recuerda qué perfil estás usando

#### 3. Dashboard Principal (`/home`)
- **Catálogo por género**: Películas organizadas en filas por género
- **Continuar viendo**: Sección con películas que dejaste a medias
- **Búsqueda y filtros**: Busca por título, género, director o actor
- **Recomendaciones**: Sugerencias personalizadas basadas en tu historial
- **ChatBot**: Asistente virtual para ayudarte a encontrar contenido
- **Skeleton loading**: Animaciones de carga suaves

#### 4. Reproductor de Video (`/player/:movieId`)
- **Streaming HLS**: Reproducción de video en alta calidad
- **Controles completos**: Play, pausa, volumen, barra de progreso, pantalla completa
- **Guardado automático**: El progreso se guarda cada cierto tiempo
- **Resume desde donde lo dejaste**: Al volver, continúa desde el último punto
- **Responsive**: Adaptado para móviles con rotación de pantalla
- **Por perfil**: Cada perfil tiene su propio progreso independiente

#### 5. Historial (`/history`)
- **Ver historial**: Lista de todas las películas que has visto
- **Progreso de visualización**: Porcentaje completado de cada película
- **Filtrado por perfil**: Solo ves el historial del perfil activo
- **Fecha de visualización**: Cuándo viste cada película

#### 6. Planes de Suscripción (`/plans`, `/subscription`)
- **Ver planes disponibles**: Compara características y precios
- **Suscribirse**: Contrata un plan directamente
- **Mi suscripción**: Ve tu plan actual, fecha de inicio y renovación
- **Actualizar plan**: Cambia a un plan superior o inferior
- **Estado de suscripción**: Verifica si está activa o cancelada

#### 7. Panel de Administración (Solo Admins: `/admin/*`)

##### Dashboard (`/admin`)
- **Estadísticas generales**: Total de películas, usuarios activos, suscripciones activas, revenue total
- **Gráficos**: Visualización de datos clave
- **Métricas en tiempo real**: Datos actualizados

##### Gestión de Películas (`/admin/movies`)
- **Lista completa**: Ver todas las películas con filtros y búsqueda
- **Crear película** (`/admin/movies/new`): Añadir nueva película con todos los metadatos
- **Editar película** (`/admin/movies/:id/edit`): Modificar información existente
- **Eliminar película**: Borrar contenido del sistema
- **Gestión de assets** (`/admin/movies/:id/assets`): Subir video principal, trailer, poster, banner

##### Gestión de Metadatos
- **Actores** (`/admin/actors`): CRUD completo de actores
- **Directores** (`/admin/directors`): CRUD completo de directores
- **Géneros** (`/admin/genres`): CRUD completo de géneros

##### Gestión de Usuarios (`/admin/users`)
- **Lista de usuarios**: Ver todos los usuarios registrados
- **Detalles de usuario**: Información completa, perfiles, suscripciones
- **Estadísticas por usuario**: Actividad, películas vistas, tiempo total

##### Gestión de Planes y Suscripciones (`/admin/plans`, `/admin/subscriptions`)
- **Crear planes**: Define nuevos planes con precios y características
- **Editar planes**: Modifica planes existentes
- **Ver suscripciones activas**: Lista de todas las suscripciones
- **Cancelar suscripciones**: Gestionar cancelaciones

##### Historial Global (`/admin/history`)
- **Ver todo el historial**: Actividad de todos los usuarios
- **Películas más vistas**: Ranking de contenido popular
- **Análisis de comportamiento**: Patrones de visualización

##### Pagos (`/admin/payments`)
- **Historial de pagos**: Todas las transacciones
- **Estado de pagos**: Completados, pendientes, fallidos
- **Revenue tracking**: Seguimiento de ingresos

---

## APIs Disponibles

### Base URL

```
http://localhost:8000
```

### 1. Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/users/register/` | Registro de nuevo usuario |
| POST | `/api/users/login/` | Login (devuelve access y refresh token) |
| GET | `/api/users/me/` | Obtener datos del usuario actual |

**Ejemplo de Login:**
```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin123@gmail.com", "password": "adminnice123"}'
```

### 2. Perfiles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/perfiles/` | Listar perfiles del usuario actual |
| POST | `/api/perfiles/` | Crear nuevo perfil |
| POST | `/api/perfiles/<id_usuario>/activar/` | Activar perfil específico |
| GET | `/api/perfiles/activo/` | Ver perfil activo |
| POST | `/api/perfiles/desactivar/` | Desactivar perfil activo |

**Nota:** Al activar un perfil, solo dale al botón POST sin escribir nada en la caja de texto.

### 3. Suscripciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/subscriptions/planes/` | Ver todos los planes disponibles |
| POST | `/api/subscriptions/suscribirse/` | Suscribirse a un plan |
| GET | `/api/subscriptions/mi/` | Ver mi suscripción actual |

### 4. Contenido

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/contenido/peliculas/` | Listar todas las películas |
| GET | `/api/contenido/peliculas/<id_pelicula>/` | Detalle de una película específica |
| GET | `/api/contenido/generos/` | Listar géneros |
| GET | `/api/contenido/actores/` | Listar actores |
| GET | `/api/contenido/directores/` | Listar directores |

### 5. Streaming

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/streaming/play/<id_pelicula>/` | Obtener URL temporal de streaming (requiere perfil activo y suscripción) |
| GET | `/api/streaming/list/<id_pelicula>/` | Listar archivos de la película |
| POST | `/api/streaming/progress/` | Guardar progreso de reproducción |

### 6. Historial

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/history/recent/` | Historial reciente del perfil activo |
| GET | `/api/history/` | Todo el historial del perfil activo |
| POST | `/api/history/` | Añadir entrada al historial |

### 7. Admin - Películas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/peliculas/` | Listar todas las películas (admin) |
| POST | `/api/admin/peliculas/` | Crear nueva película |
| GET | `/api/admin/peliculas/<id>/` | Detalle de película |
| PUT | `/api/admin/peliculas/<id>/` | Actualizar película |
| DELETE | `/api/admin/peliculas/<id>/` | Eliminar película |
| POST | `/api/admin/peliculas/<id>/assets/` | Subir assets (video, trailer, poster, banner) |

### 8. Admin - Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/usuarios/` | Listar todos los usuarios |
| GET | `/api/admin/usuarios/<id>/` | Detalle de usuario |
| GET | `/api/admin/usuarios/<id>/estadisticas/` | Estadísticas del usuario |

### 9. Admin - Metadatos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/actores/` | Listar actores |
| POST | `/api/admin/actores/` | Crear actor |
| PUT | `/api/admin/actores/<id>/` | Actualizar actor |
| DELETE | `/api/admin/actores/<id>/` | Eliminar actor |
| GET | `/api/admin/directores/` | Listar directores |
| POST | `/api/admin/directores/` | Crear director |
| GET | `/api/admin/generos/` | Listar géneros |
| POST | `/api/admin/generos/` | Crear género |

### 10. Admin - Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/estadisticas/` | Estadísticas generales del sistema |

### Testing de APIs con Navegador

La forma más fácil de probar las APIs es:

1. Abre `http://localhost:8000/api/` en tu navegador
2. Haz clic en "Log in" en la esquina superior derecha
3. Ingresa con las credenciales de administrador
4. Navega por las diferentes URLs de la API

También puedes usar herramientas como **Postman**, **Insomnia** o **cURL**.

---

## Comandos Útiles

### Detener los Contenedores

```bash
docker-compose down
```

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f db
```

### Reconstruir los Contenedores

```bash
docker-compose up -d --build --force-recreate
```

### Entrar a un Contenedor

```bash
# Backend Django
docker exec -it netflix_mvp_backend bash

# Frontend React
docker exec -it netflix_mvp_frontend sh

# Base de datos PostgreSQL
docker exec -it netflix_mvp_db psql -U postgres -d DataBaseNetflix
```

### Crear Migraciones (Backend)

```bash
docker exec -it netflix_mvp_backend python manage.py makemigrations
docker exec -it netflix_mvp_backend python manage.py migrate
```

### Crear Superusuario (Backend)

```bash
docker exec -it netflix_mvp_backend python manage.py createsuperuser
```

### Backup Manual de la Base de Datos

```bash
docker exec -it netflix_mvp_db pg_dump -U postgres -d DataBaseNetflix -F c -f /dump_new.backup
docker cp netflix_mvp_db:/dump_new.backup ./dump_new.backup
```

### Limpiar Todo (Incluyendo Volúmenes)

**⚠️ ADVERTENCIA:** Esto eliminará todos los datos.

```bash
docker-compose down -v
docker-compose up -d --build
```

Luego repite los pasos de restauración de la base de datos.

---

## Estructura del Proyecto

```
netflix-mvp/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Servicios API (axios)
│   │   ├── context/         # Context API (AuthContext, ProfileContext, etc.)
│   │   ├── hooks/           # Custom hooks
│   │   └── App.jsx          # Configuración de rutas
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Configuración Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── users/                    # App de usuarios y autenticación
├── profiles/                 # App de perfiles
├── content/                  # App de contenido (películas, géneros, etc.)
├── streaming/                # App de streaming
├── subscriptions/            # App de suscripciones
├── payments/                 # App de pagos
├── history/                  # App de historial de visualización
├── admin_api/                # APIs de administración
│
├── docker-compose.yml        # Configuración de servicios Docker
├── Dockerfile                # Imagen del backend
├── requirements.txt          # Dependencias Python
├── dump.backup               # Backup de la base de datos
├── init-db.sh                # Script de inicialización de BD
├── entrypoint.sh             # Script de entrada del backend
└── .env                      # Variables de entorno
```

---

## Solución de Problemas

### El Frontend no se Conecta al Backend

Verifica que los servicios estén corriendo:
```bash
docker-compose ps
```

Asegúrate de que el backend esté en `http://localhost:8000` y el frontend en `http://localhost:5173`.

### Error de Conexión a la Base de Datos

El servicio de backend depende de que la base de datos esté lista. Espera unos segundos más o revisa los logs:
```bash
docker-compose logs db
```

### Puerto Ocupado

Si algún puerto ya está en uso, modifica los puertos en `docker-compose.yml`:
- Frontend: línea 66 (`5173:5173` → `NUEVO_PUERTO:5173`)
- Backend: línea 50 (`8000:8000` → `NUEVO_PUERTO:8000`)
- Database: línea 11 (`5432:5432` → `NUEVO_PUERTO:5432`)

### No Aparece el Contenido después de la Restauración

Verifica que la restauración se haya completado correctamente:
```bash
docker exec -it netflix_mvp_db psql -U postgres -d DataBaseNetflix -c "SELECT COUNT(*) FROM content_pelicula;"
```

Si devuelve 0, repite los comandos de restauración.

---

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## Contacto

Para preguntas o sugerencias, abre un issue en el repositorio de GitHub.

---

**Desarrollado por el equipo de Netflix MVP**
