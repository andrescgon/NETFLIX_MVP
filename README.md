docker compose up -d --build


docker exec -it netflix_mvp_db psql -U postgres -d DataBaseNetflix -c "CREATE SCHEMA IF NOT EXISTS privado AUTHORIZATION postgres;"  

docker volume rm $(docker volume ls -q | findstr pgdata)     


0.Admin 
permite realizar todo
http://localhost:8000/admin/
correo :admin123@gmail.com
contraseña:adminnice123

0.1 Admin con limitaciones
http://localhost:8000/admin/
correo :andre@gmail.com
contraseña:andres123


1. Usuarios

Registro
POST http://localhost:8000/api/users/register/

Login (JWT) 
POST http://localhost:8000/api/users/login/
→ Respuesta trae access y refresh token.


2. Perfiles

Listar perfiles del usuario
GET http://localhost:8000/api/perfiles/

Crear perfil
POST http://localhost:8000/api/perfiles/

Activar perfil 
http://localhost:8000/api/perfiles/<id>/activar/    -- aparece una caja de texto no toca colocar nada hay solo darle a POST

Verificar perfil activo
http://localhost:8000/api/perfiles/activo/

Desactivar perfil activo
http://localhost:8000/api/perfiles/desactivar/

3. Contenido

Listar películas
http://localhost:8000/api/contenido/peliculas/

Detalle de película
GET http://localhost:8000/api/contenido/peliculas/<id>/

4. Streaming

http://localhost:8000/api/streaming/play/<id_pelicula>/     --toca tener perfil activo y subscripcion
→ Usa el perfil activo, devuelve url temporal.

http://localhost:8000/api/streaming/list/<id_pelicula>/     

5. Historial

Historial reciente del perfil activo

http://localhost:8000/api/history/recent/   --ya toma el perfil que este activo
