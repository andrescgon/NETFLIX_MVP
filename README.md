## Procedimiento para que funcione

Después de hacer el siguiente comando:
```bash
docker compose up -d --build
```


Una vez dentro de la aplicación, en la parte superior derecha aparece un “log in” si se entra directamente a /api/.
Si se entra primero a /admin/ pide de una vez que se loguee.
Con esto no es necesario estar colocando el token de acceso cada que se pasa a una sección diferente: la sesión queda guardada y se pasa automáticamente a la página.

ADMINS 

| Rol                    | URL                            | Correo               | Contraseña     |
| ---------------------- | ------------------------------ | -------------------- | -------------- |
| Admin (acceso total)   | http://localhost:8000/admin/     | `admin123@gmail.com` | `adminnice123` |

Admin con acceso total puede hacer de todo

Endpoints
1) Usuarios

Registro: http://localhost:8000/api/users/register/

Login (JWT): http://localhost:8000/api/users/login/
Respuesta: access y refresh token.

2) Perfiles

Listar perfiles (usuario actual): GET http://localhost:8000/api/perfiles/

Crear perfil: POST http://localhost:8000/api/perfiles/

Activar perfil: POST http://localhost:8000/api/perfiles/<id_usuario>/activar/
(Aparece una caja de texto; no escribas nada, solo darle al POST.)

Ver perfil activo: http://localhost:8000/api/perfiles/activo/

Desactivar perfil activo: http://localhost:8000/api/perfiles/desactivar/

3) Suscripciones

Ver planes: http://localhost:8000/api/subscriptions/planes/

Suscribirse: http://localhost:8000/api/subscriptions/suscribirse/

Mi suscripción: http://localhost:8000/api/subscriptions/mi/

4) Contenido

Listar películas: http://localhost:8000/api/contenido/peliculas/

Detalle de película: GET http://localhost:8000/api/contenido/peliculas/<id_pelicula>/

5) Streaming

Reproducir: http://localhost:8000/api/streaming/play/<id_pelicula>/
(Requiere perfil activo y suscripción; devuelve URL temporal.)

Listar archivos de la película: http://localhost:8000/api/streaming/list/<id_pelicula>/

6) Historial

Historial reciente (perfil activo): http://localhost:8000/api/history/recent/
