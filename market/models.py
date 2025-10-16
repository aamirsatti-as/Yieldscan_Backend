from django.db import models
from django.utils import timezone
from accounts.models import Client
from cards.models import Card, Grade
from auctions.models import AuctionResult

class Ask(models.Model):
    asset = models.ForeignKey(Card, on_delete=models.CASCADE)
    user = models.ForeignKey(Client, on_delete=models.CASCADE)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, null= True, blank=True)  
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True) 

    @property
    def created_at_formatted(self):
        return timezone.localtime(self.created_at).strftime("%H:%M %d/%m/%Y")
    
    @property
    def created_at_formatted_no_time(self):
        return timezone.localtime(self.created_at).strftime("%d/%m/%Y")

    def __str__(self):
        return f"Ask: {self.asset.name} - ${self.price} ({self.quantity} available)"


class Bid(models.Model):
    options = [
        ('auction', 'Auction'),
        ('sales', 'Sales')
    ]

    asset = models.ForeignKey(Card, on_delete=models.CASCADE)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, null= True, blank=True)  
    user = models.ForeignKey(Client, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    type = models.CharField(choices=options, default=None, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)  # Deactivate when fulfilled/canceled

    @property
    def created_at_formatted(self):
        return timezone.localtime(self.created_at).strftime("%H:%M %d/%m/%Y")
    
    @property
    def created_at_formatted_no_time(self):
        return timezone.localtime(self.created_at).strftime("%d/%m/%Y")

    def __str__(self):
        return f"Bid: {self.asset.name} - ${self.price} ({self.quantity} requested)"


class Sale(models.Model):
    asset = models.ForeignKey(Card, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, null= True, blank=True)  
    buyer = models.ForeignKey(Client, blank=True, null=True, on_delete=models.SET_NULL, related_name="buyer")
    seller = models.ForeignKey(Client, blank=True, null=True, on_delete=models.SET_NULL, related_name="seller")
    quantity = models.PositiveIntegerField()
    created_at = models.DateTimeField(default=timezone.now)

    @property
    def created_at_formatted(self):
        return timezone.localtime(self.created_at).strftime("%H:%M %d/%m/%Y")
    
    @property
    def created_at_formatted_no_time(self):
        return timezone.localtime(self.created_at).strftime("%d/%m/%Y")

    def __str__(self):
        return f"Sale: {self.asset.name} - ${self.price} ({self.quantity} units)"
    

class AuctionSale(models.Model):
    asset = models.ForeignKey(Card, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    buyer = models.ForeignKey(Client, blank=True, null=True, on_delete=models.SET_NULL, related_name="auction_buyer")
    seller = models.ForeignKey(Client, blank=True, null=True, on_delete=models.SET_NULL, related_name="auction_seller")
    auction_result = models.ForeignKey(AuctionResult, blank=True, null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Auction Sale: {self.asset.name} - ${self.price}"


class MarketHistory(models.Model):
    asset = models.ForeignKey(Card, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    volume = models.PositiveIntegerField()  # Total quantity traded
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"History: {self.asset.name} - ${self.price} ({self.volume} units @ {self.timestamp})"
