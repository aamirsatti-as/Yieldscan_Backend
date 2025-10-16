import json
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Auction, AuctionBid


class AuctionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"auction_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get("type")
        message = data.get("message", "No content")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": event_type,
                "message": message,
            },
        )

    async def bid_placed(self, event):
        type = event["type"]
        count = await self.get_total_bids()
        highest_bid = await self.highest_bid()
        data = {
            "highest_bid": str(highest_bid),
            "count": count
        }
        await self.send(text_data=json.dumps({"type": type, "data": data }))

    @database_sync_to_async
    def get_total_bids(self):
        auction = Auction.objects.filter(id=self.room_name).first()
        if auction:
            return auction.total_bids
        else:
            return 0
        
    @database_sync_to_async
    def highest_bid(self):
        auction = AuctionBid.objects.filter(auction=self.room_name).order_by("-amount").first()
        if auction:
            return auction.amount
        else:
            return 0