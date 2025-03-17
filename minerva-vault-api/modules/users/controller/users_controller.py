from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import APIException
from ..domain.users_domain import UserDomain
from ..validator.users_validator import UpdateUserValidator, ChangePasswordValidator

class UserController(ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = UserDomain()

    @action(detail=False, methods=['get'])
    def me(self, request):
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
        except APIException as e:
            return Response(
                {'detail': str(e)},
                status=e.status_code
            )
        except Exception as e:
            return Response(
                {'detail': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    @action(detail=False, methods=['post'])
    def change_password(self, request, pk:None):
        data = dict(request.data) if request.data else {}
        data['user_id'] = str(pk)
        
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
                data=request.data
            )
            return Response(result)
        except APIException as e:
            return Response(
                {'detail': str(e)},
                status=e.status_code
            )
        except Exception as e:
            return Response(
                {'detail': 'Erro interno do servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )