from django.db import models
from tinymce.models import HTMLField

# Create your models here.

class BranchData(models.Model):
    code = models.CharField(max_length=100, unique=True)
    branchName = models.CharField(max_length=200)
    branchCity = models.CharField(max_length=200)
    details = HTMLField() 
    contact = HTMLField()
    timeZone = models.CharField(max_length=50)
    coordinates = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        # Convert `code` field to uppercase before saving
        self.code = self.code.upper()
        super().save(*args, **kwargs)  # Call the "real" save() method