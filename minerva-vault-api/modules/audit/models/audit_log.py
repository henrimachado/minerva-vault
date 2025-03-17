import uuid
from django.db import models
from modules.users.models import User

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    action = models.CharField(
        max_length=30,
        choices=[
            ('CREATE', 'Create'),
            ('UPDATE', 'Update'),
            ('DELETE', 'Delete'),
            ('VIEW', 'View'),
            ('DOWNLOAD', 'Download'),  
            ('UPLOAD', 'Upload'),      
            ('LOGIN', 'Login'),        
            ('LOGOUT', 'Logout'),      
            ('PASSWORD_CHANGE', 'Password Change'),
            ('PERMISSION_CHANGE', 'Permission Change')
    ]
    )
    
    module = models.CharField(
        max_length=30,
        choices=[
            ('THESIS', 'Thesis'),
            ('USER', 'User'),
            ('AUTH', 'Authentication'),
        ]
    )
    
    table_name = models.CharField(max_length=50)
    record_id = models.UUIDField()
    
    previous_data = models.JSONField(null=True)
    new_data = models.JSONField(null=True)
    
    ip_address = models.CharField(max_length=45) 
    user_agent = models.TextField(null=True) 
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('SUCCESS', 'Success'),
            ('FAILURE', 'Failure'),
            ('ERROR', 'Error')
        ],
        default='SUCCESS'
    )
    error_message = models.TextField(null=True) 
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_log'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['action']),
            models.Index(fields=['module']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['table_name', 'record_id'])
        ]

    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.module} - {self.timestamp}"