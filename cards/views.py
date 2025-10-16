from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.contrib import messages
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Case, When, FloatField, Value, Q, F
from django.db.models.functions import Cast
from django.db.models import Q
from django.http import Http404
from django.core.paginator import Paginator
from django.utils import timezone
from urllib.parse import urlencode
from .models import Grade, Card, Category, CardEntity, Wishlist, Collections
from accounts.models import Client
from auctions.models import Auction
from casinos.models import CasinoSale
from market.models import Bid, Ask, Sale
from sales.models import SalesBid
from .forms import SetAuctionForm
from .serializers import CardSerializer, CardEntitySerializer, CollectionSerializer
from decimal import Decimal
from .utils import (
    get_all_owned_cards_for_auctions,
    get_all_owned_cards_for_sale,
    get_all_cards_on_sale,
    get_all_owned_cards_for_sale_by_grade,
    get_all_cards_on_sale_by_grade,
    append_raw_grade_in_context
)
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from sales.forms import BidForm
from cards.forms import SaleForm
from sales.utils import someone_made_a_sale, someone_made_an_ask, someone_made_a_salesbid
from wallets.models import Wallet
from pokemon.utils import get_sliced_array, annotate_card_price, adjust_referral, attach_ask_price_to_card_list, paginate
from django.db.models import Count
from django.db.models import Max
from itertools import groupby
from operator import attrgetter
from collections import defaultdict
from django.db.models import Sum, Max
from babel.numbers import format_currency, format_decimal
from auctions.views import getBuyAndSellData,getAuctionTableData

def is_card_in_active_auction(card_entity):
    now = timezone.now()
    return Auction.objects.filter(
        card_entity=card_entity,
        start_time__lte=now,
        end_time__gt=now
    ).exists()
    
@login_required
@csrf_exempt
@require_http_methods(["GET"])
def get_auctions_and_orders_data(request):
    try:
        client = None
        client = get_object_or_404(Client, user=request.user)
        auctions = getAuctionTableData(client)
        orders = getBuyAndSellData(client)
        return JsonResponse({
            'status': True,
            'data': {
                "orders": orders,
                "auctions": auctions
            },
            'message': 'Data Fetched Successfully'
        }) 
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)
    except Client.DoesNotExist:
        return JsonResponse(
            {'status': 'error', 'message': 'Client not found'},
            status=404
        )

@csrf_exempt
@require_http_methods(["GET"])
def get_card_data(request,card_id,grade_id):
    client = Client.objects.get(user=request.user)
    card_entities_owned_all = get_all_owned_cards_for_sale_by_grade(client, card_id, grade_id)
    return JsonResponse({
        'status': 'success',
        'message': 'Data Fetched Successfully',
        'card_entities_owned':len(card_entities_owned_all),
    })   
