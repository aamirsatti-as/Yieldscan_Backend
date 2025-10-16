from django.db import models

from accounts.models import Client
from cards.models import CardEntity, Card, Grade

# Create your models here.

class Sale(models.Model):
    id = models.BigAutoField(primary_key=True)
    card_entity = models.OneToOneField(CardEntity, on_delete=models.CASCADE)
    seller = models.ForeignKey(Client, on_delete=models.CASCADE)
    ask_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Sale: {self.card_entity.card.name} - ${self.ask_price}"

class SalesBid(models.Model):
    id = models.BigAutoField(primary_key=True)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, null=True, default=None)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, null= True, default=None)
    bidder = models.ForeignKey(Client, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bid: ${self.amount} by {self.bidder} on {self.card}"