from rest_framework.exceptions import PermissionDenied, ValidationError
from ..service.users_service import UserService
from modules.users.models import User

class UserDomain:
    def __init__(self):
        self.service = UserService()

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
        
    def get_user_by_id(self, user_id: str) -> dict:
        user = self.service.get_user_by_id(user_id)
        return self._format_user_response(user)
        
    def update_user(self, requesting_user: User, user_id: str, data: dict) -> dict:
        
        user_to_update = self.service.get_user_by_id(user_id)
        
        is_admin = any(role.role.name == 'ADMIN' for role in requesting_user.user_roles.all())
        if str(requesting_user.id) != user_id and not is_admin:
            raise PermissionDenied("Você não tem permissão para atualizar este usuário")
        
        try:
            updated_user = self.service.update_user(user_to_update, data)   
            return self._format_user_response(updated_user)
        except Exception as e:
            raise e  
    
    def change_password(self, requesting_user: User, user_id: str | None, data: dict) -> dict:
        user_to_update = self.service.get_user_by_id(user_id) if user_id else requesting_user
        
        is_admin = any(role.role.name == 'ADMIN' for role in requesting_user.user_roles.all())
        
        if not is_admin and requesting_user.id != user_to_update.id:
            raise PermissionDenied("Você não tem permissão para alterar a senha deste usuário")
        
        if not is_admin and requesting_user.id == user_to_update.id:
            if not data['current_password']:
                raise ValidationError("Senha atual é obrigatória")
            if not self.service.check_password(user_to_update, data['current_password']):
                raise ValidationError("Senha atual incorreta")

        updated_user = self.service.update_password(user_to_update, data['new_password'])
        return self._format_user_response(updated_user)

    
    
        
    