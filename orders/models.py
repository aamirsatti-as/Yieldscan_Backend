from django.utils import timezone

from django.db import models

from accounts.models import Client
from cards.models import CardEntity

# Create your models here.

ORDER_STATUS_CHOICES = [
    ("pending", "Pending"),
    ("processing", "Processing"),
    ("completed", "Completed"),
    ("canceled", "Canceled"),
]

class SaleType(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True) 

    def __str__(self):
        return self.name

class Order(models.Model):
    id = models.BigAutoField(primary_key=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    card = models.ForeignKey(CardEntity, null=False, on_delete=models.CASCADE)
    client = models.ForeignKey(Client,null=False, on_delete=models.CASCADE)
    placed_on = models.DateTimeField(default=timezone.now)
    updated_on = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default="pending")
    payment_method = models.CharField(max_length=50, null=True, blank=True)
    sale_type = models.ForeignKey(SaleType, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Order {self.id} - {self.client}"
