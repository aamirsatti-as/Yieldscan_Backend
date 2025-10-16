from django.contrib import admin

from .models import Client, Currency
# Register your models here.

admin.site.register(Client)
admin.site.register(Currency)