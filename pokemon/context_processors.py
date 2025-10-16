from accounts.models import Client
from wallets.models import Wallet


def global_variables(request):
    wallet = None
    if request.user.is_authenticated:
        client = Client.objects.filter(user=request.user).first()
        if client:
            wallet = Wallet.objects.filter(client=client).first()
        return {
            "wallet": wallet,
        }
    else:
        return {
            
        }
