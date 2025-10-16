from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.http import JsonResponse
from django.db import transaction
from django.contrib import messages
from accounts.models import Client
from .models import Auction, AuctionBid
from wallets.models import Wallet
from .forms import BidForm, RelistForm
from .serializers import AuctionBidSerializer, AuctionSerializer
from .utils import someone_made_an_auctionbid
from market.models import Bid, Ask, Sale
from cards.models import Wishlist
from datetime import datetime, timezone as dt_timezone
from sales.models import SalesBid
from decimal import Decimal
from cards.forms import SetAuctionForm
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from django.db.models import Max, Sum, Count, Min
from django.utils.timezone import now
from cards.models import Grade
from django.db.models import Q
from cards.utils import (
    get_all_owned_cards_for_auctions,
    get_all_owned_cards_for_sale,
    get_all_cards_on_sale,
    filter_bids_by_grade, 
    filter_asks_by_grade,
    filter_sales_by_grade,
    get_all_owned_cards_for_sale_by_grade,
    get_all_cards_on_sale_by_grade
)
from auctions.models import Auction, CardEntity
from django.views.decorators.cache import never_cache

@csrf_exempt
@never_cache
@require_http_methods(["GET"])
def get_auctions(request):
    try:
        data = Auction.objects.filter(start_time__lte=timezone.now(), end_time__gt=timezone.now())[:20]
        auctions = []
        for auction in data:
            highest_bid = AuctionBid.objects.filter(auction=auction.id).order_by('-amount').first() 
            highest_bid_amount = 0
            if highest_bid:   
                highest_bid_amount= highest_bid.amount
            auctions.append({
                "id": auction.id,
                "highest_bid":highest_bid_amount 
            })
        return JsonResponse(
            {
                "message": "Fetched Successfully",
                "auctions": auctions,
            },
            status=200
        )

    except Exception as e:
        print('error ',e)
        return JsonResponse(
            {"message": "An error occurred.", "error": str(e)},
            status=500
        )

