from ..models.user import User
from ..models.role import Role
from ..models.user_role import UserRole

class UserRepository:
    def get_user_by_id(self, user_id: str) -> User:
        return User.objects.prefetch_related('user_roles__role').get(id=user_id)
    
    def get_user_with_roles(self, user_id: str) -> User:
        return User.objects.prefetch_related('user_roles__role').get(id=user_id)
    
    def update_user(self, user: User, data: dict) -> User:
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'password' in data:
            user.set_password(data['password'])
        
        user.save()
        return user