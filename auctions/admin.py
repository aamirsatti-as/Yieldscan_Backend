from django.contrib import admin

from .models import Auction, AuctionBid, AuctionResult
# Register your models here.

admin.site.register(Auction)
admin.site.register(AuctionBid)
admin.site.register(AuctionResult)