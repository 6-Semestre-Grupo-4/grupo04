from rest_framework import serializers
from .models import (
    Address,
    Company,
    BillingPlan,
    BillingAccount,
    Preset,
    Title,
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
    billing_plan = serializers.SerializerMethodField()

    class Meta:
        model = Preset
        fields = [
            "uuid",
            "name",
            "description",
            "active",
            "payable_account",
            "receivable_account",
            "payable_name",
            "receivable_name",
            "billing_plan",
        ]

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