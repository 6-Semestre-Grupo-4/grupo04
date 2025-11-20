import uuid
from django.db import models
from django.core.exceptions import ValidationError
from .mixins import ModelBasedMixin
from django.db.models import Sum
from decimal import Decimal
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
    tax_regime = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.fantasy_name} - {self.cnpj} - {self.type_of}"

    @property
    def zip_code(self):
        return self.address.zip_code

class BillingPlan(ModelBasedMixin):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    receivable_control_account = models.ForeignKey(
        'BillingAccount', on_delete=models.PROTECT, related_name='receivable_control_in_plans', 
        null=True, blank=True)
    payable_control_account = models.ForeignKey(
        'BillingAccount', on_delete=models.PROTECT, related_name='payable_control_in_plans', null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=['name'])]

    def clean(self):
        super().clean()
        if not self.receivable_control_account:
            raise ValidationError({
            'receivable_control_account': 'Conta de controle de recebíveis é obrigatória.'
        })
    
        if not self.payable_control_account:
            raise ValidationError({
            'payable_control_account': 'Conta de controle de pagamentos é obrigatória.'
        })

        if self.receivable_control_account.account_type != BillingAccount.AccountType.ANALYTIC:
            raise ValidationError({
                'receivable_control_account': 'A conta de controle de recebíveis deve ser analítica.'
            })

        if self.receivable_control_account.billing_plan != self:
            raise ValidationError({
                'receivable_control_account': 'A conta de controle de recebíveis deve pertencer a este plano de contas.'
            })

        if self.payable_control_account.account_type != BillingAccount.AccountType.ANALYTIC:
            raise ValidationError({
                'payable_control_account': 'A conta de controle de pagamentos deve ser analítica.'
            })

        if self.payable_control_account.billing_plan != self:
            raise ValidationError({
                'payable_control_account': 'A conta de controle de pagamentos deve pertencer a este plano de contas.'
            })

    def save(self, *args, **kwargs):
        self.full_clean()  
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.description}"

class BillingAccount(ModelBasedMixin):
    class AccountType(models.TextChoices):
        ANALYTIC = 'analytic', 'Analítica'
        SYNTHETIC = 'synthetic', 'Sintética'

    MAX_LEVEL = 5

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    billing_plan = models.ForeignKey('BillingPlan', on_delete=models.PROTECT, related_name='accounts'
    )
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children'
    )
    account_type = models.CharField(max_length=10, choices=AccountType.choices)
    is_active = models.BooleanField(default=True)

    code = models.CharField(max_length=30, editable=False)

    class Meta:
        unique_together = ('billing_plan', 'code') 
        indexes = [
            models.Index(fields=['billing_plan', 'parent']),
            models.Index(fields=['code']),
            models.Index(fields=['account_type']),
        ]

    def __str__(self):
        tipo = "Analítica" if self.account_type == self.AccountType.ANALYTIC else "Sintética"
        return f'{self.code} - {self.name} ({tipo})'

    # --- Calculo de classificação ---
    @property
    def level(self):
        if hasattr(self, '_level_cache'):
            return self._level_cache
        level = 1
        parent = self.parent
        while parent:
            level += 1
            parent = parent.parent
        self._level_cache = level
        return level

    # --- Gerar código de classificação completo ex: 1.1.1.2.03
    def generate_account_code(self):
        # Contas raiz, sem pai
        if not self.parent:
            siblings  = (
                BillingAccount.objects.filter(
                billing_plan=self.billing_plan, parent__isnull=True
            ).select_for_update().count()
            + 1
            )
            return f"{siblings}"

        # Herdando a conta pai
        parent_code = self.parent.code

        #Contando os niveis
        siblings = (
            BillingAccount.objects.filter(
                parent=self.parent
            ).select_for_update().count() 
            +1
        )

        #Calcular a hierarquia dinamicamente
        level = self.level
        if level <= 3:
            suffix = str(siblings)
        else:
            suffix = str(siblings).zfill(3)

        return f'{parent_code}.{suffix}'

    def clean(self):
        super().clean()

        # Coerência entre empresa e plano
        if self.parent and self.parent.billing_plan != self.billing_plan:
            raise ValidationError("A conta pai pertence a outro plano de contas.")

        # Calcula nível e valida limite de level
        if self.level > self.MAX_LEVEL:
            raise ValidationError(f"A profundidade máxima permitida é de {self.MAX_LEVEL} níveis.")

        # Regras contábeis de tipo
        if self.account_type == self.AccountType.ANALYTIC:
            if not self.parent:
                raise ValidationError("Conta analítica deve ter uma conta pai sintética.")
            if self.parent.account_type == self.AccountType.ANALYTIC:
                raise ValidationError("Conta pai não pode ser analítica.")
        elif self.account_type == self.AccountType.SYNTHETIC:
            if self.parent and self.parent.account_type == self.AccountType.ANALYTIC:
                raise ValidationError("Conta sintética não pode ter pai analítico.") 
        if self.pk:
            if self.account_type == self.AccountType.ANALYTIC:
                if BillingAccount.objects.filter(parent=self).exists():
                    raise ValidationError("Conta analítica não pode possuir contas filhas.")

    def save(self, *args, **kwargs):
        from django.db import transaction
        with transaction.atomic():
            self.full_clean()
            if not self.code:
                self.code = self.generate_account_code()
            super().save(*args, **kwargs)   
    
    def delete(self, *args, **kwargs):
        from django.db import transaction
        with transaction.atomic():
            if BillingAccount.objects.filter(parent=self).exists():
                raise ValidationError(
                    "Exclusão bloqueada: esta conta possui contas filhas."
                )
            return super().delete(*args, **kwargs)

