from ..models import Role
import uuid

class RoleRepository:
    def get_user_roles(self) -> list[Role]:
        return Role.objects.filter(
            name__in =['STUDENT', 'PROFESSOR']
        ).values('id', 'name')
        
    def get_role_by_id(self, role_id: uuid) -> Role:
        return Role.objects.get(id=role_id)