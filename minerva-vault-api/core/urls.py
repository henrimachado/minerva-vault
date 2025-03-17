from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('modules.authentication.routes')),
    path('api/users/', include('modules.users.routes')),
    
]