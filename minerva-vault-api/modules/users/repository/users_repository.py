from ..models.user import User
from ..models.role import Role
from ..models.user_role import UserRole

class UserRepository:
    def get_user_by_id(self, user_id: str) -> User:
        return User.objects.prefetch_related('user_roles__role').get(id=user_id)
    
    def update_user(self, user: User, data: dict) -> User:
        allowed_fields = ['first_name', 'last_name', 'is_active']
        update_fields = []
        
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
                update_fields.append(field)
                
        if update_fields:
            user.save(update_fields=update_fields)
        return user

    def update_password(self, user: User, new_password: str) -> User:
        user.set_password(new_password)
        user.save(update_fields=['password'])
        return user