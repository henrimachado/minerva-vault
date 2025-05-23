from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError
from core.exceptions import ConflictError
from modules.users.models import User
from ..serializer import UserDetailSerializer, UserListSerializer, UserSerializer
from ..service import RoleService, UserService

class UserDomain:
    def __init__(self):
        self.service = UserService()
        self.role_service = RoleService()
        
    def _serialize_user(self, user: User, request=None) -> dict:
        serializer = UserSerializer(
            user,
            context={'request': request} if request else {}
        )
        return serializer.data
        
            
    def _can_update_user(self, requesting_user: User, user_id: str) -> bool:
        is_admin = any(role.role.name == 'ADMIN' for role in requesting_user.user_roles.all())
        return str(requesting_user.id) == user_id or is_admin
    
    def _validate_password_rules(self, user: User, data: dict) -> None:
        if data['current_password'] == data['new_password']:
            raise ValidationError("A nova senha não pode ser igual à senha atual")
        
        if self.service.password_in_history(user, data['new_password']):
            raise ValidationError("A nova senha já foi utilizada recentemente. Por favor, escolha uma senha diferente.")
        
        if user.username.lower() in data['new_password'].lower():
            raise ValidationError("A senha não pode conter o nome de usuário")
        
        if user.email.lower().split('@')[0] in data['new_password'].lower():
            raise ValidationError("A senha não pode conter o e-mail")
        
        if data['new_password'] != data['password_confirmation']:
            raise ValidationError("A senha e a confirmação de senha devem ser iguais")
    
    def _validate_new_user_password(self, data: dict) -> None:
        if data['username'].lower() in data['password'].lower():
            raise ValidationError("A senha não pode ser igual ao nome de usuário")
        
        if data['email'].lower() in data['password'].lower():
            raise ValidationError("A senha não pode ser igual ao nome de usuário")
        
        if data['password'].lower() != data['password_confirmation'].lower():
            raise ValidationError("A senha e a confirmação de senha devem ser iguais")
        
        
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

    
    def change_password(self, user: User,  data: dict, request=None) -> dict:

        if not self.service.check_password(user, data['current_password']):
                raise ValidationError("Senha atual incorreta")
        
        self._validate_password_rules(user, data)

        with transaction.atomic():
            self.service.add_to_password_history(user, data['new_password'])
            updated_user = self.service.update_password(user, data['new_password'])
            self.service.limit_password_history(user)
        
        return self._serialize_user(updated_user, request)

    def create_user(self, data: dict) -> dict:
        self.role_service.get_role_by_id(data['role_id'])
        self._validate_new_user_password(data)
        
        if self.service.user_exists_by_username(data['username']):
            raise ConflictError("Nome de usuário não disponível")
        
        if self.service.user_exists_by_email(data['email']):
            raise ConflictError("E-mail já cadastrado")
        
        with transaction.atomic():
            user = self.service.create_user(data)
            self.service.add_to_password_history(user, data['password'])
            self.service.limit_password_history(user)
            return self._serialize_user(user)
    
    def list_active_users(self, role_id: str, request=None) -> list[dict]:
        self.role_service.get_role_by_id(role_id)
        
        users = self.service.list_active_users(role_id)
        serializer = UserListSerializer(
            users,
            many=True,
            context={'request': request} if request else {}
        )
        return serializer.data
        
        
    
        
    