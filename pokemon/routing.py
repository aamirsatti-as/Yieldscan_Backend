from django.urls import re_path

from .consumers import GeneralConsumer
from casinos.consumers import CasinoConsumer
from auctions.consumers import AuctionConsumer
from sales.consumers import SaleConsumer

websocket_urlpatterns = [
    re_path(r"ws/general/(?P<room_name>\w+)/$", GeneralConsumer.as_asgi()),
    re_path(r"ws/auction/(?P<room_name>\w+)/$", AuctionConsumer.as_asgi()),
    re_path(r"ws/casino/(?P<room_name>\w+)/$", CasinoConsumer.as_asgi()),
    re_path(r"ws/sale/(?P<room_name>[\w-]+)/$", SaleConsumer.as_asgi()),
]
