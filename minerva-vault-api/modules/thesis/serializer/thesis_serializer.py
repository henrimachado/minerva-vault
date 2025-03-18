from rest_framework import serializers
from ..models import Thesis
from modules.users.serializer import UserListSerializer

class ThesisSerializer(serializers.ModelSerializer):
    author = UserListSerializer()
    advisor = UserListSerializer()
    co_advisor = UserListSerializer()
    created_by = UserListSerializer()

    class Meta:
        model = Thesis
        fields = [
            'id',
            'title',
            'author',
            'advisor',
            'co_advisor',
            'abstract',
            'keywords',
            'defense_date',
            'status',
            'pdf_file', 
            'pdf_metadata',
            'pdf_size',
            'pdf_pages',
            'pdf_uploaded_at',
            'created_by',
            'created_at',
            'updated_at',
            
        ]