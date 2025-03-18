from django.contrib import admin
from .models import Thesis

@admin.register(Thesis)
class ThesisAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'author', 'advisor', 'co_advisor', 
        'defense_date', 'status', 'created_at'
    )
    list_filter = ('status', 'defense_date', 'created_at')
    search_fields = (
        'title', 'author__username', 'advisor__username', 
        'co_advisor__username', 'abstract', 'keywords'
    )
    date_hierarchy = 'defense_date'
    readonly_fields = ('created_at', 'updated_at', 'created_by')
    autocomplete_fields = ['author', 'advisor', 'co_advisor', 'created_by']

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'author', 'advisor', 'co_advisor')
        }),
        ('Conteúdo', {
            'fields': ('abstract', 'keywords', 'pdf_file')
        }),
        ('Metadados PDF', {
            'fields': ('pdf_metadata', 'pdf_size', 'pdf_pages')
        }),
        ('Status e Datas', {
            'fields': ('status', 'defense_date', 'created_at', 'updated_at')
        }),
        ('Informações do Sistema', {
            'fields': ('created_by',)
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:  
            return self.readonly_fields + ('pdf_metadata', 'pdf_size', 'pdf_pages')
        return self.readonly_fields