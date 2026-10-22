import os
from pathlib import Path
from datetime import timedelta
from urllib.parse import urlparse

from decouple import config, Csv
import dj_database_url
from django.core.exceptions import ImproperlyConfigured

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# ====================== CORE ======================
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# ====================== CORS & CSRF ======================
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='', cast=Csv())
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='', cast=Csv())

# ====================== APPS ======================
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',
    'anymail',
    # Your apps
    'accounts',
    'trading',
    'dashboard',
    'wallet',
    'forex',
    'agents',
    'customercare',
    'mt5',
    'equity',
    'notifications',
    'management.apps.ManagementConfig',
    'traderpulse',
    'copy_trading.apps.CopyTradingConfig',
    'mpesa_simulator.apps.MpesaSimulatorConfig',
    'mpesa_message_notification',
    'deriv.apps.DerivConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'projectx.middleware.DatabaseRetryMiddleware',  # Update this path if needed
]

ROOT_URLCONF = 'betatrader.urls'  # Changed for new project
AUTH_USER_MODEL = 'accounts.User'
ASGI_APPLICATION = 'betatrader.asgi.application'

AUTHENTICATION_BACKENDS = [
    'accounts.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# ====================== DATABASE ======================
if "DATABASE_URL" in os.environ:
    DATABASES = {
        "default": dj_database_url.parse(
            os.environ["DATABASE_URL"],
            conn_max_age=300,
            conn_health_checks=True,
            ssl_require=True,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
            "OPTIONS": {"timeout": 60},
            "ATOMIC_REQUESTS": True,
        }
    }

DATABASES['default']['CONN_MAX_AGE'] = 0

# ====================== REDIS / CHANNELS ======================
REDIS_URL = os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/0")

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [REDIS_URL],
            "symmetric_encryption_keys": [SECRET_KEY],
            "capacity": 1000,
            "expiry": 60,
        },
    },
}

# ====================== CELERY ======================
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# ====================== REST FRAMEWORK + JWT ======================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'accounts.authentication.SuspendedUserJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ====================== EMAIL (Resend) ======================
EMAIL_BACKEND = "anymail.backends.resend.EmailBackend"
ANYMAIL = {
    "RESEND_API_KEY": config('RESEND_API_KEY'),
}
DEFAULT_FROM_EMAIL = "TraderiserApp <noreply@mail.traderiserapp.com>"
SERVER_EMAIL = DEFAULT_FROM_EMAIL
EMAIL_SUBJECT_PREFIX = "[Traderiser] "
ADMIN_EMAIL = config('ADMIN_EMAIL', default='steomustadd@gmail.com')

# ====================== S3 / MEDIA ======================
AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID', default=None)
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY', default=None)
AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME', default=None)
AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')

if DEBUG or not AWS_STORAGE_BUCKET_NAME:
    DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
    MEDIA_ROOT = BASE_DIR / 'media'
    MEDIA_URL = '/media/'
else:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_DEFAULT_ACL = None
    AWS_S3_FILE_OVERWRITE = False
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/'

# ====================== WEB PUSH ======================
VAPID_PUBLIC_KEY = config('VAPID_PUBLIC_KEY')
VAPID_PRIVATE_KEY = config('VAPID_PRIVATE_KEY')
VAPID_ADMIN_EMAIL = "mailto:steomustadd@gmail.com"

# ====================== DERIV ======================
DERIV_APP_ID = config('DERIV_APP_ID', default=None)
DERIV_OAUTH_REDIRECT_URI = config('DERIV_OAUTH_REDIRECT_URI', default=None)
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')

if not DERIV_APP_ID:
    raise ImproperlyConfigured("DERIV_APP_ID is missing")
if not DERIV_OAUTH_REDIRECT_URI:
    raise ImproperlyConfigured("DERIV_OAUTH_REDIRECT_URI is missing")

# ====================== OTHER ======================
OPENAI_API_KEY = config('OPENAI_API_KEY', default=None)
OPENAI_MODEL = config('OPENAI_MODEL', default='gpt-3.5-turbo')
POLYGON_API_KEY = config('POLYGON_API_KEY')  # Move this to .env

# Session / Cookies
SESSION_COOKIE_AGE = 1209600
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = not DEBUG
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# Static
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]