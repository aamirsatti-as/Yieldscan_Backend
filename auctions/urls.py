from django.urls import path

from . import views

urlpatterns = [
    path("<int:auction_id>/", views.auction_detail, name="auction-detail"),
    path("<int:auction_id>/get-bids", views.get_bids_against_auction, name="get-bids-against-auction"),
    path("<int:auction_id>/place-bid", views.api_place_bid_against_auction, name="place-bid-against-auction"),
    path("<int:auction_id>/all-bids/", views.get_all_bids, name="auction-bids"),
    path("<int:auction_id>/bid/", views.place_bid, name="bid"),
    path("get-auctions/", views.get_auctions, name="get-auctions"),
    path("api/relist-auction", views.api_relist_auction, name="api-relist-auction"),
    path("api/auction-winner/<int:auction_id>", views.api_auction_winner, name="api-auction-winner"),
    path("<int:auction_id>/relist/", views.relist, name="relist"),
    path("all/", views.get_all_auctions, name="all-auctions"),
]
