# #urls.py
# from django.urls import path
# from rest_framework_simplejwt.views import TokenRefreshView
# from .views import RegisterView, LoginView

# urlpatterns = [
#     path("register/", RegisterView.as_view(), name="register"),
#     path("login/", LoginView.as_view(), name="login"),
#     path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
# ]

#urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, PatientProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path('profile/', PatientProfileView.as_view(), name='profile'),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]