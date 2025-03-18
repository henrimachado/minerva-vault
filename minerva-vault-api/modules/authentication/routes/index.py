from rest_framework.routers import DefaultRouter
from ..controller import AuthController

router = DefaultRouter()
router.register('', AuthController, basename='auth')

urlpatterns = router.urls