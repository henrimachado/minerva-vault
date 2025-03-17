from rest_framework.exceptions import PermissionDenied
from ..service.users_service import UserService
from modules.users.models import User

class UserDomain:
    def __init__(self):
        self.service = UserService()

    def get_user_by_id(self, user_id: str) -> dict:
        user = self.service.get_user_by_id(user_id)
        return self._format_user_response(user)
        
    def update_user(self, requesting_user: User, user_id: str, data: dict) -> dict:
        
        print('chegou aqui')
        
        user_to_update = self.service.get_user_by_id(user_id)
        
        is_admin = any(role.role.name == 'ADMIN' for role in requesting_user.user_roles.all())
        if str(requesting_user.id) != user_id and not is_admin:
            raise PermissionDenied("Você não tem permissão para atualizar este usuário")
        
        try:
            updated_user = self.service.update_user(user_to_update, data)   
            return self._format_user_response(updated_user)
        except Exception as e:
            raise e  
    
    def _format_user_response(self, user: User) -> dict:
        return {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'created_at': user.created_at,
            'updated_at': user.updated_at,
            'inactivated_at': user.inactivated_at,
            'roles': [
                {
                    'id': str(user_role.role.id),
                    'name': user_role.role.name,
                    'description': user_role.role.description
                }
                for user_role in user.user_roles.all()
            ]
        }