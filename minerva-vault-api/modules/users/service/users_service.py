from django.contrib.auth.hashers import check_password, make_password
from django.conf import settings
from rest_framework.exceptions import NotFound
from ..repository.users_repository import UserRepository
from ..models import User, PasswordHistory

class UserService:
    def __init__(self):
        self.repository = UserRepository()

    def get_user_by_id(self, user_id: str) -> User:
        try:
            return self.repository.get_user_by_id(user_id)
        except User.DoesNotExist():
            raise NotFound("Usuário não encontrado")
            
    def check_password(self, user: User, password: str) -> bool:
        return user.check_password(password)
    
    def password_in_history(self, user: User, new_password: str) -> bool:
        history = PasswordHistory.objects.filter(user=user)
        
        if not history.exists():
            return False
        
        limit = getattr(settings, 'PASSWORD_HISTORY_LIMIT', 5)
        for entry in history[:limit]:
            if check_password(new_password, entry.password_hash):
                return True
            
        return False
    
    def add_to_password_history(self, user: User, password: str) -> None:
        PasswordHistory.objects.create(
            user=user,
            password_hash=make_password(password)
        )
    
    def limit_password_history(self, user: User):
        limit = getattr(settings, 'PASSWORD_HISTORY_LIMIT', 5)
        history = PasswordHistory.objects.filter(user=user)
        
        if history.count() > limit:
            to_delete = history[:limit]
            PasswordHistory.objects.filter(
                id__in=[h.id for h in to_delete]
            ).delete()
            
    def update_user(self, user: User, data: dict) -> User:
        return self.repository.update_user(user, data)

    def update_password(self, user: User, new_password: str) -> User:
        return self.repository.update_password(user, new_password)

    def create_user(self, data: dict) -> User:
        return self.repository.create_user(data)