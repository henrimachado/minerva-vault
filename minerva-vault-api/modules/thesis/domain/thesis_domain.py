from ..service import ThesisService
from modules.users.service import UserService
from rest_framework.exceptions import ValidationError, PermissionDenied
from ..serializer import ThesisSerializer, ThesisListSerializer
from modules.users.models import User

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
        
        if 'ADMIN' in user_roles:
            return True
        
        if 'PROFESSOR' in user_roles:
            return thesis.advisor.id == user.id
        
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
            
    def delete_thesis(self, thesis_id: str, user: User) -> None:
        print(user)
        print(thesis_id)
        thesis = self.service.get_thesis_by_id(thesis_id)
        
        user_roles = [role.role.name for role in user.user_roles.all()]
        
        is_admin = 'ADMIN' in user_roles
        is_professor = 'PROFESSOR' in user_roles
        is_student = 'STUDENT' in user_roles
        
        
        if is_admin:
            self.service.delete_thesis(thesis)
            return
        
        if is_professor:
            if thesis.advisor.id != user.id:
                raise PermissionDenied("Professores não podem deletar teses que não são de sua orientação")
            self.service.delete_thesis(thesis)
            return
        
        if is_student:
            if thesis.author.id != user.id:
                raise PermissionDenied("Estudantes não podem deletar teses que não são de sua autoria")
            if thesis.status != 'PENDING':
                raise PermissionDenied("Estudantes não podem deletar teses que não estão pendentes")
            self.service.delete_thesis(thesis)
            return
        
        raise PermissionDenied("Usuário não tem permissão para deletar a tese")
            
    
        