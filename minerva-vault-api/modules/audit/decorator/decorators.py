import uuid
from django.core.files import File
from django.core.serializers.json import DjangoJSONEncoder
from functools import wraps
from datetime import datetime

class AuditJSONEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, uuid.UUID):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, File):
            return str(obj.name)
        return super().default(obj)

def sanitize_data(data):
    if data is None:
        return None
    
    if isinstance(data, dict):
        sensitive_fields = {'password', 'current_password', 'new_password', 'password_confirmation'}
        return {
            key: sanitize_data(value)
            for key, value in data.items()
            if not key.startswith('_') and key not in sensitive_fields
        }
    
    if isinstance(data, (list, tuple)):
        return [sanitize_data(item) for item in data]
    
    if isinstance(data, (uuid.UUID, datetime, File)):
        return str(data)
    
    return data

def audit_log(action, module, table_name):
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            try:
                response = func(self, request, *args, **kwargs)

                try:
                    user = request.user if request.user.is_authenticated else None
                    
                    if action == 'LOGIN' and response.status_code in [200, 201]:
                        if hasattr(response, 'data') and 'user' in response.data:
                            from modules.users.models import User
                            user = User.objects.get(id=response.data['user']['id'])

                    if not user and action != 'LOGIN':
                        return response

                    new_data = None
                    if hasattr(response, 'data'):
                        new_data = sanitize_data(response.data)

                    if action == 'LOGIN':
                        record_id = str(user.id) if user else str(uuid.uuid4())
                    else:
                        record_id = kwargs.get('pk')
                        if not record_id and new_data and isinstance(new_data, dict):
                            record_id = new_data.get('id')
                        if not record_id:
                            record_id = str(uuid.uuid4())

                    if user:
                        from ..models import AuditLog
                        AuditLog.objects.create(
                            user=user,
                            action=action,
                            module=module,
                            table_name=table_name,
                            record_id=record_id,
                            previous_data=getattr(request, '_audit_previous_data', None),
                            new_data=new_data,
                            ip_address=request.META.get('REMOTE_ADDR', ''),
                            user_agent=request.META.get('HTTP_USER_AGENT', ''),
                            status='SUCCESS'
                        )

                except Exception as audit_error:
                    print(f"Audit log error: {str(audit_error)}")

                return response

            except Exception as e:
                try:
                    user = request.user if request.user.is_authenticated else None
                    
                    if user:
                        from ..models import AuditLog
                        AuditLog.objects.create(
                            user=user,
                            action=action,
                            module=module,
                            table_name=table_name,
                            record_id=str(kwargs.get('pk', uuid.uuid4())),
                            ip_address=request.META.get('REMOTE_ADDR', ''),
                            user_agent=request.META.get('HTTP_USER_AGENT', ''),
                            status='ERROR',
                            error_message=str(e)
                        )
                except Exception as audit_error:
                    print(f"Audit log error: {str(audit_error)}")
                
                raise

        return wrapper
    return decorator