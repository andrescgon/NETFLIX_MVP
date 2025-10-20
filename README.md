## Integrantes:
+ Andres Castro Gonzalez
+ Miguel Flechas T
+ Juan Felipe Hurtado
+ Julian Esteban Rincon
+ Franco Comas Rey

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


