from rest_framework import serializers
from .models import Card, CardEntity, Grade, CardSet, Collections, Portfolio

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = "__all__"


class CardSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardSet
        fields = "__all__"


class CardSerializer(serializers.ModelSerializer):
    set = CardSetSerializer(read_only=True)
    grade = GradeSerializer(read_only=True)
    avg_price = serializers.ReadOnlyField()

    class Meta:
        model = Card
        fields = "__all__"


class CardEntitySerializer(serializers.ModelSerializer):
    card = CardSerializer(read_only=True)
    grade = GradeSerializer(read_only=True)

    class Meta:
        model = CardEntity
        fields = "__all__"

class CollectionSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = Collections
        fields = "__all__"


class PortfolioSerializer(serializers.ModelSerializer):
    card = CardSerializer(read_only=True)
    class Meta:
        model = Portfolio
        fields = "__all__"