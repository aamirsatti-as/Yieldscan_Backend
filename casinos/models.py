from django.db import models
from django.utils import timezone
from datetime import timedelta
from accounts.models import Client
from cards.models import BoosterBox, CardEntity
from pokemon.utils import format_time_remaining

# Create your models here.


class CasinoSale(models.Model):
    id = models.BigAutoField(primary_key=True)
    seller = models.ForeignKey(Client, on_delete=models.CASCADE)
    booster_box = models.ForeignKey(BoosterBox, on_delete=models.CASCADE)
    entry_fee = models.DecimalField(max_digits=10, decimal_places=2)
    max_participants = models.IntegerField(default=1)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        total_cards = 0
        if self.booster_box:
            for pack in self.booster_box.packs.all():
                total_cards = total_cards + pack.total_cards
            self.max_participants = total_cards
        super().save(*args, **kwargs)

    @property
    def total_participants(self):
        return self.casinosaleparticipant_set.count()

    @property
    def available_slots(self):
        return max(self.max_participants - self.total_participants, 0)

    @property
    def is_active(self):
        return self.start_time <= timezone.now() < self.end_time

    @property
    def is_sold_out(self):
        return self.total_participants == self.max_participants

    @property
    def is_ended(self):
        return timezone.now() >= self.end_time

    @property
    def has_to_start(self):
        return timezone.now() < self.start_time
    
    @property
    def can_buy_slot(self):
        return self.is_active and not self.is_sold_out

    @property
    def time_till_start(self):
        delta = self.start_time - timezone.now()
        return {
            "days": delta.days,
            "hours": delta.seconds // 3600,
            "minutes": (delta.seconds % 3600) // 60,
            "seconds": delta.seconds % 60,
        }
    
    @property
    def time_till_start_without_days(self):
        if self.is_active:
            return {
            "days": 0,
            "hours": 0,
            "minutes": 0,
            "seconds": 0,
        }
        
        delta = self.start_time - timezone.now()
        total_hours = delta.days * 24 + delta.seconds // 3600
        return {
            "days": delta.days,
            "hours": total_hours,
            "minutes": (delta.seconds % 3600) // 60,
            "seconds": delta.seconds % 60,
        }
        

    @property
    def time_remaining(self):
        delta = self.end_time - timezone.now()
        return {
            "days": delta.days,
            "hours": delta.seconds // 3600,
            "minutes": (delta.seconds % 3600) // 60,
            "seconds": delta.seconds % 60,
        }

    @property
    def time_remaining_formatted(self):
        return format_time_remaining(self.end_time - timezone.now())
    
    @property
    def end_time_formatted(self):
        return timezone.localtime(self.end_time).strftime("%a, %#I:%M%p")
    @property
    def end_time_formatted_new(self):
        return timezone.localtime(self.end_time).strftime("%d %b %Y, %I:%M %p")

    def __str__(self):
        return f"Casino Sale: {self.booster_box} (Active: {self.is_active})"


class CasinoSaleParticipant(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(Client, on_delete=models.CASCADE)
    casino_sale = models.ForeignKey(CasinoSale, on_delete=models.CASCADE)
    assigned_card = models.ForeignKey(
        CardEntity, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def time_ago(self):
        return self.created_at.strftime("%b %d, %Y")
        # now = timezone.now()
        # delta = now - self.created_at

        # if delta < timedelta(minutes=1):
        #     return f"{delta.seconds} seconds ago"
        # elif delta < timedelta(hours=1):
        #     return f"{delta.seconds // 60} minutes ago"
        # elif delta < timedelta(days=1):
        #     return f"{delta.seconds // 3600} hours ago"
        # elif delta < timedelta(weeks=1):
        #     return f"{delta.days} days ago"
        # else:
        #     return f"{delta.days // 7} weeks ago"

    def __str__(self):
        return f"{self.user} in {self.casino_sale.booster_box}"
