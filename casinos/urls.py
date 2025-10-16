from django.urls import path

from . import views

urlpatterns = [
    path("<int:casino_id>/", views.casino_detail, name="casino-detail"),
    path("<int:casino_id>/buy/", views.buy_slot, name="buy-slot"),
    path("api/buy-slot/<int:casino_id>", views.api_buy_slot, name="api-buy-slot"),
    path("<int:casino_id>/cards/", views.show_all_cards, name="show-all-cards"),
    path("all/", views.get_all_casinos, name="all-casinos"),
    path("<int:casino_id>/participants", views.get_all_casino_participants, name="casino-participants"),
]
