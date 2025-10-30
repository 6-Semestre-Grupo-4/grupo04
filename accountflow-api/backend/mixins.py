import logging

from django.db import models

class ModelBasedMixin(models.Model):
    created_at = models.DateTimeField(verbose_name="created at", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="updated at", auto_now=True)

    class Meta:
        abstract = True
