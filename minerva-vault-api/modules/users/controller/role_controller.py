from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from modules.audit.decorator import audit_log
from ..domain import RoleDomain


class RoleController(ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = RoleDomain()

    @swagger_auto_schema(
        operation_summary="Lista tipos de usuário",
        operation_description="Retorna a lista de tipos de usuário disponíveis no sistema (STUDENT e PROFESSOR)",
        responses={
            200: openapi.Response(
                description="Lista de tipos de usuário",
                schema=openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'id': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                format=openapi.FORMAT_UUID
                            ),
                            'name': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                enum=['STUDENT', 'PROFESSOR']
                            )
                        }
                    )
                )
            ),
            401: "Não autorizado",
            500: "Erro interno do servidor"
        },
        tags=['Tipos de Usuário']
    )
    @audit_log(action='GET', module='USERS', table_name='user_roles')
    def list(self, request): 
        result = self.domain.get_user_roles()
        return Response(result)