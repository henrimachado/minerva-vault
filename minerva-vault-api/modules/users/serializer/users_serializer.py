from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from ..models import User, Role

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']
    
    
class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField() 
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'created_at',
            'updated_at',
            'inactivated_at',
            'avatar_url',
            'roles'
        ]

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
        return None
    
    def get_roles(self, obj):
        return [
            {
                'id': str(user_role.role.id),
                'name': user_role.role.name,
                'description': user_role.role.description
            }
            for user_role in obj.user_roles.all()
        ]

class UserDetailSerializer(UserSerializer):
    password_status = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['password_status']
        
    def get_password_status(self, obj):
        expiration_date = obj.last_password_change + timedelta(days=30)
        remaining = expiration_date - timezone.now()
        days_until_expiration = remaining.days

        return {
            'needs_change': days_until_expiration <= 0,
            'days_until_expiration': days_until_expiration,
            'last_change': obj.last_password_change,
            'urgency': self._get_password_urgency(days_until_expiration)
        }
        
    def _get_password_urgency(self, days_until_expiration: int) -> str:
        if days_until_expiration <= 0:
            return 'EXPIRED'
        elif days_until_expiration <= 5:
            return 'CRITICAL'
        elif days_until_expiration <= 10:
            return 'WARNING'
        return 'OK'