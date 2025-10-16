from django.contrib import admin
from .models import FundDepositRequest, Wallet

# Register your models here.
admin.site.register(FundDepositRequest)
admin.site.register(Wallet)