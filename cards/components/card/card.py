from django_components import Component, register


@register("card")
class Card(Component):
    template_file = "card.html"

    def get_context_data(self, card, classes="", is_favorite=False):
        return {
            "card": card,
            "classes": classes,
            "is_favorite": is_favorite
        }
