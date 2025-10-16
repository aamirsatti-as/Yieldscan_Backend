from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import SalesBid
from .forms import BidForm
from django.db import transaction
from django.contrib import messages
from accounts.models import Client
from wallets.models import Wallet
from cards.models import Card, CardEntity
from cards.forms import SaleForm
from .utils import someone_made_a_sale, someone_made_an_ask, someone_made_a_salesbid
from cards.utils import get_all_owned_cards_for_sale
from pokemon.utils import adjust_referral


@login_required
def place_bid(request, card_id):
    client = get_object_or_404(Client, user=request.user)
    card = get_object_or_404(Card, id=card_id)
    wallet = get_object_or_404(Wallet, client=client)

    form = BidForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        amount = form.cleaned_data["bid_amount"]
        quantity = form.cleaned_data["quantity"]
        total_amount = amount * quantity

        # Check if client has enough funds
        if total_amount > wallet.funds:
            messages.error(request, "Not enough funds")
        else:
            try:
                with transaction.atomic():
                    wallet.funds = float(wallet.funds) - float(total_amount)
                    wallet.save()
                    sales_bids = SalesBid.objects.bulk_create(
                        [
                            SalesBid(card=card, bidder=client, amount=amount)
                            for i in range(quantity)
                        ]
                    )
                    someone_made_a_salesbid(card, client, amount, quantity)
                    return redirect(f"/card-detail/{card_id}/")
            except Exception as e:
                messages.error(request, "Something went wrong")

    return render(request, "sales/bid-form.html", {"form": form})


def buy_now(request, card_id):
    channel_layer = get_channel_layer()

    card = get_object_or_404(CardEntity, id=card_id)

    if not request.user.is_authenticated:
        return redirect(f"/auth/login/?next=/card-detail/{card.card.id}/")

    client = get_object_or_404(Client, user=request.user)
    buyer_wallet = get_object_or_404(Wallet, client=client)
    seller_wallet = get_object_or_404(Wallet, client=card.owner)

    ask_price = card.ask_price
    buyer = client
    seller = card.owner
    original_owner = card.original_owner

    if card.owner == client:
        messages.error(request, "You already own this card")
    else:
        if buyer_wallet.funds < card.ask_price:
            messages.error(request, "Not enough funds")
        else:
            try:
                with transaction.atomic():
                    seller_wallet.funds = seller_wallet.funds + ask_price
                    buyer_wallet.funds = buyer_wallet.funds - ask_price
                    card.owner = buyer
                    card.on_sale = False
                    seller_wallet.save()
                    buyer_wallet.save()
                    card.save()
                    someone_made_a_sale(card, 1, buyer, seller, card.ask_price)
                    messages.success(request, f"You now own {card.card}")

                    # Calculate referral
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

    return redirect(f"/card-detail/{card.card.id}/")


@login_required
def set_ask(request, card_id):
    channel_layer = get_channel_layer()

    card = get_object_or_404(Card, id=card_id)
    client = get_object_or_404(Client, user=request.user)

    owned_cards = get_all_owned_cards_for_sale(client, card)
    owned_cards_count = owned_cards.count()
    card_entity = owned_cards.first()

    form = SaleForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        sale_amount = form.cleaned_data["sale_amount"]
        quantity = form.cleaned_data["quantity"]

        if quantity > owned_cards_count:
            messages.error(request, f"You only own {owned_cards_count} of this card")
        else:
            for card in owned_cards[:quantity]:
                card.on_sale = True
                card.ask_price = sale_amount
                card.save()

            someone_made_an_ask(card_entity, owned_cards_count)
            async_to_sync(channel_layer.group_send)(
                f"sale_{card_id}",
                {
                    "type": "ask_placed",
                    "message": "New ask",
                },
            )
            return redirect(f"/card-detail/{card.card.id}/")

    return render(request, "cards/sale-form.html", {"form": form})


@login_required
def sell_now(request, card_id):
    pass
    # card = get_object_or_404(CardEntity, id=card_id)
    # client = get_object_or_404(Client, user=request.user)

    # card_entity_owned = card.owner == client

    # if card_entity_owned == False:
    #     messages.error(request, "You do not own this card")
    #     return redirect(f"/card-detail/{card.card.id}/")

    # highest_bid = SalesBid.objects.filter(card=card.card).order_by("-amount").first()

    # print(highest_bid)

    # if highest_bid == None:
    #     messages.error(request, "No bids")
    #     return redirect(f"/card-detail/{card.card.id}/")

    # card.owner = highest_bid.bidder
    # card.save()

    # messages.success(request, f"Card sold to {highest_bid.bidder}")
    # return redirect(f"/card-detail/{card.card.id}/")
