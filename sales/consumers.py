import json
from channels.db import database_sync_to_async
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from cards.models import Card, CardEntity
from auctions.models import Auction
from sales.models import SalesBid
from cards.utils import get_all_cards_on_sale_by_grade, get_all_owned_cards_for_sale_by_grade


class SaleConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"sale_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        self.card = await self.get_card_by_id()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get("type")
        message = data.get("message", "No content")
        quantity = data.get("quantity", 0)
        card_id = data.get("cardId") 
        user_id = data.get("userId")
        grade_id=data.get('gradeId')

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": event_type,
                "message": message,
                "quantity": quantity,
                "card_id": card_id,
                "grade_id": grade_id,
                "user_id": user_id
            },
        )

    async def ask_placed(self, event):
        type = event["type"]
        await self.send(text_data=json.dumps({"type": type}))

    async def bid_placed(self, event):
        type = event["type"]
        await self.send(text_data=json.dumps({"type": type}))

    async def card_bought(self, event):
        type = event["type"]
        await self.send(text_data=json.dumps({"type": type}))

    async def card_entities_owned(self, event):
        await self.send(text_data=json.dumps({
            "type": "card_entities_owned",
            "card_entities": event["card_entities_owned_all"],
            "card_entity": event["card_entities_for_sale"],
            "lowest_ask": str(event["lowest_ask"]), 
            "highest_bid": str(event["highest_bid"])
        }))
    
    async def sell_button_status(self, event):
        await self.send(text_data=json.dumps({
            "type": "sell_button_status",
            "cards_entities": event["card_entities_owned_all"]
        }))
        
    async def quantity_change(self, event):
        type = event["type"]
        quantity = event["quantity"]
        grade_id = event["grade_id"]
        total_price = await self.get_total_price(quantity,grade_id)
        data = {
            "quantity": quantity,
            "total_price": total_price
        }
        await self.send(text_data=json.dumps({"type": type, "data": data}))

    async def auction_and_orders_data(self, event):
        type = event["type"]
        auctions = event["auctions"]
        orders = event["orders"]
        data = {
            "auctions": auctions,
            "orders": orders
        }
        await self.send(text_data=json.dumps({"type": type, "data": data}))


    async def sale_quantity_change(self, event):
        type = event["type"]
        quantity = event["quantity"]
        user = self.scope["user"]
        user_id = event["user_id"]
            
        grade_id = event["grade_id"]
        total_price = await self.get_total_price_bids_by_grade( quantity, grade_id, user_id)
        # total_price = await self.get_total_price_bids(quantity)
        card_entities = await self.get_card_owned_entities(user_id, self.card, grade_id)
        data = {
            "quantity": quantity,
            "total_price": total_price,
            "card_entities":card_entities 
        }
        await self.send(text_data=json.dumps({"type": type, "data": data}))

    @database_sync_to_async
    def get_card_owned_entities(self, client_id, card, grade_id):
        now = timezone.now()
        
        cards_in_auctions = Auction.objects.filter(
            end_time__gt=now
        ).values_list("card_entity", flat=True)
        return CardEntity.objects.exclude(id__in=cards_in_auctions)\
                    .filter(owner_id=client_id)\
                    .filter(card=card)\
                    .filter(on_sale=False)\
                    .filter(grade=grade_id)\
                    .count() 


    @database_sync_to_async
    def get_card_by_id(self):
        return Card.objects.get(id=self.room_name)
     
    @database_sync_to_async
    def get_total_price(self, quantity, grade_id):
        price = 0
        cards = get_all_cards_on_sale_by_grade(self.card, grade_id).all().order_by("ask_price")[:quantity]
        for card in cards:
            price = price + card.ask_price
        return str(price)

    @database_sync_to_async
    def get_total_price_bids(self, quantity):
        price = 0
        bids = SalesBid.objects.filter(card=self.card).order_by("-amount")[:quantity]
        for bid in bids:
            price = price + bid.amount
        return str(price)
    
    @database_sync_to_async
    def get_total_price_bids_by_grade(self, quantity, grade_id, userId):
        price = 0
        bids = SalesBid.objects.filter(card=self.card, grade=grade_id).exclude(bidder=userId).order_by("-amount")[:quantity]
        for bid in bids:
            price = price + bid.amount
        return str(price)
    