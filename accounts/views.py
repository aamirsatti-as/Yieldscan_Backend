from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Count
from django.core.paginator import Paginator
from django.http import HttpResponse, HttpResponseRedirect, Http404, JsonResponse
from django.template import loader
from collections import defaultdict
from django.contrib import messages
from decimal import Decimal
from urllib.parse import urlencode
from django.contrib.auth import logout, login, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
import uuid
from .forms import (
    RegisterForm,
    LoginForm,
    EditProfileForm,
    EditClientForm,
    AddAddressForm,
    AddCollectionForm,
    ForgotPasswordForm,
    AddPortfolioForm,
)
from accounts.models import Client, Address
from wallets.models import Wallet
from cards.models import Wishlist, Collections, CardEntity, Portfolio, Card, Grade
from market.models import Sale, Ask, Bid
from cards.serializers import CollectionSerializer, PortfolioSerializer
from pokemon.utils import get_sliced_array, annotate_card_price, paginate
from .utils import check_if_user_exists

# Create your views here.

def login_view(request):
    if request.user.is_authenticated:
        return redirect(request.GET.get("next", "/"))

    # STEP 1: Email submission
    if request.method == "POST" and not "password" in request.POST:
        
        email = request.POST.get("email")
        user = check_if_user_exists(email)
        password = request.POST.get("password")

        if user:
            request.session["login_email"] = email 
            return render(request, "accounts/login.html", {"password_phase": True})
        else:
            messages.error(request, "No account found with this email.",extra_tags="email")

    # STEP 2: Password submission
    elif request.method == "POST" and "password" in request.POST:
        email = request.session.get("login_email")
        password = request.POST.get("password")
        if 'accept_terms' not in request.POST:
            messages.error(request, "You must accept the terms and conditions",extra_tags="terms")
            return render(request, "accounts/login.html", {
                "password_phase": True,
                "email": email
            })
        if email:
            user = check_if_user_exists(email)
            if user:
                user_authenticated = authenticate(
                    request, 
                    username=user.username, 
                    password=password
                )
                if user_authenticated:
                    login(request, user_authenticated)
                    if "login_email" in request.session:
                        del request.session["login_email"]
                    return redirect(request.GET.get("next", "/"))
                else:
                    messages.error(request, "Password is invalid",extra_tags="password")
            else:
                messages.error(request, "User does not exist with this email",extra_tags="email")
            
            return render(request, "accounts/login.html", {
                "password_phase": True,
                "email": email
            })
        else:
            messages.error(request, "Email is required",extra_tags="email")
    # Initial GET request (show email form)
    return render(request, "accounts/login.html", {"password_phase": False})

def register(request):
    form = RegisterForm(request.POST or None)
    if request.method == "POST" and "password" not in request.POST:
        email = request.POST.get("email")
        
        if not email:
            messages.error(request, "Email is required",extra_tags="email")
            
        user = check_if_user_exists(email)
        if user:
            messages.error(request, "User already exists with this email",extra_tags="email")
            return redirect("register")
        else:
            request.session["register_email"] = email
            return render(request, "accounts/register.html", {
                "password_phase": True,
                "email": email
            })
            
    elif request.method == "POST" and "password" in request.POST:
        email = request.session.get("register_email")
        password = request.POST.get("password")
        if 'accept_terms' not in request.POST:
            messages.error(request, "You must accept the terms and conditions",extra_tags="terms")
            return render(request, "accounts/login.html", {
                "password_phase": True,
                "email": email
            })
        if not email:
            messages.error(request, "Session expired. Please start over.",extra_tags="email")
            
        if not password:
            messages.error(request, "Password is required",extra_tags="password")
            return render(request, "accounts/register.html", {
                "password_phase": True,
                "email": email
            })

        # Create user
        username = uuid.uuid4().hex[:30]
        try:
            new_user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            new_user.save()
            
            if "register_email" in request.session:
                del request.session["register_email"]
                
            messages.success(request, "Account created! Please login")
            return redirect("/auth/login/")
            
        except Exception as e:
            messages.error(request, f"Error creating account: {str(e)}",extra_tags="password")
            return render(request, "accounts/register.html", {
                "password_phase": True,
                "email": email
            })
    return render(request, "accounts/register.html", {"form": form, 'password_phase':False})


