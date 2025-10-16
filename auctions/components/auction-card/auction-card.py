from django_components import Component, register


@register("auction-card")
class AuctionCard(Component):
    template_file = "auction-card.html"

    def get_context_data(self, auction, card):
        return {
            "auction": auction,
            "card": card
        }
