from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from ..validator.auth_validator import LoginValidator
from ..domain.auth_domain import AuthDomain

class AuthController(ViewSet):
    authentication_classes = []  
    permission_classes = []      

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = AuthDomain()

    def login(self, request):
        validator = LoginValidator(data=request.data)
        if not validator.is_valid():
            return Response(
                validator.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )

        result = self.domain.login(validator.validated_data)
        return Response(result, status=status.HTTP_200_OK)
