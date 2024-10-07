import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from django.utils import timezone
from decimal import Decimal
from .models import DoctorData, PatientData, PatientProfile, DoctorProfile
from .serializers import DoctorDataSerializer, PatientDataSerializer
from asgiref.sync import sync_to_async
from users.mqtt_client import client, message_received, data, client_publish_topic, on_message
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from django.conf import settings

User = get_user_model()

class VitalDataConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = None

        # Retrieve JWT token from the headers
        token = self.scope['query_string'].decode().split('=')[-1]  # assuming 'token=<JWT>'
        
        # Authenticate the user using JWT
        try:
            validated_token = await self.get_validated_token(token)
            self.user = await self.get_user_from_token(validated_token)

            if self.user.is_authenticated:
                self.role = await self.get_user_role()  # Check for role asynchronously
                await self.accept()
                await self.send(text_data=json.dumps({'status': 'connected', 'user': str(self.user), 'role': self.role}))
            else:
                await self.close()

        except InvalidToken:
            await self.send(text_data=json.dumps({'error': 'Invalid token'}))
            await self.close()

    async def disconnect(self, close_code):
        """ Handle WebSocket disconnection. """
        pass  # No special action needed on disconnect

    async def receive(self, text_data):
        """ Handle messages received via WebSocket. """
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("message")

        # Start polling the hardware every 2 seconds
        await self.poll_hardware_for_vital(message_type)

    async def poll_hardware_for_vital(self, message_type):
        """
        Poll the hardware for vital data, sending updates every 2 seconds.
        If the status is 'Calculating' for 6 seconds, send 'Place your Finger Properly'
        and repeat this cycle until the result is 'Success' or timeout after 60 seconds.
        """
        result_received = False
        calculating_time = 0
        max_time = 60  # 60 seconds timeout
        start_time = time.time()
        
        while not result_received and (time.time() - start_time) < max_time:
            # Send the initial request to the hardware
            # await self.send_status("Requesting vital data from hardware...")
            client.publish(client_publish_topic, payload=message_type, qos=2)

            # Simulate waiting for hardware response
            await self.wait_for_response()

            # Simulate getting the response from hardware
            hardware_response = data  # The response from the hardware
            
            try:
                response_json = json.loads(hardware_response)
                status = response_json.get("Status")
                heart_rate = response_json.get("Heart_Rate")
                spo2_value = response_json.get("SPO2")
                result = response_json.get("Result")

                # Send status to the frontend every 2 seconds
                if status == "Calculating":
                    calculating_time += 2  # Increment the 'Calculating' time by 2 seconds

                    # If calculating time exceeds 6 seconds, send "Place your Finger Properly"
                    if calculating_time >= 6:
                        await self.send_status("Place your Finger Properly")
                        calculating_time = 0
                        await asyncio.sleep(2)
                    else:
                        await self.send_status(f"Status: {status}, SPO2: {spo2_value}%, Heart Rate: {heart_rate} bpm")
                # else:
                #     # Reset calculating time if status changes
                #     calculating_time = 0
                #     await self.send_status(f"Status: {status}, SPO2: {spo2_value}%, Heart Rate: {heart_rate} bpm")

                if status == "Calculated" and result == "Success":
                    # If the result is successful, send the result and break the loop
                    await self.send_result(spo2_value, heart_rate)
                    await self.save_vital_data(spo2_value, heart_rate)
                    result_received = True
                # else:
                #     await asyncio.sleep(2)

            except json.JSONDecodeError:
                await self.send_status("Invalid response from hardware")
                result_received = True

        if not result_received:
            await self.send_status("Timeout: Failed to retrieve vital data within 60 seconds.")

    async def wait_for_response(self):
        """ Wait for the MQTT response to come in from the hardware. """
        global  data
        # message_received = False
        # while not message_received:
        client.on_message = on_message
        await asyncio.sleep(1)  # Sleep for 1 second until the message is received

    async def send_status(self, message):
        """ Send the status message back to the frontend. """
        await self.send(text_data=json.dumps({
            "status": message
        }))

    async def send_result(self, spo2_value, heart_rate):
        """ Send the final result (SPO2 and heart rate) back to the frontend. """
        await self.send(text_data=json.dumps({
            "result": f"SPO2: {spo2_value}%, Heart Rate: {heart_rate} bpm"
        }))

    @sync_to_async
    def save_vital_data(self, spo2_value, heart_rate):
        """ Save the vital data (SPO2 and heart rate) to the database. """
        user = self.user
        role = self.role

        if role == "doctor":
            profile = DoctorProfile.objects.get(user=user)

            # Create and store the DoctorData instance associated with the profile
            doctor_data = DoctorData(
                doctor=profile, spo2=spo2_value, heart_rate=heart_rate,
                created_at=timezone.now()
            )
            doctor_data.save()

        elif role == "patient":
            profile = PatientProfile.objects.get(user=user)

            # Create and store the PatientData instance associated with the profile
            patient_data = PatientData(
                patient=profile, spo2=spo2_value, heart_rate=heart_rate,
                created_at=timezone.now()
            )
            patient_data.save()

        else:
            raise ValueError("Unknown user role")

    @sync_to_async
    def get_validated_token(self, token):
        """ Validate the JWT token. """
        return UntypedToken(token)

    @sync_to_async
    def get_user_from_token(self, validated_token):
        """ Retrieve the user based on the validated JWT token. """
        return User.objects.get(id=validated_token['user_id'])

    @sync_to_async
    def get_user_role(self):
        """ 
        Get the role of the user (doctor or patient) based on the profile associated with the user.
        Since this involves a database lookup, it is wrapped with `sync_to_async`.
        """
        if hasattr(self.user, 'doctorprofile'):
            return "doctor"
        elif hasattr(self.user, 'patientprofile'):
            return "patient"
        return "unknown"
