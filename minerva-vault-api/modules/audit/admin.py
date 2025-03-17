from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'table_name', 'timestamp')
    list_filter = ('action', 'table_name')
    search_fields = ('user__username', 'table_name', 'record_id')
    date_hierarchy = 'timestamp'
    readonly_fields = ('user', 'action', 'table_name', 'record_id', 'previous_data', 'new_data', 'ip_address', 'timestamp')