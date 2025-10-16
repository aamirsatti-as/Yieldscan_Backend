from django.db import models

from accounts.models import Client

# Create your models here.

class Referral(models.Model):
    id = models.BigAutoField(primary_key=True)
    referrer = models.ForeignKey(Client, on_delete=models.CASCADE)
    referred_user = models.OneToOneField(Client, on_delete=models.CASCADE, related_name='client_referred_user')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.referrer} referred {self.referred_user}"
    
class ReferralAmount(models.Model):
    id = models.AutoField(primary_key=True)
    value = models.IntegerField(default=0)
    is_default = models.BooleanField(default=False)

class ReferralPayout(models.Model):
    id = models.BigAutoField(primary_key=True)
    referrer = models.ForeignKey(Client, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_claimed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.referrer} referred {self.referred_user}"