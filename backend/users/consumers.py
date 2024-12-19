import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from decimal import Decimal
from django.utils import timezone
from channels.exceptions import DenyConnection
from .models import DoctorData, PatientData, VitalHistoryPatient, VitalHistoryDoctor
from users.mqtt_client import setup_mqtt_client
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth import get_user_model

subject_group_mapping = {
    "Hardware Configuration Success": "hardware_group_",
    "Glucose": "glucose_group_",
    "Temperature": "temperature_group_",
    "Oximeter": "oximeter_group_",
    "BP": "bp_group_",
    "Height": "height_group_",
    "Weight": "weight_group_",
}
User = get_user_model()

active_device_connections = {}

class OpenAccessVitalDataConsumer(AsyncWebsocketConsumer):
    def __init__(self):
        super().__init__()
        self.device_id = None
        self.mqtt_client = None

    async def connect(self):
        """Handle new WebSocket connections."""
        self.device_id = self.scope["query_string"].decode().split("=")[-1]

        # Check if the device ID is already in use
        if self.device_id in active_device_connections:
            await self.send(text_data=json.dumps({"error": "Device is busy"}))
            await self.close()
            return

        # Register the new connection
        active_device_connections[self.device_id] = self.channel_name

        # Accept the WebSocket connection
        await self.accept()
        await self.send(
            text_data=json.dumps({"status": "connected", "device_id": self.device_id})
        )

        # Add the consumer to all subject groups based on the device_id
        for subject, group_prefix in subject_group_mapping.items():
            group_name = f"{group_prefix}{self.device_id}"
            await self.channel_layer.group_add(group_name, self.channel_name)

        # Set up the MQTT client with the dynamic device_id
        self.mqtt_client = setup_mqtt_client(self.device_id)

    async def disconnect(self, close_code):
        """Handle WebSocket disconnections."""
        if self.device_id:
            # Remove the connection from the active connections
            if self.device_id in active_device_connections:
                del active_device_connections[self.device_id]

            # Remove the consumer from all groups
            for subject, group_prefix in subject_group_mapping.items():
                group_name = f"{group_prefix}{self.device_id}"
                await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive(self, text_data):
        """Handle WebSocket messages for subscribing/publishing topics."""
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("message")

        if message_type:
            # Publish the data to the dynamic MQTT topic based on device_id
            self.mqtt_client.publish(f"HK_Sub{self.device_id}", payload=message_type)
        else:
            await self.send(text_data=json.dumps({"error": "Invalid message type"}))

    async def temperature_message(self, event):
        """Handle temperature messages received in the temperature group."""
        await self.process_and_send_message(event, "Temperature")

    async def height_message(self, event):
        """Handle height messages received in the height group."""
        await self.process_and_send_message(event, "Height")

    async def weight_message(self, event):
        """Handle weight messages received in the weight group."""
        await self.process_and_send_message(event, "Weight")

    async def glucose_message(self, event):
        """Handle glucose messages received in the glucose group."""
        await self.process_and_send_message(event, "Glucose")

    async def oximeter_message(self, event):
        """Handle oximeter messages received in the oximeter group."""
        await self.process_and_send_message(event, "Oximeter")

    async def hardware_message(self, event):
        """Handle hardware messages received in the hardware group."""
        message = event["message"]
        await self.send(text_data=json.dumps(json.loads(message)))

    async def bp_message(self, event):
        """Handle BP messages received in the BP group."""
        await self.process_and_send_message(event, "BP")

    async def process_and_send_message(self, event, group):
        """Generic method to process and send messages from any group."""
        message = event["message"]
        message_data = json.loads(message)

        status = message_data.get("Status")
        subject = message_data.get("Subject")

        if status:
            await self.send(
                text_data=json.dumps(
                    {
                        "Status": status,
                        "Subject": subject,
                        "Group": group,
                        **{k: v for k, v in message_data.items() if k not in ["Status", "Subject"]},
                    }
                )
            )
        else:
            await self.send(text_data=json.dumps({"error": f"Invalid data in {group} message"}))

