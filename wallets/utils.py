from .models import Wallet


def update_wallet_funds(fund_request):
    if fund_request.approved == True:
        wallet = Wallet.objects.filter(client=fund_request.client).first()
        if wallet:
            wallet.funds = wallet.funds + fund_request.amount
            wallet.save()
            fund_request.delete()
