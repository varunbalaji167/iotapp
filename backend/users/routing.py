from django.urls import path
from .consumers import VitalDataConsumer, OpenAccessVitalDataConsumer

websocket_urlpatterns = [
    path('ws/vitals/', VitalDataConsumer.as_asgi()),
    path("ws/openvitals/", OpenAccessVitalDataConsumer.as_asgi()),
]