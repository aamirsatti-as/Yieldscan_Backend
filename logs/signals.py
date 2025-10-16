# code
from django.db.models.signals import post_save, pre_delete
from wallets.models import FundDepositRequest
from .models import Log, EventType
from django.dispatch import receiver


@receiver(post_save, sender=FundDepositRequest)
def after_save(sender, instance, created, **kwargs):
    if created:
        pass
    else:
        event = EventType.objects.filter(code="funds_approved").first()
        if event:
            log = Log(
                event=event,
                user=instance.client,
                description=f"Funds have been approved ({instance.client} - {instance.amount})",
            )
            log.save()
