from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'module', 'table_name', 'record_id', 'status', 'timestamp')
    list_filter = ('action', 'module', 'table_name', 'status')
    search_fields = ('user__username', 'table_name', 'record_id', 'error_message')
    date_hierarchy = 'timestamp'
    readonly_fields = (
        'user', 'action', 'module', 'table_name', 'record_id', 
        'previous_data', 'new_data', 'ip_address', 'user_agent',
        'status', 'error_message', 'timestamp'
    )
    list_per_page = 50
    ordering = ('-timestamp',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False