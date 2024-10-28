# urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    PatientProfileView,
    DoctorProfileView,
    PatientProfileListView,
    DeviceListCreateAPIView,
    DeviceRetrieveUpdateDestroyAPIView,
    DoctorDataView,
    PatientDataView,
    PatientVitalHistoryView,
    DoctorVitalHistoryView,
    face_authentication_view
)

urlpatterns = [
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("patientprofile/", PatientProfileView.as_view(), name="patientprofile"),
    path("doctorprofile/", DoctorProfileView.as_view(), name="doctorprofile"),
    path(
        "patient-profiles/",
        PatientProfileListView.as_view(),
        name="patient-profiles-list",
    ),
    path("devices/", DeviceListCreateAPIView.as_view(), name="devices-list-create"),
    path(
        "devices/<int:pk>/",
        DeviceRetrieveUpdateDestroyAPIView.as_view(),
        name="device-detail",
    ),
    path("doctorvitals/", DoctorDataView.as_view(), name="doctor-data"),
    path("patientvitals/", PatientDataView.as_view(), name="patient-data"),
    path("patientvitals/history/", PatientVitalHistoryView.as_view(), name='patient-vital-history'),
    path("doctorvitals/history/", DoctorVitalHistoryView.as_view(), name='doctor-vital-history'),
    path('face-auth/', face_authentication_view, name='face_auth'),
]
