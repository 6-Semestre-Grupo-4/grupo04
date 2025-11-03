import uuid
from django.db import models
from django.core.exceptions import ValidationError
from .mixins import ModelBasedMixin
from django.core.validators import MinValueValidator, MaxValueValidator

class Address(ModelBasedMixin):
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

class Company(ModelBasedMixin):
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

class BillingPlan(ModelBasedMixin):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} - {self.description}"

class BillingAccount(ModelBasedMixin):
    class AccountType(models.TextChoices):
        ANALYTIC = 'analytic', 'Analítica'
        SYNTHETIC = 'synthetic', 'Sintética'

    MAX_LEVEL = 5

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='billing_accounts')
    billing_plan = models.ForeignKey('BillingPlan', on_delete=models.PROTECT, related_name='billing_accounts')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    account_type = models.CharField(max_length=10, choices=AccountType.choices)
    is_active = models.BooleanField(default=True)

    classification = models.PositiveSmallIntegerField(
        editable=False,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=1
)
    code = models.CharField(max_length=30, unique=True, editable=False)

    def __str__(self):
        return f'{self.code} - {self.name}'

    # --- Calculo de classificação ---
    def get_level(self):
        level = 1
        parent = self.parent
        while parent:
            level += 1
            parent = parent.parent
        return level

    # --- Gerar código de classificação completo ex: 1.1.1.2.03
    def generate_account_code(self):
        # Contas raiz, sem pai
        if not self.parent:
            siblings  = (
                BillingAccount.objects.filter(
                billing_plan=self.billing_plan, parent__isnull=True
            ).count()
            + 1
            )
            return f"{siblings}"

        # Herdando a conta pai
        parent_code = self.parent.code

        #Contando os niveis
        siblings = BillingAccount.objects.filter(parent=self.parent).count() +1

        #Calcular a hierarquia dinamicamente
        level = self.get_level()
        padding = max(2, level)

        suffix = str(siblings).zfill(padding)
        return f'{parent_code}.{suffix}'

    def clean(self):
        super().clean()

            # Coerência entre empresa e plano
        if self.parent:
            if self.parent.company != self.company:
                raise ValidationError("A conta pai pertence a outra empresa.")
            if self.parent.billing_plan != self.billing_plan:
                raise ValidationError("A conta pai pertence a outro plano de contas.")

        # Calcula nível e valida limite de level
        self.classification = self.get_level()
        if self.classification > self.MAX_LEVEL:
            raise ValidationError(
                f"A profundidade máxima permitida é de {self.MAX_LEVEL} níveis."
            )

        # Regras contábeis de tipo
        if self.account_type == self.AccountType.ANALYTIC:
            if not self.parent:
                raise ValidationError("Conta analítica deve ter uma conta pai sintética.")
            if self.parent.account_type == self.AccountType.ANALYTIC:
                raise ValidationError("Conta pai não pode ser analítica.")
        elif self.account_type == self.AccountType.SYNTHETIC:
            if self.parent and self.parent.account_type == self.AccountType.ANALYTIC:
                raise ValidationError("Conta sintética não pode ter pai analítico.")

    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.code:
            self.code = self.generate_account_code()
        self.classification = self.get_level()
        super().save(*args, **kwargs)


class Preset(ModelBasedMixin):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    payable_account = models.ForeignKey(BillingAccount, on_delete=models.PROTECT, related_name='payable_presets')
    receivable_account = models.ForeignKey(BillingAccount, on_delete=models.PROTECT, related_name='receivable_presets')

    def __str__(self):
        return f"{self.name}"

class Title(ModelBasedMixin):
    class TitleType(models.TextChoices):
        INCOME = 'income', 'Income'
        EXPENSE = 'expense', 'Expense'

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    active = models.BooleanField(default=True)
    recorrence = models.BooleanField(default=False)
    expiration_date =  models.DateField()
    recorrence_period = models.CharField(max_length=50, blank=True, null=True)
    installments = models.PositiveIntegerField(blank=True, null=True)
    fees_percentage_monthly = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(1.00)]
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='titles')
    type_of = models.CharField(max_length=10, choices=TitleType.choices)