def logout_view(request):
    if request.user.is_authenticated:
        logout(request)
    return HttpResponseRedirect("/")


def forgot_password(request):
    form = ForgotPasswordForm(request.POST or None)

    if request.method == "POST":
        messages.success(request, "Please check your email for further instructions")
        # Handle password forgot items
        pass

    return render(request, "accounts/forgot-password.html", {"form": form})


@login_required
def profile(request):
    client = get_object_or_404(Client, user=request.user)
    addresses = Address.objects.filter(client=client)
    context = {"user": request.user, "client": client, "addresses": addresses}
    return render(request, "accounts/profile.html", context)


@login_required
def edit_profile(request):
    client = get_object_or_404(Client, user=request.user)
    form = EditProfileForm(request.POST or None)
    client_form = EditClientForm(request.FILES)

    if request.method == "POST" and form.is_valid():
        try:
            username = form.cleaned_data["username"]
            email = form.cleaned_data["email"]
            first_name = form.cleaned_data["first_name"]
            last_name = form.cleaned_data["last_name"]
            is_image_removed = form.cleaned_data["is_image_removed"]

            does_email_exists = User.objects.filter(email=email).first()

            if does_email_exists:
                messages.error(request, "Email already exists")
            else:
                user = User.objects.get(id=request.user.id)

                if email != "":
                    user.email = email
                if username != "":
                    user.username = username
                if first_name != "":
                    user.first_name = first_name
                if last_name != "":
                    user.last_name = last_name

                # Check if image has been changed
                if client_form.is_valid():
                    if is_image_removed:
                        client.image = None
                    elif request.FILES:
                        client.image = request.FILES["image"]
                    else:
                        pass

                client.save()
                user.save()
                messages.success(request, "Updated succesfully")
                return redirect("/auth/profile/")
        except Exception as e:
            print(e)
            messages.error(request, "Could not update information")

    client = get_object_or_404(Client, user=request.user)
    context = {"user": request.user, "client": client, "form": form}
    return render(request, "accounts/edit-profile-form.html", context)


@login_required
def add_address(request):
    client = get_object_or_404(Client, user=request.user)
    form = AddAddressForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        try:
            address = form.save(commit=False)
            address.client = client
            address.save()
            return redirect("/auth/profile/")
        except Exception as e:
            print(e)

    return render(request, "accounts/address-form.html", {"form": form})


@login_required
def delete_address(request, address_id):
    address = get_object_or_404(Address, id=address_id)
    address.delete()
    return redirect("/auth/profile/")


@login_required
def edit_address(request, address_id):
    address = get_object_or_404(Address, id=address_id)

    form = AddAddressForm(instance=address)

    if request.method == "POST":
        form = AddAddressForm(request.POST, instance=address)
        if form.is_valid():
            try:
                form.save()
                return redirect("/auth/profile/")
            except Exception as e:
                print(e)

    return render(request, "accounts/address-form.html", {"form": form})


@login_required
def favorites(request):
    page = request.GET.get("page", 1)
    limit = request.GET.get("limit", 10)
    sort = request.GET.get("sort", "name")
    client = get_object_or_404(Client, user=request.user)
    wishlist = get_object_or_404(Wishlist, client=client)
    cards = annotate_card_price(wishlist.cards).order_by(sort)
    data = paginate(cards, page, limit, "cards")
    return render(request, "accounts/favorites.html", data)


# Price filter needs to be added
@login_required
def owned(request):
    page = request.GET.get("page", 1)
    limit = request.GET.get("limit", 10)
    symbol = ""
    sort = request.GET.get("sort", "name")
    if sort.startswith("-"):
        symbol = "-"
        sort = sort.replace("-", "")
    client = get_object_or_404(Client, user=request.user)
    cards = CardEntity.objects.filter(owner=client).order_by(f"{symbol}card__{sort}")
    data = paginate(cards, page, limit, "cards")
    raw_grade = Grade.objects.get(value='Raw')
    data["raw_grade"] = raw_grade.value
    return render(request, "accounts/owned.html", data)


