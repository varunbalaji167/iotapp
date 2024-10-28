from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, PatientProfile, DoctorProfile, PatientData, DoctorData, Devices, VitalHistoryPatient, VitalHistoryDoctor

# Custom admin class for CustomUser
class UserAdmin(BaseUserAdmin):
    model = CustomUser
    list_display = ("username", "email", "role", "unique_id", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active", "role", "unique_id")
    
    fieldsets = (
        (None, {"fields": ("username", "password", "unique_id")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2", "role"),
            },
        ),
    )
    
    search_fields = ("username", "email", "unique_id")
    ordering = ("username",)

# Custom admin class for PatientProfile
class PatientProfileAdmin(admin.ModelAdmin):
    model = PatientProfile
    list_display = ("user", "name", "dob", "blood_group", "height", "weight")
    list_filter = ("blood_group", "dob")
    search_fields = ("user__username", "name", "blood_group")

# Custom admin class for DoctorProfile
class DoctorProfileAdmin(admin.ModelAdmin):
    model = DoctorProfile
    list_display = ("user", "name", "specialization", "experience")
    list_filter = ("specialization", "experience")
    search_fields = ("user__username", "name", "specialization")

# Custom admin class for PatientData
class PatientDataAdmin(admin.ModelAdmin):
    model = PatientData
    list_display = ("patient", "temperature", "glucose_level", "oxygen_level", "heart_rate", "spo2", "created_at")
    list_filter = ("temperature", "glucose_level", "oxygen_level", "created_at")
    search_fields = ("patient__user__username", "glucose_level", "heart_rate")

# Custom admin class for DoctorData
class DoctorDataAdmin(admin.ModelAdmin):
    model = DoctorData
    list_display = ("doctor", "temperature", "glucose_level", "oxygen_level", "heart_rate", "spo2", "created_at")
    list_filter = ("temperature", "glucose_level", "oxygen_level", "created_at")
    search_fields = ("doctor__user__username", "glucose_level", "heart_rate")

# Custom admin class for VitalHistoryPatient
class VitalHistoryPatientAdmin(admin.ModelAdmin):
    model = VitalHistoryPatient
    list_display = ("patient", "temperature", "glucose_level","glucose_samples", "oxygen_level", "heart_rate", "spo2", "recorded_at")
    list_filter = ("temperature", "glucose_level", "oxygen_level", "recorded_at")
    search_fields = ("patient__user__username", "glucose_level", "heart_rate")

# Custom admin class for VitalHistoryDoctor
class VitalHistoryDoctorAdmin(admin.ModelAdmin):
    model = VitalHistoryDoctor
    list_display = ("doctor", "temperature", "glucose_level","glucose_samples", "oxygen_level", "heart_rate", "spo2", "recorded_at")
    list_filter = ("temperature", "glucose_level", "oxygen_level", "recorded_at")
    search_fields = ("doctor__user__username", "glucose_level", "heart_rate")

# Custom admin class for Devices
class DevicesAdmin(admin.ModelAdmin):
    model = Devices
    list_display = ("device_id", "device_type", "owner_name", "owner_phone")
    list_filter = ("device_type",)
    search_fields = ("device_id", "owner_name", "owner_phone")

# Registering the models with the custom admin classes
admin.site.register(CustomUser, UserAdmin)
admin.site.register(PatientProfile, PatientProfileAdmin)
admin.site.register(DoctorProfile, DoctorProfileAdmin)
admin.site.register(PatientData, PatientDataAdmin)
admin.site.register(DoctorData, DoctorDataAdmin)
admin.site.register(VitalHistoryPatient, VitalHistoryPatientAdmin)
admin.site.register(VitalHistoryDoctor, VitalHistoryDoctorAdmin)
admin.site.register(Devices, DevicesAdmin)