# (opcional) versión con UserAdmin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    ordering = ('-fecha_registro',)
    list_display = ('id_usuario', 'email', 'name', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('email', 'name')
    fieldsets = (
        ('Credenciales', {'fields': ('email', 'password')}),
        ('Personal', {'fields': ('name',)}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas', {'fields': ('last_login', 'fecha_registro')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'is_staff', 'is_superuser'),
        }),
    )
    filter_horizontal = ('groups', 'user_permissions')
    readonly_fields = ('fecha_registro', 'last_login')