@login_required
def collections(request):
    sort = request.GET.get("sort", "name")
    client = get_object_or_404(Client, user=request.user)
    collections = (
        Collections.objects.annotate(card_count=Count("cards"))
        .filter(client=client)
        .order_by(sort)
    )
    context = {"collections": collections}
    return render(request, "accounts/collections.html", context)


@login_required
def portfolio(request):
    page = request.GET.get("page", 1)
    limit = request.GET.get("limit", 10)
    client = get_object_or_404(Client, user=request.user)
    portfolios = Portfolio.objects.filter(client=client).order_by("-created_at")
    return render(request, "accounts/portfolio.html", {"items": portfolios})


@login_required
def add_portfolio(request):
    form = AddPortfolioForm(request.POST or None)
    client = get_object_or_404(Client, user=request.user)

    if request.method == "POST" and form.is_valid():
        card_id = request.POST["card"]
        card = Card.objects.filter(id=card_id).first()
        purchase_price = form.cleaned_data["purchase_price"]
        purchase_date = form.cleaned_data["purchase_date"]

        Portfolio.objects.create(
            card=card,
            purchase_date=purchase_date,
            purchase_price=purchase_price,
            client=client,
        )

        return redirect("/auth/portfolio/")

    else:
        messages.error(request, "Invalid data")

    return render(request, "accounts/add-item-portfolio-form.html", {"form": form})


@login_required
def add_collection(request):
    client = get_object_or_404(Client, user=request.user)
    form = AddCollectionForm(request.POST or None, request.FILES or None)

    if request.method == "POST" and form.is_valid():
        try:
            collection = form.save(commit=False)
            collection.client = client
            collection.save()
            form.save_m2m()
            return redirect("/auth/collections/")
        except Exception as e:
            print(e)

    return render(request, "accounts/collection-form.html", {"form": form})


@login_required
def edit_collection(request, collection_id):
    collection = get_object_or_404(Collections, id=collection_id)

    form = AddCollectionForm(instance=collection)

    if request.method == "POST":
        form = AddCollectionForm(request.POST, instance=collection)
        if form.is_valid():
            try:
                form.save()
                return redirect(f"/auth/collections/detail/{collection_id}")
            except Exception as e:
                print(e)

    return render(request, "accounts/collection-form.html", {"form": form})


@login_required
def delete_collection(request, collection_id):
    collection = get_object_or_404(Collections, id=collection_id)
    collection.delete()
    return redirect(f"/auth/collections/")


