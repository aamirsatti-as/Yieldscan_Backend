from django.urls import path

from . import views
from sales.views import place_bid, buy_now, set_ask, sell_now

urlpatterns = [
    path("", views.index, name="index"),
    path("api/cards/place-bid", views.api_place_bid, name="api-place-bid"),
    path("api/cards/set-ask", views.api_set_ask, name="api-set-ask"),
    path("api/cards/sell-now", views.api_sell_now, name="api-sell-now"),
    path("api/cards/orders-and-auctions", views.get_auctions_and_orders_data, name="get_auctions_and_orders_data"),
    path("api/cards/buy-now", views.api_buy_now, name="api-buy-now"),
    path("api/cards/card-data/<str:card_id>/<str:grade_id>", views.get_card_data, name="get-card-data"),
    path("card-detail/<str:card_id>/", views.detail, name="detail"),
    path("card-detail/<str:card_id>/bid/", place_bid, name="sales-bid"),
    path("card-detail/<int:card_id>/buy/", buy_now, name="buy-now"),
    path("card-detail/<str:card_id>/sale/", set_ask, name="set-ask"),
    path("card-detail/<int:card_id>/sell_now/", sell_now, name="sell-now"),
    path(
        "card-detail/<str:card_id>/set_auction/", views.set_auction, name="set-auction"
    ),
    path(
        "card-detail/<str:card_id>/asks/",
        views.get_all_asks,
        name="all-asks",
    ),
    path("search/", views.search, name="search"),
    path("api/search/", views.search_cards, name="api-search"),
    path("news/", views.news, name="news"),
    path("about/", views.about, name="about"),
    path("help/", views.help, name="help"),
    path("favorite/all", views.get_all_favorites, name="all-favorites"),
    path(
        "favorite/<str:card_id>/",
        views.toggle_card_favorite,
        name="toggle-card-favorite",
    ),
    path(
        "collections/<int:collection_id>/<str:card_id>/",
        views.remove_card_from_collection,
        name="remove-card-from-collection",
    ),
    path("card-detail/<str:card_id>/add-to-collection/", views.add_to_collection_page, name="add-to-collection-page"),
    path("card-detail/<str:card_id>/<str:grade>", views.detail_with_grade, name="detail_with_grade"),
]
