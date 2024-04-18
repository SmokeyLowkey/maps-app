# forms.py
from django import forms
from django.core.exceptions import ValidationError
from tinymce.widgets import TinyMCE
from .models import BranchData

class BranchDataAdminForm(forms.ModelForm):
    details = forms.CharField(widget=TinyMCE())
    contact = forms.CharField(widget=TinyMCE())

    class Meta:
        model = BranchData
        fields = '__all__'

    def clean_code(self):
        code = self.cleaned_data.get('code')
        if code and BranchData.objects.filter(code__iexact=code).exclude(pk=self.instance.pk).exists():
            raise ValidationError("A branch with this code already exists.")
        return code.upper()
