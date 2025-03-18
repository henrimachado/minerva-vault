from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import APIException
from ..validator import CreateThesisValidator, UpdateThesisValidator, GetThesisValidator, ListThesisValidator, DeleteThesisValidator
from ..domain import ThesisDomain
from modules.audit.decorator import audit_log
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class ThesisController(ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = ThesisDomain()
    
    @swagger_auto_schema(
        operation_summary="Obtém uma tese específica",
        operation_description="Retorna os detalhes de uma tese específica pelo ID",
        manual_parameters=[
            openapi.Parameter(
                'pk',
                openapi.IN_PATH,
                description="ID da tese (UUID)",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_UUID,
                required=True
            )
        ],
        responses={
            200: openapi.Response(
                description="Detalhes da tese",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                        'title': openapi.Schema(type=openapi.TYPE_STRING),
                        'author': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                                'name': openapi.Schema(type=openapi.TYPE_STRING)
                            }
                        ),
                        'advisor': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                                'name': openapi.Schema(type=openapi.TYPE_STRING)
                            }
                        ),
                        'co_advisor': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                                'name': openapi.Schema(type=openapi.TYPE_STRING)
                            },
                            nullable=True
                        ),
                        'abstract': openapi.Schema(type=openapi.TYPE_STRING),
                        'keywords': openapi.Schema(type=openapi.TYPE_STRING),
                        'defense_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE),
                        'status': openapi.Schema(type=openapi.TYPE_STRING, enum=['PENDING', 'APPROVED', 'REJECTED']),
                        'pdf_file': openapi.Schema(type=openapi.TYPE_STRING),
                        'pdf_metadata': openapi.Schema(type=openapi.TYPE_OBJECT),
                        'pdf_size': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'pdf_pages': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'created_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
                        'updated_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME)
                    }
                )
            ),
            400: "Requisição inválida",
            401: "Não autorizado",
            404: "Tese não encontrada",
            500: "Erro interno do servidor"
        },
        tags=['Teses']
    )
    @audit_log(action='GET', module='THESIS', table_name='thesis')
    @action(detail=True, methods=['get'])
    def get(self, request, pk:None):
        validator = GetThesisValidator(data={'thesis_id': str(pk)})  
            
        if not validator.is_valid():
            return Response(
                validator.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            result = self.domain.get_thesis_by_id(
                thesis_id=validator.validated_data['thesis_id'],
                request=request
            )
            return Response(result, status=status.HTTP_200_OK)
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
        operation_summary="Lista as teses do usuário autenticado",
        operation_description="Retorna todas as teses associadas ao usuário logado",
        manual_parameters=[
            openapi.Parameter(
                'page',
                openapi.IN_QUERY,
                description="Número da página",
                type=openapi.TYPE_INTEGER,
                default=1
            )
        ],
        responses={
            200: openapi.Response(
                description="Lista de teses do usuário",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'items': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                                    'title': openapi.Schema(type=openapi.TYPE_STRING),
                                    'author': openapi.Schema(
                                        type=openapi.TYPE_OBJECT,
                                        properties={
                                            'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                                            'name': openapi.Schema(type=openapi.TYPE_STRING)
                                        }
                                    ),
                                    'defense_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE),
                                    'status': openapi.Schema(type=openapi.TYPE_STRING, enum=['PENDING', 'APPROVED', 'REJECTED'])
                                }
                            )
                        ),
                        'total': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'pages': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'current_page': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            ),
            401: "Não autorizado",
            500: "Erro interno do servidor"
        },
        tags=['Teses']
    )
    @audit_log(action='GET', module='THESIS', table_name='thesis')    
    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            result = self.domain.list_my_thesis(
                user=request.user,
                request=request
            )
            return Response(result, status=status.HTTP_200_OK)
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
        operation_summary="Lista todas as teses",
        operation_description="Retorna uma lista paginada de teses com filtros opcionais",
        manual_parameters=[
            openapi.Parameter('title', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Filtrar por título"),
            openapi.Parameter('author_name', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Filtrar por nome do autor"),
            openapi.Parameter('advisor_name', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Filtrar por nome do orientador"),
            openapi.Parameter('co_advisor_name', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Filtrar por nome do coorientador"),
            openapi.Parameter('defense_date', openapi.IN_QUERY, type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Filtrar por data de defesa"),
            openapi.Parameter('context', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Busca por contexto em título, resumo e palavras-chave"),
            openapi.Parameter('order_by', openapi.IN_QUERY, type=openapi.TYPE_STRING, 
                            enum=['BYAUTHORDESC', 'BYAUTHORASC', 'BYADVISERDESC', 'BYADVISERASC', 
                                'BYDEFENSEDATEDESC', 'BYDEFENSEDATEASC', 'BYTITLEASC', 'BYTITLEDESC'],
                            description="Ordenação dos resultados"),
            openapi.Parameter('page', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, default=1, description="Número da página")
        ],
        responses={
            200: openapi.Response(
                description="Lista de teses",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'items': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                                    'title': openapi.Schema(type=openapi.TYPE_STRING),
                                    'author': openapi.Schema(
                                        type=openapi.TYPE_OBJECT,
                                        properties={
                                            'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                                            'name': openapi.Schema(type=openapi.TYPE_STRING)
                                        }
                                    ),
                                    'defense_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE),
                                    'status': openapi.Schema(type=openapi.TYPE_STRING, enum=['PENDING', 'APPROVED', 'REJECTED'])
                                }
                            )
                        ),
                        'total': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'pages': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'current_page': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            ),
            400: "Parâmetros inválidos",
            401: "Não autorizado",
            500: "Erro interno do servidor"
        },
        tags=['Teses']
    )
    @audit_log(action='GET', module='THESIS', table_name='thesis')
    @action(detail=False, methods=['get'])
    def list(self, request):
        validator = ListThesisValidator(data=request.query_params)
        if not validator.is_valid():
            return Response(
                validator.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            result = self.domain.list_thesis(
                filters=validator.validated_data,
                request=request
            )
            return Response(result, status=status.HTTP_200_OK)
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
        operation_summary="Cria uma nova tese",
        operation_description="Cria uma nova tese com os dados fornecidos",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['title', 'author_id', 'advisor_id', 'abstract', 'keywords', 'defense_date', 'pdf_file'],
            properties={
                'title': openapi.Schema(type=openapi.TYPE_STRING, description="Título da tese"),
                'author_id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID, description="ID do autor"),
                'advisor_id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID, description="ID do orientador"),
                'co_advisor_id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID, description="ID do coorientador (opcional)"),
                'abstract': openapi.Schema(type=openapi.TYPE_STRING, description="Resumo da tese"),
                'keywords': openapi.Schema(type=openapi.TYPE_STRING, description="Palavras-chave"),
                'defense_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Data da defesa"),
                'pdf_file': openapi.Schema(type=openapi.TYPE_FILE, description="Arquivo PDF da tese")
            }
        ),
        responses={
            201: openapi.Response(
                description="Tese criada",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                        'title': openapi.Schema(type=openapi.TYPE_STRING),
                        'author': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                                'name': openapi.Schema(type=openapi.TYPE_STRING)
                            }
                        ),
                        'defense_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE),
                        'status': openapi.Schema(type=openapi.TYPE_STRING, enum=['PENDING', 'APPROVED', 'REJECTED'])
                    }
                )
            ),
            400: "Dados inválidos",
            401: "Não autorizado",
            500: "Erro interno do servidor"
            },
        tags=['Teses']
    )
    @audit_log(action='POST', module='THESIS', table_name='thesis')   
    @action(detail=False, methods=['post'])
    def create(self, request):
        try:
            
            validator = CreateThesisValidator(data=request.data)
            if not validator.is_valid():
                return Response(
                    validator.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
            result = self.domain.create_thesis(
                data=validator.validated_data,
                user=request.user,
                request=request
            )
            return Response(result, status=status.HTTP_201_CREATED)
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
        operation_summary="Atualiza uma tese",
        operation_description="Atualiza os dados de uma tese existente",
        manual_parameters=[
            openapi.Parameter(
                'pk',
                openapi.IN_PATH,
                description="ID da tese (UUID)",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_UUID,
                required=True
            )
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'title': openapi.Schema(type=openapi.TYPE_STRING, description="Título da tese"),
                'abstract': openapi.Schema(type=openapi.TYPE_STRING, description="Resumo da tese"),
                'keywords': openapi.Schema(type=openapi.TYPE_STRING, description="Palavras-chave"),
                'defense_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Data da defesa"),
                'pdf_file': openapi.Schema(type=openapi.TYPE_FILE, description="Arquivo PDF da tese"),
                'status': openapi.Schema(type=openapi.TYPE_STRING, enum=['PENDING', 'APPROVED', 'REJECTED'], description="Status da tese")
            }
        ),
        responses={
            200: openapi.Response(
                description="Tese atualizada",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                        'title': openapi.Schema(type=openapi.TYPE_STRING),
                        'author': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_UUID),
                                'name': openapi.Schema(type=openapi.TYPE_STRING)
                            }
                        ),
                        'defense_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE),
                        'status': openapi.Schema(type=openapi.TYPE_STRING, enum=['PENDING', 'APPROVED', 'REJECTED'])
                    }
                )
            ),
            400: "Dados inválidos",
            401: "Não autorizado",
            404: "Tese não encontrada",
            500: "Erro interno do servidor"
        },
        tags=['Teses']
    )
    @audit_log(action='PATCH', module='THESIS', table_name='thesis')       
    @action(detail=True, methods=['patch'])
    def update(self, request, pk:None):
        data = dict(request.data)
        for key in data:
            if isinstance(data[key], list):
                data[key] = data[key][0]

        data['thesis_id'] = str(pk)
        
        validator = UpdateThesisValidator(data=data)
        if not validator.is_valid():
            return Response(
                validator.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            result = self.domain.update_thesis(
                thesis_id=pk,
                data=validator.validated_data,
                user=request.user,
                request=request
            )
            
            return Response(result, status=status.HTTP_200_OK)
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
        operation_summary="Remove uma tese",
        operation_description="Remove uma tese existente",
        manual_parameters=[
            openapi.Parameter(
                'pk',
                openapi.IN_PATH,
                description="ID da tese (UUID)",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_UUID,
                required=True
            )
        ],
        responses={
            204: "Tese removida com sucesso",
            400: "ID inválido",
            401: "Não autorizado",
            403: "Sem permissão para remover a tese",
            404: "Tese não encontrada",
            500: "Erro interno do servidor"
        },
        tags=['Teses']
    )
    @audit_log(action='DELETE', module='THESIS', table_name='thesis')       
    @action(detail=True, methods=['delete'])
    def delete(self, request, pk:None):
        try:
            validator = DeleteThesisValidator(data={'thesis_id': str(pk)})
            if not validator.is_valid():
                return Response(
                    validator.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
            self.domain.delete_thesis(
                thesis_id=pk,
                user=request.user,
            )
            return Response(status=status.HTTP_204_NO_CONTENT)
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