from rest_framework.exceptions import AuthenticationFailed
from ..repository.auth_repository import AuthRepository
from modules.users.models import User

class AuthService:
    def __init__(self):
        self.repository = AuthRepository()

    def authenticate_user(self, username: str, password: str) -> User:
        user = self.repository.authenticate_user(username, password)
        
        if not user or not user.is_active:
            raise AuthenticationFailed('Credenciais inválidas')
            
        return user