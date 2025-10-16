from django.shortcuts import render, get_object_or_404
from django.db.models.functions import TruncDate
from django.db.models import Sum, Avg, Min, Max
from .models import Ask, Bid, Sale
from cards.models import Card
from .serializers import BidSerializer, AskSerializer, SaleSerializer
from django.http import JsonResponse
from django.utils.timezone import now
from datetime import timedelta
from cards.views import get_grouped_bids, get_grouped_asks, get_graded_grouped_asks, get_graded_grouped_bids
from cards.utils import (
    filter_bids_by_grade, 
    filter_asks_by_grade,
    filter_sales_by_grade
)
# Create your views here.

def get_all_market_data(request, card_id, grade_id):
    card = get_object_or_404(Card, id=card_id)

    # Get all historical bids
    bids = Bid.objects.filter(asset=card).order_by("-price")[:20]
    grouped_bids = get_graded_grouped_bids(grade_id, card)
    grouped_asks = get_graded_grouped_asks(grade_id, card)
    # Get all historical asks
    asks = Ask.objects.filter(asset=card).order_by("price")[:20]
    # Get all historical sales
    sales = Sale.objects.filter(asset=card).order_by("-created_at")[:20]
    # grouped_bids = filter_bids_by_grade(grouped_bids,grade_id)
    # grouped_asks = filter_asks_by_grade(grouped_asks,grade_id)
    sales = filter_sales_by_grade(sales,grade_id)
    
    data = {
        "bids": grouped_bids,  
        "asks": grouped_asks,
        # "bids": BidSerializer(bids, many=True).data,
        # "asks": AskSerializer(asks, many=True).data,
        "sales": SaleSerializer(sales, many=True).data,
    }

    return JsonResponse({"success": True, "data": data})


def get_all_sales_data(request, card_id, date):
    card = get_object_or_404(Card, id=card_id)

    today = now().date()

    timeframes = {
        "1m": today - timedelta(days=30),
        "3m": today - timedelta(days=90),
        "6m": today - timedelta(days=180),
        "8m": today - timedelta(days=240),
        "1y": today - timedelta(days=365),
    }

    if date not in timeframes:
        return JsonResponse(
            {"success": False, "error": "Invalid timeframe"}, status=400
        )

    objects = Sale.objects.filter(asset=card, created_at__gte=timeframes[date])

    # Get all historical sales
    sales_aggregated = (
        objects.annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(
            quantity=Sum("quantity"),
            max_price=Max("price"),
            min_price=Min("price"),
            avg_price=Avg("price"),
        )
        .order_by("date")
    )

    overall_stats = objects.aggregate(
        min_price=Min("price"),
        max_price=Max("price"),
        min_quantity=Min("quantity"),
        max_quantity=Max("quantity"),
    )

    return JsonResponse(
        {
            "success": True,
            "data": {"sales": list(sales_aggregated), "overall_stats": overall_stats},
        }
    )
