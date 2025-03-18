from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from ..validator import CreateThesisValidator
from ..domain import ThesisDomain

class ThesisController(ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = ThesisDomain()
        
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
        except Exception as e:
            return Response(
                {'detail': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )