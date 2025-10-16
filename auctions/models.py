from django.db import models
from django.utils import timezone
from accounts.models import Client
from cards.models import CardEntity
from pokemon.utils import format_time_remaining


class Auction(models.Model):
    id = models.BigAutoField(primary_key=True)
    card_entity = models.ForeignKey(CardEntity, on_delete=models.CASCADE)
    starting_price = models.DecimalField(max_digits=10, decimal_places=2)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField()

    @property
    def seller(self):
        return self.card_entity.owner

    @property
    def total_bids(self):
        return self.auctionbid_set.count()
    
    @property
    def highest_bid(self):
        if self.auctionbid_set.count() > 0:
            return self.auctionbid_set.order_by('-amount').first().amount
        else:
            return None
            # return self.starting_price
    
    @property
    def highest_bid_record(self):
        if self.auctionbid_set.count() > 0:
            return self.auctionbid_set.order_by('-amount').first()
        else:
            return self.starting_price

    @property
    def is_active(self):
        return self.start_time <= timezone.now() < self.end_time

    @property
    def has_ended(self):
        return self.end_time <= timezone.now()

    @property
    def time_remaining(self):
        print('self.end_time ',self.end_time , timezone.now(), self.end_time - timezone.now())
        
        return format_time_remaining(self.end_time - timezone.now())
    
    @property
    def end_time_formatted(self):
        return timezone.localtime(self.end_time).strftime("%a, %-I:%M %p")

    def __str__(self):
        return f"Auction for {self.card_entity.card.name} (#{self.id})"


class AuctionBid(models.Model):
    id = models.BigAutoField(primary_key=True)
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE)
    bidder = models.ForeignKey(Client, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bid by {self.bidder} on {self.auction.card_entity.card.name} (${self.amount})"
    
    @property
    def created_at_formatted(self):
        return timezone.localtime(self.timestamp).strftime("%H:%M %d/%m/%Y")
    


class AuctionResult(models.Model):
    id = models.BigAutoField(primary_key=True)
    auction = models.OneToOneField(Auction, on_delete=models.CASCADE)
    winner = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    completed_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Auction #{self.auction.id} Result - Winner: {self.winner}"
