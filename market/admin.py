from django.contrib import admin
from .models import Bid, Ask, Sale, AuctionSale

admin.site.register(Bid)
admin.site.register(Ask)
admin.site.register(Sale)
admin.site.register(AuctionSale)
