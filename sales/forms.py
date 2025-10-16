from django import forms

class BidForm(forms.Form):
    quantity = forms.IntegerField(widget=forms.NumberInput(attrs={'placeholder': 'Quantity', 'class': 'w-full px-[30px] py-4 text-[22px] font-medium border rounded-md'}))
    bid_amount = forms.FloatField(widget=forms.NumberInput(attrs={'placeholder': 'Bid amount', 'class': 'w-full px-[30px] py-4 text-[22px] font-medium border rounded-md'}))
