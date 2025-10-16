"""
URL configuration for pokemon project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
from django.views.generic.base import TemplateView 

def page_not_found_view(request):
    return render(request, '404.html', status=404)

# urlpatterns = [
#     path('', include("cards.urls")),
#     path('auth/', include("accounts.urls")),
#     path('auction/', include("auctions.urls")),
#     path('casino/', include("casinos.urls")),
#     path('wallet/', include("wallets.urls")),
#     path('market/', include('market.urls')),
#     path('accounts/', include('allauth.urls')),
#     path('admin/', admin.site.urls),
#     path('404/', page_not_found_view, name='404-page'),
# ]

urlpatterns = [
    path('robots.txt', TemplateView.as_view(
        template_name='robots.txt',
        content_type='text/plain'
    )),
    path('', include("cards.urls")),
    path('auth/', include("accounts.urls")),
    path('auction/', include("auctions.urls")),
    path('casino/', include("casinos.urls")),
    path('wallet/', include("wallets.urls")),
    path('market/', include('market.urls')),
    path('accounts/', include('allauth.urls')),
    path('admin/', admin.site.urls),
    path('404/', page_not_found_view, name='404-page'),
]

if settings.DEBUG:
        urlpatterns += static(settings.MEDIA_URL,
                              document_root=settings.MEDIA_ROOT)