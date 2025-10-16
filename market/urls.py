from django.urls import path

from . import views

urlpatterns = [
    path("sales_data/<str:card_id>/date/<str:date>/", views.get_all_sales_data, name="all-sales-data"),
    path("market_data/<str:card_id>/<str:grade_id>", views.get_all_market_data, name="all-market-data"),
]
