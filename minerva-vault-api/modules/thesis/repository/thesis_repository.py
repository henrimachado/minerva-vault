from ..models import Thesis
from modules.users.models import User
from django.db import transaction
from django.core.paginator import Paginator
from django.db.models import Q
import os

class ThesisRepository:
    
    ORDERING_MAPPING = {
        'BYAUTHORDESC': '-author__first_name',
        'BYAUTHORASC': 'author__first_name',
        'BYADVISERDESC': '-advisor__first_name',
        'BYADVISERASC': 'advisor__first_name',
        'BYDEFENSEDATEDESC': '-defense_date',
        'BYDEFENSEDATEASC': 'defense_date',
        'BYTITLEASC': 'title',
        'BYTITLEDESC': '-title'
    }
    
    def get_thesis_by_id(self, thesis_id: str) -> Thesis:
        return Thesis.objects.select_related(
            'author', 'advisor', 'co_advisor', 'created_by'
        ).get(id=thesis_id)
        
    def list_my_thesis(self, user: User, is_student: bool, page: int = 1) -> dict:
        query = Thesis.objects.select_related(
            'author', 'advisor', 'co_advisor'
        )
        
        if is_student:
            query= query.filter(author=user)
        else:
            query = query.filter(Q(advisor=user) | Q(co_advisor=user))
            
        query = query.order_by('-created_at')
            
        paginator = Paginator(query, 10)
        page_obj = paginator.get_page(page)
        
        return {
            'items': list(page_obj),
            'total': paginator.count,
            'pages': paginator.num_pages,
            'current_page': page
        }
        
    def list_thesis(self, filters: dict = None, page: int = 1) -> dict:
        query = Thesis.objects.filter(status = 'APPROVED').select_related(
            'author', 'advisor', 'co_advisor'
        )
        
        
        if filters:
            if filters.get('title'):
                query = query.filter(title__icontains=filters['title'])
            
            if filters.get('author_name'):
                query = query.filter(
                    Q(author__first_name__icontains=filters['author_name']) |
                    Q(author__last_name__icontains=filters['author_name'])
                )
                
            if filters.get('advisor_name'):
                query = query.filter(
                    Q(advisor__first_name__icontains=filters['advisor_name']) |
                    Q(advisor__last_name__icontains=filters['advisor_name'])
                )
                
            if filters.get('co_advisor_name'):
                query = query.filter(
                    Q(co_advisor__first_name__icontains=filters['co_advisor_name']) |
                    Q(co_advisor__last_name__icontains=filters['co_advisor_name'])
                )
            
            if filters.get('defense_date'):
                query = query.filter(defense_date=filters['defense_date'])
            
            if filters.get('context'):
                context = filters['context']
                query = query.filter(
                    Q(title__icontains=context) |
                    Q(abstract__icontains=context) |
                    Q(keywords__icontains=context)
                )
            
            if filters.get('order_by'):
                order_by = self.ORDERING_MAPPING[filters['order_by']]
                if order_by:
                    query = query.order_by(order_by)
                    
                    
        paginator = Paginator(query, 10)
        page_obj = paginator.get_page(page)
        
        return {
            'items': list(page_obj),
            'total': paginator.count,
            'pages': paginator.num_pages,
            'current_page': page
        }
    
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

    def delete_thesis(self, thesis: Thesis):
        thesis.delete()
