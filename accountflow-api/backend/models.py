import uuid
from django.db import models

from backend.domain.user.user_models import User
from backend.domain.company.company_models import Company
from backend.domain.user_company.user_company_models import UserCompany

class Person(models.Model):
    class PersonType(models.TextChoices):
        CLIENTE = 'Cliente', 'Cliente'
        FORNECEDOR = 'Fornecedor', 'Fornecedor'

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='company')
    name = models.CharField(max_length=255)
    type_of = models.CharField(max_length=20, choices=PersonType.choices)

    def __str__(self):
        return f"{self.name} - {self.type_of} ({self.company.name})"