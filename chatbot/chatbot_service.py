"""
Servicio de IA para el chatbot usando Google Gemini
Maneja la integración con la API de Gemini y proporciona contexto de películas
"""
import google.generativeai as genai
from django.conf import settings
from content.models import Pelicula, Genero, Actor, Director
import json


class ChatbotService:
    """
    Servicio principal del chatbot que integra Gemini con la base de datos de películas
    """

    def __init__(self):
        """Inicializa la conexión con Gemini"""
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY no está configurada en las variables de entorno")

        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Usar gemini-2.5-flash (versión más reciente y estable)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def get_movies_context(self):
        """
        Obtiene el contexto de todas las películas disponibles en la base de datos
        Retorna un string formateado con información de películas
        """
        peliculas = Pelicula.objects.all().prefetch_related('generos', 'actores', 'directores')

        if not peliculas.exists():
            return "No hay películas disponibles en el catálogo."

        # Construir el contexto de películas
        context_parts = []
        context_parts.append(f"CATÁLOGO DE PELÍCULAS DISPONIBLES ({peliculas.count()} películas):\n")

        for pelicula in peliculas[:100]:  # Limitar a 100 películas para no exceder tokens
            generos = ", ".join([g.nombre for g in pelicula.generos.all()])
            actores = ", ".join([a.nombre for a in pelicula.actores.all()[:5]])  # Top 5 actores
            directores = ", ".join([d.nombre for d in pelicula.directores.all()])

            # Extraer año de fecha_estreno si existe
            anio = pelicula.fecha_estreno.year if pelicula.fecha_estreno else 'N/A'

            pelicula_info = f"""
- Título: {pelicula.titulo}
  ID: {pelicula.id_pelicula}
  Año: {anio}
  Géneros: {generos or 'N/A'}
  Directores: {directores or 'N/A'}
  Actores: {actores or 'N/A'}
  Descripción: {pelicula.descripcion[:200] if pelicula.descripcion else 'N/A'}...
  Duración: {pelicula.duracion or 'N/A'} min
  Clasificación: {pelicula.clasificacion or 'N/A'}
"""
            context_parts.append(pelicula_info)

        return "\n".join(context_parts)

    def get_movies_by_genre(self, genre_name):
        """Obtiene películas filtradas por género"""
        peliculas = Pelicula.objects.filter(
            generos__nombre__icontains=genre_name
        ).prefetch_related('generos', 'actores', 'directores').distinct()[:20]

        return list(peliculas)

    def get_movie_by_title(self, title):
        """Busca una película específica por título"""
        peliculas = Pelicula.objects.filter(
            titulo__icontains=title
        ).prefetch_related('generos', 'actores', 'directores')[:5]

        return list(peliculas)

    def get_movies_by_actor(self, actor_name):
        """Obtiene películas filtradas por actor"""
        peliculas = Pelicula.objects.filter(
            actores__nombre__icontains=actor_name
        ).prefetch_related('generos', 'actores', 'directores').distinct()[:20]

        return list(peliculas)

    def get_movies_by_director(self, director_name):
        """Obtiene películas filtradas por director"""
        peliculas = Pelicula.objects.filter(
            directores__nombre__icontains=director_name
        ).prefetch_related('generos', 'actores', 'directores').distinct()[:20]

        return list(peliculas)

    def format_movies_for_response(self, peliculas):
        """
        Formatea una lista de películas para incluir en la respuesta
        """
        if not peliculas:
            return None

        movies_data = []
        for pelicula in peliculas[:10]:  # Máximo 10 películas
            # Extraer año de fecha_estreno
            anio = pelicula.fecha_estreno.year if pelicula.fecha_estreno else None

            # Obtener URL de la miniatura si existe
            miniatura_url = pelicula.miniatura.url if pelicula.miniatura else None

            movies_data.append({
                'id_pelicula': pelicula.id_pelicula,
                'titulo': pelicula.titulo,
                'ano_lanzamiento': anio,
                'miniatura': miniatura_url,
                'descripcion': pelicula.descripcion[:150] if pelicula.descripcion else '',
                'generos': [g.nombre for g in pelicula.generos.all()],
                'duracion_minutos': pelicula.duracion,
            })

        return movies_data

    def generate_response(self, user_message):
        """
        Genera una respuesta usando Gemini con contexto de películas

        Args:
            user_message (str): Mensaje del usuario

        Returns:
            dict: {'response': str, 'movies': list or None}
        """
        try:
            # Obtener contexto de películas
            movies_context = self.get_movies_context()

            # Crear el prompt del sistema
            system_prompt = f"""Eres un asistente virtual experto en recomendaciones de películas de Netflix.
Tu nombre es "Asistente Netflix" y tu trabajo es ayudar a los usuarios a encontrar películas perfectas para ver.

INSTRUCCIONES IMPORTANTES:
1. Responde SIEMPRE en español de forma amigable y conversacional
2. Cuando te pregunten por películas específicas, géneros, actores o directores, usa SOLO la información del catálogo proporcionado
3. Cuando menciones una película, escribe su título EXACTAMENTE como aparece en el catálogo seguido de [MOVIE_ID:X] donde X es el ID de la película
4. Ejemplo: "Te recomiendo **The Dark Knight**[MOVIE_ID:5], del 2008, una épica batalla entre Batman y el Joker."
5. Después de mencionar cada película y su descripción, empieza la siguiente película
6. NO uses asteriscos ni viñetas para listar películas
7. Escribe de forma natural, como si estuvieras conversando
8. Sé entusiasta y breve en tus descripciones

CATÁLOGO DISPONIBLE:
{movies_context}

Responde a la siguiente pregunta del usuario de forma natural y útil:
Usuario: {user_message}

Asistente Netflix:"""

            # Generar respuesta con Gemini
            response = self.model.generate_content(system_prompt)
            response_text = response.text

            # Intentar detectar si debemos retornar películas específicas
            movies_to_return = None
            user_lower = user_message.lower()

            # Lista ampliada de géneros
            generos_map = {
                'acción': ['acción', 'accion', 'action', 'accio'],  # Agregado 'accio' para tolerar errores
                'comedia': ['comedia', 'comedy', 'cómicas', 'comicas', 'graciosas', 'divertidas', 'comedi'],
                'drama': ['drama', 'dramáticas', 'dramaticas', 'dram'],
                'terror': ['terror', 'horror', 'miedo', 'suspenso', 'terro'],
                'romance': ['romance', 'románticas', 'romanticas', 'amor', 'romanti'],
                'ciencia ficción': ['ciencia ficción', 'ficción', 'ficcion', 'sci-fi', 'scifi', 'ciencia ficci'],
                'aventura': ['aventura', 'aventuras', 'aventur'],
                'thriller': ['thriller', 'suspense', 'thrille'],
                'animación': ['animación', 'animacion', 'animadas', 'dibujos', 'animacio'],
                'documental': ['documental', 'documentales', 'document'],
                'fantasía': ['fantasia', 'fantasía', 'fantasy', 'fantas']
            }

            # Detectar género en el mensaje (con búsqueda flexible)
            genero_detectado = None
            for genero_db, keywords in generos_map.items():
                for keyword in keywords:
                    if keyword in user_lower:
                        genero_detectado = genero_db
                        break
                if genero_detectado:
                    break

            # Si detectamos un género, buscar películas
            if genero_detectado:
                peliculas = self.get_movies_by_genre(genero_detectado)
                if peliculas:
                    movies_to_return = self.format_movies_for_response(peliculas)

            # Si no hay películas aún, detectar otras intenciones
            if not movies_to_return:
                # Palabras clave que indican que el usuario quiere ver películas
                keywords_busqueda = [
                    'recomienda', 'recomendación', 'sugieres', 'sugiere',
                    'quiero ver', 'me gustaría ver', 'quisiera ver',
                    'busco', 'buscando', 'encuentro',
                    'tienes', 'hay', 'existe',
                    'películas', 'peliculas', 'filme', 'films',
                    'qué ver', 'que ver', 'para ver'
                ]

                if any(keyword in user_lower for keyword in keywords_busqueda):
                    # Si no se detectó género específico, retornar películas populares/aleatorias
                    peliculas = Pelicula.objects.all().prefetch_related('generos', 'actores', 'directores')[:10]
                    if peliculas:
                        movies_to_return = self.format_movies_for_response(list(peliculas))

            # Procesar el texto para intercalar películas
            import re
            movie_markers = re.findall(r'\[MOVIE_ID:(\d+)\]', response_text)

            # Si Gemini mencionó películas pero no tenemos el array, buscamos por IDs
            if movie_markers and not movies_to_return:
                # Extraer IDs únicos de los marcadores
                movie_ids = list(set([int(mid) for mid in movie_markers]))

                # Buscar esas películas en la base de datos
                peliculas = Pelicula.objects.filter(
                    id_pelicula__in=movie_ids
                ).prefetch_related('generos', 'actores', 'directores')

                if peliculas:
                    movies_to_return = self.format_movies_for_response(list(peliculas))

            # Si hay películas para retornar
            if movies_to_return and movie_markers:
                # Retornar el texto con los marcadores y el mapa de películas
                return {
                    'response': response_text,
                    'movies': movies_to_return,
                    'intercalate': True  # Indica que las películas deben intercalarse
                }

            return {
                'response': response_text,
                'movies': movies_to_return,
                'intercalate': False
            }

        except Exception as e:
            # Manejo de errores
            return {
                'response': f'Lo siento, tuve un problema al procesar tu solicitud. Por favor intenta de nuevo. (Error: {str(e)})',
                'movies': None
            }
