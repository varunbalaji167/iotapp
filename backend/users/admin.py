# #admin.py
# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from .models import CustomUser

# class UserAdmin(BaseUserAdmin):
#     model = CustomUser
#     list_display = ("username", "email", "role", "is_staff", "is_active")
#     list_filter = ("is_staff", "is_active", "role")
#     fieldsets = (
#         (None, {"fields": ("username", "password")}),
#         (
#             "Permissions",
#             {
#                 "fields": (
#                     "is_active",
#                     "is_staff",
#                     "is_superuser",
#                     "groups",
#                     "user_permissions",
#                 )
#             },
#         ),
#         ("Important dates", {"fields": ("last_login", "date_joined")}),
#     )
#     add_fieldsets = (
#         (
#             None,
#             {
#                 "classes": ("wide",),
#                 "fields": ("username", "email", "password1", "password2", "role"),
#             },
#         ),
#     )
#     search_fields = ("username", "email")
#     ordering = ("username",)


# admin.site.register(CustomUser, UserAdmin)

# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, PatientProfile, DoctorProfile

class UserAdmin(BaseUserAdmin):
    model = CustomUser
    # Include 'unique_id' in the list_display so it shows in the admin list view
    list_display = ("username", "email", "role", "unique_id", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active", "role")
    
    # Add 'unique_id' in the fieldsets so it shows in the user edit form
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

    # Include 'unique_id' in the add_fieldsets for user creation (optional)
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2", "role"),
            },
        ),
    )
    # Include 'unique_id' in the add_fieldsets for user creation (optional)
    add_fieldsets = (
        (
            None,
              {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2", "role"),
            },
        ),
    )
    search_fields = ("username", "email", "unique_id")  # Allow searching by unique_id
    ordering = ("username",)

# Register CustomUser and PatientProfile in the admin site
admin.site.register(CustomUser, UserAdmin)
admin.site.register(PatientProfile)
admin.site.register(DoctorProfile)