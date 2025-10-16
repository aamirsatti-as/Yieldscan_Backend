from django.urls import path

from . import views

# Authentication URLs
auth_patterns = [
    path("login/", views.login_view, name="login"),
    path("forgot/", views.forgot_password, name="forgot-password"),
    path("register/", views.register, name="register"),
    path("logout/", views.logout_view, name="logout"),
]

# Profile-related URLs
profile_patterns = [
    path("profile/", views.profile, name="profile"),
    path("profile/edit/", views.edit_profile, name="edit-profile"),
]

# Address-related URLs
address_patterns = [
    path("profile/address/add/", views.add_address, name="add-address"),
    path("profile/address/delete/<int:address_id>/", views.delete_address, name="delete-address"),
    path("profile/address/edit/<int:address_id>/", views.edit_address, name="edit-address"),
]

# Favorites, owned items, and portfolio URLs
user_assets_patterns = [
    path("favorites/", views.favorites, name="favorites"),
    path("owned/", views.owned, name="owned"),
    path("portfolio/", views.portfolio, name="portfolio"),
    path("portfolio/add/", views.add_portfolio, name="add-portfolio"),
    path("portfolio/get_data/", views.portfolio_data, name="get-portfolio-data"),
]

# Collection-related URLs
collection_patterns = [
    path("collections/", views.collections, name="collections"),
    path("collections/all/", views.get_all_collections, name="all-collections"),
    path("collections/add/", views.add_collection, name="add-collection"),
    path("collections/edit/<int:collection_id>/", views.edit_collection, name="edit-collection"),
    path("collections/delete/<int:collection_id>/", views.delete_collection, name="delete-collection"),
    path("collections/detail/<int:collection_id>/", views.collection_detail, name="collection-detail"),
    path("collections/detail/<int:collection_id>/add-item/", views.add_item_to_collection_page, name="add-item-collection-page"),
    path("collections/detail/<int:collection_id>/add/<str:card_id>/", views.add_item_to_collection, name="add-item-collection"),
    path("collections/detail/<int:collection_id>/remove/<str:card_id>/", views.remove_item_from_collection, name="remove-item-collection")
]

# Wallet and history URLs
other_patterns = [
    path("wallet/", views.wallet, name="wallet"),
    path("history/", views.history, name="history"),
]

# Combine all patterns into a single urlpatterns list
urlpatterns = (
    auth_patterns
    + profile_patterns
    + address_patterns
    + user_assets_patterns
    + collection_patterns
    + other_patterns
)
