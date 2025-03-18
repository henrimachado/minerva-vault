from ..repository import AuditRepository
from modules.users.models import User

class AuditService:
    def __init__(self):
        self.repository = AuditRepository()
    
    def log_action(
        self, 
        user: User,
        action: str, 
        module: str, 
        table_name: str, 
        record_id: str,
        previous_data: dict = None,
        new_data: dict = None, 
        ip_address: str = None,
        user_agent: str = None,
        status: str = 'SUCCESS',
        error_message: str = None
    ) -> None:
        self.repository.create_log(
            user=user,
            action=action,
            module=module,
            table_name=table_name,
            record_id=record_id,
            previous_data=previous_data,
            new_data=new_data,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
            error_message=error_message
        )