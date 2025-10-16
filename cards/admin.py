from django.contrib import admin

from .models import Card, CardSet, Category, CardEntity, Grade, BoosterBox, BoosterPack, Wishlist, Collections, Portfolio

# Register your models here.

admin.site.register(Card)
admin.site.register(CardSet)
admin.site.register(Category)
admin.site.register(CardEntity)
admin.site.register(Grade)
admin.site.register(BoosterBox)
admin.site.register(BoosterPack)
admin.site.register(Wishlist)
admin.site.register(Collections)
admin.site.register(Portfolio)