# code
from django.db.models.signals import post_save, pre_save
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Client
from cards.models import Wishlist
from wallets.models import Wallet


@receiver(pre_save, sender=User)
def check_for_duplicate_email_listener(sender, instance, **kwargs):
    check_for_duplicate_email(instance)


@receiver(post_save, sender=User)
def after_save(sender, instance, created, **kwargs):
    if created:
        account = Client.objects.create(user=instance)
        Wallet.objects.create(client=account)
        Wishlist.objects.create(client=account)
    else:
        check_for_duplicate_email(instance)


def check_for_duplicate_email(user):
    if user.email:
        existing_user = (
            User.objects.filter(email=user.email).exclude(pk=user.pk).first()
        )
        if existing_user:
            raise ValidationError(f"A user with email '{user.email}' already exists.")
