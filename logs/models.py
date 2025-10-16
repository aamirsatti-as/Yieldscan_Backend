from django.db import models

from accounts.models import Client

# Create your models here.

class EventType(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Log(models.Model):
    id = models.BigAutoField(primary_key=True)
    event = models.ForeignKey(EventType, on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event.name} - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
