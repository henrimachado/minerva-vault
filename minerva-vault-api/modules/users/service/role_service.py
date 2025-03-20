import uuid
from rest_framework.exceptions import NotFound
from ..repository import RoleRepository
from ..models import Role


class RoleService:
    def __init__(self):
        self.role_repository = RoleRepository()
    
    def get_user_roles(self) -> list:
        return self.role_repository.get_user_roles()
    
    def get_role_by_id(self, role_id: uuid) -> Role:
        try:
            return self.role_repository.get_role_by_id(role_id)
        except Role.DoesNotExist:
            raise NotFound("Tipo de usuário não encontrado.")