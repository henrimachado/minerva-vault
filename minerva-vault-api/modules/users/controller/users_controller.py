from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import action, permission_classes
from rest_framework.exceptions import APIException
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from modules.audit.decorator import audit_log
from ..domain.users_domain import UserDomain
from ..validator.users_validator import (
    ChangePasswordValidator,
    CreateUserValidator,
    ListUsersValidator,
    UpdateUserValidator
)

class UserController(ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = UserDomain()
        
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()

    @swagger_auto_schema(
        operation_summary="Obtém dados do usuário autenticado",
        operation_description="Retorna informações detalhadas do usuário logado, incluindo status da senha",
        responses={
            200: openapi.Response(
                description="Dados do usuário",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                        'username': openapi.Schema(type=openapi.TYPE_STRING),
                        'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
                        'first_name': openapi.Schema(type=openapi.TYPE_STRING),
                        'last_name': openapi.Schema(type=openapi.TYPE_STRING),
                        'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'avatar_url': openapi.Schema(type=openapi.TYPE_STRING, nullable=True),
                        'password_status': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'needs_change': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                'days_until_expiration': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'urgency': openapi.Schema(type=openapi.TYPE_STRING)
                            }
                        )
                    }
                )
            ),
            401: "Não autorizado",
            500: "Erro interno do servidor"
        },
        tags=['Usuários']
    )
    @audit_log(action='GET', module='USERS', table_name='users')
    @action(detail=False, methods=['get'])
    def me(self, request):
        result = self.domain.get_user_by_id(request.user.id, request, detail=True)
        return Response(result)
    
    
    @swagger_auto_schema(
        operation_summary="Lista usuários ativos",
        operation_description="Retorna uma lista de usuários ativos filtrados por role",
        manual_parameters=[
            openapi.Parameter(
                'role_id',
                openapi.IN_QUERY,
                description="ID da role para filtrar usuários",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_UUID,
                required=True
            )
        ],
        responses={
            200: openapi.Response(
                description="Lista de usuários",
                schema=openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                            'name': openapi.Schema(type=openapi.TYPE_STRING),
                            'role': openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                                    'name': openapi.Schema(type=openapi.TYPE_STRING)
                                }
                            )
                        }
                    )
                )
            ),
            400: "Parâmetros inválidos",
            401: "Não autorizado",
            500: "Erro interno do servidor"
        },
        tags=['Usuários']
    )
    @audit_log(action='GET', module='USERS', table_name='users')
    def list(self, request):
        try:
            validator = ListUsersValidator(data=request.query_params)
            if not validator.is_valid():
                return Response(
                    validator.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            result = self.domain.list_active_users(
                role_id=validator.validated_data.get('role_id'),
                request=request
            )
            return Response(result)
        except APIException as e:
            error_message = e.detail[0] if isinstance(e.detail, list) else e.detail
            return Response(
                {'detail': str(error_message)},
                status=e.status_code
            )
        except Exception as e:
            return Response(
                {'detail': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    
    
    @swagger_auto_schema(
        operation_summary="Cria um novo usuário",
        operation_description="Cria um novo usuário no sistema",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'email', 'password', 'password_confirmation', 'role_id'],
            properties={
                'username': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Nome de usuário",
                    min_length=3,
                    max_length=150
                ),
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_EMAIL,
                    description="Email do usuário"
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Senha (mín. 8 caracteres, deve conter maiúscula, minúscula, número e caractere especial)",
                    min_length=8
                ),
                'password_confirmation': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Confirmação da senha"
                ),
                'first_name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Nome",
                    max_length=150
                ),
                'last_name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Sobrenome",
                    max_length=150
                ),
                'role_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_UUID,
                    description="ID da role do usuário"
                ),
                'avatar': openapi.Schema(
                    type=openapi.TYPE_FILE,
                    description="Imagem de avatar do usuário"
                )
            }
        ),
        responses={
            201: openapi.Response(
                description="Usuário criado com sucesso",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: "Dados inválidos",
            500: "Erro interno do servidor"
        },
        tags=['Usuários']
    )       
    @audit_log(action='POST', module='USERS', table_name='users')
    def create(self, request):
        
        data = request.data.copy()
        
        if 'avatar' in request.FILES:
            data['avatar'] = request.FILES['avatar']
        
        validator = CreateUserValidator(data=request.data)
        if not validator.is_valid():
            return Response(
                validator.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            self.domain.create_user(validator.validated_data)
            
            return Response(
                {'message': 'Usuário criado com sucesso!'}, 
                status=status.HTTP_201_CREATED
                )
        except APIException as e:
            error_message = e.detail[0] if isinstance(e.detail, list) else e.detail
            return Response(
                {'detail': str(error_message)},
                status=e.status_code
            )
        except Exception as e:
            return Response(
                {'detail': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    
    @swagger_auto_schema(
        operation_summary="Atualiza dados do usuário",
        operation_description="Atualiza informações de um usuário existente",
        manual_parameters=[
            openapi.Parameter(
                'pk',
                openapi.IN_PATH,
                description="ID do usuário",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_UUID,
                required=True
            )
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'first_name': openapi.Schema(type=openapi.TYPE_STRING, max_length=150),
                'last_name': openapi.Schema(type=openapi.TYPE_STRING, max_length=150),
                'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'avatar': openapi.Schema(type=openapi.TYPE_FILE),
                'remove_avatar': openapi.Schema(type=openapi.TYPE_BOOLEAN)
            }
        ),
        responses={
            200: openapi.Response(
                description="Usuário atualizado",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                        'username': openapi.Schema(type=openapi.TYPE_STRING),
                        'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
                        'first_name': openapi.Schema(type=openapi.TYPE_STRING),
                        'last_name': openapi.Schema(type=openapi.TYPE_STRING),
                        'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'avatar_url': openapi.Schema(type=openapi.TYPE_STRING, nullable=True)
                    }
                )
            ),
            400: "Dados inválidos",
            401: "Não autorizado",
            403: "Sem permissão",
            404: "Usuário não encontrado",
            500: "Erro interno do servidor"
        },
        tags=['Usuários']
    )
    @audit_log(action='PATCH', module='USERS', table_name='users')
    def partial_update(self, request, pk=None):
        data = {**request.data, 'user_id': str(pk)} if request.data else {'user_id': str(pk)}

        if 'avatar' in data:
            avatar_value = data['avatar']
            if isinstance(avatar_value, list):
                avatar_value = avatar_value[0]
                
            if avatar_value == 'null' or avatar_value == '':
                data['remove_avatar'] = True
                data.pop('avatar')
        elif 'avatar' in request.FILES:
            data['avatar'] = request.FILES['avatar']
    
        validator = UpdateUserValidator(data=data)
        
        if not validator.is_valid():
            return Response(
                validator.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            result = self.domain.update_user(
                requesting_user=request.user,
                user_id=str(pk),
                data=validator.validated_data,
                request=request
            )
            return Response(result)
        except APIException as e:
            error_message = e.detail[0] if isinstance(e.detail, list) else e.detail
            return Response(
                {'detail': str(error_message)},
                status=e.status_code
            )
        except Exception as e:
            return Response(
                {'detail': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    
    @swagger_auto_schema(
        operation_summary="Altera senha do usuário",
        operation_description="Altera a senha de um usuário existente",
        manual_parameters=[
            openapi.Parameter(
                'pk',
                openapi.IN_PATH,
                description="ID do usuário",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_UUID,
                required=True
            )
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['current_password', 'new_password', 'password_confirmation'],
            properties={
                'current_password': openapi.Schema(type=openapi.TYPE_STRING),
                'new_password': openapi.Schema(type=openapi.TYPE_STRING, min_length=8),
                'password_confirmation': openapi.Schema(type=openapi.TYPE_STRING)
            }
        ),
        responses={
            200: openapi.Response(
                description="Senha alterada",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                        'username': openapi.Schema(type=openapi.TYPE_STRING),
                        'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
                        'first_name': openapi.Schema(type=openapi.TYPE_STRING),
                        'last_name': openapi.Schema(type=openapi.TYPE_STRING),
                        'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'avatar_url': openapi.Schema(type=openapi.TYPE_STRING, nullable=True)
                    }
                )
            ),
            400: "Dados inválidos",
            401: "Não autorizado",
            403: "Sem permissão",
            404: "Usuário não encontrado",
            500: "Erro interno do servidor"
        },
        tags=['Usuários']
    )
    @audit_log(action='PATCH', module='USERS', table_name='users')       
    @action(detail=False, methods=['post'], parser_classes=[JSONParser])
    def change_password(self, request, pk:None):
        data = {**request.data, 'user_id': str(pk)} if request.data else {'user_id': str(pk)}
        
        validator = ChangePasswordValidator(data=data)
        
        if not validator.is_valid():
            return Response(
                validator.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = self.domain.change_password(
                requesting_user=request.user,
                user_id= str(pk),
                data=validator.validated_data,
                request=request
            )
            return Response(result)
        except APIException as e:
            error_message = e.detail[0] if isinstance(e.detail, list) else e.detail
            return Response(
                {'detail': str(error_message)},
                status=e.status_code
            )
        except Exception as e:
            return Response(
                {'detail': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    