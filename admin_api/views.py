from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Sum, Q
from datetime import datetime, timedelta
from decimal import Decimal

from users.models import Usuario
from content.models import Pelicula
from subscriptions.models import Suscripcion, Plan
from payments.models import Pago
from history.models import Historial


class DashboardStatsView(APIView):
    """
    Vista para obtener estadísticas generales del dashboard de administración
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Total de películas
        total_movies = Pelicula.objects.count()

        # Total de usuarios
        total_users = Usuario.objects.count()

        # Suscripciones activas
        active_subscriptions = Suscripcion.objects.filter(estado='activa').count()

        # Ingresos totales (pagos exitosos)
        total_revenue = Pago.objects.filter(estado='paid').aggregate(
            total=Sum('monto')
        )['total'] or Decimal('0')

        # Usuarios activos (con suscripción activa)
        active_users = Usuario.objects.filter(
            suscripciones__estado='activa'
        ).distinct().count()

        # Nuevos usuarios del mes
        first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_users_this_month = Usuario.objects.filter(
            fecha_registro__gte=first_day_of_month
        ).count()

        # Ingresos del mes actual
        revenue_this_month = Pago.objects.filter(
            estado='paid',
            creado_en__gte=first_day_of_month
        ).aggregate(total=Sum('monto'))['total'] or Decimal('0')

        # Películas más vistas (top 10)
        most_viewed_movies = Historial.objects.values(
            'id_pelicula'
        ).annotate(
            view_count=Count('id_historial')
        ).order_by('-view_count')[:10]

        # Obtener detalles de las películas más vistas
        movie_ids = [item['id_pelicula'] for item in most_viewed_movies]
        movies = Pelicula.objects.filter(id_pelicula__in=movie_ids)
        movies_dict = {movie.id_pelicula: movie for movie in movies}

        top_movies = []
        for item in most_viewed_movies:
            movie_id = item['id_pelicula']
            if movie_id in movies_dict:
                movie = movies_dict[movie_id]
                # Convertir miniatura a URL si existe
                thumbnail_url = None
                if movie.miniatura:
                    try:
                        thumbnail_url = movie.miniatura.url
                    except:
                        thumbnail_url = None

                top_movies.append({
                    'id': movie.id_pelicula,
                    'title': movie.titulo,
                    'views': item['view_count'],
                    'thumbnail': thumbnail_url
                })

        # Distribución de suscripciones por plan
        subscriptions_by_plan = Suscripcion.objects.filter(
            estado='activa'
        ).values(
            'plan__nombre'
        ).annotate(
            count=Count('id')
        ).order_by('-count')

        data = {
            'total_movies': total_movies,
            'total_users': total_users,
            'active_subscriptions': active_subscriptions,
            'total_revenue': float(total_revenue),
            'active_users': active_users,
            'new_users_this_month': new_users_this_month,
            'revenue_this_month': float(revenue_this_month),
            'top_movies': top_movies,
            'subscriptions_by_plan': list(subscriptions_by_plan),
        }

        return Response(data)


class RecentActivityView(APIView):
    """
    Vista para obtener actividad reciente en la plataforma
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Últimos 10 usuarios registrados
        recent_users = Usuario.objects.order_by('-fecha_registro')[:10].values(
            'id_usuario', 'name', 'email', 'fecha_registro', 'is_active'
        )

        # Últimas 10 suscripciones
        recent_subscriptions = Suscripcion.objects.select_related(
            'usuario', 'plan'
        ).order_by('-fecha_inicio')[:10]

        recent_subs_data = [{
            'id': sub.id,
            'user_name': sub.usuario.name,
            'user_email': sub.usuario.email,
            'plan_name': sub.plan.nombre,
            'date': sub.fecha_inicio,
            'status': sub.estado
        } for sub in recent_subscriptions]

        # Últimos 10 pagos
        recent_payments = Pago.objects.select_related('usuario').order_by('-creado_en')[:10]

        recent_payments_data = [{
            'id': payment.id,
            'user_name': payment.usuario.name,
            'user_email': payment.usuario.email,
            'amount': float(payment.monto),
            'currency': payment.moneda,
            'status': payment.estado,
            'date': payment.creado_en
        } for payment in recent_payments]

        data = {
            'recent_users': list(recent_users),
            'recent_subscriptions': recent_subs_data,
            'recent_payments': recent_payments_data,
        }

        return Response(data)


# ==================== GESTIÓN DE PELÍCULAS (CRUD) ====================
from rest_framework import viewsets, status
from rest_framework.decorators import action
from content.models import Actor, Director, Genero
from content.serializers import PeliculaDetalleSerializer, ActorSerializer, DirectorSerializer, GeneroSerializer


class PeliculaAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión completa de películas (CRUD) solo para administradores
    """
    queryset = Pelicula.objects.all()
    serializer_class = PeliculaDetalleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def list(self, request):
        """Listar todas las películas"""
        peliculas = self.get_queryset()
        serializer = self.get_serializer(peliculas, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Obtener detalles de una película"""
        pelicula = self.get_object()
        serializer = self.get_serializer(pelicula)
        return Response(serializer.data)

    def create(self, request):
        """Crear nueva película"""
        # Si vienen datos como FormData, necesitamos procesar los arrays
        if hasattr(request.data, 'getlist'):
            # Es un QueryDict (FormData), convertir a dict normal
            data = {}
            for key in request.data.keys():
                if key in ['actores', 'directores', 'generos']:
                    # Para arrays, obtener la lista de valores
                    data[key] = request.data.getlist(key)
                else:
                    # Para valores simples, obtener el valor único
                    data[key] = request.data.get(key)
        else:
            # Ya es un dict normal (JSON)
            data = request.data

        print("=== DEBUG CREATE VIEW ===")
        print("Data procesada:", data)
        print("Actores en data:", data.get('actores'))
        print("Directores en data:", data.get('directores'))
        print("Géneros en data:", data.get('generos'))

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print("Errores de validación:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """Actualizar película completa"""
        pelicula = self.get_object()

        # Si vienen datos como FormData, necesitamos procesar los arrays
        if hasattr(request.data, 'getlist'):
            # Es un QueryDict (FormData), convertir a dict normal
            data = {}
            for key in request.data.keys():
                if key in ['actores', 'directores', 'generos']:
                    # Para arrays, obtener la lista de valores
                    data[key] = request.data.getlist(key)
                else:
                    # Para valores simples, obtener el valor único
                    data[key] = request.data.get(key)
        else:
            # Ya es un dict normal (JSON)
            data = request.data

        serializer = self.get_serializer(pelicula, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Actualizar película parcialmente"""
        pelicula = self.get_object()

        # Si vienen datos como FormData, necesitamos procesar los arrays
        if hasattr(request.data, 'getlist'):
            # Es un QueryDict (FormData), convertir a dict normal
            data = {}
            for key in request.data.keys():
                if key in ['actores', 'directores', 'generos']:
                    # Para arrays, obtener la lista de valores
                    data[key] = request.data.getlist(key)
                else:
                    # Para valores simples, obtener el valor único
                    data[key] = request.data.get(key)
        else:
            # Ya es un dict normal (JSON)
            data = request.data

        serializer = self.get_serializer(pelicula, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Eliminar película"""
        pelicula = self.get_object()
        pelicula.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def filters(self, request):
        """Obtener opciones para filtros (actores, directores, géneros)"""
        actores = Actor.objects.all().values('id_actor', 'nombre')
        directores = Director.objects.all().values('id_director', 'nombre')
        generos = Genero.objects.all().values('id_genero', 'nombre')

        return Response({
            'actores': list(actores),
            'directores': list(directores),
            'generos': list(generos),
        })


# ==================== GESTIÓN DE ACTORES (CRUD) ====================
class ActorAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión completa de actores (CRUD) solo para administradores
    """
    queryset = Actor.objects.all().order_by('nombre')
    serializer_class = ActorSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'id_actor'


# ==================== GESTIÓN DE DIRECTORES (CRUD) ====================
class DirectorAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión completa de directores (CRUD) solo para administradores
    """
    queryset = Director.objects.all().order_by('nombre')
    serializer_class = DirectorSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'id_director'


# ==================== GESTIÓN DE GÉNEROS (CRUD) ====================
class GeneroAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión completa de géneros (CRUD) solo para administradores
    """
    queryset = Genero.objects.all().order_by('nombre')
    serializer_class = GeneroSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'id_genero'


# ==================== GESTIÓN DE USUARIOS (CRUD) ====================
from users.serializers import UserAdminSerializer

class UsuarioAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión completa de usuarios (CRUD) solo para administradores
    """
    queryset = Usuario.objects.all().order_by('-fecha_registro')
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'id_usuario'

    def update(self, request, *args, **kwargs):
        """Actualizar usuario - permitir cambio de estado y roles"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # No permitir cambiar el email de usuarios existentes
        if 'email' in request.data and request.data['email'] != instance.email:
            return Response(
                {'error': 'No se puede cambiar el email de un usuario existente'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== GESTIÓN DE PLANES (CRUD) ====================
from subscriptions.serializers import PlanSerializer

class PlanAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión completa de planes (CRUD) solo para administradores
    """
    queryset = Plan.objects.all().order_by('precio')
    serializer_class = PlanSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
