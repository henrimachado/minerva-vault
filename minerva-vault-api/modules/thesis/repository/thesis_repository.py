from ..models import Thesis
from modules.users.models import User
from django.db import transaction

class ThesisRepository:
    @transaction.atomic
    def create_thesis(self, data: dict, created_by: User, status: str) -> Thesis:
        return Thesis.objects.create(
            title=data['title'],
            author_id=data['author_id'],
            advisor_id=data['advisor_id'],
            co_advisor_id=data.get('co_advisor_id'),
            abstract=data['abstract'],
            keywords=data['keywords'],
            defense_date=data['defense_date'],
            pdf_file=data['pdf_file'],
            pdf_metadata=data.get('pdf_metadata'),
            pdf_size=data.get('pdf_size'),
            pdf_pages=data.get('pdf_pages'),
            created_by=created_by
        )
