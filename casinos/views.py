from django.shortcuts import render, get_object_or_404, redirect
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.http import JsonResponse
from django.utils import timezone
import json
from django.db import transaction
from django.contrib import messages
from django.db.models import Count
from django.contrib.auth.decorators import login_required
from .models import CasinoSale, CasinoSaleParticipant
from .forms import CasinoSaleForm
from cards.models import Card, BoosterBox
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from accounts.models import Client
from wallets.models import Wallet
from .serializers import CasinoSaleSerializer, CasinoSaleParticipantSerializer
from pokemon.utils import paginate


def casino_detail(request, casino_id):
    now = timezone.now()
    client = None

    if request.user.is_authenticated:
        client = Client.objects.get(user=request.user)

    casino_sale = get_object_or_404(CasinoSale, id=casino_id)
    used_slots = CasinoSaleParticipant.objects.filter(casino_sale=casino_sale).count()
    # booster_cards = Card.objects.filter(
    #     boosterpack__boosterbox=casino_sale.booster_box.id
    # )[:4]

    # participants = []
    # client_participants = (
    #     CasinoSaleParticipant.objects.filter(casino_sale=casino_id)
    #     .values("user__id")
    #     .annotate(total=Count("id"))
    # )
    # for entry in client_participants:
    #     client = Client.objects.get(id=entry["user__id"])
    #     participants.append({"name": client, "quantity": entry["total"]})

    # own_participants = []
    # own_client_participants = (
    #     CasinoSaleParticipant.objects.filter(casino_sale=casino_id, user=client)
    #     .values("user__id")
    #     .annotate(total=Count("id"))
    # )
    # for entry in own_client_participants:
    #     client = Client.objects.get(id=entry["user__id"])
    #     own_participants.append({"name": client, "quantity": entry["total"]})

    casino_sales = CasinoSale.objects.filter().order_by("-end_time").exclude(id=casino_id)[:4]
    participants = CasinoSaleParticipant.objects.filter(casino_sale=casino_sale).order_by("-created_at")
    own_participants = CasinoSaleParticipant.objects.filter(casino_sale=casino_sale, user=client).order_by("-created_at")
    # own_participants.delete()
    # participants.delete()
    context = {
        "casino_sale": casino_sale,
        "participants": participants,
        "own_participants": own_participants,
        "used_slots": used_slots,
        "casino_sales": casino_sales        
    }

    return render(request, "casinos/detail.html", context)


def show_all_cards(request, casino_id):
    page = request.GET.get('page', 1)
    limit = request.GET.get('limit', 10)
    casinos = CasinoSale.objects.exclude(id=casino_id).all()
    context = paginate(casinos, page, limit, 'casinos')
    return render(request, "casinos/cards.html", context)


@csrf_exempt
@require_http_methods(["POST"])
def api_buy_slot(request, casino_id):
    try:
        if not request.user.is_authenticated:
            return JsonResponse({
                "status": "error",
                "message": "You need to be logged in to buy a slot"
            }, status=401)

        channel_layer = get_channel_layer()
        form = CasinoSaleForm(request.POST or None)
        casino_sale = get_object_or_404(CasinoSale, id=casino_id)
        client = get_object_or_404(Client, user=request.user)
        wallet = get_object_or_404(Wallet, client=client)
        now = timezone.now()

        if not (casino_sale.start_time <= now <= casino_sale.end_time):
            return JsonResponse({"message": "Sale is not active."}, status=400)

        # if not casino_sale.is_active:
        #     return JsonResponse({
        #         "status": "error",
        #         "message": "Sale is not active"
        #     }, status=400)

        if casino_sale.available_slots <= 0:
            return JsonResponse({
                "status": "error",
                "message": "No slots available to buy"
            }, status=400)

        if request.method == "POST":
            data = json.loads(request.body.decode('utf-8'))
            quantity = data.get('quantity')
            
            funds_needed = quantity * casino_sale.entry_fee

            if quantity <= 0 or quantity > casino_sale.available_slots:
                return JsonResponse({
                    "status": "error",
                    "message": f"Available slots to buy are only {casino_sale.available_slots}"
                }, status=400)

            if wallet.funds < funds_needed:
                return JsonResponse({
                    "status": "error",
                    "message": "Not enough funds"
                }, status=400)
            admin_wallet = get_object_or_404(Wallet, client=casino_sale.seller)
            try:
                with transaction.atomic():
                    wallet.funds -= funds_needed
                    wallet.save()
                    
                    admin_wallet.funds += funds_needed
                    admin_wallet.save()

                    CasinoSaleParticipant.objects.bulk_create([
                        CasinoSaleParticipant(
                            user=client,
                            casino_sale=casino_sale,
                            assigned_card=None
                        ) for _ in range(quantity)
                    ])

                async_to_sync(channel_layer.group_send)(
                    f"casino_{casino_id}",
                    {
                        "type": "new_participant",
                        "message": "New participant"
                    }
                )
                casino_sale_updated_record = get_object_or_404(CasinoSale, id=casino_id)
                
                async_to_sync(channel_layer.group_send)(
                    f"casino_{casino_id}",
                    {
                        "type": "cards_availability_update",
                        "total_participants": casino_sale_updated_record.total_participants,
                        "max_participants":  casino_sale_updated_record.max_participants,
                    }
                )

                return JsonResponse({
                    "status": "success",
                    "message": "Slot(s) purchased successfully"
                })
            except Exception as e:
                return JsonResponse(
                    {'status': 'error', 'message': str(e)},
                    status=500
                )
    except Exception as e:
        return JsonResponse(
            {'status': 'error', 'message': str(e)},
            status=500
        )

