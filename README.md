Procedimiento para que funcione

Después de hacer el siguiente comando:

docker compose up -d --build


Ejecutar los siguientes dos comandos ahí mismo en la consola o no va a correr 🙂

1. docker cp dump.backup netflix_mvp_db:/dump.backup

2. docker exec -it netflix_mvp_db pg_restore -U postgres -d DataBaseNetflix --clean --if-exists --no-owner --no-privileges /dump.backup


Una vez dentro de la aplicación, en la parte superior derecha aparece un “log in” si se entra directamente a /api/.
Si se entra primero a /admin/ pide de una vez que se loguee.
Con esto no es necesario estar colocando el token de acceso cada que se pasa a una sección diferente: la sesión queda guardada y se pasa automáticamente a la página.

ADMINS son los encargados de

0. Admin
Permite realizar todo
http://localhost:8000/admin/
correo: admin123@gmail.com
contraseña: adminnice123

0.1 Admin con limitaciones
http://localhost:8000/admin/
correo: andre@gmail.com
contraseña: andres123

1. Usuarios

Registro
http://localhost:8000/api/users/register/

Login (JWT)
http://localhost:8000/api/users/login/
→ La respuesta trae access y refresh token nada más.

2. Perfiles

Listar perfiles del usuario
GET http://localhost:8000/api/perfiles/

Crear perfil
POST http://localhost:8000/api/perfiles/

Activar perfil
http://localhost:8000/api/perfiles/<id>/activar/ — aparece una caja de texto, no toca colocar nada ahí, solo darle a POST.

Verificar perfil activo
http://localhost:8000/api/perfiles/activo/

Desactivar perfil activo
http://localhost:8000/api/perfiles/desactivar/

3. Suscripción

Ver planes de suscripción
http://localhost:8000/api/subscriptions/planes/

Crear suscripción
http://localhost:8000/api/subscriptions/suscribirse/

Ver estado de suscripción
http://localhost:8000/api/subscriptions/mi/

4. Contenido

Listar películas
http://localhost:8000/api/contenido/peliculas/

Detalle de película
GET http://localhost:8000/api/contenido/peliculas/<id>/

5. Streaming

http://localhost:8000/api/streaming/play/<id_pelicula>/ — toca tener perfil activo y suscripción
→ Usa el perfil activo y devuelve URL temporal.

http://localhost:8000/api/streaming/list/<id_pelicula>/

6. Historial

Historial reciente del perfil activo
http://localhost:8000/api/history/recent/ — ya toma el perfil que esté activo.
