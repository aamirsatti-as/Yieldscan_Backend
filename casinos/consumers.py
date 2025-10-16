import json
from channels.generic.websocket import AsyncWebsocketConsumer


class CasinoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"casino_{self.room_name}"
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

    async def new_participant(self, event):
        type = event["type"]
        await self.send(text_data=json.dumps({"type": type}))

    async def cards_availability_update(self, event):
        await self.send(text_data=json.dumps({
            "type": event["type"],
            "total_participants": event["total_participants"],
            "max_participants": event["max_participants"],
        }))
