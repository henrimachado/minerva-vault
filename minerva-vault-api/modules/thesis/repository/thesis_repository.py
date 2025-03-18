from ..models import Thesis
from modules.users.models import User
from django.db import transaction

class ThesisRepository:
    
    def get_thesis_by_id(self, thesis_id: str) -> Thesis:
        return Thesis.objects.select_related(
            'author', 'advisor', 'co_advisor', 'created_by'
        ).get(id=thesis_id)
    
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
            status=status,
            created_by=created_by
        )
        
    def update_thesis(self, thesis: Thesis, data: dict) -> Thesis:
        allowed_fields = [ 
            'title', 'author_id', 'advisor_id', 'co_advisor_id', 'abstract', 
            'keywords', 'defense_date', 'status', 'pdf_file', 
            'pdf_metadata', 'pdf_size', 'pdf_pages'
        ]
         
        for field in allowed_fields:
            if field in data:
                setattr(thesis, field, data[field])
        thesis.save()
        return thesis
