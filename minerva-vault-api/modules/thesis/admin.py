from django.contrib import admin
from .models import Thesis

@admin.register(Thesis)
class ThesisAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'advisor', 'defense_date', 'status')
    list_filter = ('status', 'defense_date')
    search_fields = ('title', 'author', 'abstract', 'keywords')
    date_hierarchy = 'defense_date'