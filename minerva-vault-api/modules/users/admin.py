from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role, UserRole, PasswordHistory

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'avatar')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'created_at')
    list_filter = ('role',)
    search_fields = ('user__username', 'role__name')
    
@admin.register(PasswordHistory)
class PasswordHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at') 
    search_fields = ('user__username', 'user__email') 
    list_filter = ('created_at',)  
    readonly_fields = ('password_hash', 'created_at')  
    
    def has_add_permission(self, request):
        return False  

    def has_change_permission(self, request, obj=None):
        return False 