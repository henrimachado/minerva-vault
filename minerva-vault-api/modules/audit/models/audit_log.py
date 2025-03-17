import uuid
from django.db import models
from modules.users.models import User

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    action = models.CharField(
        max_length=20,
        choices=[
            ('CREATE', 'Create'),
            ('UPDATE', 'Update'),
            ('DELETE', 'Delete'),
            ('VIEW', 'View')
        ]
    )
    table_name = models.CharField(max_length=50)
    record_id = models.UUIDField()
    previous_data = models.JSONField(null=True)
    new_data = models.JSONField(null=True)
    ip_address = models.CharField(max_length=45) 
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_log'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.table_name}"