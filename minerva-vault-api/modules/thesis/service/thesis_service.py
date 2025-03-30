from PyPDF2 import PdfReader
from rest_framework.exceptions import NotFound
from ..models import Thesis
from ..repository import ThesisRepository
from modules.users.models import User

class ThesisService:
    def __init__(self):
        self.repository = ThesisRepository()
        
    def get_thesis_by_id(self, thesis_id: str) -> Thesis:
        try:
            return self.repository.get_thesis_by_id(thesis_id)
        except Thesis.DoesNotExist:
            raise NotFound("Tese não encontrada")
        
    def list_my_thesis(self, user: User, is_student: bool, is_professor: bool, orientation: str = None, filters: dict = None, page: int = 1) -> dict:
        return self.repository.list_my_thesis(user, is_student, is_professor, orientation, filters, page)
        
    def list_thesis(self, filters:dict = None, page: int = 1) -> dict:
        return self.repository.list_thesis(filters, page)
    
    def extract_pdf_metadata(self, pdf_file) -> dict:
        reader = PdfReader(pdf_file)
        return {
            'pages': len(reader.pages),
            'size': pdf_file.size,
            'info': reader.metadata
        }
        
    def create_thesis(self, data: dict, created_by: User, status: str) -> Thesis:
        pdf_metadata = self.extract_pdf_metadata(data['pdf_file'])
        data['pdf_metadata'] = pdf_metadata
        data['pdf_size'] = pdf_metadata['size']
        data['pdf_pages'] = pdf_metadata['pages']
        return self.repository.create_thesis(data, created_by, status)
    
    def update_thesis(self, thesis: Thesis, data:dict) -> Thesis:
        if 'pdf_file' in data:
            pdf_metadata = self.extract_pdf_metadata(data['pdf_file'])
            data['pdf_metadata'] = pdf_metadata
            data['pdf_size'] = pdf_metadata['size']
            data['pdf_pages'] = pdf_metadata['pages']
        return self.repository.update_thesis(thesis, data)
    
    def delete_thesis(self, thesis: Thesis):
        return self.repository.delete_thesis(thesis)