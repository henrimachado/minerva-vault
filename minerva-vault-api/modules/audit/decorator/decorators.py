from functools import wraps
from ..service import AuditService
import uuid
from datetime import datetime
import json
from django.contrib.auth.models import AnonymousUser


def serialize_data(data):
    if data is None:
        return None
    if isinstance(data, dict):
        return {k: serialize_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [serialize_data(item) for item in data]
    elif isinstance(data, datetime):
        return data.isoformat()
    elif isinstance(data, uuid.UUID):
        return str(data)
    return data

def audit_log(action: str, module: str, table_name: str):
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            audit_service = AuditService()
            
            pre_operation_user = request.user if not isinstance(request.user, AnonymousUser) else None
            
            try:
                response = func(self, request, *args, **kwargs)
                
                user = None
                if module == 'AUTH':
                    if action == 'LOGIN':
                        if hasattr(response, 'data') and 'user' in response.data:
                            from modules.users.models import User
                            user = User.objects.get(id=response.data['user']['id'])
                    elif action == 'LOGOUT':
                        user = pre_operation_user
                else:
                    user = request.user if not isinstance(request.user, AnonymousUser) else None
                    
                if user:
                    record_id = None
                    if 'pk' in kwargs:
                        record_id = kwargs['pk']
                    elif hasattr(response, 'data') and isinstance(response.data, dict):
                        record_id = response.data.get('id')
                    if not record_id:
                        record_id = str(user.id)
                        
                    response_data = serialize_data(
                        response.data if hasattr(response, 'data') else None
                    )
                    
                    previous_data = serialize_data(
                        getattr(request, '_audit_previous_data', None)
                    )
                    
                    audit_service.log_action(
                        user=user,
                        action=action,
                        module=module,
                        table_name=table_name,
                        record_id=record_id,
                        previous_data=previous_data,
                        new_data=response_data,
                        ip_address=request.META.get('REMOTE_ADDR'),
                        user_agent=request.META.get('HTTP_USER_AGENT'),
                        status='SUCCESS'
                    )
                
                return response

            except Exception as e:
                if pre_operation_user or action == 'LOGIN':
                    audit_service.log_action(
                        user=pre_operation_user if pre_operation_user else request.user,
                        action=action,
                        module=module,
                        table_name=table_name,
                        record_id=str(uuid.uuid4()),
                        ip_address=request.META.get('REMOTE_ADDR'),
                        user_agent=request.META.get('HTTP_USER_AGENT'),
                        status='ERROR',
                        error_message=str(e)
                    )
                raise
        return wrapper
    return decorator