def buy_slot(request, casino_id):
    if not request.user.is_authenticated:
        messages.error(request, "You need to be logged in to buy a slot")
        return redirect(f"/auth/login/?next=/casino/{casino_id}")

    # We have to broadcast when bid
    # someone buys a slot
    channel_layer = get_channel_layer()

    form = CasinoSaleForm(request.POST or None)

    casino_sale = get_object_or_404(CasinoSale, id=casino_id)
    client = get_object_or_404(Client, user=request.user)
    wallet = get_object_or_404(Wallet, client=client)

    # Sale has ended / not started yet so cannot buy a slot
    if not casino_sale.is_active:
        messages.error(request, "Sale is not active")
        return redirect(f"/casino/{casino_id}")

    if casino_sale.available_slots <= 0:
        messages.error(request, "No slots available to buy")
        return redirect(f"/casino/{casino_id}")

    # Validate form
    if request.method == "POST" and form.is_valid():
        quantity = form.cleaned_data["quantity"]
        funds_needed = quantity * casino_sale.entry_fee

        if quantity > 0 and quantity <= casino_sale.available_slots:
            # Check if wallet has enough funds
            if wallet.funds >= funds_needed:
                try:
                    with transaction.atomic():  # Start transaction
                        # Deduct funds from wallet
                        wallet.funds = wallet.funds - funds_needed
                        wallet.save()

                        # Create participant entries
                        CasinoSaleParticipant.objects.bulk_create(
                            [
                                CasinoSaleParticipant(
                                    user=client,
                                    casino_sale=casino_sale,
                                    assigned_card=None,
                                )
                                for _ in range(quantity)
                            ]
                        )
                    async_to_sync(channel_layer.group_send)(
                        f"casino_{casino_id}",
                        {
                            "type": "new_participant",
                            "message": "New participant",
                        },
                    )
                    return redirect(f"/casino/{casino_id}")

                except Exception as e:
                    messages.error(request, f"An error occurred: {str(e)}")
            else:
                messages.error(request, "Not enough funds in wallet")

        else:
            messages.error(
                request,
                f"Quantity should be between 0 and {casino_sale.available_slots}",
            )

    return redirect(f"/casino/{casino_id}")


def get_all_casinos(request):
    now = timezone.now()
    casinos = CasinoSale.objects.filter(start_time__lte=now, end_time__gt=now)[:20]
    serializer = CasinoSaleSerializer(casinos, many=True)
    return JsonResponse({"success": True, "data": serializer.data})


def get_all_casino_participants(request, casino_id):
    client = None

    if request.user.is_authenticated:
        client = Client.objects.get(user=request.user)
    # participants = []
    # client_participants = (
    #     CasinoSaleParticipant.objects.filter(casino_sale=casino_id)
    #     .values("user__id")
    #     .annotate(total=Count("id"))
    # )
    # for entry in client_participants:
    #     client = Client.objects.get(id=entry["user__id"])
    #     participants.append({"name": client, "total": entry["total"]})

    casino_sale = get_object_or_404(CasinoSale, id=casino_id)
    participants = CasinoSaleParticipant.objects.filter(casino_sale=casino_sale).order_by("-created_at")
    own_participants = CasinoSaleParticipant.objects.filter(casino_sale=casino_sale, user=client).order_by("-created_at")


    serializer = CasinoSaleParticipantSerializer(participants, many=True)
    serializer_own = CasinoSaleParticipantSerializer(own_participants, many=True)
    
    data = {
        "own_participants": serializer_own.data,
        "participants": serializer.data
    }
    
    return JsonResponse({"success": True, "data": data})
