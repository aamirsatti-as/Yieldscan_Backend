from django_components import Component, register


@register("cards-orders")
class CardsOrders(Component):
    template_file = "cards-orders.html"

    def get_context_data(self, orders = None):
        return {
            "auctions": orders,
        }