class VitalDataConsumer(AsyncWebsocketConsumer):
    def __init__(self):
        super().__init__()
        self.device_id = None
        self.mqtt_client = None
    async def connect(self):
        token = self.scope["query_string"].decode().split("=")[-1]
        self.device_id = self.scope["query_string"].decode().split("&")[0].split("=")[-1]

        try:
            validated_token = await self.get_validated_token(token)
            self.user = await self.get_user_from_token(validated_token)

            if self.user.is_authenticated:
                self.role = await self.get_user_role()

                # Check if the device ID is already in use
                if self.device_id in active_device_connections:
                    await self.send(text_data=json.dumps({"error": "Device is busy"}))
                    raise DenyConnection("Device is already in use")

                # Register the new connection
                active_device_connections[self.device_id] = self.channel_name

                # Reset existing data if any
                await self.reset_existing_data()

                await self.accept()
                await self.send(
                    text_data=json.dumps(
                        {
                            "status": "connected",
                            "user": str(self.user),
                            "role": self.role,
                        }
                    )
                )

                # Add the consumer to all subject groups based on the device_id
                for subject, group_prefix in subject_group_mapping.items():
                    group_name = f"{group_prefix}{self.device_id}"
                    await self.channel_layer.group_add(group_name, self.channel_name)

                # Set up the MQTT client with the dynamic device_id
                self.mqtt_client = setup_mqtt_client(self.device_id)

        except InvalidToken:
            await self.send(text_data=json.dumps({"error": "Invalid token"}))
            await self.close()


    async def disconnect(self, close_code):
        if self.device_id:
            # Remove the connection from the active connections
            if self.device_id in active_device_connections:
                del active_device_connections[self.device_id]

            # Save the current vitals to the VitalHistory model
            await self.save_vitals_to_history()

            # Remove the consumer from all groups
            for subject, group_prefix in subject_group_mapping.items():
                group_name = f"{group_prefix}{self.device_id}"
                await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive(self, text_data):
        """Handle WebSocket messages for subscribing/publishing topics."""
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("message")

        if message_type:
            # Publish the data to the dynamic MQTT topic based on device_id
            self.mqtt_client.publish(f"HK_Sub{self.device_id}", payload=message_type)
        else:
            await self.send(text_data=json.dumps({"error": "Invalid message type"}))

    async def temperature_message(self, event):
        """Handle temperature messages received in the temperature group."""
        message = event["message"]
        message_data = json.loads(message)

        status = message_data.get("Status")
        temperature = message_data.get("Temperature")
        subject = message_data.get("Subject")

        if status and temperature:
            await self.send(text_data=json.dumps({"Status": status, "Subject": subject}))
            await self.save_temperature_to_db(temperature)
        else:
            await self.send(text_data=json.dumps(message_data))

    async def height_message(self, event):
        """Handle height messages received in the height group."""
        message = event["message"]
        message_data = json.loads(message)

        status = message_data.get("Status")
        height = message_data.get("Height")
        subject = message_data.get("Subject")

        if status and height:
            await self.send(text_data=json.dumps({"Status": status, "Subject": subject}))
            await self.save_height_to_db(height)
        else:
            await self.send(text_data=json.dumps(message_data))

    async def weight_message(self, event):
        """Handle weight messages received in the weight group."""
        message = event["message"]
        message_data = json.loads(message)

        status = message_data.get("Status")
        weight = message_data.get("Weight")
        subject = message_data.get("Subject")

        if status and weight:
            await self.send(text_data=json.dumps({"Status": status, "Subject": subject}))
            await self.save_weight_to_db(weight)
        else:
            await self.send(text_data=json.dumps(message_data))

    async def glucose_message(self, event):
        """Handle glucose messages received in the glucose group."""
        message = event["message"]
        message_data = json.loads(message)

        glucose_level = message_data.get("Glucose")
        status = message_data.get("Status")
        glucose_samples = message_data.get("Samples")
        subject = message_data.get("Subject")

        if status and glucose_level and glucose_samples:
            await self.send(
                text_data=json.dumps({"Status": status, "Samples": glucose_samples,"Subject": subject})
            )
            await self.save_glucose_to_db(glucose_level, glucose_samples)
        else:
            await self.send(text_data=json.dumps(message_data))

    async def oximeter_message(self, event):
        """Handle oximeter messages received in the oximeter group."""
        message = event["message"]
        message_data = json.loads(message)

        status = message_data.get("Status")
        heart_rate = message_data.get("Heart_Rate")
        spo2 = message_data.get("SPO2")
        subject = message_data.get("Subject")

        if status and heart_rate and spo2:
            await self.send(text_data=json.dumps({"Status": status, "Subject": subject}))
            await self.save_oximeter_to_db(heart_rate, spo2)
        else:
            await self.send(text_data=json.dumps(message_data))

    async def hardware_message(self, event):
        """Handle hardware messages received in the hardware group."""
        message = event["message"]
        message_data = json.loads(message)

        status = message_data.get("Status")
        subject =  message_data.get("Subject")
        await self.send(text_data=json.dumps({"Status": status, "Subject": subject}))

    async def bp_message(self, event):
        """Handle bp messages received in the bp group."""
        message = event["message"]
        message_data = json.loads(message)

        status = message_data.get("Status")
        heart_rate_bp = message_data.get("Heart_Rate")
        sys = message_data.get("SYS")
        dia = message_data.get("DIA")
        subject =  message_data.get("Subject")

        if status and heart_rate_bp and sys and dia:
            await self.send(text_data=json.dumps({"Status": status,"Subject": subject}))
            await self.save_bp_to_db(heart_rate_bp, sys, dia)
        else:
            await self.send(text_data=json.dumps(message_data))

    @sync_to_async
    def save_temperature_to_db(self, temperature):
        """Save temperature data to the database based on the user role."""
        if self.role == "doctor":
            doctor_profile = self.user.doctorprofile
            doctor_data, created = DoctorData.objects.get_or_create(
                doctor=doctor_profile,
                defaults={
                    "temperature": Decimal(temperature),
                    "created_at": timezone.now(),
                },
            )
            if not created:
                doctor_data.temperature = Decimal(temperature)
                doctor_data.save()
        elif self.role == "patient":
            patient_profile = self.user.patientprofile
            patient_data, created = PatientData.objects.get_or_create(
                patient=patient_profile,
                defaults={
                    "temperature": Decimal(temperature),
                    "created_at": timezone.now(),
                },
            )
            if not created:
                patient_data.temperature = Decimal(temperature)
                patient_data.save()

    @sync_to_async
    def save_height_to_db(self, height):
        """Save height data to the database based on the user role."""
        if self.role == "doctor":
            doctor_profile = self.user.doctorprofile
            doctor_data, created = DoctorData.objects.get_or_create(
                doctor=doctor_profile,
                defaults={
                    "height": Decimal(height),
                    "created_at": timezone.now(),
                },
            )
            if not created:
                doctor_data.height = Decimal(height)
                doctor_data.save()
        elif self.role == "patient":
            patient_profile = self.user.patientprofile
            patient_data, created = PatientData.objects.get_or_create(
                patient=patient_profile,
                defaults={
                    "height": Decimal(height),
                    "created_at": timezone.now(),
                },
            )
            if not created:
                patient_data.height = Decimal(height)
                patient_data.save()

    @sync_to_async
    def save_weight_to_db(self, weight):
        """Save weight data to the database based on the user role."""
        if self.role == "doctor":
            doctor_profile = self.user.doctorprofile
            doctor_data, created = DoctorData.objects.get_or_create(
                doctor=doctor_profile,
                defaults={
                    "weight": Decimal(weight),
                    "created_at": timezone.now(),
                },
            )
            if not created:
                doctor_data.weight = Decimal(weight)
                doctor_data.save()
        elif self.role == "patient":
            patient_profile = self.user.patientprofile
            patient_data, created = PatientData.objects.get_or_create(
                patient=patient_profile,
                defaults={
                    "weight": Decimal(weight),
                    "created_at": timezone.now(),
                },
            )
            if not created:
                patient_data.weight = Decimal(weight)
                patient_data.save()

    @sync_to_async
    def save_glucose_to_db(self, glucose_level, glucose_samples):
        """Save glucose data to the database based on the user role."""
        if self.role == "doctor":
            doctor_profile = self.user.doctorprofile
            doctor_data, created = DoctorData.objects.get_or_create(
                doctor=doctor_profile,
                defaults={
                    "glucose_level": Decimal(glucose_level),
                    "glucose_samples": glucose_samples,
                    "created_at": timezone.now(),
                },
            )
            if not created:
                doctor_data.glucose_level = Decimal(glucose_level)
                doctor_data.glucose_samples = glucose_samples
                doctor_data.save()
        elif self.role == "patient":
            patient_profile = self.user.patientprofile
            patient_data, created = PatientData.objects.get_or_create(
                patient=patient_profile,
                defaults={
                    "glucose_level": Decimal(glucose_level),
                    "glucose_samples": glucose_samples,
                    "created_at": timezone.now(),
                },
            )
            if not created:
                patient_data.glucose_level = Decimal(glucose_level)
                patient_data.glucose_samples = glucose_samples
                patient_data.save()

    @sync_to_async
    def save_oximeter_to_db(self, heart_rate, spo2):
        """Save oximeter data to the database based on the user role."""
        if self.role == "doctor":
            doctor_profile = self.user.doctorprofile
            doctor_data, created = DoctorData.objects.get_or_create(
                doctor=doctor_profile,
                defaults={
                    "heart_rate": Decimal(heart_rate),
                    "spo2": Decimal(spo2),
                    "created_at": timezone.now(),
                },
            )
            if not created:
                doctor_data.heart_rate = Decimal(heart_rate)
                doctor_data.spo2 = Decimal(spo2)
                doctor_data.save()
        elif self.role == "patient":
            patient_profile = self.user.patientprofile
            patient_data, created = PatientData.objects.get_or_create(
                patient=patient_profile,
                defaults={
                    "heart_rate": Decimal(heart_rate),
                    "spo2": Decimal(spo2),
                    "created_at": timezone.now(),
                },
            )
            if not created:
                patient_data.heart_rate = Decimal(heart_rate)
                patient_data.spo2 = Decimal(spo2)
                patient_data.save()

    @sync_to_async
    def save_bp_to_db(self, heart_rate_bp, sys, dia):
        """Save blood pressure data to the database based on the user role."""
        if self.role == "doctor":
            doctor_profile = self.user.doctorprofile
            doctor_data, created = DoctorData.objects.get_or_create(
                doctor=doctor_profile,
                defaults={
                    "heart_rate_bp": Decimal(heart_rate_bp),
                    "sys": Decimal(sys),
                    "dia": Decimal(dia),
                    "created_at": timezone.now(),
                },
            )
            if not created:
                doctor_data.heart_rate_bp = Decimal(heart_rate_bp)
                doctor_data.sys = Decimal(sys)
                doctor_data.dia = Decimal(dia)
                doctor_data.save()
        elif self.role == "patient":
            patient_profile = self.user.patientprofile
            patient_data, created = PatientData.objects.get_or_create(
                patient=patient_profile,
                defaults={
                    "heart_rate_bp": Decimal(heart_rate_bp),
                    "sys": Decimal(sys),
                    "dia": Decimal(dia),
                    "created_at": timezone.now(),
                },
            )
            if not created:
                patient_data.heart_rate_bp = Decimal(heart_rate_bp)
                patient_data.sys = Decimal(sys)
                patient_data.dia = Decimal(dia)
                patient_data.save()

    @sync_to_async
    def get_validated_token(self, token):
        """Validate JWT token and return the decoded payload."""
        return UntypedToken(token)

    @sync_to_async
    def get_user_from_token(self, validated_token):
        """Return user from the validated token."""
        user_id = validated_token["user_id"]
        return User.objects.get(id=user_id)

    @sync_to_async
    def get_user_role(self):
        """Determine the role of the user."""
        if hasattr(self.user, "doctorprofile"):
            return "doctor"
        elif hasattr(self.user, "patientprofile"):
            return "patient"
        return None

    @sync_to_async
    def save_vitals_to_history(self):
        """Save the current vitals to VitalHistory before disconnecting."""
        if self.role == "doctor":
            doctor_profile = self.user.doctorprofile
            # Check if there are any DoctorData records
            if DoctorData.objects.filter(doctor=doctor_profile).exists():
                doctor_data = DoctorData.objects.filter(doctor=doctor_profile).latest("created_at")
                VitalHistoryDoctor.objects.create(
                    doctor=doctor_profile,
                    temperature=doctor_data.temperature,
                    glucose_level=doctor_data.glucose_level,
                    glucose_samples=doctor_data.glucose_samples,
                    heart_rate=doctor_data.heart_rate,
                    spo2=doctor_data.spo2,
                    heart_rate_bp=doctor_data.heart_rate_bp,
                    sys=doctor_data.sys,
                    dia=doctor_data.dia,
                    height=doctor_data.height,
                    weight=doctor_data.weight,
                )
            else:
                # Handle the case where no doctor data exists
                print(f"No doctor data found for {doctor_profile}")

        elif self.role == "patient":
            patient_profile = self.user.patientprofile
            # Check if there are any PatientData records
            if PatientData.objects.filter(patient=patient_profile).exists():
                patient_data = PatientData.objects.filter(patient=patient_profile).latest("created_at")
                VitalHistoryPatient.objects.create(
                    patient=patient_profile,
                    temperature=patient_data.temperature,
                    glucose_level=patient_data.glucose_level,
                    glucose_samples=patient_data.glucose_samples,
                    heart_rate=patient_data.heart_rate,
                    spo2=patient_data.spo2,
                    heart_rate_bp=patient_data.heart_rate_bp,
                    sys=patient_data.sys,
                    dia=patient_data.dia,
                    height=patient_data.height,
                    weight=patient_data.weight,
                )
            else:
                # Handle the case where no patient data exists
                print(f"No patient data found for {patient_profile}")
    @sync_to_async
    def reset_existing_data(self):
        """Reset existing data fields to None or default before new calculations."""
        if self.role == "doctor":
            doctor_profile = self.user.doctorprofile
            if DoctorData.objects.filter(doctor=doctor_profile).exists():
                doctor_data = DoctorData.objects.filter(doctor=doctor_profile).latest("created_at")
                doctor_data.temperature = None
                doctor_data.glucose_level = None
                doctor_data.glucose_samples = None
                doctor_data.heart_rate = None
                doctor_data.spo2 = None
                doctor_data.heart_rate_bp = None
                doctor_data.sys = None
                doctor_data.dia = None
                doctor_data.height = None
                doctor_data.weight = None
                doctor_data.save()
        elif self.role == "patient":
            patient_profile = self.user.patientprofile
            if PatientData.objects.filter(patient=patient_profile).exists():
                patient_data = PatientData.objects.filter(patient=patient_profile).latest("created_at")
                patient_data.temperature = None
                patient_data.glucose_level = None
                patient_data.glucose_samples = None
                patient_data.heart_rate = None
                patient_data.spo2 = None
                patient_data.heart_rate_bp = None
                patient_data.sys = None
                patient_data.dia = None
                patient_data.height = None
                patient_data.weight = None
                patient_data.save()            
    @sync_to_async
    def get_validated_token(self, token):
        return UntypedToken(token)

    @sync_to_async
    def get_user_from_token(self, validated_token):
        return User.objects.get(id=validated_token["user_id"])

    @sync_to_async
    def get_user_role(self):
        if hasattr(self.user, "doctorprofile"):
            return "doctor"
        elif hasattr(self.user, "patientprofile"):
            return "patient"
        return "unknown"
