from ..repository import ThesisRepository
from modules.users.models import User
from ..models import Thesis
from PyPDF2 import PdfReader

class ThesisService:
    def __init__(self):
        self.repository = ThesisRepository()
    
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