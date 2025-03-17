from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ..domain.users_domain import UserDomain
from ..validator.users_validator import UpdateUserValidator

class UserController(ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = UserDomain()

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Retorna os dados do usuário logado com suas roles
        """
        result = self.domain.get_user_by_id(request.user.id)
        return Response(result)
    
    @action(detail=False, methods=['patch'])
    def update(self, request, pk=None):
        
        data = dict(request.data) if request.data else {}
        data['user_id'] = str(pk)
        
        print(data)
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
                data=request.data
            )
            return Response(result)
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )