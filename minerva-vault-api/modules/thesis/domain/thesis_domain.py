from ..service import ThesisService
from modules.users.service import UserService
from rest_framework.exceptions import ValidationError
from ..serializer import ThesisSerializer, ThesisListSerializer

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

        if 'STUDENT' in user_roles and str(requesting_user.id) != str(author_id):
            raise ValidationError("Usuário não tem permissão para criar tese em nome de outro estudante")
        
    def get_thesis_by_id(self, thesis_id: str, request=None) -> dict:
        thesis = self.service.get_thesis_by_id(thesis_id)
        serializer = ThesisSerializer(
            thesis,
            context={'request': request} if request else {}
        )
        return serializer.data
    
    def list_my_thesis(self, user, request=None) -> dict:
        is_student = any(role.role.name == 'STUDENT' for role in user.user_roles.all())
        
        page = int(request.query_params.get('page', 1)) if request else 1
        result = self.service.list_my_thesis(user, is_student, page)
        
        serializer = ThesisListSerializer(
            result['items'],
            many=True,
            context={'request': request} if request else {}
        )
        
        return {
            'items': serializer.data,
            'total': result['total'],
            'pages': result['pages'],
            'current_page': result['current_page']
        }
        
    def list_thesis(self, filters: dict = None, request=None) -> dict:
        page = filters.pop('page', 1) if filters else 1
        
        result = self.service.list_thesis(filters, page)

        
        serializer = ThesisListSerializer(
            result['items'],
            many=True,
            context={'request': request} if request else {}
        )

        return {
            'items': serializer.data,
            'total': result['total'],
            'pages': result['pages'],
            'current_page': result['current_page']
        }
        
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
    
    def _can_update_thesis(self, user, thesis) -> bool:
        user_roles = [role.role.name for role in user.user_roles.all()]
        
        if any(role in ['ADMIN', 'PROFESSOR'] for role in user_roles):
            return True
        
        if 'STUDENT' in user_roles:
            return str(thesis.author.id) == str(user.id) and thesis.status == 'PENDING'
        
        return False
    
    def _validate_update_data(self, user, data: dict) -> None:
        user_roles = [role.role.name for role in user.user_roles.all()]
        
        if ('STUDENT' in user_roles and not any(role in ['ADMIN', 'PROFESSOR'] for role in user_roles)
        and 'status' in data):
            raise ValidationError("Usuário não tem permissão para alterar o status da tese")
        
    def update_thesis(self, thesis_id: str, data: dict, user, request= None) -> dict:
        thesis = self.service.get_thesis_by_id(thesis_id)
        
        if not self._can_update_thesis(user, thesis):
            raise ValidationError("Usuário não tem permissão para alterar a tese")
        
        self._validate_update_data(user, data)
        
        thesis = self.service.update_thesis(thesis, data)
         
        serializer = ThesisSerializer(
            thesis,
            context={'request': request} if request else {}
        )
        return serializer.data
            
        
    
        