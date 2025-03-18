from rest_framework.routers import DefaultRouter
from ..controller import ThesisController

router = DefaultRouter()
router.register('', ThesisController, basename='thesis')

urlpatterns = router.urls