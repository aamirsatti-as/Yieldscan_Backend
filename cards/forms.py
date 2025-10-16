from django import forms
from auctions.models import Auction

class SaleForm(forms.Form):
    quantity = forms.IntegerField(widget=forms.NumberInput(attrs={'placeholder': 'Quantity', 'class': 'w-full px-[30px] py-4 text-[22px] font-medium border rounded-md'}))
    sale_amount = forms.FloatField(widget=forms.NumberInput(attrs={'placeholder': 'Set ask', 'class': 'w-full px-[30px] py-4 text-[22px] font-medium border rounded-md'}))


class SetAuctionForm(forms.ModelForm):
    class Meta:
        model = Auction
        fields = ["starting_price", "start_time", "end_time"]
        widgets = {
            "starting_price": forms.NumberInput(attrs={"class": "border border-gray-300 p-2 rounded-md w-full"}),
            "start_time": forms.DateTimeInput(attrs={"class": "border border-gray-300 p-2 rounded-md w-full"}),
            "end_time": forms.DateTimeInput(attrs={"class": "border border-gray-300 p-2 rounded-md w-full"})
        }
