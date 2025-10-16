from django import forms

class CasinoSaleForm(forms.Form):
    quantity = forms.IntegerField(widget=forms.NumberInput(attrs={'placeholder': 'Quantity', 'class': 'w-full px-[30px] py-4 text-[22px] font-medium border rounded-md'}))