class Preset(ModelBasedMixin):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    payable_account = models.ForeignKey(
        'BillingAccount', on_delete=models.PROTECT, related_name='payable_presets'
    )
    receivable_account = models.ForeignKey(
        'BillingAccount', on_delete=models.PROTECT, related_name='receivable_presets'
    )

    active = models.BooleanField(default=True)

    revenue_account = models.ForeignKey(
        'BillingAccount', 
        on_delete=models.PROTECT, 
        related_name='revenue_presets',
        null=True,  # opcional inicialmente
        blank=True
    )
    expense_account = models.ForeignKey(
        'BillingAccount', 
        on_delete=models.PROTECT, 
        related_name='expense_presets',
        null=True,  # opcional inicialmente
        blank=True
    )

    # 🔹 novos campos para manter o nome das contas mesmo se forem removidas
    payable_account_name = models.CharField(max_length=255, blank=True)
    receivable_account_name = models.CharField(max_length=255, blank=True)
    revenue_account_name = models.CharField(max_length=255, blank=True)
    expense_account_name = models.CharField(max_length=255, blank=True)

    def clean(self):
        super().clean()
        from django.core.exceptions import ValidationError
        if self.revenue_account and self.revenue_account.account_type != BillingAccount.AccountType.ANALYTIC:
            raise ValidationError({'revenue_account': 'Conta de receita deve ser analítica.'})
        if self.expense_account and self.expense_account.account_type != BillingAccount.AccountType.ANALYTIC:
            raise ValidationError({'expense_account': 'Conta de despesa deve ser analítica.'})

        plans = set()
        for acc in [self.payable_account, self.receivable_account, self.revenue_account, self.expense_account]:
            if acc:
                plans.add(acc.billing_plan_id)
        if len(plans) > 1:
            raise ValidationError({'payable_account': 'Todas as contas do preset devem pertencer ao mesmo plano de contas.'})

    def save(self, *args, **kwargs):
        # ✅ Sempre salva o nome das contas relacionadas
        self.full_clean()
        if self.payable_account:
            self.payable_account_name = self.payable_account.name
        if self.receivable_account:
            self.receivable_account_name = self.receivable_account.name
        if self.revenue_account:
            self.revenue_account_name = self.revenue_account.name
        if self.expense_account:
            self.expense_account_name = self.expense_account.name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

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
        default=Decimal(0.00),
        validators=[MinValueValidator(Decimal(0.00)), MaxValueValidator(Decimal(1.00))]
    )
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    type_of = models.CharField(max_length=10, choices=TitleType.choices)
    preset = models.ForeignKey(Preset, on_delete=models.PROTECT, null=True, blank=True)

    def sync_active_flag(self):
        from django.db import transaction
        with transaction.atomic():
            total_pago = self.entries.aggregate(total=Sum('amount'))['total'] or Decimal('0')
            ativo = total_pago < self.amount
            if self.active != ativo:
                self.active = ativo
                super().save(update_fields=['active', 'updated_at'])
    
    def clean(self):
        super().clean()
        
        if self.pk and self._state.adding is False:
            from django.db.models import Sum
            from decimal import Decimal
            
            old = type(self).objects.only('amount').get(pk=self.pk)
            amount_changed = (self.amount != old.amount)
            
            if amount_changed:
                if self.entries.exists():
                    raise ValidationError({
                        'amount': 'Não é permitido alterar o valor de um título que já possui baixas.'
                    })
                
                total_paid = self.entries.aggregate(total=Sum('amount'))['total'] or Decimal('0')
                if total_paid > self.amount:
                    raise ValidationError({
                        'amount': f'Valor do título não pode ser menor que o total já baixado (R$ {total_paid}).'
                    })
        
        if self.preset:
            plans = set()
            if self.preset.payable_account:
                plans.add(self.preset.payable_account.billing_plan_id)
            if self.preset.receivable_account:
                plans.add(self.preset.receivable_account.billing_plan_id)
            if self.preset.revenue_account:
                plans.add(self.preset.revenue_account.billing_plan_id)
            if self.preset.expense_account:
                plans.add(self.preset.expense_account.billing_plan_id)
            
            if len(plans) > 1:
                raise ValidationError({
                    'preset': 'Todas as contas do preset devem pertencer ao mesmo plano de contas.'
                })

    def save(self, *args, **kwargs):
        from decimal import Decimal, ROUND_HALF_UP
        if self.amount:
            self.amount = Decimal(str(self.amount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} - R$ {self.amount} ({self.get_type_of_display()})"

class Entry(ModelBasedMixin):
    class PaymentMethod(models.TextChoices):
        CASH = 'cash','Cash'
        DEBIT_CARD = 'debit','Debit'
        CREDIT_CARD = 'credit','Credit'
        PIX = 'pix','Pix'
    
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)])
    paid_at = models.DateField()
    payment_method = models.CharField(max_length=15, choices=PaymentMethod.choices)

    title = models.ForeignKey(Title, on_delete=models.PROTECT, related_name='entries')
    billing_account = models.ForeignKey(
        BillingAccount,
        on_delete=models.PROTECT,
        related_name='entries',
        blank=False,
        null=False,
    )

    def clean(self):
        super().clean()

        if not self.billing_account:
            raise ValidationError({'billing_account': 'Conta financeira é obrigatória.'})
        
        if self.billing_account.account_type != BillingAccount.AccountType.ANALYTIC:
            raise ValidationError({'billing_account': 'Somente contas analíticas podem receber lançamentos.'})
        
        if self.title and self.title.preset:
            preset_plan = None
            if self.title.preset.payable_account:
                preset_plan = self.title.preset.payable_account.billing_plan
            elif self.title.preset.receivable_account:
                preset_plan = self.title.preset.receivable_account.billing_plan
            
            if preset_plan and self.billing_account.billing_plan != preset_plan:
                raise ValidationError({
                    'billing_account': f'A conta financeira deve pertencer ao mesmo plano de contas do preset ({preset_plan.name}).'
                })
        
        if self.title and self.amount:
            from django.db.models import Sum
            from decimal import Decimal
            
            qs = Entry.objects.filter(title=self.title)
            if self.pk:  
                qs = qs.exclude(pk=self.pk)
            
            total_paid = qs.aggregate(total=Sum('amount'))['total'] or Decimal('0')
            projected_total = total_paid + self.amount
            
            if projected_total > self.title.amount:
                remaining = self.title.amount - total_paid
                raise ValidationError({
                    'amount': f'Pagamento excede o valor do título. Restante: R$ {remaining}'
                })
    
    class Meta:
        indexes = [
            models.Index(fields=['title', 'paid_at']),
        ]
        ordering = ['-paid_at', 'uuid']

    def save(self, *args, **kwargs):
        from decimal import Decimal, ROUND_HALF_UP
        if self.amount:
            self.amount = Decimal(str(self.amount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        old_title = None
        if self.pk:
            try:
                old_title = Entry.objects.only("title_id").get(pk=self.pk).title
            except Entry.DoesNotExist:
                pass

        super().save(*args, **kwargs)
        if self.title:
            if old_title and old_title != self.title:
                old_title.sync_active_flag()
            self.title.sync_active_flag()

    def delete(self, *args, **kwargs):  
        title = self.title
        super().delete(*args, **kwargs)
        if title:
            title.sync_active_flag()

    def __str__(self):
        return f"Pagamento: {self.description or self.title.description} - R$ {self.amount}"

class JournalEntry(ModelBasedMixin):
    class RefType(models.TextChoices):
        TITLE = 'title_creation', 'Title Creation'
        TITLE_SETTLEMENT = 'title_settlement', 'Title Settlement'
        TITLE_SETTLEMENT_REVERSAL = 'title_settlement_reverse', 'Title Settlement Reverse'

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField()
    description = models.CharField(max_length=255, blank=True)
    company = models.ForeignKey('Company', on_delete=models.PROTECT, related_name='journal_entries')

    reference_type = models.CharField(max_length=255, choices=RefType.choices)
    reference_id = models.CharField(max_length=64)

    total_debits = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_credits = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        indexes = [
            models.Index(fields=['reference_type', 'reference_id']),
            models.Index(fields=['date'])
        ]
        ordering = ['-date']
        constraints = [
            models.UniqueConstraint(fields=['reference_type', 'reference_id'], name='uniq_ref')
        ]


class JournalLine(ModelBasedMixin):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    journal = models.ForeignKey('JournalEntry', on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey('BillingAccount', on_delete=models.PROTECT, related_name='journal_lines')

    debit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    memo = models.CharField(max_length=255, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['journal']),
            models.Index(fields=['account'])
        ]

    def clean(self):
        super().clean()

        if (self.debit > 0 and self.credit > 0) or (self.debit == 0 and self.credit == 0):
            raise ValidationError('Linha deve ter apenas débito OU crédito.')

        if self.account.account_type != BillingAccount.AccountType.ANALYTIC:
            raise ValidationError('Somente contas analíticas podem receber lançamentos.')
