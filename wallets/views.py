from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from accounts.models import Client
from .forms import FundDepositForm


@login_required
def deposit_funds(request):
    client = get_object_or_404(Client, user=request.user)
    form = FundDepositForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        request = form.save(commit=False)
        request.client = client
        request.save()
        return redirect("/")

    return render(request, "wallets/deposit-funds.html", {"form": form})
