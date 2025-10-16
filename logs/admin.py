from django.contrib import admin
from .models import Log, EventType

# Register your models here.
admin.site.register(Log)
admin.site.register(EventType)
