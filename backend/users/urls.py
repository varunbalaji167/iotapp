# #urls.py
# from django.urls import path
# from rest_framework_simplejwt.views import TokenRefreshView
# from .views import RegisterView, LoginView

# urlpatterns = [
#     path("register/", RegisterView.as_view(), name="register"),
#     path("login/", LoginView.as_view(), name="login"),
#     path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
# ]

# urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, PatientProfileView, DoctorProfileView


urlpatterns = [
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("patientprofile/", PatientProfileView.as_view(), name="patientprofile"),
    path("doctorprofile/", DoctorProfileView.as_view(), name="doctorprofile"),
]
