from market.models import Sale, Ask, Bid


def someone_made_a_sale(card_entity, quantity, buyer, seller, price, grade_id):
    sale = Sale(
        asset=card_entity.card,
        price=price,
        quantity=quantity,
        buyer=buyer,
        seller=seller,
        grade_id=grade_id
    )
    sale.save()


def someone_made_an_ask(card_entity, quantity, price, grade_id):
    ask = Ask(
        asset=card_entity.card,
        user=card_entity.owner,
        price=price,
        quantity=quantity,
        grade_id=grade_id,
    )
    ask.save()


def someone_made_a_salesbid(card, bidder, amount, quantity, grade_id):
    bid = Bid(asset=card, user=bidder, price=amount, quantity=quantity, grade_id=grade_id , type="sales")
    bid.save()
