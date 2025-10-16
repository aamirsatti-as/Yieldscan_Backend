from rest_framework import serializers
from .models import Ask, Bid, Sale
from cards.serializers import CardSerializer

class AskSerializer(serializers.ModelSerializer):
    asset = CardSerializer(read_only=True)
    created_at_formatted = serializers.ReadOnlyField()

    class Meta:
        model = Ask
        fields = "__all__"

class BidSerializer(serializers.ModelSerializer):
    asset = CardSerializer(read_only=True)
    created_at_formatted = serializers.ReadOnlyField()

    class Meta:
        model = Bid
        fields = "__all__"

class SaleSerializer(serializers.ModelSerializer):
    asset = CardSerializer(read_only=True)
    created_at_formatted = serializers.ReadOnlyField()

    class Meta:
        model = Sale
        fields = "__all__"

class SaleWithDateSerializer(serializers.ModelSerializer):
    asset = CardSerializer(read_only=True)
    created_at_formatted = serializers.ReadOnlyField()
    date = serializers.DateField()

    class Meta:
        model = Sale
        fields = "__all__"