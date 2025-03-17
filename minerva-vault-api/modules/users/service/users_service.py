from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound
from ..repository.users_repository import UserRepository
from ..models.user import User

class UserService:
    def __init__(self):
        self.repository = UserRepository()

    def get_user_by_id(self, user_id: str) -> User:
        try:
            return self.repository.get_user_by_id(user_id)
        except ObjectDoesNotExist:
            raise NotFound("Usuário não encontrado")
        
    def update_user(self, user: User, data: dict) -> User:
        return self.repository.update_user(user, data)
    
    def check_password(self, user: User, password: str) -> bool:
        return user.check_password(password)
    
    def update_password(self, user: User, new_password: str) -> User:
        return self.repository.update_password(user, new_password)
