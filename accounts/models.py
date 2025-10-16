from django.db import models
from django.contrib.auth.models import User


class Currency(models.Model):
    id = models.BigAutoField(primary_key=True)
    currency = models.CharField(blank=True)

    def __str__(self):
        return f"{self.currency}"


class Client(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="images/", null=True, blank=True)
    phone = models.CharField(blank=True)
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True)
    is_admin = models.BooleanField(default=False)  
    @property
    def is_authenticated(self):
        return self.user.is_authenticated

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


class Address(models.Model):
    id = models.BigAutoField(primary_key=True)
    street_address = models.TextField()
    apartment_number = models.TextField(null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.street_address}, {self.client}"
