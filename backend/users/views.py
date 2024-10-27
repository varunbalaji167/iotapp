# views.py
from django.contrib.auth import authenticate
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
from django.http import Http404
from .models import CustomUser, PatientProfile, DoctorProfile, Devices, DoctorData, PatientData, VitalHistoryPatient, VitalHistoryDoctor
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    DeviceSerializer,
    DoctorDataSerializer,
    PatientDataSerializer,
    PatientProfileSerializer,
    DoctorProfileSerializer,
    VitalHistoryPatientSerializer,
    VitalHistoryDoctorSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            serializer = RegisterSerializer(user)
            return Response({
                "user": serializer.data,
                "token": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    Base view for user profiles (patient/doctor).
    """

    profile_serializer = None
    profile_model = None

    def get(self, request):
        user = request.user

        # Try to find the profile for the user
        profile, created = self.profile_model.objects.get_or_create(user=user)
        serializer = self.profile_serializer(profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        profile = get_object_or_404(self.profile_model, user=user)
        
        serializer = self.profile_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        user = request.user
        profile = get_object_or_404(self.profile_model, user=user)

        # Handle profile picture update
        if "profile_picture" in request.data and profile.profile_picture:
            default_storage.delete(profile.profile_picture.name)

        serializer = self.profile_serializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientProfileView(UserProfileView):
    profile_serializer = PatientProfileSerializer
    profile_model = PatientProfile


class DoctorProfileView(UserProfileView):
    profile_serializer = DoctorProfileSerializer
    profile_model = DoctorProfile


class PatientProfileListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profiles = PatientProfile.objects.all()
        serializer = PatientProfileSerializer(profiles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeviceListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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


class DeviceRetrieveUpdateDestroyAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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


class DoctorDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        doctor_profile = request.user.doctorprofile
        latest_vitals = DoctorData.objects.filter(doctor=doctor_profile).order_by('-created_at')
        serializer = DoctorDataSerializer(latest_vitals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PatientDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        patient_profile = get_object_or_404(PatientProfile, user=request.user)
        latest_vitals = PatientData.objects.filter(patient=patient_profile).order_by('-created_at')
        serializer = PatientDataSerializer(latest_vitals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class PatientVitalHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if the logged-in user is a patient
        if request.user.role != 'patient':
            return Response({"detail": "Unauthorized. Only patients can access this data."},
                            status=status.HTTP_403_FORBIDDEN)

        # Get the PatientProfile linked to the logged-in user
        try:
            patient_profile = PatientProfile.objects.get(user=request.user.unique_id)
        except PatientProfile.DoesNotExist:
            return Response({"detail": "Patient profile not found."},
                            status=status.HTTP_404_NOT_FOUND)

        # Filter vital records related to the logged-in patient's profile
        vital_records = VitalHistoryPatient.objects.filter(patient=patient_profile).order_by('-recorded_at')
        
        serializer = VitalHistoryPatientSerializer(vital_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class PatientVitalHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if the logged-in user is a patient
        if request.user.role != 'patient':
            return Response({"detail": "Unauthorized. Only patients can access this data."},
                            status=status.HTTP_403_FORBIDDEN)

        # Get the PatientProfile linked to the logged-in user
        try:
            patient_profile = PatientProfile.objects.get(user=request.user.unique_id)
        except PatientProfile.DoesNotExist:
            return Response({"detail": "Patient profile not found."},
                            status=status.HTTP_404_NOT_FOUND)

        # Filter vital records related to the logged-in patient's profile
        vital_records = VitalHistoryPatient.objects.filter(patient=patient_profile).order_by('-recorded_at')
        
        serializer = VitalHistoryPatientSerializer(vital_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class DoctorVitalHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if the logged-in user is a doctor
        if request.user.role != 'doctor':
            return Response({"detail": "Unauthorized. Only doctors can access this data."},
                            status=status.HTTP_403_FORBIDDEN)

        # Get the DoctorProfile linked to the logged-in user
        try:
            doctor_profile = DoctorProfile.objects.get(user=request.user.unique_id)
        except DoctorProfile.DoesNotExist:
            return Response({"detail": "Doctor profile not found."},
                            status=status.HTTP_404_NOT_FOUND)

        # Filter vital records related to the logged-in doctor's profile
        vital_records = VitalHistoryDoctor.objects.filter(doctor=doctor_profile).order_by('-recorded_at')
        
        serializer = VitalHistoryDoctorSerializer(vital_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)