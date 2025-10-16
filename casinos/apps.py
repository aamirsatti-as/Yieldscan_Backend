from django.apps import AppConfig


class CasinosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'casinos'

    def ready(self):
        import casinos.signals