from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError
from ..service.users_service import UserService
from modules.users.models import User
from ..serializer.users_serializer import UserSerializer, UserDetailSerializer

class UserDomain:
    def __init__(self):
        self.service = UserService()
        
    def _serialize_user(self, user: User, request=None) -> dict:
        serializer = UserSerializer(
            user,
            context={'request': request} if request else {}
        )
        return serializer.data
        
            
    def _can_update_user(self, requesting_user: User, user_id: str) -> bool:
        is_admin = any(role.role.name == 'ADMIN' for role in requesting_user.user_roles.all())
        return str(requesting_user.id) == user_id or is_admin

    def _can_change_password(self, requesting_user: User, user_id: str, data: dict) -> bool:
        is_admin = any(role.role.name == 'ADMIN' for role in requesting_user.user_roles.all())
        is_same_user = str(requesting_user.id) == user_id
        
        if is_admin:
            return True
        
        if is_same_user:
            if not data.get('current_password'):
                raise ValidationError("Senha atual é obrigatória")
            if not self.service.check_password(requesting_user, data['current_password']):
                raise ValidationError("Senha atual incorreta")
            return True
    
        return False
    
    def _validate_password_rules(self, user: User, data: dict) -> None:
        if data['current_password'] == data['new_password']:
            raise ValidationError("A nova senha não pode ser igual à senha atual")
        
        if self.service.password_in_history(user, data['new_password']):
            raise ValidationError("A nova senha já foi utilizada recentemente. Por favor, escolha uma senha diferente.")
        
        if user.username.lower() in data['new_password'].lower():
            raise ValidationError("A senha não pode conter o nome de usuário")
        
        if user.email.lower().split('@')[0] in data['new_password'].lower():
            raise ValidationError("A senha não pode conter o e-mail")
    
    
    def get_user_by_id(self, user_id: str, request=None, detail=False) -> dict:
        user = self.service.get_user_by_id(user_id)
        serializer_class = UserDetailSerializer if detail else UserSerializer
        serializer = serializer_class(
            user,
            context={'request': request} if request else {}
        )
        return serializer.data
    

    def update_user(self, requesting_user: User, user_id: str, data: dict, request=None) -> dict:
        user_to_update = self.service.get_user_by_id(user_id)
        
        if not self._can_update_user(requesting_user, user_id):
            raise PermissionDenied("Você não tem permissão para atualizar este usuário")
        
        updated_user = self.service.update_user(user_to_update, data)   
        return self._serialize_user(updated_user, request)

    
    def change_password(self, requesting_user: User, user_id: str | None, data: dict, request=None) -> dict:
        user_to_update = self.service.get_user_by_id(user_id) if user_id else requesting_user
        
        if not self._can_change_password(requesting_user, user_id, data):
            raise PermissionDenied("Você não tem permissão para alterar a senha deste usuário")
        
        self._validate_password_rules(user_to_update, data)

        with transaction.atomic():
            self.service.add_to_password_history(user_to_update, data['new_password'])
            updated_user = self.service.update_password(user_to_update, data['new_password'])
            self.service.limit_password_history(user_to_update)
        
        return self._serialize_user(updated_user, request)

    
    
        
    