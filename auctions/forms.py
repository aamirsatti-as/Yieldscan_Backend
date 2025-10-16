from django import forms

class BidForm(forms.Form):
    bid_amount = forms.FloatField(widget=forms.NumberInput(attrs={'placeholder': 'Bid amount', 'class': 'w-full px-[30px] py-3 font-medium border rounded-md'}))

class RelistForm(forms.Form):
    starting_price = forms.FloatField(widget=forms.NumberInput(attrs={'placeholder': 'Starting price', 'class': 'w-full px-[30px] py-4 text-[22px] font-medium border rounded-md'}))
    end_time = forms.DateField(widget=forms.DateInput(attrs={'type': 'date','class': 'w-full px-[30px] py-4 text-[22px] font-medium border rounded-md'}))