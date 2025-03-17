from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound, PermissionDenied
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
