from rest_framework import serializers
from django.db.models import Sum
from decimal import Decimal
from .models import (
    Address,
    Company,
    BillingPlan,
    BillingAccount,
    Preset,
    Title,
    Entry
)

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class BillingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingPlan
        fields = '__all__'

class BillingAccountSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    billing_plan_name = serializers.CharField(source='billing_plan.name', read_only=True)

    class Meta:
        model = BillingAccount
        fields = ['uuid', 'name', 'code', 'account_type', 
                'is_active', 'parent', 'parent_name', 'billing_plan', 'billing_plan_name', 'level']
        read_only_fields = ['code', ]

class PresetSerializer(serializers.ModelSerializer):
    billing_plan = serializers.SerializerMethodField()

    class Meta:
        model = Preset
        fields = [
            "uuid","name","description","active",
            "payable_account","receivable_account",
            "revenue_account","expense_account",
            "payable_account_name","receivable_account_name",
            "revenue_account_name","expense_account_name",
            "billing_plan",
        ]
        read_only_fields = [
            "payable_account_name","receivable_account_name",
            "revenue_account_name","expense_account_name",
        ]

    def validate(self, data):
        payable = data.get('payable_account') or getattr(self.instance, 'payable_account', None)
        receivable = data.get('receivable_account') or getattr(self.instance, 'receivable_account', None)
        revenue = data.get('revenue_account') or getattr(self.instance, 'revenue_account', None)
        expense = data.get('expense_account') or getattr(self.instance, 'expense_account', None)
        
        accounts = []
        for acc in [payable, receivable, revenue, expense]:
            if acc and not isinstance(acc, BillingAccount):
                try:
                    acc = BillingAccount.objects.get(pk=acc)
                except BillingAccount.DoesNotExist:
                    continue
            if acc:
                accounts.append(acc)
        
        if accounts:
            plans = set(acc.billing_plan_id for acc in accounts)
            if len(plans) > 1:
                raise serializers.ValidationError({
                    'payable_account': 'Todas as contas do preset devem pertencer ao mesmo plano de contas.'
                })
        
        return data

    def get_billing_plan(self, obj):
        """
        Um preset sempre pertence a um único plano de contas.
        Ele pode ser encontrado via payable_account ou receivable_account.
        """
        if obj.payable_account:
            return str(obj.payable_account.billing_plan.uuid)

        if obj.receivable_account:
            return str(obj.receivable_account.billing_plan.uuid)

        return None

class TitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Title
        fields = '__all__'
    
    def validate(self, data):
        preset = data.get('preset') or getattr(self.instance, 'preset', None)
        
        if preset and not isinstance(preset, Preset):
            try:
                preset = Preset.objects.get(pk=preset)
            except Preset.DoesNotExist:
                raise serializers.ValidationError({'preset': 'Preset inválido.'})
        
        if preset:
            plans = set()
            if preset.payable_account:
                plans.add(preset.payable_account.billing_plan_id)
            if preset.receivable_account:
                plans.add(preset.receivable_account.billing_plan_id)
            if preset.revenue_account:
                plans.add(preset.revenue_account.billing_plan_id)
            if preset.expense_account:
                plans.add(preset.expense_account.billing_plan_id)
            
            if len(plans) > 1:
                raise serializers.ValidationError({
                    'preset': 'Todas as contas do preset devem pertencer ao mesmo plano de contas.'
                })
        
        if self.instance:
            new_amount = data.get('amount', self.instance.amount)
            amount_changed = (new_amount != self.instance.amount)
            
            if amount_changed:
                if self.instance.entries.exists():
                    raise serializers.ValidationError({
                        'amount': 'Não é permitido alterar o valor de um título que já possui baixas.'
                    })
                
                total_paid = self.instance.entries.aggregate(total=Sum('amount'))['total'] or Decimal('0')
                if total_paid > new_amount:
                    raise serializers.ValidationError({
                        'amount': f'Valor do título não pode ser menor que o total já baixado (R$ {total_paid}).'
                    })
        
        return data

class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = '__all__'
    
    def validate(self, data):
        title  = data.get('title')  or getattr(self.instance, 'title',  None)
        amount = data.get('amount') or getattr(self.instance, 'amount', None)
        paid_at = data.get('paid_at') or getattr(self.instance, 'paid_at', None)
        billing = data.get('billing_account') or getattr(self.instance, 'billing_account', None)

        if billing and not isinstance(billing, BillingAccount):
            try:
                billing = BillingAccount.objects.get(pk=billing)
                data['billing_account'] = billing
            except BillingAccount.DoesNotExist:
                raise serializers.ValidationError({'billing_account': 'Conta financeira inválida.'})

        if title and not isinstance(title, Title):
            try:
                title = Title.objects.get(pk=title)
            except Title.DoesNotExist:
                raise serializers.ValidationError({'title': 'Título inválido.'})

        if not billing:
            raise serializers.ValidationError({
                'billing_account': 'Conta financeira é obrigatória.'
            })

        if billing.account_type != BillingAccount.AccountType.ANALYTIC:
            raise serializers.ValidationError({
                'billing_account': 'Somente contas analíticas podem receber lançamentos.'
            })

        if title and title.preset:
            preset_plan = None
            if title.preset.payable_account:
                preset_plan = title.preset.payable_account.billing_plan
            elif title.preset.receivable_account:
                preset_plan = title.preset.receivable_account.billing_plan
            
            if preset_plan and billing.billing_plan != preset_plan:
                raise serializers.ValidationError({
                    'billing_account': f'A conta financeira deve pertencer ao mesmo plano de contas do preset ({preset_plan.name}).'
                })

        if title is None or amount is None:
            return data

        qs = Entry.objects.filter(title=title)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        total_paid = qs.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        projected_total = total_paid + amount

        if projected_total > title.amount:
            remaining = title.amount - total_paid
            raise serializers.ValidationError({
                'amount': f'Pagamento excede o valor do título. Restante: R$ {remaining}'
            })

        return data