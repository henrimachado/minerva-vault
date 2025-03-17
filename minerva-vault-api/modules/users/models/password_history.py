from django.conf import settings
from django.db import models 

class PasswordHistory(models.Model):
    user = models.ForeignKey(
            settings.AUTH_USER_MODEL, 
            on_delete=models.CASCADE, 
            related_name='password_history'
    )
    
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'password_history'
        ordering = ['-created_at']
    