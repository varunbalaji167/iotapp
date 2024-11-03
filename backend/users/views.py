# views.py
from django.contrib.auth import authenticate
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
from django.http import Http404
from .models import (
    CustomUser,
    PatientProfile,
    DoctorProfile,
    Devices,
    DoctorData,
    PatientData,
    VitalHistoryPatient,
    VitalHistoryDoctor,
)
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    DeviceSerializer,
    DoctorDataSerializer,
    PatientDataSerializer,
    PatientProfileSerializer,
    DoctorProfileSerializer,
    VitalHistoryPatientSerializer,
    VitalHistoryDoctorSerializer,
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


from django.http import JsonResponse
from rest_framework.decorators import api_view
from .iotutils import create, recog, set_user
import cv2


# Camera Class for Face Recognition
class Camera:
    def __init__(self):
        self.video = cv2.VideoCapture(0)  # Use default camera

    def __del__(self):
        self.video.release()

    def get_frame(self):
        ret, frame = self.video.read()
        return ret, frame


# # Face Authentication View
# @api_view(['POST'])
# def face_authentication_view(request):
#     try:
#         # Load face encodings
#         data = create()

#         # Initialize the camera and recognize the face
#         camera = Camera()
#         recognized_user = recog(data, camera=camera)

#         # Set the authenticated user based on recognition result
#         auth = set_user(recognized_user)  # Ensure this function accepts recognized_user as an argument

#         if auth.get("Registered") == recognized_user:
#             user = CustomUser.objects.get(username=recognized_user)  # Get the user object

#             # Generate tokens for the user
#             refresh = RefreshToken.for_user(user)

#             return JsonResponse({
#                 "face_auth": "Success",
#                 "user": {
#                     "username": user.username,
#                     "email": user.email,  # Include any other user fields you want to return
#                 },
#                 "token": {
#                     "access": str(refresh.access_token),
#                     "refresh": str(refresh),
#                 },
#             }, status=200)
#         else:
#             return JsonResponse({"face_auth": "Failed", "error": "No Match Found"}, status=401)

#     except CustomUser.DoesNotExist:
#         return JsonResponse({"face_auth": "Failed", "error": "User does not exist"}, status=404)
#     except Exception as e:
#         return JsonResponse({"face_auth": "Failed", "error": str(e)}, status=500)


@api_view(["POST"])
def face_authentication_view(request):
    try:
        print("Starting face authentication...")
        data = create()
        print("Face encodings loaded.")

        camera = Camera()
        recognized_user = recog(data, camera=camera)
        print(f"Recognized user: {recognized_user}")

        auth = set_user(recognized_user)
        print(f"Auth result: {auth}")

        if auth.get("Registered") == recognized_user:
            user = CustomUser.objects.get(
                username=recognized_user
            )  # Ensure this is valid
            print(f"User found: {user.username}")

            refresh = RefreshToken.for_user(user)

            return JsonResponse(
                {
                    "face_auth": "Success",
                    "user": {
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                    },
                    "token": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                },
                status=200,
            )
        else:
            return JsonResponse(
                {"face_auth": "Failed", "error": "No Match Found"}, status=401
            )

    except CustomUser.DoesNotExist:
        return JsonResponse(
            {"face_auth": "Failed", "error": "User does not exist"}, status=404
        )
    except Exception as e:
        print(f"Error: {str(e)}")
        return JsonResponse({"face_auth": "Failed", "error": str(e)}, status=500)


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
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

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
        latest_vitals = DoctorData.objects.filter(doctor=doctor_profile).order_by(
            "-created_at"
        )
        serializer = DoctorDataSerializer(latest_vitals, many=True)
        response_data = serializer.data
        for item in response_data:
            vital_data = DoctorData.objects.get(id=item["id"])
            item["bmi"] = vital_data.calculate_bmi()
        return Response(serializer.data, status=status.HTTP_200_OK)


class PatientDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        patient_profile = get_object_or_404(PatientProfile, user=request.user)
        latest_vitals = PatientData.objects.filter(patient=patient_profile).order_by(
            "-created_at"
        )
        serializer = PatientDataSerializer(latest_vitals, many=True)
        response_data = serializer.data
        for item in response_data:
            vital_data = PatientData.objects.get(id=item["id"])
            item["bmi"] = vital_data.calculate_bmi()
        return Response(serializer.data, status=status.HTTP_200_OK)


class PatientVitalHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if the logged-in user is a patient
        if request.user.role != "patient":
            return Response(
                {"detail": "Unauthorized. Only patients can access this data."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get the PatientProfile linked to the logged-in user
        try:
            patient_profile = PatientProfile.objects.get(user=request.user.unique_id)
        except PatientProfile.DoesNotExist:
            return Response(
                {"detail": "Patient profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Filter vital records related to the logged-in patient's profile
        vital_records = VitalHistoryPatient.objects.filter(
            patient=patient_profile
        ).order_by("-recorded_at")

        serializer = VitalHistoryPatientSerializer(vital_records, many=True)
        response_data = serializer.data
        for item in response_data:
            vital_data = VitalHistoryPatient.objects.get(id=item["id"])
            item["bmi"] = vital_data.calculate_bmi()
        return Response(serializer.data, status=status.HTTP_200_OK)


class DoctorVitalHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check if the logged-in user is a doctor
        if request.user.role != "doctor":
            return Response(
                {"detail": "Unauthorized. Only doctors can access this data."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get the DoctorProfile linked to the logged-in user
        try:
            doctor_profile = DoctorProfile.objects.get(user=request.user.unique_id)
        except DoctorProfile.DoesNotExist:
            return Response(
                {"detail": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Filter vital records related to the logged-in doctor's profile
        vital_records = VitalHistoryDoctor.objects.filter(
            doctor=doctor_profile
        ).order_by("-recorded_at")

        serializer = VitalHistoryDoctorSerializer(vital_records, many=True)
        response_data = serializer.data
        for item in response_data:
            vital_data = VitalHistoryDoctor.objects.get(id=item["id"])
            item["bmi"] = vital_data.calculate_bmi()
        return Response(serializer.data, status=status.HTTP_200_OK)


from django.http import JsonResponse
from .generatepdf import pdf
import os
from .database import insert_health_data
from datetime import date, datetime
from django.conf import settings

class GenerateAndPrintPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Check authentication
        if not request.user.is_authenticated:
            return Response(
                {"error": "User is not authenticated."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Determine role and fetch the profile and latest vital record
        profile, latest_vital_record = None, None

        if request.user.role == "doctor":
            try:
                profile = DoctorProfile.objects.get(user=request.user)
                latest_vital_record = (
                    VitalHistoryDoctor.objects.filter(doctor=profile)
                    .order_by("-recorded_at")
                    .first()
                )
            except DoctorProfile.DoesNotExist:
                return Response(
                    {"error": "Doctor profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        elif request.user.role == "patient":
            try:
                profile = PatientProfile.objects.get(user=request.user)
                latest_vital_record = (
                    VitalHistoryPatient.objects.filter(patient=profile)
                    .order_by("-recorded_at")
                    .first()
                )
            except PatientProfile.DoesNotExist:
                return Response(
                    {"error": "Patient profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {
                    "error": "Unauthorized. Only doctors and patients can generate this PDF."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if not latest_vital_record:
            return Response(
                {"error": "No vital records found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Function to calculate age in years
        def calculate_age(dob):
            today = date.today()
            if dob > today:
                return "Date of birth is in the future."

            age = today.year - dob.year
            if (today.month, today.day) < (dob.month, dob.day):
                age -= 1
            return age

        # Calculate age and prepare results
        calculated_age = calculate_age(profile.dob)
        results3 = [profile.name, calculated_age, profile.gender, "7", profile.blood_group]

        # Safe value extraction function
        def safe_float(value):
            return float(value) if value is not None else 0.0

        def safe_int(value):
            return int(value) if value is not None else 0

        results2 = [
            safe_float(latest_vital_record.temperature),
            safe_int(latest_vital_record.spo2),
            safe_int(latest_vital_record.heart_rate),
            safe_float(latest_vital_record.height),
            safe_float(latest_vital_record.weight),
            safe_int(latest_vital_record.calculate_bmi()),  # Ensure this method returns an integer or handle its logic accordingly
            safe_int(latest_vital_record.sys),
            safe_int(latest_vital_record.dia),
            safe_float(latest_vital_record.glucose_level),
            safe_int(latest_vital_record.heart_rate_bp),
            7,  # Assuming "7" is an integer
        ]

        new_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        printpdf = results2 + ["16.50"]
        database = [new_date] + results2

        # Generate and save the PDF
        pdf(results3, printpdf, new_date)
        insert_health_data(database)

        # Attempt to print the PDF
        try:
            print("Printing PDF Page")
            # Uncomment for actual printing on Windows
            # os.startfile(os.path.join(settings.MEDIA_ROOT, "output.pdf"), "print")
        except Exception as e:
            return Response(
                {"error": f"Error opening or printing the PDF: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "message": "PDF generated and printed successfully",
                "pdf_url": f"{request.build_absolute_uri(settings.MEDIA_URL)}output.pdf",
            },
            status=status.HTTP_200_OK,
        )