from rest_framework.routers import DefaultRouter
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from ..controller import AuthController

router = DefaultRouter()
router.register('', AuthController, basename='auth')

urlpatterns = router.urls + [
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]