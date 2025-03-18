from ..models import AuditLog

class AuditRepository:
    def create_log(self, **data) -> AuditLog:
        return AuditLog.objects.create(**data)