@csrf_exempt
@require_http_methods(["GET"])
def api_auction_winner(request, auction_id):
    try:
        auction_bids = AuctionBid.objects.filter(auction=auction_id)
        highest_bid = AuctionBid.objects.filter(auction=auction_id).order_by("-amount").first()
        client = get_object_or_404(Client, user=request.user)
        auction = get_object_or_404(Auction, id=auction_id)
        is_owner = False
        if client == auction.card_entity.owner:
            is_owner = True

        if highest_bid is None:
            return JsonResponse(
            {
                "message": "Fetched Successfully",
                'bids' : 0,
                "is_owner":is_owner
            },
            status=200
        )
        first_name = highest_bid.bidder.user.first_name or ''
        last_name = highest_bid.bidder.user.last_name or ''
        full_name = f"{first_name} {last_name}".strip() or "Unknown User"
        return JsonResponse(
            {
                "message": "Fetched Successfully",
                "highest_bidder": full_name,
                'bids' : len(auction_bids),
                "is_owner":is_owner
            },
            status=200
        )

    except Exception as e:
        return JsonResponse(
            {"message": "An error occurred.", "error": str(e)},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
def get_bids_against_auction(request, auction_id):
    try:
        auction = get_object_or_404(Auction, id=auction_id)
        bids = AuctionBid.objects.filter(auction=auction)

        # Serialize the bids if needed
        bids_data = []
        for bid in bids:
            bids_data.append({
                "id": bid.id,
                "amount": float(bid.amount),
                "created_at_formatted": bid.created_at_formatted
            })

        return JsonResponse(
            {
                "message": "Bids fetched successfully",
                "bids": bids_data
            },
            status=200
        )

    except Exception as e:
        return JsonResponse(
            {"message": "An error occurred.", "error": str(e)},
            status=500
        )

@csrf_exempt
@require_http_methods(["POST"])
def api_place_bid_against_auction(request, auction_id):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Please login first"}, status=401)
    channel_layer = get_channel_layer()
    data = json.loads(request.body.decode('utf-8'))
    auction = get_object_or_404(Auction, id=auction_id)
    if auction.has_ended:
        return JsonResponse({"message": "Auction has already ended."}, status=400)
    bidder = get_object_or_404(Client, user=request.user)
    wallet = get_object_or_404(Wallet, client=bidder)
    highest_bid = AuctionBid.objects.filter(auction=auction).order_by("-amount").first()
    if bidder == auction.card_entity.owner:
        return JsonResponse({"message": "You are the owner of this card."}, status=403)
    client_bid = AuctionBid.objects.filter(bidder=bidder, auction=auction_id).order_by("-timestamp").first()
    highest_bid_amount = highest_bid.amount if highest_bid else auction.starting_price
    amount = float(data.get('quantity'))
    if amount <= highest_bid_amount:
        return JsonResponse(
            {"message": f"Your bid must be higher than ${highest_bid_amount}"},
            status=400,
        )

    if wallet.funds < amount:
        return JsonResponse(
            {"message": "Not enough funds in wallet"},
            status=400,
        )

    try:
        with transaction.atomic():
            if client_bid:
                wallet.funds = float(wallet.funds)
                client_bid_amount = float(client_bid.amount or 0)
                amount = float(amount)
                wallet.funds -= (float(amount) - float(client_bid_amount))
                client_bid.amount = amount
                client_bid.save()
            else:
                wallet.funds = float(wallet.funds)
                wallet.funds -= float(amount)
                AuctionBid.objects.create(
                    auction=auction, amount=amount, bidder=bidder
                )

            wallet.save()
            # Broadcast the bid
            async_to_sync(channel_layer.group_send)(
                f"auction_{auction_id}",
                {
                    "type": "bid_placed",
                    "message": "New bid",
                },
            )
            return JsonResponse(
                {"message": f"Bid placed successfully at ${amount}"},
                status=201,
            )
    except Exception as e:
        print(e)
        return JsonResponse(
            {"message": "Something went wrong."},
            status=500,
        )
    


def auction_detail(request, auction_id):
    client = None
    context = {
        "highest_bidder": None,
        "highest_bid": 0,
        "is_owner" : False,
        "placed_bid": False,
        "is_top_bidder": False,
        "fav_card": False
    }

    set_auction_form = SetAuctionForm()

    # Check if a client is logged in
    if request.user.is_authenticated:
        client = Client.objects.get(user_id=request.user)

    # Check if auction exists
    auction = get_object_or_404(Auction, id=auction_id)
    context["auction"] = auction
    context["auction_ended"] = auction.has_ended
    card = auction.card_entity.card

    # Total bids
    total_bids = AuctionBid.objects.filter(auction=auction).count()
    # Get the highest bid placed in this auction
    highest_bid = AuctionBid.objects.filter(auction=auction).order_by("-amount").first()
    if highest_bid:
        first_name = highest_bid.bidder.user.first_name or ''
        last_name = highest_bid.bidder.user.last_name or ''
        full_name = f"{first_name} {last_name}".strip() or "Unknown User"
        context["highest_bidder"] = full_name
        context['sell_price'] = highest_bid.amount
    else:
        current_aution = Auction.objects.get(id=auction_id)
        if current_aution:  
            context['sell_price'] = current_aution.starting_price
        else:
            context['sell_price'] = 0
            

    highest_bid = AuctionBid.objects.filter(auction=auction_id).order_by("-amount").first()
    if highest_bid:
        context["highest_bid"] = highest_bid.amount
    else:
        context["highest_bid"] = 0
    
    fav_card = None
    # Check client related items
    if client:
        # Client's bid
        bid = (
            AuctionBid.objects.filter(bidder=client, auction=auction)
            .order_by("-amount")
            .first()
        )
        if client == auction.card_entity.owner:
            context["is_owner"] = True
            # context['on_auction'] = auction.card_entity.on_auction
        if bid:
            context["placed_bid"] = True
        if highest_bid and highest_bid.bidder == client:
            context["is_top_bidder"] = True
        
        # Check if card is favorite or not
        fav_card = Wishlist.objects.filter(client=client, cards=card).exists()
    # Get all historical bids
    # bids = Bid.objects.filter(asset=card).order_by("-created_at")[:20]
    
    # Get all historical asks
    asks = Ask.objects.filter(asset=card).order_by("-created_at")[:20]
    card_entity_id = auction.card_entity_id
    card_entity = CardEntity.objects.get(id=card_entity_id)
    # Get all historical sales
    sales = Sale.objects.filter(
        Q(asset=card) & 
        (Q(seller=client) | Q(buyer=client))
    ).order_by("-created_at")
    bids = AuctionBid.objects.filter(auction=auction)
    auctions = getAuctionTableData(client)
    orders = getBuyAndSellData(client)
    context['sales'] = sales
    context['auctions'] = auctions
    context["bids"] = bids
    context["total_bids"] = total_bids
    context["fav_card"] = fav_card
    context["set_auction_form"] = set_auction_form
    context['orders'] = orders
    form = BidForm(request.POST or None)
    context["form"] = form
    return render(request, "auctions/detail.html", context)


@login_required
def place_bid(request, auction_id):
    # We have to broadcast when bid
    # is placed
    channel_layer = get_channel_layer()

    # Check if auction has ended
    auction = get_object_or_404(Auction, id=auction_id)
    if auction.has_ended:
        return redirect(f"/auction/{auction_id}")

    highest_bid_amount = 0
    form = BidForm(request.POST or None)
    bidder = get_object_or_404(Client, user=request.user)
    wallet = get_object_or_404(Wallet, client=bidder)
    highest_bid = AuctionBid.objects.filter(auction=auction).order_by("-amount").first()
    card = auction.card_entity.card

    if bidder == auction.card_entity.owner:
        messages.error(request, "You are the owner of this card.")
    else:
        # Get the clients latest bid
        client_bid = (
            AuctionBid.objects.filter(bidder=bidder, auction=auction)
            .order_by("-timestamp")
            .first()
        )

        # Collect the current highest bid in the auction
        if highest_bid:
            highest_bid_amount = highest_bid.amount
        else:
            highest_bid_amount = auction.starting_price

        # Validate form
        if request.method == "POST" and form.is_valid():
            amount = form.cleaned_data["bid_amount"]

            # Check if entered amount is valid i.e bigger than previous (highest) bid
            if amount > highest_bid_amount:
                # Check if wallet has enough
                # funds
                if wallet.funds >= amount:
                    try:
                        with transaction.atomic():
                            # If client has already bid, then
                            # increase the amount of the bid
                            if client_bid:
                                wallet.funds = float(wallet.funds) - (
                                    float(amount) - float(client_bid.amount)
                                )
                                client_bid.amount = amount
                                client_bid.save()
                            else:
                                # Place a new bid
                                wallet.funds = float(wallet.funds) - float(amount)
                                AuctionBid.objects.create(
                                    auction=auction, amount=amount, bidder=bidder
                                )
                            someone_made_an_auctionbid(card, bidder, amount, 1)
                            wallet.save()
                            messages.success(
                                request, f"Bid placed successfully at ${amount}"
                            )
                            # Broadcast that a bid had been placed
                            async_to_sync(channel_layer.group_send)(
                                f"auction_{auction_id}",
                                {
                                    "type": "bid_placed",
                                    "message": "New bid",
                                }
                            )
                            return redirect(f"/auction/{auction_id}")
                    except Exception as e:
                        print(e)
                        messages.error(request, "Something went wrong")

                else:
                    messages.error(request, "Not enough funds in wallet")

            else:
                messages.error(
                    request, f"Your bid must be higher than ${highest_bid_amount}"
                )

    context = {"form": form, "highest_bid": highest_bid_amount, "auction": auction}
    return render(request, "auctions/bid-form.html", context)

@csrf_exempt
@login_required
@require_http_methods(["POST"])
def api_relist_auction(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"message": "Invalid JSON."}, status=400)
    starting_price = data.get("startingPrice")
    end_time_str = data.get("endTime")
    auctionId = data.get("auctionId")
    try:
        old_auction = Auction.objects.get(id=auctionId)
    except Auction.DoesNotExist:
        return JsonResponse({"message": "Auction not found."}, status=404)
    
    # total_auctions = Auction.objects.filter(card_entity=old_auction.card_entity)
    total_auctions = Auction.objects.filter(
        card_entity=old_auction.card_entity,
        end_time__gt=timezone.now()
    )
    if(len(total_auctions) > 0):
        return JsonResponse({"message": "Auction already listed."}, status=400)
    try:
        client = Client.objects.get(user_id=request.user)
    except Client.DoesNotExist:
        return JsonResponse({"message": "Client not found."}, status=404)

    # Ownership check
    if old_auction.card_entity.owner != client:
        return JsonResponse({"message": "Unauthorized. Not the owner of the card."}, status=403)

    end_time = datetime.strptime(end_time_str, "%Y-%m-%dT%H:%M:%S.%fZ")
    # end_time = timezone.make_aware(end_time, timezone.utc)
    end_time = end_time.replace(tzinfo=dt_timezone.utc)
    # Check if the time is in the future
    if end_time <= timezone.now():
        return JsonResponse({"message": "End time must be in the future"}, status=400)        
    # Create new auction
    auction = Auction.objects.create(
        end_time=end_time_str,
        starting_price=starting_price,
        card_entity=old_auction.card_entity
    )

    return JsonResponse({
        "message": "Auction relisted successfully.",
        "auction_id": str(auction.id),
        "redirect_url": f"/auction/{auction.id}"
    }, status=201)

