import uuid
from django.db import models
from modules.users.models import User

class Thesis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
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

    def __str__(self):
        return self.title