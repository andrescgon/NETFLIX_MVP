# (opcional) versión con UserAdmin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    ordering = ('-fecha_registro',)
    list_display = ('id_usuario', 'email', 'name', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('email', 'name')
    list_per_page = 20
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'fecha_registro')

    fieldsets = (
        ('Credenciales', {
            'fields': ('email', 'password'),
            'classes': ('wide',),
            'description': 'Información de inicio de sesión del usuario'
        }),
        ('Información Personal', {
            'fields': ('name',),
            'classes': ('wide',),
        }),
        ('Permisos y Accesos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('wide',),
            'description': 'Permisos y roles del usuario en el sistema'
        }),
        ('Información Temporal', {
            'fields': ('last_login', 'fecha_registro'),
            'classes': ('wide', 'collapse'),
            'description': 'Fechas importantes del usuario'
        }),
    )

    add_fieldsets = (
        ('Crear Nuevo Usuario', {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'is_staff', 'is_superuser'),
            'description': 'Complete los siguientes campos para crear un nuevo usuario'
        }),
    )

    filter_horizontal = ('groups', 'user_permissions')
    readonly_fields = ('fecha_registro', 'last_login')

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }
