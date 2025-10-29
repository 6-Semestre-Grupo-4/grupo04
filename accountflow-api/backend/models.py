import uuid
from django.db import models

class Address(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    zip_code = models.CharField(max_length=255)
    street = models.CharField(max_length=255)
    number = models.CharField(max_length=50)
    complement = models.CharField(max_length=255, blank=True, null=True)
    neighborhood = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.zip_code} - ({self.city}/{self.state})"

class Company(models.Model):
    class CompanyType(models.TextChoices):
        CLIENT = 'Client', 'Client'
        SUPPLIER = 'Supplier', 'Supplier'


    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cnpj = models.CharField(max_length=20, unique=True)
    fantasy_name = models.CharField(max_length=255)
    social_reason = models.CharField(max_length=255)
    opening_date = models.DateField()
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    cnae = models.CharField(max_length=255)
    address = models.ForeignKey(Address, on_delete=models.CASCADE, related_name='companies')
    type_of = models.CharField(max_length=20, choices=CompanyType.choices)
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.fantasy_name} - {self.cnpj} - {self.type_of}"

    @property
    def zip_code(self):
        return self.address.zip_code
    
class BillingPlan(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} - {self.description}"


