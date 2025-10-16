from django.db import models

from accounts.models import Client

# Create your models here.

class Wallet(models.Model):
    id = models.BigAutoField(primary_key=True)
    funds = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.client}'s Wallet"
    
class FundDepositRequest(models.Model):
    id = models.BigAutoField(primary_key=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Deposit Request {self.id} - {self.client}"