from django_components import Component, register


@register("auction-orders")
class AuctionOrders(Component):
    template_file = "auction-orders.html"

    def get_context_data(self, auctions = None, orders= None):
        return {
            "auctions": auctions,
            "orders":orders
        }
