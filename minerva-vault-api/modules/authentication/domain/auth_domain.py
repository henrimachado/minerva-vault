from rest_framework_simplejwt.tokens import RefreshToken
from ..service.auth_service import AuthService
from rest_framework.exceptions import ValidationError
class AuthDomain:
    def __init__(self):
        self.service = AuthService()

    def login(self, data: dict) -> dict:
        user = self.service.authenticate_user(
            username=data['username'],
            password=data['password']
        )
        
        tokens = RefreshToken.for_user(user)
        
        return {
            'access': str(tokens.access_token),
            'refresh': str(tokens),
            'user': {
                'id': str(user.id), 
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff
            }
        }
    
    # def refresh_token(self, data: dict) -> dict:
    #     refresh_token = data.get('refresh')
    #     if not refresh_token:
    #         raise ValidationError('Token de atualização não fornecido')
    #     return self.service.refresh_token(refresh_token)