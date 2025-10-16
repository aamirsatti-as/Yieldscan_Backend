# code
from django.db.models.signals import post_save, pre_delete
from .models import FundDepositRequest
from django.dispatch import receiver
from .utils import update_wallet_funds
 
 
@receiver(post_save, sender=FundDepositRequest) 
def after_save(sender, instance, created, **kwargs):
    if created:
        pass
    else:
        update_wallet_funds(instance)