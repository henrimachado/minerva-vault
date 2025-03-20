import uuid
from ..models import Role
from ..serializer import RoleListSerializer

class RoleRepository:
    def get_user_roles(self) -> list[Role]:
        roles = Role.objects.filter(
            name__in =['STUDENT', 'PROFESSOR']
        )
        
        serializer = RoleListSerializer(roles, many=True)
        return serializer.data
        
    def get_role_by_id(self, role_id: uuid) -> Role:
        return Role.objects.get(id=role_id)