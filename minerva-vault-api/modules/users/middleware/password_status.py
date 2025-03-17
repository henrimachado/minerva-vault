from django.utils import timezone
from datetime import timedelta
from django.conf import settings

class PasswordStatusMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        if (hasattr(request, 'user') and 
            request.user.is_authenticated and 
            hasattr(response, 'data') and 
            isinstance(response.data, dict)):
            
            days_until_expiration = self._calculate_days_until_expiration(request.user)
            
            password_status = {
                'needs_change': days_until_expiration <= 0,
                'days_until_expiration': days_until_expiration,
                'last_change': request.user.last_password_change,
                'urgency': self._get_password_urgency(days_until_expiration)
            }

            response.data = {
                'password_status': password_status,
                'data': response.data
            }

        return response

    def _calculate_days_until_expiration(self, user):
        expiration_date = user.last_password_change + timedelta(days=30)
        remaining = expiration_date - timezone.now()
        return remaining.days

    def _get_password_urgency(self, days_until_expiration: int) -> str:
        if days_until_expiration <= 0:
            return 'EXPIRED'
        elif days_until_expiration <= 5:
            return 'CRITICAL'
        elif days_until_expiration <= 10:
            return 'WARNING'
        return 'OK'