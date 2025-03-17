import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

def user_avatar_path(instance, filename):
    return f'avatars/{instance.id}/{filename}'
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    avatar = models.ImageField(
        upload_to=user_avatar_path,
        null=True,
        blank=True,
        verbose_name='Avatar'
    )
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True)  
    inactivated_at = models.DateTimeField(null=True, blank=True)
    last_password_change = models.DateTimeField(default=timezone.now)
    
    class Meta:
      db_table = 'users'

    def set_password(self, raw_password):
        self.last_password_change = timezone.now()
        super().set_password(raw_password)
    
    def delete_avatar(self):
      if self.avatar:
          self.avatar.delete(save=False) 
          self.avatar = None
          self.save()