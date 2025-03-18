from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import APIException
from ..validator import CreateThesisValidator, UpdateThesisValidator, GetThesisValidator, ListThesisValidator
from ..domain import ThesisDomain

class ThesisController(ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = ThesisDomain()
        
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