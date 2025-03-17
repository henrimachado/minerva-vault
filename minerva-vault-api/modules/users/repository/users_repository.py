from ..models.user import User
from ..models.user_role import UserRole
from django.db import transaction

class UserRepository:
    def get_user_by_id(self, user_id: str) -> User: 
        return User.objects.prefetch_related('user_roles__role').get(id=user_id)
    
    def update_user(self, user: User, data: dict) -> User:
        print("Dados recebidos:", data)
        print("Avatar atual:", user.avatar)
        
        if data.get('remove_avatar'):
            user.delete_avatar()
        
        allowed_fields = ['first_name', 'last_name', 'is_active']
        update_fields = []
        
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
                update_fields.append(field)
        
        if 'avatar' in data and data['avatar']:
            if user.avatar:
                user.avatar.delete(save=False)
            user.avatar = data['avatar']
            update_fields.append('avatar')
        
        if update_fields:
            user.save(update_fields=update_fields)
        return user

    def update_password(self, user: User, new_password: str) -> User:
        user.set_password(new_password)
        user.save(update_fields=['password'])
        return user
    
    @transaction.atomic
    def create_user(self, data: dict) -> User:
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            is_active=data.get('is_active', True)
        )
        
        if 'avatar' in data:
            user.avatar = data['avatar']
            user.save(update_fields=['avatar'])
        
        UserRole.objects.create(
            user=user,
            role_id=data['role_id']
        )
        
        return user