@csrf_exempt
@require_http_methods(["POST"])
def api_place_bid(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        card_id = data.get('card_id')
        grade_id = data.get('grade_id')
        amount = float(data.get('amount'))
        quantity = int(data.get('quantity', 1))

        # Validate request and get objects using helper function
        validation = validate_api_request(request.user, card_id)
        if isinstance(validation, JsonResponse):
            return validation
        client, wallet, card = validation
        total_amount = amount * quantity
                
        # Process transaction
        with transaction.atomic():
            data_Asks = Ask.objects.filter(asset=card,grade=grade_id)
            asks = CardEntity.objects.filter(on_sale=True, card=card, grade=grade_id)
            if not asks:
                response = place_bids(card, client, amount, quantity, grade_id, wallet, card.id )
                if isinstance(response, JsonResponse) and response.status_code != 200:
                    return response
                return JsonResponse({
                    'status': 'success',
                    'message': 'Bid placed successfully',
                    'bids_placed':quantity,
                    'bids_fulfilled':0
                })   


            bids_fulfilled, bids_placed, total_bids_placed = 0,0, 0

            for ask in asks:
                if quantity == total_bids_placed:
                    break;
                if ask.ask_price > amount: 
                    response = place_single_bid(card, client, amount, quantity, grade_id, wallet, card.id )
                    if isinstance(response, JsonResponse) and response.status_code != 200:
                            return response
                    bids_placed+=1
                    total_bids_placed+=1
                else:           
                    # Getting the cards everytime so we dont have the cards that are already sold     
                    cards_to_buy = get_all_cards_on_sale_by_grade(card,grade_id).exclude(owner=client).order_by("ask_price")[:int(quantity)]
                    if cards_to_buy.count() == 0:
                        response = place_bids(card, client, amount, quantity, grade_id, wallet, card.id )
                        if isinstance(response, JsonResponse) and response.status_code != 200:
                            return response

                        bids_placed = quantity
                        total_bids_placed = quantity
                        break
                    else:
                    # for card_available in cards_to_buy:
                        try:
                            if wallet.funds < ask.ask_price: 
                                return JsonResponse({
                                    'status': 'error',
                                    'message': 'Not enough funds',
                                    'bids_placed': 0,
                                    'bids_fulfilled': 0
                                }, status=400)
                            seller_wallet = get_object_or_404(Wallet, client=ask.owner)
                            ask_price = ask.ask_price
                            seller = ask.owner
                            original_owner = ask.original_owner
                            # Transfer funds and ownership
                            seller_wallet.funds += ask_price
                            wallet.funds -= ask_price
                            ask.owner = client
                            ask.on_sale = False
                            
                            # Save changes
                            seller_wallet.save()
                            wallet.save()
                            ask.save()
                            # Handle refer  ral
                            original_owner_wallet = get_object_or_404(Wallet, client=original_owner)
                            adjust_referral(seller_wallet, original_owner_wallet, ask_price)
                            # Notifications
                            someone_made_a_sale(ask, 1, client, seller, ask_price, grade_id)
                            channel_layer = get_channel_layer()
                            total_bids_placed+=1
                            bids_fulfilled+=1
                            async_to_sync(channel_layer.group_send)(
                                f"sale_{ask.card.id}",
                                {
                                    "type": "card_bought",
                                    "message": "New buy",
                                },
                            )
                        except Exception as e:
                            print(f"Error processing card sale: {e}")
                            
            if(quantity != total_bids_placed):
                # Place remaining quantity bids
                bids_amount = quantity - total_bids_placed 
                response = place_bids(card, client, amount, bids_amount, grade_id, wallet, card.id )
                if isinstance(response, JsonResponse) and response.status_code != 200:
                            return response
                bids_placed+=1
            broadcast_card_entities_update(client, card_id, grade_id)    
            return JsonResponse({
                'status': 'success',
                'message': 'Bid placed successfully',
                'bids_placed':bids_placed,
                'bids_fulfilled':bids_fulfilled,
                'card': card.name_extended
            })   
           

            
    except Card.DoesNotExist:
        return JsonResponse(
            {'status': 'error', 'message': 'Card not found'},
            status=404
        )
    except json.JSONDecodeError:
        return JsonResponse(
            {'status': 'error', 'message': 'Invalid JSON data'},
            status=400
        )
    except Exception as e:
        return JsonResponse(
            {'status': 'error', 'message': str(e)},
            status=500
        )

@csrf_exempt
@require_http_methods(["POST"])
def api_set_ask(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        card_id = data.get('card_id')
        grade_id = data.get('grade_id')
        sale_amount = float(data.get('sale_amount'))
        quantity = int(data.get('quantity', 1))
        
        # Validate required fields
        if None in [card_id, sale_amount]:
            return JsonResponse(
                {'status': 'error', 'message': 'Missing required fields (card_id, sale_amount)'},
                status=400
            )

        # Validate request and get objects using helper function
        validation = validate_api_request(request.user, card_id)
        if isinstance(validation, JsonResponse):
            return validation
        client, wallet, card = validation
        
        # Get owned cards
        owned_cards = get_all_owned_cards_for_sale_by_grade(client, card, grade_id)
        if len(owned_cards) == 0:
            return JsonResponse(
                {'status': 'error', 'message': 'You already own these cards or none available'},
                status=400
            )
        owned_cards_count = owned_cards.count()
        asks_placed, card_sold, sold_cards = 0, 0, []
        for selected_card in owned_cards[:quantity]:
            bids = SalesBid.objects.exclude(bidder=client).filter(card=card, grade=grade_id).order_by('-amount','timestamp')
            total_asks_settled = 0
            if not bids:
                # Handle This Case
                selected_card.on_sale = True
                selected_card.ask_price = sale_amount
                selected_card.save()
                someone_made_an_ask(selected_card, quantity, sale_amount, grade_id)
                asks_placed+=1
                total_asks_settled+=1
                # asks_placed = quantity
            for i in range(bids.count()):               
                with transaction.atomic():
                    bid = bids[i]

                    if float(bid.amount) >= float(sale_amount):  
                        earned = handle_card_sale(selected_card, bid, wallet, client, grade_id, sold_cards, Decimal(str(sale_amount)))
                        # earned = handle_card_sale(selected_card, bid, wallet, client, grade_id, sold_cards, Decimal(str(sale_amount)))
                        if earned:
                            someone_made_a_sale(selected_card, 1, bid.bidder, client, bid.amount, grade_id)
                            # someone_made_a_sale(selected_card, 1, bid.bidder, client, bid.amount, grade_id)
                        total_asks_settled+=1
                        card_sold += 1
                        break;

            if total_asks_settled==0:
                asks_placed+=1
                selected_card.on_sale = True
                selected_card.ask_price = sale_amount
                selected_card.save()
                # Create an ask
                someone_made_an_ask(selected_card, quantity, sale_amount, grade_id)

        wallet.save()
        channel_layer = get_channel_layer()
        broadcast_card_entities_update(client, card_id, grade_id)
        # broadcast_sell_button_status(client, card_id, grade_id)  
        async_to_sync(channel_layer.group_send)(
            f"sale_{card_id}",
            {
                "type": "ask_placed",
                "message": "New ask",
                "sale_amount": sale_amount,
                "quantity": quantity
            }
        )
        broadcast_card_entities_update(client, card_id, grade_id)
        return JsonResponse({
            'status': 'success',
            'message': 'Ask set successfully',
            'cards_updated': quantity,
            'sale_amount': sale_amount,
            "card_sold":card_sold,
            "asks_placed":asks_placed,
            'card': card.name_extended
        })
        
        # Validate quantity
        # if quantity > owned_cards_count:
        #     return JsonResponse(
        #         {'status': 'error', 'message': f'You only own {owned_cards_count} of this card'},
        #         status=400
        #     )

        # Process transaction
        # with transaction.atomic():
        #     card_entity = owned_cards.first()
        #     for card in owned_cards[:quantity]:
        #         card.on_sale = True
        #         card.ask_price = sale_amount
        #         card.save()

            # Create an ask
            # someone_made_an_ask(card_entity, quantity, sale_amount, grade_id)
            
            # # WebSocket notification
            # channel_layer = get_channel_layer()
            # async_to_sync(channel_layer.group_send)(
            #     f"sale_{card_id}",
            #     {
            #         "type": "ask_placed",
            #         "message": "New ask",
            #         "sale_amount": sale_amount,
            #         "quantity": quantity
            #     }
            # )
            # broadcast_card_entities_update(client, card_id, grade_id)
            # return JsonResponse({
            #     'status': 'success',
            #     'message': 'Ask set successfully',
            #     'cards_updated': quantity,
            #     'sale_amount': sale_amount
            # })

    except json.JSONDecodeError:
        return JsonResponse(
            {'status': 'error', 'message': 'Invalid JSON data'},
            status=400
        )
    except Client.DoesNotExist:
        return JsonResponse(
            {'status': 'error', 'message': 'Client not found'},
            status=404
        )
    except Exception as e:
        return JsonResponse(
            {'status': 'error', 'message': str(e)},
            status=500
        )
         
        
@csrf_exempt
@require_http_methods(["POST"])
def api_buy_now(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        card_id = data.get('card_id')
        quantity = data.get('quantity')
        grade_id = data.get('grade_id')
        # card_object = CardEntity.objects.get()

        # Validate quantity exists
        if not quantity:
            return JsonResponse(
                {'status': 'error', 'message': 'Quantity is required'},
                status=400
            )

        # Validate request and get objects
        validation = validate_api_request(request.user, card_id)
        if isinstance(validation, JsonResponse):
            return validation
        client, buyer_wallet, card = validation
        card_name = card.name_extended
        # Get cards available for purchase
        cards_to_buy = get_all_cards_on_sale_by_grade(card,grade_id).exclude(owner=client).order_by("ask_price")[:int(quantity)]

        # Original validation checks
        if cards_to_buy.count() == 0:
            return JsonResponse(
                {'status': 'error', 'message': 'You already own these cards or none available'},
                status=400
            )

        # Calculate total amount
        amount_to_pay = sum(card.ask_price for card in cards_to_buy)

        # Check funds
        if amount_to_pay > buyer_wallet.funds:
            return JsonResponse(
                {'status': 'error', 'message': 'Not enough funds'},
                status=400
            )

        # Process purchases
        bought_cards = []
        channel_layer = get_channel_layer()
        with transaction.atomic():
            for card in cards_to_buy:
                seller_wallet = get_object_or_404(Wallet, client=card.owner)
                ask_price = card.ask_price
                seller = card.owner
                original_owner = card.original_owner

                # Transfer funds and ownership
                seller_wallet.funds += ask_price
                buyer_wallet.funds -= ask_price
                card.owner = client
                card.on_sale = False
                
                # Save changes
                seller_wallet.save()
                buyer_wallet.save()
                card.save()
                bought_cards.append(card.id)

                # Handle referral
                original_owner_wallet = get_object_or_404(Wallet, client=original_owner)
                adjust_referral(seller_wallet, original_owner_wallet, ask_price)

                # Notifications
                someone_made_a_sale(card, 1, client, seller, ask_price, grade_id)
                async_to_sync(channel_layer.group_send)(
                    f"sale_{card.card.id}",
                    {
                        "type": "card_bought",
                        "message": "New buy",
                    },
                )
        broadcast_card_entities_update(client, card_id, grade_id)
        # broadcast_sell_button_status(client, card_id, grade_id)                
        return JsonResponse({
            'status': 'success',
            'message': f'Successfully bought {len(bought_cards)} card(s)',
            'total_spent': float(amount_to_pay),
            'new_balance': float(buyer_wallet.funds),
            'bought_cards': len(bought_cards),
            'card': card_name 
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {'status': 'error', 'message': 'Invalid JSON data'},
            status=400
        )
    except Exception as e:
        return JsonResponse(
            {'status': 'error', 'message': str(e)},
            status=500
        )
         
@csrf_exempt
@require_http_methods(["POST"])
def api_sell_now(request):
    try:
        # Parse JSON data
        data = json.loads(request.body.decode('utf-8'))
        quantity_str = data.get('quantity')
        card_id = data.get('card_id')
        grade_id = data.get('grade_id')
        
        # Initial quantity validation
        if not quantity_str:
            return JsonResponse(
                {'status': 'error', 'message': 'Quantity is required'},
                status=400
            )
        
        try:
            quantity = int(quantity_str)
        except ValueError:
            return JsonResponse(
                {'status': 'error', 'message': 'Quantity must be a valid number'},
                status=400
            )

        # Authentication and object retrieval
        if not request.user.is_authenticated:
            return JsonResponse(
                {'status': 'error', 'message': 'Please login before selling cards'},
                status=401
            )

        try:
            client = Client.objects.get(user=request.user)
            wallet = get_object_or_404(Wallet, client=client)
            card = get_object_or_404(Card, id=card_id)
        except Exception as e:
            return JsonResponse(
                {'status': 'error', 'message': str(e)},
                status=400
            )
        # Get bids and owned cards (maintaining original order)
        bids = SalesBid.objects.exclude(bidder=client).filter(card=card).order_by('-amount','timestamp')[:quantity]
        cards_owned = CardEntity.objects.filter(owner=client, card=card)
        
        #freezing the queryset in the list to avoid so it wont change when ownership changes
        cards_owned = list(cards_owned)
        total_cards_owned = len(cards_owned)
        # Original validation checks in same order
        
        # if total_cards_owned > quantity:
            # return JsonResponse(
                # {'status': 'error', 'message': 'No active bids on this card'},
                # status=400
            # )
        if total_cards_owned == 0:
            return JsonResponse(
                {'status': 'error', 'message': 'No active bids on this card'},
                status=400
            )
        else:
            if total_cards_owned == 0:
                return JsonResponse(
                    {'status': 'error', 'message': 'You do not own this card'},
                    status=400
                )
            elif total_cards_owned < quantity:
                return JsonResponse(
                    {'status': 'error', 'message': f'You only own {total_cards_owned} of this card'},
                    status=400
                )
        with transaction.atomic():
            sold_cards = []
            total_earned = 0
            channel_layer = get_channel_layer()
            bids_to_delete = []
            for i in range(bids.count()):
                # if(total_cards_owned < i):
                    # break;
                bid = bids[i]
                card_to_transfer = cards_owned[i]
                original_owner = card_to_transfer.original_owner

                wallet.funds += bid.amount
                total_earned += bid.amount
                card_to_transfer.owner = bid.bidder
                card_to_transfer.on_sale = False
                card_to_transfer.save()

                original_owner_wallet = get_object_or_404(Wallet, client=original_owner)
                adjust_referral(wallet, original_owner_wallet, bid.amount)
                bids_to_delete.append(bid.id)
                # bid.delete()
                someone_made_a_sale(card_to_transfer, 1, bid.bidder, client, bid.amount, grade_id)
                sold_cards.append(card_to_transfer.id)
                async_to_sync(channel_layer.group_send)(
                    f"sale_{card_to_transfer.card.id}",
                    {
                        "type": "card_bought",
                        "message": "New buy",
                        "card_id": card_to_transfer.card.id,
                        "buyer_id": bid.bidder.id,
                        "price": float(bid.amount)
                    }
                )
            wallet.save()
            SalesBid.objects.filter(id__in=bids_to_delete).delete()
            broadcast_card_entities_update(client, card_id, grade_id)
            # card = get_object_or_404(Card, id=card_id)
            # card_entities_owned_all = get_all_owned_cards_for_sale(client, card)
            # card_entities_for_sale = get_all_cards_on_sale(card)
            # async_to_sync(channel_layer.group_send)(
            #     f"sale_{card_id}",
            #     {
            #         "type": "card_entities_owned",   
            #         "card_entities_owned_all": len(card_entities_owned_all),
            #         "card_entities_for_sale": len(card_entities_for_sale)
            #     }
            # )
            # broadcast_sell_button_status(client, card_id, grade_id)                
            return JsonResponse({
                'status': 'success',
                'message': f'Successfully sold {len(sold_cards)} card(s)',
                'total_earned': float(total_earned),
                'sold_cards': len(sold_cards),
                'new_balance': float(wallet.funds),
                'card': card.name_extended
            })

    except json.JSONDecodeError:
        return JsonResponse(
            {'status': 'error', 'message': 'Invalid JSON data'},
            status=400
        )
    except Exception as e:
        return JsonResponse(
            {'status': 'error', 'message': str(e)},
            status=500
        )
    
def handle_card_sale(card_to_transfer, bid, wallet, client, grade_id, sold_cards,sale_amount):
    try:
        original_owner = card_to_transfer.original_owner
        # Transfer funds
        wallet.funds += sale_amount
        card_to_transfer.owner = bid.bidder
        card_to_transfer.on_sale = False
        card_to_transfer.save()
        # Referral adjustment
        original_owner_wallet = get_object_or_404(Wallet, client=original_owner)
        bidder_wallet = get_object_or_404(Wallet, client=bid.bidder)

        adjust_referral(wallet, original_owner_wallet, sale_amount)

        if bid.amount > sale_amount:
            excess_amount = bid.amount - sale_amount
            bidder_wallet.funds += excess_amount
            bidder_wallet.save()
        # Cleanup and event tracking
        bid.delete()
        someone_made_a_sale(card_to_transfer, 1, bid.bidder, client, sale_amount, grade_id)
        sold_cards.append(card_to_transfer.id)

        # Real-time update
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"sale_{card_to_transfer.card.id}",
            {
                "type": "card_bought",
                "message": "New buy",
                "card_id": card_to_transfer.card.id,
                "buyer_id": bid.bidder.id,
                "price": float(sale_amount)
            }
        )

        return float(bid.amount)

    except Exception as e:
        print(f"Error handling card sale: {str(e)}")
        return 0.0
            
def index(request):
    now = timezone.now()
    category = request.GET.get("category", None)
    detail = request.GET.get("detail", None)

    params = request.GET.copy()
    params.pop("page", None)
    params.pop("limit", None)

    clean_params = urlencode(params)

    page = request.GET.get("page", 1)
    limit = request.GET.get("limit", 10)

    context = {
        "favorite_cards": [],
        "cards_by_category": {},
        "cards": [],
        "pagination": {},
        "featured_cards": [],
        "auctions": [],
        "casinos": [],
    }

    cards_by_category = {}

    # Get featured cards
    featured_cards = Card.objects.filter(is_featured=True)
    context["featured_cards"] = featured_cards

    # Get favorite cards if user is authenticated
    if request.user.is_authenticated:
        client = Client.objects.get(user=request.user)
        if client:
            wishlist = Wishlist.objects.get(client=client)
            favorite_cards = wishlist.cards.all()
            context["favorite_cards"] = favorite_cards

    # On pressing view all
    if category:
        category = Category.objects.get(id=category)
        cards = Card.objects.prefetch_related('cardentity_set').filter(category=category)
        cards = attach_ask_price_to_card_list(cards)

        # Pagination
        paginator = Paginator(cards, limit)
        page_data = paginator.get_page(page)
        count = paginator.count
        total_pages = paginator.num_pages
        page_range = get_sliced_array(list(paginator.page_range), int(page), 9)

        if int(page) <= 0 or int(page) > total_pages:
            raise Http404("Invalid page")

        context["pagination"] = {
            "page": int(page),
            "limit": limit,
            "total": count,
            "total_pages": total_pages,
            "has_next": page_data.has_next(),
            "has_prev": page_data.has_previous(),
            "page_range": page_range,
            "params": clean_params,
        }
        append_raw_grade_in_context(context)
        context["cards"] = page_data
        return render(request, "cards/view-all.html", context)
    elif detail == "casino":
        casinos = CasinoSale.objects.all()

        # Pagination
        paginator = Paginator(casinos, limit)
        page_data = paginator.get_page(page)
        count = paginator.count
        total_pages = paginator.num_pages
        page_range = get_sliced_array(list(paginator.page_range), int(page), 9)

        if int(page) <= 0 or int(page) > total_pages:
            raise Http404("Invalid page")

        context["pagination"] = {
            "page": int(page),
            "limit": limit,
            "total": count,
            "total_pages": total_pages,
            "has_next": page_data.has_next(),
            "has_prev": page_data.has_previous(),
            "page_range": page_range,
            "params": clean_params,
        }
        append_raw_grade_in_context(context)
        context["casinos"] = page_data
        return render(request, "cards/view-all.html", context)
    elif detail == "auction":
        cards = Auction.objects.all()

        # Pagination
        paginator = Paginator(cards, limit)
        page_data = paginator.get_page(page)
        count = paginator.count
        total_pages = paginator.num_pages
        page_range = get_sliced_array(list(paginator.page_range), int(page), 9)

        if int(page) <= 0 or int(page) > total_pages:
            raise Http404("Invalid page")

        context["pagination"] = {
            "page": int(page),
            "limit": limit,
            "total": count,
            "total_pages": total_pages,
            "has_next": page_data.has_next(),
            "has_prev": page_data.has_previous(),
            "page_range": page_range,
            "params": clean_params,
        }

        append_raw_grade_in_context(context)
        context["auctions"] = page_data
        return render(request, "cards/view-all.html", context)
    else:
        pass

    # Get all auctions
    auctions = Auction.objects.filter(start_time__lte=now, end_time__gt=now)[:20]
    context["auctions"] = auctions

    # Get all casino sales
    casinos = CasinoSale.objects.filter(end_time__gt=now)[:20]
    context["casinos"] = casinos

    categories = Category.objects.all()
    
    for category in categories:
        cards = Card.objects.prefetch_related('cardentity_set').filter(category=category)[:20]
        cards = attach_ask_price_to_card_list(cards)
        cards_by_category[category.name] = {"id": category.id, "cards": list(cards)}
        context["cards_by_category"] = cards_by_category
    try:
        raw_grade = Grade.objects.get(value='Raw')
        context["raw_grade"] = raw_grade.value
    except Grade.DoesNotExist as e:
        print(f"Error: Raw grade not found - {e}")
    except Exception as e:
        print(f"Unexpected error when fetching raw grade - {e}")

    return render(request, "cards/index.html", context)

def detail_helper(request, card_id, grade_id):
    channel_layer = get_channel_layer()
    submit_type = request.POST.get("submit_type", None)

    card = None
    client = None
    wallet = None

    bid_form = BidForm(request.POST or None)
    sale_form = SaleForm(request.POST or None)
    set_auction_form = SetAuctionForm()

    if request.user.is_authenticated:
        client = Client.objects.get(user=request.user)
    if request.method == 'POST':
        if not client:
            messages.error(request, "Please login before placing bids or asks")
        else:
            wallet = get_object_or_404(Wallet, client=client)
            card = get_object_or_404(Card, id=card_id)

            if submit_type and submit_type == 'set_ask' and sale_form.is_valid():
                owned_cards = get_all_owned_cards_for_sale(client, card)
                owned_cards_count = owned_cards.count()
                card_entity = owned_cards.first()

                sale_amount = sale_form.cleaned_data["sale_amount"]
                quantity = sale_form.cleaned_data["quantity"]

                if quantity > owned_cards_count:
                    messages.error(request, f"You only own {owned_cards_count} of this card")
                else:
                    for card in owned_cards[:quantity]:
                        card.on_sale = True
                        card.ask_price = sale_amount
                        card.save()

                    someone_made_an_ask(card_entity, quantity, sale_amount)
                    async_to_sync(channel_layer.group_send)(
                        f"sale_{card_id}",
                        {
                            "type": "ask_placed",
                            "message": "New ask",
                        },
                    )
            elif submit_type and submit_type == 'place_bid' and bid_form.is_valid():
                amount = bid_form.cleaned_data["bid_amount"]
                quantity = bid_form.cleaned_data["quantity"]
                total_amount = amount * quantity

                if total_amount > wallet.funds:
                    messages.error(request, "Not enough funds")
                else:
                    try:
                        with transaction.atomic():
                            wallet.funds = float(wallet.funds) - float(total_amount)
                            wallet.save()
                            SalesBid.objects.bulk_create(
                                [
                                    SalesBid(card=card, bidder=client, amount=amount)
                                    for i in range(quantity)
                                ]
                            )
                            someone_made_a_salesbid(card, client, amount, quantity)
                            async_to_sync(channel_layer.group_send)(
                                f"sale_{card_id}",
                                {
                                    "type": "bid_placed",
                                    "message": "New bid",
                                },
                            )
                    except Exception as e:
                        messages.error(request, "Something went wrong")
            elif submit_type and submit_type == 'buy_now':
                quantity = request.POST.get("quantity", None)
                if quantity:
                    amount_to_pay = 0
                    cards_to_buy = get_all_cards_on_sale(card=card).exclude(owner=client).all().order_by("ask_price")[:int(quantity)]

                    if cards_to_buy.count() == 0:
                        messages.error(request, "You already own these cards.")

                    for card in cards_to_buy:
                        amount_to_pay = amount_to_pay + card.ask_price

                    buyer = client
                    buyer_wallet = get_object_or_404(Wallet, client=client)

                    if amount_to_pay > buyer_wallet.funds:
                        messages.error(request, "Not enough funds")
                    else:
                        for card in cards_to_buy:
                            seller_wallet = get_object_or_404(Wallet, client=card.owner)
                            ask_price = card.ask_price
                            seller = card.owner
                            original_owner = card.original_owner

                            try:
                                with transaction.atomic():
                                    seller_wallet.funds = seller_wallet.funds + ask_price
                                    buyer_wallet.funds = buyer_wallet.funds - ask_price
                                    card.owner = buyer
                                    card.on_sale = False
                                    seller_wallet.save()
                                    buyer_wallet.save()
                                    card.save()
                                    messages.success(request, f"You now own {card.card}")
                                    someone_made_a_sale(card, 1, buyer, seller, card.ask_price)

                                    original_owner_wallet = get_object_or_404(
                                        Wallet, client=original_owner
                                    )
                                    adjust_referral(seller_wallet, original_owner_wallet, ask_price)
                                    async_to_sync(channel_layer.group_send)(
                                        f"sale_{card.card.id}",
                                        {
                                            "type": "card_bought",
                                            "message": "New buy",
                                        },
                                    )
                            except Exception as e:
                                print(e)
                                messages.error(request, "Something went wrong")
                else:
                    messages.error(request, "Quantity is required")           
            elif submit_type and submit_type == 'sell_now':
                quantity = request.POST.get("quantity", None)
                if quantity:
                    bids = SalesBid.objects.exclude(bidder=client).filter(card=card).order_by("-amount")[:int(quantity)]
                    cards_owned = CardEntity.objects.filter(owner=client, card=card)

                    if bids.count() > int(quantity):
                        messages.error(request, "No active bids on this card")
                    elif bids.count() == 0:
                        messages.error(request, "No active bids on this card")
                    else:
                        if cards_owned.count() == 0:
                            messages.error(request, "You do not own this card")
                        elif cards_owned.count() < int(quantity):
                            messages.error(request, f"You only own {cards_owned.count()} of this card")
                        else:
                            for i in range(bids.count()):
                                bid_price = bids[i].amount
                                bidder = bids[i].bidder
                                card_to_transfer = cards_owned[i]
                                original_owner = card_to_transfer.original_owner
                                try:
                                    with transaction.atomic():
                                        wallet.funds = wallet.funds + bid_price
                                        card_to_transfer.owner = bidder
                                        card_to_transfer.on_sale = False
                                        wallet.save()
                                        card_to_transfer.save()
                                        bids[i].delete()
                                        messages.success(request, f"You have sold {card}")
                                        someone_made_a_sale(card_to_transfer, 1, bidder, client, bid_price)

                                        original_owner_wallet = get_object_or_404(
                                            Wallet, client=original_owner
                                        )
                                        adjust_referral(wallet, original_owner_wallet, bid_price)
                                        async_to_sync(channel_layer.group_send)(
                                            f"sale_{card_to_transfer.card.id}",
                                            {
                                                "type": "card_bought",
                                                "message": "New buy",
                                            },
                                        )
                                except Exception as e:
                                    print(e)
                                    messages.error(request, "Something went wrong")
                else:
                    messages.error(request, "Quantity is required")
            else:
                messages.error(request, "Quantity is required to place bids or set asks")

    fav_card = False
    card = get_object_or_404(Card, id=card_id)

    if client:
        fav_card = Wishlist.objects.filter(client=client, cards=card).exists()

    card_for_sale = get_all_cards_on_sale(card)
    card_entities_for_sale = get_all_cards_on_sale_by_grade(card,grade_id)
    card_entities_owned_all = get_all_owned_cards_for_sale_by_grade(client, card, grade_id)
    card_entity_owned = card_entities_owned_all.first()

    lowest_bid = SalesBid.objects.filter(card=card).order_by("amount").first()
    # Sale.objects.filter(asset=card).delete()
    # SalesBid.objects.filter(card=card).delete()
    bids = Bid.objects.filter(asset=card).order_by("-price")[:20]
    asks = Ask.objects.filter(asset=card).order_by("price")[:20]
    if grade_id:
        grouped_bids = get_graded_grouped_bids(grade_id, card)
        grouped_asks = get_graded_grouped_asks(grade_id, card)
        sales = Sale.objects.filter(asset=card, grade=grade_id).order_by("-created_at")[:20]

    else:
        grouped_bids = get_grouped_bids(card)
        grouped_asks = get_grouped_asks(card)
        sales = Sale.objects.filter(asset=card).order_by("-created_at")[:20]

    if grouped_bids:
        highest_bid_card = grouped_bids[0]
        if highest_bid_card:
            highest_bid = highest_bid_card['price']
        else:
           highest_bid =  format_usd_currency(0)
    else:
        highest_bid =  format_usd_currency(0)
    
    if grouped_asks:
        lowest_ask_card = grouped_asks[0]
        if lowest_ask_card:
            lowest_ask = format_usd_currency(lowest_ask_card['price'])
        else:
            lowest_ask = format_usd_currency(0)
    else:
        lowest_ask = format_usd_currency(0)
    auctions = getAuctionTableData(client)
    orders = getBuyAndSellData(client)

    context = {
        'auctions':auctions,
        'orders':orders,
        "card": card,
        "card_entities": card_entities_for_sale,
        "lowest_ask": lowest_ask,
        "bids": grouped_bids,
        "asks": grouped_asks,
        "sales": sales,
        "card_entity": card_entity_owned,
        "card_entities_owned_all": card_entities_owned_all,
        "fav_card": fav_card,
        "set_auction_form": set_auction_form,
        "highest_bid":highest_bid,
        "lowest_ask":lowest_ask
    }

    # if highest_bid:
    #     context["highest_bid"] = format_usd_currency(highest_bid.price)
    # else:
    #     context["highest_bid"] = format_usd_currency(0)

    # if lowest_bid:
    #     context["lowest_bid"] = format_usd_currency(lowest_bid.amount)
    # else:
    #     context["lowest_bid"] = format_usd_currency(0)
        
    grades = Grade.objects.all()
    context["grades"] = grades
    
    return context


def detail(request, card_id):
    context = detail_helper(request, card_id, None)
    return render(request, "cards/detail.html", context)


def detail_with_grade(request, card_id, grade):
    selected_grade = Grade.objects.get(value=grade)
    grade_id=selected_grade.id
    context = detail_helper(request, card_id, grade_id)
    client = None
    if request.user.is_authenticated:
        client = Client.objects.get(user=request.user)
    
    context['grade_id'] = int(grade_id) 
    context['grade_name'] = grade
    if client:
        context['user_id'] = int(client.id)
    return render(request, "cards/detail.html", context)

# def detail(request, card_id):
#     channel_layer = get_channel_layer()

#     # 4 cases
#     # place_bid, buy_now, set_ask, sell_now
#     submit_type = request.POST.get("submit_type", None)

#     card = None
#     client = None
#     wallet = None

#     bid_form = BidForm(request.POST or None)
#     sale_form = SaleForm(request.POST or None)
#     set_auction_form = SetAuctionForm()

#     if request.user.is_authenticated:
#         client = Client.objects.get(user=request.user)
#     if request.method == 'POST':
#         if not client:
#             messages.error(request, "Please login before placing bids or asks")
#         else:
#             wallet = get_object_or_404(Wallet, client=client)
#             card = get_object_or_404(Card, id=card_id)

#             if submit_type and submit_type == 'set_ask' and sale_form.is_valid():
#                 owned_cards = get_all_owned_cards_for_sale(client, card)
#                 owned_cards_count = owned_cards.count()
#                 card_entity = owned_cards.first()

#                 sale_amount = sale_form.cleaned_data["sale_amount"]
#                 quantity = sale_form.cleaned_data["quantity"]

#                 if quantity > owned_cards_count:
#                     messages.error(request, f"You only own {owned_cards_count} of this card")
#                 else:
#                     for card in owned_cards[:quantity]:
#                         card.on_sale = True
#                         card.ask_price = sale_amount
#                         card.save()

#                     someone_made_an_ask(card_entity, quantity, sale_amount)
#                     async_to_sync(channel_layer.group_send)(
#                         f"sale_{card_id}",
#                         {
#                             "type": "ask_placed",
#                             "message": "New ask",
#                         },
#                     )
#             elif submit_type and submit_type == 'place_bid' and bid_form.is_valid():
#                 amount = bid_form.cleaned_data["bid_amount"]
#                 quantity = bid_form.cleaned_data["quantity"]
#                 total_amount = amount * quantity

#                 # Check if client has enough funds
#                 if total_amount > wallet.funds:
#                     messages.error(request, "Not enough funds")
#                 else:
#                     try:
#                         with transaction.atomic():
#                             wallet.funds = float(wallet.funds) - float(total_amount)
#                             wallet.save()
#                             SalesBid.objects.bulk_create(
#                                 [
#                                     SalesBid(card=card, bidder=client, amount=amount)
#                                     for i in range(quantity)
#                                 ]
#                             )
#                             someone_made_a_salesbid(card, client, amount, quantity)
#                             async_to_sync(channel_layer.group_send)(
#                                 f"sale_{card_id}",
#                                 {
#                                     "type": "bid_placed",
#                                     "message": "New bid",
#                                 },
#                             )
#                     except Exception as e:
#                         messages.error(request, "Something went wrong")
#             elif submit_type and submit_type == 'buy_now':
#                 quantity = request.POST.get("quantity", None)
#                 if quantity:
#                     amount_to_pay = 0
#                     cards_to_buy = get_all_cards_on_sale(card=card).exclude(owner=client).all().order_by("ask_price")[:int(quantity)]

#                     if cards_to_buy.count() == 0:
#                         messages.error(request, "You already own these cards.")

#                     for card in cards_to_buy:
#                         amount_to_pay = amount_to_pay + card.ask_price

#                     buyer = client
#                     buyer_wallet = get_object_or_404(Wallet, client=client)

#                     if amount_to_pay > buyer_wallet.funds:
#                         messages.error(request, "Not enough funds")
#                     else:
#                         for card in cards_to_buy:
#                             seller_wallet = get_object_or_404(Wallet, client=card.owner)
#                             ask_price = card.ask_price
#                             seller = card.owner
#                             original_owner = card.original_owner

#                             try:
#                                 with transaction.atomic():
#                                     seller_wallet.funds = seller_wallet.funds + ask_price
#                                     buyer_wallet.funds = buyer_wallet.funds - ask_price
#                                     card.owner = buyer
#                                     card.on_sale = False
#                                     seller_wallet.save()
#                                     buyer_wallet.save()
#                                     card.save()
#                                     messages.success(request, f"You now own {card.card}")
#                                     someone_made_a_sale(card, 1, buyer, seller, card.ask_price)

#                                     # Calculate referral
#                                     original_owner_wallet = get_object_or_404(
#                                         Wallet, client=original_owner
#                                     )
#                                     adjust_referral(seller_wallet, original_owner_wallet, ask_price)
#                                     async_to_sync(channel_layer.group_send)(
#                                         f"sale_{card.card.id}",
#                                         {
#                                             "type": "card_bought",
#                                             "message": "New buy",
#                                         },
#                                     )
#                             except Exception as e:
#                                 print(e)
#                                 messages.error(request, "Something went wrong")
#                 else:
#                     messages.error(request, "Quantity is required")           
#             elif submit_type and submit_type == 'sell_now':
#                 quantity = request.POST.get("quantity", None)
#                 if quantity:
#                     bids = SalesBid.objects.exclude(bidder=client).filter(card=card).order_by("-amount")[:int(quantity)]
#                     cards_owned = CardEntity.objects.filter(owner=client, card=card)

#                     if bids.count() > int(quantity):
#                         messages.error(request, "No active bids on this card")
#                     elif bids.count() == 0:
#                         messages.error(request, "No active bids on this card")
#                     else:
#                         if cards_owned.count() == 0:
#                             messages.error(request, "You do not own this card")
#                         elif cards_owned.count() < int(quantity):
#                             messages.error(request, f"You only own {cards_owned.count()} of this card")
#                         else:
#                             for i in range(bids.count()):
#                                 bid_price = bids[i].amount
#                                 bidder = bids[i].bidder
#                                 card_to_transfer = cards_owned[i]
#                                 original_owner = card_to_transfer.original_owner
#                                 try:
#                                     with transaction.atomic():
#                                         wallet.funds = wallet.funds + bid_price
#                                         card_to_transfer.owner = bidder
#                                         card_to_transfer.on_sale = False
#                                         wallet.save()
#                                         card_to_transfer.save()
#                                         bids[i].delete()
#                                         messages.success(request, f"You have sold {card}")
#                                         someone_made_a_sale(card_to_transfer, 1, bidder, client, bid_price)

#                                         # Calculate referral
#                                         original_owner_wallet = get_object_or_404(
#                                             Wallet, client=original_owner
#                                         )
#                                         adjust_referral(wallet, original_owner_wallet, bid_price)
#                                         async_to_sync(channel_layer.group_send)(
#                                             f"sale_{card_to_transfer.card.id}",
#                                             {
#                                                 "type": "card_bought",
#                                                 "message": "New buy",
#                                             },
#                                         )
#                                 except Exception as e:
#                                     print(e)
#                                     messages.error(request, "Something went wrong")
#                 else:
#                     messages.error(request, "Quantity is required")
#             else:
#                 messages.error(request, "Quantity is required to place bids or set asks")

#     fav_card = False
#     card = get_object_or_404(Card, id=card_id)

#     if client:
#         # Check if card is favorite or not
#         fav_card = Wishlist.objects.filter(client=client, cards=card).exists()

#     # Excluse the entities which are currently
#     # being auctioned on hence are not available
#     # to be 'buy now'
#     card_entities_for_sale = get_all_cards_on_sale(card)
#     card_entities_owned_all = get_all_owned_cards_for_sale(client, card)
#     card_entity_owned = card_entities_owned_all.first()

#     # highest_bid = SalesBid.objects.filter(card=card).order_by("-amount").first()
#     lowest_bid = SalesBid.objects.filter(card=card).order_by("amount").first()

#     # Get all historical bids
#     bids = Bid.objects.filter(asset=card).order_by("-price")[:20]
#     highest_bid = bids.first()
#     # Get all historical asks
#     asks = Ask.objects.filter(asset=card).order_by("price")[:20]

#     # Get all historical sales
#     sales = Sale.objects.filter(asset=card).order_by("-created_at")[:20]
    
#     # lowest_ask_card = card_entities_for_sale.order_by("ask_price").first()
#     lowest_ask_card = asks.first()

#     lowest_ask = 0
#     if lowest_ask_card:
#         lowest_ask = lowest_ask_card.price
#     grouped_bids = get_grouped_bids(card)
#     grouped_asks = get_grouped_asks(card)
#     # if grade_id:
#     #     grouped_bids = [bid for bid in grouped_bids if bid.get("grade_id") == int(grade_id)]
#     #     grouped_asks = [ask for ask in grouped_asks if ask.get("grade_id") == int(grade_id)]
#     #     sales = [sale for sale in sales if sale.grade_id == int(grade_id)] 
#     context = {
#         "card": card,
#         "card_entities": card_entities_for_sale,
#         "lowest_ask": lowest_ask,
#         "bids": grouped_bids,
#         "asks": grouped_asks,
#         "sales": sales,
#         "card_entity": card_entity_owned,
#         "card_entities_owned_all": card_entities_owned_all,
#         "fav_card": fav_card,
#         "set_auction_form": set_auction_form
#     }

#     if highest_bid:
#         context["highest_bid"] = format_usd_currency(highest_bid.price)
#     else:
#         context["highest_bid"] = 0

#     if lowest_bid:
#         context["lowest_bid"] = format_usd_currency(lowest_bid.amount)
#     else:
#         context["lowest_bid"] = 0
#     grades = Grade.objects.all()
#     context["grades"] = grades
#     return render(request, "cards/detail.html", context)


@login_required
def toggle_card_favorite(request, card_id):
    client = Client.objects.get(user=request.user)
    is_favorite = False

    if client:
        wishlist = Wishlist.objects.get(client=client)
        card = wishlist.cards.filter(id=card_id).first()
        if card:
            wishlist.cards.remove(card)
        else:
            fav_card = Card.objects.filter(id=card_id).first()
            wishlist.cards.add(fav_card)
            is_favorite = True

    return JsonResponse({"success": True, "is_favorite": is_favorite})


@login_required
def remove_card_from_collection(request, collection_id, card_id):
    client = Client.objects.get(user=request.user)
    if client:
        collection = Collections.objects.get(id=collection_id, client=client)
        card = collection.cards.filter(id=card_id).first()
        if card:
            collection.cards.remove(card)

    next_url = request.GET.get("next")
    referrer = request.META.get("HTTP_REFERER")

    if next_url:
        return redirect(next_url)
    elif referrer:
        return redirect(referrer)
    return redirect("/")


def search(request):
    favorite_cards = []
    selected_filters = []

    params = request.GET.copy()
    params.pop("page", None)
    params.pop("limit", None)

    clean_params = urlencode(params)

    page = request.GET.get("page", 1)
    limit = request.GET.get("limit", 24)

    category = request.GET.get("category")
    price = request.GET.get("price")
    grade = request.GET.get("grade")
    condition = request.GET.get("condition")
    sort = request.GET.get("sort", "name")
    set = request.GET.get("set")
    max_price = request.GET.get("maxPrice")
    min_price = request.GET.get("minPrice")
    rarity = request.GET.get("rarity")
    booster_pack = request.GET.get("boosterPack")
    query = request.GET.get("query")

    cards = Card.objects.all()
    cards = annotate_card_price(cards)
    categories = Category.objects.all()

    if sort:
        cards = cards.order_by(sort)

    if query:
        cards = cards.filter(Q(name__icontains=query) | Q(id__icontains=query))

    if request.user.is_authenticated:
        client = Client.objects.get(user=request.user)
        if client:
            wishlist = Wishlist.objects.get(client=client)
            favorite_cards = wishlist.cards.all()

    if category:
        selected_filters.append({
            "category": category
        })
        selected_category = Category.objects.get(id=int(category))
        cards = cards.filter(category=selected_category)

    if price and price != "all":
        selected_filters.append({
            "price": price
        })
        if price != "all":
            low, high = price.split("_")
            cards = cards.annotate(
                price=Case(
                    When(
                        Q(tcgplayer__prices__holofoil__mid__isnull=False),
                        then=Cast(F("tcgplayer__prices__holofoil__mid"), FloatField()),
                    ),
                    When(
                        Q(cardmarket__prices__avg1__isnull=False),
                        then=Cast(F("cardmarket__prices__avg1"), FloatField()),
                    ),
                    default=Value(0),
                    output_field=FloatField(),
                )
            )
            cards = cards.filter(price__gte=low, price__lte=high)

    if grade:
        selected_filters.append({
            "grade": grade
        })
        if grade != "not_specified":
            is_null = True if grade == "no" else False
            cards = cards.filter(grade__isnull=is_null)

    if condition:
        selected_filters.append({
            "condition": condition
        })
        if condition != "not_specified":
            cards = cards.filter(condition=condition)

    # Pagination
    paginator = Paginator(cards, limit)
    total_pages = paginator.num_pages

    if int(page) <= 0 or int(page) > total_pages:
        page = 1

    page_data = paginator.get_page(page)
    cards_for_page = page_data.object_list.prefetch_related('cardentity_set')
    processed_cards = attach_ask_price_to_card_list(cards_for_page)
    
    count = paginator.count
    page_range = get_sliced_array(list(paginator.page_range), int(page), 9)

    context = {
        "cards": processed_cards,
        "favorite_cards": favorite_cards,
        "categories": categories,
        "selected_filters": selected_filters,
        "pagination": {
            "page": int(page),
            "limit": limit,
            "total": count,
            "total_pages": total_pages,
            "has_next": page_data.has_next(),
            "has_prev": page_data.has_previous(),
            "page_range": page_range,
            "params": clean_params,
        },
    }
    append_raw_grade_in_context(context)

    return render(request, f"cards/search.html", context)


def news(request):
    return render(request, "cards/news.html", {})


def about(request):
    return render(request, "cards/about.html", {})


def help(request):
    return render(request, "cards/help.html", {})


@login_required
def set_auction(request, card_id):
    client = get_object_or_404(Client, user=request.user)
    card = get_object_or_404(Card, id=card_id)

    owned_cards = get_all_owned_cards_for_auctions(client, card)
    card_for_auction = owned_cards.first()

    if card_for_auction == None:
        messages.error(
            request, "You do not own this card or it is already in an auction"
        )
        return redirect(f"/card-detail/{card_id}")

    form = SetAuctionForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        starting_price = form.cleaned_data["starting_price"]
        if starting_price <=0:
            messages.error(
                request, "Starting price should be greater than 0"
            )
            return redirect(f"/card-detail/{card_id}")

        # start_time = form.cleaned_data["start_time"]
        end_time = form.cleaned_data["end_time"]
        auction = Auction(
            starting_price=starting_price,
            start_time=timezone.now(),
            end_time=end_time,
            card_entity=card_for_auction,
        )
        card_for_auction.on_sale = False
        card_for_auction.save()
        auction.save()
        return redirect(f"/auction/{auction.id}")

    return render(request, "auctions/set-auction-form.html", {"form": form, "card": card})


@login_required
def add_to_collection_page(request, card_id):
    client = get_object_or_404(Client, user=request.user)
    collections = (
        Collections.objects.annotate(card_count=Count("cards"))
        .filter(client=client)
        .order_by("name")
    )
    context = {"collections": collections, "card_id": card_id}
    return render(request, "cards/add-to-collection.html", context)


def get_all_favorites(request):
    client = get_object_or_404(Client, user=request.user)
    wishlist = get_object_or_404(Wishlist, client=client)
    cards = wishlist.cards.all()
    serializer = CardSerializer(cards, many=True)
    return JsonResponse({"success": True, "data": serializer.data})


def get_all_asks(request, card_id):
    card = get_object_or_404(Card, id=card_id)
    card_entities = CardEntity.objects.filter(on_sale=True, card=card)
    serializer = CardEntitySerializer(card_entities, many=True)
    return JsonResponse({"success": True, "data": serializer.data})


def search_cards(request):
    query = request.GET.get("query", None)
    cards = []
    if query:
        cards = Card.objects.filter(name__icontains=query).order_by("name")
    serializer = CardSerializer(cards, many=True)
    return JsonResponse({"success": True, "data": serializer.data})

def get_authenticated_client(user):
    if not user.is_authenticated:
        return None
    try:
        return Client.objects.get(user=user)
    except Client.DoesNotExist:
        return None

def validate_api_request(user, card_id):
    """Returns (client, wallet, card) or raises appropriate JsonResponse"""
    client = get_authenticated_client(user)
    if not client:
        return JsonResponse(
            {'status': 'error', 'message': 'Authentication required'},
            status=401
        )
    
    try:
        wallet = get_object_or_404(Wallet, client=client)
        card = get_object_or_404(Card, id=card_id)
        return (client, wallet, card)
    except Exception as e:
        return JsonResponse(
            {'status': 'error', 'message': str(e)},
            status=400
        )

def broadcast_card_entities_update(client, card_id, grade_id):
    card = get_object_or_404(Card, id=card_id)
    card_entities_owned_all = get_all_owned_cards_for_sale(client, card)
    card_entities_for_sale = get_all_cards_on_sale(card)
    # CardEntity.objects.filter(on_sale=True, card=card, grade=grade_id)

    lowest_ask_card = CardEntity.objects.filter(card=card,grade=grade_id,owner=client, on_sale=True).order_by("ask_price").first()

    # asks = Ask.objects.filter(asset=card,grade=grade_id).order_by("price")[:20]
    highest_bid_card = Bid.objects.filter(asset=card,grade=grade_id).order_by("-price").first()
    highest_bid = 0
    if highest_bid_card:
        highest_bid = highest_bid_card.price
    lowest_ask = 0
    if lowest_ask_card:
        lowest_ask = lowest_ask_card.ask_price
    
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"sale_{card_id}",
        {
            "type": "card_entities_owned",
            "card_entities_owned_all": len(card_entities_owned_all),
            "card_entities_for_sale": len(card_entities_for_sale),
            "lowest_ask": str(lowest_ask),
            "highest_bid": str(highest_bid),
        }
    )
    
def get_grouped_bids(card):
    """
    Takes a queryset of bids and returns the grouped data of queryset by user and price.
    """
    orders = (
        SalesBid.objects.filter(card=card)
        .values("amount")
        .annotate(
            total_price=Sum("amount"),  # Rename to avoid conflict
            total_quantity=Count("id"),
            actual_price = Max('amount'),
            grade_id= Max('grade')
        )
        .order_by("-actual_price")
    )

    result = []
    for order in orders:
        total = float(order['actual_price']) * order['total_quantity']
        result.append({
            'price': format_usd_currency(order['actual_price']),  
            'quantity':format_usd_currency_without_sign(order['total_quantity']), 
            'total': format_usd_currency(total),
            'grade_id': order.get('grade_id')
        })
    # for order in result:
    #     print(f" Price: {order['price']}, Quantity: {order['quantity']}, Total: {order['total']}")

    return result

def get_grouped_asks(card):
    """
    Takes a queryset of asks and returns the grouped data of queryset by user and price.
    """
    orders = (
        CardEntity.objects.filter(on_sale=True, card=card)
        .values("ask_price")
        .annotate(
            quantity=Count("id"),              # Count how many asks at this ask_price
            grade_id=Max("grade_id")           # Use Max as a representative grade_id
        )
        .order_by("ask_price")                # Lowest ask_price first
    )

    result = []
    for order in orders:
        total = float(order['ask_price']) * order['quantity']
        result.append({
            'price': format_usd_currency(order['ask_price']),
            'quantity': format_usd_currency_without_sign(order['quantity']),
            'total': format_usd_currency(total)
        })

    return result


def get_graded_grouped_bids(grade_id, card):
    """
    Takes a queryset of bids and returns the grouped data of queryset by user and price.
    """
    orders = (
        SalesBid.objects.filter(card=card, grade= grade_id)
        .values("amount")
        .annotate(
            total_price=Sum("amount"),  # Rename to avoid conflict
            total_quantity=Count("id"),              
            actual_price = Max('amount'),
            grade_id= Max('grade')
        )
        .order_by("-actual_price")
    )

    result = []
    for order in orders:
        total = float(order['actual_price']) * order['total_quantity']
        result.append({
            'price': format_usd_currency(order['actual_price']),  
            'quantity':format_usd_currency_without_sign(order['total_quantity']), 
            'total': format_usd_currency(total),
            'grade_id': order.get('grade_id')
        })
    return result

def get_graded_grouped_asks(grade_id, card):
    """
    Takes a queryset of asks and returns the grouped data of queryset by user and price.
    """
    orders = (
        CardEntity.objects.filter(on_sale=True, card=card, grade=grade_id)
        .values("ask_price")
        .annotate(
            quantity=Count("id"),              # Count how many asks at this ask_price
            grade_id=Max("grade_id")           # Use Max as a representative grade_id
        )
        .order_by("ask_price")                # Lowest ask_price first
    )

    result = []
    for order in orders:
        total = float(order['ask_price']) * order['quantity']
        result.append({
            'price': format_usd_currency(order['ask_price']),
            'quantity': format_usd_currency_without_sign(order['quantity']),
            'total': format_usd_currency(total),
            'grade_id': order.get('grade_id')
        })

    return result
    
def format_usd_currency(amount):
    try:
        return format_currency(amount, 'USD', locale='en_US')
    except Exception as e:
        print(f"Formatting error: {e}")
        return amount 
    
def format_usd_currency_without_sign(amount):
    try:
        return format_decimal(amount, locale='en_US')
    except Exception as e:
        print(f"Formatting error: {e}")
        return str(amount)
    
def place_bids(card, client, amount, quantity, grade_id, wallet, card_id):
    try:
        total_amount = amount * quantity
        if wallet.funds < total_amount:
            return JsonResponse({
                'status': 'error',
                'message': 'Not enough funds',
                'bids_placed': 0,
                'bids_fulfilled': 0
            }, status=400)
        wallet.funds = float(wallet.funds) - total_amount
        wallet.save()

        # Create bids
        SalesBid.objects.bulk_create([
            SalesBid(card=card, bidder=client, amount=amount, grade_id=grade_id)
            for _ in range(quantity)
        ])

        # Notify
        someone_made_a_salesbid(card, client, amount, quantity, grade_id)

        # WebSocket notification
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"sale_{card_id}",
            {
                "type": "bid_placed",
                "message": "New bid",
                "amount": amount,
                "quantity": quantity
            }
        )

        broadcast_card_entities_update(client, card_id, grade_id)
    
    except Exception as e:
        print("Error placing sales bids:", e)
        raise

def place_single_bid(card, client, amount, quantity, grade_id, wallet, card_id):
    try:
        wallet.funds = float(wallet.funds) - amount
        if wallet.funds < amount:
            return JsonResponse({
                'status': 'error',
                'message': 'Not enough funds',
                'bids_placed': 0,
                'bids_fulfilled': 0
            }, status=400)

        wallet.save()
        # Create only one bid
        SalesBid.objects.create(
            card=card,
            bidder=client,
            amount=amount,
            grade_id=grade_id
        )

        # Notify
        someone_made_a_salesbid(card, client, amount, 1, grade_id)  

        # WebSocket notification
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"sale_{card_id}",
            {
                "type": "bid_placed",
                "message": "New bid",
                "amount": amount,
                "quantity": 1
            }
        )
        broadcast_card_entities_update(client, card_id, grade_id)

    except Exception as e:
        print("Error placing sales bid:", e)
        raise

def set_ask_price(card, client, grade_id, ask_price):
    try:
        card_entity = CardEntity.objects.get(card=card, grade=grade_id, owner=client,)
        card_entity.on_sale = True
        card_entity.ask_price = ask_price
        card_entity.save()
        return {"success": True, "message": "CardEntity updated successfully."}
    except ObjectDoesNotExist:
        return {"success": False, "message": "CardEntity not found with the given card and grade_id."}
    except Exception as e:
        return {"success": False, "message": f"An error occurred: {str(e)}"}

def broadcast_sell_button_status(client, card, grade_id):
    try:
        card_entities_owned_all = get_all_owned_cards_for_sale_by_grade(client, card, grade_id)
        channel_layer = get_channel_layer()
        
        async_to_sync(channel_layer.group_send)(
            f"sale_{card}",
            {
                "type": "sell_button_status",
                "card_entities_owned_all": len(card_entities_owned_all),
            }
        )
    except Exception as e:
        print('error ',str(e))
        return {"success": False, "message": f"An error occurred: {str(e)}"}

