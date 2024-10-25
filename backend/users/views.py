# views.py
from django.contrib.auth import authenticate, login
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CustomUser, PatientProfile, DoctorProfile, Devices
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
      DeviceSerializer
  
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import Http404

from django.http import JsonResponse
from django.core.files.storage import default_storage
import paho.mqtt.client as paho
from paho import mqtt
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from datetime import datetime
import json
from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
import json
from decimal import Decimal
from datetime import datetime
from .models import CustomUser, PatientProfile, DoctorProfile
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    PatientProfileSerializer,
    DoctorProfileSerializer,
   
)
# from users.mqtt_client import client,message_received,data

# # Accessing the global variable from manage.py
# from manage import data, message_received


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
class DeviceListCreateAPIView(APIView):
    def get(self, request):
        devices = Devices.objects.all()
        serializer = DeviceSerializer(devices, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DeviceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Device retrieve, update, and delete view
class DeviceRetrieveUpdateDestroyAPIView(APIView):
    def get_object(self, pk):
        try:
            return Devices.objects.get(pk=pk)
        except Devices.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        device = self.get_object(pk)
        serializer = DeviceSerializer(device)
        return Response(serializer.data)

    def put(self, request, pk):
        device = self.get_object(pk)
        serializer = DeviceSerializer(device, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        device = self.get_object(pk)
        device.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
