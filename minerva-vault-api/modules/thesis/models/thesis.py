import os
import uuid
from django.db import models
from modules.users.models import User

class Thesis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    author = models.ForeignKey(
        User, 
        on_delete=models.PROTECT,
        related_name='authored_theses'
    )
    advisor = models.ForeignKey(
        User, 
        on_delete=models.PROTECT,
        related_name='advised_theses'
    )
    co_advisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='co_advised_theses'
    )
    abstract = models.TextField()
    keywords = models.CharField(max_length=255)
    defense_date = models.DateField()
    pdf_file = models.FileField(upload_to='theses/')
    pdf_metadata = models.JSONField(null=True) 
    pdf_size = models.IntegerField(null=True)   
    pdf_pages = models.IntegerField(null=True)  
    pdf_uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected')
        ],
        default='PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_theses'
    )

    class Meta:
        db_table = 'thesis'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['author']),
            models.Index(fields=['defense_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return self.title
    
    def delete_pdf(self):
        if self.pdf_file:
            try:
                file_path = self.pdf_file.path
                directory = os.path.dirname(file_path)
                
                self.pdf_file.delete(save=False)
                self.pdf_file
                self.save(update_fields=['pdf_file'])
                
                if os.path.exists(directory) and not os.listdir(directory):
                        os.rmdir(directory)
            except Exception as e:
                print(f"Erro ao deletar arquivo PDF: {str(e)}")
                raise
            
    def delete(self, *args, **kwargs):
        self.delete_pdf()
        super().delete(*args, **kwargs)