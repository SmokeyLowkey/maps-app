from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from .models import BranchData
from .forms import BranchDataAdminForm

class BranchDataAdmin(admin.ModelAdmin):
    form = BranchDataAdminForm
    list_display = ['code', 'branchName']  # Customize to display fields
    search_fields = ['code', 'branchName']  # Fields to include in search functionality
    
    def save_model(self, request, obj, form, change):
        try:
            super().save_model(request, obj, form, change)
        except ValidationError as e:
            # If there's a ValidationError, you could add a custom message like this
            messages.error(request, "A test with this code already exists.")
            raise e

admin.site.register(BranchData, BranchDataAdmin)
