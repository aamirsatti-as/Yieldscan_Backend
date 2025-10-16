from django_components import Component, register


@register("bid-input")
class BidInput(Component):
    template_file = "bid-input.html"

    def get_context_data(self):
        return {}
