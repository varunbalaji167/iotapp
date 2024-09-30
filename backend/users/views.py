# views.py
from django.contrib.auth import authenticate, login
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CustomUser, PatientProfile, DoctorProfile
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    PatientProfileSerializer,
    DoctorProfileSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import PatientData, CustomUser
from .serializers import PatientDataSerializer
from django.http import JsonResponse
from django.core.files.storage import default_storage
import paho.mqtt.client as paho
from paho import mqtt


class RegisterView(generics.CreateAPIView):
    # HTTP Method: POST request
    queryset = CustomUser.objects.all()  # retrieves all customuser objects
    serializer_class = (
        RegisterSerializer  # Handles user registration using the RegisterSerializer
    )
    permission_classes = [AllowAny]


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer  # Authenticates users using the LoginSerializer

    def post(
        self, request, *args, **kwargs
    ):  # POST request to log in the user by passing username and password
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        # After authentication, it generates JWT tokens (access and refresh) using rest_framework_simplejwt.tokens.RefreshToken.
        refresh = RefreshToken.for_user(user)
        if user:
            serializer = RegisterSerializer(user)
            return Response(
                {
                    "user": serializer.data,
                    "token": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
        )


from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage


class PatientProfileView(APIView):  # inherits from APIView
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Get the authenticated user from the request

        try:
            # Try to find a patient profile for the user
            patient = PatientProfile.objects.get(user=user)
            serializer = self.serializer_class(patient)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except PatientProfile.DoesNotExist:
            # If the patient doesn't exist, create a new one
            patient = PatientProfile.objects.create(user=user)
            patient.save()  # Save the new patient record
            serializer = self.serializer_class(patient)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED
            )  # Returns serialized profile data in JSON

    def post(self, request):
        # Handle POST request to update the patient profile data
        user = request.user
        try:
            # Try to find the patient profile for the user
            patient = PatientProfile.objects.get(user=user)
        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.serializer_class(
            patient, data=request.data, partial=True
        )  # partial=True allows partial updates
        if serializer.is_valid():
            serializer.save()  # Save the updated patient data
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        # Handle PUT request to update the patient profile
        user = request.user
        try:
            # Try to find the patient profile for the user
            patient = PatientProfile.objects.get(user=user)
        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        # Check if the profile picture is being updated
        if "profile_picture" in request.data and patient.profile_picture:
            # Delete the old profile picture
            default_storage.delete(patient.profile_picture.name)  # Remove the old file

        serializer = self.serializer_class(
            patient, data=request.data
        )  # Update with complete data
        if serializer.is_valid():
            serializer.save()  # Save the updated patient data
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# View for handling doctor profile data
class DoctorProfileView(APIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Get the authenticated user from the request

        try:
            # Try to find a doctor profile for the user
            doctor = DoctorProfile.objects.get(user=user)
            serializer = self.serializer_class(doctor)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except DoctorProfile.DoesNotExist:
            # If the doctor doesn't exist, create a new one
            doctor = DoctorProfile.objects.create(user=user)
            doctor.save()  # Save the new doctor record
            serializer = self.serializer_class(doctor)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    def post(self, request):
        # Handle POST request to update the doctor profile data
        user = request.user
        try:
            # Try to find the doctor profile for the user
            doctor = DoctorProfile.objects.get(user=user)
        except DoctorProfile.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.serializer_class(
            doctor, data=request.data, partial=True
        )  # partial=True allows partial updates
        if serializer.is_valid():
            serializer.save()  # Save the updated doctor data
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        # Handle PUT request to update the doctor profile
        user = request.user
        try:
            # Try to find the doctor profile for the user
            doctor = DoctorProfile.objects.get(user=user)
        except DoctorProfile.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if the profile picture is being updated
        if "profile_picture" in request.data and doctor.profile_picture:
            # Delete the old profile picture
            default_storage.delete(doctor.profile_picture.name)  # Remove the old file

        serializer = self.serializer_class(
            doctor, data=request.data
        )  # Update with complete data
        if serializer.is_valid():
            serializer.save()  # Save the updated doctor data
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientProfileListView(APIView):
    # API view to retrieve all patient profiles.
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Handle GET requests to return all patient profiles.
        """
        profiles = PatientProfile.objects.all()  # Query to get all patient profiles
        serializer = PatientProfileSerializer(
            profiles, many=True
        )  # Serialize the profiles
        return Response(
            serializer.data, status=status.HTTP_200_OK
        )  # Return the response




# MQTT connection settings (use the settings you shared previously)
broker_address = "ec2a9b483a244cecb4099b683f3a7495.s1.eu.hivemq.cloud"
broker_port = 8883
username = "hivemq.webclient.1725454073312"
password = "4T5S2RK3GJckyvuz,<&."
client_subscribe_topic = "Sensor"
client_publish_topic = "Temperature"

client = paho.Client(client_id="hivemq.webclient.1725453249369", userdata=None, protocol=paho.MQTTv5, callback_api_version=paho.CallbackAPIVersion.VERSION2)
client.tls_set(tls_version=mqtt.client.ssl.PROTOCOL_TLS)
client.username_pw_set(username, password)
client.connect(broker_address, broker_port, 60)
client.loop_start()

data = ""
message_received = False

def on_message(client, userdata, msg):
    global data, message_received
    message_received = True
    data = msg.payload.decode().strip()

client.on_message = on_message

def publish_and_wait(message):
    global message_received
    client.subscribe(client_subscribe_topic, qos=2)
    client.publish(client_publish_topic, payload=message, qos=2)
    message_received = False
    while not message_received:
        pass
    return data

# class PatientDataView(APIView):
#     def get(self, request):
#         """Handle GET request for retrieving sensor data and storing it in the database."""
#         user = request.user

#         # Fetch patient data if it exists, else create a new instance
#         patient_data, created = PatientData.objects.get_or_create(user=user)

#         # Get temperature data via MQTT
#         message = "Temperature"
#         temperature_data = publish_and_wait(message)

#         if created:
#             # First time data creation
#             patient_data.temperature = temperature_data
#             patient_data.save()

#         serializer = PatientDataSerializer(patient_data)
#         return Response(serializer.data, status=status.HTTP_200_OK)
class PatientDataView(APIView):
    def get(self, request):
        """Handle GET request for retrieving sensor data and storing it in the database."""
        # user = request.user
        message_type = request.query_params.get('message', None)

        if message_type is None:
            return Response({"error": "Message type is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch patient data if it exists, else create a new instance
        patient_data, created = PatientData.objects.get_or_create(user=user)

        # Get data from MQTT based on the message type
        temperature_data = publish_and_wait(message_type)

        # First time data creation or update
        if message_type == "TEMPERATURE":
            patient_data.temperature = temperature_data
        else:
            return Response({"error": "Invalid message type"}, status=status.HTTP_400_BAD_REQUEST)

        patient_data.save()

        serializer = PatientDataSerializer(patient_data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Handle POST request that sends the message type to retrieve sensor data."""
        user = request.user
        message_type = request.data.get("message", None)

        if message_type is None:
            return Response({"error": "Message type is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Call the GET method to handle MQTT fetching and database updating
        return self.get(request._request)

    # def post(self, request):
    #     """Handle POST request to update patient sensor data."""
    #     user = request.user
    #     patient_data = get_object_or_404(PatientData, user=user)

    #     # Get sensor data from MQTT server (for example, heart rate)
    #     # message = "HeartRate"
    #     # heart_rate_data = publish_and_wait(message)

    #     # # Process heart rate data
    #     # out = heart_rate_data.split(",")
    #     # HR = out[1]
    #     # SPO2 = out[0]

    #     # patient_data.heart_rate = f"HR: {HR}, SPO2: {SPO2}"
    #     # patient_data.save()
    #     message = "Temperature"
    #     temperature_data = publish_and_wait(message)

    #     patient_data.temperature = temperature_data
    #     patient_data.save()

    #     serializer = PatientDataSerializer(patient_data)
    #     return Response(serializer.data, status=status.HTTP_200_OK)

    # def put(self, request):
    #     """Handle PUT request to update an existing patient's data."""
    #     user = request.user
    #     patient_data = get_object_or_404(PatientData, user=user)

    #     serializer = PatientDataSerializer(patient_data, data=request.data, partial=True)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_200_OK)

    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