@login_required
def relist(request, auction_id):
    
    # auctions = Auction.filter.objects()
    # Get original auction details
    old_auction = Auction.objects.get(id=auction_id)

    # Get current client
    client = Client.objects.get(user_id=request.user)

    # If not owner of card, cannot relist
    if old_auction.card_entity.owner != client:
        return redirect(f"/auction/{auction.id}")

    form = RelistForm(request.POST or None)
    card = CardEntity.objects.filter(card=old_auction.card_entity.card, owner=client)
    
    if request.method == "POST" and form.is_valid():
        starting_price = form.cleaned_data["starting_price"]
        end_time = form.cleaned_data["end_time"]
        auction = Auction.objects.create(
            end_time=end_time,
            starting_price=starting_price,
            card_entity=old_auction.card_entity
        )
        auction.save()
        return redirect(f"/auction/{auction.id}")
    context = {"form": form, "auction_id":auction_id}
    return render(request, "auctions/relist-form.html", context)


def get_all_bids(request, auction_id):
    auction = get_object_or_404(Auction, id=auction_id)
    bids = AuctionBid.objects.filter(auction=auction).select_related('bidder').order_by("-amount")[:3]
    serializer = AuctionBidSerializer(bids, many=True)
    return JsonResponse({"success": True, "data": serializer.data})


