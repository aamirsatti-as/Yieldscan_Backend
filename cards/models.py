from django.db import models
from django.utils import timezone
from decimal import Decimal

from accounts.models import Client

# Create your models here.

from django.db import models

class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.name

class CardSet(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=200)
    series = models.CharField(max_length=200)
    printed_total = models.IntegerField()
    total = models.IntegerField()
    legalities = models.JSONField(default=dict)
    ptcgo_code = models.CharField(max_length=10)
    release_date = models.DateField()
    updated_at = models.DateTimeField()
    images = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.name} ({self.id})"

class Grade(models.Model):
    id = models.BigAutoField(primary_key=True)
    value = models.CharField(max_length=200, unique=True)
    description = models.TextField(max_length=500, blank=True)

    def __str__(self):
        return self.value

class Card(models.Model):
    CONDITION_CHOICES = [
        ("new", "New"),
        ("used", "Used"),
        ("not_specified", "Not Specified"),
    ]

    id = models.CharField(max_length=200, primary_key=True)
    name = models.CharField(max_length=200)
    supertype = models.CharField(max_length=200)
    subtypes = models.JSONField(default=list, blank=True)
    level = models.CharField(max_length=200, blank=True)
    hp = models.CharField(max_length=200, blank=True)
    types = models.JSONField(default=list, blank=True)
    evolves_from = models.CharField(max_length=200, blank=True)
    evolves_to = models.JSONField(blank=True, default=list)
    rules = models.JSONField(blank=True, default=list)
    ancient_trait = models.JSONField(default=dict, blank=True)
    abilities = models.JSONField(default=list, blank=True)
    attacks = models.JSONField(default=list, blank=True)
    weaknesses = models.JSONField(default=list, blank=True)
    resistances = models.JSONField(default=list, blank=True)
    retreat_cost = models.JSONField(default=list, blank=True)
    convertedRetreatCost = models.PositiveIntegerField(blank=True)
    set = models.ForeignKey(CardSet, on_delete=models.SET_NULL, null=True, blank=True)
    number = models.CharField(max_length=200, blank=True)
    artist = models.CharField(max_length=200, blank=True)
    rarity = models.CharField(max_length=200, blank=True)
    flavor_text = models.CharField(max_length=200, blank=True)
    national_pokedex_numbers = models.JSONField(default=list, blank=True)
    legalities = models.JSONField(default=dict, blank=True)
    regulation_mark = models.CharField(max_length=200, blank=True)
    images = models.JSONField(default=dict, blank=True)
    tcgplayer = models.JSONField(default=dict, blank=True)
    cardmarket = models.JSONField(default=dict, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    is_featured = models.BooleanField(default=False, blank=True)
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default="not_specified", blank=True, null=True)
    image = models.ImageField(upload_to='card-images/', blank=True, null=True)
    added_on = models.DateTimeField(auto_now_add=True)

    @property
    def avg_price(self):
        if self.tcgplayer and self.tcgplayer.get("prices") and self.tcgplayer["prices"].get("holofoil"):
            return self.tcgplayer["prices"]["holofoil"].get("mid", 0)
        elif self.cardmarket and self.cardmarket.get("prices"):
            return self.cardmarket["prices"].get("avg1", 0)
        return 0
    
    @property
    def name_extended(self):
        set_name = self.set.series if self.set else "Unknown Set"
        set_id = self.set.id if self.set else "Unknown ID"
        # return f"{self.name} - {set_id.upper()}:{set_name} ({set_id.upper()})"
        return f"{self.name} : {set_name}"
    
    def __str__(self):
        return f"{self.name} ({self.id})"
    
class CardEntity(models.Model):
    id = models.BigAutoField(primary_key=True)
    card = models.ForeignKey(Card, on_delete=models.SET_NULL, null=True)
    owner = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True)
    original_owner = models.ForeignKey(Client, null=True, on_delete=models.SET_NULL, related_name='original_owner')
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True)
    ask_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    on_sale = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    @property
    def card_name(self):
        return f"{self.card}"
    
    def __str__(self):
        return f"{self.card.name} - {self.owner}"
    
class Wishlist(models.Model):
    id = models.BigAutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    cards = models.ManyToManyField(Card)

    def __str__(self):
        return f"{self.client}'s wishlist"
    
class BoosterPack(models.Model):
    id = models.BigAutoField(primary_key=True)
    pack_name = models.CharField(max_length=200)
    cards = models.ManyToManyField(Card) 
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def total_cards(self):
        return self.cards.count()

    def __str__(self):
        return self.pack_name

class BoosterBox(models.Model):
    id = models.BigAutoField(primary_key=True)
    box_name = models.CharField(max_length=200)
    packs = models.ManyToManyField(BoosterPack)
    release_date = models.DateField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='booster-box-images/')
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, default=None)

    @property
    def total_packs(self):
        return self.packs.count()

    def __str__(self):
        return f"Booster Box: {self.box_name} ({self.total_packs} packs)"
    
class Collections(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=200)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    cards = models.ManyToManyField(Card)
    image = models.ImageField(upload_to='collection-images/', blank=True, null=True)
    added_on = models.DateTimeField(auto_now_add=True)

    @property
    def featured(self):
        return self.cards.all().first()
    
    @property
    def total_cards(self):
        return self.cards.all().count()

    def __str__(self):
        return f"{self.client}'s collection ({self.name})"
    

class Portfolio(models.Model):
    id = models.BigAutoField(primary_key=True)
    card = models.ForeignKey(Card, on_delete=models.SET_NULL, null=True)
    purchase_date = models.DateField()
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def market_value(self):
        return self.card.avg_price
    
    @property
    def gain_or_loss(self):
        return Decimal(self.market_value) - self.purchase_price
    
    @property
    def gain_or_loss_percentage(self):
        return self.gain_or_loss / self.purchase_price * 100

    def __str__(self):
        return f"{self.client}"