@login_required
def collection_detail(request, collection_id):
    params = request.GET.copy()
    params.pop("page", None)
    params.pop("limit", None)

    clean_params = urlencode(params)

    page = request.GET.get("page", 1)
    limit = request.GET.get("limit", 10)

    collection = get_object_or_404(Collections, id=collection_id)
    cards = collection.cards.all().order_by("name")

    # Pagination
    paginator = Paginator(cards, limit)
    page_data = paginator.get_page(page)
    count = paginator.count
    total_pages = paginator.num_pages
    page_range = get_sliced_array(list(paginator.page_range), int(page), 9)

    if int(page) <= 0 or int(page) > total_pages:
        raise Http404("Invalid page")

    context = {
        "cards": page_data,
        "collection": collection,
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
    return render(request, "accounts/collection-detail.html", context)


@login_required
def wallet(request):
    client = get_object_or_404(Client, user=request.user)
    wallet = Wallet.objects.get(client=client)
    return render(request, "accounts/wallet.html", {"wallet": wallet})


@login_required
def history(request):
    query_sells = request.GET.get("query-sells", None)
    query_buys = request.GET.get("query-buys", None)
    query_cancelled_bids = request.GET.get("query-cancelled-bids", None)
    tab = request.GET.get("tab", "buys")

    client = get_object_or_404(Client, user=request.user)
    sales = Sale.objects.filter(buyer=client).order_by("-created_at")
    client_sales = Sale.objects.filter(seller=client).order_by("-created_at")
    asks = Ask.objects.filter(user=client).order_by("-created_at")
    bids = Bid.objects.filter(user=client).order_by("-created_at")

    if query_buys:
        sales = sales.filter(asset__name__icontains=query_buys)

    if query_sells:
        client_sales = client_sales.filter(asset__name__icontains=query_sells)

    if query_cancelled_bids:
        bids = bids.filter(asset__name__icontains=query_cancelled_bids)

    context = {
        "sales": sales,
        "asks": asks,
        "bids": bids,
        "client_sales": client_sales,
        "tab": tab,
    }

    return render(request, "accounts/history.html", context)


def add_item_to_collection_page(request, collection_id):
    if not request.user.is_authenticated:
        return redirect(
            f"/auth/login/?next=/auth/coolection/detail/{collection_id}/add-item/"
        )

    query = request.GET.get("query", None)

    cards = []

    if query:
        cards = Card.objects.filter(name__icontains=query).order_by("name")

    context = {"cards": cards, "collection_id": collection_id}

    return render(request, "accounts/add-item-to-collection.html", context)


def add_item_to_collection(request, collection_id, card_id):
    is_next = request.GET.get('next', None)

    collection_page = f"/auth/collections/detail/{collection_id}/"
    next = f"/auth/login/?next={collection_page}add-item/"

    if not request.user.is_authenticated:
        return redirect(f"/auth/login/?next={next}")

    collection = get_object_or_404(Collections, id=collection_id)
    card = get_object_or_404(Card, id=card_id)

    if collection.cards.contains(card):
        if is_next:
            return redirect(is_next)
        return redirect(collection_page)

    collection.cards.add(card)
    if is_next:
        return redirect(is_next)
    return redirect(collection_page)


def remove_item_from_collection(request, collection_id, card_id):
    collection_page = f"/auth/collections/detail/{collection_id}/"
    next = f"/auth/login/?next={collection_page}add-item/"

    if not request.user.is_authenticated:
        return redirect(f"/auth/login/?next={next}")

    collection = get_object_or_404(Collections, id=collection_id)
    card = get_object_or_404(Card, id=card_id)

    if collection.cards.contains(card):
        collection.cards.remove(card)
        return redirect(collection_page)

    return redirect(collection_page)


def get_all_collections(request):
    client = Client.objects.filter(user=request.user).first()
    collections = []

    if client:
        collections = (
            Collections.objects.annotate(card_count=Count("cards"))
            .filter(client=client)
            .order_by("name")
        )

    serializer = CollectionSerializer(collections, many=True)
    return JsonResponse({"success": True, "data": serializer.data})


def portfolio_data(request):
    client = get_object_or_404(Client, user=request.user)
    portfolios = Portfolio.objects.filter(client=client).order_by("purchase_date")
    
    grouped_data = defaultdict(lambda: {'market_values': [], 'purchase_prices': [], 'purchase_date': None})

    total_market_value = Decimal(0)
    total_purchase_price = Decimal(0)

    for portfolio in portfolios:
        purchase_date = portfolio.purchase_date
        grouped_data[purchase_date]['market_values'].append(portfolio.market_value)
        grouped_data[purchase_date]['purchase_prices'].append(portfolio.purchase_price)
        grouped_data[purchase_date]['purchase_date'] = purchase_date
        total_market_value += Decimal(portfolio.market_value)
        total_purchase_price += Decimal(portfolio.purchase_price)

    aggregated_data = []
    for purchase_date, data in grouped_data.items():
        if data['market_values']:
            avg_market_value = sum(data['market_values']) / len(data['market_values'])
            avg_purchase_price = sum(data['purchase_prices']) / len(data['purchase_prices'])
            
            gain_or_loss = avg_market_value - float(avg_purchase_price)
            gain_or_loss_percentage = (gain_or_loss / float(avg_purchase_price)) * 100 if avg_purchase_price else 0
        else:
            avg_market_value = 0
            avg_purchase_price = 0
            gain_or_loss = 0
            gain_or_loss_percentage = 0
            
        aggregated_data.append({
            'purchase_date': data['purchase_date'],
            'average_market_value': avg_market_value,
            'average_purchase_price': avg_purchase_price,
            'average_gain_or_loss': gain_or_loss,
            'average_gain_or_loss_percentage': gain_or_loss_percentage,
        })
    
    overall_gain_or_loss = total_market_value - total_purchase_price
    overall_gain_or_loss_percentage = (overall_gain_or_loss / total_purchase_price) * 100 if total_purchase_price else 0

    return JsonResponse({
        "success": True,
        "data": aggregated_data,
        "overall_gain_or_loss_percentage": overall_gain_or_loss_percentage,
    })