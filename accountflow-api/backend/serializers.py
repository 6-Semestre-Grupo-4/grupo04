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
    class Meta:
        model = BillingAccount
        fields = '__all__'

class PresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preset
        fields = '__all__'

class TitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Title
        fields = '__all__'

class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = '__all__'
    
    # Regra de negócio: Baixa parcial
    def validate(self, data):
        title = data.get('title') or getattr(self.instance, 'title', None)
        amount = data.get('amount') or getattr(self.instance, 'amount', None)

        if title is None or amount is None:
            return data
        
        qs = Entry.objects.filter(title=title)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        total_paid = qs.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        projected_total = total_paid + amount     

        if projected_total > title.amount:
            remaining = title.amount - total_paid
            raise serializers.ValidationError(
                {'amount':f"Pagamento excede o valor do título. Restante: {remaining}"}
            )
        
        billing_account = data.get('billing_account') or getattr(self.instance, 'billing_account', None)
        if billing_account and billing_account.account_type != BillingAccount.AccountType.ANALYTIC:
            raise serializers.ValidationError({'billing_account': 'Somente contas analíticas podem receber lançamentos.'})
        return data