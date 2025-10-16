from market.models import Bid, AuctionSale

def someone_made_an_auctionbid(card, bidder, amount, quantity):
    bid = Bid(asset=card, user=bidder, price=amount, quantity=quantity, type="auction")
    bid.save()


def someone_made_an_auctionsale(card, buyer, amount, seller,  auction_result):
    sale = AuctionSale(asset=card, buyer=buyer, price=amount, seller=seller, auction_result=auction_result)
    sale.save()