def get_all_auctions(request):
    now = timezone.now()
    auctions = Auction.objects.filter(start_time__lte=now, end_time__gt=now)[:20]
    serializer = AuctionSerializer(auctions, many=True)
    return JsonResponse({"success": True, "data": serializer.data})

def getAuctionTableData(client):
    userbids = AuctionBid.objects.filter(bidder=client)
    # auctions = Auction.objects.filter(end_time__gt=timezone.now(), card_entity__owner=client)
    auctions = Auction.objects.filter(
        Q(end_time__gt=timezone.now()) &
    (Q(id__in=userbids.values('auction_id')))

        # (Q(card_entity__owner=client) | Q(id__in=userbids.values('auction_id')))
    ).distinct()  
    result = []

    for auction in auctions:
        try:
            client_bid_object = AuctionBid.objects.filter(auction=auction.id, bidder=client).order_by('-amount').first()
            client_bid = client_bid_object.amount if client_bid_object else None

            highest_bid_obj = AuctionBid.objects.filter(auction=auction).aggregate(Max('amount'))
            highest_bid = highest_bid_obj['amount__max']
            time_left = auction.end_time - timezone.now()
            if time_left.total_seconds() > 0:
               days = time_left.days
               hours, remainder = divmod(time_left.seconds, 3600)
               minutes, seconds = divmod(remainder, 60)
               time_left_str = f"{days}d {hours}h {minutes}m {seconds}s"
            else:
               time_left_str = "Ended"
            auction_data = {
                'id': auction.id,
                'card_entity': str(auction.card_entity),  # cast to string if needed for printing
                'starting_price': auction.starting_price,
                'client_bid': client_bid,
                'highest_bid': highest_bid,
                'time_left': time_left_str,
                'end_time': auction.end_time,
                'image':auction.card_entity.card.images
            }
            result.append(auction_data)
        except Exception as e:
            print(f"Error processing auction {auction.id}: {e}")
            continue  # skip to next auction in case of error

    return result

