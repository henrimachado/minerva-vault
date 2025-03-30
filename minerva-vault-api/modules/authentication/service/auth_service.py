from rest_framework.exceptions import AuthenticationFailed
from ..repository.auth_repository import AuthRepository
from modules.users.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
class AuthService:
    def __init__(self):
        self.repository = AuthRepository()

    def authenticate_user(self, username: str, password: str) -> User:
        user = self.repository.authenticate_user(username, password)
        
        if not user or not user.is_active:
            raise AuthenticationFailed('Credenciais inválidas. Em caso de dúvidas, busque o suporte.')
            
        return user
    
    # def refresh_token(self, refresh_token: str) -> dict:
    #     try:
    #         token = RefreshToken(refresh_token)
    #         return {
    #             'access': str(token.access_token)
    #         }
    #     except Exception as e:
    #         raise AuthenticationFailed('Token inválido ou expirado')