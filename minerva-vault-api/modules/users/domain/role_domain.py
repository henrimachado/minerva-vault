from ..service import RoleService

class RoleDomain:
    def __init__(self):
        self.role_service = RoleService()
    
    def get_user_roles(self) -> list:
        return self.role_service.get_user_roles()