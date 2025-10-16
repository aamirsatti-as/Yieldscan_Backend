# code
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CasinoSale
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


@receiver(post_save, sender=CasinoSale)
def auction_is_created(sender, instance, created, **kwargs):
    # Broadcast when new auction is created
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "general_all",
        {
            "type": "casino_created",
            "message": "New casino",
        }
    )