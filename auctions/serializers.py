from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Auction, AuctionBid
from accounts.serializers import ClientSerializer
from cards.serializers import CardEntitySerializer


class AuctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auction
        fields = "__all__"


class AuctionBidSerializer(serializers.ModelSerializer):
    bidder = ClientSerializer(read_only=True)

    class Meta:
        model = AuctionBid
        fields = "__all__"


class AuctionSerializer(serializers.ModelSerializer):
    card_entity = CardEntitySerializer(read_only=True)
    highest_bid = serializers.ReadOnlyField()
    total_bids = serializers.ReadOnlyField()
    time_remaining = serializers.ReadOnlyField()
    end_time_formatted = serializers.ReadOnlyField()

    class Meta:
        model = Auction
        fields = "__all__"
