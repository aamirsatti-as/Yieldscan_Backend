from django.utils import timezone
from auctions.models import Auction
from cards.models import CardEntity, Grade


# Returns all owned cards
def get_all_owned_cards(client, card):
    return (
        CardEntity.objects.filter(owner=client).filter(card=card).filter(on_sale=False)
    )


# Returns all cards which are on sale
def get_all_cards_on_sale(card):
    now = timezone.now()

    cards_in_auctions = Auction.objects.filter(
        end_time__gt=now
    ).values_list("card_entity", flat=True)

    return (
        CardEntity.objects.exclude(id__in=cards_in_auctions)
        .filter(card=card)
        .filter(on_sale=True)
    )

def get_all_cards_on_sale_by_grade(card,grade_id):
    now = timezone.now()

    cards_in_auctions = Auction.objects.filter(
        end_time__gt=now
    ).values_list("card_entity", flat=True)

    return (
        CardEntity.objects.exclude(id__in=cards_in_auctions)
        .filter(card=card)
        .filter(on_sale=True)
        .filter(grade=grade_id)
    )


# Returns all cards which are ready to be
# put on sale
def get_all_owned_cards_for_sale(client, card):
    now = timezone.now()

    cards_in_auctions = Auction.objects.filter(
         end_time__gt=now
    ).values_list("card_entity", flat=True)

    return (
        CardEntity.objects.exclude(id__in=cards_in_auctions)
        .filter(owner=client)
        .filter(card=card)
        .filter(on_sale=False)
    )

def get_all_owned_cards_for_sale_by_grade(client, card, grade_id):
    now = timezone.now()

    cards_in_auctions = Auction.objects.filter(
        end_time__gt=now
    ).values_list("card_entity", flat=True)

    return (
        CardEntity.objects.exclude(id__in=cards_in_auctions)
        .filter(owner=client)
        .filter(card=card)
        .filter(on_sale=False)
        .filter(grade=grade_id)
    )


# Returns all cards which are ready to be
# put in an auction
def get_all_owned_cards_for_auctions(client, card):
    now = timezone.now()

    cards_in_auctions = Auction.objects.filter(
        end_time__gt=now
    ).values_list("card_entity", flat=True)
    return (
        CardEntity.objects.exclude(id__in=cards_in_auctions)
        .filter(owner=client)
        .filter(card=card)
    )

def filter_bids_by_grade(bids, grade_id):
    return [bid for bid in bids if bid.get("grade_id") == int(grade_id)]


def filter_asks_by_grade(asks, grade_id):
    return [ask for ask in asks if ask.get("grade_id") == int(grade_id)]


def filter_sales_by_grade(sales, grade_id):
    return [sale for sale in sales if getattr(sale, "grade_id", None) == int(grade_id)]

def append_raw_grade_in_context(context) :
    try:
        raw_grade = Grade.objects.get(value='Raw')
        context["raw_grade"] = raw_grade.value
    except Grade.DoesNotExist as e:
        print(f"Error: Raw grade not found - {e}")
    except Exception as e:
        print(f"Unexpected error when fetching raw grade - {e}")