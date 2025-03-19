from django.urls import path
from rest_framework.routers import DefaultRouter
from ..controller import UserController, RoleController

router = DefaultRouter()

router.register('roles', RoleController, basename='roles')  
router.register('', UserController, basename='users')       

urlpatterns = router.urls