def getBuyAndSellData(client):

    orders = (
        SalesBid.objects.filter(bidder=client)
        .values("card","grade") 
        .annotate(
            amount=Max("amount"),
            timestamp=Max("timestamp"),
            total_quantity=Count("id"), 
            grade_id= Max('grade')
        )
        .order_by("-amount")  
    )
    
    asks = (
        CardEntity.objects.filter(owner=client)
        .values("card","grade")  
        .annotate(
            amount=Min("ask_price"),
            timestamp=Max("created_at"),
            total_quantity=Count("id"), 
            grade_id= Max('grade')
        )
    )
    result = []
   
    for order in orders:
        try:
            highest_bid_obj = SalesBid.objects.filter(
                card=order['card'],
                grade=order['grade']
            ).exclude(bidder=client).order_by("-amount").first()
            quantity = order['total_quantity']
            if order['total_quantity'] > 1:
                total_highest_bids_by_user = SalesBid.objects.filter(bidder=client, card = order['card'], grade=order['grade_id'], amount=order['amount'] )
                quantity = len(total_highest_bids_by_user)
            card_obj = CardEntity.objects.filter(card=order['card']).first()
            grade = Grade.objects.get(id=order['grade_id'])
            entry = {
                'card_type': 'for_sale',
                'card': card_obj.card_name,
                'client_bid': order['amount'],
                'highest_bid': highest_bid_obj.amount if highest_bid_obj else None,
                'type': 'Buy',
                'quantity': quantity,
                'grade':grade.value,
                'date': timezone.localtime(order['timestamp']).strftime("%b %d, %Y") if order['timestamp'] else None,
                'image':card_obj.card.images
            }
            result.append(entry)
           
        except Exception as e:
            print('Error processing order:', order, 'Error:', str(e))
   
    for ask in asks:
        try:
            quantity = ask['total_quantity']
            if ask['total_quantity'] > 1:
                total_highest_bids_by_user = CardEntity.objects.filter(owner=client, card = ask['card'], grade=ask['grade_id'], ask_price=ask['amount'])
                quantity = len(total_highest_bids_by_user)
            card_obj = CardEntity.objects.filter(card=ask['card']).first()
            grade = Grade.objects.get(id=ask['grade_id'])
            entry = {
                'card_type': 'for_sale',
                'card': card_obj.card_name,
                'lowest_ask': ask['amount'],
                'type': 'Sell',
                'quantity': quantity,
                'grade':grade.value,
                'date': timezone.localtime(ask['timestamp']).strftime("%b %d, %Y") if ask['timestamp'] else None,
                'image':card_obj.card.images
            }
            result.append(entry)
           
        except Exception as e:
            print('Error processing order:', ask, 'Error:', str(e))
   
    return result

