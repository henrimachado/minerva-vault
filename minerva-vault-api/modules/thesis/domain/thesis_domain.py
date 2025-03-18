from ..service import ThesisService
from modules.users.service import UserService
from rest_framework.exceptions import ValidationError
from ..serializer import ThesisSerializer

class ThesisDomain:
    def __init__(self):
        self.service = ThesisService()
        self.user_service = UserService()
        
        
    def _get_thesis_status(self, user_roles):
        roles = [role.role.name for role in user_roles.all()]
        
        if 'STUDENT' in roles:
            return 'PENDING'
        elif 'PROFESSOR' in roles or 'ADMIN' in roles:
            return 'APPROVED'
        return ValidationError("Usuário não tem permissão para criar tese")
    
    def _validate_thesis_author(self, requesting_user, author_id: str):
        user_roles = [role.role.name for role in requesting_user.user_roles.all()]
        
        if 'STUDENT' in user_roles and str(requesting_user.id) != author_id:
            raise ValidationError("Usuário não tem permissão para criar tese em nome de outro estudante")
        
        
    def create_thesis(self, data: dict, user, request=None) -> dict:
        
        author = self.user_service.get_user_by_id(data['author_id'])
        
        self._validate_thesis_author(user, data['author_id'])
        
        if not any(role.role.name == 'STUDENT' for role in author.user_roles.all()):
            raise ValidationError("A autoria da tese deve ser de um estudante")
        
        advisor = self.user_service.get_user_by_id(data['advisor_id'])
        if not any(role.role.name == 'PROFESSOR' for role in advisor.user_roles.all()):
            raise ValidationError("A orientação da tese deve ser de um professor")
        
        if data.get('co_advisor_id'):
            co_advisor = self.user_service.get_user_by_id(data['co_advisor_id'])
            if not any(role.role.name == 'PROFESSOR' for role in co_advisor.user_roles.all()):
                raise ValidationError("A coorientação da tese deve ser de um professor")
        
        status = self._get_thesis_status(user.user_roles)
        thesis = self.service.create_thesis(data, user, status)
        
        serializer = ThesisSerializer(
            thesis,
            context={'request': request} if request else {}
        )
        return serializer.data
    
    
        