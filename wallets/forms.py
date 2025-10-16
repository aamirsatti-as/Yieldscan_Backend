from django import forms
from django.contrib.auth.models import User
from .models import FundDepositRequest

class FundDepositForm(forms.ModelForm):
    class Meta:
        model = FundDepositRequest
        fields = ["amount"]
        widgets = {
            "amount": forms.NumberInput(attrs={"class": "border border-gray-300 p-2 rounded-md w-[300px]"}),
        }