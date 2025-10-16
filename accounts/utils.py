from django.contrib.auth.models import User

def check_if_user_exists(email):
    return User.objects.filter(email=email).first()
