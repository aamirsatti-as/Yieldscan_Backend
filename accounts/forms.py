from django import forms
from django.contrib.auth.models import User
from .models import Client, Currency, Address
from cards.models import Collections, Portfolio

class RegisterForm(forms.Form):
    email = forms.EmailField(label="Email", max_length=100, widget=forms.TextInput(attrs={'placeholder': 'Email', 'class': 'w-full p-2.5 md:px-[30px] md:py-4 text-sm md:text-base font-medium border rounded-md'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password', 'class': 'w-full p-2.5 md:px-[30px] md:py-4 text-sm md:text-base font-medium border rounded-md'}))
    first_name = forms.CharField(label="First name", max_length=100, widget=forms.TextInput(attrs={'placeholder': 'First name', 'class': 'w-full p-2.5 md:px-[30px] md:py-4 text-sm md:text-base font-medium border rounded-md'}))
    last_name = forms.CharField(label="Last name", max_length=100, widget=forms.TextInput(attrs={'placeholder': 'Last name', 'class': 'w-full p-2.5 md:px-[30px] md:py-4 text-sm md:text-base font-medium border rounded-md'}))

class LoginForm(forms.Form):
    email = forms.EmailField(label="Email", max_length=100, widget=forms.TextInput(attrs={'placeholder': 'Email / Phone (Without country code)', 'class': 'w-full p-2.5 md:px-[30px] md:py-4 text-sm md:text-base font-medium border rounded-md'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password', 'class': 'w-full p-2.5 md:px-[30px] md:py-4 text-sm md:text-base font-medium border rounded-md'}))

class ForgotPasswordForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["email"]
        widgets = {
            "email": forms.TextInput(attrs={"class": "border border-gray-300 p-2 rounded-md w-[300px]"}),
        }

class EditProfileForm(forms.Form):
    first_name = forms.CharField(label="First name", max_length=100, required=False, widget=forms.TextInput(attrs={'placeholder': 'Enter your first name', 'class': 'w-full px-3.5 py-2.5 md:text-lg font-medium border rounded-md'}))
    last_name = forms.CharField(label="Last name", max_length=100, required=False, widget=forms.TextInput(attrs={'placeholder': 'Enter your last name', 'class': 'w-full px-3.5 py-2.5 md:text-lg font-medium border rounded-md'}))
    username = forms.CharField(label="User name", max_length=100, required=False, widget=forms.TextInput(attrs={'placeholder': 'Enter your user name', 'class': 'w-full px-3.5 py-2.5 md:text-lg font-medium border rounded-md'}))
    phone = forms.CharField(label="Phone No.", max_length=100, required=False, widget=forms.TextInput(attrs={'placeholder': 'Enter your phone number', 'class': 'w-full px-3.5 py-2.5 md:text-lg font-medium border rounded-md'}))
    email = forms.EmailField(label="Email", max_length=100, required=False, widget=forms.EmailInput(attrs={'placeholder': 'Enter your email address', 'class': 'w-full px-3.5 py-2.5 md:text-lg font-medium border rounded-md'}))
    image = forms.ImageField(required=False)
    is_image_removed = forms.BooleanField(required=False)

class EditClientForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ["image"]

class AddAddressForm(forms.ModelForm):
    class Meta:
        model = Address
        fields = ["street_address", "apartment_number"]
        widgets = {
            "street_address": forms.TextInput(attrs={"class": "border border-gray-300 p-2 rounded-md w-full"}),
            "apartment_number": forms.TextInput(attrs={"class": "border border-gray-300 p-2 rounded-md w-full"}),
        }

class AddCollectionForm(forms.ModelForm):
    class Meta:
        model = Collections
        fields = ["name", "image"]
        widgets = {
            "name": forms.TextInput(attrs={"class": "border border-gray-300 p-2 rounded-md w-full"}),
        }


class AddPortfolioForm(forms.ModelForm):
    class Meta:
        model = Portfolio
        fields = ["purchase_date", "purchase_price"]
        widgets = {
            "purchase_price": forms.NumberInput(attrs={"class": "w-full border border-gray-300 p-2 rounded-md w-full"}),
            "purchase_date": forms.DateTimeInput(attrs={"class": "w-full border border-gray-300 p-2 rounded-md w-full"}),
        }