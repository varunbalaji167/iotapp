# #serializers.py
# from django.contrib.auth import authenticate
# from rest_framework import serializers
# from .models import CustomUser,PatientProfile


# class CustomUserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CustomUser
#         fields = [
#             "id",
#             "username",
#             "email",
#             "role",
#         ]


# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True)
#     confirm_password = serializers.CharField(write_only=True)

#     class Meta:
#         model = CustomUser
#         fields = ["username", "email", "password", "confirm_password", "role"]

#     def validate(self, data):
#         if data["password"] != data["confirm_password"]:
#             raise serializers.ValidationError(
#                 {"confirm_password": "Passwords do not match"}
#             )
#         return data

#     def create(self, validated_data):
#         user = CustomUser(
#             username=validated_data["username"],
#             email=validated_data["email"],
#             role=validated_data["role"],
#         )
#         user.set_password(validated_data["password"])
#         user.save()
#         return user


# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField()
#     password = serializers.CharField()

#     def validate(self, data):
#         username = data.get("username")
#         password = data.get("password")

#         if not username or not password:
#             raise serializers.ValidationError(
#                 "Both username and password are required."
#             )

#         user = authenticate(username=username, password=password)
#         if user is None:
#             raise serializers.ValidationError("Invalid credentials")

#         return data

# class PatientProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PatientProfile
#         fields = '__all__'

#     def create(self, validated_data):
#         user = self.context['request'].user
#         profile, created = PatientProfile.objects.get_or_create(user=user, defaults=validated_data)
#         if not created:
#             # Update the profile if it already exists
#             for attr, value in validated_data.items():
#                 setattr(profile, attr, value)
#             profile.save()
#         return profile


# serializers.py
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import CustomUser, PatientProfile


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "role",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["username", "email", "password", "confirm_password", "role"]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match"}
            )
        return data

    def create(self, validated_data):
        user = CustomUser(
            username=validated_data["username"],
            email=validated_data["email"],
            role=validated_data["role"],
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            raise serializers.ValidationError(
                "Both username and password are required."
            )

        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError("Invalid credentials")

        return data


class PatientProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = "__all__"
