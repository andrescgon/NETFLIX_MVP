from datetime import timedelta
from pathlib import Path
import os

# === Paths base ===
BASE_DIR = Path(__file__).resolve().parent.parent

# === Seguridad / Debug desde .env ===
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"

# Hosts y CSRF confiables
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",")
CSRF_TRUSTED_ORIGINS = os.getenv(
    "DJANGO_CSRF_ORIGINS",
    "http://localhost,http://127.0.0.1",
).split(",")

# === Apps ===
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "users",
    "profiles",
    "payments",
    "subscriptions",
    "content",
    "streaming",
    "history",
    "uploader",
    "chatbot",
]

# === Middleware ===
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "profiles.middleware.PerfilActivoMiddleware",  # <— tu middleware de perfil activo
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# === Base de Datos (Docker + env) ===
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "DataBaseNetflix"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "1234"),
        "HOST": os.getenv("POSTGRES_HOST", "db"),     # en docker-compose el servicio se llama "db"
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
        "OPTIONS": {
            "options": os.getenv("PGOPTIONS", "-c search_path=privado,public")
        },
    }
}

# === Validadores de password ===
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# === i18n / TZ ===
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# === Archivos estáticos ===
STATIC_URL = "static/"
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# === CORS (si usas front local) ===
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default port
    "https://*.loca.lt",
]
CORS_ALLOW_CREDENTIALS = True

# === JWT ===
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "USER_ID_FIELD": "id_usuario",
    "USER_ID_CLAIM": "user_id",
}

AUTH_USER_MODEL = "users.Usuario"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "UPLOADED_FILES_USE_URL": True,
    # Deshabilitar CSRF para APIs (usamos JWT para autenticación)
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
    ),
}

# === MEDIA (montado como volumen) ===
MEDIA_URL = "/media/"
MEDIA_ROOT = os.getenv("MEDIA_ROOT", str(BASE_DIR / "media"))

# === Backends de autenticación ===
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

# === MercadoPago (cuando lo uses) ===
# MP_ACCESS_TOKEN = os.getenv("MP_ACCESS_TOKEN", "")
# FRONTEND_SUCCESS_URL = os.getenv("FRONTEND_SUCCESS_URL", "http://localhost:3000/success")
# FRONTEND_CANCEL_URL  = os.getenv("FRONTEND_CANCEL_URL", "http://localhost:3000/cancel")
# MP_WEBHOOK_URL = os.getenv("MP_WEBHOOK_URL", "http://127.0.0.1:8000/api/pagos/webhook/mp/")

# === Google Gemini API ===
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
