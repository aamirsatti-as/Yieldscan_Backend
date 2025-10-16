from django.urls import path

from . import views

urlpatterns = [
    path("deposit", views.deposit_funds, name="deposit-funds"),
]
