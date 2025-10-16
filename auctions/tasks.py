from django.utils import timezone
from auctions.models import AuctionResult, Auction, AuctionBid, CardEntity
from accounts.models import Client
from wallets.models import Wallet
from pokemon.utils import adjust_referral
from .utils import someone_made_an_auctionsale


def generate_auction_results():
    print('cron running')
    now = timezone.now()
    ended_auctions = Auction.objects.filter(end_time__lte=now).exclude(
        auctionresult__isnull=False
    )
    for auction in ended_auctions:
        # highest_bid = auction.highest_bid_record
        card = auction.card_entity
        highest_bid = AuctionBid.objects.filter(auction=auction.id).order_by('-amount').first()    
        # highest_bid2 = AuctionBid.objects.filter(auction=auction.id).order_by('-amount').first()    
        
        seller_wallet = Wallet.objects.get(client=card.owner)
        original_owner_wallet = Wallet.objects.get(client=card.original_owner)
        # print('')
        if highest_bid:
            # card_entity = CardEntity.objects.get(card=card)
            # print('card',card.ask_price)
            ask_price = highest_bid.amount
            # Add funds to sellers wallet
            seller_wallet.funds = seller_wallet.funds + ask_price
            seller_wallet.save()
            
            # All the other bidders who have lower
            # bids should get refunded
            unique_bidders = (
                Client.objects.exclude(id=highest_bid.bidder.id)
                .filter(auctionbid__auction=auction)
                .distinct()
            )
            refund_to_other_bidders(unique_bidders, auction)
            card.owner = highest_bid.bidder
            card.save()

            result = AuctionResult.objects.create(
                auction=auction,
                winner=highest_bid.bidder,
                final_price=highest_bid.amount,
            )

            adjust_referral(seller_wallet, original_owner_wallet, ask_price)
            someone_made_an_auctionsale(
                card.card, highest_bid.bidder, ask_price, card.owner, result
            )


def refund_to_other_bidders(unique_bidders, auction):
    for bidder in unique_bidders:
        bidder_bid = AuctionBid.objects.get(bidder=bidder,auction=auction)
        bidder_wallet = Wallet.objects.get(client=bidder)
        if bidder_bid and bidder_wallet:
            bidder_wallet.funds = bidder_wallet.funds + bidder_bid.amount
            bidder_wallet.save()
