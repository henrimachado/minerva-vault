from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from ..domain.users_domain import UserDomain
from ..validator.users_validator import UpdateUserValidator, ChangePasswordValidator, CreateUserValidator


class UserController(ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.domain = UserDomain()
        
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def me(self, request):
        result = self.domain.get_user_by_id(request.user.id, request, detail=True)
        return Response(result)
    
    @action(detail=False, methods=['patch'], parser_classes=[MultiPartParser, FormParser, JSONParser])
    def update(self, request, pk=None):
        print("UPDATE - Tipo do pk:", type(pk))
        print("UPDATE - Valor do pk:", pk) 
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
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser, JSONParser])
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