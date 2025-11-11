# users/models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UsuarioManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        if not name:
            raise ValueError('El nombre es obligatorio')

        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if password is None:
            raise ValueError('La contraseña es obligatoria para superusuario')
        return self.create_user(email, name, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    id_usuario = models.AutoField(primary_key=True, db_column='id_usuario')
    name = models.CharField(max_length=255, db_column='nombre')
    email = models.EmailField(unique=True, db_column='email')
    password = models.CharField(max_length=255, db_column='password')
    fecha_registro = models.DateTimeField(db_column='fecha_registro', auto_now_add=True)

    is_active = models.BooleanField(default=True, db_column='is_active')
    is_staff  = models.BooleanField(default=False, db_column='is_staff')
    # is_superuser lo maneja PermissionsMixin, pero lo mapeamos a la columna existente:
    is_superuser = models.BooleanField(default=False, db_column='is_superuser')
    last_login = models.DateTimeField(null=True, blank=True, db_column='last_login')

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'usuarios'
        managed = False  # la tabla ya existe (no migrar)

    def __str__(self):
        return self.email
