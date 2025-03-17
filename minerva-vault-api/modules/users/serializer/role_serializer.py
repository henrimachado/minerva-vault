from rest_framework import serializers
from ..models import Role

class RoleListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']