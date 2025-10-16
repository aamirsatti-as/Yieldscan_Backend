from django.db.models import Case, When, Q, Value, FloatField, F, Min
from django.core.paginator import Paginator
from django.db.models.functions import Cast
from django.db import transaction
from decimal import Decimal

REFERRAL_PERCENTAGE = Decimal(0.1)


def format_time_remaining(time_delta):
    if time_delta.total_seconds() <= 0:
        return "00h 00m"

    days = time_delta.days
    hours, remainder = divmod(time_delta.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    if days > 0:
        return f"{days} days, {hours}h {minutes}m {seconds}s" 
    elif hours > 0:
        return f"{hours}h {minutes}m {seconds}s"
    else:
        return f"{minutes}m {seconds}s"


def get_sliced_array(arr, num, window=5):
    if len(arr) <= window:  
        return arr  # If total pages are within window size, return all.

    half_window = (window - 2) // 2  # Reserve space for first & last pages
    index = arr.index(num)  

    # Determine the dynamic range around `num`
    start = max(1, index - half_window)  # Start at 1 to keep first page
    end = min(len(arr) - 1, start + window - 2)  # -2 for first & last page

    # Adjust start again if reaching the end
    start = max(1, end - (window - 2))

    page_list = arr[start:end]

    # Ensure first and last pages are included
    if arr[0] not in page_list:
        page_list.insert(0, arr[0])
    if arr[-1] not in page_list:
        page_list.append(arr[-1])

    return page_list


def annotate_card_price(queryset):
    return queryset.annotate(
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


def adjust_referral(seller_wallet, original_owner_wallet, ask_price):
    price = Decimal(ask_price)
    referral_cut = Decimal(REFERRAL_PERCENTAGE) * price
    try:
        with transaction.atomic():
            if seller_wallet != original_owner_wallet:
                seller_wallet.funds = seller_wallet.funds - referral_cut
                original_owner_wallet.funds = original_owner_wallet.funds + referral_cut
                seller_wallet.save()
                original_owner_wallet.save()
    except Exception as e:
        raise


def paginate(items, page, limit, key="items"):
    items_key = items

    if key:
        items_key = key

    paginator = Paginator(items, limit)
    total_pages = paginator.num_pages

    if int(page) <= 0 or int(page) > total_pages:
        page = 1

    page_data = paginator.get_page(page)
    count = paginator.count
    page_range = get_sliced_array(list(paginator.page_range), int(page), 9)

    context = {
        items_key: page_data,
        "pagination": {
            "page": int(page),
            "limit": limit,
            "total": count,
            "total_pages": total_pages,
            "has_next": page_data.has_next(),
            "has_prev": page_data.has_previous(),
            "page_range": page_range,
        },
    }

    return context


def attach_ask_price_to_card(card):
    entities = card.cardentity_set.prefetch_related('grade').filter(on_sale=True).order_by('grade')
    highest_grade_entity = entities.first()
    grouped_entities = (
        entities.values("grade__id", "grade__value")
        .annotate(lowest_ask_price=Min("ask_price"))
        .order_by("grade") 
    )
    if highest_grade_entity:
        card.highest_grade = highest_grade_entity.grade_id
    card.entities = grouped_entities
    return card


def attach_ask_price_to_card_list(card_list):
    cards = []
    for card in card_list:
        cards.append(attach_ask_price_to_card(card))
    return cards
