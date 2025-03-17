from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..domain import RoleDomain

class RoleController(ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = RoleDomain()

    def list(self, request): 
        result = self.domain.get_user_roles()
        return Response(result)