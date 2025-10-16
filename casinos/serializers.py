from rest_framework import serializers
from .models import CasinoSale, BoosterBox, CasinoSaleParticipant
from accounts.serializers import ClientSerializer
from cards.serializers import GradeSerializer


class BoosterBoxSerializer(serializers.ModelSerializer):
    grade = GradeSerializer(read_only=True)

    class Meta:
        model = BoosterBox
        fields = "__all__"


class CasinoSaleSerializer(serializers.ModelSerializer):
    seller = ClientSerializer(read_only=True)
    booster_box = BoosterBoxSerializer(read_only=True)

    total_participants = serializers.ReadOnlyField()
    available_slots = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    time_till_start = serializers.ReadOnlyField()
    time_remaining = serializers.ReadOnlyField()
    time_remaining_formatted = serializers.ReadOnlyField()
    end_time_formatted = serializers.ReadOnlyField()
    time_till_start_without_days = serializers.ReadOnlyField()

    class Meta:
        model = CasinoSale
        fields = "__all__"


class CasinoSaleParticipantCombinedSerializer(serializers.Serializer):
    name = serializers.CharField()
    total = serializers.IntegerField()

    class Meta:
        model = CasinoSaleParticipant
        fields = ["name", "total"]


class CasinoSaleParticipantSerializer(serializers.ModelSerializer):
    user = ClientSerializer(read_only=True)
    time_ago = serializers.ReadOnlyField()

    class Meta:
        model = CasinoSaleParticipant
        fields = "__all__"
