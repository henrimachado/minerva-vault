from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from ..validator.auth_validator import LoginValidator
from ..domain.auth_domain import AuthDomain
from rest_framework.decorators import action
from modules.audit.decorator import audit_log
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class AuthController(ViewSet):
    authentication_classes = []  
    permission_classes = []      

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = AuthDomain()

    @swagger_auto_schema(
        operation_summary="Autenticação de usuário",
        operation_description="Realiza o login do usuário e retorna os tokens de acesso",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'password'],
            properties={
                'username': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Nome de usuário"
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Senha do usuário",
                    format="password"
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Login realizado com sucesso",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'access': openapi.Schema(type=openapi.TYPE_STRING),
                        'refresh': openapi.Schema(type=openapi.TYPE_STRING),
                        'user': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_STRING),
                                'username': openapi.Schema(type=openapi.TYPE_STRING),
                                'email': openapi.Schema(type=openapi.TYPE_STRING),
                                'first_name': openapi.Schema(type=openapi.TYPE_STRING),
                                'last_name': openapi.Schema(type=openapi.TYPE_STRING),
                                'is_staff': openapi.Schema(type=openapi.TYPE_BOOLEAN)
                            }
                        )
                    }
                )
            ),
            400: "Dados inválidos",
            401: "Credenciais inválidas",
            500: "Erro interno do servidor"
        },
        tags=['Autenticação']
    )
    @audit_log(action='LOGIN', module='AUTH', table_name='auth')
    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        validator = LoginValidator(data=request.data)
        if not validator.is_valid():
            return Response(
                validator.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )

        result = self.domain.login(validator.validated_data)
        return Response(result, status=status.HTTP_200_OK)

